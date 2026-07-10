import { useEffect, useState } from 'react'
import { colors, font } from '../theme.js'
import { getTopicsForSession } from '../topics.js'
import { getSessionPrompts } from '../api.js'
import ChoiceCard from '../components/ChoiceCard.jsx'
import ActionBtn from '../components/ActionBtn.jsx'

// The heart of the app: Noah sees a question and responds.
//
// A session is 3 prompts. Each prompt knows its own rung (difficulty), so this
// screen adapts per prompt:
//   Rung 1: tap A or B.
//   Rung 2: tap A or B, then a reason moment.
//   Rung 3: an open question answered out loud.
//
// In Together mode, Dad always goes first. In Solo mode, it's just Noah.

export default function Session({ mode, sessionCount = 0, onComplete }) {
  const [prompts, setPrompts] = useState(null) // null = still loading
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState(mode === 'together' ? 'dad' : 'noah')
  const [work, setWork] = useState({ dadPick: null, noahPick: null, reason: '' })
  const [answers, setAnswers] = useState([])

  // Load this session's questions once, on mount.
  useEffect(() => {
    let live = true
    const topics = getTopicsForSession(sessionCount)
    getSessionPrompts(sessionCount, topics).then((p) => {
      if (live) setPrompts(p)
    })
    return () => {
      live = false
    }
  }, [sessionCount])

  if (!prompts) {
    return (
      <Centered>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
        <p style={{ color: colors.brownMid, fontSize: 19 }}>Getting today's questions ready…</p>
      </Centered>
    )
  }

  const prompt = prompts[idx]
  const rung = prompt.rung
  const isLast = idx === prompts.length - 1

  // Move to the next prompt, recording what happened on this one.
  function finishPrompt(answer) {
    const nextAnswers = [...answers, answer]
    if (isLast) {
      onComplete && onComplete(nextAnswers)
      return
    }
    setAnswers(nextAnswers)
    setIdx(idx + 1)
    setPhase(mode === 'together' ? 'dad' : 'noah')
    setWork({ dadPick: null, noahPick: null, reason: '' })
  }

  // --- Rung 1 & 2: the A/B choice ------------------------------------------
  function pickSide(side) {
    if (phase === 'dad') {
      setWork({ ...work, dadPick: side })
    } else if (phase === 'noah') {
      setWork({ ...work, noahPick: side })
    }
  }

  function cardState(side) {
    if (phase === 'dad') {
      if (work.dadPick == null) return 'idle'
      return work.dadPick === side ? 'dad' : 'dim'
    }
    // noah phase (or beyond)
    if (work.noahPick == null) return 'idle'
    return work.noahPick === side ? 'noah' : 'dim'
  }

  function recordAB(extra = {}) {
    const chosen = prompt[work.noahPick] // {label, emoji}
    finishPrompt({
      rung,
      question: prompt.question,
      noah: work.noahPick ? { pick: work.noahPick, ...chosen } : null,
      dad:
        work.dadPick && prompt[work.dadPick]
          ? { pick: work.dadPick, ...prompt[work.dadPick] }
          : null,
      ...extra,
    })
  }

  // --- Render --------------------------------------------------------------
  const progress = `${idx + 1} of ${prompts.length}`

  if (rung === 3) {
    return (
      <OpenPrompt
        prompt={prompt}
        phase={phase}
        mode={mode}
        progress={progress}
        onDadDone={() => setPhase('noah')}
        onAnswered={() =>
          finishPrompt({ rung, question: prompt.question, open: true })
        }
      />
    )
  }

  // Rung 1 / 2 shared A/B layout.
  return (
    <Shell progress={progress}>
      <TurnBanner phase={phase} mode={mode} />

      <h2
        style={{
          margin: '6px 0 4px',
          fontSize: 26,
          fontWeight: 700,
          color: colors.brown,
          textAlign: 'center',
          lineHeight: 1.25,
        }}
      >
        {prompt.question}
      </h2>

      {/* During Noah's turn (together mode), gently remind what Dad chose. */}
      {phase === 'noah' && work.dadPick && prompt[work.dadPick] && (
        <p style={{ textAlign: 'center', color: colors.sky, fontSize: 15, margin: '2px 0 8px' }}>
          Dad picked {prompt[work.dadPick].emoji} {prompt[work.dadPick].label}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, margin: '10px 0 18px' }}>
        <ChoiceCard
          emoji={prompt.a.emoji}
          label={prompt.a.label}
          state={cardState('a')}
          onClick={() => pickSide('a')}
        />
        <ChoiceCard
          emoji={prompt.b.emoji}
          label={prompt.b.label}
          state={cardState('b')}
          onClick={() => pickSide('b')}
        />
      </div>

      {/* Dad's turn: once he's picked, hand over to Noah. */}
      {phase === 'dad' && work.dadPick && (
        <ActionBtn onClick={() => setPhase('noah')}>Noah's turn →</ActionBtn>
      )}

      {/* Noah's turn: once he's picked... */}
      {phase === 'noah' && work.noahPick && rung === 1 && (
        <ActionBtn onClick={() => recordAB()}>{isLast ? 'All done →' : 'Next →'}</ActionBtn>
      )}
      {phase === 'noah' && work.noahPick && rung === 2 && (
        <ActionBtn onClick={() => setPhase('reason')}>Next →</ActionBtn>
      )}

      {/* Rung 2 reason moment. */}
      {phase === 'reason' && (
        <ReasonMoment
          mode={mode}
          reason={work.reason}
          onReason={(v) => setWork({ ...work, reason: v })}
          onDone={() => recordAB({ reason: work.reason.trim() || null })}
          isLast={isLast}
        />
      )}
    </Shell>
  )
}

