# Twenty CRM - Home Assistant Add-on

[![Open your Home Assistant instance and show the add add-on repository dialog.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Feddie-jarvis%2Ftwenty)

## About

[Twenty](https://twenty.com) is an open-source CRM designed to be a modern alternative to Salesforce. This add-on packages the full Twenty CRM stack (server, worker, PostgreSQL, and Redis) into a single Home Assistant add-on.

## Features

- Full Twenty CRM application
- Built-in PostgreSQL 16 database
- Built-in Redis for caching and queues
- Background worker for async jobs
- Persistent data storage
- Ingress support for seamless HA integration

## Installation

1. Add this repository to your Home Assistant add-on store
2. Install the "Twenty CRM" add-on
3. Configure the `APP_SECRET` (change from default!)
4. Start the add-on
5. Access via the sidebar or port 3000

## Configuration

| Option | Description | Required |
|--------|-------------|----------|
| `APP_SECRET` | Secret key for encryption/signing | Yes |
| `SERVER_URL` | External URL (auto-detected if empty) | No |
| `PG_DATABASE_PASSWORD` | PostgreSQL password | No (default: twentycrm) |
