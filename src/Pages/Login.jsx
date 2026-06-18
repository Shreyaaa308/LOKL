import { useState } from 'react'
import { findBrandAccount, findCreatorAccount } from '../accountStore'

export default function Login({ initialRole = 'creator', onCreatorLogin, onBrandLogin, onSignup, onBack, theme: t }) {
  const [role, setRole] = useState(initialRole)
  const [form, setForm] = useState({
    identifier: '',
    password: '',
  })

  const handle = (e) => {
    const { name, value } = e.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.identifier || !form.password) {
      alert('Enter login details and password!')
      return
    }

    if (role === 'creator') {
      const savedCreator = findCreatorAccount(form.identifier, form.password)
      if (savedCreator) {
        onCreatorLogin(savedCreator)
        return
      }

      alert('Creator account not found or password is incorrect. Create an account first.')
      return
    }

    const savedBrand = findBrandAccount(form.identifier, form.password)
    if (savedBrand) {
      onBrandLogin(savedBrand)
      return
    }

    alert('Business account not found or password is incorrect. Create an account first.')
  }

  const input = {
    width: '100%',
    background: t.inputBg,
    border: `1.5px solid ${t.border}`,
    borderRadius: '8px',
    padding: '12px',
    color: t.text,
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const label = (text) => (
    <label style={{ display: 'block', fontSize: '12px', color: t.muted, marginBottom: '6px', fontWeight: 700 }}>{text}</label>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      color: t.text,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <form onSubmit={submit} style={{
        background: t.card,
        border: `1.5px solid ${t.border}`,
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        padding: '34px',
        boxShadow: t.shadow,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <img src="/logo.png" alt="LOKL" style={{ height: '44px', marginBottom: '12px' }} />
          <div style={{ color: t.purple, fontSize: '11px', letterSpacing: '1px', fontWeight: 800 }}>LOGIN</div>
          <h2 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 900 }}>
            {role === 'creator' ? 'Creator Dashboard' : 'Business Dashboard'}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          <button type="button" onClick={() => setRole('creator')} style={{
            background: role === 'creator' ? t.purple : t.inputBg,
            color: role === 'creator' ? 'white' : t.purple,
            border: `1.5px solid ${role === 'creator' ? t.purple : t.border}`,
            borderRadius: '8px',
            padding: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}>Creator</button>
          <button type="button" onClick={() => setRole('brand')} style={{
            background: role === 'brand' ? t.purple : t.inputBg,
            color: role === 'brand' ? 'white' : t.purple,
            border: `1.5px solid ${role === 'brand' ? t.purple : t.border}`,
            borderRadius: '8px',
            padding: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}>Business</button>
        </div>

        <div style={{ marginBottom: '18px' }}>
          {label(role === 'creator' ? 'Instagram / Email / Name *' : 'Phone / Email / Business Name *')}
          <input name="identifier" value={form.identifier} onChange={handle} placeholder={role === 'creator' ? '@ananyaeats' : '9876543210'} style={input} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          {label('Password *')}
          <input name="password" type="password" value={form.password} onChange={handle} placeholder="Enter password" style={input} />
        </div>

        <button type="submit" style={{
          width: '100%',
          background: t.purple,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '15px',
          fontWeight: 900,
          cursor: 'pointer',
        }}>
          Login to {role === 'creator' ? 'Creator' : 'Business'} Dashboard
        </button>

        <button type="button" onClick={() => onSignup(role)} style={{
          width: '100%',
          background: 'transparent',
          color: t.purple,
          border: 'none',
          padding: '14px 0 6px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
        }}>
          New here? Create an account
        </button>
        <button type="button" onClick={onBack} style={{
          width: '100%',
          background: 'transparent',
          color: t.muted,
          border: 'none',
          padding: '8px 0 0',
          fontSize: '13px',
          cursor: 'pointer',
        }}>
          Back to Home
        </button>
      </form>
    </div>
  )
}

