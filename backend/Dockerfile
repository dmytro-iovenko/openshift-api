# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Expose the backend API port (default for Express)
EXPOSE 3000

# Start the Express app
CMD ["node", "src/server.js"]
