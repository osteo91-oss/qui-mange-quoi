'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NouveauChoixPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single()
      if (data) setUserName(data.name)
    }
    load()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 40%, #43A047 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 20px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🍽️</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: '0 0 8px', letterSpacing: -0.5 }}>
            Que souhaitez-vous faire ?
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            {userName ? `Bonjour ${userName} !` : ''} Choisissez votre mode d'organisation.
          </p>
        </div>

        {/* Option 1 — Date fixe */}
        <div
          onClick={() => router.push('/repas/nouveau?mode=fixed')}
          style={{
            background: 'white', borderRadius: 24, padding: '22px',
            marginBottom: 14, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 18,
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 20, flexShrink: 0,
            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, boxShadow: '0 4px 12px rgba(67,160,71,0.2)'
          }}>📅</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#1B5E20', margin: '0 0 5px' }}>
              J'organise un repas
            </p>
            <p style={{ fontSize: 13, color: '#AAA', margin: '0 0 10px', lineHeight: 1.5 }}>
              La date est déjà choisie. J'invite mes convives et on compose le menu ensemble.
            </p>
            <span style={{
              fontSize: 12, background: '#E8F5E9', color: '#43A047',
              padding: '4px 12px', borderRadius: 100, fontWeight: 700
            }}>
              📅 Date fixe
            </span>
          </div>
          <span style={{ fontSize: 20, color: '#DDD' }}>›</span>
        </div>

        {/* Option 2 — Sondage */}
        <div
          onClick={() => router.push('/repas/nouveau?mode=doodle')}
          style={{
            background: 'white', borderRadius: 24, padding: '22px',
            marginBottom: 32, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: 18,
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 20, flexShrink: 0,
            background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, boxShadow: '0 4px 12px rgba(245,124,0,0.2)'
          }}>🗳️</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#1B5E20', margin: '0 0 5px' }}>
              On trouve une date
            </p>
            <p style={{ fontSize: 13, color: '#AAA', margin: '0 0 10px', lineHeight: 1.5 }}>
              Je propose plusieurs dates et mes invités votent pour leurs disponibilités.
            </p>
            <span style={{
              fontSize: 12, background: '#FFF3E0', color: '#F57C00',
              padding: '4px 12px', borderRadius: 100, fontWeight: 700
            }}>
              🗳️ Sondage de dates
            </span>
          </div>
          <span style={{ fontSize: 20, color: '#DDD' }}>›</span>
        </div>

        <button onClick={() => router.push('/')} style={{
          width: '100%', padding: '13px',
          background: 'rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}