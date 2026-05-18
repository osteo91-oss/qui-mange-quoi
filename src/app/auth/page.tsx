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
      router.push('/profil')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F5F0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img
            src="/logo.png"
            alt="Qui mange quoi"
            style={{ width: 280, margin: '0 auto 8px', display: 'block' }}
          />
        </div>

        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: 28,
          border: '0.5px solid #E8E4DC',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            background: '#F7F5F0',
            borderRadius: 100,
            padding: 4,
            marginBottom: 24,
            border: '0.5px solid #E8E4DC'
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '9px 0', borderRadius: 100,
                border: 'none', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
                background: mode === m ? '#3B6E3F' : 'transparent',
                color: mode === m ? 'white' : '#888'
              }}>
                {m === 'login' ? 'Se connecter' : 'Créer un compte'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  fontSize: 11, fontWeight: 600, color: '#888',
                  letterSpacing: 0.8, textTransform: 'uppercase',
                  display: 'block', marginBottom: 7
                }}>Prénom</label>
                <input
                  type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  required placeholder="Marie"
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: 12, border: '0.5px solid #E0DDD6',
                    fontSize: 14, outline: 'none', background: '#F7F5F0',
                    color: '#1a1a1a'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontSize: 11, fontWeight: 600, color: '#888',
                letterSpacing: 0.8, textTransform: 'uppercase',
                display: 'block', marginBottom: 7
              }}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required placeholder="marie@exemple.fr"
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: 12, border: '0.5px solid #E0DDD6',
                  fontSize: 14, outline: 'none', background: '#F7F5F0',
                  color: '#1a1a1a'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                fontSize: 11, fontWeight: 600, color: '#888',
                letterSpacing: 0.8, textTransform: 'uppercase',
                display: 'block', marginBottom: 7
              }}>Mot de passe</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 14px',
                  borderRadius: 12, border: '0.5px solid #E0DDD6',
                  fontSize: 14, outline: 'none', background: '#F7F5F0',
                  color: '#1a1a1a'
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#FEF0F0', color: '#C62828',
                padding: '10px 14px', borderRadius: 10,
                fontSize: 13, marginBottom: 16,
                border: '0.5px solid #FFCDD2'
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: '#3B6E3F', color: 'white',
              border: 'none', borderRadius: 100,
              fontSize: 15, fontWeight: 600,
              cursor: 'pointer', letterSpacing: 0.3
            }}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#AAA', marginTop: 20 }}>
          Vos données sont sécurisées et confidentielles 🔒
        </p>
      </div>
    </div>
  )
}