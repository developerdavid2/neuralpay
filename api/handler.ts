import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Lazy load the app to catch initialization errors
  try {
    const mainApp = require("../apps/server/ai-service/src/main.ts").default;
    return mainApp(req, res);
  } catch (error) {
    console.error("[v0] Handler error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
