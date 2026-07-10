// topics.js — what each session's questions are *about*.
//
// Two pools: things Noah already loves (comfort) and new things to gently
// widen his world (expanding). Early on it's almost all comfort; over the
// first ~30 sessions the mix drifts so more new topics appear. There is
// always at least one comfort topic in every session.

export const COMFORT_TOPICS = [
  'Arsenal FC and football',
  'Formula 1 racing',
  'Mario (video games, characters, worlds)',
  'Stillwater the tiger cartoon',
  'world maps and countries',
  'big numbers and counting',
  'lions, tigers and animals',
  'Bluey cartoon',
  'the Prophets of the Quran (Ibrahim, Musa, Isa, Yusuf, Nuh, Dawud, Sulaiman, Yunus, Adam)',
]

export const EXPANDING_TOPICS = [
  'outer space and planets',
  'the deep ocean and sea creatures',
  'ancient Egypt and pyramids',
  'weather and storms',
  'cooking and food from different countries',
  'musical instruments',
  'volcanoes',
  'trains and railways',
  'rainforests',
  'birds of prey',
  'the Arctic and penguins',
  'dinosaurs',
  'robots and inventions',
  'how things are made',
  'different languages and scripts',
  'mountains and rivers',
  'knights and castles',
  'the human body',
]

// How many topics to surface for one session's questions.
export const TOPICS_PER_SESSION = 4

// The share of topics that should come from the comfort pool for a given
// session. Starts at ~0.9 (session 0) and drifts down to ~0.6 by session 30,
// then holds steady.
export function comfortRatio(sessionCount) {
  const start = 0.9
  const end = 0.6
  const overSessions = 30
  const t = Math.min(sessionCount, overSessions) / overSessions
  return start + (end - start) * t
}

// Fisher–Yates shuffle on a copy — leaves the original array untouched.
function shuffled(list) {
  const copy = list.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Pick the topics for one session. Returns an array of topic strings, mixed
// according to the session count, always with at least one comfort topic,
// never repeating a topic within the same session.
export function getTopicsForSession(sessionCount, count = TOPICS_PER_SESSION) {
  const ratio = comfortRatio(sessionCount)

  // How many comfort topics: round the target share, but guarantee at least
  // one comfort topic and leave room for at least one expanding topic once
  // we're past the very early sessions.
  let comfortCount = Math.round(count * ratio)
  comfortCount = Math.max(1, Math.min(count, comfortCount))

  const comfortPicks = shuffled(COMFORT_TOPICS).slice(0, comfortCount)
  const expandingPicks = shuffled(EXPANDING_TOPICS).slice(0, count - comfortCount)

  return shuffled([...comfortPicks, ...expandingPicks])
}
