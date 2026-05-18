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
    await supabase.from('meals').delete().eq('id', mealId)
    setMeals(meals.filter(m => m.id !== mealId))
    setDeletingId(null)
    setConfirmId(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' }}>
      <img src="/logo-icon.png" alt="Logo" style={{ width: 64, marginBottom: 16, opacity: 0.6 }} />
      <p style={{ color: '#AAA', fontSize: 14 }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F7F5F0', minHeight: '100vh' }}>

      <div style={{
        background: 'white', padding: '20px 20px 16px',
        borderBottom: '0.5px solid #E8E4DC',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <img src="/logo-icon.png" alt="Qui mange quoi" style={{ width: 40, height: 40 }} />
        <img src="/logo.png" alt="Qui mange quoi" style={{ height: 32 }} />
        <Link href="/profil">
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#E8F0E8', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#3B6E3F', cursor: 'pointer'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>

      <div style={{ padding: '20px 16px 100px' }}>

        <div style={{
          background: '#3B6E3F', borderRadius: 20, padding: '20px',
          marginBottom: 20, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 4px' }}>
              Bonjour {userName} 👋
            </p>
            <p style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.3 }}>
              Prêt pour votre<br />prochain repas ?
            </p>
            <Link href="/repas/nouveau">
              <button style={{
                background: '#E8874A', color: 'white', border: 'none',
                borderRadius: 100, padding: '10px 20px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>
                + Nouveau repas
              </button>
            </Link>
          </div>
          <img src="/logo-icon.png" alt="" style={{ width: 80, opacity: 0.15 }} />
        </div>

        <p style={{
          fontSize: 11, fontWeight: 600, color: '#AAA',
          letterSpacing: 1, textTransform: 'uppercase',
          marginBottom: 12, paddingLeft: 4
        }}>
          Mes repas ({meals.length})
        </p>

        {meals.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: 20, padding: 32,
            textAlign: 'center', border: '0.5px solid #E8E4DC'
          }}>
            <img src="/logo-icon.png" alt="" style={{ width: 56, marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: '#3B6E3F', marginBottom: 6, fontSize: 16 }}>
              Aucun repas encore
            </p>
            <p style={{ fontSize: 13, color: '#AAA', marginBottom: 20, lineHeight: 1.5 }}>
              Créez votre premier repas et invitez<br />vos convives en un clic.
            </p>
            <Link href="/repas/nouveau">
              <button style={{
                background: '#3B6E3F', color: 'white', border: 'none',
                borderRadius: 100, padding: '12px 28px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer'
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
                    border: '0.5px solid #FFCDD2'
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#C62828', margin: '0 0 4px' }}>
                      Supprimer ce repas ?
                    </p>
                    <p style={{ fontSize: 12, color: '#888', margin: '0 0 14px' }}>
                      "{meal.name}" sera définitivement supprimé.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmId(null)} style={{
                        flex: 1, padding: '10px', borderRadius: 100,
                        border: '0.5px solid #E0DDD6', background: 'white',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#555'
                      }}>
                        Annuler
                      </button>
                      <button onClick={() => handleDelete(meal.id)} disabled={deletingId === meal.id} style={{
                        flex: 1, padding: '10px', borderRadius: 100,
                        border: 'none', background: '#C62828',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'white'
                      }}>
                        {deletingId === meal.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'white', borderRadius: 20, padding: '16px',
                    border: '0.5px solid #E8E4DC',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <Link href={`/repas/${meal.id}`} style={{ textDecoration: 'none', flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: '#E8F0E8', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {meal.photo_url
                          ? <img src={meal.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={meal.name} />
                          : <img src="/logo-icon.png" alt="" style={{ width: 32 }} />
                        }
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1B3A1E', margin: 0, fontSize: 15 }}>
                          {meal.name}
                        </p>
                        {meal.date && (
                          <p style={{ fontSize: 12, color: '#AAA', margin: '3px 0 0' }}>
                            {new Date(meal.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        )}
                        {!(meal as any).date && (meal as any).date_mode === 'doodle' && (
                          <p style={{ fontSize: 12, color: '#3B6E3F', margin: '3px 0 0', fontWeight: 500 }}>
                            🗳️ Sondage en cours
                          </p>
                        )}
                      </div>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {meal.ai_menu && (
                        <span style={{
                          fontSize: 11, background: '#E8F0E8',
                          color: '#3B6E3F', padding: '4px 10px',
                          borderRadius: 100, fontWeight: 600
                        }}>Menu ✓</span>
                      )}
                      <button onClick={() => setConfirmId(meal.id)} style={{
                        background: '#FEF0F0', border: 'none', borderRadius: '50%',
                        width: 32, height: 32, fontSize: 14,
                        cursor: 'pointer', color: '#C62828',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>🗑️</button>
                    </div>
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