import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
const envs = {}
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) envs[key.trim()] = vals.join('=').trim()
})

const supabaseUrl = envs.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envs.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single()
  if (error) {
    console.log('Error fetching:', error)
    return
  }

  let uiContent = data.ui_content || {}
  
  // Apply new footer columns
  uiContent.footerColumns = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', url: '/#collections' },
        { label: 'New Arrivals', url: '/#collections' },
        { label: 'Best Sellers', url: '/#collections' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', url: '/about' },
        { label: 'Contact', url: '/contact' },
        { label: 'Careers', url: '/careers' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', url: '/faq' },
        { label: 'Shipping', url: '/shipping' },
        { label: 'Returns', url: '/returns' },
      ]
    }
  ]

  const { error: updateError } = await supabase.from('store_settings').update({ ui_content: uiContent }).eq('id', 1)
  
  if (updateError) {
    console.log('Error updating:', updateError)
  } else {
    console.log('Successfully updated footer links in Supabase DB.')
  }
}

run()
