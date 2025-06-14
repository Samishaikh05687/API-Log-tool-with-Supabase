import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      api_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          method: string
          url: string
          endpoint: string
          headers: Record<string, string>
          request_payload: any
          response_payload: any
          status_code: number
          response_time: number
          error: string | null
          user_agent: string | null
          size: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          method: string
          url: string
          endpoint: string
          headers: Record<string, string>
          request_payload?: any
          response_payload?: any
          status_code: number
          response_time: number
          error?: string | null
          user_agent?: string | null
          size: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          method?: string
          url?: string
          endpoint?: string
          headers?: Record<string, string>
          request_payload?: any
          response_payload?: any
          status_code?: number
          response_time?: number
          error?: string | null
          user_agent?: string | null
          size?: number
        }
      }
    }
  }
}