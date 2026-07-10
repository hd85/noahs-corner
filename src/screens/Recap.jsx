import { colors, font } from '../theme.js'
import ActionBtn from '../components/ActionBtn.jsx'

// The gentle ending. A small, warm summary of what Noah picked or shared —
// no scores, no stars — and then the single most important moment in the whole
// app: being asked to tell a real person one thing he picked.

export default function Recap({ answers = [], onDone }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        fontFamily: font.family,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, margin: 'auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 6 }}>🌟</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: colors.brown }}>
            Here's what you shared
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
          {answers.map((a, i) => (
            <RecapItem key={i} answer={a} />
          ))}
        </div>

        {/* The closing moment — the real confidence exercise, front and centre. */}
        <div
          style={{
            background: colors.amberLight,
            border: `2px solid ${colors.amberBorder}`,
            borderRadius: 22,
            padding: '24px 22px',
            textAlign: 'center',
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 34, marginBottom: 8 }}>💬</div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.brown, lineHeight: 1.35 }}>
            Can you tell someone what you picked today?
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 18, color: colors.brownMid }}>
            Just one thing.
          </p>
        </div>

        <ActionBtn onClick={onDone}>All done 🌙</ActionBtn>
      </div>
    </div>
  )
}

// One line of the summary. Adapts to what kind of prompt it was.
function RecapItem({ answer }) {
  // Open (Rung 3): he answered in his own words, out loud.
  if (answer.open) {
    return (
      <Card>
        <p style={{ margin: 0, fontSize: 15, color: colors.muted }}>You told your own story about…</p>
        <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 600, color: colors.brown }}>
          {answer.question}
        </p>
      </Card>
    )
  }

  // A/B (Rung 1 & 2): show what Noah picked, and his reason if Dad noted one.
  const pick = answer.noah
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 30 }}>{pick?.emoji}</span>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: colors.muted }}>You picked</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.sage }}>
            {pick?.label}
          </p>
        </div>
      </div>
      {answer.reason && (
        <p style={{ margin: '10px 0 0', fontSize: 16, color: colors.brownMid, fontStyle: 'italic' }}>
          “{answer.reason}”
        </p>
      )}
    </Card>
  )
}

function Card({ children }) {
  return (
    <div
      style={{
        background: colors.paper,
        border: `1.5px solid ${colors.sageBorder}`,
        borderRadius: 16,
        padding: '14px 16px',
      }}
    >
      {children}
    </div>
  )
}
