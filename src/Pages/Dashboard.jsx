import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getLocalCampaigns } from '../accountStore'
import { collection, getDocs, addDoc } from 'firebase/firestore'

export default function Dashboard({ creator, onDiscover, onLogout, theme: t }) {
  const { score, name, city, language, niche, instagram, followers, state } = creator
  const [displayScore, setDisplayScore] = useState(0)
  const [campaigns, setCampaigns] = useState([])
  const [tab, setTab] = useState('score')
  const [appliedCampaigns, setAppliedCampaigns] = useState([])
const [applying, setApplying] = useState(null)

const applyCampaign = async (campaign) => {
  setApplying(campaign.id)
  try {
    await addDoc(collection(db, 'applications'), {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      brandName: campaign.brandName,
      creatorName: name,
      creatorInstagram: instagram,
      creatorScore: score.total,
      creatorCity: city,
      creatorLanguage: language,
      status: 'pending',
      appliedAt: new Date()
    })
    setAppliedCampaigns(prev => [...prev, campaign.id])
  } catch (e) {
    alert('Error applying!')
    console.error(e)
  }
  setApplying(null)
}
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let start = 0
    const end = score.total
    const duration = 1500
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setDisplayScore(end); clearInterval(timer) }
      else setDisplayScore(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [score.total])

  useEffect(() => {
    const fetchCampaigns = async () => {
      const fallbackCampaigns = getLocalCampaigns()
      let allCampaigns = []
      try {
        const snap = await getDocs(collection(db, 'campaigns'))
        const realCampaigns = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Deduplicate
        const merged = [...realCampaigns]
        const seenIds = new Set(realCampaigns.map(c => c.id))
        const seenCampaignKeys = new Set(realCampaigns.map(c => `${c.brandName}-${c.title}`))
        
        fallbackCampaigns.forEach(c => {
          const key = `${c.brandName}-${c.title}`
          if (!seenIds.has(c.id) && !seenCampaignKeys.has(key)) {
            merged.push(c)
            seenIds.add(c.id)
            seenCampaignKeys.add(key)
          }
        })
        allCampaigns = merged
      } catch (e) {
        console.error("Firestore campaigns fetch failed, using local storage fallback:", e)
        allCampaigns = fallbackCampaigns
      }

      // Show campaigns matching creator's city/state/language/niche
      const matching = allCampaigns.filter(c =>
        c.status === 'open' && (
          c.city === city ||
          c.state === state ||
          c.language === language ||
          c.language === 'Any' ||
          !c.language
        )
      )
      setCampaigns(matching)
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  const pillars = [
    { label: 'Engagement Authenticity', value: score.engagementAuth, color: '#7c4dcc' },
    { label: 'Audience Sentiment', value: score.audienceSentiment, color: '#9b6dd6' },
    { label: 'Content Consistency', value: score.contentConsistency, color: '#b39ddb' },
    { label: 'Local Relevance', value: score.localRelevance, color: '#ce93d8' },
  ]

  const getGrade = (s) => s >= 80 ? 'Excellent' : s >= 65 ? 'Good' : s >= 50 ? 'Average' : 'Needs Work'
  const getColor = (s) => s >= 80 ? '#7c4dcc' : s >= 65 ? '#9b6dd6' : s >= 50 ? '#f0a500' : '#e57373'

  const card = {
    background: t.card, border: `1.5px solid ${t.border}`,
    borderRadius: '16px', padding: '24px', boxShadow: t.shadow
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'Inter, sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.png" alt="LOKL" style={{ height: '40px', marginBottom: '12px' }} />
          <div style={{ color: t.purple, fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>CREATOR DASHBOARD</div>
          <h2 style={{ margin: '6px 0 4px', fontSize: '24px', fontWeight: '800' }}>Welcome, {name.split(' ')[0]}! 👋</h2>
          <p style={{ margin: 0, color: t.muted, fontSize: '13px' }}>{city}, {state} · {language} · {niche}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { key: 'score', label: '🛡️ My Score' },
            { key: 'campaigns', label: `📋 Campaigns (${campaigns.length})` },
            { key: 'profile', label: '👤 Profile' },
          ].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              background: tab === tb.key ? t.purple : t.card,
              color: tab === tb.key ? 'white' : t.muted,
              border: `1.5px solid ${tab === tb.key ? t.purple : t.border}`,
              borderRadius: '8px', padding: '8px 16px',
              fontWeight: '700', fontSize: '12px', cursor: 'pointer'
            }}>{tb.label}</button>
          ))}
        </div>

        {/* Score Tab */}
        {tab === 'score' && (
          <div>
            <div style={{ ...card, textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: t.muted, letterSpacing: '2px', fontWeight: '700', marginBottom: '8px' }}>TRUSTTRACE SCORE</div>
              <div style={{ fontSize: '88px', fontWeight: '900', color: getColor(score.total), lineHeight: '1' }}>{displayScore}</div>
              <div style={{
                display: 'inline-block', background: getColor(score.total),
                color: 'white', padding: '4px 18px', borderRadius: '20px',
                fontSize: '12px', fontWeight: '700', marginTop: '8px'
              }}>{getGrade(score.total)}</div>
              <div style={{ background: t.dark ? 'rgba(255,255,255,0.1)' : '#f0e8ff', borderRadius: '8px', height: '10px', marginTop: '20px', overflow: 'hidden' }}>
                <div style={{ width: `${displayScore}%`, height: '100%', background: `linear-gradient(90deg, #7c4dcc, #ce93d8)`, borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: t.muted, marginTop: '4px' }}>
                <span>0</span><span>Engagement Rate: {score.engagementRate}%</span><span>100</span>
              </div>
            </div>

            <div style={{ ...card, marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '14px', fontWeight: '700' }}>Score Breakdown</h3>
              {pillars.map(p => (
                <div key={p.label} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px' }}>{p.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: p.color }}>{p.value}/100</span>
                  </div>
                  <div style={{ background: t.dark ? 'rgba(255,255,255,0.1)' : '#f0e8ff', borderRadius: '8px', height: '7px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.value}%`, height: '100%', background: p.color, borderRadius: '8px' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: t.dark ? 'rgba(124,77,204,0.15)' : '#f5eeff',
              border: `1.5px solid ${t.dark ? 'rgba(124,77,204,0.3)' : '#ddd0f5'}`,
              borderRadius: '16px', padding: '20px', marginBottom: '16px'
            }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '700', color: t.purple }}>💡 Improve Your Score</h3>
              <ul style={{ margin: 0, paddingLeft: '18px', color: t.muted, lineHeight: '2', fontSize: '13px' }}>
                {score.contentConsistency < 70 && <li>Post more consistently — aim for 5+ times a week</li>}
                {score.engagementAuth < 70 && <li>Reply to every comment — boosts engagement authenticity</li>}
                {score.localRelevance < 70 && <li>Tag your city and use local hashtags in every post</li>}
                {score.audienceSentiment < 70 && <li>Ask questions in captions to get more real comments</li>}
                <li>Create content in {language} for higher local relevance</li>
              </ul>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {tab === 'campaigns' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', color: t.muted, padding: '60px' }}>Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <div style={{ color: t.muted, fontSize: '15px', fontWeight: '600' }}>No campaigns in your area yet</div>
                <div style={{ color: t.purple, fontSize: '13px', marginTop: '4px' }}>Check back soon — brands are joining!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {campaigns.map(c => (
                  <div key={c.id} style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{c.title}</div>
                        <div style={{ color: t.muted, fontSize: '12px', marginTop: '2px' }}>{c.brandName} · {c.city}</div>
                      </div>
                      <span style={{
                        background: '#10b981', color: 'white',
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '700'
                      }}>OPEN</span>
                    </div>
                    {c.description && (
                      <div style={{ fontSize: '13px', color: t.muted, marginBottom: '10px' }}>{c.description}</div>
                    )}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {[c.budget, c.language !== 'Any' ? c.language : null, c.deliverables].filter(Boolean).map(tag => (
                        <span key={tag} style={{
                          background: t.dark ? 'rgba(124,77,204,0.2)' : '#f0e8ff',
                          color: t.purple, padding: '3px 10px',
                          borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                        }}>{tag}</span>
                      ))}
                    </div>
                    {appliedCampaigns.includes(c.id) ? (
                  <div style={{
                      width: '100%', background: '#10b981', color: 'white',
                         border: 'none', padding: '10px', borderRadius: '8px',
                        fontSize: '13px', fontWeight: '700', textAlign: 'center'
                     }}>✅ Applied Successfully</div>
) : (
  <button onClick={() => applyCampaign(c)} disabled={applying === c.id} style={{
    width: '100%', background: applying === c.id ? '#b39ddb' : t.purple, color: 'white',
    border: 'none', padding: '10px', borderRadius: '8px',
    fontSize: '13px', fontWeight: '700', cursor: applying === c.id ? 'not-allowed' : 'pointer'
  }}>{applying === c.id ? 'Applying...' : 'Apply for this Campaign →'}</button>
)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div style={card}>
            <h3 style={{ margin: '0 0 18px', fontSize: '14px', fontWeight: '700' }}>Your Creator Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Instagram', value: instagram },
                { label: 'City', value: city },
                { label: 'State', value: state },
                { label: 'Language', value: language },
                { label: 'Niche', value: niche || 'Not set' },
                { label: 'Followers', value: parseInt(followers).toLocaleString('en-IN') },
                { label: 'Avg Likes', value: creator.avgLikes },
                { label: 'Avg Comments', value: creator.avgComments },
                { label: 'Posts/Week', value: creator.postsPerWeek },
                { label: 'Local Followers', value: creator.localFollowerPct + '%' },
                { label: 'Engagement Rate', value: score.engagementRate + '%' },
                { label: 'Status', value: '✅ Verified' },
              ].map(item => (
                <div key={item.label} style={{
                  background: t.dark ? 'rgba(255,255,255,0.05)' : '#faf5ff',
                  borderRadius: '10px', padding: '10px 14px',
                  border: `1px solid ${t.border}`
                }}>
                  <div style={{ fontSize: '10px', color: t.muted, marginBottom: '3px', fontWeight: '600', letterSpacing: '0.5px' }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: t.text }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onLogout} style={{ width: '100%', background: 'transparent', color: t.muted, border: 'none', padding: '16px', fontSize: '13px', cursor: 'pointer', marginTop: '16px', fontWeight: '600' }}>🚪 Logout</button>
      </div>
    </div>
  )
}