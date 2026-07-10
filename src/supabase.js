// supabase.js — the cloud sync layer.
//
// Supabase safely handles Dad's login and stores Noah's progress in a tiny
// private database, so it follows him to any device he signs in on. The two
// connection values come from environment variables (safe to be public — the
// "RLS" lock in the database is what keeps each account's data private).
//
// If these env vars are missing, `isConfigured` is false and the whole app
// gracefully falls back to single-device localStorage — so nothing breaks.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isConfigured = Boolean(url && key)

export const supabase = isConfigured ? createClient(url, key) : null

// --- Auth (Dad signs in once per device; the session persists) -------------

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

// Subscribe to sign-in / sign-out. Returns an unsubscribe function.
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data?.user ?? null, error }
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  // If email confirmation is on, session is null until they confirm.
  return { user: data?.user ?? null, needsConfirm: !data?.session && !error, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

// --- Progress storage (one row per account) --------------------------------

// Returns { sessions, history } or null if this account has no row yet.
export async function loadProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('sessions, history')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

// Create or update this account's progress row.
export async function saveProgress(userId, sessions, history) {
  const { error } = await supabase.from('progress').upsert({
    user_id: userId,
    sessions,
    history,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
