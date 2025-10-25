# Cloudflare Worker for MLVOCA API CORS Proxy

This worker proxies requests to the MLVOCA API and adds CORS headers to allow browser access.

## Deployment Instructions

1. **Install and login to Wrangler:**
   ```bash
   npm install -g wrangler
   npx wrangler login
   ```

2. **Deploy the worker:**
   ```bash
   npx wrangler deploy
   ```

3. **Copy your worker URL:**
   After deployment, you'll see a URL like: `https://wow-proxy.YOUR-USERNAME.workers.dev`

4. **Update the frontend:**
   Open `client/src/hooks/useStreamingChat.ts` and replace line ~140:
   ```typescript
   const mlvocaUrl = 'https://YOUR-WORKER-URL.workers.dev';
   ```

5. **Push the changes:**
   ```bash
   git add -A
   git commit -m "Update MLVOCA URL to use Cloudflare Worker"
   git push
   ```

## Alternative: Use Without Cloudflare

If you don't want to use Cloudflare, you can:

1. Run the backend server locally: `npm run dev` (for development)
2. Deploy the backend to a hosting service (Render, Railway, Fly.io, etc.)
3. Use a different AI API that supports CORS

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per request

This is more than enough for a small project.
