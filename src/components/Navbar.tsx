'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '0.5px solid rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center',
      paddingBottom: 24, paddingTop: 10, zIndex: 50,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
    }}>
      <Link href="/" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pathname === '/' ? '#3B6E3F' : '#C0C0C0'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname === '/' ? '#3B6E3F' : '#C0C0C0', fontWeight: pathname === '/' ? 600 : 400 }}>Accueil</span>
      </Link>

      <Link href="/repas" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pathname.startsWith('/repas') ? '#3B6E3F' : '#C0C0C0'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname.startsWith('/repas') ? '#3B6E3F' : '#C0C0C0', fontWeight: pathname.startsWith('/repas') ? 600 : 400 }}>Repas</span>
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Link href="/nouveau">
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8874A, #D4641E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: -24,
            boxShadow: '0 6px 20px rgba(232,135,74,0.45), 0 2px 8px rgba(232,135,74,0.3)',
            border: '3px solid white',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </Link>
      </div>

      <Link href="/profil" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pathname === '/profil' ? '#3B6E3F' : '#C0C0C0'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname === '/profil' ? '#3B6E3F' : '#C0C0C0', fontWeight: pathname === '/profil' ? 600 : 400 }}>Profil</span>
      </Link>

      <Link href="/recherche" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pathname === '/recherche' ? '#3B6E3F' : '#C0C0C0'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span style={{ fontSize: 10, color: pathname === '/recherche' ? '#3B6E3F' : '#C0C0C0', fontWeight: pathname === '/recherche' ? 600 : 400 }}>Recherche</span>
      </Link>
    </nav>
  )
}