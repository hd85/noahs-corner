// storage.js — the app's memory.
//
// Everything lives in the browser's localStorage (no backend). We keep it
// small and forgiving: if storage is ever unavailable (some private-browsing
// modes), every read returns a safe default and every write quietly no-ops.
// The app must never crash over saving.
//
// Keys:
//   nc-sessions       number  — how many sessions Noah has completed
//   nc-history        array   — a short log of what he picked, most recent last
//   nc-reading-level  number  — v2 reading layer (1–5), set by Dad, not the app

const SESSIONS_KEY = 'nc-sessions'
const HISTORY_KEY = 'nc-history'
const READING_KEY = 'nc-reading-level'

// Keep the history from growing forever.
const MAX_HISTORY = 60

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (_e) {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (_e) {
    // Storage unavailable — carry on without saving.
  }
}

// How many sessions Noah has completed (drives the rung system).
export function getSessionCount() {
  const n = read(SESSIONS_KEY, 0)
  return typeof n === 'number' && n >= 0 ? n : 0
}

// Record that a session just finished. Returns the new count.
export function completeSession(entry) {
  const count = getSessionCount() + 1
  write(SESSIONS_KEY, count)

  const history = getHistory()
  history.push(entry)
  write(HISTORY_KEY, history.slice(-MAX_HISTORY))

  return count
}

// The full saved history (oldest first).
export function getHistory() {
  const h = read(HISTORY_KEY, [])
  return Array.isArray(h) ? h : []
}

// Write both progress values at once (used as a local cache alongside cloud
// sync). Keeps the local copy in step with what's saved to the cloud.
export function saveLocal(sessions, history) {
  write(SESSIONS_KEY, sessions)
  write(HISTORY_KEY, history.slice(-MAX_HISTORY))
}

export const MAX_HISTORY_ENTRIES = MAX_HISTORY

// v2 reading layer — advanced manually by Dad, never by the app.
export function getReadingLevel() {
  const n = read(READING_KEY, 1)
  return typeof n === 'number' && n >= 1 && n <= 5 ? n : 1
}

export function setReadingLevel(level) {
  write(READING_KEY, level)
}
