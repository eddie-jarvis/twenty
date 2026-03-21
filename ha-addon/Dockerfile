ARG BUILD_FROM
FROM ${BUILD_FROM}

# Install PostgreSQL 16 and Redis
RUN apt-get update && apt-get install -y --no-install-recommends \
    gnupg2 lsb-release wget ca-certificates curl jq \
    && wget --quiet -O /usr/share/keyrings/pgdg.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    && echo "deb [signed-by=/usr/share/keyrings/pgdg.asc] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    postgresql-16 \
    postgresql-client-16 \
    redis-server \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install yarn (Twenty uses it)
RUN npm install -g yarn

# Copy the ENTIRE Twenty image filesystem to get all deps
COPY --from=twentycrm/twenty:latest /app /opt/twenty

# Create data directories
RUN mkdir -p /data/postgres /data/redis /data/storage \
    && chown -R postgres:postgres /data/postgres \
    && mkdir -p /run/postgresql \
    && chown -R postgres:postgres /run/postgresql

# Symlink storage
RUN ln -sf /data/storage /opt/twenty/packages/twenty-server/.local-storage 2>/dev/null; true

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
