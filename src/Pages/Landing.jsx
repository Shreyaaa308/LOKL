export default function Landing({ onCreator, onBrand, onDiscover, theme: t }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      color: t.text,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <img src="/logo.png" alt="LOKL" style={{ height: '72px' }} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <span style={{
          background: t.purple, color: 'white',
          padding: '6px 18px', borderRadius: '20px',
          fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px'
        }}>INDIA'S FIRST HYPERLOCAL CREATOR PLATFORM</span>
      </div>

      <p style={{
        fontSize: 'clamp(15px, 2.5vw, 20px)', color: t.muted,
        maxWidth: '580px', lineHeight: '1.7', margin: '0 0 16px 0'
      }}>
        Where a dosa shop in Coimbatore finds a Tamil food creator in their neighbourhood — and a creator in Patna builds a real career without 1M followers.
      </p>

      {/* Who are you? */}
      <p style={{ fontSize: '14px', color: t.muted, marginBottom: '16px', fontWeight: '600' }}>
        Who are you?
      </p>

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
        <button onClick={onCreator} style={{
          background: t.purple, color: 'white', border: 'none',
          padding: '16px 32px', borderRadius: '10px', fontSize: '16px',
          fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(124,77,204,0.3)'
        }}>🎥 I'm a Creator</button>

        <button onClick={onBrand} style={{
          background: t.card, color: t.purple,
          border: `2px solid ${t.purple}`,
          padding: '16px 32px', borderRadius: '10px', fontSize: '16px',
          fontWeight: '700', cursor: 'pointer'
        }}>🏪 I'm a Business</button>
      </div>

      <button onClick={onDiscover} style={{
        background: 'transparent', color: t.muted,
        border: `1.5px solid ${t.border}`,
        padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer'
      }}>🔍 Browse Creators</button>

      <div style={{
        marginTop: '60px', display: 'flex',
        gap: '48px', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { num: '2.4M+', label: 'Creators in India' },
          { num: '63M+', label: 'Local Businesses' },
          { num: '22', label: 'Languages Supported' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: t.purple }}>{s.num}</div>
            <div style={{ fontSize: '13px', color: t.muted, marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}