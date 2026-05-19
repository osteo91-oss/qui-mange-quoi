'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RejoindreRepas({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'joined' | 'error' | 'auth'>('loading')
  const [mealName, setMealName] = useState('')
  const [mealPhoto, setMealPhoto] = useState('')
  const [organizerName, setOrganizerName] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: meal } = await supabase
        .from('meals')
        .select('*')
        .eq('invite_token', token)
        .single()

      if (meal) {
        const { data: organizer } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', meal.organizer_id)
          .single()
        setOrganizerName(organizer?.name || '')
      }

      if (!meal) { setStatus('error'); return }
      setMealName(meal.name)
      setMealPhoto(meal.photo_url || '')
      setOrganizerName((meal.profiles as any)?.name || '')

      if (!user) {
        setStatus('auth')
        return
      }

      await supabase.from('meal_guests').upsert({
        meal_id: meal.id,
        profile_id: user.id,
        status: 'accepted',
      })

      setStatus('joined')
      setTimeout(() => router.push(`/repas/${meal.id}`), 2000)
    }
    init()
  }, [token, router])

  if (status === 'loading') return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(160deg, #1B5E20, #43A047)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 24px'
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
      <p style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Vérification de l'invitation...</p>
    </div>
  )

  if (status === 'error') return (
    <div style={{
      minHeight: '100vh', background: '#F0F7F0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 24px', textAlign: 'center'
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1B5E20', marginBottom: 8 }}>Lien invalide</h1>
      <p style={{ fontSize: 14, color: '#AAA', marginBottom: 24 }}>Ce lien d'invitation est invalide ou a expiré.</p>
      <button onClick={() => router.push('/')} style={{
        background: '#43A047', color: 'white', border: 'none',
        borderRadius: 100, padding: '12px 28px',
        fontSize: 14, fontWeight: 700, cursor: 'pointer'
      }}>Retour à l'accueil</button>
    </div>
  )

  if (status === 'auth') return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 40%, #43A047 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* Invitation card */}
        <div style={{
          background: 'white', borderRadius: 28, overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)', marginBottom: 16
        }}>
          {mealPhoto ? (
            <img src={mealPhoto} alt={mealName}
              style={{ width: '100%', height: 160, objectFit: 'cover' }} />
          ) : (
            <div style={{
              height: 120, background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48
            }}>🍽️</div>
          )}

          <div style={{ padding: '20px 24px' }}>
            <div style={{
              display: 'inline-block', fontSize: 11, fontWeight: 800,
              color: '#43A047', background: '#E8F5E9',
              padding: '4px 12px', borderRadius: 100, marginBottom: 12,
              letterSpacing: 0.5
            }}>
              🎉 INVITATION
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B5E20', margin: '0 0 6px' }}>
              {mealName}
            </h2>
            {organizerName && (
              <p style={{ fontSize: 13, color: '#AAA', margin: '0 0 16px' }}>
                Organisé par <strong style={{ color: '#43A047' }}>{organizerName}</strong>
              </p>
            )}
            <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
              Pour rejoindre ce repas et indiquer vos préférences alimentaires, créez votre compte gratuitement.
            </p>
          </div>
        </div>

        <button onClick={() => router.push(`/auth?redirect=/rejoindre/${token}`)} style={{
          width: '100%', padding: '15px',
          background: '#F57C00', color: 'white',
          border: 'none', borderRadius: 100,
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(245,124,0,0.5)',
          marginBottom: 10
        }}>
          Créer mon compte gratuitement →
        </button>

        <button onClick={() => router.push(`/auth`)} style={{
          width: '100%', padding: '13px',
          background: 'rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
          J'ai déjà un compte → Se connecter
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
          🔒 Gratuit • Données sécurisées • Sans carte bancaire
        </p>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(160deg, #1B5E20, #43A047)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 24px', textAlign: 'center'
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>
        Vous avez rejoint<br />"{mealName}" !
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Redirection en cours...</p>
    </div>
  )
}