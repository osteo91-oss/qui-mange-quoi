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
      <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '7px 14px', borderRadius: 100,
            border: selected.includes(opt) ? 'none' : '0.5px solid #E0DDD6',
            background: selected.includes(opt) ? color : 'white',
            color: selected.includes(opt) ? 'white' : '#555',
            fontSize: 13, cursor: 'pointer',
            fontWeight: selected.includes(opt) ? 600 : 400
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

      <div style={{
        background: 'white', padding: '20px 20px 16px',
        borderBottom: '0.5px solid #E8E4DC',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <img src="/logo-icon.png" alt="Logo" style={{ width: 36 }} />
        <h1 style={{ fontSize: 17, fontWeight: 700, color: '#1B3A1E', margin: 0 }}>Mon profil</h1>
        <button onClick={handleLogout} style={{
          fontSize: 13, color: '#AAA', background: 'none',
          border: 'none', cursor: 'pointer'
        }}>
          Déconnexion
        </button>
      </div>

      <div style={{ padding: '24px 16px 100px' }}>

        <div style={{
          background: 'white', borderRadius: 20,
          padding: 20, border: '0.5px solid #E8E4DC',
          marginBottom: 16, textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <PhotoUpload
              bucket="avatars"
              currentUrl={profile.avatar_url}
              onUpload={url => setProfile({ ...profile, avatar_url: url })}
              shape="round"
              size={88}
              placeholder="👤"
            />
          </div>
          <input
            type="text" value={profile.name || ''}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            placeholder="Votre prénom"
            style={{
              textAlign: 'center', border: 'none',
              fontSize: 18, fontWeight: 700, color: '#1B3A1E',
              background: 'transparent', outline: 'none',
              width: '100%'
            }}
          />
          <p style={{ fontSize: 12, color: '#AAA', margin: '4px 0 0' }}>
            Appuyez sur la photo pour la modifier
          </p>
        </div>

        <div style={{
          display: 'flex', background: 'white',
          borderRadius: 100, padding: 4, marginBottom: 16,
          border: '0.5px solid #E8E4DC'
        }}>
          {(['profil', 'gouts', 'allergies'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '9px 0', borderRadius: 100,
              border: 'none', fontSize: 12, fontWeight: 500,
              cursor: 'pointer',
              background: activeTab === tab ? '#3B6E3F' : 'transparent',
              color: activeTab === tab ? 'white' : '#888'
            }}>
              {tab === 'profil' ? 'Profil' : tab === 'gouts' ? 'Goûts' : 'Allergies'}
            </button>
          ))}
        </div>

        <div style={{
          background: 'white', borderRadius: 20,
          padding: 20, border: '0.5px solid #E8E4DC', marginBottom: 16
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
                color="#3B6E3F"
              />
              <p style={{ fontSize: 11, fontWeight: 600, color: '#AAA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
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
                  color: '#1a1a1a'
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
          width: '100%', padding: '14px',
          background: saved ? '#388E3C' : '#3B6E3F',
          color: 'white', border: 'none', borderRadius: 100,
          fontSize: 15, fontWeight: 600, cursor: 'pointer'
        }}>
          {saved ? '✓ Profil enregistré !' : loading ? 'Enregistrement...' : 'Enregistrer mon profil'}
        </button>
      </div>

      <Navbar />
    </div>
  )
}