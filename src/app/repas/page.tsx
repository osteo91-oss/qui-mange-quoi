'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { Meal } from '@/lib/types'

export default function RepasListPage() {
  const router = useRouter()
  const [mealsOrganized, setMealsOrganized] = useState<Meal[]>([])
  const [mealsInvited, setMealsInvited] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'organise' | 'invite'>('organise')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: organized } = await supabase
        .from('meals').select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })
      if (organized) setMealsOrganized(organized)

      const { data: guestData } = await supabase
        .from('meal_guests')
        .select('meal_id, meals(*)')
        .eq('profile_id', user.id)
      if (guestData) {
        const invitedMeals = guestData
          .map((g: any) => g.meals)
          .filter((m: any) => m && m.organizer_id !== user.id)
        setMealsInvited(invitedMeals)
      }

      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F0F7F0' }}>
      <p style={{ color: '#AAA' }}>Chargement...</p>
    </div>
  )

  const MealCard = ({ meal }: { meal: Meal }) => (
    <Link href={`/repas/${meal.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 10,
        display: 'flex', alignItems: 'stretch'
      }}>
        <div style={{
          width: 70, height: 70, flexShrink: 0,
          background: '#E8F5E9', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {meal.photo_url
            ? <img src={meal.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={meal.name} />
            : <span style={{ fontSize: 30 }}>🍽️</span>
          }
        </div>
        <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: '#1B5E20', margin: '0 0 4px', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meal.name}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {meal.date && (
              <span style={{ fontSize: 11, background: '#E3F2FD', color: '#1976D2', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                📅 {new Date(meal.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {!(meal as any).date && (meal as any).date_mode === 'doodle' && (
              <span style={{ fontSize: 11, background: '#FFF3E0', color: '#F57C00', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                🗳️ Sondage en cours
              </span>
            )}
            {meal.ai_menu && (
              <span style={{ fontSize: 11, background: '#E8F5E9', color: '#43A047', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                ✓ Menu prêt
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', color: '#DDD', fontSize: 20 }}>›</div>
      </div>
    </Link>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F0F7F0', minHeight: '100vh' }}>

      <div style={{
        background: 'white', padding: '16px 20px',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: '#2E7D32' }}>Mes </span>
          <span style={{ color: '#F57C00' }}>repas</span>
        </div>
        <Link href="/nouveau">
          <button style={{
            background: '#43A047', color: 'white', border: 'none',
            borderRadius: 100, padding: '8px 16px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(67,160,71,0.3)'
          }}>+ Nouveau</button>
        </Link>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        <div style={{
          display: 'flex', background: 'white',
          borderRadius: 16, padding: 4, marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <button onClick={() => setActiveTab('organise')} style={{
            flex: 1, padding: '10px 0', borderRadius: 12,
            border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'organise' ? '#43A047' : 'transparent',
            color: activeTab === 'organise' ? 'white' : '#AAA',
            boxShadow: activeTab === 'organise' ? '0 2px 8px rgba(67,160,71,0.3)' : 'none'
          }}>
            🍽️ J'organise ({mealsOrganized.length})
          </button>
          <button onClick={() => setActiveTab('invite')} style={{
            flex: 1, padding: '10px 0', borderRadius: 12,
            border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'invite' ? '#F57C00' : 'transparent',
            color: activeTab === 'invite' ? 'white' : '#AAA',
            boxShadow: activeTab === 'invite' ? '0 2px 8px rgba(245,124,0,0.3)' : 'none'
          }}>
            👥 Invité(e) ({mealsInvited.length})
          </button>
        </div>

        {activeTab === 'organise' && (
          <div>
            {mealsOrganized.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: 24, padding: '40px 24px',
                textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
                <p style={{ fontWeight: 800, color: '#1B5E20', marginBottom: 6, fontSize: 17 }}>
                  Aucun repas organisé
                </p>
                <p style={{ fontSize: 14, color: '#AAA', marginBottom: 24, lineHeight: 1.6 }}>
                  Créez votre premier repas et invitez vos convives.
                </p>
                <Link href="/nouveau">
                  <button style={{
                    background: '#43A047', color: 'white', border: 'none',
                    borderRadius: 100, padding: '13px 28px',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(67,160,71,0.3)'
                  }}>+ Créer un repas</button>
                </Link>
              </div>
            ) : (
              mealsOrganized.map(meal => <MealCard key={meal.id} meal={meal} />)
            )}
          </div>
        )}

        {activeTab === 'invite' && (
          <div>
            {mealsInvited.length === 0 ? (
              <div style={{
                background: 'white', borderRadius: 24, padding: '40px 24px',
                textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <p style={{ fontWeight: 800, color: '#1B5E20', marginBottom: 6, fontSize: 17 }}>
                  Aucune invitation reçue
                </p>
                <p style={{ fontSize: 14, color: '#AAA', lineHeight: 1.6 }}>
                  Vous apparaîtrez ici quand quelqu'un vous invitera à un repas.
                </p>
              </div>
            ) : (
              mealsInvited.map(meal => <MealCard key={meal.id} meal={meal} />)
            )}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  )
}