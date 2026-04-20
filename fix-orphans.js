import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rsqlltjpqtsplwdpnrve.supabase.co'
const supabaseKey = 'sb_publishable_2u8wKDamnxmi9a9Ck7zFFQ_tVX33FbK'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrphans() {
  const { data: categories } = await supabase.from('categories').select('name')
  const validNames = categories.map(c => c.name)
  
  const { data: recipes } = await supabase.from('recipes').select('id, title, category')
  
  for (const recipe of recipes) {
    if (recipe.category && !validNames.includes(recipe.category)) {
      console.log(`Fixing orphan recipe: ${recipe.title} (had invalid category: ${recipe.category})`)
      await supabase.from('recipes').update({ category: 'UNCATEGORIZED' }).eq('id', recipe.id)
    }
  }
}

checkOrphans()
