import { createGroq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

const provider = process.env.AI_PROVIDER ?? "groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export function getModel(): LanguageModel {
  const model = process.env.AI_MODEL ?? "llama-3.3-70b-versatile";

  switch (provider) {
    case "groq":
    default:
      return groq(model) as LanguageModel;
  }
}
