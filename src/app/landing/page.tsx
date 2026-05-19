import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: 'white', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        padding: '16px 24px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0,
        background: 'white', zIndex: 50
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

      {/* ✨ MOMENT MAGIQUE */}
      <div style={{ padding: '60px 24px', background: 'white', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            fontSize: 12, fontWeight: 800, color: '#F57C00',
            background: '#FFF3E0', padding: '4px 12px',
            borderRadius: 100, letterSpacing: 1, textTransform: 'uppercase'
          }}>✨ La magie en action</span>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1B5E20', margin: '12px 0 8px', letterSpacing: -0.5 }}>
            Invitez qui vous voulez.<br />L'IA s'occupe du menu.
          </h2>
          <p style={{ color: '#AAA', fontSize: 14, margin: 0 }}>
            En quelques secondes, un menu compatible avec tous vos invités.
          </p>
        </div>

        <div style={{ background: '#F8FFF8', borderRadius: 24, padding: '24px', border: '1px solid #E8F5E9', marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#999', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 16px' }}>
            👥 Vos invités ce soir
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Paul', icon: '🥦', tag: 'Végétarien', color: '#43A047', bg: '#E8F5E9' },
              { name: 'Julie', icon: '⚠️', tag: 'Allergique aux arachides', color: '#E53935', bg: '#FFEBEE' },
              { name: 'Marc', icon: '🌾', tag: 'Sans gluten', color: '#F57C00', bg: '#FFF3E0' },
              { name: 'Sophie', icon: '🐟', tag: 'Pescétarienne', color: '#1976D2', bg: '#E3F2FD' },
            ].map(guest => (
              <div key={guest.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'white', borderRadius: 14, padding: '12px 14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: guest.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0
                }}>{guest.icon}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1B5E20', margin: 0 }}>{guest.name}</p>
                  <span style={{
                    fontSize: 11, background: guest.bg, color: guest.color,
                    padding: '2px 8px', borderRadius: 100, fontWeight: 600
                  }}>{guest.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flèche */}
        <div style={{ textAlign: 'center', fontSize: 28, margin: '8px 0' }}>⬇️</div>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#7B1FA2',
            background: '#F3E5F5', padding: '6px 16px',
            borderRadius: 100
          }}>✨ Menu généré par l'IA en 10 secondes</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 28, margin: '8px 0 20px' }}>⬇️</div>

        {/* Menu généré */}
        <div style={{ background: 'linear-gradient(135deg, #1B5E20, #43A047)', borderRadius: 24, padding: '24px', color: 'white' }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, margin: '0 0 16px' }}>
            🍽️ Menu compatible avec tous
          </p>
          {[
            { course: 'Entrée', name: 'Velouté de courgettes & croûtons', detail: 'Sans gluten · Végétarien · Sans arachides', emoji: '🥣' },
            { course: 'Plat', name: 'Risotto aux champignons & parmesan', detail: 'Sans gluten · Végétarien · Compatible tous', emoji: '🍚' },
            { course: 'Dessert', name: 'Mousse au chocolat noir', detail: 'Sans gluten · Vegan · Sans arachides', emoji: '🍫' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.12)', borderRadius: 14,
              padding: '12px 14px', marginBottom: i < 2 ? 10 : 0
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0
              }}>{item.emoji}</div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.course}</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 3px' }}>{item.name}</p>
                <p style={{ fontSize: 11, opacity: 0.65, margin: 0 }}>{item.detail}</p>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>✅</span>
              </div>
            </div>
          ))}

          <div style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ fontSize: 16 }}>🛒</span>
            <p style={{ fontSize: 13, opacity: 0.8, margin: 0, fontWeight: 500 }}>
              Liste de courses générée automatiquement pour 4 personnes
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/auth">
            <button style={{
              background: '#43A047', color: 'white', border: 'none',
              borderRadius: 100, padding: '14px 32px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(67,160,71,0.4)'
            }}>
              Essayer gratuitement →
            </button>
          </Link>
        </div>
      </div>

      {/* Features steps */}
      <div style={{ padding: '50px 24px', background: '#F0F7F0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1B5E20', textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
            Comment ça marche ?
          </h2>
          <p style={{ textAlign: 'center', color: '#AAA', fontSize: 14, marginBottom: 32 }}>
            En 4 étapes simples, organisez le repas parfait.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { num: '1', emoji: '👤', title: 'Créez votre profil', desc: 'Renseignez vos allergies, régimes alimentaires et cuisines préférées en quelques secondes.', color: '#43A047', bg: '#E8F5E9' },
              { num: '2', emoji: '🗓️', title: 'Organisez un repas', desc: 'Choisissez une date fixe ou lancez un sondage pour trouver la meilleure date avec vos invités.', color: '#1976D2', bg: '#E3F2FD' },
              { num: '3', emoji: '👥', title: 'Invitez vos convives', desc: 'Partagez un lien par WhatsApp ou SMS. Vos invités remplissent leur profil en 1 minute.', color: '#F57C00', bg: '#FFF3E0' },
              { num: '4', emoji: '✨', title: "L'IA compose le menu", desc: "Obtenez 3 propositions par cours adaptées à tous et la liste de courses en un clic.", color: '#7B1FA2', bg: '#F3E5F5' },
            ].map(step => (
              <div key={step.num} style={{
                background: 'white', borderRadius: 20, padding: '18px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  background: step.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>
                  {step.emoji}
                </div>
                <div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: step.color,
                    background: step.bg, padding: '2px 8px',
                    borderRadius: 100, letterSpacing: 0.5
                  }}>ÉTAPE {step.num}</span>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#1B5E20', margin: '4px 0 4px' }}>{step.title}</p>
                  <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ background: 'white', padding: '50px 24px' }}>
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
              { emoji: '🗳️', title: 'Doodle intégré', desc: "Trouvez la meilleure date sans quitter l'app.", color: '#1976D2', bg: '#E3F2FD' },
              { emoji: '🛒', title: 'Liste de courses', desc: 'Générée automatiquement avec les quantités.', color: '#F57C00', bg: '#FFF3E0' },
              { emoji: '📱', title: 'Partage WhatsApp', desc: 'Invitez en un clic via WhatsApp ou SMS.', color: '#43A047', bg: '#E8F5E9' },
              { emoji: '🔒', title: 'Données privées', desc: 'Vos données sont sécurisées et confidentielles.', color: '#1976D2', bg: '#E3F2FD' },
            ].map(feat => (
              <div key={feat.title} style={{
                background: '#FAFAFA', borderRadius: 16, padding: '16px',
                border: `1px solid ${feat.bg}`
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
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: -0.5 }}>
          Prêt pour votre prochain repas ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '0 0 28px', lineHeight: 1.6 }}>
          Rejoignez des milliers d'organisateurs qui utilisent<br />Qui mange quoi ? pour des repas réussis.
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
      <div style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid #F0F0F0' }}>
        <p style={{ fontSize: 12, color: '#CCC', margin: 0 }}>
          © 2025 Qui mange quoi ? · Fait avec ❤️ pour de meilleurs moments à table
        </p>
      </div>
    </div>
  )
}