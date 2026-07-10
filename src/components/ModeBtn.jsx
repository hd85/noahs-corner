import { colors, font } from '../theme.js'

// A big, friendly mode button for the home screen. Warm paper card, generous
// tap target for small fingers on a phone.
export default function ModeBtn({ emoji, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        textAlign: 'left',
        background: colors.paper,
        border: `2px solid ${colors.amberBorder}`,
        borderRadius: 20,
        padding: '20px 22px',
        cursor: 'pointer',
        fontFamily: font.family,
        boxShadow: '0 2px 0 rgba(44, 24, 16, 0.04)',
      }}
    >
      <span style={{ fontSize: 40, lineHeight: 1 }}>{emoji}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: colors.brown }}>{title}</span>
        <span style={{ fontSize: 15, color: colors.muted }}>{subtitle}</span>
      </span>
    </button>
  )
}
