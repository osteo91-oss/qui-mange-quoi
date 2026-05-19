'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PhotoUpload from '@/components/PhotoUpload'
import type { Profile } from '@/lib/types'

const ALLERGIES = ['Gluten', 'Lactose', 'Fruits à coque', 'Arachides', 'Oeufs', 'Poisson', 'Crustacés', 'Soja', 'Sésame', 'Moutarde']
const DIETS = ['Végétarien', 'Végétalien', 'Pescétarien', 'Sans gluten', 'Sans porc', 'Halal', 'Casher', 'Paléo', 'Cétogène']
const CUISINES = ['Française', 'Italienne', 'Japonaise', 'Mexicaine', 'Indienne', 'Thaïlandaise', 'Marocaine', 'Méditerranéenne']

type TagColor = { activeBg: string, activeShadow: string }

function TagSelector({ label, options, selected, onChange, colors }: {
  label: string, options: string[],
  selected: string[], onChange: (v: string[]) => void,
  colors: TagColor
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '8px 16px', borderRadius: 100,
            border: selected.includes(opt) ? 'none' : '1.5px solid #E8E8E8',
            background: selected.includes(opt) ? colors.activeBg : 'white',
            color: selected.includes(opt) ? 'white' : '#666',
            fontSize: 13, cursor: 'pointer',
            fontWeight: selected.includes(opt) ? 700 : 500,
            boxShadow: selected.includes(opt) ? colors.activeShadow : '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProfilContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams?.get('onboarding') === 'true'

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
    setTimeout(() => {
      setSaved(false)
      if (isOnboarding) router.push('/')
    }, 1500)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const tabs = [
    { key: 'profil', label: '🥗 Régimes', color: '#43A047' },
    { key: 'gouts', label: '❤️ Goûts', color: '#F57C00' },
    { key: 'allergies', label: '⚠️ Allergies', color: '#E53935' },
  ]

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F0F7F0', minHeight: '100vh' }}>

      <div style={{
        background: 'white', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: '#2E7D32' }}>Qui mange </span>
          <span style={{ color: '#F57C00' }}>quoi ?</span>
        </div>
        {!isOnboarding && (
          <button onClick={handleLogout} style={{
            fontSize: 13, color: '#AAA', background: 'none',
            border: 'none', cursor: 'pointer', fontWeight: 600
          }}>
            Déconnexion
          </button>
        )}
      </div>

      <div style={{ padding: '20px 16px 100px' }}>

        {isOnboarding && (
          <div style={{
            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
            borderRadius: 20, padding: '16px 20px', marginBottom: 16,
            border: '1px solid #A5D6A7',
            display: 'flex', alignItems: 'flex-start', gap: 12
          }}>
            <span style={{ fontSize: 28 }}>👋</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#1B5E20', margin: '0 0 4px' }}>
                Bienvenue ! Remplissez votre profil
              </p>
              <p style={{ fontSize: 13, color: '#43A047', margin: 0, lineHeight: 1.5 }}>
                Indiquez vos allergies, régimes et goûts pour que l'organisateur puisse composer un menu qui vous convient.
              </p>
            </div>
          </div>
        )}

        <div style={{
          background: 'white', borderRadius: 24,
          padding: '28px 20px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
                background: '#43A047', border: '2.5px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, boxShadow: '0 2px 6px rgba(67,160,71,0.4)'
              }}>📷</div>
            </div>
          </div>
          <input
            type="text" value={profile.name || ''}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            placeholder="Votre prénom"
            style={{
              textAlign: 'center', border: 'none',
              fontSize: 22, fontWeight: 800, color: '#1B5E20',
              background: 'transparent', outline: 'none',
              width: '100%', marginBottom: 4, fontFamily: 'inherit'
            }}
          />
          <p style={{ fontSize: 12, color: '#BBB', margin: 0 }}>
            Appuyez sur la photo pour la modifier
          </p>

          {/* Complétion profil */}
          {(() => {
            const steps = [
              { label: 'Prénom', done: !!profile.name },
              { label: 'Photo', done: !!profile.avatar_url },
              { label: 'Régimes', done: (profile.diets || []).length > 0 },
              { label: 'Cuisines', done: (profile.cuisines || []).length > 0 },
              { label: 'Allergies', done: (profile.allergies || []).length > 0 },
            ]
            const completed = steps.filter(s => s.done).length
            const percent = Math.round((completed / steps.length) * 100)
            const color = percent === 100 ? '#43A047' : percent >= 60 ? '#F57C00' : '#E53935'
            return (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F5F5F5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#999', margin: 0 }}>
                    Profil complété
                  </p>
                  <span style={{ fontSize: 14, fontWeight: 800, color }}>
                    {percent}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#F0F0F0', borderRadius: 3, marginBottom: 10 }}>
                  <div style={{
                    height: '100%', width: `${percent}%`,
                    background: color, borderRadius: 3,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {steps.map(step => (
                    <span key={step.label} style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '3px 8px', borderRadius: 100,
                      background: step.done ? '#E8F5E9' : '#F5F5F5',
                      color: step.done ? '#43A047' : '#BBB'
                    }}>
                      {step.done ? '✓' : '○'} {step.label}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F5F5F5' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#43A047', margin: 0 }}>{(profile.diets || []).length}</p>
              <p style={{ fontSize: 10, color: '#BBB', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Régimes</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#F57C00', margin: 0 }}>{(profile.cuisines || []).length}</p>
              <p style={{ fontSize: 10, color: '#BBB', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cuisines</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#E53935', margin: 0 }}>{(profile.allergies || []).length}</p>
              <p style={{ fontSize: 10, color: '#BBB', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Allergies</p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', background: 'white',
          borderRadius: 16, padding: 4, marginBottom: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
              flex: 1, padding: '10px 4px', borderRadius: 12,
              border: 'none', fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === tab.key ? tab.color : 'transparent',
              color: activeTab === tab.key ? 'white' : '#AAA',
              boxShadow: activeTab === tab.key ? `0 2px 8px ${tab.color}50` : 'none'
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{
          background: 'white', borderRadius: 20,
          padding: 20,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          marginBottom: 16
        }}>
          {activeTab === 'profil' && (
            <TagSelector
              label="Régimes alimentaires"
              options={DIETS}
              selected={profile.diets || []}
              onChange={v => setProfile({ ...profile, diets: v })}
              colors={{ activeBg: '#43A047', activeShadow: '0 2px 8px rgba(67,160,71,0.4)' }}
            />
          )}

          {activeTab === 'gouts' && (
            <div>
              <TagSelector
                label="Cuisines préférées"
                options={CUISINES}
                selected={profile.cuisines || []}
                onChange={v => setProfile({ ...profile, cuisines: v })}
                colors={{ activeBg: '#F57C00', activeShadow: '0 2px 8px rgba(245,124,0,0.4)' }}
              />
              <p style={{ fontSize: 11, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                Aliments non aimés
              </p>
              <textarea
                value={(profile.dislikes || []).join(', ')}
                onChange={e => setProfile({ ...profile, dislikes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="coriandre, olives, champignons..."
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid #E8E8E8', fontSize: 14,
                  outline: 'none', background: '#F8F8F8', resize: 'none',
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
              colors={{ activeBg: '#E53935', activeShadow: '0 2px 8px rgba(229,57,53,0.4)' }}
            />
          )}
        </div>

        <button onClick={handleSave} disabled={loading} style={{
          width: '100%', padding: '15px',
          background: saved ? '#2E7D32' : '#43A047',
          color: 'white', border: 'none', borderRadius: 100,
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(67,160,71,0.4)',
        }}>
          {saved ? '✓ Profil enregistré !' : loading ? 'Enregistrement...' : isOnboarding ? 'Enregistrer et continuer →' : 'Enregistrer mon profil'}
        </button>
      </div>

      <Navbar />
    </div>
  )
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><p style={{ color: '#AAA' }}>Chargement...</p></div>}>
      <ProfilContent />
    </Suspense>
  )
}