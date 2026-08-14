import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export function getModel() {
  const provider = process.env.AI_PROVIDER ?? "groq";

  if (provider === "openrouter") {
    const modelId = process.env.AI_MODEL ?? "openrouter/free";
    return openrouter(modelId);
  }

  const modelId = process.env.AI_MODEL ?? "qwen/qwen3.6-27b";
  return groq.languageModel(modelId);
}
