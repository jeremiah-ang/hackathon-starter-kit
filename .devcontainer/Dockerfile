FROM node:20-bookworm

# Install PostgreSQL client tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g nodemon

# Set the working directory
WORKDIR /workspace

# Switch to non-root user
USER node
