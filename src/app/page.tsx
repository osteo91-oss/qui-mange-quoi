'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import type { Meal } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: profile } = await supabase
        .from('profiles').select('name').eq('id', user.id).single()
      if (profile) setUserName(profile.name)
      const { data } = await supabase
        .from('meals').select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setMeals(data)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#888' }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ padding: '20px 0 16px', borderBottom: '0.5px solid #E0E0E0', marginBottom: 20 }}>
        <img
          src="/logo.png"
          alt="Qui mange quoi"
          style={{ width: 160, display: 'block' }}
        />
        <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          Bonjour {userName}
        </p>
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        Mes repas
      </p>

      {meals.length === 0 ?