import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'English']
const NICHES = ['Food & Dining', 'Fashion', 'Education', 'Real Estate', 'Wedding', 'Fitness', 'Travel', 'Comedy', 'Tech', 'Local Services']
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu & Kashmir']
const STATE_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamsala'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
  'Meghalaya': ['Shillong', 'Tura'],
  'Manipur': ['Imphal'],
  'Tripura': ['Agartala'],
  'Nagaland': ['Kohima', 'Dimapur'],
  'Mizoram': ['Aizawl'],
  'Sikkim': ['Gangtok'],
}

function calculateRealScore(form) {
  const followers = parseInt(form.followers) || 0
  const avgLikes = parseInt(form.avgLikes) || 0
  const avgComments = parseInt(form.avgComments) || 0
  const postsPerWeek = parseFloat(form.postsPerWeek) || 0
  const localFollowerPct = parseInt(form.localFollowerPct) || 0

  // 1. Engagement Authenticity (30%)
  // Real engagement rate = (likes + comments) / followers * 100
  const engagementRate = followers > 0 ? ((avgLikes + avgComments) / followers) * 100 : 0
  // Good engagement: nano <10k = 5-10%, micro = 2-5%, big = 1-2%
  let engagementAuth
  if (followers < 10000) {
    engagementAuth = Math.min(100, Math.round((engagementRate / 8) * 100))
  } else if (followers < 100000) {
    engagementAuth = Math.min(100, Math.round((engagementRate / 4) * 100))
  } else {
    engagementAuth = Math.min(100, Math.round((engagementRate / 2) * 100))
  }

  // 2. Audience Sentiment (25%)
  // Comment ratio = comments / likes — higher means more genuine engagement
  const commentRatio = avgLikes > 0 ? (avgComments / avgLikes) * 100 : 0
  const audienceSentiment = Math.min(100, Math.round(commentRatio * 10 + 40))

  // 3. Content Consistency (25%)
  // Based on posting frequency — 7/week = 100, 1/week = ~40
  const contentConsistency = Math.min(100, Math.round(postsPerWeek * 14))

  // 4. Local Relevance (20%)
  // Directly from self-reported local follower %
  const localRelevance = Math.min(100, localFollowerPct)

  // Weighted total
  const total = Math.round(
    engagementAuth * 0.30 +
    audienceSentiment * 0.25 +
    contentConsistency * 0.25 +
    localRelevance * 0.20
  )

  return { total, engagementAuth, audienceSentiment, contentConsistency, localRelevance, engagementRate: engagementRate.toFixed(2) }
}

