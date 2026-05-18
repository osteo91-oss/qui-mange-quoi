'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { Profile } from '@/lib/types'

const ALLERGIES = ['Gluten', 'Lactose', 'Fruits à coque', 'Arachides', 'Oeufs', 'Poisson', 'Crustacés', 'Soja', 'Sésame', 'Moutarde']
const DIETS = ['Végétarien', 'Végétalien', 'Sans gluten', 'Sans porc', 'Halal', 'Casher', 'Paléo', 'Cétogène']
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
      <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '7px 14px', borderRadius: 100,
            border: selected.includes(opt) ? 'none' : '0.5px solid #E0E0E0',
            background: selected.includes(opt) ? color : 'white',
            color: selected.includes(opt) ? 'white' : '#555',
            fontSize: 13, cursor: 'pointer', fontWeight: selected.includes(opt) ? 500 : 400
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
  const [profile, setProfile] = useState<Partial<Profile>>({
    name: '', allergies: [], diets: [], dislikes: [], cuisines: []
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
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ padding: '20px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', margin: 0 }}>Mon profil</h1>
        <button onClick={handleLogout} style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#E8F5E9', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 8px', fontSize: 28, fontWeight: 700, color: '#2E7D32'
        }}>
          {profile.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <p style={{ fontWeight: 600, color: '#1B4332', fontSize: 16 }}>{profile.name || 'Mon profil'}</p>
      </div>

      <div style={{ display: 'flex', background: '#F8F9FA', borderRadius: 100, padding: 4, marginBottom: 20 }}>
        {(['profil', 'gouts', 'allergies'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '8px 0', borderRadius: 100,
            border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: activeTab === tab ? '#2E7D32' : 'transparent',
            color: activeTab === tab ? 'white' : '#888'
          }}>
            {tab === 'profil' ? 'Profil' : tab === 'gouts' ? 'Goûts' : 'Allergies'}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '0.5px solid #E0E0E0', marginBottom: 16 }}>
        {activeTab === 'profil' && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Prénom
            </p>
            <input
              type="text" value={profile.name || ''}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              placeholder="Votre prénom"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '0.5px solid #E0E0E0', fontSize: 14,
                outline: 'none', background: '#F8F9FA', marginBottom: 16
              }}
            />
            <TagSelector
              label="Régimes alimentaires"
              options={DIETS}
              selected={profile.diets || []}
              onChange={v => setProfile({ ...profile, diets: v })}
              color="#2E7D32"
            />
          </div>
        )}

        {activeTab === 'gouts' && (
          <div>
            <TagSelector
              label="Cuisines préférées"
              options={CUISINES}
              selected={profile.cuisines || []}
              onChange={v => setProfile({ ...profile, cuisines: v })}
              color="#2E7D32"
            />
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Aliments non aimés
            </p>
            <textarea
              value={(profile.dislikes || []).join(', ')}
              onChange={e => setProfile({ ...profile, dislikes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="coriandre, olives, champignons..."
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '0.5px solid #E0E0E0', fontSize: 14,
                outline: 'none', background: '#F8F9FA', resize: 'none'
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
        background: saved ? '#388E3C' : '#2E7D32',
        color: 'white', border: 'none',
        borderRadius: 100, fontSize: 15,
        fontWeight: 600, cursor: 'pointer', marginBottom: 20
      }}>
        {saved ? '✓ Profil enregistré !' : loading ? 'Enregistrement...' : 'Enregistrer mon profil'}
      </button>

      <Navbar />
    </div>
  )
}