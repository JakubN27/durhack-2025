import { supabase } from './lib/supabase'

// Simple component to test Supabase connection
export default function TestConnection() {
  const testConnection = async () => {
    console.log('Testing Supabase connection...')
    console.log('Supabase client:', supabase ? 'Initialized' : 'NULL')
    
    if (!supabase) {
      console.error('❌ Supabase is not configured!')
      console.log('Check your .env.local file')
      return
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('❌ Error getting session:', error.message)
      } else {
        console.log('✅ Supabase connected successfully!')
        console.log('Session:', data.session ? 'Active' : 'None')
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error.message)
    }
  }

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={testConnection}
        className="btn-secondary text-xs"
      >
        Test Connection
      </button>
    </div>
  )
}
