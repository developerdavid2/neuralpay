# AI Service Deployment Guide

## Summary

The ai-service has been reconfigured to use **tsup** for proper bundling of workspace packages, following the same pattern as the working example project you provided.

## Key Changes

### 1. **tsup Configuration** (`apps/server/ai-service/tsup.config.ts`)
- Created proper tsup configuration with `noExternal: ['@neuralpay']`
- This bundles ALL @neuralpay workspace packages into a single output file
- Eliminates module resolution issues that were causing FUNCTION_INVOCATION_FAILED errors

### 2. **Build Script** (`apps/server/ai-service/package.json`)
```json
"build": "tsup",
"start": "node dist/main.js"
```
- Replaced bun build with tsup
- Output is a single `dist/main.js` file with all dependencies bundled

### 3. **Vercel Handler** (`api/index.js`)
```javascript
const module_ = require('../apps/server/ai-service/dist/main.js');
const app = module_.default || module_;
module.exports = app;
```
- Simple handler that imports the compiled tsup output
- Vercel automatically uses this as a serverless function

### 4. **Cleaned main.ts**
- Removed debug logging
- Simplified server startup logic
- Proper /health endpoint

## How It Works

1. **Local Build**: `bun run build` in root compiles everything
   - tsup bundles `@neuralpay` packages into `apps/server/ai-service/dist/main.js`
   
2. **Vercel Build**: Uses `vercel.json` buildCommand
   - Runs `bun install && bun run build`
   - Generates compiled `dist/main.js`
   
3. **Vercel Execution**: 
   - Detects `api/index.js` as serverless function
   - Imports and exports the Express app
   - Routes all requests through the app

## Deployment Steps

1. **Push to v0 branch** ✓ (Already done)
   ```bash
   git push origin v0/developerdavid2-9cf72ad1
   ```

2. **Merge to main or target deployment branch**
   ```bash
   gh pr create --base main --head v0/developerdavid2-9cf72ad1
   gh pr merge <PR_NUMBER> --merge
   ```

3. **Vercel Auto-Deploy**
   - Vercel will automatically detect the push
   - Run build command from `vercel.json`
   - Deploy `api/index.js` as serverless function

## Testing

Once deployed, test the health endpoint:

```bash
curl https://neuralpay-ai-service.vercel.app/health

# Expected response:
# {"status":"ok","service":"ai-service","timestamp":"2024-07-18T..."}
```

Test other endpoints:
```bash
curl -X POST https://neuralpay-ai-service.vercel.app/trpc/...
curl -X POST https://neuralpay-ai-service.vercel.app/chat/stream
```

## Troubleshooting

If deployment still fails:

1. **Check Vercel Logs**: Visit Vercel dashboard → Project → Deployments → View Logs
2. **Local Test Build**: Run `bun run build` locally to ensure it compiles
3. **Verify tsup Output**: Check `apps/server/ai-service/dist/main.js` is generated
4. **Check Environment Variables**: Ensure all env vars are set in Vercel project settings

## Why This Works

The tsup approach works because:
- ✅ Bundles all workspace packages into a single file
- ✅ No module resolution at runtime (everything is pre-compiled)
- ✅ Simple serverless function entry point
- ✅ Follows proven pattern from working example project
- ✅ Eliminates FUNCTION_INVOCATION_FAILED errors
