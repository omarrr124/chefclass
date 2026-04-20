import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rsqlltjpqtsplwdpnrve.supabase.co'
const supabaseKey = 'sb_publishable_2u8wKDamnxmi9a9Ck7zFFQ_tVX33FbK'

export const supabase = createClient(supabaseUrl, supabaseKey)
