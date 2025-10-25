# Deploy Backend API to Hugging Face Spaces

## Steps:

1. **Go to Hugging Face Spaces**: https://huggingface.co/spaces
2. **Create a new Space** with these settings:
   - Space name: `WOW-API` (or any name)
   - SDK: Docker
   - Visibility: Public or Private
3. **In the Space settings**, add the following file:

### Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy server code
COPY server/ ./server/
COPY shared/ ./shared/
COPY dist/ ./dist/

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "dist/index.js"]
```

4. **Push your code** to the space's Git repository, OR
5. **Use the HF CLI** to deploy directly from your local repo

After deployment, you'll get a URL like: `https://YOUR-USERNAME-WOW-API.hf.space`

## Update Frontend

After deploying to Hugging Face Spaces, you need to:

1. **Copy the Hugging Face Space URL** (e.g., `https://YOUR-USERNAME-WOW-API.hf.space`)

2. **Add it as a GitHub Secret**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VITE_API_URL`
   - Value: `https://YOUR-USERNAME-WOW-API.hf.space/api/chat`

3. **The deployment will automatically update** on the next push to `main` branch

## Testing Locally

You can test the backend locally:
```bash
npm run dev
```

Then the frontend will automatically connect to `http://localhost:5000/api/chat`
