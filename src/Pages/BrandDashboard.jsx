import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { getCreators, getLocalApplications, getLocalCampaigns, updateLocalApplicationStatus } from '../accountStore'
import ApplicationChat from '../components/ApplicationChat'

export default function BrandDashboard({ brand, onDiscover, onLogout, theme: t }) {
  const [creators, setCreators] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [applications, setApplications] = useState([])
  const [selectedApplicationId, setSelectedApplicationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('campaigns')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 1. Fetch creators from same city/state
      const fallbackCreators = getCreators()
      let allCreators
      try {
        const crSnap = await getDocs(collection(db, 'creators'))
        const realCreators = crSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Deduplicate creators
        const mergedCreators = [...realCreators]
        const seenCreatorIds = new Set(realCreators.map(c => c.id))
        const seenInstagrams = new Set(realCreators.map(c => c.instagram?.trim().toLowerCase()))
        
        fallbackCreators.forEach(c => {
          const normInsta = c.instagram?.trim().toLowerCase()
          if (!seenCreatorIds.has(c.id) && !seenInstagrams.has(normInsta)) {
            mergedCreators.push(c)
            seenCreatorIds.add(c.id)
            seenInstagrams.add(normInsta)
          }
        })
        allCreators = mergedCreators
      } catch (e) {
        console.error("Firestore creators fetch failed, using local storage fallback:", e)
        allCreators = fallbackCreators
      }
      
      const localCreators = allCreators.filter(c =>
        c.city === brand.city || c.state === brand.state
      )
      setCreators(localCreators)

      // 2. Fetch this brand's campaigns
      const fallbackCampaigns = getLocalCampaigns()
      let allCampaigns
      try {
        const campSnap = await getDocs(collection(db, 'campaigns'))
        const realCampaigns = campSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Deduplicate campaigns
        const mergedCampaigns = [...realCampaigns]
        const seenCampaignIds = new Set(realCampaigns.map(c => c.id))
        const seenCampaignKeys = new Set(realCampaigns.map(c => `${c.brandName}-${c.title}`))
        
        fallbackCampaigns.forEach(c => {
          const key = `${c.brandName}-${c.title}`
          if (!seenCampaignIds.has(c.id) && !seenCampaignKeys.has(key)) {
            mergedCampaigns.push(c)
            seenCampaignIds.add(c.id)
            seenCampaignKeys.add(key)
          }
        })
        allCampaigns = mergedCampaigns
      } catch (e) {
        console.error("Firestore campaigns fetch failed, using local storage fallback:", e)
        allCampaigns = fallbackCampaigns
      }

      const myBrandId = brand.id
      const myBrandName = brand.brandName?.trim().toLowerCase()
      const myCampaigns = allCampaigns.filter(c =>
         c.brandId && c.brandId === myBrandId
    )
      setCampaigns(myCampaigns)

      // 3. Fetch applications for this brand
      const localApplications = getLocalApplications()
      try {
        let realApplications = []
        if (myBrandId) {
          const appQuery = query(collection(db, 'applications'), where('brandId', '==', myBrandId))
          const appSnap = await getDocs(appQuery)
          realApplications = appSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        } else {
          const appSnap = await getDocs(collection(db, 'applications'))
          realApplications = appSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        }

        const mergedApplications = [...realApplications]
        const seenApplicationIds = new Set(realApplications.map(a => a.id))
        localApplications.forEach(a => {
          if (!seenApplicationIds.has(a.id)) {
            mergedApplications.push(a)
            seenApplicationIds.add(a.id)
          }
        })

        const myCampaignIds = new Set(myCampaigns.map(c => c.id))
        const myApplications = mergedApplications.filter(a =>
          (a.brandId && a.brandId === myBrandId) ||
          (a.campaignId && myCampaignIds.has(a.campaignId)) ||
          (a.brandName?.trim().toLowerCase() === myBrandName)
        )
        setApplications(myApplications)
        if (!selectedApplicationId && myApplications.length > 0) {
          setSelectedApplicationId(myApplications[0].id)
        }
      } catch (e) {
        console.error("Firestore applications fetch failed:", e)
        const myCampaignIds = new Set(myCampaigns.map(c => c.id))
        const myApplications = localApplications.filter(a =>
          (a.brandId && a.brandId === myBrandId) ||
          (a.campaignId && myCampaignIds.has(a.campaignId)) ||
          (a.brandName?.trim().toLowerCase() === myBrandName)
        )
        setApplications(myApplications)
        if (!selectedApplicationId && myApplications.length > 0) {
          setSelectedApplicationId(myApplications[0].id)
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [brand.id, brand.brandName, brand.city, brand.state, tab])

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status,
        statusUpdatedAt: new Date(),
      })
    } catch (e) {
      console.warn('Firestore application status update failed, updating local fallback:', e)
    } finally {
      updateLocalApplicationStatus(applicationId, status)
      setApplications(current => current.map(application => (
        application.id === applicationId ? { ...application, status } : application
      )))
    }
  }

  const getColor = (s) => s >= 80 ? '#7c4dcc' : s >= 65 ? '#9b6dd6' : s >= 50 ? '#f0a500' : '#e57373'

  const card = {
    background: t.card, border: `1.5px solid ${t.border}`,
    borderRadius: '14px', padding: '20px', boxShadow: t.shadow
  }
  const selectedApplication = applications.find(application => application.id === selectedApplicationId) || applications[0]

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'Inter, sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/logo.png" alt="LOKL" style={{ height: '40px', marginBottom: '12px' }} />
          <div style={{ color: t.purple, fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>BRAND DASHBOARD</div>
          <h2 style={{ margin: '6px 0 4px', fontSize: '24px', fontWeight: '800' }}>Welcome, {brand.brandName}! 🏪</h2>
          <p style={{ margin: 0, color: t.muted, fontSize: '13px' }}>{brand.city}, {brand.state} · {brand.category}</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Active Campaigns', value: campaigns.length },
            { label: 'Local Creators Found', value: creators.length },
            { label: 'City', value: brand.city },
          ].map(s => (
            <div key={s.label} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: '900', color: t.purple }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: t.muted, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
  { key: 'campaigns', label: '📋 My Campaigns' },
  { key: 'applications', label: `📨 Applications (${applications.length})` },
  { key: 'creators', label: '🎥 Local Creators' },
].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              background: tab === tb.key ? t.purple : t.card,
              color: tab === tb.key ? 'white' : t.muted,
              border: `1.5px solid ${tab === tb.key ? t.purple : t.border}`,
              borderRadius: '8px', padding: '8px 20px',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer'
            }}>{tb.label}</button>
          ))}
          <button onClick={onDiscover} style={{
            background: t.card, color: t.purple,
            border: `1.5px solid ${t.border}`,
            borderRadius: '8px', padding: '8px 20px',
            fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginLeft: 'auto'
          }}>🔍 Browse All Creators</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: t.muted, padding: '60px' }}>Loading...</div>
        ) : (
          <>
            {/* Campaigns Tab */}
            {tab === 'campaigns' && (
              <div>
                {campaigns.length === 0 ? (
                  <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                    <div style={{ color: t.muted, fontSize: '15px', fontWeight: '600' }}>No campaigns yet</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {campaigns.map(c => (
                      <div key={c.id} style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '16px' }}>{c.title}</div>
                            <div style={{ color: t.muted, fontSize: '12px', marginTop: '2px' }}>{c.description}</div>
                          </div>
                          <span style={{
                            background: '#10b981', color: 'white',
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: '700'
                          }}>OPEN</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {[c.budget, c.language, c.deliverables].filter(Boolean).map(tag => (
                            <span key={tag} style={{
                              background: t.dark ? 'rgba(124,77,204,0.2)' : '#f0e8ff',
                              color: t.purple, padding: '3px 10px',
                              borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                            }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
              {/* Applications Tab */}
            {tab === 'applications' && (
              <div>
                {applications.length === 0 ? (
                  <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📨</div>
                    <div style={{ color: t.muted, fontSize: '15px', fontWeight: '600' }}>No applications yet</div>
                    <div style={{ color: t.purple, fontSize: '13px', marginTop: '4px' }}>Creators will apply to your campaigns soon!</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {applications.map(a => (
                      <button key={a.id} onClick={() => setSelectedApplicationId(a.id)} style={{
                        ...card,
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: selectedApplication?.id === a.id ? 'rgba(139,92,246,0.18)' : t.card,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>{a.creatorName}</div>
                            <div style={{ color: t.muted, fontSize: '12px', marginTop: '2px' }}>{a.creatorInstagram} · {a.creatorCity}</div>
                          </div>
                          <div style={{
                            background: getColor(a.creatorScore || 0),
                            color: 'white', borderRadius: '8px',
                            padding: '4px 10px', fontWeight: '800', fontSize: '16px'
                          }}>{a.creatorScore}</div>
                        </div>
                        <div style={{ fontSize: '13px', color: t.muted, marginBottom: '10px' }}>
                          Applied for: <b style={{ color: t.text }}>{a.campaignTitle}</b>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            background: a.status === 'approved' ? '#10b981' : a.status === 'rejected' ? '#e57373' : '#f0a500',
                            color: 'white',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                          }}>{a.status || 'pending'}</span>
                          <span onClick={(event) => { event.stopPropagation(); updateApplicationStatus(a.id, 'approved') }} style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}>Approve</span>
                          <span onClick={(event) => { event.stopPropagation(); updateApplicationStatus(a.id, 'rejected') }} style={{
                            background: '#e57373',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800,
                          }}>Reject</span>
                        </div>
                      </button>
                    ))}
                    </div>
                    <ApplicationChat
                      application={selectedApplication}
                      currentRole="brand"
                      currentUserId={brand.id}
                      currentUserName={brand.brandName}
                      onStatusChange={(applicationId, status) => {
                        setApplications(current => current.map(application => (
                          application.id === applicationId ? { ...application, status } : application
                        )))
                      }}
                      theme={t}
                    />
                  </div>
                )}
              </div>
            )}
            {/* Local Creators Tab */}
            {tab === 'creators' && (
              <div>
                {creators.length === 0 ? (
                  <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>😔</div>
                    <div style={{ color: t.muted, fontSize: '15px', fontWeight: '600' }}>No creators found in {brand.city} yet</div>
                    <div style={{ color: t.purple, fontSize: '13px', marginTop: '4px' }}>Check back soon!</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {creators.map(c => (
                      <div key={c.id} style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{c.name}</div>
                            <div style={{ color: t.muted, fontSize: '12px' }}>{c.instagram}</div>
                          </div>
                          <div style={{
                            background: getColor(c.score?.total || 0),
                            color: 'white', borderRadius: '8px',
                            padding: '4px 10px', fontWeight: '800', fontSize: '16px'
                          }}>{c.score?.total || '—'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {[c.city, c.language, c.niche].filter(Boolean).map(tag => (
                            <span key={tag} style={{
                              background: t.dark ? 'rgba(124,77,204,0.2)' : '#f0e8ff',
                              color: t.purple, padding: '2px 8px',
                              borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                            }}>{tag}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: '12px', color: t.muted, marginBottom: '8px' }}>
                          {parseInt(c.followers || 0).toLocaleString('en-IN')} followers · {c.score?.engagementRate || '—'}% engagement
                        </div>
                        <div style={{ background: t.dark ? 'rgba(255,255,255,0.1)' : '#f0e8ff', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.score?.total || 0}%`, height: '100%', background: getColor(c.score?.total || 0), borderRadius: '4px' }} />
                        </div>
                        <div style={{ fontSize: '10px', color: t.muted, marginTop: '3px', fontWeight: '600' }}>TrustTrace Score</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <button onClick={onLogout} style={{ width: '100%', background: 'transparent', color: t.muted, border: 'none', padding: '16px', fontSize: '13px', cursor: 'pointer', marginTop: '24px', fontWeight: '600' }}>🚪 Logout</button>
      </div>
    </div>
  )
}
