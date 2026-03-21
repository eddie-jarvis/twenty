ARG BUILD_FROM
FROM twentycrm/twenty:latest AS twenty

FROM ghcr.io/hassio-addons/base:19.0.0

# Install PostgreSQL 16, Redis, Node.js 22
RUN apk add --no-cache \
    postgresql16 \
    postgresql16-client \
    postgresql16-contrib \
    redis \
    nodejs \
    npm \
    curl \
    bash \
    jq

# Copy Twenty application from official image (also Alpine/musl based)
COPY --from=twenty /app /opt/twenty

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
