#!/command/with-contenv bashio
# shellcheck shell=bash
# ==============================================================================
# Twenty CRM - Initialization
# ==============================================================================

bashio::log.info "Initializing Twenty CRM..."

# Read configuration from options
APP_SECRET=$(bashio::config 'APP_SECRET')
SERVER_URL=$(bashio::config 'SERVER_URL')
PG_DATABASE_PASSWORD=$(bashio::config 'PG_DATABASE_PASSWORD')

# Defaults
if [ -z "${PG_DATABASE_PASSWORD}" ]; then
    PG_DATABASE_PASSWORD="twentycrm"
fi

PG_DATABASE_URL="postgresql://twenty:${PG_DATABASE_PASSWORD}@localhost:5432/default"
REDIS_URL="redis://localhost:6379"

# Determine SERVER_URL
if [ -z "${SERVER_URL}" ]; then
    if bashio::var.has_value "$(bashio::addon.ingress_url)"; then
        SERVER_URL="http://localhost:3000"
    else
        SERVER_URL="http://localhost:3000"
    fi
fi

bashio::log.info "SERVER_URL: ${SERVER_URL}"

# Write environment file for s6 services
cat > /etc/twenty-env <<EOF
APP_SECRET=${APP_SECRET}
PG_DATABASE_URL=${PG_DATABASE_URL}
PG_DATABASE_PASSWORD=${PG_DATABASE_PASSWORD}
REDIS_URL=${REDIS_URL}
SERVER_URL=${SERVER_URL}
NODE_PORT=3000
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=/opt/twenty/packages/twenty-server/.local-storage
EOF

# Ensure data directories exist with correct permissions (runtime, not build time)
mkdir -p /data/postgres /data/redis /data/storage /run/postgresql
chown -R postgres:postgres /data/postgres /run/postgresql

# Initialize PostgreSQL if first run
if [ ! -f /data/postgres/PG_VERSION ]; then
    bashio::log.info "First run — initializing PostgreSQL..."

    # Initialize the database cluster
    su - postgres -s /bin/bash -c \
        "initdb -D /data/postgres --auth=trust --encoding=UTF8 --locale=C"

    # Configure PostgreSQL
    cat >> /data/postgres/postgresql.conf <<PGCONF
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 128MB
unix_socket_directories = '/run/postgresql'
PGCONF

    cat >> /data/postgres/pg_hba.conf <<PGHBA
local   all   all                 trust
host    all   all   127.0.0.1/32  md5
host    all   all   ::1/128       md5
PGHBA

    # Start PostgreSQL temporarily to create user and database
    su - postgres -s /bin/bash -c \
        "pg_ctl -D /data/postgres -l /tmp/pg_init.log start"

    # Wait for PostgreSQL to be ready
    for i in $(seq 1 30); do
        if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    # Create user and database
    su - postgres -s /bin/bash -c \
        "psql -c \"CREATE USER twenty WITH PASSWORD '${PG_DATABASE_PASSWORD}' SUPERUSER;\""
    su - postgres -s /bin/bash -c \
        "psql -c \"CREATE DATABASE \\\"default\\\" OWNER twenty;\""

    # Stop temporary PostgreSQL
    su - postgres -s /bin/bash -c \
        "pg_ctl -D /data/postgres stop"

    bashio::log.info "PostgreSQL initialized successfully."
else
    bashio::log.info "PostgreSQL data directory exists, skipping init."
fi

# Ensure data directories have correct permissions
chown -R postgres:postgres /data/postgres
chown -R postgres:postgres /run/postgresql
mkdir -p /data/redis
mkdir -p /data/storage

bashio::log.info "Twenty CRM initialization complete."