export default function Signup({ onDone, onBack, theme: t }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', state: '', city: '', pincode: '', language: '', niche: '',
    instagram: '', followers: '', avgLikes: '', avgComments: '',
    postsPerWeek: '', localFollowerPct: '', bio: ''
  })
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    if (!form.language) { alert('Please select language!'); return }
    setLoading(true)
    try {
      const score = calculateRealScore(form)
      const data = { ...form, followers: parseInt(form.followers), score, type: 'creator', createdAt: new Date() }
      const ref = await addDoc(collection(db, 'creators'), data)
      onDone({ ...data, id: ref.id })
    } catch (e) {
      alert('Error saving!'); console.error(e)
    }
    setLoading(false)
  }

  const inp = {
    width: '100%', background: t.inputBg,
    border: `1.5px solid ${t.border}`, borderRadius: '8px',
    padding: '11px 12px', color: t.text, fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif'
  }

  const label = (text) => (
    <label style={{ display: 'block', fontSize: '12px', color: t.muted, marginBottom: '5px', fontWeight: '600' }}>{text}</label>
  )

  return (
    <div style={{
      minHeight: '100vh', background: t.bg, color: t.text,
      fontFamily: 'Inter, sans-serif', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: t.card, border: `1.5px solid ${t.border}`,
        borderRadius: '20px', padding: '36px', width: '100%',
        maxWidth: '520px', boxShadow: t.shadow
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.png" alt="LOKL" style={{ height: '38px', marginBottom: '10px' }} />
          <div style={{ color: t.purple, fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>CREATOR SIGNUP</div>
          <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800' }}>Join LOKL</h2>
        </div>

        {/* Step bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              flex: 1, height: '4px', borderRadius: '4px',
              background: s <= step ? t.purple : t.border
            }}/>
          ))}
        </div>

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: t.purple, margin: '0 0 16px' }}>👤 Basic Info</p>
            <div style={{ marginBottom: '14px' }}>{label('Full Name *')}<input name="name" placeholder="Priya Sharma" value={form.name} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '14px' }}>{label('Instagram Handle *')}<input name="instagram" placeholder="@priyaeats" value={form.instagram} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '14px' }}>{label('Total Followers *')}<input name="followers" type="number" placeholder="8500" value={form.followers} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '20px' }}>{label('Bio')}<input name="bio" placeholder="Tamil food creator in Coimbatore" value={form.bio} onChange={handle} style={inp}/></div>
            <button onClick={() => {
              if (!form.name || !form.instagram || !form.followers) { alert('Fill required fields!'); return }
              setStep(2)
            }} style={{ width: '100%', background: t.purple, color: 'white', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Next → Real Engagement Data
            </button>
          </div>
        )}

        {/* STEP 2: Real Engagement Data */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: t.purple, margin: '0 0 4px' }}>📊 Real Engagement Data</p>
            <p style={{ fontSize: '11px', color: t.muted, margin: '0 0 16px' }}>This is used to calculate your actual TrustTrace score — be honest!</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>{label('Avg Likes per Post *')}<input name="avgLikes" type="number" placeholder="420" value={form.avgLikes} onChange={handle} style={inp}/></div>
              <div>{label('Avg Comments per Post *')}<input name="avgComments" type="number" placeholder="28" value={form.avgComments} onChange={handle} style={inp}/></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>{label('Posts per Week *')}<input name="postsPerWeek" type="number" placeholder="4" value={form.postsPerWeek} onChange={handle} style={inp}/></div>
              <div>{label('% Local Followers *')}<input name="localFollowerPct" type="number" placeholder="65" min="0" max="100" value={form.localFollowerPct} onChange={handle} style={inp}/></div>
            </div>

            {/* Live score preview */}
            {form.avgLikes && form.avgComments && form.postsPerWeek && form.localFollowerPct && (
              <div style={{
                background: t.dark ? 'rgba(124,77,204,0.15)' : '#f5eeff',
                border: `1.5px solid ${t.border}`, borderRadius: '10px',
                padding: '14px', marginBottom: '14px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: t.muted, fontWeight: '600' }}>YOUR ESTIMATED TRUSTTRACE SCORE</div>
                <div style={{ fontSize: '48px', fontWeight: '900', color: t.purple }}>
                  {calculateRealScore(form).total}
                </div>
                <div style={{ fontSize: '11px', color: t.muted }}>Engagement Rate: {calculateRealScore(form).engagementRate}%</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: t.inputBg, color: t.purple, border: `1.5px solid ${t.border}`, padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
              <button onClick={() => {
                if (!form.avgLikes || !form.avgComments || !form.postsPerWeek || !form.localFollowerPct) { alert('Fill all fields!'); return }
                setStep(3)
              }} style={{ flex: 2, background: t.purple, color: 'white', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                Next → Location & Content
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Location + Content */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: t.purple, margin: '0 0 16px' }}>📍 Location & Content</p>

            <div style={{ marginBottom: '14px' }}>
              {label('State *')}
              <select name="state" value={form.state} onChange={e => { handle(e); setForm(f => ({...f, city: ''})) }} style={inp}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {form.state && (
              <div style={{ marginBottom: '14px' }}>
                {label('City *')}
                <select name="city" value={form.city} onChange={handle} style={inp}>
                  <option value="">Select city</option>
                  {(STATE_CITIES[form.state] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>{label('PIN Code')}<input name="pincode" placeholder="641001" value={form.pincode} onChange={handle} style={inp}/></div>

            <div style={{ marginBottom: '14px' }}>
              {label('Primary Language *')}
              <select name="language" value={form.language} onChange={handle} style={inp}>
                <option value="">Select language</option>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              {label('Niche')}
              <select name="niche" value={form.niche} onChange={handle} style={inp}>
                <option value="">Select niche</option>
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Final summary */}
            <div style={{
              background: t.dark ? 'rgba(124,77,204,0.1)' : '#f5eeff',
              border: `1.5px solid ${t.border}`, borderRadius: '10px',
              padding: '12px', marginBottom: '16px', fontSize: '12px', color: t.muted, lineHeight: '1.8'
            }}>
              <div>👤 {form.name} · {form.instagram} · {parseInt(form.followers).toLocaleString('en-IN')} followers</div>
              <div>📊 {form.avgLikes} avg likes · {form.avgComments} avg comments · {form.postsPerWeek}x/week</div>
              <div>📍 {form.city}, {form.state} · {form.language}</div>
              <div>🎯 TrustTrace Score: <b style={{ color: t.purple }}>{calculateRealScore(form).total}</b></div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: t.inputBg, color: t.purple, border: `1.5px solid ${t.border}`, padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
              <button onClick={submit} disabled={loading} style={{ flex: 2, background: loading ? '#b39ddb' : t.purple, color: 'white', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Saving...' : '🚀 Get My TrustTrace Score'}
              </button>
            </div>
          </div>
        )}

        <button onClick={onBack} style={{ width: '100%', background: 'transparent', color: t.muted, border: 'none', padding: '12px', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>← Back to Home</button>
      </div>
    </div>
  )
}