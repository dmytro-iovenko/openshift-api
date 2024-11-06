# Step 1: Build the Vite app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the Vite app
RUN npm run build

# Step 2: Serve the Vite app using Node.js (using a simple static server)
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the build output from the build stage
COPY --from=build /app/dist /app/dist

# Install a simple static file server (like http-server)
RUN npm install -g http-server

# Expose the port for the server
EXPOSE 8080

# Start the server
CMD ["http-server", "dist", "--port", "8080", "--host", "0.0.0.0"]
