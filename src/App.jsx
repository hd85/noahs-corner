import { useState } from 'react'
import Home from './screens/Home.jsx'
import Session from './screens/Session.jsx'
import Recap from './screens/Recap.jsx'
import { getSessionCount, completeSession } from './storage.js'

// Root of the app: which screen we're on, the chosen mode, how many sessions
// Noah has done (loaded from the browser's memory), and the answers from the
// session in progress.
export default function App() {
  const [screen, setScreen] = useState('home')
  const [mode, setMode] = useState(null)
  const [sessionCount, setSessionCount] = useState(() => getSessionCount())
  const [answers, setAnswers] = useState([])

  function handleStart(chosenMode) {
    setMode(chosenMode)
    setAnswers([])
    setScreen('session')
  }

  function handleComplete(sessionAnswers) {
    setAnswers(sessionAnswers)
    // Save the finished session and bump the count so Noah climbs the rungs.
    const entry = { date: new Date().toISOString(), mode, items: sessionAnswers }
    const newCount = completeSession(entry)
    setSessionCount(newCount)
    setScreen('recap')
  }

  function handleDone() {
    setScreen('home')
  }

  if (screen === 'home') {
    return <Home sessionCount={sessionCount} onStart={handleStart} />
  }

  if (screen === 'session') {
    // Use the count as it was BEFORE this session so the rung is based on
    // completed sessions. We pass the current stored value at start time.
    return <Session mode={mode} sessionCount={sessionCount} onComplete={handleComplete} />
  }

  return <Recap answers={answers} onDone={handleDone} />
}
