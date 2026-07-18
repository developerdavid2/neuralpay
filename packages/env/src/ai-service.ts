import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(4003),
  GROQ_API_KEY: z.string().min(1),
  AI_PROVIDER: z.string().default("groq"),
  AI_MODEL: z.string().default("llama-3.3-70b-versatile"),
  DATABASE_URL: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid ai-service env:", parsed.error.flatten());
  process.exit(1);
}

export const aiServiceEnv = parsed.data;
