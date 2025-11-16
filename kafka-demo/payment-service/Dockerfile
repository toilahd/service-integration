FROM node:18-alpine

# Install dependencies for common module first
WORKDIR /app/common
COPY common/package*.json ./
RUN npm install

# Install dependencies for payment-service
WORKDIR /app/payment-service
COPY payment-service/package*.json ./
RUN npm install

# Copy common module
WORKDIR /app
COPY common ./common

# Copy payment-service source
COPY payment-service ./payment-service

# Create logs directory
RUN mkdir -p /app/payment-service/logs

WORKDIR /app/payment-service

CMD ["npm", "start"]
