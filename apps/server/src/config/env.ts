import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  
  // Database
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // LLM APIs
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // External APIs
  GITHUB_TOKEN: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  
  // Redis (optional for BullMQ)
  REDIS_URL: z.string().optional(),
  
  // Security
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // InterTools
  INTERTOOLS_SERVER_URL: z.string().url().optional(),
  
  // Monitoring (optional)
  POSTHOG_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let env: Env

export function validateEnv(): Env {
  try {
    env = envSchema.parse(process.env)
    return env
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    process.exit(1)
  }
}

export function getEnv(): Env {
  if (!env) {
    return validateEnv()
  }
  return env
}
