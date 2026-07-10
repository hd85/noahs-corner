import { colors, font } from '../theme.js'

// One of the two options in a "which would you pick?" question.
//
// state controls the quiet visual acknowledgment:
//   'idle'  — normal paper card
//   'noah'  — Noah picked this: highlights sage green (received, no explosion)
//   'dad'   — Dad picked this out loud: highlights sky blue
//   'dim'   — the option that wasn't chosen: softly faded back
export default function ChoiceCard({ emoji, label, state = 'idle', onClick, disabled }) {
  const styles = {
    idle: { bg: colors.paper, border: colors.amberBorder, text: colors.brown },
    noah: { bg: colors.sageBg, border: colors.sage, text: colors.sage },
    dad: { bg: colors.skyBg, border: colors.sky, text: colors.sky },
    dim: { bg: colors.paper, border: colors.amberBorder, text: colors.muted },
  }
  const s = styles[state] || styles.idle

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: s.bg,
        border: `2.5px solid ${s.border}`,
        borderRadius: 22,
        padding: 16,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: font.family,
        opacity: state === 'dim' ? 0.55 : 1,
        transition: 'background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
      }}
    >
      <span style={{ fontSize: 46, lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color: s.text, textAlign: 'center' }}>
        {label}
      </span>
    </button>
  )
}
