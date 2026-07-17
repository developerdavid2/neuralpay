console.log("[v0] Handler module loading...");

let app;

try {
  const main = require("../src/main");
  app = main.default || main;
  console.log("[v0] Main module loaded successfully");
} catch (error) {
  console.error("[v0] Failed to load main module:", error);
}

module.exports = function handler(req, res) {
  console.log("[v0] Request received:", req.method, req.url);
  
  if (!app) {
    console.error("[v0] App not loaded!");
    return res.status(500).json({ error: "App not initialized" });
  }
  
  try {
    return app(req, res);
  } catch (error) {
    console.error("[v0] Handler error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error)
    });
  }
};
