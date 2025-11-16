FROM node:18-alpine

# Install dependencies for common module first
WORKDIR /app/common
COPY common/package*.json ./
RUN npm install

# Install dependencies for notification-service
WORKDIR /app/notification-service
COPY notification-service/package*.json ./
RUN npm install

# Copy common module
WORKDIR /app
COPY common ./common

# Copy notification-service source
COPY notification-service ./notification-service

# Create logs directory
RUN mkdir -p /app/notification-service/logs

WORKDIR /app/notification-service

CMD ["npm", "start"]
