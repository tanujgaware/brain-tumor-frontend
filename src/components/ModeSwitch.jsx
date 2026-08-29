export default function ModeSwitch({ mode, onChange }) {
  return (
    <div className="mode-switch glass" role="tablist" aria-label="Analysis mode">
      <div className={`mode-thumb mode-${mode}`} />
      <button
        role="tab"
        aria-selected={mode === '2d'}
        className={`mode-btn ${mode === '2d' ? 'active' : ''}`}
        onClick={() => onChange('2d')}
      >
        <span aria-hidden="true">🧩</span> 2D Classification
      </button>
      <button
        role="tab"
        aria-selected={mode === '3d'}
        className={`mode-btn ${mode === '3d' ? 'active' : ''}`}
        onClick={() => onChange('3d')}
      >
        <span aria-hidden="true">🧠</span> 3D Analysis
      </button>
    </div>
  )
}
