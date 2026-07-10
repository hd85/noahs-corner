import { colors, font } from '../theme.js'

// The primary "move forward" button. Warm amber. Big and easy to tap.
// variant: 'primary' (amber) or 'soft' (quiet outline).
export default function ActionBtn({ children, onClick, disabled, variant = 'primary' }) {
  const primary = variant === 'primary'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        border: primary ? 'none' : `2px solid ${colors.amberBorder}`,
        background: disabled ? colors.mutedLight : primary ? colors.amber : colors.paper,
        color: primary ? '#fff' : colors.brownMid,
        fontFamily: font.family,
        fontSize: 20,
        fontWeight: 700,
        borderRadius: 16,
        padding: '16px 20px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  )
}
