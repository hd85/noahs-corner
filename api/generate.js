// api/generate.js — the private server code (a "serverless function").
//
// This runs on Vercel's servers, NOT in Noah's browser. That matters because
// it holds the Anthropic API key (the secret password for writing questions).
// The browser asks THIS for questions; it never talks to Anthropic directly,
// so the key is never exposed to anyone visiting the site.
//
// It accepts: POST { rung: 1|2|3, topics: string[], count: number }
// It returns: { prompts: [...] }  (shape depends on the rung)

const MODEL = 'claude-sonnet-4-6'
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'

// Build the instruction we send to Claude for each rung.
function buildPrompt(rung, topics, count) {
  const topicList = topics.join(', ')

  if (rung === 3) {
    return `Create ${count} open, imaginative, no-wrong-answer questions for a 5-year-old named Noah.
Topics this session: ${topicList}.
Each should be specific, contained, and silly enough that there is nothing to get wrong (like "If you could add one secret rule to football, what would it be?").
At least one should gently introduce something new (not just his usual favourites).
For Prophet topics: keep it reverent and age-appropriate.
Return ONLY valid JSON, no other text:
{"prompts":[{"question":"..."}]}`
  }

  const reasonLine =
    rung === 2
      ? `After the choice, add one gentle "one reason" follow-up in a "reason_prompt" field — one thing only, it does not need to be clever.\n`
      : ''
  const shape =
    rung === 2
      ? `{"prompts":[{"question":"...","a":{"label":"...","emoji":"..."},"b":{"label":"...","emoji":"..."},"reason_prompt":"..."}]}`
      : `{"prompts":[{"question":"...","a":{"label":"...","emoji":"..."},"b":{"label":"...","emoji":"..."}}]}`

  return `Create ${count} "which would you pick" questions for a 5-year-old named Noah.
Each has two vivid, concrete options. Topics this session: ${topicList}.
At least one should gently introduce something new (not just his usual favourites).
For Prophet questions: frame as "which story would you want to hear again" or "which Prophet's adventure sounds more exciting" — reverent but age-appropriate.
Options: 2-4 words + emoji.
${reasonLine}Return ONLY valid JSON, no other text:
${shape}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' })
    return
  }

  try {
    const { rung = 1, topics = [], count = 1 } = req.body || {}
    const prompt = buildPrompt(rung, topics, count)

    const anthropicRes = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text()
      res.status(502).json({ error: 'Anthropic request failed', detail })
      return
    }

    const data = await anthropicRes.json()
    const text = data?.content?.[0]?.text ?? ''

    // Claude was told to return only JSON, but strip any stray prose just in
    // case by grabbing the outermost { ... } block.
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    const jsonSlice = start !== -1 && end !== -1 ? text.slice(start, end + 1) : text
    const parsed = JSON.parse(jsonSlice)

    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'Generation failed', detail: String(err) })
  }
}
