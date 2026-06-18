import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { saveBrandAccount } from '../accountStore'

const saveWithTimeout = (promise, ms = 3000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase save timed out')), ms)
    ),
  ])

const CATEGORIES = ['Restaurant / Food', 'Fashion / Clothing', 'Education / Coaching', 'Real Estate', 'Wedding / Events', 'Fitness / Gym', 'Travel / Tourism', 'Tech / Apps', 'Retail / Shopping', 'Beauty / Salon', 'Healthcare', 'Other']
const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'English', 'Any']
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
const BUDGETS = ['Under ₹5,000', '₹5,000 – ₹15,000', '₹15,000 – ₹50,000', '₹50,000 – ₹1,00,000', 'Above ₹1,00,000']

export default function BrandSignup({ onDone, onBack, theme: t }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    brandName: '', ownerName: '', phone: '', password: '', category: '',
    state: '', city: '', pincode: '',
    campaignTitle: '', campaignDesc: '', budget: '', language: '', targetNiche: '',
    deliverables: ''
  })
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    if (!form.campaignTitle || !form.budget) { alert('Fill required fields!'); return }
    setLoading(true)
    const data = { ...form, type: 'brand', createdAt: new Date() }
    const campaign = {
      brandName: form.brandName,
      city: form.city,
      state: form.state,
      category: form.category,
      title: form.campaignTitle,
      description: form.campaignDesc,
      budget: form.budget,
      language: form.language,
      targetNiche: form.targetNiche,
      deliverables: form.deliverables,
      status: 'open',
      createdAt: new Date()
    }

    try {
      const ref = await saveWithTimeout(addDoc(collection(db, 'brands'), data))
      await saveWithTimeout(addDoc(collection(db, 'campaigns'), {
        brandId: ref.id,
        ...campaign,
      }))
      const savedBrand = { ...data, id: ref.id }
      saveBrandAccount(savedBrand)
      onDone(savedBrand)
    } catch (e) {
      console.warn('Using local business signup because Firebase is unavailable.', e)
      const savedBrand = { ...data, id: `local-${Date.now()}`, campaign }
      saveBrandAccount(savedBrand)
      onDone(savedBrand)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', background: t.inputBg,
    border: `1.5px solid ${t.border}`, borderRadius: '8px',
    padding: '11px 12px', color: t.text, fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif'
  }

  const lbl = (text) => (
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
          <div style={{ color: t.purple, fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>BUSINESS SIGNUP</div>
          <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: '800' }}>Find Local Creators</h2>
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

        {/* STEP 1: Business Info */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: t.purple, margin: '0 0 16px' }}>🏪 Business Info</p>
            <div style={{ marginBottom: '14px' }}>{lbl('Business Name *')}<input name="brandName" placeholder="Sharma Sweets" value={form.brandName} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '14px' }}>{lbl('Owner / Contact Name *')}<input name="ownerName" placeholder="Ramesh Sharma" value={form.ownerName} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '14px' }}>{lbl('Phone Number *')}<input name="phone" placeholder="9876543210" value={form.phone} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '14px' }}>{lbl('Password *')}<input name="password" type="password" placeholder="Create a password" value={form.password} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '20px' }}>
              {lbl('Business Category *')}
              <select name="category" value={form.category} onChange={handle} style={inp}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={() => {
              if (!form.brandName || !form.ownerName || !form.phone || !form.password || !form.category) { alert('Fill required fields!'); return }
              setStep(2)
            }} style={{ width: '100%', background: t.purple, color: 'white', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Next → Location
            </button>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: t.purple, margin: '0 0 16px' }}>📍 Business Location</p>
            <div style={{ marginBottom: '14px' }}>
              {lbl('State *')}
              <select name="state" value={form.state} onChange={e => { handle(e); setForm(f => ({...f, city: ''})) }} style={inp}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {form.state && (
              <div style={{ marginBottom: '14px' }}>
                {lbl('City *')}
                <select name="city" value={form.city} onChange={handle} style={inp}>
                  <option value="">Select city</option>
                  {(STATE_CITIES[form.state] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            <div style={{ marginBottom: '20px' }}>{lbl('PIN Code')}<input name="pincode" placeholder="400001" value={form.pincode} onChange={handle} style={inp}/></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: t.inputBg, color: t.purple, border: `1.5px solid ${t.border}`, padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
              <button onClick={() => {
                if (!form.state || !form.city) { alert('Select state and city!'); return }
                setStep(3)
              }} style={{ flex: 2, background: t.purple, color: 'white', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                Next → Campaign Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Campaign */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: t.purple, margin: '0 0 16px' }}>📋 Campaign Details</p>
            <div style={{ marginBottom: '14px' }}>{lbl('Campaign Title *')}<input name="campaignTitle" placeholder="Promote our new menu launch" value={form.campaignTitle} onChange={handle} style={inp}/></div>
            <div style={{ marginBottom: '14px' }}>
              {lbl('Campaign Description')}
              <textarea name="campaignDesc" placeholder="We want a local food creator to visit our restaurant and post a reel..." value={form.campaignDesc} onChange={handle} style={{ ...inp, height: '80px', resize: 'vertical' }}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                {lbl('Budget *')}
                <select name="budget" value={form.budget} onChange={handle} style={inp}>
                  <option value="">Select budget</option>
                  {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                {lbl('Creator Language')}
                <select name="language" value={form.language} onChange={handle} style={inp}>
                  <option value="">Any language</option>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>{lbl('Deliverables')}<input name="deliverables" placeholder="1 Instagram Reel + 2 Stories" value={form.deliverables} onChange={handle} style={inp}/></div>

            {/* Summary */}
            <div style={{
              background: t.dark ? 'rgba(124,77,204,0.1)' : '#f5eeff',
              border: `1.5px solid ${t.border}`, borderRadius: '10px',
              padding: '12px', marginBottom: '16px', fontSize: '12px', color: t.muted, lineHeight: '1.8'
            }}>
              <div>🏪 {form.brandName} · {form.city}, {form.state}</div>
              <div>📋 {form.campaignTitle}</div>
              <div>💰 Budget: {form.budget}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: t.inputBg, color: t.purple, border: `1.5px solid ${t.border}`, padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
              <button onClick={submit} disabled={loading} style={{ flex: 2, background: loading ? '#b39ddb' : t.purple, color: 'white', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Posting Campaign...' : '🚀 Post Campaign'}
              </button>
            </div>
          </div>
        )}

        <button onClick={onBack} style={{ width: '100%', background: 'transparent', color: t.muted, border: 'none', padding: '12px', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>← Back to Home</button>
      </div>
    </div>
  )
}
