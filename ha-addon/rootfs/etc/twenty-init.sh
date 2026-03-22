#!/command/with-contenv bashio

bashio::log.info "Initializing Twenty CRM..."

APP_SECRET=$(bashio::config 'APP_SECRET')
SERVER_URL=$(bashio::config 'SERVER_URL')
PG_DATABASE_PASSWORD=$(bashio::config 'PG_DATABASE_PASSWORD')

if [ -z "${PG_DATABASE_PASSWORD}" ]; then
    PG_DATABASE_PASSWORD="twentycrm"
fi

PG_DATABASE_URL="postgresql://twenty:${PG_DATABASE_PASSWORD}@localhost:5432/default"
REDIS_URL="redis://localhost:6379"

if [ -z "${SERVER_URL}" ]; then
    SERVER_URL="http://localhost:3000"
fi
SERVER_URL="${SERVER_URL%/}"

bashio::log.info "SERVER_URL: ${SERVER_URL}"

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

mkdir -p /data/postgres /data/redis /data/storage /run/postgresql
chown -R postgres:postgres /data/postgres /run/postgresql

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

chown -R postgres:postgres /data/postgres /run/postgresql

bashio::log.info "Twenty CRM initialization complete."
