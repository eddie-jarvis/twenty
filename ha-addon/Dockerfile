ARG BUILD_FROM
FROM twentycrm/twenty:latest AS twenty

FROM ${BUILD_FROM}

# Install PostgreSQL 16, Redis, Node.js
RUN apk add --no-cache \
    postgresql16 \
    postgresql16-client \
    postgresql16-contrib \
    redis \
    nodejs-current \
    npm \
    yarn \
    curl \
    bash \
    jq

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

# Build arguments
ARG BUILD_ARCH
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="Twenty CRM" \
    io.hass.description="Open-source personal CRM" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION}
