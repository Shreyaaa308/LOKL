import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import IndiaSVGMap from '../components/IndiaSVGMap'
import { getCreators } from '../accountStore'

const LANGUAGES = ['All', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'English']
const NICHES = ['All', 'Food & Dining', 'Fashion', 'Education', 'Real Estate', 'Wedding', 'Fitness', 'Travel', 'Comedy', 'Tech', 'Local Services']

export default function Discover({ onBack, theme: t }) {
  const [creators, setCreators] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selectedState, setSelectedState] = useState(null)
  const [language, setLanguage] = useState('All')
  const [niche, setNiche] = useState('All')
  const [minScore, setMinScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('map')

  useEffect(() => {
    const fetch = async () => {
      const fallbackCreators = getCreators()
      try {
        const snap = await getDocs(collection(db, 'creators'))
        const real = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Merge real and fallback (local + seed) creators, deduplicated by instagram handle & id
        const merged = [...real]
        const seenIds = new Set(real.map(c => c.id))
        const seenInstagrams = new Set(real.map(c => c.instagram?.trim().toLowerCase()))
        
        fallbackCreators.forEach(c => {
          const normInsta = c.instagram?.trim().toLowerCase()
          if (!seenIds.has(c.id) && !seenInstagrams.has(normInsta)) {
            merged.push(c)
            seenIds.add(c.id)
            seenInstagrams.add(normInsta)
          }
        })
        setCreators(merged)
        setFiltered(merged)
      } catch (e) {
        console.error("Error fetching creators from Firebase, using local:", e)
        setCreators(fallbackCreators)
        setFiltered(fallbackCreators)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  useEffect(() => {
    let f = creators
    if (selectedState) f = f.filter(c => c.state === selectedState)
    if (language !== 'All') f = f.filter(c => c.language === language)
    if (niche !== 'All') f = f.filter(c => c.niche === niche)
    if (minScore > 0) f = f.filter(c => (c.score?.total || 0) >= minScore)
    setFiltered(f)
  }, [selectedState, language, niche, minScore, creators])

  const getColor = (s) => s >= 80 ? '#7c4dcc' : s >= 65 ? '#9b6dd6' : s >= 50 ? '#f0a500' : '#e57373'

  const inp = {
    background: t.card, border: `1.5px solid ${t.border}`,
    borderRadius: '8px', padding: '8px 12px',
    color: t.text, fontSize: '13px', outline: 'none',
    fontFamily: 'Inter, sans-serif'
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'Inter, sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <button onClick={onBack} style={{ background: 'transparent', color: t.muted, border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0, fontWeight: '600' }}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.png" alt="LOKL" style={{ height: '40px', marginBottom: '10px' }} />
          <h2 style={{ margin: '4px 0', fontSize: '24px', fontWeight: '800' }}>Find Local Creators</h2>
          <p style={{ margin: 0, color: t.muted, fontSize: '13px' }}>Click on a state to discover verified creators</p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
          {[{k:'map',l:'🗺️ Map View'},{k:'list',l:'📋 List View'}].map(v => (
            <button key={v.k} onClick={() => setView(v.k)} style={{
              background: view === v.k ? t.purple : t.card,
              color: view === v.k ? 'white' : t.purple,
              border: `1.5px solid ${view === v.k ? t.purple : t.border}`,
              borderRadius: '8px', padding: '8px 20px',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer'
            }}>{v.l}</button>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          background: t.card, border: `1.5px solid ${t.border}`,
          borderRadius: '12px', padding: '14px 18px', marginBottom: '20px',
          display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
          boxShadow: t.shadow
        }}>
          {selectedState && (
            <div style={{ background: t.purple, color: 'white', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📍 {selectedState}
              <span onClick={() => setSelectedState(null)} style={{ cursor: 'pointer', opacity: 0.8 }}>✕</span>
            </div>
          )}
          <select value={language} onChange={e => setLanguage(e.target.value)} style={inp}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>)}
          </select>
          <select value={niche} onChange={e => setNiche(e.target.value)} style={inp}>
            {NICHES.map(n => <option key={n} value={n}>{n === 'All' ? 'All Niches' : n}</option>)}
          </select>
          <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} style={inp}>
            <option value={0}>Any Score</option>
            <option value={60}>Score 60+</option>
            <option value={70}>Score 70+</option>
            <option value={80}>Score 80+</option>
            <option value={90}>Score 90+</option>
          </select>
          <span style={{ fontSize: '13px', color: t.muted, fontWeight: '600', marginLeft: 'auto' }}>
            {filtered.length} creators found
          </span>
        </div>

        {view === 'map' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: t.card, border: `1.5px solid ${t.border}`, borderRadius: '16px', padding: '20px', boxShadow: t.shadow }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700' }}>🗺️ Select a State</h3>
              <IndiaSVGMap selectedState={selectedState} onStateSelect={(s) => setSelectedState(s === selectedState ? null : s)} dark={t.dark} />
            </div>
            <div>
              {!selectedState ? (
                <div style={{ background: t.card, border: `1.5px solid ${t.border}`, borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: t.shadow }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
                  <div style={{ color: t.muted, fontSize: '14px', fontWeight: '600' }}>Click on any state to see local creators!</div>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: t.purple }}>
                    Creators in {selectedState} ({filtered.length})
                  </h3>
                  {filtered.length === 0 ? (
                    <div style={{ background: t.card, border: `1.5px solid ${t.border}`, borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: t.shadow }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>😔</div>
                      <div style={{ color: t.muted }}>No creators yet in {selectedState}</div>
                      <div style={{ color: t.purple, fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>Be the first one!</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                      {filtered.map(c => <CreatorCard key={c.id} c={c} getColor={getColor} t={t} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {loading ? (
              <div style={{ color: t.muted, padding: '40px', textAlign: 'center' }}>Loading...</div>
            ) : filtered.map(c => <CreatorCard key={c.id} c={c} getColor={getColor} t={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function CreatorCard({ c, getColor, t }) {
  return (
    <div style={{ background: t.card, border: `1.5px solid ${t.border}`, borderRadius: '14px', padding: '18px', boxShadow: t.shadow }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: t.text }}>{c.name}</div>
          <div style={{ color: t.muted, fontSize: '12px' }}>{c.instagram}</div>
        </div>
        <div style={{ background: getColor(c.score?.total || 0), color: 'white', borderRadius: '8px', padding: '4px 10px', fontWeight: '800', fontSize: '16px', minWidth: '44px', textAlign: 'center' }}>
          {c.score?.total || '—'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {[c.city, c.language, c.niche].filter(Boolean).map(tag => (
          <span key={tag} style={{ background: t.dark ? 'rgba(124,77,204,0.2)' : '#f0e8ff', color: t.purple, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{tag}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
        <div style={{ background: t.dark ? 'rgba(255,255,255,0.05)' : '#faf5ff', borderRadius: '6px', padding: '6px 8px' }}>
          <div style={{ fontSize: '10px', color: t.muted, fontWeight: '600' }}>FOLLOWERS</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>{parseInt(c.followers || 0).toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: t.dark ? 'rgba(255,255,255,0.05)' : '#faf5ff', borderRadius: '6px', padding: '6px 8px' }}>
          <div style={{ fontSize: '10px', color: t.muted, fontWeight: '600' }}>ENG. RATE</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>{c.score?.engagementRate || '—'}%</div>
        </div>
      </div>

      <div style={{ background: t.dark ? 'rgba(255,255,255,0.1)' : '#f0e8ff', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${c.score?.total || 0}%`, height: '100%', background: getColor(c.score?.total || 0), borderRadius: '4px' }} />
      </div>
      <div style={{ fontSize: '10px', color: t.muted, marginTop: '3px', fontWeight: '600' }}>TrustTrace Score</div>
    </div>
  )
}