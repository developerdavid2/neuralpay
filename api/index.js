// Vercel serverless function handler for ai-service
const module_ = require('../apps/server/ai-service/dist/main.js');

// Get the Express app from tsup-compiled output
const app = module_.default || module_;

// Export as Vercel handler
module.exports = app;
