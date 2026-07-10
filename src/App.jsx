import { useState } from 'react'
import Home from './screens/Home.jsx'

// Root of the app. Holds which screen we're on and the session count.
// For now only the Home screen exists; the Session and Recap screens plug in
// here in the next steps. Session count is a placeholder until we add saving.
export default function App() {
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState(null)
  const [sessionCount] = useState(0)

  function handleStart(chosenMode) {
    setMode(chosenMode)
    setScreen('session')
  }

  if (screen === 'home') {
    return <Home sessionCount={sessionCount} onStart={handleStart} />
  }

  // Placeholder until the Session screen is built in the next step.
  return (
    <div style={{ padding: 24, fontFamily: "'Baloo 2', sans-serif" }}>
      Starting a {mode} session… (this screen is next)
    </div>
  )
}
