import re

with open('src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Imports
text = text.replace(
    "import { Trash2, Utensils, Pencil, LogOut, ChevronLeft } from 'lucide-react'",
    "import { Trash2, Utensils, Pencil, LogOut, ChevronLeft, Plus, Image as ImageIcon, X } from 'lucide-react'"
)

# 2. State
text = text.replace(
    "const [form, setForm] = useState({ title: '', ingredients: '', method: '', category: '' })",
    "const [form, setForm] = useState({ title: '', ingredients: '', method: '', category: '' })\n  const [ingredientList, setIngredientList] = useState([])"
)

# 3. openEditModal
text = text.replace(
    """  function openEditModal(recipe) {
    setForm({
      title: recipe.title,
      ingredients: recipe.ingredients,
      method: recipe.method,
      category: recipe.category
    })
    setEditingId(recipe.id)
    setExistingImage(recipe.image_url)
    setImageFile(null)
    setShowModal(true)
  }""",
    """  function openEditModal(recipe) {
    setForm({
      title: recipe.title,
      ingredients: recipe.ingredients,
      method: recipe.method,
      category: recipe.category
    })
    
    let parsedIngredients = [];
    try {
      if (recipe.ingredients && recipe.ingredients.trim().startsWith('[')) {
        parsedIngredients = JSON.parse(recipe.ingredients);
      } else {
        parsedIngredients = (recipe.ingredients || '').split('\\n').filter(l => l.trim()).map(line => ({
          name: line.trim(),
          quantity: 1,
          unit: 'piece',
          imageUrl: 'placeholder',
          id: Math.random().toString(36).substring(2)
        }));
      }
    } catch {
      parsedIngredients = [];
    }
    setIngredientList(parsedIngredients.length > 0 ? parsedIngredients : [{ name: '', quantity: 1, unit: 'piece', imageUrl: 'placeholder', id: Math.random().toString(36).substring(2) }]);

    setEditingId(recipe.id)
    setExistingImage(recipe.image_url)
    setImageFile(null)
    setShowModal(true)
  }"""
)

# 4. handleSubmit
handle_submit_old = """  async function handleSubmit(e) {
    e.preventDefault()
    let image_url = editingId ? existingImage : 'placeholder'
    
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, imageFile)
      
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName)
        image_url = publicUrlData.publicUrl
      } else {
        console.error('Error uploading image:', error)
      }
    }

    const payload = { ...form, image_url }

    if (editingId) {
      await supabase.from('recipes').update(payload).eq('id', editingId)
    } else {
      await supabase.from('recipes').insert([payload])
    }

    setShowModal(false)
    setForm({ title: '', ingredients: '', method: '', category: '' })
    setImageFile(null)
    setEditingId(null)
    setExistingImage(null)
    fetchRecipes()
  }"""

handle_submit_new = """  async function handleSubmit(e) {
    e.preventDefault()
    let image_url = editingId ? existingImage : 'placeholder'
    
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, imageFile)
      
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('recipe-images')
          .getPublicUrl(fileName)
        image_url = publicUrlData.publicUrl
      } else {
        console.error('Error uploading image:', error)
      }
    }

    // Process Ingredients
    const processedIngredients = await Promise.all(ingredientList.map(async (ing) => {
      let ingImageUrl = ing.imageUrl || 'placeholder';
      if (ing.imageFile) {
        const fileExt = ing.imageFile.name.split('.').pop()
        const fileName = `ing-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const { data, error } = await supabase.storage
          .from('recipe-images')
          .upload(fileName, ing.imageFile)
        
        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(fileName)
          ingImageUrl = publicUrlData.publicUrl
        }
      }
      return { 
        id: ing.id || Math.random().toString(36).substring(2),
        name: ing.name, 
        quantity: parseFloat(ing.quantity) || 1, 
        unit: ing.unit, 
        imageUrl: ingImageUrl 
      };
    }));

    const finalIngredientsString = JSON.stringify(processedIngredients);
    const payload = { ...form, ingredients: finalIngredientsString, image_url }

    if (editingId) {
      await supabase.from('recipes').update(payload).eq('id', editingId)
    } else {
      await supabase.from('recipes').insert([payload])
    }

    setShowModal(false)
    setForm({ title: '', ingredients: '', method: '', category: '' })
    setIngredientList([])
    setImageFile(null)
    setEditingId(null)
    setExistingImage(null)
    fetchRecipes()
  }"""
text = text.replace(handle_submit_old, handle_submit_new)


# 5. Add Recipe button
add_btn_old = """            <button className="btn btn-primary" onClick={() => {
              setForm({ title: '', ingredients: '', method: '', category: '' })
              setEditingId(null)
              setExistingImage(null)
              setImageFile(null)
              setShowModal(true)
            }}>+ Add Recipe</button>"""

add_btn_new = """            <button className="btn btn-primary" onClick={() => {
              setForm({ title: '', ingredients: '', method: '', category: '' })
              setIngredientList([{ name: '', quantity: 1, unit: 'piece', imageUrl: 'placeholder', id: Math.random().toString(36).substring(2) }])
              setEditingId(null)
              setExistingImage(null)
              setImageFile(null)
              setShowModal(true)
            }}>+ Add Recipe</button>"""
text = text.replace(add_btn_old, add_btn_new)


# 6. Form UI
ui_old = """              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>Ingredients</label>
                <textarea required value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})} rows={3} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} />
              </div>"""

ui_new = """              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                  Ingredients
                  <button type="button" onClick={() => setIngredientList([...ingredientList, { name: '', quantity: 1, unit: 'piece', imageUrl: 'placeholder', id: Math.random().toString(36).substring(2) }])} style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '20px', padding: '0.2rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={14} /> Add Items
                  </button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {ingredientList.map((ing, idx) => (
                    <div key={ing.id || idx} style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr min-content', gap: '1rem', backgroundColor: 'var(--panel-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                         <div style={{ width: '60px', height: '60px', borderRadius: '8px', backgroundColor: 'var(--input-bg)', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                           {ing.imageFile ? (
                             <img src={URL.createObjectURL(ing.imageFile)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           ) : (ing.imageUrl && ing.imageUrl !== 'placeholder') ? (
                             <img src={ing.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           ) : (
                             <ImageIcon size={24} color="var(--primary)" opacity={0.5} />
                           )}
                           <input type="file" accept="image/*" onChange={(e) => {
                             const newList = [...ingredientList];
                             newList[idx].imageFile = e.target.files[0];
                             setIngredientList(newList);
                           }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} title="Upload Image" />
                         </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', alignItems: 'start' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>Name</label>
                          <input required type="text" placeholder="e.g. Flour" value={ing.name} onChange={e => {
                            const newList = [...ingredientList]; newList[idx].name = e.target.value; setIngredientList(newList);
                          }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>Qty</label>
                          <input required type="number" min="0" step="0.1" value={ing.quantity} onChange={e => {
                            const newList = [...ingredientList]; newList[idx].quantity = e.target.value; setIngredientList(newList);
                          }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>Unit</label>
                          <select value={ing.unit} onChange={e => {
                            const newList = [...ingredientList]; newList[idx].unit = e.target.value; setIngredientList(newList);
                          }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }}>
                            <option value="grm">grm</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="L">L</option>
                            <option value="spoon">spoon</option>
                            <option value="piece">piece</option>
                            <option value="cup">cup</option>
                            <option value="pinch">pinch</option>
                            <option value="to taste">to taste</option>
                          </select>
                        </div>
                      </div>
                      <button type="button" onClick={() => {
                        const newList = ingredientList.filter((_, i) => i !== idx);
                        setIngredientList(newList);
                      }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'flex-start' }} title="Remove Ingredient">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {ingredientList.length === 0 && <p style={{ color: 'var(--text)', opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No ingredients added. Click 'Add Items'.</p>}
                </div>
              </div>"""
text = text.replace(ui_old, ui_new)

with open('src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
