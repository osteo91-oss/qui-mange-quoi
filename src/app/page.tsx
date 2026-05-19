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
  const [userAvatar, setUserAvatar] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/landing'); return }
      const { data: profile } = await supabase
        .from('profiles').select('name, avatar_url').eq('id', user.id).single()
      if (profile) { setUserName(profile.name); setUserAvatar(profile.avatar_url || '') }
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
    if (error) { setDeletingId(null); return }
    setMeals(prev => prev.filter(m => m.id !== mealId))
    setDeletingId(null)
    setConfirmId(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F1F8F1' }}>
      <p style={{ color: '#AAA', fontSize: 14 }}>Chargement...</p>
    </div>
  )

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F1F8F1', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: '#2E7D32' }}>Qui mange </span>
          <span style={{ color: '#F57C00' }}>quoi</span>
        </div>
        <Link href="/profil">
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #43A047, #2E7D32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: 'white',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(67,160,71,0.4)'
          }}>
            {userAvatar
              ? <img src={userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={userName} />
              : userName.charAt(0).toUpperCase()
            }
          </div>
        </Link>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* Hero card */}
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          marginBottom: 20,
          boxShadow: '0 8px 32px rgba(46,125,50,0.25)',
          background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 60%, #66BB6A 100%)',
          padding: '22px 22px 26px',
          position: 'relative'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 4px' }}>
            {getGreeting()}, {userName} 👋
          </p>
          <p style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', lineHeight: 1.25, letterSpacing: -0.5 }}>
            Prêt pour votre<br />prochain repas ?
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '0 0 18px' }}>
            {meals.length === 0 ? 'Créez votre premier repas' : `${meals.length} repas organisé${meals.length > 1 ? 's' : ''}`}
          </p>
          <Link href="/nouveau">
            <button style={{
              background: '#F57C00', color: 'white', border: 'none',
              borderRadius: 100, padding: '11px 22px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245,124,0,0.5)'
            }}>
              + Nouveau repas
            </button>
          </Link>
          <div style={{
            position: 'absolute', right: 16, top: 16,
            fontSize: 64, opacity: 0.15
          }}>🍽️</div>
        </div>

        {/* Stats row */}
        {meals.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Repas', value: meals.length, color: '#43A047', bg: '#E8F5E9' },
              { label: 'Avec menu', value: meals.filter(m => m.ai_menu).length, color: '#F57C00', bg: '#FFF3E0' },
              { label: 'Sondages', value: meals.filter(m => (m as any).date_mode === 'doodle').length, color: '#1976D2', bg: '#E3F2FD' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'white', borderRadius: 16, padding: '12px 14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                border: `1px solid ${stat.bg}`
              }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: '#AAA', margin: '2px 0 0', fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Section titre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>
            Mes repas
          </p>
          <span style={{ fontSize: 12, color: '#BBB', fontWeight: 600 }}>{meals.length}</span>
        </div>

        {meals.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 24, padding: '40px 24px',
            textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🥗</div>
            <p style={{ fontWeight: 800, color: '#1B5E20', marginBottom: 6, fontSize: 18 }}>
              Aucun repas encore
            </p>
            <p style={{ fontSize: 14, color: '#AAA', marginBottom: 24, lineHeight: 1.6 }}>
              Créez votre premier repas et invitez<br />vos convives en un clic.
            </p>
            <Link href="/nouveau">
              <button style={{
                background: '#43A047', color: 'white', border: 'none',
                borderRadius: 100, padding: '13px 32px',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(67,160,71,0.4)'
              }}>
                + Créer un repas
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {meals.map(meal => (
              <div key={meal.id}>
                {confirmId === meal.id ? (
                  <div style={{
                    background: '#FEF0F0', borderRadius: 20, padding: '16px',
                    border: '1px solid #FFCDD2',
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
                        border: '1px solid #E0E0E0', background: 'white',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#555'
                      }}>Annuler</button>
                      <button onClick={() => handleDelete(meal.id)} disabled={deletingId === meal.id} style={{
                        flex: 1, padding: '11px', borderRadius: 100,
                        border: 'none', background: '#E53935',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer', color: 'white'
                      }}>
                        {deletingId === meal.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'white', borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    display: 'flex', alignItems: 'stretch',
                  }}>
                    <Link href={`/repas/${meal.id}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                      <div style={{
                        width: 58, height: 58, borderRadius: 16,
                        overflow: 'hidden', flexShrink: 0,
                        background: '#E8F5E9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {meal.photo_url
                          ? <img src={meal.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={meal.name} />
                          : <span style={{ fontSize: 28 }}>🍽️</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: '#1B5E20', margin: '0 0 4px', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {meal.name}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {meal.date && (
                            <span style={{ fontSize: 11, background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                              📅 {new Date(meal.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {!(meal as any).date && (meal as any).date_mode === 'doodle' && (
                            <span style={{ fontSize: 11, background: '#FFF3E0', color: '#F57C00', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                              🗳️ Sondage en cours
                            </span>
                          )}
                          {meal.ai_menu && (
                            <span style={{ fontSize: 11, background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                              ✓ Menu prêt
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button onClick={() => setConfirmId(meal.id)} style={{
                      background: 'transparent', border: 'none',
                      borderLeft: '1px solid #F5F5F5',
                      padding: '0 16px', cursor: 'pointer',
                      color: '#E0E0E0', fontSize: 18, flexShrink: 0
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