'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { compressImage } from '@/lib/compress'

const TYPES = ['Déjeuner', 'Dîner', 'Apéro', 'Buffet', 'Pique-nique', 'Autre']

function NouveauRepasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'fixed' | 'doodle' | null

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [type, setType] = useState('Dîner')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pour le mode sondage — jusqu'à 5 dates
  const [doodleDates, setDoodleDates] = useState<{ date: string, time: string }[]>([])
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

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
    const { error } = await supabase.storage.from('meals').upload(fileName, compressed, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('meals').getPublicUrl(fileName)
      setPhotoUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const addDoodleDate = () => {
    if (!newDate || doodleDates.length >= 5) return
    setDoodleDates([...doodleDates, { date: newDate, time: newTime }])
    setNewDate('')
    setNewTime('')
  }

  const removeDoodleDate = (index: number) => {
    setDoodleDates(doodleDates.filter((_, i) => i !== index))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
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
        date: mode === 'fixed' ? date || null : null,
        organizer_id: user.id,
        meal_type: type,
        place: place || null,
        time: mode === 'fixed' ? time || null : null,
        photo_url: photoUrl || null,
        date_mode: mode || 'fixed',
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

      // Si mode sondage, on insère les dates proposées
      if (mode === 'doodle' && doodleDates.length > 0) {
        await supabase.from('meal_dates').insert(
          doodleDates.map(d => ({
            meal_id: data.id,
            date: d.date,
            time: d.time || null
          }))
        )
      }

      router.push(`/repas/${data.id}`)
    }
  }

  const isDoodle = mode === 'doodle'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: isDoodle ? '#FFF8F0' : '#F0F7F0' }}>

      {/* Header */}
      <div style={{
        background: isDoodle
          ? 'linear-gradient(135deg, #E65100, #F57C00)'
          : 'linear-gradient(135deg, #1B5E20, #43A047)',
        padding: '20px 20px 28px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => router.back()} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none',
            borderRadius: '50%', width: 36, height: 36,
            fontSize: 18, cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>‹</button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              {isDoodle ? '🗳️ Trouver une date' : '📅 Nouveau repas'}
            </h1>
            <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>
              {isDoodle ? 'Proposez des dates, vos invités votent' : 'La date est déjà choisie'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 100px', marginTop: -12 }}>

        {/* Photo */}
        <label style={{ cursor: 'pointer', display: 'block', marginBottom: 16 }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          <div style={{
            width: '100%', height: 140, borderRadius: 20,
            overflow: 'hidden',
            background: isDoodle ? 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' : 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
            border: `2px dashed ${isDoodle ? '#F57C00' : '#43A047'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: photoUrl ? '0 4px 16px rgba(0,0,0,0.12)' : 'none'
          }}>
            {photoUrl ? (
              <>
                <img src={photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 10, right: 10,
                  background: 'rgba(0,0,0,0.5)', borderRadius: 20,
                  padding: '4px 12px', fontSize: 11, color: 'white'
                }}>📷 Modifier</div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{uploading ? '⏳' : '📸'}</div>
                <p style={{ fontSize: 12, color: isDoodle ? '#E65100' : '#2E7D32', fontWeight: 600, margin: 0 }}>
                  {uploading ? 'Compression...' : 'Ajouter une photo'}
                </p>
              </div>
            )}
          </div>
        </label>

        <form onSubmit={handleCreate}>
          <div style={{
            background: 'white', borderRadius: 20, padding: 20,
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 14
          }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Nom du repas
              </label>
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                required placeholder={isDoodle ? "Dîner entre amis..." : "Barbecue du dimanche..."}
                style={{
                  width: '100%', padding: '13px 14px', borderRadius: 12,
                  border: '1.5px solid #E8E8E8', fontSize: 15,
                  outline: 'none', background: '#F8F8F8', color: '#1a1a1a',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Lieu
              </label>
              <input
                type="text" value={place}
                onChange={e => setPlace(e.target.value)}
                placeholder="Chez moi, Restaurant..."
                style={{
                  width: '100%', padding: '13px 14px', borderRadius: 12,
                  border: '1.5px solid #E8E8E8', fontSize: 15,
                  outline: 'none', background: '#F8F8F8', color: '#1a1a1a',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Type de repas
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setType(t)} style={{
                    padding: '8px 16px', borderRadius: 100,
                    border: type === t ? 'none' : '1.5px solid #E8E8E8',
                    background: type === t ? (isDoodle ? '#F57C00' : '#43A047') : 'white',
                    color: type === t ? 'white' : '#666',
                    fontSize: 13, cursor: 'pointer', fontWeight: type === t ? 700 : 500,
                    boxShadow: type === t ? `0 2px 8px ${isDoodle ? 'rgba(245,124,0,0.4)' : 'rgba(67,160,71,0.4)'}` : 'none'
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date fixe */}
          {!isDoodle && (
            <div style={{
              background: 'white', borderRadius: 20, padding: 20,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 14
            }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                📅 Date & heure
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#AAA', display: 'block', marginBottom: 6 }}>Date</label>
                  <input
                    type="date" value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 12,
                      border: '1.5px solid #E8E8E8', fontSize: 14,
                      outline: 'none', background: '#F8F8F8', color: '#1a1a1a'
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
                      border: '1.5px solid #E8E8E8', fontSize: 14,
                      outline: 'none', background: '#F8F8F8', color: '#1a1a1a'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sondage dates */}
          {isDoodle && (
            <div style={{
              background: 'white', borderRadius: 20, padding: 20,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 14
            }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                🗳️ Proposez vos dates ({doodleDates.length}/5)
              </label>
              <p style={{ fontSize: 12, color: '#AAA', marginBottom: 14 }}>
                Vos invités voteront pour leurs disponibilités.
              </p>

              {doodleDates.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#FFF3E0', borderRadius: 12, padding: '10px 14px',
                  marginBottom: 8, border: '1px solid #FFE0B2'
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#E65100', margin: 0, textTransform: 'capitalize' }}>
                      {formatDate(d.date)}
                    </p>
                    {d.time && <p style={{ fontSize: 11, color: '#F57C00', margin: '2px 0 0' }}>🕐 {d.time}</p>}
                  </div>
                  <button type="button" onClick={() => removeDoodleDate(i)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#FFB74D', fontSize: 18
                  }}>✕</button>
                </div>
              ))}

              {doodleDates.length < 5 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <input
                    type="date" value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    style={{
                      padding: '11px 12px', borderRadius: 12,
                      border: '1.5px solid #E8E8E8', fontSize: 13,
                      outline: 'none', background: '#F8F8F8', color: '#1a1a1a'
                    }}
                  />
                  <input
                    type="time" value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    style={{
                      padding: '11px 12px', borderRadius: 12,
                      border: '1.5px solid #E8E8E8', fontSize: 13,
                      outline: 'none', background: '#F8F8F8', color: '#1a1a1a'
                    }}
                  />
                </div>
              )}

              {doodleDates.length < 5 ? (
                <button type="button" onClick={addDoodleDate} disabled={!newDate} style={{
                  width: '100%', padding: '11px',
                  background: newDate ? '#F57C00' : '#E8E8E8',
                  color: 'white', border: 'none', borderRadius: 100,
                  fontSize: 13, fontWeight: 700, cursor: newDate ? 'pointer' : 'default',
                  boxShadow: newDate ? '0 2px 8px rgba(245,124,0,0.4)' : 'none'
                }}>
                  + Ajouter cette date
                </button>
              ) : (
                <div style={{
                  background: '#FFF3E0', borderRadius: 10, padding: '10px',
                  textAlign: 'center', fontSize: 13, color: '#F57C00', fontWeight: 600
                }}>
                  Maximum 5 dates atteint ✓
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{
              background: '#FEF0F0', color: '#C62828', padding: '12px 14px',
              borderRadius: 12, fontSize: 13, marginBottom: 14,
              border: '1px solid #FFCDD2'
            }}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading || uploading || (isDoodle && doodleDates.length === 0)} style={{
            width: '100%', padding: '15px',
            background: loading || uploading ? '#AAA'
              : (isDoodle && doodleDates.length === 0) ? '#DDD'
              : isDoodle ? '#F57C00' : '#43A047',
            color: 'white', border: 'none', borderRadius: 100,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 4px 12px ${isDoodle ? 'rgba(245,124,0,0.4)' : 'rgba(67,160,71,0.4)'}`
          }}>
            {loading ? 'Création...'
              : uploading ? 'Photo en cours...'
              : isDoodle && doodleDates.length === 0 ? 'Ajoutez au moins une date'
              : isDoodle ? `Créer le sondage (${doodleDates.length} date${doodleDates.length > 1 ? 's' : ''}) →`
              : 'Créer le repas →'}
          </button>
        </form>
      </div>
      <Navbar />
    </div>
  )
}

export default function NouveauRepas() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><p style={{ color: '#AAA' }}>Chargement...</p></div>}>
      <NouveauRepasContent />
    </Suspense>
  )
}