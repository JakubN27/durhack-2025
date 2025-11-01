import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables:')
  console.error('SUPABASE_URL:', supabaseUrl ? '✓' : '✗ Missing')
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗ Missing')
  throw new Error('Missing Supabase environment variables')
}

console.log('✅ Supabase configuration loaded successfully')

// Use service key for backend operations (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey)
