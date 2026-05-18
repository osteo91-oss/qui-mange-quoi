'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const items = [
    { icon: '⌂', label: 'Accueil', href: '/' },
    { icon: '⌕', label: 'Recherche', href: '/recherche' },
    { icon: null, label: '', href: '/repas/nouveau' },
    { icon: '⊞', label: 'Repas', href: '/repas' },
    { icon: '◯', label: 'Profil', href: '/profil' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '0.5px solid #E0E0E0',
      display: 'flex', alignItems: 'center',
      paddingBottom: 20, paddingTop: 8, zIndex: 50
    }}>
      {items.map((item, i) => (
        i === 2
          ? <Link key={i} href={item.href}
                  style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#2E7D32', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginTop: -20, fontSize: 28, color: 'white', fontWeight: 300
              }}>+</div>
            </Link>
          : <Link key={i} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, textDecoration: 'none'
            }}>
              <span style={{
                fontSize: 22,
                color: pathname === item.href ? '#2E7D32' : '#BDBDBD'
              }}>{item.icon}</span>
              <span style={{
                fontSize: 10,
                color: pathname === item.href ? '#2E7D32' : '#BDBDBD'
              }}>{item.label}</span>
            </Link>
      ))}
    </nav>
  )
}