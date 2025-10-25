FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Set the port environment variable
ENV PORT=7860

# Start the server
CMD ["node", "dist/index.js"]
