'use client'
import { useState } from 'react'

type Suggestion = {
  name: string
  description: string
  warnings: string[]
  ingredients: { ingredient: string, quantity: string, category: string }[]
}

type Suggestions = {
  [course: string]: Suggestion[]
}

type Props = {
  suggestions: Suggestions
  onValidate: (selected: { course: string, dish: Suggestion }[], shoppingList: { ingredient: string, quantity: string, category: string }[]) => void
}

const COURSE_EMOJI: Record<string, string> = {
  'apéro': '🥂',
  'entrée': '🥗',
  'plat': '🍽️',
  'dessert': '🍮',
}

const COURSE_ORDER = ['apéro', 'entrée', 'plat', 'dessert']

export default function MenuBuilder({ suggestions, onValidate }: Props) {
  const [selected, setSelected] = useState<Record<string, number>>({})

  const courses = COURSE_ORDER.filter(c => suggestions[c])
  const allSelected = courses.every(c => selected[c] !== undefined)

  const handleValidate = () => {
    const selectedDishes = courses.map(c => ({
      course: c,
      dish: suggestions[c][selected[c]]
    }))

    const allIngredients = selectedDishes.flatMap(d => d.dish.ingredients)
    const grouped: Record<string, { ingredient: string, quantity: string, category: string }> = {}
    allIngredients.forEach(ing => {
      if (grouped[ing.ingredient]) {
        grouped[ing.ingredient].quantity += ` + ${ing.quantity}`
      } else {
        grouped[ing.ingredient] = { ...ing }
      }
    })

    onValidate(selectedDishes, Object.values(grouped))
  }

  return (
    <div>
      {courses.map(course => (
        <div key={course} style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#AAA',
            letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10
          }}>
            {COURSE_EMOJI[course]} {course} — choisissez 1 proposition
          </p>

          {suggestions[course].map((dish, i) => (
            <div key={i}
              onClick={() => setSelected({ ...selected, [course]: i })}
              style={{
                borderRadius: 16, padding: '14px 16px',
                border: selected[course] === i ? '2px solid #43A047' : '0.5px solid #E8E4DC',
                marginBottom: 8, cursor: 'pointer',
                background: selected[course] === i ? '#E8F0E8' : 'white'
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1B3A1E', margin: '0 0 4px' }}>
                    {dish.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#888', margin: 0, lineHeight: 1.5 }}>
                    {dish.description}
                  </p>
                  {dish.warnings.map((w, j) => (
                    <div key={j} style={{
                      marginTop: 6, background: '#FFF3E0',
                      borderRadius: 8, padding: '4px 8px',
                      fontSize: 11, color: '#E65100'
                    }}>⚠️ {w}</div>
                  ))}
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  border: selected[course] === i ? 'none' : '1.5px solid #DDD',
                  background: selected[course] === i ? '#43A047' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {selected[course] === i && (
                    <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {allSelected ? (
        <button onClick={handleValidate} style={{
          width: '100%', padding: '14px',
          background: '#43A047', color: 'white',
          border: 'none', borderRadius: 100,
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          marginTop: 8
        }}>
          Valider ce menu →
        </button>
      ) : (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#AAA', marginTop: 8 }}>
          Choisissez un plat par cours pour valider
        </p>
      )}
    </div>
  )
}