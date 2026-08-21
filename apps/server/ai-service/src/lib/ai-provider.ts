import { createGroq } from "@ai-sdk/groq";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { findSupportedChatModel } from "@orra/types";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const aiGateway = createOpenAICompatible({
  name: "vercel-ai-gateway",
  baseURL: "https://ai-gateway.vercel.sh/v1",
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export function getModelById(modelId: string) {
  const definition = findSupportedChatModel(modelId);
  if (!definition) {
    throw new Error(`Unsupported model ID: ${modelId}`);
  }

  switch (definition.provider) {
    case "openrouter":
      return openrouter(definition.id);
    case "ai-gateway":
      return aiGateway.languageModel(definition.id);
    case "groq":
    default:
      return groq.languageModel(definition.id);
  }
}

export function getModel() {
  const provider = process.env.AI_PROVIDER ?? "groq";

  if (provider === "openrouter") {
    const modelId = process.env.AI_MODEL ?? "openrouter/free";
    return openrouter(modelId);
  }

  if (provider === "ai-gateway") {
    const modelId = process.env.AI_MODEL ?? "google/gemini-2.5-flash-lite";
    return aiGateway.languageModel(modelId);
  }

  const modelId = process.env.AI_MODEL ?? "qwen/qwen3.6-27b";
  return groq.languageModel(modelId);
}
