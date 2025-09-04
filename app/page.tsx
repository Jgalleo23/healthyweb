'use client'
import { useState } from 'react'

export default function Page() {
  const [ingredientsText, setIngredientsText] = useState('tomato, chicken breast, spinach, lemon, olive oil')
  const [servings, setServings] = useState(2)
  const [restrictions, setRestrictions] = useState('low-fat, high-protein')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  async function onGenerate() {
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ingredients: ingredientsText.split(',').map(s => s.trim()).filter(Boolean),
          servings,
          restrictions
        })
      })
      if(!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
    } catch (e:any) {
      setError(e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Food2Recipe Lite</h1>
        <p className="muted">Enter ingredients, servings and restrictions → generate recipe</p>
      </header>

      <main className="card">
        <label>Ingredients (comma-separated)</label>
        <input type="text" value={ingredientsText} onChange={e=>setIngredientsText(e.target.value)} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'14px', marginTop: 14 }}>
          <div>
            <label>Servings</label>
            <input type="number" min={1} value={servings} onChange={e=>setServings(Number(e.target.value))} />
          </div>
          <div>
            <label>Restrictions / goals</label>
            <input type="text" value={restrictions} onChange={e=>setRestrictions(e.target.value)} />
          </div>
        </div>

        <button className="btn primary" onClick={onGenerate} disabled={loading} style={{ marginTop: 14 }}>
          {loading ? 'Generating...' : 'Generate healthy recipe'}
        </button>

        {error && <p style={{ color:'#dc2626', marginTop: 12 }}>{error}</p>}

        {result && (
          <section style={{ marginTop: 16 }}>
            <h3>{result.title}</h3>
            <p className="muted">Servings: {result.servings}</p>
            <h4>Ingredients</h4>
            <ul>
              {result.ingredients?.map((it:any, idx:number)=>
                <li key={idx}>{it.quantity} {it.name}{it.notes ? ` — ${it.notes}` : ''}</li>
              )}
            </ul>
            <h4>Steps</h4>
            <ol>
              {result.steps?.map((s:string,i:number)=><li key={i}>{s}</li>)}
            </ol>
            {result.nutrition_per_serving_estimate && (
              <div>
                <h4>Nutrition (per serving, approx)</h4>
                <ul>
                  <li>Calories: {result.nutrition_per_serving_estimate.calories}</li>
                  <li>Protein: {result.nutrition_per_serving_estimate.protein_g} g</li>
                  <li>Carbs: {result.nutrition_per_serving_estimate.carbs_g} g</li>
                  <li>Fat: {result.nutrition_per_serving_estimate.fat_g} g</li>
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
