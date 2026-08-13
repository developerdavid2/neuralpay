// lib/ai-provider.ts
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export function getModel() {
  const modelId = process.env.AI_MODEL ?? "qwen/qwen3.6-27b";
  return groq.languageModel(modelId);
}
