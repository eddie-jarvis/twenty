ARG BUILD_FROM
FROM twentycrm/twenty:latest AS twenty

FROM ${BUILD_FROM}

# Install PostgreSQL 16 (pinned to match Twenty's docker-compose), Redis
RUN apt-get update && apt-get install -y --no-install-recommends \
    gnupg2 lsb-release wget ca-certificates curl jq \
    && wget --quiet -O /usr/share/keyrings/pgdg.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    && echo "deb [signed-by=/usr/share/keyrings/pgdg.asc] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    postgresql-16 \
    postgresql-client-16 \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Copy Node.js runtime from Twenty image
COPY --from=twenty /usr/local/bin/node /usr/local/bin/node
COPY --from=twenty /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/bin/node /usr/local/bin/nodejs 2>/dev/null; true

# Copy Twenty application from official image
COPY --from=twenty /app /opt/twenty

# Create data directories
RUN mkdir -p /data/postgres /data/redis /data/storage \
    && chown -R postgres:postgres /data/postgres \
    && mkdir -p /run/postgresql \
    && chown -R postgres:postgres /run/postgresql

# Symlink storage so Twenty finds it where it expects
RUN mkdir -p /opt/twenty/packages/twenty-server \
    && ln -sf /data/storage /opt/twenty/packages/twenty-server/.local-storage

# Copy rootfs (s6 services + init scripts)
COPY rootfs /

# Make scripts executable
RUN find /etc/s6-overlay/s6-rc.d -name "run" -exec chmod +x {} \; 2>/dev/null; \
    find /etc/cont-init.d -name "*.sh" -exec chmod +x {} \; 2>/dev/null; \
    true

ARG BUILD_ARCH
ARG BUILD_VERSION

LABEL \
    io.hass.name="Twenty CRM" \
    io.hass.description="Open-source personal CRM" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION}
