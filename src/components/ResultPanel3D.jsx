import { useEffect, useRef, useState } from 'react'

export default function ResultPanel3D({ result }) {
  const { tumor_detected, dice, voxel_count, slice_count = 64, demo } = result
  const [sliceIndex, setSliceIndex] = useState(Math.floor(slice_count / 2))
  const [showMask, setShowMask] = useState(true)
  const canvasRef = useRef(null)

  // Renders a stand-in slice + mask overlay so the layout is real
  // even before the backend streams actual PNG slices. Swap this
  // for an <img src={`data:image/png;base64,${slices[sliceIndex]}`} />
  // once the backend returns real slice + mask_slices arrays.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = (canvas.width = 320)
    const h = (canvas.height = 240)

    ctx.fillStyle = '#05070d'
    ctx.fillRect(0, 0, w, h)

    // fake brain silhouette
    ctx.save()
    ctx.translate(w / 2, h / 2)
    const wobble = Math.sin(sliceIndex * 0.4) * 6
    ctx.beginPath()
    ctx.ellipse(0, 0, 100 + wobble * 0.3, 78 + wobble * 0.2, 0, 0, Math.PI * 2)
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 110)
    grad.addColorStop(0, 'rgba(180,190,210,0.9)')
    grad.addColorStop(1, 'rgba(70,80,100,0.4)')
    ctx.fillStyle = grad
    ctx.fill()
    ctx.restore()

    if (showMask && tumor_detected) {
      ctx.save()
      ctx.translate(w / 2 + 24, h / 2 - 10 + Math.sin(sliceIndex * 0.6) * 8)
      ctx.beginPath()
      const r = 18 + Math.abs(Math.sin(sliceIndex * 0.3)) * 10
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 90, 90, 0.55)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,159,69,0.9)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
    }
  }, [sliceIndex, showMask, tumor_detected])

  return (
    <div className="result-wrap">
      <div className={`result-banner ${tumor_detected ? 'positive' : 'negative'}`}>
        <div className="result-icon">{tumor_detected ? '⚠️' : '✅'}</div>
        <div>
          <h3>{tumor_detected ? 'Tumor detected' : 'No tumor detected'}</h3>
          <p>
            {tumor_detected
              ? 'The 3D U-Net segmented a tumor region — see the highlighted mask below.'
              : 'The 3D U-Net found no tumor voxels above threshold in this volume.'}
            {demo && ' (demo mode — connect the backend for real segmentation)'}
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-value mono">{dice ? dice.toFixed(4) : '—'}</div>
          <div className="metric-label">Dice score</div>
        </div>
        <div className="metric-card">
          <div className="metric-value mono">{voxel_count?.toLocaleString() ?? '—'}</div>
          <div className="metric-label">Tumor voxels</div>
        </div>
        <div className="metric-card">
          <div className="metric-value mono">64³</div>
          <div className="metric-label">Patch size</div>
        </div>
        <div className="metric-card">
          <div className="metric-value mono">{slice_count}</div>
          <div className="metric-label">Axial slices</div>
        </div>
      </div>

      <div className="slice-viewer">
        <canvas ref={canvasRef} />
        <div className="viewer-hint">
          <span>slice {sliceIndex + 1} / {slice_count}</span>
          <span>{tumor_detected && showMask ? 'mask overlay: on' : 'mask overlay: off'}</span>
        </div>
      </div>

      <div className="slice-controls">
        <input
          type="range"
          min={0}
          max={slice_count - 1}
          value={sliceIndex}
          onChange={(e) => setSliceIndex(Number(e.target.value))}
          aria-label="Scrub axial slice"
        />
        <div className="toggle-row">
          <span>Mask</span>
          <button
            type="button"
            className={`toggle ${showMask ? 'on' : ''}`}
            onClick={() => setShowMask((v) => !v)}
            aria-pressed={showMask}
            aria-label="Toggle tumor mask overlay"
          />
        </div>
      </div>
    </div>
  )
}
