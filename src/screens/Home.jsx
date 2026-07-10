import { colors, font } from '../theme.js'
import { getRung, getRungLabel } from '../rungs.js'
import ModeBtn from '../components/ModeBtn.jsx'

// The home screen. Calm landing page: a warm welcome, a soft label for where
// Noah is today (Exploring / Sharing / Storytelling — never a "level"), and a
// choice of how to play. Picking a mode starts a session.
export default function Home({ sessionCount = 0, onStart }) {
  const label = getRungLabel(getRung(sessionCount))

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
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🏡</div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, color: colors.brown }}>
            Noah's Corner
          </h1>

          {/* Soft "where you are today" badge — gentle, never a score. */}
          <div
            style={{
              display: 'inline-block',
              marginTop: 14,
              background: colors.sageBg,
              color: colors.sage,
              border: `1.5px solid ${colors.sageBorder}`,
              borderRadius: 999,
              padding: '5px 16px',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Today: {label}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ModeBtn
            emoji="👨‍👦"
            title="Together"
            subtitle="Dad and Noah, side by side"
            onClick={() => onStart && onStart('together')}
          />
          <ModeBtn
            emoji="🧒"
            title="On my own"
            subtitle="Just Noah"
            onClick={() => onStart && onStart('solo')}
          />
        </div>
      </div>
    </div>
  )
}
