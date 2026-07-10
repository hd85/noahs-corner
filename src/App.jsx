import { useEffect, useState } from 'react'
import Home from './screens/Home.jsx'
import Session from './screens/Session.jsx'
import Recap from './screens/Recap.jsx'
import Login from './screens/Login.jsx'
import { colors, font } from './theme.js'
import { getSessionCount, getHistory, saveLocal } from './storage.js'
import {
  isConfigured,
  getCurrentUser,
  onAuthChange,
  signOut,
  loadProgress,
  saveProgress,
} from './supabase.js'

// Root of the app.
//
// Two ways it can run:
//   • Cloud mode (Supabase configured): Dad signs in once per device; progress
//     is stored in the cloud and follows Noah to any device.
//   • Local mode (no Supabase): progress lives on this one device only.
// Everything below the sign-in gate is identical in both modes.
export default function App() {
  const [ready, setReady] = useState(false) // finished checking who's signed in
  const [user, setUser] = useState(null)

  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [history, setHistory] = useState([])
  const [answers, setAnswers] = useState([])

  // Local mode: just read from this device and go.
  useEffect(() => {
    if (isConfigured) return
    setSessionCount(getSessionCount())
    setHistory(getHistory())
    setReady(true)
  }, [])

  // Cloud mode: watch who's signed in.
  useEffect(() => {
    if (!isConfigured) return
    let alive = true
    getCurrentUser().then((u) => {
      if (!alive) return
      setUser(u)
      setReady(true)
    })
    const unsubscribe = onAuthChange((u) => {
      setUser(u)
      setReady(true)
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  // Cloud mode: when a user signs in, load their progress (seeding from this
  // device's local copy the very first time, so nothing already earned is lost).
  useEffect(() => {
    if (!isConfigured || !user) return
    let alive = true
    ;(async () => {
      try {
        const cloud = await loadProgress(user.id)
        if (!alive) return
        if (cloud) {
          setSessionCount(cloud.sessions || 0)
          setHistory(Array.isArray(cloud.history) ? cloud.history : [])
          saveLocal(cloud.sessions || 0, cloud.history || [])
        } else {
          // No row yet — seed it from whatever is on this device (often 0).
          const localCount = getSessionCount()
          const localHistory = getHistory()
          await saveProgress(user.id, localCount, localHistory)
          setSessionCount(localCount)
          setHistory(localHistory)
        }
      } catch (_err) {
        // If the cloud can't be reached, fall back to the local copy so Noah
        // can still play. It'll re-sync next time.
        setSessionCount(getSessionCount())
        setHistory(getHistory())
      }
    })()
    return () => {
      alive = false
    }
  }, [user])

  function handleStart(chosenMode) {
    setMode(chosenMode)
    setAnswers([])
    setScreen('session')
  }

  function handleComplete(sessionAnswers) {
    const entry = { date: new Date().toISOString(), mode, items: sessionAnswers }
    const newCount = sessionCount + 1
    const newHistory = [...history, entry].slice(-60)

    // Save locally always (fast + offline-safe), and to the cloud if signed in.
    saveLocal(newCount, newHistory)
    if (isConfigured && user) {
      saveProgress(user.id, newCount, newHistory).catch(() => {
        // Best effort — the local copy is already saved; it re-syncs next load.
      })
    }

    setSessionCount(newCount)
    setHistory(newHistory)
    setAnswers(sessionAnswers)
    setScreen('recap')
  }

  function handleDone() {
    setScreen('home')
  }

  async function handleSignOut() {
    await signOut()
    setScreen('home')
  }

  // --- Render ---------------------------------------------------------------

  if (!ready) return <Loading />

  // Cloud mode with nobody signed in → show the grown-up sign-in.
  if (isConfigured && !user) return <Login />

  if (screen === 'home') {
    return (
      <Home
        sessionCount={sessionCount}
        onStart={handleStart}
        accountEmail={isConfigured && user ? user.email : null}
        onSignOut={isConfigured && user ? handleSignOut : null}
      />
    )
  }

  if (screen === 'session') {
    return <Session mode={mode} sessionCount={sessionCount} onComplete={handleComplete} />
  }

  return <Recap answers={answers} onDone={handleDone} />
}

function Loading() {
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
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 12 }}>🏡</div>
      <p style={{ color: colors.muted, fontSize: 17 }}>Just a moment…</p>
    </div>
  )
}
