import { createClient } from '@supabase/supabase-js'
import { getEnv } from './env'

const env = getEnv()

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Database helper functions
export class DatabaseError extends Error {
  constructor(message: string, public cause?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export async function handleSupabaseResponse<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise
  
  if (error) {
    throw new DatabaseError(`Database operation failed: ${error.message}`, error)
  }
  
  if (!data) {
    throw new DatabaseError('No data returned from database')
  }
  
  return data
}
