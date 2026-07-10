import { useState } from 'react'
import { colors, font } from '../theme.js'
import { signIn, signUp } from '../supabase.js'
import ActionBtn from '../components/ActionBtn.jsx'

// A quiet, grown-up sign-in screen. Dad signs in here once per device; the
// app then stays signed in, so Noah never sees this. Handles both signing in
// and creating the account the first time.
export default function Login() {
  const [mode, setMode] = useState('in') // 'in' = sign in, 'up' = create account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    setMessage('')
    if (!email.trim() || !password) {
      setMessage('Please fill in both boxes.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'up') {
        const { needsConfirm, error } = await signUp(email.trim(), password)
        if (error) setMessage(friendly(error.message))
        else if (needsConfirm) setMessage('Almost there — check your email to confirm, then sign in.')
        // On success with no confirmation needed, the app switches automatically.
      } else {
        const { error } = await signIn(email.trim(), password)
        if (error) setMessage(friendly(error.message))
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        fontFamily: font.family,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏡</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: colors.brown }}>
            Noah's Corner
          </h1>
          <p style={{ color: colors.muted, fontSize: 15, marginTop: 8 }}>
            {mode === 'up'
              ? "Create the grown-up account (once). Noah won't see this again."
              : 'A quick grown-up sign-in on this device.'}
          </p>
        </div>

        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
        />

        {message && (
          <p style={{ color: colors.amber, fontSize: 14, margin: '4px 0 12px', textAlign: 'center' }}>
            {message}
          </p>
        )}

        <div style={{ marginTop: 8 }}>
          <ActionBtn disabled={busy}>
            {busy ? 'One moment…' : mode === 'up' ? 'Create account' : 'Sign in'}
          </ActionBtn>
        </div>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in')
            setMessage('')
          }}
          style={{
            display: 'block',
            margin: '16px auto 0',
            background: 'none',
            border: 'none',
            color: colors.sky,
            fontFamily: font.family,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          {mode === 'in' ? 'First time? Create the account' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, type, value, onChange, autoComplete }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 14, color: colors.brownMid, marginBottom: 4 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: font.family,
          fontSize: 17,
          color: colors.brown,
          background: colors.paper,
          border: `2px solid ${colors.amberBorder}`,
          borderRadius: 12,
          padding: '12px 14px',
        }}
      />
    </label>
  )
}

// Turn a few common Supabase error messages into gentle plain English.
function friendly(msg) {
  const m = (msg || '').toLowerCase()
  if (m.includes('invalid login')) return "That email and password don't match. Try again?"
  if (m.includes('already registered')) return 'That email already has an account — try signing in instead.'
  if (m.includes('password')) return 'Password needs to be at least 6 characters.'
  return msg || 'Something went wrong. Please try again.'
}
