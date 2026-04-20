import re

with open('src/pages/Recipes.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. State changes
text = text.replace(
    "const [checkedIngredients, setCheckedIngredients] = useState({})",
    "const [checkedIngredients, setCheckedIngredients] = useState({})\n  const [ingredientQuantities, setIngredientQuantities] = useState({})"
)

# 2. Add helper function getIngredientsPreview
text = text.replace(
    "function toggleFavorite(id, e) {",
    """function getIngredientsPreview(ingredientsStr) {
    try {
      if (ingredientsStr && ingredientsStr.trim().startsWith('[')) {
        const arr = JSON.parse(ingredientsStr);
        return arr.map(a => `${a.quantity} ${a.unit} ${a.name}`).join(', ');
      }
    } catch {}
    return ingredientsStr || '';
  }

  function toggleFavorite(id, e) {"""
)

# 3. displayedRecipes filtering
text = text.replace(
    "!recipe.ingredients.toLowerCase().includes(q)",
    "!getIngredientsPreview(recipe.ingredients).toLowerCase().includes(q)"
)

# 4. onClick setViewRecipe
text = text.replace(
    "onClick={() => { setViewRecipe(recipe); setCheckedIngredients({}); }}",
    "onClick={() => { setViewRecipe(recipe); setCheckedIngredients({}); setIngredientQuantities({}); }}"
)


# 5. Card text preview
# recipe.ingredients.substring(0, 80)
text = text.replace(
    "{recipe.ingredients.substring(0, 80)}...",
    "{getIngredientsPreview(recipe.ingredients).substring(0, 80)}..."
)

# 6. Parse Ingredients before rendering
parse_logic = """
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2.5rem' }}>
"""

parse_logic_insert = """
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2.5rem' }}>
                {(() => {
                  let parsedIngredients = [];
                  try {
                    if (viewRecipe.ingredients && viewRecipe.ingredients.trim().startsWith('[')) {
                      parsedIngredients = JSON.parse(viewRecipe.ingredients);
                    } else {
                      parsedIngredients = (viewRecipe.ingredients || '').split('\\n').filter(l => l.trim()).map((line, idx) => ({
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
                  return (
                    <>
"""
text = text.replace(parse_logic, parse_logic_insert)

# 7. Render Ingredients
ing_old = """                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Ingredients</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {viewRecipe.ingredients.split('\\n').filter(line => line.trim()).map((line, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                        <div style={{ marginTop: '0.2rem', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${checkedIngredients[idx] ? 'var(--primary)' : 'rgba(212, 175, 55, 0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: checkedIngredients[idx] ? 'var(--primary)' : 'transparent', transition: 'all 0.2s ease', flexShrink: 0 }}>
                          {checkedIngredients[idx] && <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--bg)', borderRadius: '50%' }} />}
                        </div>
                        <span style={{ color: 'var(--text)', opacity: checkedIngredients[idx] ? 0.4 : 0.9, fontSize: '1.05rem', lineHeight: '1.5', textDecoration: checkedIngredients[idx] ? 'line-through' : 'none', transition: 'all 0.2s ease' }}>
                          {line}
                        </span>
                        <input type="checkbox" style={{ display: 'none' }} checked={!!checkedIngredients[idx]} onChange={() => setCheckedIngredients(prev => ({...prev, [idx]: !prev[idx]}))} />
                      </label>
                    ))}
                  </div>
"""

ing_new = """                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Ingredients</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {parsedIngredients.map((ing, idx) => (
                      <div key={ing.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '8px', border: checkedIngredients[idx] ? '1px solid var(--primary)' : '1px solid transparent', backgroundColor: checkedIngredients[idx] ? 'rgba(212, 175, 55, 0.05)' : 'transparent', transition: 'all 0.3s' }}>
                        <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--panel-solid)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {(ing.imageUrl && ing.imageUrl !== 'placeholder') ? (
                            <img src={ing.imageUrl} alt={ing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Utensils size={20} color="var(--primary)" opacity={0.5} />
                          )}
                        </div>

                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '1rem' }}>
                          {/* Checked Box */}
                          <div style={{ cursor: 'pointer', marginTop: '0.1rem', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${checkedIngredients[idx] ? 'var(--primary)' : 'rgba(212, 175, 55, 0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: checkedIngredients[idx] ? 'var(--primary)' : 'transparent', transition: 'all 0.2s ease', flexShrink: 0 }} onClick={() => setCheckedIngredients(prev => ({...prev, [idx]: !prev[idx]}))}>
                            {checkedIngredients[idx] && <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--bg)', borderRadius: '50%' }} />}
                          </div>
                      
                          <span onClick={() => setCheckedIngredients(prev => ({...prev, [idx]: !prev[idx]}))} style={{ cursor: 'pointer', color: 'var(--text)', opacity: checkedIngredients[idx] ? 0.4 : 0.9, fontSize: '1.05rem', lineHeight: '1.5', textDecoration: checkedIngredients[idx] ? 'line-through' : 'none', flex: 1, transition: 'all 0.2s ease' }}>
                            {ing.name}
                          </span>
                          
                          {/* Quantity Control */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--panel-solid)', borderRadius: '20px', padding: '0.2rem 0.5rem', border: '1px solid var(--glass-border)', opacity: checkedIngredients[idx] ? 0.5 : 1 }}>
                            <button onClick={() => {
                              const val = ingredientQuantities[idx] !== undefined ? ingredientQuantities[idx] : parseFloat(ing.quantity) || 0;
                              if (val > 0) setIngredientQuantities({...ingredientQuantities, [idx]: Math.max(0, val - 1)});
                            }} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>-</button>
                            
                            <input type="number" min="0" step="any" value={ingredientQuantities[idx] !== undefined ? ingredientQuantities[idx] : parseFloat(ing.quantity) || 0} onChange={(e) => {
                              const val = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                              setIngredientQuantities({...ingredientQuantities, [idx]: val});
                            }} style={{ width: '40px', background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', textAlign: 'center', outline: 'none', fontSize: '0.95rem', padding: 0 }} />
                            
                            <button onClick={() => {
                              const val = ingredientQuantities[idx] !== undefined ? ingredientQuantities[idx] : parseFloat(ing.quantity) || 0;
                              setIngredientQuantities({...ingredientQuantities, [idx]: val + 1});
                            }} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>+</button>
                          </div>
                          <span style={{ color: 'var(--text)', opacity: 0.6, fontSize: '0.85rem', width: '50px' }}>
                            {ing.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
"""
text = text.replace(ing_old, ing_new)

# 8. Close the wrapper for parse_logic
close_logic = """
                </div>
              </div>
            </div>
"""
close_logic_insert = """
                </div>
                    </>
                  );
                })()}
              </div>
            </div>
"""
text = text.replace(close_logic, close_logic_insert)

with open('src/pages/Recipes.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
