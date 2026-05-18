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
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    }

    if (mode === 'signup') {
      router.push('/profil')
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 16px', background: '#F8F9FA'
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#2E7D32', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28
          }}>🍽️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1B4332', margin: 0 }}>
            Qui mange quoi
          </h1>
          <p style={{ fontSize: 14, color: '#888', marginTop: 6 }}>
            N'oubliez plus les goûts de vos invités
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: 20,
          padding: 24, border: '0.5px solid #E0E0E0'
        }}>
          <div style={{
            display: 'flex', background: '#F8F9FA',
            borderRadius: 100, padding: 4, marginBottom: 24
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px 0', borderRadius: 100,
                border: 'none', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
                background: mode === m ? '#2E7D32' : 'transparent',
                color: mode === m ? 'white' : '#888'
              }}>
                {m === 'login' ? 'Se connecter' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                  Prénom
                </label>
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  required placeholder="Marie"
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: 12, border: '0.5px solid #E0E0E0',
                    fontSize: 14, outline: 'none', background: '#F8F9FA'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required placeholder="marie@exemple.fr"
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: 12, border: '0.5px solid #E0E0E0',
                  fontSize: 14, outline: 'none', background: '#F8F9FA'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>
                Mot de passe
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: 12, border: '0.5px solid #E0E0E0',
                  fontSize: 14, outline: 'none', background: '#F8F9FA'
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#FFEBEE', color: '#C62828',
                padding: '10px 14px', borderRadius: 10,
                fontSize: 13, marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: '#2E7D32', color: 'white',
              border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}