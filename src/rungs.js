// rungs.js — the invisible difficulty system.
//
// Noah never sees any of this. Based only on how many sessions he has done,
// we decide which *kind* of question he gets. It is never framed as levels
// or progress.
//
//   Rung 1 (sessions 0–11):  React — "which would you pick?", tap A or B.
//   Rung 2 (sessions 12–27): Pick + one reason.
//   Rung 3 (sessions 28+):   Open, imaginative prompts.
//
// Home-screen labels (warm, never "level 1/2/3"):
//   1 -> Exploring, 2 -> Sharing, 3 -> Storytelling

export const RUNG_LABELS = {
  1: 'Exploring',
  2: 'Sharing',
  3: 'Storytelling',
}

// How many prompts a single session contains.
export const PROMPTS_PER_SESSION = 3

// Which rung is Noah currently on, from his total completed session count.
export function getRung(sessionCount) {
  if (sessionCount >= 28) return 3
  if (sessionCount >= 12) return 2
  return 1
}

// The warm label shown on the home screen for a given rung.
export function getRungLabel(rung) {
  return RUNG_LABELS[rung] || RUNG_LABELS[1]
}

// The shape of a session: an array of rung numbers, one per prompt.
//
// Every session ALWAYS starts with a Rung 1 warm-up (the first question is
// always safe), then moves to Noah's current rung for the remaining prompts.
// So a Rung 3 session looks like: [1, 3, 3].
export function getSessionShape(sessionCount) {
  const current = getRung(sessionCount)
  const shape = [1] // warm-up is always Rung 1
  while (shape.length < PROMPTS_PER_SESSION) {
    shape.push(current)
  }
  return shape
}
