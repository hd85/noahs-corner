import { colors, font } from './theme.js'

// Root of the app. For now it just shows a calm placeholder so we can
// confirm the project runs. Screens and session logic come next.
export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background,
        color: colors.brown,
        fontFamily: font.family,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏡</div>
      <h1 style={{ margin: 0, fontWeight: 700, fontSize: 32 }}>Noah's Corner</h1>
      <p style={{ color: colors.brownMid, fontSize: 18, marginTop: 8 }}>
        A cozy place to share your thoughts.
      </p>
    </div>
  )
}
