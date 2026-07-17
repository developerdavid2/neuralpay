// Import the built Express app - Vercel automatically compiles TypeScript
const app = require('../apps/server/ai-service/src/main.ts');

// Vercel serverless function handler
module.exports = app;

