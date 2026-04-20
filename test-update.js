import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rsqlltjpqtsplwdpnrve.supabase.co'
const supabaseKey = 'sb_publishable_2u8wKDamnxmi9a9Ck7zFFQ_tVX33FbK'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('recipes').update({ category: 'UNCATEGORIZED' }).eq('category', 'TARTE').select()
  console.log('Update result:', data, 'Error:', error)
}

test()
