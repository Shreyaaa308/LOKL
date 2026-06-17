import { useState } from 'react'
import Landing from './pages/Landing'
import CreatorSignup from './pages/Signup'
import BrandSignup from './pages/BrandSignup'
import Dashboard from './pages/Dashboard'
import BrandDashboard from './pages/BrandDashboard'
import Discover from './pages/Discover'

export default function App() {
  const [page, setPage] = useState('landing')
  const [creator, setCreator] = useState(null)
  const [brand, setBrand] = useState(null)
  const [dark, setDark] = useState(false)

  const theme = {
    dark,
    bg: dark ? 'linear-gradient(160deg, #1a0a3c 0%, #2d1b5e 50%, #0f0826 100%)' : 'linear-gradient(160deg, #fdf6ff 0%, #f3ebff 50%, #faf7ff 100%)',
    card: dark ? 'rgba(255,255,255,0.06)' : 'white',
    border: dark ? 'rgba(255,255,255,0.1)' : '#e8deff',
    text: dark ? '#f0e8ff' : '#1a0a3c',
    muted: dark ? '#a78bca' : '#7a6a9a',
    purple: '#7c4dcc',
    inputBg: dark ? 'rgba(255,255,255,0.08)' : '#faf5ff',
    shadow: dark ? '0 8px 40px rgba(0,0,0,0.4)' : '0 8px 40px rgba(124,77,204,0.08)',
  }

  const toggleBtn = (
    <button onClick={() => setDark(d => !d)} style={{
      position: 'fixed', top: '16px', right: '16px', zIndex: 1000,
      background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(124,77,204,0.1)',
      border: `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : '#d4c5f0'}`,
      borderRadius: '50px', padding: '8px 16px', cursor: 'pointer',
      fontSize: '14px', color: dark ? '#f0e8ff' : '#7c4dcc', fontWeight: '700',
    }}>
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )

  return (
    <div>
      {toggleBtn}
      {page === 'landing' && <Landing theme={theme} onCreator={() => setPage('creator-signup')} onBrand={() => setPage('brand-signup')} onDiscover={() => setPage('discover')} />}
      {page === 'creator-signup' && <CreatorSignup theme={theme} onDone={(data) => { setCreator(data); setPage('dashboard') }} onBack={() => setPage('landing')} />}
      {page === 'brand-signup' && <BrandSignup theme={theme} onDone={(data) => { setBrand(data); setPage('brand-dashboard') }} onBack={() => setPage('landing')} />}
      {page === 'dashboard' && <Dashboard theme={theme} creator={creator} onDiscover={() => setPage('discover')} onBack={() => setPage('landing')} />}
      {page === 'brand-dashboard' && <BrandDashboard theme={theme} brand={brand} onDiscover={() => setPage('discover')} onBack={() => setPage('landing')} />}
      {page === 'discover' && <Discover theme={theme} onBack={() => setPage('landing')} />}
    </div>
  )
}