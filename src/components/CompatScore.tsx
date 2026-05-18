export default function CompatScore({ score }: { score: number }) {
  const color = score >= 80 ? '#2E7D32' : score >= 60 ? '#E65100' : '#C62828'
  const label = score >= 80 ? 'Très bonne compatibilité !' : score >= 60 ? 'Compatibilité correcte' : 'Difficile à concilier'

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        Compatibilité globale
      </p>
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        border: `6px solid ${color}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 12px'
      }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: '#1B4332' }}>
          {score}%
        </span>
      </div>
      <div style={{
        height: 6, background: '#E8F5E9',
        borderRadius: 3, margin: '0 40px 8px'
      }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: color, borderRadius: 3
        }} />
      </div>
      <p style={{ fontSize: 13, color, fontWeight: 500 }}>{label}</p>
    </div>
  )
}