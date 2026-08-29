import { useRef, useState } from 'react'
import { predict3D } from '../api'
import ResultPanel3D from './ResultPanel3D'

const MODALITIES = [
  { key: 't1n', name: 'T1n', desc: 'Native T1-weighted' },
  { key: 't1c', name: 'T1c', desc: 'Post-contrast T1-weighted' },
  { key: 't2w', name: 'T2w', desc: 'T2-weighted' },
  { key: 't2f', name: 'T2f', desc: 'T2-FLAIR' },
]

export default function Panel3D() {
  const inputRefs = useRef({})
  const [files, setFiles] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const filledCount = Object.values(files).filter(Boolean).length
  const allFilled = filledCount === MODALITIES.length

  function setModalityFile(key, f) {
    if (!f) return
    setFiles((prev) => ({ ...prev, [key]: f }))
    setResult(null)
    setError(null)
  }

  async function runSegmentation() {
    if (!allFilled) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await predict3D(files)
      setResult(res)
    } catch (err) {
      setError(err.message || 'Something went wrong while segmenting this volume.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFiles({})
    setResult(null)
    setError(null)
  }

  return (
    <div className="panel glass">
      <div className="panel-head">
        <div>
          <h2>3D Tumor Segmentation</h2>
          <p>Upload all four MRI modalities for one patient. The 3D U-Net segments the volume and reports where the tumor is.</p>
        </div>
        <span className="tag violet">3D U-Net</span>
      </div>

      <div className="modality-grid">
        {MODALITIES.map(({ key, name, desc }) => (
          <div className={`modality-slot ${files[key] ? 'filled' : ''}`} key={key}>
            <label>
              <div className="modality-top">
                <span className="modality-name">{name}</span>
                {files[key] && <span aria-hidden="true">✓</span>}
              </div>
              <div className="modality-desc">{desc}</div>
              {files[key] ? (
                <div className="modality-file">{files[key].name}</div>
              ) : (
                <div className="modality-placeholder">.nii / .nii.gz not selected</div>
              )}
              <input
                ref={(el) => (inputRefs.current[key] = el)}
                type="file"
                accept=".nii,.nii.gz,application/gzip"
                onChange={(e) => setModalityFile(key, e.target.files?.[0])}
              />
              <button
                type="button"
                className="pick-btn"
                onClick={() => inputRefs.current[key]?.click()}
              >
                {files[key] ? 'Replace file' : 'Choose file'}
              </button>
            </label>
          </div>
        ))}
      </div>

      <div className="action-row">
        <button className="btn-primary violet" disabled={!allFilled || loading} onClick={runSegmentation}>
          {loading ? 'Segmenting…' : `Run segmentation (${filledCount}/4 loaded)`}
        </button>
        {filledCount > 0 && (
          <button className="btn-ghost" onClick={reset} disabled={loading}>
            Clear all
          </button>
        )}
      </div>

      {loading && (
        <>
          <div className="progress-track"><div className="progress-fill" /></div>
          <div className="progress-label">Preprocessing volume → tiling 64³ patches → running 3D U-Net…</div>
        </>
      )}

      {error && <div className="error-banner">{error}</div>}

      {result && <ResultPanel3D result={result} />}
    </div>
  )
}
