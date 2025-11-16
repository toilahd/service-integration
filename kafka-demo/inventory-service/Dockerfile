FROM node:18-alpine

# Install dependencies for common module first
WORKDIR /app/common
COPY common/package*.json ./
RUN npm install

# Install dependencies for inventory-service
WORKDIR /app/inventory-service
COPY inventory-service/package*.json ./
RUN npm install

# Copy common module
WORKDIR /app
COPY common ./common

# Copy inventory-service source
COPY inventory-service ./inventory-service

# Create logs directory
RUN mkdir -p /app/inventory-service/logs

WORKDIR /app/inventory-service

CMD ["npm", "start"]
