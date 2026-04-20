import { useEffect, useState } from 'react'
import { Trash2, Utensils, Pencil, LogOut, ChevronLeft } from 'lucide-react'
import { SearchBar } from '@/components/ui/search-bar'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({ title: '', ingredients: '', method: '', category: '' })
  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState('')
  const [isAddingCat, setIsAddingCat] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [recipeToDelete, setRecipeToDelete] = useState(null)
  const [viewRecipe, setViewRecipe] = useState(null)
  const [checkedIngredients, setCheckedIngredients] = useState({})
  
  const [editingId, setEditingId] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function fetchRecipes() {
    const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    if (data) setRecipes(data)
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  useEffect(() => {
    fetchRecipes()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (showModal || recipeToDelete || categoryToDelete || viewRecipe) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showModal, recipeToDelete, categoryToDelete, viewRecipe])

  function openEditModal(recipe) {
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
  }

  async function handleSubmit(e) {
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
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!newCat.trim()) return
    const name = newCat.trim().toUpperCase()
    await supabase.from('categories').insert([{ name }])
    setNewCat('')
    setIsAddingCat(false)
    fetchCategories()
    setForm({...form, category: name})
  }

  async function confirmDeleteCategory() {
    if (!categoryToDelete) return

    const { data: defaultCat } = await supabase.from('categories').select('*').eq('name', 'UNCATEGORIZED')
    if (!defaultCat || defaultCat.length === 0) {
      await supabase.from('categories').insert([{ name: 'UNCATEGORIZED' }])
    }

    await supabase.from('recipes').update({ category: 'UNCATEGORIZED' }).eq('category', categoryToDelete)
    await supabase.from('categories').delete().eq('name', categoryToDelete)
    
    if (form.category === categoryToDelete) setForm({...form, category: 'UNCATEGORIZED'})
    setCategoryToDelete(null)
    fetchCategories()
    fetchRecipes()
  }

  function triggerDelete(recipeId, imageUrl) {
    setRecipeToDelete({ recipeId, imageUrl })
  }

  async function confirmDelete() {
    if (!recipeToDelete) return;
    const { recipeId, imageUrl } = recipeToDelete;
    
    if (imageUrl && imageUrl.includes('supabase.co') && imageUrl.includes('recipe-images')) {
      const parts = imageUrl.split('/')
      const fileName = parts[parts.length - 1]
      await supabase.storage.from('recipe-images').remove([fileName])
    }
    await supabase.from('recipes').delete().eq('id', recipeId)
    setRecipeToDelete(null)
    fetchRecipes()
  }

  const displayedRecipes = recipes.filter(recipe => {
    if (activeCategory && recipe.category !== activeCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!recipe.title.toLowerCase().includes(q) && !recipe.ingredients.toLowerCase().includes(q)) return false
    }
    return true
  })

  const cardStyle = {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid var(--glass-border)',
    transition: 'transform 0.2s',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Admin Sidebar */}
      <nav style={{ width: '280px', padding: '3rem 2rem', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '3rem' }}>
          <Utensils size={24} /> Admin Panel
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Utensils size={18} /> Manage Recipes
          </button>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', color: 'var(--text)', opacity: 0.8, padding: '0.75rem 1rem', borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <ChevronLeft size={18} /> Back to Public Site
          </button>
          <button onClick={handleLogout} style={{ background: 'none', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ef4444', textAlign: 'left', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '4rem 5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Recipe Management</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <SearchBar 
              placeholder="Search..." 
              onSearch={setSearchQuery} 
              currentQuery={searchQuery}
            />
            <button className="btn btn-primary" onClick={() => {
              setForm({ title: '', ingredients: '', method: '', category: '' })
              setEditingId(null)
              setExistingImage(null)
              setImageFile(null)
              setShowModal(true)
            }}>+ Add Recipe</button>
          </div>
        </div>

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveCategory(null)}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--primary)', backgroundColor: activeCategory === null ? 'var(--primary)' : 'var(--panel-bg)', color: activeCategory === null ? 'var(--cta)' : 'var(--primary)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: '600' }}
            >
              All
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCategory(activeCategory === c.name ? null : c.name)}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--primary)', backgroundColor: activeCategory === c.name ? 'var(--primary)' : 'var(--panel-bg)', color: activeCategory === c.name ? 'var(--cta)' : 'var(--primary)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: '600' }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '3rem' }}>
          {displayedRecipes.map(recipe => (
            <div key={recipe.id} className="glass-card" style={{...cardStyle, backgroundColor: 'var(--panel-solid)'}} onClick={() => { setViewRecipe(recipe); setCheckedIngredients({}); }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(recipe); }} 
                  style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', color: 'var(--primary)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerDelete(recipe.id, recipe.image_url); }} 
                  style={{ background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', color: '#ef4444', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {(recipe.image_url === 'placeholder' || recipe.image_url.includes('unsplash.com') || recipe.image_url.includes('loremflickr')) ? (
                <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, var(--panel-solid) 0%, var(--glass-border) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', opacity: 0.6 }}>
                  <Utensils size={48} strokeWidth={1.5} />
                </div>
              ) : (
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                />
              )}

              <div style={{ 
                position: 'absolute', 
                top: '185px', 
                left: '1.5rem', 
                backgroundColor: 'var(--secondary)',
                color: 'var(--cta)',
                padding: '0.3rem 1rem',
                borderRadius: '20px',
                fontWeight: '600',
                fontSize: '0.75rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                zIndex: 10,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.6)'
              }}>
                {recipe.category || 'RECIPE'}
              </div>

              <div style={{ padding: '2.5rem 1.5rem 2rem 1.5rem' }}>
                <h3 className="heading" style={{ fontSize: '1.6rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>{recipe.title}</h3>
                <p style={{ color: 'var(--text)', opacity: 0.8, fontSize: '1rem', lineHeight: '1.6', height: '60px', overflow: 'hidden' }}>
                  {recipe.ingredients.substring(0, 80)}...
                </p>
              </div>
            </div>
          ))}
          {displayedRecipes.length === 0 && <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '500' }}>No recipes match your criteria.</p>}
        </div>
      </main>

      {/* Editing Modals */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ backgroundColor: 'var(--panel-solid)', padding: '3rem', width: '90%', maxWidth: '550px', border: '1px solid var(--glass-border)', position: 'relative', borderRadius: '24px' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', opacity: 0.7 }}>&times;</button>
            <h2 className="heading" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem' }}>{editingId ? 'Edit Recipe' : 'Add a Recipe'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>Title</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>{editingId ? 'Update Photo (Optional)' : 'Upload Photo (Optional)'}</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>Category</label>
                {!isAddingCat ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }}>
                      <option value="" disabled>Select a category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    {form.category && form.category !== 'UNCATEGORIZED' && (
                      <button 
                        type="button" 
                        onClick={() => setCategoryToDelete(form.category)}
                        className="btn" 
                        style={{ padding: '0 0.8rem', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(30, 35, 40, 0.5)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button type="button" onClick={() => setIsAddingCat(true)} className="btn" style={{ padding: '0 1rem', border: '1px dashed rgba(212, 175, 55, 0.5)', backgroundColor: 'rgba(30, 35, 40, 0.5)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>+ Add New</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={newCat} 
                      onChange={e => setNewCat(e.target.value)} 
                      placeholder="New Category Name"
                      style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} 
                    />
                    <button type="button" onClick={handleAddCategory} className="btn btn-primary" style={{ padding: '0 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>Save</button>
                    <button type="button" onClick={() => setIsAddingCat(false)} className="btn" style={{ padding: '0 1rem', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'transparent', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>Ingredients</label>
                <textarea required value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})} rows={3} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>Method</label>
                <textarea required value={form.method} onChange={e => setForm({...form, method: e.target.value})} rows={3} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', border: 'none' }}>{editingId ? 'Save Changes' : 'Publish Recipe'}</button>
            </form>
          </div>
        </div>
      )}

      {recipeToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card" style={{ backgroundColor: 'var(--panel-solid)', padding: '3rem', width: '90%', maxWidth: '400px', border: '1px solid var(--glass-border)', borderRadius: '24px', textAlign: 'center' }}>
            <h2 className="heading" style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>Delete Recipe?</h2>
            <p style={{ color: 'var(--text)', marginBottom: '2rem', opacity: 0.8 }}>This action cannot be undone. Are you absolutely sure?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setRecipeToDelete(null)} 
                className="btn"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="btn btn-primary"
                style={{ backgroundColor: '#ef4444', border: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 105 }}>
          <div className="glass-card" style={{ backgroundColor: 'var(--panel-solid)', padding: '3rem', width: '90%', maxWidth: '400px', border: '1px solid var(--glass-border)', borderRadius: '24px', textAlign: 'center' }}>
            <h2 className="heading" style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>Delete Category?</h2>
            <p style={{ color: 'var(--text)', marginBottom: '2rem', opacity: 0.8 }}>Removing "{categoryToDelete}" will erase it from the dropdown choices forever. Any recipes in this category will be moved to "UNCATEGORIZED". Are you sure?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setCategoryToDelete(null)} 
                className="btn"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteCategory} 
                className="btn btn-primary"
                style={{ backgroundColor: '#ef4444', border: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Recipe Preview Modal */}
      {viewRecipe && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setViewRecipe(null)}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--panel-solid)', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem', zIndex: 20 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setViewRecipe(null); }} 
                  style={{ fontSize: '2rem', background: 'var(--input-bg)', border: 'none', color: 'var(--primary)', cursor: 'pointer', opacity: 0.8, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                >
                  &times;
                </button>
              </div>
              {(viewRecipe.image_url === 'placeholder' || viewRecipe.image_url.includes('unsplash.com') || viewRecipe.image_url.includes('loremflickr')) ? (
                <div style={{ width: '100%', height: '350px', background: 'linear-gradient(135deg, var(--panel-solid) 0%, var(--glass-border) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', opacity: 0.6 }}>
                  <Utensils size={80} strokeWidth={1} />
                </div>
              ) : (
                <img 
                  src={viewRecipe.image_url} 
                  alt={viewRecipe.title} 
                  style={{ width: '100%', height: '350px', objectFit: 'cover' }} 
                />
              )}
              <div style={{ position: 'absolute', bottom: '-15px', left: '2.5rem', backgroundColor: 'var(--secondary)', color: 'var(--cta)', padding: '0.4rem 1.2rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.6)' }}>
                {viewRecipe.category || 'RECIPE'}
              </div>
            </div>
            
            <div style={{ padding: '3.5rem 2.5rem 2.5rem 2.5rem' }}>
              <h2 className="heading" style={{ fontSize: '2.5rem', color: 'var(--text)', fontWeight: '700', marginBottom: '2rem' }}>{viewRecipe.title}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2.5rem' }}>
                <div style={{ backgroundColor: 'var(--panel-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Ingredients</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {viewRecipe.ingredients.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <span style={{ color: 'var(--text)', opacity: 0.9, fontSize: '1.05rem', lineHeight: '1.5' }}>
                          • {line}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ padding: '0 1rem' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Method</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {viewRecipe.method.split('\n').filter(line => line.trim()).map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ fontSize: '2.5rem', color: 'rgba(212, 175, 55, 0.2)', fontWeight: '800', lineHeight: '0.9', fontFamily: 'serif', flexShrink: 0 }}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div style={{ color: 'var(--text)', opacity: 0.9, fontSize: '1.1rem', lineHeight: '1.8' }}>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
