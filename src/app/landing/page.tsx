import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: 'white', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        padding: '16px 24px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F0F0F0'
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: '#2E7D32' }}>Qui mange </span>
          <span style={{ color: '#F57C00' }}>quoi</span>
        </div>
        <Link href="/auth">
          <button style={{
            background: '#43A047', color: 'white', border: 'none',
            borderRadius: 100, padding: '10px 20px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(67,160,71,0.3)'
          }}>
            Commencer gratuitement
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 40%, #43A047 100%)',
        padding: '60px 24px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🍽️</div>
          <h1 style={{
            fontSize: 36, fontWeight: 900, color: 'white',
            margin: '0 0 16px', lineHeight: 1.2, letterSpacing: -1
          }}>
            N'oubliez plus jamais<br />
            <span style={{ color: '#FFB74D' }}>les goûts de vos invités</span>
          </h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.75)',
            margin: '0 0 32px', lineHeight: 1.6
          }}>
            Organisez vos repas en tenant compte des allergies,<br />
            régimes et préférences de chacun. Laissez l'IA composer le menu parfait.
          </p>
          <Link href="/auth">
            <button style={{
              background: '#F57C00', color: 'white', border: 'none',
              borderRadius: 100, padding: '16px 36px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(245,124,0,0.5)',
              marginBottom: 12
            }}>
              Créer mon compte gratuitement →
            </button>
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Gratuit • Sans carte bancaire • Prêt en 2 minutes
          </p>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1B5E20', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
          Comment ça marche ?
        </h2>
        <p style={{ textAlign: 'center', color: '#AAA', fontSize: 14, marginBottom: 40 }}>
          En 4 étapes simples, organisez le repas parfait.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { num: '1', emoji: '👤', title: 'Créez votre profil', desc: 'Renseignez vos allergies, régimes alimentaires et cuisines préférées en quelques secondes.', color: '#43A047', bg: '#E8F5E9' },
            { num: '2', emoji: '🗓️', title: 'Organisez un repas', desc: 'Choisissez une date fixe ou lancez un sondage pour trouver la meilleure date avec vos invités.', color: '#1976D2', bg: '#E3F2FD' },
            { num: '3', emoji: '👥', title: 'Invitez vos convives', desc: 'Partagez un lien par WhatsApp ou SMS. Vos invités remplissent leur profil en 1 minute.', color: '#F57C00', bg: '#FFF3E0' },
            { num: '4', emoji: '✨', title: "L'IA compose le menu", desc: "Obtenez 3 propositions par cours, sélectionnez vos préférées et la liste de courses se génère automatiquement.", color: '#7B1FA2', bg: '#F3E5F5' },
          ].map(step => (
            <div key={step.num} style={{
              background: 'white', borderRadius: 20, padding: '20px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'flex-start', gap: 16,
              border: `1px solid ${step.bg}`
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: step.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 26
              }}>
                {step.emoji}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: step.color,
                    background: step.bg, padding: '2px 8px',
                    borderRadius: 100, letterSpacing: 0.5
                  }}>ÉTAPE {step.num}</span>
                </div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#1B5E20', margin: '0 0 4px' }}>{step.title}</p>
                <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div style={{ background: '#F0F7F0', padding: '50px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1B5E20', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{ textAlign: 'center', color: '#AAA', fontSize: 14, marginBottom: 32 }}>
            Une app complète pour des repas réussis.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { emoji: '⚠️', title: 'Alertes allergies', desc: 'Détection automatique des allergènes pour chaque invité.', color: '#E53935', bg: '#FFEBEE' },
              { emoji: '🤖', title: 'Menu IA', desc: '3 propositions par cours adaptées à tous.', color: '#7B1FA2', bg: '#F3E5F5' },
              { emoji: '🗳️', title: 'Doodle intégré', desc: 'Trouvez la meilleure date sans quitter l\'app.', color: '#1976D2', bg: '#E3F2FD' },
              { emoji: '🛒', title: 'Liste de courses', desc: 'Générée automatiquement avec les quantités.', color: '#F57C00', bg: '#FFF3E0' },
              { emoji: '📱', title: 'Partage WhatsApp', desc: 'Invitez en un clic via WhatsApp ou SMS.', color: '#43A047', bg: '#E8F5E9' },
              { emoji: '🔒', title: 'Données privées', desc: 'Vos données sont sécurisées et confidentielles.', color: '#1976D2', bg: '#E3F2FD' },
            ].map(feat => (
              <div key={feat.title} style={{
                background: 'white', borderRadius: 16, padding: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: feat.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 10
                }}>{feat.emoji}</div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#1B5E20', margin: '0 0 4px' }}>{feat.title}</p>
                <p style={{ fontSize: 12, color: '#AAA', margin: 0, lineHeight: 1.4 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20, #43A047)',
        padding: '60px 24px', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: -0.5 }}>
          Prêt à organiser votre prochain repas ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '0 0 28px' }}>
          Rejoignez des milliers d'organisateurs qui utilisent Qui mange quoi.
        </p>
        <Link href="/auth">
          <button style={{
            background: '#F57C00', color: 'white', border: 'none',
            borderRadius: 100, padding: '16px 40px',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(245,124,0,0.5)'
          }}>
            Commencer gratuitement →
          </button>
        </Link>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
          Eat together. Really together. 🍽️
        </p>
      </div>

      {/* Footer */}
      <div style={{
        padding: '24px', textAlign: 'center',
        borderTop: '1px solid #F0F0F0'
      }}>
        <p style={{ fontSize: 12, color: '#CCC', margin: 0 }}>
          © 2025 Qui mange quoi · Fait avec ❤️ pour de meilleurs moments à table
        </p>
      </div>
    </div>
  )
}