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
      minHeight: '100vh', background: '#F7F5F0',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 20px'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/logo.png" alt="Qui mange quoi" style={{ height: 36, marginBottom: 16 }} />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1B3A1E', margin: '0 0 8px', letterSpacing: -0.5 }}>
            Que souhaitez-vous faire ?
          </h1>
          <p style={{ fontSize: 14, color: '#AAA', margin: 0 }}>
            {userName ? `Bonjour ${userName} ! ` : ''}Choisissez votre mode d'organisation.
          </p>
        </div>

        {/* Option 1 — Date fixe */}
        <div
          onClick={() => router.push('/repas/nouveau?mode=fixed')}
          style={{
            background: 'white', borderRadius: 24, padding: '24px',
            marginBottom: 14, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '0.5px solid rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: 18,
            transition: 'transform 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 20, flexShrink: 0,
            background: 'linear-gradient(135deg, #E8F0E8, #C8DEC8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
            boxShadow: '0 4px 12px rgba(59,110,63,0.15)'
          }}>🍽️</div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#1B3A1E', margin: '0 0 5px' }}>
              J'organise un repas
            </p>
            <p style={{ fontSize: 13, color: '#AAA', margin: '0 0 10px', lineHeight: 1.5 }}>
              La date est déjà choisie. J'invite mes convives et on compose le menu ensemble.
            </p>
            <span style={{
              fontSize: 12, background: '#E8F0E8', color: '#3B6E3F',
              padding: '4px 10px', borderRadius: 100, fontWeight: 600
            }}>
              📅 Date fixe
            </span>
          </div>
        </div>

        {/* Option 2 — Doodle */}
        <div
          onClick={() => router.push('/repas/nouveau?mode=doodle')}
          style={{
            background: 'white', borderRadius: 24, padding: '24px',
            marginBottom: 32, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '0.5px solid rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: 18,
            transition: 'transform 0.15s'
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 20, flexShrink: 0,
            background: 'linear-gradient(135deg, #FDF0E8, #F5D4B8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30,
            boxShadow: '0 4px 12px rgba(232,135,74,0.15)'
          }}>🗓️</div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#1B3A1E', margin: '0 0 5px' }}>
              On trouve une date
            </p>
            <p style={{ fontSize: 13, color: '#AAA', margin: '0 0 10px', lineHeight: 1.5 }}>
              Je propose plusieurs dates et mes invités votent pour leurs disponibilités.
            </p>
            <span style={{
              fontSize: 12, background: '#FDF0E8', color: '#E8874A',
              padding: '4px 10px', borderRadius: 100, fontWeight: 600
            }}>
              🗳️ Sondage de dates
            </span>
          </div>
        </div>

        <button onClick={() => router.push('/')} style={{
          width: '100%', padding: '13px',
          background: 'transparent', color: '#AAA',
          border: '0.5px solid #E0DDD6', borderRadius: 100,
          fontSize: 14, fontWeight: 500, cursor: 'pointer'
        }}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}