'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RejoindreRepas({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'joined' | 'error'>('loading')
  const [mealName, setMealName] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth`)
        return
      }

      const { data: meal } = await supabase
        .from('meals')
        .select('*')
        .eq('invite_token', token)
        .single()

      if (!meal) { setStatus('error'); return }
      setMealName(meal.name)

      await supabase.from('meal_guests').upsert({
        meal_id: meal.id,
        profile_id: user.id,
        status: 'accepted',
      })

      setStatus('joined')
      setTimeout(() => router.push(`/repas/${meal.id}`), 2000)
    }
    init()
  }, [token, router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 16px', background: '#F8F9FA'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: status === 'error' ? '#FFEBEE' : '#E8F5E9',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px', fontSize: 32
        }}>
          {status === 'loading' && '⏳'}
          {status === 'joined' && '✅'}
          {status === 'error' && '❌'}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', marginBottom: 8 }}>
          {status === 'loading' && 'Vérification...'}
          {status === 'joined' && `Vous rejoignez "${mealName}" !`}
          {status === 'error' && 'Lien invalide'}
        </h1>

        <p style={{ fontSize: 14, color: '#888' }}>
          {status === 'loading' && 'Un instant...'}
          {status === 'joined' && 'Redirection en cours...'}
          {status === 'error' && 'Ce lien est invalide ou a expiré.'}
        </p>

        {status === 'error' && (
          <button onClick={() => router.push('/')} style={{
            marginTop: 20, background: '#2E7D32', color: 'white',
            border: 'none', borderRadius: 100, padding: '12px 24px',
            fontSize: 14, fontWeight: 500, cursor: 'pointer'
          }}>
            Retour à l'accueil
          </button>
        )}
      </div>
    </div>
  )
}