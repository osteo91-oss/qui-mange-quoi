'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '0.5px solid #E8E4DC',
      display: 'flex', alignItems: 'center',
      paddingBottom: 24, paddingTop: 10, zIndex: 50
    }}>
      <Link href="/" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname === '/' ? '#3B6E3F' : '#BDBDBD'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname === '/' ? '#3B6E3F' : '#BDBDBD', fontWeight: pathname === '/' ? 600 : 400 }}>Accueil</span>
      </Link>

      <Link href="/repas" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname.startsWith('/repas') ? '#3B6E3F' : '#BDBDBD'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname.startsWith('/repas') ? '#3B6E3F' : '#BDBDBD', fontWeight: pathname.startsWith('/repas') ? 600 : 400 }}>Repas</span>
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Link href="/repas/nouveau">
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: '#3B6E3F', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginTop: -20, boxShadow: '0 4px 12px rgba(59,110,63,0.35)'
          }}>
            <img src="/logo-icon.png" alt="Nouveau repas" style={{ width: 30, filter: 'brightness(0) invert(1)' }} />
          </div>
        </Link>
      </div>

      <Link href="/profil" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname === '/profil' ? '#3B6E3F' : '#BDBDBD'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname === '/profil' ? '#3B6E3F' : '#BDBDBD', fontWeight: pathname === '/profil' ? 600 : 400 }}>Profil</span>
      </Link>

      <Link href="/recherche" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname === '/recherche' ? '#3B6E3F' : '#BDBDBD'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname === '/recherche' ? '#3B6E3F' : '#BDBDBD', fontWeight: pathname === '/recherche' ? 600 : 400 }}>Recherche</span>
      </Link>
    </nav>
  )
}