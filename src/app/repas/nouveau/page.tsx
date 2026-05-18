'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const TYPES = ['Déjeuner', 'Dîner', 'Apéro', 'Buffet', 'Pique-nique', 'Autre']

export default function NouveauRepas() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [type, setType] = useState('Dîner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
    })
  }, [router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('meals')
      .insert({
        name,
        date: date || null,
        organizer_id: user.id,
        meal_type: type,
        place: place || null,
        time: time || null,
      })
      .select()
      .single()

    if (error) { setError(error.message); setLoading(false); return }
    
    if (data) {
      await supabase.from('meal_guests').insert({
        meal_id: data.id,
        profile_id: user.id,
        status: 'accepted',
      })
      router.push(`/repas/${data.id}`)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ padding: '20px 0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{
          background: '#F8F9FA', border: 'none', borderRadius: '50%',
          width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: '#555'
        }}>‹</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', margin: 0 }}>
          Nouveau repas
        </h1>
      </div>

      <div style={{
        width: '100%', height: 140, background: '#E8F5E9',
        borderRadius: 16, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 48, marginBottom: 20
      }}>🍽️</div>

      <form onSubmit={handleCreate}>
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '0.5px solid #E0E0E0', marginBottom: 16 }}>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Nom du repas
            </label>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              required placeholder="Barbecue entre amis..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '0.5px solid #E0E0E0', fontSize: 14,
                outline: 'none', background: '#F8F9FA'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Date
              </label>
              <input
                type="date" value={date}
                onChange={e => setDate(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '0.5px solid #E0E0E0', fontSize: 14,
                  outline: 'none', background: '#F8F9FA'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Heure
              </label>
              <input
                type="time" value={time}
                onChange={e => setTime(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '0.5px solid #E0E0E0', fontSize: 14,
                  outline: 'none', background: '#F8F9FA'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Lieu
            </label>
            <input
              type="text" value={place}
              onChange={e => setPlace(e.target.value)}
              placeholder="Chez moi, Restaurant..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '0.5px solid #E0E0E0', fontSize: 14,
                outline: 'none', background: '#F8F9FA'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Type de repas
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)} style={{
                  padding: '7px 14px', borderRadius: 100,
                  border: type === t ? 'none' : '0.5px solid #E0E0E0',
                  background: type === t ? '#2E7D32' : 'white',
                  color: type === t ? 'white' : '#555',
                  fontSize: 13, cursor: 'pointer', fontWeight: type === t ? 500 : 400
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
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
          fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20
        }}>
          {loading ? 'Création...' : 'Créer le repas →'}
        </button>
      </form>

      <Navbar />
    </div>
  )
}