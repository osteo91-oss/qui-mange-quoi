'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PhotoUpload from '@/components/PhotoUpload'
import type { Profile } from '@/lib/types'

const ALLERGIES = ['Gluten', 'Lactose', 'Fruits à coque', 'Arachides', 'Oeufs', 'Poisson', 'Crustacés', 'Soja', 'Sésame', 'Moutarde']
const DIETS = ['Végétarien', 'Végétalien', 'Pescétarien', 'Sans gluten', 'Sans porc', 'Halal', 'Casher', 'Paléo', 'Cétogène']
const CUISINES = ['Française', 'Italienne', 'Japonaise', 'Mexicaine', 'Indienne', 'Thaïlandaise', 'Marocaine', 'Méditerranéenne']

function TagSelector({ label, options, selected, onChange, color }: {
  label: string, options: string[],
  selected: string[], onChange: (v: string[]) => void,
  color: string
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '8px 16px', borderRadius: 100,
            border: selected.includes(opt) ? 'none' : '0.5px solid #E0DDD6',
            background: selected.includes(opt) ? color : 'white',
            color: selected.includes(opt) ? 'white' : '#555',
            fontSize: 13, cursor: 'pointer',
            fontWeight: selected.includes(opt) ? 600 : 400,
            boxShadow: selected.includes(opt) ? `0 2px 8px ${color}40` : '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.15s'
          }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<Profile & { avatar_url: string }>>({
    name: '', allergies: [], diets: [], dislikes: [], cuisines: [], avatar_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'profil' | 'gouts' | 'allergies'>('profil')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [router])

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ ...profile, id: user.id })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F7F5F0', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'white', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
      }}>
        <img src="/logo-icon.png" alt="Logo" style={{ width: 36 }} />
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#1B3A1E', margin: 0 }}>Mon profil</h1>
        <button onClick={handleLogout} style={{
          fontSize: 13, color: '#AAA', background: 'none',
          border: 'none', cursor: 'pointer', fontWeight: 500
        }}>
          Déconnexion
        </button>
      </div>

      <div style={{ padding: '24px 16px 100px' }}>

        {/* Avatar card */}
        <div style={{
          background: 'white', borderRadius: 24,
          padding: '28px 20px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
          border: '0.5px solid rgba(0,0,0,0.05)',
          marginBottom: 16, textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ position: 'relative' }}>
              <PhotoUpload
                bucket="avatars"
                currentUrl={profile.avatar_url}
                onUpload={url => setProfile({ ...profile, avatar_url: url })}
                shape="round"
                size={90}
                placeholder="👤"
              />
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 26, height: 26, borderRadius: '50%',
                background: '#3B6E3F', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12
              }}>📷</div>
            </div>
          </div>
          <input
            type="text" value={profile.name || ''}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            placeholder="Votre prénom"
            style={{
              textAlign: 'center', border: 'none',
              fontSize: 20, fontWeight: 700, color: '#1B3A1E',
              background: 'transparent', outline: 'none',
              width: '100%', marginBottom: 4
            }}
          />
          <p style={{ fontSize: 12, color: '#BBB', margin: 0 }}>
            Appuyez sur la photo pour la modifier
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'white',
          borderRadius: 16, padding: 4, marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '0.5px solid rgba(0,0,0,0.05)'
        }}>
          {(['profil', 'gouts', 'allergies'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px 0', borderRadius: 12,
              border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab ? '#3B6E3F' : 'transparent',
              color: activeTab === tab ? 'white' : '#AAA',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(59,110,63,0.3)' : 'none'
            }}>
              {tab === 'profil' ? '🥗 Régimes' : tab === 'gouts' ? '❤️ Goûts' : '⚠️ Allergies'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: 'white', borderRadius: 20,
          padding: 20,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '0.5px solid rgba(0,0,0,0.05)',
          marginBottom: 16
        }}>
          {activeTab === 'profil' && (
            <TagSelector
              label="Régimes alimentaires"
              options={DIETS}
              selected={profile.diets || []}
              onChange={v => setProfile({ ...profile, diets: v })}
              color="#3B6E3F"
            />
          )}

          {activeTab === 'gouts' && (
            <div>
              <TagSelector
                label="Cuisines préférées"
                options={CUISINES}
                selected={profile.cuisines || []}
                onChange={v => setProfile({ ...profile, cuisines: v })}
                color="#E8874A"
              />
              <p style={{ fontSize: 11, fontWeight: 700, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                Aliments non aimés
              </p>
              <textarea
                value={(profile.dislikes || []).join(', ')}
                onChange={e => setProfile({ ...profile, dislikes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="coriandre, olives, champignons..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '0.5px solid #E0DDD6', fontSize: 14,
                  outline: 'none', background: '#F7F5F0', resize: 'none',
                  color: '#1a1a1a', fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          {activeTab === 'allergies' && (
            <TagSelector
              label="Allergies & intolérances"
              options={ALLERGIES}
              selected={profile.allergies || []}
              onChange={v => setProfile({ ...profile, allergies: v })}
              color="#C62828"
            />
          )}
        </div>

        <button onClick={handleSave} disabled={loading} style={{
          width: '100%', padding: '15px',
          background: saved ? '#388E3C' : '#3B6E3F',
          color: 'white', border: 'none', borderRadius: 100,
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: saved ? '0 4px 12px rgba(56,142,60,0.4)' : '0 4px 12px rgba(59,110,63,0.3)',
          transition: 'all 0.2s'
        }}>
          {saved ? '✓ Profil enregistré !' : loading ? 'Enregistrement...' : 'Enregistrer mon profil'}
        </button>
      </div>

      <Navbar />
    </div>
  )
}