# Use official Node.js image as base
FROM node:20.9.0 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Build the NestJS app
RUN npm run build

# Use a smaller image for production
FROM node:20.9.0

# Set working directory
WORKDIR /app

# Copy the built files and dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Expose port (ensure it matches the port in your NestJS app)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]