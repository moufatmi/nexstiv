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
  
  // Apply new page contents if they don't exist
  if (!uiContent.pageAbout) uiContent.pageAbout = 'Learn more about our company, our mission, and our values.'
  if (!uiContent.pageContact) uiContent.pageContact = 'Get in touch with our team for any inquiries or support.'
  if (!uiContent.pageFAQ) uiContent.pageFAQ = 'Find answers to common questions about our products and services.'
  if (!uiContent.pageShipping) uiContent.pageShipping = 'Information about our shipping rates, methods, and delivery times.'
  if (!uiContent.pageReturns) uiContent.pageReturns = 'Our policy for returning or exchanging items you are not satisfied with.'
  if (!uiContent.pageCareers) uiContent.pageCareers = 'Join our team! Explore open positions and opportunities.'

  const { error: updateError } = await supabase.from('store_settings').update({ ui_content: uiContent }).eq('id', 1)
  
  if (updateError) {
    console.log('Error updating:', updateError)
  } else {
    console.log('Successfully updated page contents in Supabase DB.')
  }
}

run()
