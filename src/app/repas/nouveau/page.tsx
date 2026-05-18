'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PhotoUpload from '@/components/PhotoUpload'

const TYPES = ['Déjeuner', 'Dîner', 'Apéro', 'Buffet', 'Pique-nique', 'Autre']

export default function NouveauRepas() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [type, setType] = useState('Dîner')
  const [photoUrl, setPhotoUrl] = useState('')
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
        photo_url: photoUrl || null,
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
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F7F5F0', minHeight: '100vh' }}>

      <div style={{
        background: 'white', padding: '20px',
        borderBottom: '0.5px solid #E8E4DC',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <button onClick={() => router.back()} style={{
          background: '#F7F5F0', border: 'none', borderRadius: '50%',
          width: 36, height: 36, fontSize: 20, cursor: 'pointer', color: '#555'
        }}>‹</button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#1B3A1E', margin: 0 }}>
          Nouveau repas
        </h1>
      </div>

      <div style={{ padding: '20px 16px 100px' }}>

        <div style={{
          width: '100%', height: 180, borderRadius: 20,
          overflow: 'hidden', marginBottom: 16,
          background: '#E8F0E8', border: '2px dashed #3B6E3F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', cursor: 'pointer'
        }}>
          <label style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const fileName = `${Date.now()}.${file.name.split('.').pop()}`
                const { error } = await supabase.storage.from('meals').upload(fileName, file, { upsert: true })
                if (!error) {
                  const { data } = supabase.storage.from('meals').getPublicUrl(fileName)
                  setPhotoUrl(data.publicUrl)
                }
              }}
            />
            {photoUrl ? (
              <img src={photoUrl} alt="Photo du repas" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                <p style={{ fontSize: 13, color: '#3B6E3F', fontWeight: 600 }}>Ajouter une photo</p>
                <p style={{ fontSize: 11, color: '#AAA' }}>Optionnel</p>
              </div>
            )}
            {photoUrl && (
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                background: 'rgba(0,0,0,0.5)', borderRadius: 20,
                padding: '4px 10px', fontSize: 11, color: 'white'
              }}>
                📷 Modifier
              </div>
            )}
          </label>
        </div>

        <form onSubmit={handleCreate}>
          <div style={{
            background: 'white', borderRadius: 20,
            padding: 20, border: '0.5px solid #E8E4DC', marginBottom: 16
          }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Nom du repas
              </label>
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                required placeholder="Barbecue entre amis..."
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '0.5px solid #E0DDD6', fontSize: 14,
                  outline: 'none', background: '#F7F5F0', color: '#1a1a1a'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Date
                </label>
                <input
                  type="date" value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '0.5px solid #E0DDD6', fontSize: 14,
                    outline: 'none', background: '#F7F5F0', color: '#1a1a1a'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Heure
                </label>
                <input
                  type="time" value={time}
                  onChange={e => setTime(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12,
                    border: '0.5px solid #E0DDD6', fontSize: 14,
                    outline: 'none', background: '#F7F5F0', color: '#1a1a1a'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Lieu
              </label>
              <input
                type="text" value={place}
                onChange={e => setPlace(e.target.value)}
                placeholder="Chez moi, Restaurant..."
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '0.5px solid #E0DDD6', fontSize: 14,
                  outline: 'none', background: '#F7F5F0', color: '#1a1a1a'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Type de repas
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setType(t)} style={{
                    padding: '7px 14px', borderRadius: 100,
                    border: type === t ? 'none' : '0.5px solid #E0DDD6',
                    background: type === t ? '#3B6E3F' : 'white',
                    color: type === t ? 'white' : '#555',
                    fontSize: 13, cursor: 'pointer',
                    fontWeight: type === t ? 600 : 400
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
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
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            {loading ? 'Création...' : 'Créer le repas →'}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  )
}