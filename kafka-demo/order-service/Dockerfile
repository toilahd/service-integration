FROM node:18-alpine

# Install dependencies for common module first
WORKDIR /app/common
COPY common/package*.json ./
RUN npm install

# Install dependencies for order-service
WORKDIR /app/order-service
COPY order-service/package*.json ./
RUN npm install

# Copy common module
WORKDIR /app
COPY common ./common

# Copy order-service source
COPY order-service ./order-service

# Create logs directory
RUN mkdir -p /app/order-service/logs

WORKDIR /app/order-service

EXPOSE 3000

CMD ["npm", "start"]
