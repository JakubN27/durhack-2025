import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from api/.env
dotenv.config({ path: join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables:')
  console.error('SUPABASE_URL:', supabaseUrl ? '✓' : '✗ Missing')
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗ Missing')
  throw new Error('Missing Supabase environment variables')
}

console.log('✅ Supabase configuration loaded successfully')
console.log(`   URL: ${supabaseUrl}`)

// Use service key for backend operations (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey)
