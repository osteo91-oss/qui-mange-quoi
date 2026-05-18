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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#888' }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ padding: '20px 0 16px', borderBottom: '0.5px solid #E0E0E0', marginBottom: 20 }}>
        <img
          src="/logo.png"
          alt="Qui mange quoi"
          style={{ width: 160, display: 'block' }}
        />
        <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          Bonjour {userName}
        </p>
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        Mes repas
      </p>

      {meals.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 16, padding: 32,
          textAlign: 'center', border: '0.5px solid #E0E0E0'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
          <p style={{ fontWeight: 600, color: '#1B4332', marginBottom: 6 }}>
            Aucun repas encore
          </p>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
            Créez votre premier repas et invitez vos convives.
          </p>
          <Link href="/repas/nouveau">
            <button style={{
              background: '#2E7D32', color: 'white',
              border: 'none', borderRadius: 100,
              padding: '12px 24px', fontSize: 14,
              fontWeight: 500, cursor: 'pointer'
            }}>
              + Créer un repas
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meals.map(meal => (
            <Link key={meal.id} href={`/repas/${meal.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', borderRadius: 16,
                padding: '16px', border: '0.5px solid #E0E0E0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#E8F5E9', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>🍽️</div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1B4332', margin: 0 }}>{meal.name}</p>
                    {meal.date && (
                      <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
                        {new Date(meal.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {meal.ai_menu && (
                    <span style={{
                      fontSize: 11, background: '#E8F5E9',
                      color: '#2E7D32', padding: '3px 8px',
                      borderRadius: 100, fontWeight: 500
                    }}>Menu ✓</span>
                  )}
                  <span style={{ color: '#BDBDBD', fontSize: 20 }}>›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Navbar />
    </div>
  )
}