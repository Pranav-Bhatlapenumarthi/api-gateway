import { config } from 'dotenv'
import { z } from 'zod'

config();

const envScheme = z.object({
  PORT: z.coerce.number().default(3000), // coerce converts string to JS number datatype
  HOST: z.string().default("localhost"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
})

export const env = envScheme.parse(process.env);