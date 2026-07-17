import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./main";

console.log("[v0] Handler module loaded");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("[v0] Request received:", req.method, req.url);
  
  try {
    return app(req, res);
  } catch (error) {
    console.error("[v0] Handler error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
