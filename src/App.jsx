import { useEffect, useState } from 'react'
import LiquidBackground from './components/LiquidBackground'
import ModeSwitch from './components/ModeSwitch'
import Panel2D from './components/Panel2D'
import Panel3D from './components/Panel3D'
import { checkHealth, DEMO_MODE } from './api'

export default function App() {
  const [mode, setMode] = useState('2d')
  const [backendOnline, setBackendOnline] = useState(DEMO_MODE)

  useEffect(() => {
    checkHealth().then(setBackendOnline)
  }, [])

  return (
    <div className="app-shell">
      <LiquidBackground mode={mode} />

      {/* <header className="app-header">
        <div className="brand">
          <div className="brand-mark" />
          <div className="brand-text">
            <strong>NeuroGlass</strong>
            <span>Brain Tumor AI</span>
          </div>
        </div>
        <div className="status-pill glass">
          <span className={`status-dot ${backendOnline ? '' : 'offline'}`} />
          {DEMO_MODE ? 'Demo mode' : backendOnline ? 'Backend connected' : 'Backend offline'}
        </div>
      </header> */}

      <div className="hero">
        <h1>Two models, one view into the brain.</h1>
        <p>
          The 2D CNN classifies tumor type from a single slice. The 3D U-Net
          segments and localizes tumors across the full volume. Switch between
          them below — they answer different questions, on purpose.
        </p>
      </div>

      <ModeSwitch mode={mode} onChange={setMode} />

      {mode === '2d' ? <Panel2D /> : <Panel3D />}

      {/* <p className="footer-note">
        {DEMO_MODE
          ? <>Running in demo mode with simulated predictions. Point <code>VITE_API_BASE_URL</code> at your inference backend and set <code>VITE_DEMO_MODE=false</code> to go live.</>
          : <>Connected to <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</code></>}
      </p> */}
    </div>
  )
}