// The line that tells whose turn it is (Together mode only).
function TurnBanner({ phase, mode }) {
  if (mode !== 'together') return null
  const text = phase === 'dad' ? '👨 Dad goes first — say it out loud' : '🧒 Now you, Noah!'
  const color = phase === 'dad' ? colors.sky : colors.sage
  return (
    <p style={{ textAlign: 'center', color, fontWeight: 600, fontSize: 16, margin: '0 0 4px' }}>
      {text}
    </p>
  )
}

// Rung 2's "one reason" step. Together: Dad jots the reason. Solo: no input,
// just an encouragement to tell someone.
function ReasonMoment({ mode, reason, onReason, onDone, isLast }) {
  if (mode === 'together') {
    return (
      <div>
        <p style={{ textAlign: 'center', color: colors.brownMid, fontSize: 17, marginBottom: 10 }}>
          Why did Noah pick that? Pop his reason here — one thing is plenty.
        </p>
        <textarea
          value={reason}
          onChange={(e) => onReason(e.target.value)}
          placeholder="Noah says…"
          rows={2}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: font.family,
            fontSize: 17,
            color: colors.brown,
            background: colors.paper,
            border: `2px solid ${colors.amberBorder}`,
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
            resize: 'none',
          }}
        />
        <ActionBtn onClick={onDone}>{isLast ? 'All done →' : 'Next →'}</ActionBtn>
      </div>
    )
  }
  return (
    <div>
      <p style={{ textAlign: 'center', color: colors.brownMid, fontSize: 19, marginBottom: 14 }}>
        Now tell someone your reason — just one thing! 🌟
      </p>
      <ActionBtn onClick={onDone}>{isLast ? 'All done →' : 'I told them →'}</ActionBtn>
    </div>
  )
}

// Rung 3's open question layout.
function OpenPrompt({ prompt, phase, mode, progress, onDadDone, onAnswered }) {
  const dadTurn = mode === 'together' && phase === 'dad'
  return (
    <Shell progress={progress}>
      {mode === 'together' && (
        <p
          style={{
            textAlign: 'center',
            color: dadTurn ? colors.sky : colors.sage,
            fontWeight: 600,
            fontSize: 16,
            margin: '0 0 8px',
          }}
        >
          {dadTurn ? '👨 Dad first — answer it out loud' : '🧒 Your turn, Noah!'}
        </p>
      )}
      <div
        style={{
          background: colors.amberLight,
          border: `2px solid ${colors.amberBorder}`,
          borderRadius: 22,
          padding: '28px 22px',
          margin: '8px 0 22px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: colors.brown,
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {prompt.question}
        </p>
      </div>
      {dadTurn ? (
        <ActionBtn onClick={onDadDone}>Dad answered ✓</ActionBtn>
      ) : (
        <ActionBtn onClick={onAnswered}>I answered it! →</ActionBtn>
      )}
    </Shell>
  )
}

// Page shell with a soft progress dot line at the top.
function Shell({ children, progress }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        fontFamily: font.family,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <p
          style={{
            textAlign: 'center',
            color: colors.mutedLight,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1,
            margin: '0 0 14px',
          }}
        >
          {progress}
        </p>
        {children}
      </div>
    </div>
  )
}

function Centered({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        fontFamily: font.family,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}
