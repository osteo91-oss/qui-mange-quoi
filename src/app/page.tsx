'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { Meal } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: profile } = await supabase
        .from('profiles').select('name').eq('id', user.id).single()
      if (profile) setUserName(profile.name)
      const { data } = await supabase
        .from('meals').select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setMeals(data)
      setLoading(false)
    }
    load()
  }, [router])

  const handleDelete = async (mealId: string) => {
    setDeletingId(mealId)
    const { error } = await supabase.from('meals').delete().eq('id', mealId)
    if (error) {
      console.error('Erreur suppression:', error)
      setDeletingId(null)
      return
    }
    setMeals(prev => prev.filter(m => m.id !== mealId))
    setDeletingId(null)
    setConfirmId(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' }}>
      <img src="/logo-icon.png" alt="Logo" style={{ width: 64, marginBottom: 16, opacity: 0.5 }} />
      <p style={{ color: '#BBB', fontSize: 14 }}>Chargement...</p>
    </div>
  )

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F7F5F0', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'white',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
      }}>
        <img src="/logo-icon.png" alt="Logo" style={{ width: 38, height: 38 }} />
        <img src="/logo.png" alt="Qui mange quoi" style={{ height: 28 }} />
        <Link href="/profil">
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #43A047, #2A5230)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: 'white',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,110,63,0.3)'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>

      <div style={{ padding: '20px 16px 100px' }}>

        {/* Hero card */}
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 24,
          position: 'relative',
          boxShadow: '0 8px 32px rgba(59,110,63,0.2)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2A5230 0%, #43A047 50%, #4A8A4E 100%)',
            padding: '24px 24px 28px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 6px', fontWeight: 400 }}>
              {getGreeting()}, {userName} 👋
            </p>
            <p style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.3, letterSpacing: -0.5 }}>
              Prêt pour votre<br />prochain repas ?
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 20px' }}>
              {meals.length === 0 ? 'Créez votre premier repas' : `${meals.length} repas organisé${meals.length > 1 ? 's' : ''}`}
            </p>
            <Link href="/nouveau">
              <button style={{
                background: '#E8874A',
                color: 'white', border: 'none',
                borderRadius: 100, padding: '12px 24px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(232,135,74,0.4)',
                letterSpacing: 0.2
              }}>
                + Nouveau repas
              </button>
            </Link>

            {/* Decoration */}
            <div style={{
              position: 'absolute', right: -10, top: -10,
              width: 140, height: 140,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }} />
            <div style={{
              position: 'absolute', right: 20, top: 20,
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: 36 }}>🍽️</span>
            </div>
          </div>
        </div>

        {/* Section titre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#888', letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>
            Mes repas
          </p>
          <span style={{ fontSize: 12, color: '#BBB', fontWeight: 500 }}>{meals.length}</span>
        </div>

        {meals.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: '36px 24px',
            textAlign: 'center',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            border: '0.5px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🥗</div>
            <p style={{ fontWeight: 700, color: '#1B3A1E', marginBottom: 6, fontSize: 17 }}>
              Aucun repas encore
            </p>
            <p style={{ fontSize: 14, color: '#AAA', marginBottom: 24, lineHeight: 1.6 }}>
              Créez votre premier repas et invitez<br />vos convives en un clic.
            </p>
            <Link href="/nouveau">
              <button style={{
                background: '#43A047', color: 'white', border: 'none',
                borderRadius: 100, padding: '13px 32px',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59,110,63,0.3)'
              }}>
                + Créer un repas
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {meals.map(meal => (
              <div key={meal.id}>
                {confirmId === meal.id ? (
                  <div style={{
                    background: '#FEF0F0', borderRadius: 20, padding: '16px',
                    border: '0.5px solid #FFCDD2',
                    boxShadow: '0 2px 12px rgba(198,40,40,0.08)'
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#C62828', margin: '0 0 4px' }}>
                      Supprimer ce repas ?
                    </p>
                    <p style={{ fontSize: 13, color: '#888', margin: '0 0 14px' }}>
                      "{meal.name}" sera définitivement supprimé.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmId(null)} style={{
                        flex: 1, padding: '11px', borderRadius: 100,
                        border: '0.5px solid #E0DDD6', background: 'white',
                        fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#555'
                      }}>
                        Annuler
                      </button>
                      <button onClick={() => handleDelete(meal.id)} disabled={deletingId === meal.id} style={{
                        flex: 1, padding: '11px', borderRadius: 100,
                        border: 'none', background: '#C62828',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'white'
                      }}>
                        {deletingId === meal.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'white', borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                    border: '0.5px solid rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'stretch',
                  }}>
                    <Link href={`/repas/${meal.id}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: 16,
                        overflow: 'hidden', flexShrink: 0,
                        background: 'linear-gradient(135deg, #E8F0E8, #C8DEC8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {meal.photo_url
                          ? <img src={meal.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={meal.name} />
                          : <span style={{ fontSize: 26 }}>🍽️</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: '#1B3A1E', margin: '0 0 3px', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {meal.name}
                        </p>
                        {meal.date ? (
                          <p style={{ fontSize: 12, color: '#AAA', margin: 0, fontWeight: 400 }}>
                            📅 {new Date(meal.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        ) : (meal as any).date_mode === 'doodle' ? (
                          <p style={{ fontSize: 12, color: '#E8874A', margin: 0, fontWeight: 600 }}>
                            🗳️ Sondage en cours
                          </p>
                        ) : null}
                        {meal.ai_menu && (
                          <span style={{
                            display: 'inline-block', marginTop: 4,
                            fontSize: 11, background: '#E8F5E8',
                            color: '#2E7D32', padding: '2px 8px',
                            borderRadius: 100, fontWeight: 600
                          }}>✓ Menu prêt</span>
                        )}
                      </div>
                    </Link>
                    <button onClick={() => setConfirmId(meal.id)} style={{
                      background: 'transparent', border: 'none',
                      borderLeft: '0.5px solid rgba(0,0,0,0.05)',
                      padding: '0 16px', cursor: 'pointer',
                      color: '#DDD', fontSize: 18, flexShrink: 0
                    }}>🗑️</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}