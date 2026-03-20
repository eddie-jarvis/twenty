# Twenty CRM - Documentation

## Overview

This add-on runs [Twenty CRM](https://twenty.com), an open-source personal CRM, directly on your Home Assistant instance. It bundles all required services:

- **Twenty Server** — The main application (port 3000)
- **Twenty Worker** — Background job processor
- **PostgreSQL 16** — Database
- **Redis** — Cache and message queue

## First Start

On first start, the add-on will:

1. Initialize a PostgreSQL database cluster
2. Create the `twenty` database user
3. Create the `default` database
4. Start all services

This may take a few minutes. Check the add-on logs for progress.

## Configuration

### APP_SECRET

A secret string used for signing tokens and encrypting data. **Change this from the default value** before first start. Use a long random string (32+ characters recommended).

### SERVER_URL

The external URL where Twenty CRM will be accessible. Leave empty for automatic detection (works for most setups). Set this if you're using a reverse proxy or custom domain.

### PG_DATABASE_PASSWORD

Password for the PostgreSQL `twenty` user. Defaults to `twentycrm`. Only needs to be changed if you have specific security requirements.

## Data Storage

All data is persisted in `/data/`:

- `/data/postgres/` — PostgreSQL database files
- `/data/redis/` — Redis append-only file
- `/data/storage/` — Twenty file uploads and local storage

## Troubleshooting

### Add-on won't start

Check the logs for errors. Common issues:

- **Port 3000 already in use** — Another add-on or service may be using port 3000
- **Insufficient memory** — Twenty CRM needs at least 2GB of RAM available
- **Database initialization failed** — Check if `/data/postgres/` has correct permissions

### Slow first start

The first start initializes the database and may run migrations. This can take 2-5 minutes depending on your hardware.

### Reset database

To completely reset, stop the add-on and delete the contents of `/data/postgres/`. The database will be re-initialized on next start.

## Architecture

The add-on uses s6-overlay for process supervision:

```
s6-overlay
├── init-twenty (oneshot) — Environment setup & DB initialization
├── postgresql (longrun) — PostgreSQL 16 database server
├── redis (longrun) — Redis cache/queue server
├── twenty-server (longrun) — Twenty CRM application server
└── twenty-worker (longrun) — Twenty background job worker
```

Services start in dependency order: init → postgresql + redis → twenty-server → twenty-worker.
