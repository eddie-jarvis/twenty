ARG BUILD_FROM
FROM twentycrm/twenty:latest AS twenty

FROM ghcr.io/hassio-addons/base:19.0.0

# Install PostgreSQL 16, Redis, Node.js
RUN apk add --no-cache \
    postgresql16 \
    postgresql16-client \
    postgresql16-contrib \
    redis \
    nodejs \
    npm \
    yarn \
    curl \
    bash \
    jq

# Install tsx globally (needed by Twenty's entrypoint for DB setup)
RUN npm install -g tsx

# Copy ENTIRE Twenty application from official image
COPY --from=twenty /app /opt/twenty

# Make entrypoint executable
RUN chmod +x /opt/twenty/entrypoint.sh

# Create data directories
RUN mkdir -p /data/postgres /data/redis /data/storage \
    && mkdir -p /run/postgresql

# Symlink storage so Twenty finds it where it expects
RUN ln -sf /data/storage /opt/twenty/packages/twenty-server/.local-storage 2>/dev/null; true

# Copy rootfs (s6 services + init scripts)
COPY rootfs /

# Make scripts executable
RUN find /etc/s6-overlay/s6-rc.d -name "run" -exec chmod +x {} \; 2>/dev/null; \
    chmod +x /etc/twenty-init.sh 2>/dev/null; \
    true

ARG BUILD_ARCH
ARG BUILD_VERSION

LABEL \
    io.hass.name="Twenty CRM" \
    io.hass.description="Open-source personal CRM" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION}
