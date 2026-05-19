'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type MealDate = {
  id: string
  meal_id: string
  date: string
  time: string | null
}

type Vote = {
  id: string
  meal_date_id: string
  profile_id: string
  available: boolean
  profiles?: { name: string, avatar_url: string | null }
}

type Props = {
  mealId: string
  isOrganizer: boolean
}

export default function Doodle({ mealId, isOrganizer }: Props) {
  const [dates, setDates] = useState<MealDate[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [guests, setGuests] = useState<{ id: string, name: string, avatar_url: string | null }[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [bestDate, setBestDate] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const { data: datesData } = await supabase
        .from('meal_dates')
        .select('*')
        .eq('meal_id', mealId)
        .order('date', { ascending: true })
      if (datesData) setDates(datesData)

      const { data: votesData } = await supabase
        .from('meal_date_votes')
        .select('*, profiles(name, avatar_url)')
        .in('meal_date_id', datesData?.map(d => d.id) || [])
      if (votesData) setVotes(votesData)

      const { data: guestsData } = await supabase
        .from('meal_guests')
        .select('profile_id, profiles(id, name, avatar_url)')
        .eq('meal_id', mealId)
      if (guestsData) setGuests(guestsData.map((g: any) => g.profiles).filter(Boolean))

      if (datesData && datesData.length > 0) {
        const scores = datesData.map(d => ({
          date: d,
          score: votesData?.filter(v => v.meal_date_id === d.id && v.available).length || 0
        }))
        const best = scores.sort((a, b) => b.score - a.score)[0]
        if (best.score > 0) setBestDate(best.date.id)
      }
    }
    load()
  }, [mealId])

  const addDate = async () => {
    if (!newDate || dates.length >= 5) return
    setLoading(true)
    const { data } = await supabase
      .from('meal_dates')
      .insert({ meal_id: mealId, date: newDate, time: newTime || null })
      .select()
      .single()
    if (data) setDates([...dates, data])
    setNewDate('')
    setNewTime('')
    setLoading(false)
  }

  const removeDate = async (dateId: string) => {
    await supabase.from('meal_dates').delete().eq('id', dateId)
    setDates(dates.filter(d => d.id !== dateId))
    setVotes(votes.filter(v => v.meal_date_id !== dateId))
  }

  const toggleVote = async (dateId: string) => {
    if (!currentUserId) return
    const existing = votes.find(v => v.meal_date_id === dateId && v.profile_id === currentUserId)

    if (existing) {
      const newAvailable = !existing.available
      await supabase.from('meal_date_votes')
        .update({ available: newAvailable })
        .eq('id', existing.id)
      setVotes(votes.map(v => v.id === existing.id ? { ...v, available: newAvailable } : v))
    } else {
      const { data } = await supabase.from('meal_date_votes')
        .insert({ meal_date_id: dateId, profile_id: currentUserId, available: true })
        .select('*, profiles(name, avatar_url)')
        .single()
      if (data) setVotes([...votes, data])
    }

    const updatedVotes = votes.map(v =>
      v.meal_date_id === dateId && v.profile_id === currentUserId
        ? { ...v, available: !v.available } : v
    )
    const scores = dates.map(d => ({
      date: d,
      score: updatedVotes.filter(v => v.meal_date_id === d.id && v.available).length
    }))
    const best = scores.sort((a, b) => b.score - a.score)[0]
    if (best.score > 0) setBestDate(best.date.id)
  }

  const getVotesForDate = (dateId: string) =>
    votes.filter(v => v.meal_date_id === dateId)

  const getUserVote = (dateId: string) =>
    votes.find(v => v.meal_date_id === dateId && v.profile_id === currentUserId)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div>
      {dates.length === 0 && !isOrganizer && (
        <div style={{
          background: 'white', borderRadius: 16, padding: 24,
          textAlign: 'center', border: '0.5px solid #E8E4DC'
        }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🗓️</p>
          <p style={{ fontSize: 14, color: '#AAA' }}>
            L'organisateur n'a pas encore proposé de dates.
          </p>
        </div>
      )}

      {isOrganizer && (
        <div style={{
          background: 'white', borderRadius: 16,
          padding: 16, border: '0.5px solid #E8E4DC', marginBottom: 12
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Proposer une date ({dates.length}/5)
          </p>
          {dates.length >= 5 ? (
            <div style={{
              background: '#FFF3E0', borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#E65100', textAlign: 'center', fontWeight: 500
            }}>
              Maximum 5 dates atteint — supprimez une date pour en ajouter une autre
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <input
                  type="date" value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: '0.5px solid #E0DDD6', fontSize: 13,
                    outline: 'none', background: '#F7F5F0', color: '#1a1a1a'
                  }}
                />
                <input
                  type="time" value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: '0.5px solid #E0DDD6', fontSize: 13,
                    outline: 'none', background: '#F7F5F0', color: '#1a1a1a'
                  }}
                />
              </div>
              <button onClick={addDate} disabled={loading || !newDate} style={{
                width: '100%', padding: '10px',
                background: newDate ? '#43A047' : '#E0E0E0',
                color: 'white', border: 'none', borderRadius: 100,
                fontSize: 13, fontWeight: 600, cursor: newDate ? 'pointer' : 'default'
              }}>
                + Ajouter cette date
              </button>
            </>
          )}
        </div>
      )}

      {dates.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 16,
          padding: 16, border: '0.5px solid #E8E4DC', marginBottom: 12
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Votes ({guests.length} invités)
          </p>

          {dates.map(date => {
            const dateVotes = getVotesForDate(date.id)
            const availableVotes = dateVotes.filter(v => v.available)
            const userVote = getUserVote(date.id)
            const isBest = bestDate === date.id
            const score = availableVotes.length

            return (
              <div key={date.id} style={{
                borderRadius: 14, padding: '12px 14px', marginBottom: 8,
                background: isBest ? '#E8F0E8' : '#F7F5F0',
                border: isBest ? '1.5px solid #43A047' : '0.5px solid #E8E4DC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    {isBest && (
                      <span style={{
                        fontSize: 10, background: '#43A047', color: 'white',
                        padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                        display: 'inline-block', marginBottom: 4
                      }}>
                        ⭐ Meilleure date
                      </span>
                    )}
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1B3A1E', margin: 0, textTransform: 'capitalize' }}>
                      {formatDate(date.date)}
                    </p>
                    {date.time && (
                      <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>🕐 {date.time}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isBest ? '#43A047' : '#888' }}>
                      {score}/{guests.length}
                    </span>
                    {isOrganizer && (
                      <button onClick={() => removeDate(date.id)} style={{
                        background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: 16, color: '#DDD'
                      }}>✕</button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {guests.map(guest => {
                      const vote = votes.find(v => v.meal_date_id === date.id && v.profile_id === guest.id)
                      return (
                        <div key={guest.id} title={guest.name} style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: vote?.available ? '#43A047' : vote ? '#FFEBEE' : '#F0F0F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, overflow: 'hidden',
                          color: vote?.available ? 'white' : vote ? '#C62828' : '#AAA',
                        }}>
                          {guest.avatar_url
                            ? <img src={guest.avatar_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} alt={guest.name} />
                            : guest.name.charAt(0).toUpperCase()
                          }
                        </div>
                      )
                    })}
                  </div>

                  <button onClick={() => toggleVote(date.id)} style={{
                    padding: '7px 16px', borderRadius: 100,
                    border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: userVote?.available ? '#43A047' : userVote ? '#FFEBEE' : '#F0F0F0',
                    color: userVote?.available ? 'white' : userVote ? '#C62828' : '#888'
                  }}>
                    {userVote?.available ? '✓ Disponible' : userVote ? '✗ Indisponible' : 'Je réponds'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}