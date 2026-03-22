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
    SERVER_URL="http://localhost:3000"
fi

# Remove trailing slash
SERVER_URL="${SERVER_URL%/}"

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
IS_BILLING_ENABLED=false
REACT_APP_SERVER_BASE_URL=${SERVER_URL}
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/twenty/node_modules/.bin
EOF

# Ensure data directories exist with correct permissions
mkdir -p /data/postgres /data/redis /data/storage /run/postgresql
chown -R postgres:postgres /data/postgres /run/postgresql

# FORCE CLEAN INIT: Check if database is actually working
# If core schema exists but is incomplete, nuke it
if [ -f /data/postgres/PG_VERSION ]; then
    bashio::log.info "Checking existing PostgreSQL data..."
    
    # Start postgres temporarily to check
    su - postgres -s /bin/bash -c "pg_ctl -D /data/postgres -l /tmp/pg_check.log start" 2>/dev/null
    sleep 3
    
    # Check if core schema has the essential table
    SCHEMA_OK=$(su - postgres -s /bin/bash -c "psql -tAc \"SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'core' AND table_name = 'user')\" default" 2>/dev/null || echo "f")
    
    su - postgres -s /bin/bash -c "pg_ctl -D /data/postgres stop" 2>/dev/null
    sleep 2
    
    if [ "$SCHEMA_OK" != "t" ]; then
        bashio::log.warning "Database schema is incomplete or corrupt. Reinitializing..."
        rm -rf /data/postgres/*
        rm -f /data/.migrations_done
    else
        bashio::log.info "Database schema looks healthy."
    fi
fi

# Initialize PostgreSQL if first run (or after cleanup)
if [ ! -f /data/postgres/PG_VERSION ]; then
    bashio::log.info "First run — initializing PostgreSQL..."
    
    su - postgres -s /bin/bash -c \
        "initdb -D /data/postgres --auth=trust --encoding=UTF8 --locale=C"

    cat >> /data/postgres/postgresql.conf <<PGCONF
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 128MB
unix_socket_directories = '/run/postgresql'
PGCONF

    cat >> /data/postgres/pg_hba.conf <<PGHBA
local   all   all                 trust
host    all   all   127.0.0.1/32  trust
host    all   all   ::1/128       trust
PGHBA

    su - postgres -s /bin/bash -c \
        "pg_ctl -D /data/postgres -l /tmp/pg_init.log start"

    for i in $(seq 1 30); do
        if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    su - postgres -s /bin/bash -c \
        "psql -c \"CREATE USER twenty WITH PASSWORD '${PG_DATABASE_PASSWORD}' SUPERUSER;\""
    su - postgres -s /bin/bash -c \
        "psql -c \"CREATE DATABASE \\\"default\\\" OWNER twenty;\""

    su - postgres -s /bin/bash -c \
        "pg_ctl -D /data/postgres stop"
    
    sleep 2

    bashio::log.info "PostgreSQL initialized successfully."
else
    bashio::log.info "PostgreSQL data directory exists, skipping init."
fi

# Ensure correct permissions
chown -R postgres:postgres /data/postgres /run/postgresql

bashio::log.info "Twenty CRM initialization complete."
