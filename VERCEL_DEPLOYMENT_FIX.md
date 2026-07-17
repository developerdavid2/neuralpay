# Vercel Deployment Fix for AI Service in Turborepo

## Issues Identified & Fixed

### 1. **Missing Production Server Startup**
**Problem:** The AI service was only starting a server in development mode (`if (process.env.NODE_ENV !== "production"`), so Vercel couldn't access it in production.

**Solution:** Updated `apps/server/ai-service/src/main.ts` to ensure the Express app listens on the configured port in both development and production environments.

### 2. **Incorrect Vercel Build Configuration**
**Problem:** The `vercel.json` was pointing to the TypeScript source file (`src/main.ts`) instead of the compiled JavaScript output (`dist/main.mjs`), and routes weren't configured to use the built output.

**Solution:** Updated `apps/server/ai-service/vercel.json`:
- Changed `src` from `src/main.ts` to `package.json`
- Updated `routes.dest` from `/src/main.ts` to `dist/main.mjs`
- Added proper `includeFiles` config to include the dist folder

### 3. **Dist Folder Not Tracked in Git**
**Problem:** Your `.gitignore` excludes `dist/` folders, so the compiled output wasn't being deployed. Vercel was trying to find the dist folder but it didn't exist.

**Solution:** Vercel's build process will now:
1. Run `bun install` and `bun run build` (configured in root `vercel.json`)
2. Generate the `dist/` folder during deployment
3. Route requests to the compiled `dist/main.mjs` file

### 4. **Missing Root Vercel Configuration**
**Problem:** Without a root `vercel.json`, Vercel doesn't know how to build the turborepo.

**Solution:** Created `/vercel.json` with:
```json
{
  "version": 2,
  "buildCommand": "bun install && bun run build",
  "outputDirectory": ".",
  "framework": "other",
  "installCommand": "bun install",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Required Environment Variables

Make sure these are set in your Vercel project settings:

**AI Service (`apps/server/ai-service`):**
- `GROQ_API_KEY` - Required (configured in `packages/env/src/ai-service.ts`)
- `PORT` - Optional (defaults to 4003, but Vercel assigns a port automatically)
- Other inherited from `baseServerEnv` (check `packages/env/src/server.ts`)

**How to set them:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add each variable with the appropriate scope (Production, Preview, Development)

## Deployment Checklist

- [ ] Commit all changes to your git branch
- [ ] Push to your remote repository
- [ ] Verify environment variables are set in Vercel project settings
- [ ] Trigger a new deployment in Vercel (or push to re-trigger)
- [ ] Check the build logs in Vercel dashboard
- [ ] Look for success message: `[Vercel] ai-service listening on port XXX`
- [ ] Test your endpoints: `https://your-vercel-deployment.vercel.app/trpc/...`

## Testing Locally Before Deployment

```bash
# Build the service
bun run build

# Test the built output
cd apps/server/ai-service
NODE_ENV=production PORT=3000 node dist/main.mjs

# In another terminal, test an endpoint
curl http://localhost:3000/trpc/...
```

## Debugging

If endpoints are still not accessible after deployment:

1. **Check Vercel Build Logs:**
   - Go to Deployment > Logs to see if the build succeeded
   - Look for any TypeScript compilation errors

2. **Check Function Logs:**
   - Go to Deployments and click the specific deployment
   - Look at Runtime Logs for any errors

3. **Verify the App is Exported:**
   - Ensure `apps/server/ai-service/src/main.ts` has `export default app;`
   - The Express app must be exported for Vercel to use it

4. **Check Routes:**
   - Your endpoints should be accessible at: `https://your-domain/trpc/...`
   - Your `/chat/stream` endpoint: `https://your-domain/chat/stream`

5. **Environment Variables:**
   - If getting auth errors, verify `GROQ_API_KEY` is set
   - Check for "undefined" errors in logs indicating missing env vars

## Files Modified

1. `/vercel.json` - Created (root configuration)
2. `apps/server/ai-service/vercel.json` - Updated (service-specific config)
3. `apps/server/ai-service/src/main.ts` - Updated (production server startup)

## API Endpoints Available

After deployment, your AI service should expose:

- **tRPC Router:** `POST /trpc/...` (with tRPC paths like `/chat-stream.askQuestion`, `/coach.analyze`, etc.)
- **Chat Stream:** `POST /chat/stream` (custom endpoint)

Test them by making requests to `https://your-vercel-deployment.vercel.app/...`
