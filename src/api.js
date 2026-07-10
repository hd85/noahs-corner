// api.js — how the browser gets its questions.
//
// The browser calls our own private server code at /api/generate (never
// Anthropic directly). We validate whatever comes back HARD: if anything is
// missing, malformed, or the request fails, we quietly swap in a hand-written
// backup question from fallback.js. Noah must never see an error.

import { getSessionShape } from './rungs.js'
import { getFallbackPrompts } from './fallback.js'

// Is this a well-formed A/B prompt (Rung 1 and 2)?
function validABPrompt(p, needsReason) {
  if (!p || typeof p.question !== 'string' || !p.question.trim()) return false
  for (const side of ['a', 'b']) {
    const s = p[side]
    if (!s || typeof s.label !== 'string' || !s.label.trim()) return false
    if (typeof s.emoji !== 'string' || !s.emoji.trim()) return false
  }
  if (needsReason && (typeof p.reason_prompt !== 'string' || !p.reason_prompt.trim())) {
    return false
  }
  return true
}

// Is this a well-formed open prompt (Rung 3)?
function validOpenPrompt(p) {
  return p && typeof p.question === 'string' && !!p.question.trim()
}

// Validate a batch of prompts for a rung. Returns the clean array, or null if
// the batch is unusable (so the caller can fall back).
function validateBatch(prompts, rung, count) {
  if (!Array.isArray(prompts) || prompts.length < count) return null
  const check = rung === 3 ? validOpenPrompt : (p) => validABPrompt(p, rung === 2)
  const clean = prompts.filter(check).slice(0, count)
  return clean.length === count ? clean : null
}

// Ask the server for `count` fresh prompts at a given rung. On ANY failure,
// return hand-written backups instead. Always resolves — never throws.
async function generateForRung(rung, topics, count) {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rung, topics, count }),
    })
    if (!res.ok) throw new Error('bad status ' + res.status)
    const data = await res.json()
    const clean = validateBatch(data?.prompts, rung, count)
    if (!clean) throw new Error('validation failed')
    return clean.map((p) => ({ ...p, rung }))
  } catch (_err) {
    return getFallbackPrompts(rung, count).map((p) => ({ ...p, rung }))
  }
}

// Build a whole session's worth of prompts, in order, matching the session
// shape (e.g. [1, 3, 3]). Each returned prompt carries its own `rung` so the
// screen knows how to display it. Fresh where possible, backups where not.
export async function getSessionPrompts(sessionCount, topics) {
  const shape = getSessionShape(sessionCount) // e.g. [1, 2, 2]

  // Group consecutive prompts by rung so we ask the server once per group.
  const counts = shape.reduce((acc, rung) => {
    acc[rung] = (acc[rung] || 0) + 1
    return acc
  }, {})

  // Generate each rung group (in parallel), then lay them back out in shape order.
  const rungs = Object.keys(counts).map(Number)
  const batches = {}
  await Promise.all(
    rungs.map(async (rung) => {
      batches[rung] = await generateForRung(rung, topics, counts[rung])
    }),
  )

  // Reassemble in the exact order of `shape`, drawing from each rung's batch.
  const cursor = {}
  return shape.map((rung) => {
    cursor[rung] = cursor[rung] || 0
    return batches[rung][cursor[rung]++]
  })
}
