import { useState } from 'react'
import Home from './screens/Home.jsx'
import Session from './screens/Session.jsx'

// Root of the app. Holds which screen we're on, the chosen mode, the session
// count, and the answers gathered during a session. The Recap screen plugs in
// at the next step; saving (localStorage) comes after that.
export default function App() {
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState(null)
  const [sessionCount] = useState(0)
  const [answers, setAnswers] = useState([])

  function handleStart(chosenMode) {
    setMode(chosenMode)
    setAnswers([])
    setScreen('session')
  }

  function handleComplete(sessionAnswers) {
    setAnswers(sessionAnswers)
    setScreen('recap')
  }

  if (screen === 'home') {
    return <Home sessionCount={sessionCount} onStart={handleStart} />
  }

  if (screen === 'session') {
    return <Session mode={mode} sessionCount={sessionCount} onComplete={handleComplete} />
  }

  // Placeholder until the Recap screen is built in the next step.
  return (
    <div style={{ padding: 24, fontFamily: "'Baloo 2', sans-serif" }}>
      <p>Session complete! Recap screen is next.</p>
      <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(answers, null, 2)}</pre>
    </div>
  )
}
