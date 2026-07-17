module.exports = (req, res) => {
  try {
    // Health check endpoint
    if (req.url === "/health" || req.path === "/health") {
      return res.status(200).json({
        status: "ok",
        service: "ai-service",
        timestamp: new Date().toISOString(),
      });
    }

    // Try to load and forward to the Express app
    try {
      const app = require("../apps/server/ai-service/dist/app.mjs");
      return app.default(req, res);
    } catch (appError) {
      console.error("[v0] Failed to load app:", appError.message);
      return res.status(500).json({
        error: "App not available",
        message: appError.message,
      });
    }
  } catch (error) {
    console.error("[v0] Handler error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};
