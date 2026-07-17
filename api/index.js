module.exports = (req, res) => {
  if (req.path === '/health' || req.url === '/health') {
    return res.json({ status: 'ok', service: 'ai-service', timestamp: new Date().toISOString() });
  }
  
  try {
    const app = require('../apps/server/ai-service/dist/main.mjs');
    return app(req, res);
  } catch (error) {
    console.error('[v0] Error loading app:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
