// fallback.js — the safety net.
//
// Normally the app writes fresh questions for Noah using the Anthropic API.
// But if the internet hiccups, or a response comes back garbled, we must
// NEVER show Noah an error. Instead we quietly reach into this bank of
// hand-written questions and the session carries on as if nothing happened.
//
// The shapes here match exactly what the live generator returns:
//   Rung 1: { question, a:{label,emoji}, b:{label,emoji} }
//   Rung 2: same, plus reason_prompt
//   Rung 3: { question }   (open-ended, no A/B)

const RUNG1 = [
  { question: 'Which would you pick?', a: { label: 'Arsenal goal', emoji: '⚽' }, b: { label: 'F1 race win', emoji: '🏎️' } },
  { question: 'Which sounds more fun?', a: { label: 'Mario jump', emoji: '🍄' }, b: { label: 'Star coin', emoji: '⭐' } },
  { question: 'Which would you rather see?', a: { label: 'A big lion', emoji: '🦁' }, b: { label: 'A striped tiger', emoji: '🐯' } },
  { question: 'Which would you pick?', a: { label: 'Play with Bluey', emoji: '🐶' }, b: { label: 'Meet Stillwater', emoji: '🐅' } },
  { question: 'Which is more exciting?', a: { label: 'Count to 100', emoji: '🔢' }, b: { label: 'Find a country', emoji: '🗺️' } },
  { question: 'Which story again?', a: { label: 'Nuh and the ark', emoji: '🚢' }, b: { label: 'Yunus and the whale', emoji: '🐋' } },
  { question: 'Which would you explore?', a: { label: 'Deep ocean', emoji: '🌊' }, b: { label: 'Outer space', emoji: '🚀' } },
  { question: 'Which would you pick?', a: { label: 'A roaring volcano', emoji: '🌋' }, b: { label: 'A big dinosaur', emoji: '🦕' } },
  { question: 'Which sounds cooler?', a: { label: 'A fast train', emoji: '🚂' }, b: { label: 'A tall castle', emoji: '🏰' } },
  { question: 'Which would you rather?', a: { label: 'A snowy Arctic', emoji: '🐧' }, b: { label: 'A green rainforest', emoji: '🦜' } },
]

const RUNG2 = [
  { question: 'Which would you pick?', a: { label: 'Score a goal', emoji: '⚽' }, b: { label: 'Make a save', emoji: '🧤' }, reason_prompt: 'What makes that one the best?' },
  { question: 'Which is more fun?', a: { label: 'Mario world', emoji: '🍄' }, b: { label: 'Race track', emoji: '🏁' }, reason_prompt: 'Why did you pick that one?' },
  { question: 'Which animal would you be?', a: { label: 'A lion', emoji: '🦁' }, b: { label: 'An eagle', emoji: '🦅' }, reason_prompt: 'What would you do first?' },
  { question: 'Which story again?', a: { label: 'Musa and the sea', emoji: '🌊' }, b: { label: 'Dawud the shepherd', emoji: '🐑' }, reason_prompt: 'What do you like about it?' },
  { question: 'Which would you visit?', a: { label: 'The pyramids', emoji: '🔺' }, b: { label: 'A tall mountain', emoji: '⛰️' }, reason_prompt: 'Why there?' },
  { question: 'Which would you rather ride?', a: { label: 'A fast train', emoji: '🚂' }, b: { label: 'A rocket', emoji: '🚀' }, reason_prompt: 'Where would you go?' },
  { question: 'Which sounds tastier?', a: { label: 'Pizza from Italy', emoji: '🍕' }, b: { label: 'Curry from India', emoji: '🍛' }, reason_prompt: 'What makes it yummy?' },
  { question: 'Which weather is best?', a: { label: 'A big storm', emoji: '⛈️' }, b: { label: 'Bright sunshine', emoji: '☀️' }, reason_prompt: 'Why do you like it?' },
]

const RUNG3 = [
  { question: 'If you could add one secret rule to football, what would it be?' },
  { question: 'If you designed a new Mario level, what would be in it?' },
  { question: 'If your very own F1 car could do one magic thing, what would it do?' },
  { question: 'If Stillwater the tiger came to your house, what would you show him first?' },
  { question: 'If you could give one animal a superpower, which animal and what power?' },
  { question: 'If you could ask one Prophet one question, who would it be and what would you ask?' },
  { question: 'If you could build a new country, what would you put in it?' },
  { question: 'If you found a door at the bottom of the ocean, what would be behind it?' },
  { question: 'If you could invent a new dinosaur, what would it look like?' },
  { question: 'If you could ride a train to anywhere in space, where would it go?' },
]

const BANKS = { 1: RUNG1, 2: RUNG2, 3: RUNG3 }

// Fisher–Yates shuffle on a copy — original untouched.
function shuffled(list) {
  const copy = list.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Return `count` backup prompts for the given rung. Falls back to Rung 1 if
// an unknown rung is passed. If the bank is smaller than count (it won't be),
// it repeats picks rather than returning too few.
export function getFallbackPrompts(rung, count) {
  const bank = BANKS[rung] || BANKS[1]
  const picks = shuffled(bank)
  while (picks.length < count) {
    picks.push(...shuffled(bank))
  }
  return picks.slice(0, count)
}
