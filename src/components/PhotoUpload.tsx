'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/compress'

type Props = {
  bucket: 'avatars' | 'meals'
  currentUrl?: string | null
  onUpload: (url: string) => void
  shape?: 'round' | 'square'
  size?: number
  placeholder?: string
}

export default function PhotoUpload({ bucket, currentUrl, onUpload, shape = 'round', size = 80, placeholder = '📷' }: Props) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const compressed = await compressImage(
        file,
        bucket === 'avatars' ? 400 : 800,
        0.75
      )

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session:', session?.user?.id)

      const fileName = `${session?.user?.id || Date.now()}_${Date.now()}.jpg`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressed, {
          upsert: true,
          contentType: 'image/jpeg'
        })

      console.log('Upload result:', data, error)

      if (error) {
        console.error('Upload error:', error)
        alert(`Erreur upload: ${error.message}`)
      } else {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName)
        console.log('Public URL:', urlData.publicUrl)
        onUpload(urlData.publicUrl)
      }
    } catch (err) {
      console.error('Erreur:', err)
    }

    setUploading(false)
  }

  const borderRadius = shape === 'round' ? '50%' : 16

  return (
    <label style={{ cursor: 'pointer', display: 'block' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <div style={{
        width: size, height: size, borderRadius,
        background: currentUrl ? 'transparent' : '#E8F0E8',
        border: currentUrl ? 'none' : '2px dashed #3B6E3F',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden',
        position: 'relative'
      }}>
        {currentUrl ? (
          <img src={currentUrl} alt="Photo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: size / 3 }}>{placeholder}</span>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.45)', padding: '4px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 10, color: 'white', fontWeight: 600 }}>
            {uploading ? '⏳' : '📷'}
          </span>
        </div>
      </div>
    </label>
  )
}