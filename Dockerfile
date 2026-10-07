# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production and build dependencies
RUN npm install

# Copy application files
COPY . .

# Build React frontend for production
RUN npm run build

# Expose server port
EXPOSE 3001

# Start backend server which also serves the frontend
CMD ["node", "server/index.js"]
