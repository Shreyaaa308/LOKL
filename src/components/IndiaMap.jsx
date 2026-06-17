import { useState, useEffect, useRef } from 'react'

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh'
]

const STATE_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Patna'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar'],
  'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamsala', 'Solan', 'Mandi'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore'],
  'Ladakh': ['Leh', 'Kargil'],
  'Manipur': ['Imphal', 'Thoubal', 'Kakching'],
  'Meghalaya': ['Shillong', 'Tura', 'Cherrapunji'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing'],
}

export default function IndiaMap({ onSelect }) {
  const [selected, setSelected] = useState(null)
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')

  const filtered = STATES.filter(s => s.toLowerCase().includes(search.toLowerCase()))

  const handleState = (state) => {
    setSelected(state)
    setCity('')
  }

  const handleCity = (c) => {
    setCity(c)
    onSelect({ state: selected, city: c })
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Search */}
      <input
        placeholder="🔍 Search state..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          background: '#f5f0ff',
          border: '1.5px solid #d4c5f0',
          borderRadius: '8px',
          padding: '10px 12px',
          color: '#1a0a3c',
          fontSize: '14px',
          boxSizing: 'border-box',
          marginBottom: '12px',
          outline: 'none'
        }}
      />

      {/* States Grid */}
      {!selected && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          maxHeight: '240px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filtered.map(state => (
            <button
              key={state}
              onClick={() => handleState(state)}
              style={{
                background: '#f5f0ff',
                border: '1.5px solid #d4c5f0',
                borderRadius: '8px',
                padding: '8px 6px',
                fontSize: '11px',
                color: '#1a0a3c',
                cursor: 'pointer',
                fontWeight: '600',
                textAlign: 'center',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => { e.target.style.background = '#6c3fc5'; e.target.style.color = 'white' }}
              onMouseOut={e => { e.target.style.background = '#f5f0ff'; e.target.style.color = '#1a0a3c' }}
            >
              {state}
            </button>
          ))}
        </div>
      )}

      {/* Cities */}
      {selected && (
        <div>
          <button
            onClick={() => setSelected(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6c3fc5',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '12px',
              padding: 0
            }}
          >← Back to states</button>

          <div style={{
            background: '#f0ebff',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#6c3fc5'
          }}>📍 {selected}</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {(STATE_CITIES[selected] || ['Main City']).map(c => (
              <button
                key={c}
                onClick={() => handleCity(c)}
                style={{
                  background: city === c ? '#6c3fc5' : '#f5f0ff',
                  border: '1.5px solid #d4c5f0',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  color: city === c ? 'white' : '#1a0a3c',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {city && (
            <div style={{
              marginTop: '12px',
              background: '#6c3fc5',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'white',
              fontWeight: '700'
            }}>
              ✅ Selected: {city}, {selected}
            </div>
          )}
        </div>
      )}
    </div>
  )
}