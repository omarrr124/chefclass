import { useEffect, useState, useRef } from 'react'
import { Heart, Utensils } from 'lucide-react'
import { SearchBar } from '@/components/ui/search-bar'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function Recipes() {
  const { t } = useLanguage()
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [viewRecipe, setViewRecipe] = useState(null)
  const [checkedIngredients, setCheckedIngredients] = useState({})
  const [ingredientQuantities, setIngredientQuantities] = useState({})
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const componentRef = useRef(null)
  
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favorites')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  function toggleFavorite(id, e) {
    e.stopPropagation();
    let newFavs = []
    if (favorites.includes(id)) {
      newFavs = favorites.filter(favId => favId !== id)
    } else {
      newFavs = [...favorites, id]
    }
    setFavorites(newFavs)
    localStorage.setItem('favorites', JSON.stringify(newFavs))
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
    if (viewRecipe) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [viewRecipe])

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
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }

  return (
    <div className="p-4 md:p-20 pt-12 md:pt-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0 mb-8 w-full">
        <h1 className="page-title text-4xl sm:text-[3.5rem] !mb-0 text-center sm:text-left">{t('recipes.title')}</h1>
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <SearchBar 
            placeholder={t('recipes.search')}
            onSearch={setSearchQuery} 
            currentQuery={searchQuery}
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveCategory(null)}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', border: '1px solid var(--primary)', backgroundColor: activeCategory === null ? 'var(--primary)' : 'var(--panel-bg)', color: activeCategory === null ? 'var(--cta)' : 'var(--primary)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: '600' }}
          >
            {t('recipes.all')}
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
          <div key={recipe.id} className="glass-card" style={cardStyle} onClick={() => { setViewRecipe(recipe); setCheckedIngredients({}); setIngredientQuantities({}); }}>
            <button 
              onClick={(e) => toggleFavorite(recipe.id, e)}
              style={{
                position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'var(--panel-bg)', 
                border: '1px solid var(--glass-border)', borderRadius: '50%', width: '36px', height: '36px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10, color: favorites.includes(recipe.id) ? '#ef4444' : 'var(--primary)', 
                backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              title="Favorite Recipe"
            >
              <Heart size={18} fill={favorites.includes(recipe.id) ? '#ef4444' : 'none'} />
            </button>
            
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
              <h3 className="heading" style={{ fontSize: '1.6rem', fontWeight: '600', color: 'var(--text)', marginBottom: '0.5rem' }}>{recipe.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.3rem 0.8rem', borderRadius: '20px', backgroundColor: recipe.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.1)' : recipe.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)', color: recipe.difficulty === 'easy' ? '#22c55e' : recipe.difficulty === 'hard' ? '#ef4444' : 'var(--primary)', border: `1px solid ${recipe.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.3)' : recipe.difficulty === 'hard' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(212, 175, 55, 0.3)'}` }}>
                  {recipe.difficulty === 'easy' ? t('difficulty.easy') : recipe.difficulty === 'hard' ? t('difficulty.hard') : t('difficulty.medium')}
                </span>
              </div>
            </div>
          </div>
        ))}
        {displayedRecipes.length === 0 && <p style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: '500' }}>{t('recipes.noMatch')}</p>}
      </div>

      {/* Recipe Preview Modal */}
      {viewRecipe && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setViewRecipe(null)}>
          <div ref={componentRef} className="glass-card" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--panel-solid)', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ position: 'relative' }}>
              <div className="no-print" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem', zIndex: 20 }}>
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
            
            <div className="p-6 pt-10 md:p-10 md:pt-14">
              <h2 className="heading" style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', color: 'var(--text)', fontWeight: '700', marginBottom: '2rem' }}>{viewRecipe.title}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2.5rem' }}>
                <div className="p-4 md:p-8" style={{ backgroundColor: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('recipes.ingredients')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {(() => {
                      let parsedIngredients = [];
                      try {
                        if (viewRecipe.ingredients && viewRecipe.ingredients.trim().startsWith('[')) {
                          parsedIngredients = JSON.parse(viewRecipe.ingredients);
                        } else {
                          parsedIngredients = (viewRecipe.ingredients || '').split('\n').filter(l => l.trim()).map((line, idx) => ({
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
                        <div key={ing.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', backgroundColor: 'var(--panel-bg)', transition: 'all 0.3s' }}>
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
                            
                            {/* Quantity */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.05rem' }}>
                                {ing.quantity}
                              </span>
                            </div>
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
                    {viewRecipe.method.split('\n').filter(line => line.trim()).map((step, idx) => (
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
