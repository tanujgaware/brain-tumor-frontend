import { useRef, useState } from 'react'
import { predict2D } from '../api'
import ResultPanel2D from './ResultPanel2D'

const ACCEPTED = '.png,.jpg,.jpeg,.dcm'

export default function Panel2D() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }

  async function runAnalysis() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await predict2D(file)
      setResult(res)
    } catch (err) {
      setError(err.message || 'Something went wrong while classifying this scan.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="panel glass">
      <div className="panel-head">
        <div>
          <h2>2D Tumor Classification</h2>
          <p>Upload a single axial MRI slice. The 2D CNN sorts it into glioma, meningioma, pituitary, or no tumor.</p>
        </div>
        <span className="tag blue">2D CNN</span>
      </div>

      <div
        className={`dropzone ${file ? 'filled' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {preview ? (
          <img
            src={preview}
            alt="Selected MRI slice preview"
            style={{ maxHeight: 180, borderRadius: 14, marginBottom: 12 }}
          />
        ) : (
          <div className="dropzone-icon">🩻</div>
        )}
        <div className="dropzone-title">
          {file ? file.name : 'Drop an MRI slice here, or click to browse'}
        </div>
        <div className="dropzone-sub">PNG, JPG, or DICOM · single 2D slice</div>
      </div>

      <div className="action-row" style={{ marginTop: 20 }}>
        <button className="btn-primary blue" disabled={!file || loading} onClick={runAnalysis}>
          {loading ? 'Classifying…' : 'Classify scan'}
        </button>
        {file && (
          <button className="btn-ghost" onClick={reset} disabled={loading}>
            Clear
          </button>
        )}
      </div>

      {loading && (
        <>
          <div className="progress-track"><div className="progress-fill" /></div>
          <div className="progress-label">Running the 2D CNN over the slice…</div>
        </>
      )}

      {error && <div className="error-banner">{error}</div>}

      {result && <ResultPanel2D result={result} />}
    </div>
  )
}
