ARG BUILD_FROM=ghcr.io/hassio-addons/base:19.0.0
FROM twentycrm/twenty:latest AS twenty

FROM ${BUILD_FROM}

# Install PostgreSQL 16, Redis, Node.js 20
RUN apk add --no-cache \
    postgresql16 \
    postgresql16-client \
    postgresql16-contrib \
    redis \
    nodejs-current \
    npm \
    yarn \
    curl \
    bash

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

# Copy rootfs
COPY rootfs /

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_DESCRIPTION
ARG BUILD_NAME
ARG BUILD_REF
ARG BUILD_REPOSITORY
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="${BUILD_NAME}" \
    io.hass.description="${BUILD_DESCRIPTION}" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION}
