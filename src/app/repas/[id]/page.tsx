'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import CompatScore from '@/components/CompatScore'
import Doodle from '@/components/Doodle'
import type { Meal, Profile } from '@/lib/types'

export default function RepasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [guests, setGuests] = useState<Profile[]>([])
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [activeTab, setActiveTab] = useState<'invites' | 'dates' | 'synthese' | 'menus'>('dates')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: mealData } = await supabase
        .from('meals').select('*').eq('id', id).single()
      setMeal(mealData)

      if (user && mealData) {
        const organizer = mealData.organizer_id === user.id
        setIsOrganizer(organizer)
        setActiveTab(organizer ? 'invites' : 'dates')
      }

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

  const shareWhatsApp = () => {
    if (!meal) return
    const link = `${window.location.origin}/rejoindre/${meal.invite_token}`
    const text = `Tu es invité(e) au repas "${meal.name}" !\n\n👉 Rejoins-nous, indique tes disponibilités et ton profil alimentaire ici : ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' }}>
      <img src="/logo-icon.png" alt="Logo" style={{ width: 56, marginBottom: 12, opacity: 0.5 }} />
      <p style={{ color: '#AAA' }}>Chargement...</p>
    </div>
  )

  const allAllergies = [...new Set(guests.flatMap(g => g.allergies))]
  const allDislikes = [...new Set(guests.flatMap(g => g.dislikes))]

  const organizerTabs = ['invites', 'dates', 'synthese', 'menus'] as const
  const guestTabs = ['dates'] as const

  const tabs = isOrganizer ? organizerTabs : guestTabs

  const tabLabels: Record<string, string> = {
    invites: '👥 Invités',
    dates: '🗓️ Dates',
    synthese: '📊 Synthèse',
    menus: '✨ Menus',
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F7F5F0', minHeight: '100vh' }}>

      <div style={{ background: 'white', borderBottom: '0.5px solid #E8E4DC' }}>
        {meal.photo_url ? (
          <div style={{ position: 'relative' }}>
            <img src={meal.photo_url} alt={meal.name}
              style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
              padding: '16px',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <button onClick={() => router.push('/')} style={{
                background: 'rgba(255,255,255,0.9)', border: 'none',
                borderRadius: '50%', width: 34, height: 34,
                fontSize: 18, cursor: 'pointer', color: '#333'
              }}>‹</button>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                  {meal.name}
                </p>
                {!isOrganizer && (
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '2px 0 0' }}>
                    Vous êtes invité(e) 🎉
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/')} style={{
              background: '#F7F5F0', border: 'none', borderRadius: '50%',
              width: 36, height: 36, fontSize: 20, cursor: 'pointer', color: '#555'
            }}>‹</button>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1B3A1E', margin: 0 }}>{meal.name}</h1>
              {!isOrganizer && (
                <p style={{ fontSize: 12, color: '#3B6E3F', margin: '2px 0 0', fontWeight: 500 }}>
                  Vous êtes invité(e) 🎉
                </p>
              )}
            </div>
          </div>
        )}

        <div style={{ padding: '12px 16px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 100,
              border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: activeTab === tab ? '#3B6E3F' : '#F7F5F0',
              color: activeTab === tab ? 'white' : '#888'
            }}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {activeTab === 'invites' && isOrganizer && (
          <div>
            <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E8E4DC', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                Inviter des convives
              </p>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 1.5 }}>
                Partagez ce lien — vos invités pourront indiquer leurs disponibilités et leur profil alimentaire.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/rejoindre/${meal.invite_token}`}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10,
                    border: '0.5px solid #E0DDD6', fontSize: 11,
                    color: '#AAA', background: '#F7F5F0', outline: 'none'
                  }}
                />
                <button onClick={copyInviteLink} style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: copied ? '#388E3C' : '#3B6E3F',
                  color: 'white', border: 'none', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', flexShrink: 0
                }}>
                  {copied ? '✓' : 'Copier'}
                </button>
              </div>
              <button onClick={shareWhatsApp} style={{
                width: '100%', padding: '10px',
                background: '#25D366', color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <span>📱</span> Envoyer via WhatsApp
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E8E4DC', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                Invités ({guests.length})
              </p>
              {guests.length === 0 ? (
                <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center', padding: '12px 0' }}>
                  Partagez le lien pour inviter vos convives 👆
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {guests.map((g, i) => (
                    <div key={g.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < guests.length - 1 ? '0.5px solid #F5F5F5' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: '#E8F0E8', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, fontWeight: 700, color: '#3B6E3F'
                        }}>
                          {(g as any).avatar_url
                            ? <img src={(g as any).avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={g.name} />
                            : g.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{g.name}</p>
                          {g.diets.length > 0 && (
                            <p style={{ fontSize: 11, color: '#3B6E3F', margin: '2px 0 0' }}>{g.diets.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      {g.allergies.length > 0 && (
                        <span style={{
                          fontSize: 11, background: '#FFEBEE',
                          color: '#C62828', padding: '3px 8px',
                          borderRadius: 100, fontWeight: 500
                        }}>
                          ⚠️ {g.allergies.length}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setActiveTab('dates')} style={{
              width: '100%', padding: '14px',
              background: '#3B6E3F', color: 'white',
              border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              Gérer les dates →
            </button>
          </div>
        )}

        {activeTab === 'dates' && (
          <div>
            {!isOrganizer && (
              <div style={{
                background: '#E8F0E8', borderRadius: 14, padding: '12px 16px',
                marginBottom: 12, display: 'flex', gap: 10, alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: 20 }}>🗓️</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1B3A1E', margin: 0 }}>
                    Indiquez vos disponibilités
                  </p>
                  <p style={{ fontSize: 12, color: '#5A8A5C', margin: '2px 0 0' }}>
                    L'organisateur choisira la meilleure date pour tous.
                  </p>
                </div>
              </div>
            )}
            <Doodle mealId={id} isOrganizer={isOrganizer} />
            {isOrganizer && guests.length > 0 && (
              <button onClick={() => setActiveTab('synthese')} style={{
                width: '100%', padding: '14px', marginTop: 8,
                background: '#3B6E3F', color: 'white',
                border: 'none', borderRadius: 100,
                fontSize: 15, fontWeight: 600, cursor: 'pointer'
              }}>
                Voir la synthèse →
              </button>
            )}
          </div>
        )}

        {activeTab === 'synthese' && isOrganizer && (
          <div>
            <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E8E4DC', marginBottom: 12 }}>
              <CompatScore score={meal.compatibility_score || Math.max(60, Math.round(100 - (allAllergies.length + allDislikes.length) * 5))} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#1B3A1E', margin: 0 }}>{guests.length}</p>
                  <p style={{ fontSize: 11, color: '#AAA', margin: 0 }}>invités</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#1B3A1E', margin: 0 }}>
                    {guests.reduce((acc, g) => acc + g.cuisines.length + g.diets.length, 0)}
                  </p>
                  <p style={{ fontSize: 11, color: '#AAA', margin: 0 }}>préférences</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#C62828', margin: 0 }}>{allAllergies.length}</p>
                  <p style={{ fontSize: 11, color: '#AAA', margin: 0 }}>contraintes</p>
                </div>
              </div>
            </div>

            {(allAllergies.length > 0 || allDislikes.length > 0) && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E8E4DC', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                  À prendre en compte
                </p>
                {guests.filter(g => g.allergies.length > 0 || g.dislikes.length > 0).map(g => (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    background: '#FFF8E1', borderRadius: 10,
                    padding: '8px 12px', marginBottom: 8
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E65100', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{g.name}</p>
                      {g.allergies.length > 0 && <p style={{ fontSize: 12, color: '#C62828', margin: '2px 0 0' }}>Allergie : {g.allergies.join(', ')}</p>}
                      {g.dislikes.length > 0 && <p style={{ fontSize: 12, color: '#E65100', margin: '2px 0 0' }}>N'aime pas : {g.dislikes.join(', ')}</p>}
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', margin: '12px 0 8px' }}>
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

            <button onClick={() => setActiveTab('menus')} style={{
              width: '100%', padding: '14px',
              background: '#E8874A', color: 'white',
              border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              Composer le menu →
            </button>
          </div>
        )}

        {activeTab === 'menus' && isOrganizer && (
          <div>
            {!meal.ai_menu ? (
              <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #E8E4DC' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1B3A1E', marginBottom: 16 }}>
                  Composer le menu
                </p>

                <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                  Que souhaitez-vous servir ?
                </p>

                <button onClick={generateMenu} disabled={generating} style={{
                  width: '100%', padding: '14px',
                  background: generating ? '#888' : '#E8874A',
                  color: 'white', border: 'none', borderRadius: 100,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer'
                }}>
                  {generating ? '✨ Génération en cours...' : '✨ Générer le menu avec l\'IA'}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: '#AAA', marginBottom: 12 }}>
                  {meal.ai_menu.length} plats suggérés
                </p>
                {meal.ai_menu.map((item, i) => (
                  <div key={i} style={{
                    background: 'white', borderRadius: 16, overflow: 'hidden',
                    border: '0.5px solid #E8E4DC', marginBottom: 10
                  }}>
                    <div style={{
                      height: 70, background: '#E8F0E8',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 32
                    }}>
                      {item.course === 'entrée' ? '🥗' : item.course === 'plat' ? '🍽️' : item.course === 'apéro' ? '🥂' : '🍮'}
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: 11, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>{item.course}</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#1B3A1E', margin: '0 0 4px' }}>{item.name}</p>
                      <p style={{ fontSize: 13, color: '#888', margin: '0 0 8px' }}>{item.description}</p>
                      {item.warnings.map((w, j) => (
                        <div key={j} style={{ marginTop: 6, background: '#FFF3E0', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#E65100' }}>
                          ⚠️ {w}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {meal.shopping_list && (
                  <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '0.5px solid #E8E4DC', marginTop: 4 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                      🛒 Liste de courses
                    </p>
                    {meal.shopping_list.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: i < meal.shopping_list!.length - 1 ? '0.5px solid #F5F5F5' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #3B6E3F' }} />
                          <span style={{ fontSize: 14, color: '#1a1a1a' }}>{item.ingredient}</span>
                        </div>
                        <span style={{ fontSize: 13, color: '#AAA' }}>{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={generateMenu} disabled={generating} style={{
                  width: '100%', padding: '14px', marginTop: 12,
                  background: '#F7F5F0', color: '#3B6E3F',
                  border: '0.5px solid #3B6E3F', borderRadius: 100,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 20
                }}>
                  {generating ? '✨ Génération...' : '↻ Générer d\'autres idées'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}