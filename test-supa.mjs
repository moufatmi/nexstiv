import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://klaoqaslbjwkcmdiunuu.supabase.co'
const supabaseAnonKey = 'sb_publishable_kOhTH4xJzA3YRfJ-14Ndug_LJNk3bjd'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Fetching Supabase settings...')
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 1)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Success:', JSON.stringify(data, null, 2))
  }
}

test()
