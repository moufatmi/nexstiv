import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://klaoqaslbjwkcmdiunuu.supabase.co'
const supabaseAnonKey = 'sb_publishable_kOhTH4xJzA3YRfJ-14Ndug_LJNk3bjd'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
  console.log(data, error)
}
test()
