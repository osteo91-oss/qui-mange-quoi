'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          allergies: [],
          diets: [],
          dislikes: [],
          cuisines: [],
        })
      }
      router.push('/nouveau')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #1B3A1E 0%, #2A5230 40%, #43A047 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
      position: 'relative', overflow: 'hidden'
    }}>

      {/* Cercles décoratifs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 300, height: 300, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)'
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)'
      }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img
            src="/logo-icon.png"
            alt="Qui mange quoi"
            style={{
              width: 130, height: 130,
              display: 'block', margin: '0 auto 16px',
              filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.35))'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: -1 }}>
              Qui mange
            </span>
            <span style={{ fontSize: 34, fontWeight: 800, color: '#E8874A', letterSpacing: -1 }}>
              Quoi
            </span>
          </div>
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.5)',
            margin: 0, fontStyle: 'italic', letterSpacing: 0.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <span style={{ display: 'inline-block', width: 24, height: 1, background: 'rgba(255,255,255,0.25)', verticalAlign: 'middle' }} />
            Eat together. Really together.
            <span style={{ display: 'inline-block', width: 24, height: 1, background: 'rgba(255,255,255,0.25)', verticalAlign: 'middle' }} />
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'white',
          borderRadius: 28,
          padding: '28px 24px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
        }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', background: '#F7F5F0',
            borderRadius: 100, padding: 4, marginBottom: 24,
            border: '0.5px solid rgba(0,0,0,0.06)'
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px 0', borderRadius: 100,
                border: 'none', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: mode === m ? '#43A047' : 'transparent',
                color: mode === m ? 'white' : '#AAA',
                boxShadow: mode === m ? '0 2px 8px rgba(59,110,63,0.3)' : 'none'
              }}>
                {m === 'login' ? 'Se connecter' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: '#AAA',
                  letterSpacing: 1, textTransform: 'uppercase',
                  display: 'block', marginBottom: 8
                }}>Prénom</label>
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  required placeholder="Marie"
                  style={{
                    width: '100%', padding: '14px 16px',
                    borderRadius: 14, border: '0.5px solid #E8E4DC',
                    fontSize: 15, outline: 'none', background: '#F7F5F0',
                    color: '#1a1a1a', fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontSize: 11, fontWeight: 700, color: '#AAA',
                letterSpacing: 1, textTransform: 'uppercase',
                display: 'block', marginBottom: 8
              }}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required placeholder="marie@exemple.fr"
                style={{
                  width: '100%', padding: '14px 16px',
                  borderRadius: 14, border: '0.5px solid #E8E4DC',
                  fontSize: 15, outline: 'none', background: '#F7F5F0',
                  color: '#1a1a1a', fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 11, fontWeight: 700, color: '#AAA',
                letterSpacing: 1, textTransform: 'uppercase',
                display: 'block', marginBottom: 8
              }}>Mot de passe</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                style={{
                  width: '100%', padding: '14px 16px',
                  borderRadius: 14, border: '0.5px solid #E8E4DC',
                  fontSize: 15, outline: 'none', background: '#F7F5F0',
                  color: '#1a1a1a', fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#FEF0F0', color: '#C62828',
                padding: '12px 14px', borderRadius: 12,
                fontSize: 13, marginBottom: 16,
                border: '0.5px solid #FFCDD2', fontWeight: 500
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '15px',
              background: loading ? '#AAA' : '#43A047',
              color: 'white', border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(59,110,63,0.4)',
              letterSpacing: 0.3
            }}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 24
        }}>
          🔒 Vos données sont sécurisées et confidentielles
        </p>
      </div>
    </div>
  )
}