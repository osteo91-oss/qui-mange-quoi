import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Qui mange quoi',
  description: 'Eat together. Really together.',
  openGraph: {
    title: 'Qui mange quoi',
    description: 'Eat together. Really together.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body style={{ minHeight: '100vh', background: '#F8F9FA', paddingBottom: 80 }}>
        {children}
      </body>
    </html>
  )
}