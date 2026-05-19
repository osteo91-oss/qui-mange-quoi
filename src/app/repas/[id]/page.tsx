'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import CompatScore from '@/components/CompatScore'
import Doodle from '@/components/Doodle'
import MenuBuilder from '@/components/MenuBuilder'
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
  const [suggestions, setSuggestions] = useState<any>(null)
  const [courses, setCourses] = useState({ apero: false, entree: true, plat: true, dessert: true })

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
    const text = `Tu es invité(e) au repas "${meal.name}" !\n\n👉 Rejoins-nous ici : ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const generateMenu = async () => {
    if (!meal || guests.length === 0) return
    setGenerating(true)
    setSuggestions(null)
    const res = await fetch('/api/generer-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests, mealName: meal.name, courses }),
    })
    const data = await res.json()
    if (data.suggestions) {
      setSuggestions(data.suggestions)
      await supabase.from('meals').update({ compatibility_score: data.compatibility_score }).eq('id', id)
      setMeal({ ...meal, compatibility_score: data.compatibility_score })
    }
    setGenerating(false)
  }

  const handleValidateMenu = async (
    selected: { course: string, dish: any }[],
    shoppingList: { ingredient: string, quantity: string, category: string }[]
  ) => {
    if (!meal) return
    const menu = selected.map(s => ({
      course: s.course as 'entrée' | 'plat' | 'dessert' | 'apéro',
      name: s.dish.name,
      description: s.dish.description,
      compatible_with: guests.map(g => g.name),
      warnings: s.dish.warnings,
    }))
    await supabase.from('meals').update({ ai_menu: menu, shopping_list: shoppingList }).eq('id', id)
    setMeal({ ...meal, ai_menu: menu, shopping_list: shoppingList })
    setSuggestions(null)
  }

  if (!meal) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F0F7F0' }}>
      <p style={{ color: '#AAA' }}>Chargement...</p>
    </div>
  )

  const allAllergies = [...new Set(guests.flatMap(g => g.allergies))]
  const allDislikes = [...new Set(guests.flatMap(g => g.dislikes))]
  const dateMode = (meal as any).date_mode || 'fixed'
  const tabs = isOrganizer
    ? ['invites', 'dates', 'synthese', 'menus'] as const
    : ['dates'] as const
  const tabLabels: Record<string, string> = {
    invites: '👥 Invités',
    dates: dateMode === 'doodle' ? '🗳️ Dates' : '📅 Date',
    synthese: '📊 Synthèse',
    menus: '✨ Menus',
  }
  const tabColors: Record<string, string> = {
    invites: '#43A047',
    dates: dateMode === 'doodle' ? '#F57C00' : '#1976D2',
    synthese: '#7B1FA2',
    menus: '#E65100',
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F0F7F0', minHeight: '100vh' }}>

      {/* Header avec photo */}
      <div style={{ position: 'relative' }}>
        {meal.photo_url ? (
          <div style={{ position: 'relative', height: 200 }}>
            <img src={meal.photo_url} alt={meal.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
            }} />
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => router.push('/')} style={{
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                border: 'none', borderRadius: '50%', width: 36, height: 36,
                fontSize: 18, cursor: 'pointer', color: 'white'
              }}>‹</button>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 18, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {meal.name}
                </p>
                {!isOrganizer && (
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '2px 0 0' }}>
                    Vous êtes invité(e) 🎉
                  </p>
                )}
              </div>
              {isOrganizer && (
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const { compressImage } = await import('@/lib/compress')
                      const compressed = await compressImage(file, 800, 0.75)
                      const fileName = `${Date.now()}.jpg`
                      const { error } = await supabase.storage.from('meals').upload(fileName, compressed, { upsert: true })
                      if (!error) {
                        const { data } = supabase.storage.from('meals').getPublicUrl(fileName)
                        await supabase.from('meals').update({ photo_url: data.publicUrl }).eq('id', id)
                        setMeal({ ...meal, photo_url: data.publicUrl })
                      }
                    }}
                  />
                  <div style={{
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    borderRadius: '50%', width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, cursor: 'pointer'
                  }}>📷</div>
                </label>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #1B5E20, #43A047)',
            padding: '20px 16px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => router.push('/')} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                fontSize: 18, cursor: 'pointer', color: 'white'
              }}>‹</button>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>{meal.name}</h1>
                {!isOrganizer && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>
                    Vous êtes invité(e) 🎉
                  </p>
                )}
              </div>
              {isOrganizer && (
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const { compressImage } = await import('@/lib/compress')
                      const compressed = await compressImage(file, 800, 0.75)
                      const fileName = `${Date.now()}.jpg`
                      const { error } = await supabase.storage.from('meals').upload(fileName, compressed, { upsert: true })
                      if (!error) {
                        const { data } = supabase.storage.from('meals').getPublicUrl(fileName)
                        await supabase.from('meals').update({ photo_url: data.publicUrl }).eq('id', id)
                        setMeal({ ...meal, photo_url: data.publicUrl })
                      }
                    }}
                  />
                  <div style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none',
                    borderRadius: '50%', width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, cursor: 'pointer'
                  }}>📷</div>
                </label>
              )}
            </div>
          </div>
        )}
        {/* Tabs */}
        <div style={{
          background: 'white', padding: '12px 16px',
          display: 'flex', gap: 8, overflowX: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: 100,
              border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: activeTab === tab ? tabColors[tab] : '#F5F5F5',
              color: activeTab === tab ? 'white' : '#888',
              boxShadow: activeTab === tab ? `0 2px 8px ${tabColors[tab]}50` : 'none'
            }}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* Tab Invités */}
        {activeTab === 'invites' && isOrganizer && (
          <div>
            <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                Inviter des convives
              </p>
              <p style={{ fontSize: 13, color: '#AAA', marginBottom: 10, lineHeight: 1.5 }}>
                Partagez ce lien — vos invités pourront voter pour les dates et renseigner leur profil alimentaire.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/rejoindre/${meal.invite_token}`}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid #E8E8E8', fontSize: 11,
                    color: '#AAA', background: '#F8F8F8', outline: 'none'
                  }}
                />
                <button onClick={copyInviteLink} style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: copied ? '#388E3C' : '#43A047',
                  color: 'white', border: 'none', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(67,160,71,0.3)'
                }}>
                  {copied ? '✓' : 'Copier'}
                </button>
              </div>
              <button onClick={shareWhatsApp} style={{
                width: '100%', padding: '11px',
                background: '#25D366', color: 'white',
                border: 'none', borderRadius: 12,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
                marginBottom: 8
              }}>
                <span>📱</span> Envoyer via WhatsApp
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder="Email de l'invité..."
                  id="invite-email"
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid #E8E8E8', fontSize: 13,
                    outline: 'none', background: '#F8F8F8', color: '#1a1a1a'
                  }}
                />
                <button onClick={async () => {
                  const emailInput = document.getElementById('invite-email') as HTMLInputElement
                  const email = emailInput?.value
                  if (!email) return
                  const link = `${window.location.origin}/rejoindre/${meal.invite_token}`
                  const { data: { user } } = await supabase.auth.getUser()
                  const { data: profile } = await supabase.from('profiles').select('name').eq('id', user?.id).single()
                  await fetch('/api/envoyer-invitation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      guestEmail: email,
                      guestName: email.split('@')[0],
                      organizerName: profile?.name || 'Un ami',
                      mealName: meal.name,
                      inviteLink: link
                    })
                  })
                  emailInput.value = ''
                  alert(`Invitation envoyée à ${email} !`)
                }} style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: '#1976D2', color: 'white',
                  border: 'none', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(25,118,210,0.3)'
                }}>
                  📧 Email
                </button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Invités ({guests.length})
              </p>
              {guests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>👥</p>
                  <p style={{ fontSize: 13, color: '#AAA' }}>Partagez le lien pour inviter vos convives</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {guests.map((g, i) => (
                    <div key={g.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < guests.length - 1 ? '1px solid #F5F5F5' : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: '#E8F5E9', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 800, color: '#43A047',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}>
                          {(g as any).avatar_url
                            ? <img src={(g as any).avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={g.name} />
                            : g.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#1B5E20', margin: 0 }}>{g.name}</p>
                          {g.diets.length > 0 && (
                            <span style={{ fontSize: 11, background: '#E8F5E9', color: '#43A047', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                              {g.diets[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      {g.allergies.length > 0 && (
                        <span style={{ fontSize: 11, background: '#FFEBEE', color: '#E53935', padding: '3px 8px', borderRadius: 100, fontWeight: 700 }}>
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
              background: '#43A047', color: 'white',
              border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(67,160,71,0.4)'
            }}>
              {dateMode === 'doodle' ? 'Gérer le sondage →' : 'Voir la date →'}
            </button>
          </div>
        )}

        {/* Tab Dates */}
        {activeTab === 'dates' && (
          <div>
            {dateMode === 'fixed' ? (
              <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                  📅 Date du repas
                </p>
                {meal.date ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                      boxShadow: '0 2px 8px rgba(25,118,210,0.2)'
                    }}>📅</div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#1B5E20', margin: 0, textTransform: 'capitalize' }}>
                        {new Date(meal.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {(meal as any).time && <p style={{ fontSize: 13, color: '#AAA', margin: '4px 0 0' }}>🕐 {(meal as any).time}</p>}
                      {(meal as any).place && <p style={{ fontSize: 13, color: '#AAA', margin: '4px 0 0' }}>📍 {(meal as any).place}</p>}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center', padding: '12px 0' }}>Aucune date définie</p>
                )}
              </div>
            ) : (
              <>
                {!isOrganizer && (
                  <div style={{
                    background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                    borderRadius: 16, padding: '14px 16px',
                    marginBottom: 12, display: 'flex', gap: 10, alignItems: 'flex-start',
                    border: '1px solid #FFE0B2'
                  }}>
                    <span style={{ fontSize: 22 }}>🗳️</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#E65100', margin: 0 }}>
                        Indiquez vos disponibilités
                      </p>
                      <p style={{ fontSize: 12, color: '#F57C00', margin: '2px 0 0' }}>
                        L'organisateur choisira la meilleure date.
                      </p>
                    </div>
                  </div>
                )}
                <Doodle mealId={id} isOrganizer={isOrganizer} />
              </>
            )}
            {isOrganizer && guests.length > 0 && (
              <button onClick={() => setActiveTab('synthese')} style={{
                width: '100%', padding: '14px', marginTop: 12,
                background: '#7B1FA2', color: 'white',
                border: 'none', borderRadius: 100,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(123,31,162,0.3)'
              }}>
                Voir la synthèse →
              </button>
            )}
          </div>
        )}

        {/* Tab Synthèse */}
        {activeTab === 'synthese' && isOrganizer && (
          <div>
            <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12 }}>
              <CompatScore score={meal.compatibility_score || Math.max(60, Math.round(100 - (allAllergies.length + allDislikes.length) * 5))} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#43A047', margin: 0 }}>{guests.length}</p>
                  <p style={{ fontSize: 11, color: '#AAA', margin: 0, fontWeight: 600 }}>invités</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#1976D2', margin: 0 }}>
                    {guests.reduce((acc, g) => acc + g.cuisines.length + g.diets.length, 0)}
                  </p>
                  <p style={{ fontSize: 11, color: '#AAA', margin: 0, fontWeight: 600 }}>préférences</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#E53935', margin: 0 }}>{allAllergies.length}</p>
                  <p style={{ fontSize: 11, color: '#AAA', margin: 0, fontWeight: 600 }}>contraintes</p>
                </div>
              </div>
            </div>

            {(allAllergies.length > 0 || allDislikes.length > 0) && (
              <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                  À prendre en compte
                </p>
                {guests.filter(g => g.allergies.length > 0 || g.dislikes.length > 0).map(g => (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    background: '#FFF8E1', borderRadius: 10, padding: '8px 12px', marginBottom: 8,
                    border: '1px solid #FFE082'
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F57C00', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{g.name}</p>
                      {g.allergies.length > 0 && <p style={{ fontSize: 12, color: '#E53935', margin: '2px 0 0', fontWeight: 600 }}>⚠️ Allergie : {g.allergies.join(', ')}</p>}
                      {g.dislikes.length > 0 && <p style={{ fontSize: 12, color: '#F57C00', margin: '2px 0 0' }}>N'aime pas : {g.dislikes.join(', ')}</p>}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {allAllergies.map(a => (
                    <span key={a} style={{ fontSize: 12, background: '#FFEBEE', color: '#E53935', padding: '4px 10px', borderRadius: 100, fontWeight: 700 }}>{a}</span>
                  ))}
                  {allDislikes.map(d => (
                    <span key={d} style={{ fontSize: 12, background: '#FFF3E0', color: '#F57C00', padding: '4px 10px', borderRadius: 100, fontWeight: 600 }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setActiveTab('menus')} style={{
              width: '100%', padding: '14px',
              background: '#E65100', color: 'white',
              border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(230,81,0,0.4)'
            }}>
              Composer le menu →
            </button>
          </div>
        )}

        {/* Tab Menus */}
        {activeTab === 'menus' && isOrganizer && (
          <div>
            {!suggestions && !meal.ai_menu && (
              <div style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#1B5E20', marginBottom: 6 }}>Composer le menu</p>
                <p style={{ fontSize: 12, color: '#AAA', marginBottom: 20 }}>Choisissez les cours que vous souhaitez servir.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { key: 'apero', label: '🥂 Apéritif', desc: 'Amuse-bouches et boissons', color: '#7B1FA2', bg: '#F3E5F5' },
                    { key: 'entree', label: '🥗 Entrée', desc: 'Salade, soupe, verrines...', color: '#1976D2', bg: '#E3F2FD' },
                    { key: 'plat', label: '🍽️ Plat principal', desc: 'Viande, poisson, végétarien...', color: '#43A047', bg: '#E8F5E9' },
                    { key: 'dessert', label: '🍮 Dessert', desc: 'Gâteau, fruits, glace...', color: '#F57C00', bg: '#FFF3E0' },
                  ].map(({ key, label, desc, color, bg }) => (
                    <div key={key} onClick={() => setCourses({ ...courses, [key]: !courses[key as keyof typeof courses] })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                        background: courses[key as keyof typeof courses] ? bg : '#F8F8F8',
                        border: courses[key as keyof typeof courses] ? `1.5px solid ${color}` : '1.5px solid #E8E8E8'
                      }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: courses[key as keyof typeof courses] ? color : '#555', margin: 0 }}>{label}</p>
                        <p style={{ fontSize: 11, color: '#AAA', margin: '2px 0 0' }}>{desc}</p>
                      </div>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: courses[key as keyof typeof courses] ? color : 'white',
                        border: courses[key as keyof typeof courses] ? 'none' : '1.5px solid #DDD',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {courses[key as keyof typeof courses] && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={generateMenu} disabled={generating || !Object.values(courses).some(Boolean)} style={{
                  width: '100%', padding: '14px',
                  background: generating ? '#AAA' : '#E65100',
                  color: 'white', border: 'none', borderRadius: 100,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(230,81,0,0.4)'
                }}>
                  {generating ? '✨ Génération en cours...' : '✨ Générer les propositions'}
                </button>
              </div>
            )}

            {suggestions && !meal.ai_menu && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                  borderRadius: 16, padding: '12px 16px', marginBottom: 16,
                  display: 'flex', gap: 10, alignItems: 'center',
                  border: '1px solid #FFE0B2'
                }}>
                  <span style={{ fontSize: 20 }}>👇</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#E65100', margin: 0 }}>Choisissez vos plats préférés</p>
                    <p style={{ fontSize: 12, color: '#F57C00', margin: '2px 0 0' }}>3 propositions par cours — sélectionnez 1 par cours.</p>
                  </div>
                </div>
                <MenuBuilder suggestions={suggestions} onValidate={handleValidateMenu} />
                <button onClick={() => setSuggestions(null)} style={{
                  width: '100%', padding: '12px', marginTop: 8,
                  background: '#F8F8F8', color: '#888',
                  border: '1.5px solid #E8E8E8', borderRadius: 100,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>
                  ↩ Recommencer
                </button>
              </div>
            )}

            {meal.ai_menu && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                  borderRadius: 16, padding: '12px 16px', marginBottom: 16,
                  display: 'flex', gap: 10, alignItems: 'center',
                  border: '1px solid #A5D6A7'
                }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#2E7D32', margin: 0 }}>
                    Menu validé — {meal.ai_menu.length} cours
                  </p>
                </div>

                {meal.ai_menu.map((item, i) => (
                  <div key={i} style={{
                    background: 'white', borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 10
                  }}>
                    <div style={{
                      height: 60, background: item.course === 'entrée' ? '#E8F5E9' : item.course === 'plat' ? '#E3F2FD' : item.course === 'apéro' ? '#F3E5F5' : '#FFF3E0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
                    }}>
                      {item.course === 'entrée' ? '🥗' : item.course === 'plat' ? '🍽️' : item.course === 'apéro' ? '🥂' : '🍮'}
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#AAA', textTransform: 'uppercase', letterSpacing: 1 }}>{item.course}</span>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1B5E20', margin: '3px 0 4px' }}>{item.name}</p>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{item.description}</p>
                    </div>
                  </div>
                ))}

                {meal.shopping_list && (
                  <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 4 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                      🛒 Liste de courses ({guests.length} personnes)
                    </p>
                    {meal.shopping_list.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '9px 0',
                        borderBottom: i < meal.shopping_list!.length - 1 ? '1px solid #F5F5F5' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #43A047' }} />
                          <span style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{item.ingredient}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#AAA', fontWeight: 600 }}>{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => {
                  setMeal({ ...meal, ai_menu: null, shopping_list: null })
                  setSuggestions(null)
                }} style={{
                  width: '100%', padding: '12px', marginTop: 12,
                  background: '#F8F8F8', color: '#888',
                  border: '1.5px solid #E8E8E8', borderRadius: 100,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20
                }}>
                  ↩ Recomposer le menu
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