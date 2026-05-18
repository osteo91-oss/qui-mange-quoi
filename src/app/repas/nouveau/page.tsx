'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { compressImage } from '@/lib/compress'

const TYPES = ['Déjeuner', 'Dîner', 'Apéro', 'Buffet', 'Pique-nique', 'Autre']

export default function NouveauRepas() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [dateMode, setDateMode] = useState<'fixed' | 'doodle'>('fixed')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [type, setType] = useState('Dîner')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
    })
  }, [router])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const compressed = await compressImage(file, 800, 0.75)
    const fileName = `${Date.now()}.jpg`
    const { error } = await supabase.storage
      .from('meals')
      .upload(fileName, compressed, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('meals').getPublicUrl(fileName)
      setPhotoUrl(data.publicUrl)
    }
    setUploading(false)
  }

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
        date: dateMode === 'fixed' ? date || null : null,
        organizer_id: user.id,
        meal_type: type,
        place: place || null,
        time: dateMode === 'fixed' ? time || null : null,
        photo_url: photoUrl || null,
        date_mode: dateMode,
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

        <label style={{ cursor: 'pointer', display: 'block', marginBottom: 16 }}>
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <div style={{
            width: '100%', height: 160, borderRadius: 20,
            overflow: 'hidden', background: '#E8F0E8',
            border: '2px dashed #3B6E3F',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', position: 'relative'
          }}>
            {photoUrl ? (
              <>
                <img src={photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 10, right: 10,
                  background: 'rgba(0,0,0,0.5)', borderRadius: 20,
                  padding: '4px 10px', fontSize: 11, color: 'white'
                }}>📷 Modifier</div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>
                  {uploading ? '⏳' : '📸'}
                </div>
                <p style={{ fontSize: 13, color: '#3B6E3F', fontWeight: 600, margin: 0 }}>
                  {uploading ? 'Compression en cours...' : 'Ajouter une photo'}
                </p>
                <p style={{ fontSize: 11, color: '#AAA', margin: '2px 0 0' }}>
                  {uploading ? '' : 'Optionnel — sera compressée automatiquement'}
                </p>
              </div>
            )}
          </div>
        </label>

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

            <div style={{ marginBottom: 16 }}>
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

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Date du repas
              </label>
              <div style={{ display: 'flex', background: '#F7F5F0', borderRadius: 100, padding: 4, marginBottom: 14, border: '0.5px solid #E0DDD6' }}>
                <button type="button" onClick={() => setDateMode('fixed')} style={{
                  flex: 1, padding: '8px 0', borderRadius: 100, border: 'none',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: dateMode === 'fixed' ? '#3B6E3F' : 'transparent',
                  color: dateMode === 'fixed' ? 'white' : '#888'
                }}>
                  📅 Date fixe
                </button>
                <button type="button" onClick={() => setDateMode('doodle')} style={{
                  flex: 1, padding: '8px 0', borderRadius: 100, border: 'none',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: dateMode === 'doodle' ? '#3B6E3F' : 'transparent',
                  color: dateMode === 'doodle' ? 'white' : '#888'
                }}>
                  🗳️ Sondage
                </button>
              </div>

              {dateMode === 'fixed' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#AAA', display: 'block', marginBottom: 6 }}>Date</label>
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
                    <label style={{ fontSize: 11, color: '#AAA', display: 'block', marginBottom: 6 }}>Heure</label>
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
              ) : (
                <div style={{
                  background: '#E8F0E8', borderRadius: 14,
                  padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start'
                }}>
                  <span style={{ fontSize: 24 }}>🗳️</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1B3A1E', margin: '0 0 4px' }}>
                      Sondage activé
                    </p>
                    <p style={{ fontSize: 12, color: '#5A8A5C', margin: 0, lineHeight: 1.5 }}>
                      Après la création, proposez jusqu'à 5 dates. Vos invités voteront pour leurs disponibilités.
                    </p>
                  </div>
                </div>
              )}
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

          <button type="submit" disabled={loading || uploading} style={{
            width: '100%', padding: '14px',
            background: loading || uploading ? '#AAA' : '#3B6E3F',
            color: 'white', border: 'none', borderRadius: 100,
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            {loading ? 'Création...' : uploading ? 'Photo en cours...' : 'Créer le repas →'}
          </button>
        </form>
      </div>
      <Navbar />
    </div>
  )
}