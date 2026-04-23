import { useEffect, useState, useRef } from 'react'
import { Trash2, Utensils, Pencil, LogOut, ChevronLeft, Plus, Image as ImageIcon, X } from 'lucide-react'
import { SearchBar } from '@/components/ui/search-bar'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function AdminDashboard() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState('en')

  const [form, setForm] = useState({ 
    title: '', method: '', category: '', difficulty: 'medium',
    title_fr: '', title_ar: '', method_fr: '', method_ar: ''
  })
  const methodRef = useRef(null)

  const insertTag = (tagStart, tagEnd) => {
    const textarea = methodRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = form.method
    const before = text.substring(0, start)
    const selected = text.substring(start, end)
    const after = text.substring(end)
    setForm({...form, method: before + tagStart + selected + tagEnd + after})
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + selected.length)
    }, 0)
  }
  const [ingredientList, setIngredientList] = useState([])
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
      title_fr: recipe.title_fr || '',
      title_ar: recipe.title_ar || '',
      method: recipe.method,
      method_fr: recipe.method_fr || '',
      method_ar: recipe.method_ar || '',
      category: recipe.category,
      difficulty: recipe.difficulty || 'medium'
    })
    
    let ingEn = [], ingFr = [], ingAr = [];
    try { ingEn = recipe.ingredients ? JSON.parse(recipe.ingredients) : []; } catch {}
    try { ingFr = recipe.ingredients_fr ? JSON.parse(recipe.ingredients_fr) : []; } catch {}
    try { ingAr = recipe.ingredients_ar ? JSON.parse(recipe.ingredients_ar) : []; } catch {}

    if (ingEn.length === 0) {
      try {
        const lines = (recipe.ingredients || '').split('\n').filter(l => l.trim());
        ingEn = lines.map(line => ({ name: line.trim(), quantity: 1, unit: 'piece', id: Math.random().toString(36).substring(2) }));
      } catch {}
    }

    const unifiedList = ingEn.length > 0 ? ingEn.map((ing, idx) => {
      const frIng = ingFr[idx] || {};
      const arIng = ingAr[idx] || {};
      return {
        id: ing.id || Math.random().toString(36).substring(2),
        name: ing.name || '',
        name_fr: frIng.name || '',
        name_ar: arIng.name || '',
        quantity: ing.quantity || 1,
        unit: ing.unit || 'piece',
        unit_fr: frIng.unit || ing.unit || 'piece',
        unit_ar: arIng.unit || ing.unit || 'piece',
        imageUrl: ing.imageUrl || 'placeholder'
      }
    }) : [{ name: '', name_fr: '', name_ar: '', quantity: 1, unit: 'piece', unit_fr: 'piece', unit_ar: 'piece', imageUrl: 'placeholder', id: Math.random().toString(36).substring(2) }];

    setIngredientList(unifiedList)
    setEditingId(recipe.id)
    setExistingImage(recipe.image_url)
    setImageFile(null)
    setActiveLangTab('en')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
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

    const processedEn = [];
    const processedFr = [];
    const processedAr = [];

    // Process Ingredients
    for (let ing of ingredientList) {
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
      
      const base = { id: ing.id || Math.random().toString(36).substring(2), quantity: parseFloat(ing.quantity) || 1, imageUrl: ingImageUrl };
      processedEn.push({ ...base, name: ing.name, unit: ing.unit });
      processedFr.push({ ...base, name: ing.name_fr || ing.name, unit: ing.unit_fr || ing.unit });
      processedAr.push({ ...base, name: ing.name_ar || ing.name, unit: ing.unit_ar || ing.unit });
    }

    const finalIngredientsString = JSON.stringify(processedEn);
    const finalIngredientsString_fr = JSON.stringify(processedFr);
    const finalIngredientsString_ar = JSON.stringify(processedAr);

    const payload = { 
      ...form, 
      ingredients: finalIngredientsString, 
      image_url,
      ingredients_fr: finalIngredientsString_fr,
      ingredients_ar: finalIngredientsString_ar
    }

    if (editingId) {
      await supabase.from('recipes').update(payload).eq('id', editingId)
    } else {
      await supabase.from('recipes').insert([payload])
    }

    setIsSaving(false)
    setShowModal(false)
    setForm({ 
      title: '', method: '', category: '', difficulty: 'medium',
      title_fr: '', title_ar: '', method_fr: '', method_ar: ''
    })
    setIngredientList([])
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
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }

  return (
    <div className="flex-1 relative p-6 pt-10 md:p-[4rem_5rem] flex flex-col">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
          <h1 className="page-title" style={{ marginBottom: 0, fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}>{t('admin.recipeManagement')}</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-start sm:items-center">
            <div className="w-full sm:w-auto">
              <SearchBar 
                placeholder={t('admin.search')}
                onSearch={setSearchQuery} 
                currentQuery={searchQuery}
              />
            </div>
            <button className="btn btn-primary w-full sm:w-auto whitespace-nowrap" onClick={() => {
              setForm({ title: '', ingredients: '', method: '', category: '' })
              setIngredientList([{ name: '', quantity: 1, unit: 'piece', imageUrl: 'placeholder', id: Math.random().toString(36).substring(2) }])
              setEditingId(null)
              setExistingImage(null)
              setImageFile(null)
              setShowModal(true)
            }}>{t('admin.addRecipe')}</button>
          </div>
        </div>

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveCategory(null)}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--primary)', backgroundColor: activeCategory === null ? 'var(--primary)' : 'var(--panel-bg)', color: activeCategory === null ? 'var(--cta)' : 'var(--primary)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: '600' }}
            >
              {t('admin.all')}
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

        <div className="grid gap-8 md:gap-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
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
                {recipe.category || t('recipes.recipeTag')}
              </div>

              <div style={{ padding: '2.5rem 1.5rem 2rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 className="heading" style={{ fontSize: '1.6rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>{recipe[`title_${language}`] || recipe.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.3rem 0.8rem', borderRadius: '20px', backgroundColor: recipe.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.1)' : recipe.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)', color: recipe.difficulty === 'easy' ? '#22c55e' : recipe.difficulty === 'hard' ? '#ef4444' : 'var(--primary)', border: `1px solid ${recipe.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.3)' : recipe.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(212, 175, 55, 0.3)'}` }}>
                    {recipe.difficulty === 'easy' ? t('difficulty.easy') : recipe.difficulty === 'hard' ? t('difficulty.hard') : t('difficulty.medium')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {displayedRecipes.length === 0 && <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '500' }}>{t('admin.noMatch')}</p>}
        </div>


      {/* Editing Modals */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card p-6 sm:p-8 md:p-12 w-[95%] sm:w-[90%]" style={{ backgroundColor: 'var(--panel-solid)', maxWidth: '550px', border: '1px solid var(--glass-border)', position: 'relative', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', opacity: 0.7 }}>&times;</button>
            <h2 className="heading text-3xl md:text-[2.5rem]" style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem' }}>{editingId ? t('admin.editRecipe') : t('admin.addARecipe')}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                {['en', 'fr', 'ar'].map(lang => (
                  <button 
                    key={lang} type="button" 
                    onClick={() => setActiveLangTab(lang)} 
                    style={{ padding: '0.4rem 1.2rem', borderRadius: '20px', border: 'none', backgroundColor: activeLangTab === lang ? 'var(--primary)' : 'transparent', color: activeLangTab === lang ? 'var(--cta)' : 'var(--text)', fontWeight: '600', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>{t('admin.title')} ({activeLangTab.toUpperCase()})</label>
                <input required type="text" 
                  value={activeLangTab === 'en' ? form.title : form[`title_${activeLangTab}`]} 
                  onChange={e => {
                    if (activeLangTab === 'en') setForm({...form, title: e.target.value})
                    else setForm({...form, [`title_${activeLangTab}`]: e.target.value})
                  }} 
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>{editingId ? t('admin.updatePhoto') : t('admin.uploadPhoto')}</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>{t('admin.category')}</label>
                {!isAddingCat ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }}>
                      <option value="" disabled>{t('admin.selectCategory')}</option>
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
                    <button type="button" onClick={() => setIsAddingCat(true)} className="btn" style={{ padding: '0 1rem', border: '1px dashed rgba(212, 175, 55, 0.5)', backgroundColor: 'rgba(30, 35, 40, 0.5)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>{t('admin.addNew')}</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={newCat} 
                      onChange={e => setNewCat(e.target.value)} 
                      placeholder={t('admin.newCategoryName')}
                      style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)' }} 
                    />
                    <button type="button" onClick={handleAddCategory} className="btn btn-primary" style={{ padding: '0 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>{t('admin.save')}</button>
                    <button type="button" onClick={() => setIsAddingCat(false)} className="btn" style={{ padding: '0 1rem', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'transparent', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>{t('admin.cancel')}</button>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>{t('admin.difficulty')}</label>
                <select 
                  value={form.difficulty} 
                  onChange={e => setForm({...form, difficulty: e.target.value})} 
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="easy">{t('admin.easy')}</option>
                  <option value="medium">{t('admin.medium')}</option>
                  <option value="hard">{t('admin.hard')}</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                  {t('admin.ingredients')}
                  <button type="button" onClick={() => setIngredientList([...ingredientList, { name: '', quantity: 1, unit: 'piece', imageUrl: 'placeholder', id: Math.random().toString(36).substring(2) }])} style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '20px', padding: '0.2rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={14} /> {t('admin.addItems')}
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
                          <label style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>{t('admin.name')} ({activeLangTab.toUpperCase()})</label>
                          <input required type="text" placeholder="e.g. Flour" value={activeLangTab === 'en' ? ing.name : ing[`name_${activeLangTab}`]} onChange={e => {
                            const newList = [...ingredientList]; 
                            if (activeLangTab === 'en') newList[idx].name = e.target.value; 
                            else newList[idx][`name_${activeLangTab}`] = e.target.value;
                            setIngredientList(newList);
                          }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>{t('admin.qty')}</label>
                          <input required type="number" min="0" step="0.1" value={ing.quantity} onChange={e => {
                            const newList = [...ingredientList]; newList[idx].quantity = e.target.value; setIngredientList(newList);
                          }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.7 }}>{t('admin.unit')} ({activeLangTab.toUpperCase()})</label>
                          {activeLangTab === 'en' ? (
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
                          ) : (
                            <input required type="text" value={ing[`unit_${activeLangTab}`] || ''} onChange={e => {
                              const newList = [...ingredientList]; newList[idx][`unit_${activeLangTab}`] = e.target.value; setIngredientList(newList);
                            }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
                          )}
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
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--primary)' }}>{t('admin.method')} ({activeLangTab.toUpperCase()})</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6, marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>{t('admin.highlightText')}</span>
                    <button type="button" onClick={() => insertTag('**', '**')} style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', fontWeight: 'bold', background: 'var(--panel-bg)', color: 'var(--text)', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer' }} title="Bold (Fat)">B</button>
                    <button type="button" onClick={() => insertTag('__', '__')} style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', textDecoration: 'underline', background: 'var(--panel-bg)', color: 'var(--text)', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer' }} title="Underline">U</button>
                    <button type="button" onClick={() => insertTag('$$', '$$')} style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', color: '#d4af37', background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer' }} title="Gold Highlight">Hue</button>
                  </div>
                </div>
                <textarea 
                  ref={methodRef} required 
                  value={activeLangTab === 'en' ? form.method : form[`method_${activeLangTab}`]} 
                  onChange={e => {
                    if (activeLangTab === 'en') setForm({...form, method: e.target.value})
                    else setForm({...form, [`method_${activeLangTab}`]: e.target.value})
                  }} 
                  rows={5} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'var(--input-bg)', fontFamily: 'inherit', color: 'var(--text)', lineHeight: '1.5' }} 
                />
                {(activeLangTab === 'en' ? form.method : form[`method_${activeLangTab}`]).trim().length > 0 && (
                  <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                    <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('admin.livePreview')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {(activeLangTab === 'en' ? form.method : form[`method_${activeLangTab}`]).split('\n').filter(line => line.trim()).map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ fontSize: '1.2rem', color: 'rgba(212, 175, 55, 0.4)', fontWeight: '800', fontFamily: 'serif', flexShrink: 0 }}>
                            {(idx + 1).toString().padStart(2, '0')}
                          </div>
                          <div style={{ color: 'var(--text)', opacity: 0.9, fontSize: '0.9rem', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.+?)\*\*/g, '<span style="font-weight: 800">$1</span>').replace(/__(.+?)__/g, '<span style="text-decoration: underline; text-underline-offset: 4px;">$1</span>').replace(/\$\$(.+?)\$\$/g, '<span style="color: #d4af37 !important; font-weight: 600;">$1</span>') }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ marginTop: '1rem', border: 'none', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? "Saving..." : (editingId ? t('admin.saveChanges') : t('admin.publishRecipe'))}</button>
            </form>
          </div>
        </div>
      )}

      {recipeToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card p-6 sm:p-8 md:p-12 w-[95%] sm:w-[90%]" style={{ backgroundColor: 'var(--panel-solid)', maxWidth: '400px', border: '1px solid var(--glass-border)', borderRadius: '24px', textAlign: 'center' }}>
            <h2 className="heading text-2xl md:text-[2rem]" style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>{t('admin.deleteRecipe')}</h2>
            <p style={{ color: 'var(--text)', marginBottom: '2rem', opacity: 0.8 }}>{t('admin.deleteRecipeConfirm')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setRecipeToDelete(null)} 
                className="btn"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                {t('admin.cancel')}
              </button>
              <button 
                onClick={confirmDelete} 
                className="btn btn-primary"
                style={{ backgroundColor: '#ef4444', border: 'none' }}
              >
                {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 105 }}>
          <div className="glass-card p-6 sm:p-8 md:p-12 w-[95%] sm:w-[90%]" style={{ backgroundColor: 'var(--panel-solid)', maxWidth: '400px', border: '1px solid var(--glass-border)', borderRadius: '24px', textAlign: 'center' }}>
            <h2 className="heading text-2xl md:text-[2rem]" style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>{t('admin.deleteCategory')}</h2>
            <p style={{ color: 'var(--text)', marginBottom: '2rem', opacity: 0.8 }}>{t('admin.deleteCategoryConfirm')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setCategoryToDelete(null)} 
                className="btn"
                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                {t('admin.cancel')}
              </button>
              <button 
                onClick={confirmDeleteCategory} 
                className="btn btn-primary"
                style={{ backgroundColor: '#ef4444', border: 'none' }}
              >
                {t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Recipe Preview Modal */}
      {viewRecipe && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setViewRecipe(null)}>
          <div className="glass-card w-[95%] sm:w-[90%]" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--panel-solid)', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: 0 }}>
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
                  style={{ width: '100%', height: 'auto', display: 'block' }} 
                />
              )}
              <div style={{ position: 'absolute', bottom: '-15px', left: '2.5rem', backgroundColor: 'var(--secondary)', color: 'var(--cta)', padding: '0.4rem 1.2rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.6)' }}>
                {viewRecipe.category || t('recipes.recipeTag')}
              </div>
            </div>
            
            <div className="p-6 md:p-10 pt-14 md:pt-14">
              <h2 className="heading text-3xl md:text-[2.5rem]" style={{ color: 'var(--text)', fontWeight: '700', marginBottom: '2rem' }}>{viewRecipe[`title_${language}`] || viewRecipe.title}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2.5rem' }}>
                <div style={{ backgroundColor: 'var(--panel-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('recipes.ingredients')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {(() => {
                      let parsedIngredients = [];
                      const ingStr = viewRecipe[`ingredients_${language}`] || viewRecipe.ingredients;
                      try {
                        if (ingStr && ingStr.trim().startsWith('[')) {
                          parsedIngredients = JSON.parse(ingStr);
                        } else {
                          parsedIngredients = (ingStr || '').split('\n').filter(l => l.trim()).map((line, idx) => ({
                            name: line.trim(),
                            quantity: 1,
                            unit: 'piece',
                            imageUrl: 'placeholder',
                            id: idx.toString()
                          }));
                        }
                      } catch {
                        parsedIngredients = [];
                      }
                      return parsedIngredients.map((ing, idx) => (
                        <div key={ing.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid transparent', backgroundColor: 'rgba(212, 175, 55, 0.05)' }}>
                          <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--panel-solid)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(ing.imageUrl && ing.imageUrl !== 'placeholder') ? (
                              <img src={ing.imageUrl} alt={ing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Utensils size={20} color="var(--primary)" opacity={0.5} />
                            )}
                          </div>
                          <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '1rem' }}>
                            <span style={{ color: 'var(--text)', opacity: 0.9, fontSize: '1.05rem', lineHeight: '1.5', flex: 1 }}>
                              {ing.name}
                            </span>
                            <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.95rem' }}>
                              {ing.quantity}
                            </span>
                            <span style={{ color: 'var(--text)', opacity: 0.6, fontSize: '0.85rem', width: '50px' }}>
                              {ing.unit}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                
                <div style={{ padding: '0 1rem' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('recipes.method')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {(viewRecipe[`method_${language}`] || viewRecipe.method).split('\n').filter(line => line.trim()).map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ fontSize: '2.5rem', color: 'rgba(212, 175, 55, 0.2)', fontWeight: '800', lineHeight: '0.9', fontFamily: 'serif', flexShrink: 0 }}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div style={{ color: 'var(--text)', opacity: 0.9, fontSize: '1.1rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.+?)\*\*/g, '<span style="font-weight: 800">$1</span>').replace(/__(.+?)__/g, '<span style="text-decoration: underline; text-underline-offset: 4px;">$1</span>').replace(/\$\$(.+?)\$\$/g, '<span style="color: #d4af37 !important; font-weight: 600;">$1</span>') }} />
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
