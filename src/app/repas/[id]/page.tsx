'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import CompatScore from '@/components/CompatScore'
import type { Meal, Profile } from '@/lib/types'

export default function RepasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [guests, setGuests] = useState<Profile[]>([])
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'invites' | 'synthese' | 'menus'>('invites')

  useEffect(() => {
    const load = async () => {
      const { data: mealData } = await supabase
        .from('meals').select('*').eq('id', id).single()
      setMeal(mealData)
      const { data: guestData } = await supabase
        .from('meal_guests')
        .select('profile_id, profiles(*)')
        .eq('meal_id', id)
      if (guestData) setGuests(guestData.map((g: any) => g.profiles).filter(Boolean))
    }
    load()
  }, [id])

  const copyInviteLink = () => {
    if (!meal) return
    const link = `${window.location.origin}/rejoindre/${meal.invite_token}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateMenu = async () => {
    if (!meal || guests.length === 0) return
    setGenerating(true)
    const res = await fetch('/api/generer-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests, mealName: meal.name }),
    })
    const data = await res.json()
    await supabase.from('meals').update({
      ai_menu: data.menu,
      shopping_list: data.shopping_list,
      compatibility_score: data.compatibility_score,
    }).eq('id', id)
    setMeal({ ...meal, ai_menu: data.menu, shopping_list: data.shopping_list, compatibility_score: data.compatibility_score })
    setActiveTab('menus')
    setGenerating(false)
  }

  if (!meal) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#888' }}>Chargement...</p>
    </div>
  )

  const allAllergies = [...new Set(guests.flatMap(g => g.allergies))]
  const allDislikes = [...new Set(guests.flatMap(g => g.dislikes))]

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ padding: '20px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} style={{
          background: '#F8F9FA', border: 'none', borderRadius: '50%',
          width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: '#555'
        }}>‹</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1B4332', margin: 0 }}>{meal.name}</h1>
          {meal.date && (
            <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
              {new Date(meal.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', background: '#F8F9FA', borderRadius: 100, padding: 4, marginBottom: 20 }}>
        {(['invites', 'synthese', 'menus'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '8px 0', borderRadius: 100,
            border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: activeTab === tab ? '#2E7D32' : 'transparent',
            color: activeTab === tab ? 'white' : '#888'
          }}>
            {tab === 'invites' ? 'Invités' : tab === 'synthese' ? 'Synthèse' : 'Menus'}
          </button>
        ))}
      </div>

      {activeTab === 'invites' && (
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E0E0E0', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Lien d'invitation
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/rejoindre/${meal.invite_token}`}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  border: '0.5px solid #E0E0E0', fontSize: 12,
                  color: '#888', background: '#F8F9FA', outline: 'none'
                }}
              />
              <button onClick={copyInviteLink} style={{
                padding: '10px 16px', borderRadius: 10,
                background: copied ? '#388E3C' : '#2E7D32',
                color: 'white', border: 'none', fontSize: 13,
                fontWeight: 500, cursor: 'pointer'
              }}>
                {copied ? '✓' : 'Copier'}
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E0E0E0', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Invités ({guests.length})
            </p>
            {guests.length === 0 ? (
              <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: '12px 0' }}>
                Partagez le lien pour inviter vos convives 👆
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {guests.map((g, i) => (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < guests.length - 1 ? '0.5px solid #F5F5F5' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#E8F5E9', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#2E7D32'
                      }}>
                        {g.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{g.name}</p>
                        {g.diets.length > 0 && (
                          <p style={{ fontSize: 11, color: '#2E7D32', margin: '2px 0 0' }}>{g.diets.join(', ')}</p>
                        )}
                      </div>
                    </div>
                    {g.allergies.length > 0 && (
                      <span style={{
                        fontSize: 11, background: '#FFEBEE',
                        color: '#C62828', padding: '3px 8px',
                        borderRadius: 100, fontWeight: 500
                      }}>
                        ⚠️ {g.allergies.length} allergie(s)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {guests.length > 0 && (
            <button onClick={() => setActiveTab('synthese')} style={{
              width: '100%', padding: '14px',
              background: '#2E7D32', color: 'white',
              border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20
            }}>
              Voir la synthèse →
            </button>
          )}
        </div>
      )}

      {activeTab === 'synthese' && (
        <div>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E0E0E0', marginBottom: 12 }}>
            <CompatScore score={meal.compatibility_score || Math.max(60, Math.round(100 - (allAllergies.length + allDislikes.length) * 5))} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#1B4332', margin: 0 }}>{guests.length}</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>invités</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#1B4332', margin: 0 }}>
                  {guests.reduce((acc, g) => acc + g.cuisines.length + g.diets.length, 0)}
                </p>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>préférences</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#C62828', margin: 0 }}>{allAllergies.length}</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>contraintes</p>
              </div>
            </div>
          </div>

          {allAllergies.length > 0 && (
            <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E0E0E0', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                À prendre en compte
              </p>
              {guests.filter(g => g.allergies.length > 0 || g.dislikes.length > 0).map(g => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  background: '#FFF8E1', borderRadius: 10, padding: '8px 12px', marginBottom: 8
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E65100', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{g.name}</p>
                    {g.allergies.length > 0 && <p style={{ fontSize: 12, color: '#C62828', margin: '2px 0 0' }}>Allergie : {g.allergies.join(', ')}</p>}
                    {g.dislikes.length > 0 && <p style={{ fontSize: 12, color: '#E65100', margin: '2px 0 0' }}>N'aime pas : {g.dislikes.join(', ')}</p>}
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', margin: '12px 0 8px' }}>
                Aliments à éviter
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allAllergies.map(a => (
                  <span key={a} style={{ fontSize: 12, background: '#FFEBEE', color: '#C62828', padding: '4px 10px', borderRadius: 100, fontWeight: 500 }}>{a}</span>
                ))}
                {allDislikes.map(d => (
                  <span key={d} style={{ fontSize: 12, background: '#FFF3E0', color: '#E65100', padding: '4px 10px', borderRadius: 100, fontWeight: 500 }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={generateMenu} disabled={generating} style={{
            width: '100%', padding: '14px',
            background: generating ? '#888' : '#E65100',
            color: 'white', border: 'none', borderRadius: 100,
            fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20
          }}>
            {generating ? '✨ Génération en cours...' : '✨ Générer le menu avec l\'IA'}
          </button>
        </div>
      )}

      {activeTab === 'menus' && (
        <div>
          {!meal.ai_menu ? (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '0.5px solid #E0E0E0', textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>✨</p>
              <p style={{ fontWeight: 600, color: '#1B4332', marginBottom: 6 }}>Pas encore de menu</p>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Allez dans l'onglet Synthèse pour générer votre menu.</p>
              <button onClick={() => setActiveTab('synthese')} style={{
                background: '#2E7D32', color: 'white', border: 'none',
                borderRadius: 100, padding: '12px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer'
              }}>
                Voir la synthèse
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                {meal.ai_menu.length} suggestions pour vous
              </p>
              {meal.ai_menu.map((item, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: 16, overflow: 'hidden',
                  border: '0.5px solid #E0E0E0', marginBottom: 10
                }}>
                  <div style={{
                    height: 80, background: '#E8F5E9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, position: 'relative'
                  }}>
                    {item.course === 'entrée' ? '🥗' : item.course === 'plat' ? '🍽️' : '🍮'}
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>{item.course}</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1B4332', margin: '0 0 4px' }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: '#888', margin: '0 0 8px' }}>{item.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {item.compatible_with.map(c => (
                        <span key={c} style={{ fontSize: 11, background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: 100 }}>{c}</span>
                      ))}
                    </div>
                    {item.warnings.map((w, j) => (
                      <div key={j} style={{
                        marginTop: 8, background: '#FFF3E0', borderRadius: 8,
                        padding: '6px 10px', fontSize: 12, color: '#E65100'
                      }}>⚠️ {w}</div>
                    ))}
                  </div>
                </div>
              ))}

              {meal.shopping_list && (
                <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E0E0E0', marginTop: 4 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                    🛒 Liste de courses
                  </p>
                  {meal.shopping_list.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: i < meal.shopping_list!.length - 1 ? '0.5px solid #F5F5F5' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #2E7D32' }} />
                        <span style={{ fontSize: 14, color: '#1a1a1a' }}>{item.ingredient}</span>
                      </div>
                      <span style={{ fontSize: 13, color: '#888' }}>{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={generateMenu} disabled={generating} style={{
                width: '100%', padding: '14px', marginTop: 12,
                background: '#F8F9FA', color: '#2E7D32',
                border: '0.5px solid #2E7D32', borderRadius: 100,
                fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 20
              }}>
                {generating ? '✨ Génération...' : '↻ Générer d\'autres idées'}
              </button>
            </div>
          )}
        </div>
      )}

      <Navbar />
    </div>
  )
}