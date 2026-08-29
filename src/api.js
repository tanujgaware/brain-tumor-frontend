// ============================================================
// API client — talks to the (not-yet-built) backend that wraps
// the 2D CNN and the 3D U-Net. Endpoints are a proposal, not a
// contract: adjust the paths/fields to match your FastAPI/Flask
// service once it exists. See README.md for the expected shape.
// ============================================================

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Flip this off once your backend is real. While true, the app
// never makes a network call and instead returns believable fake
// results after a short delay, so the UI can be built/demoed
// independently of the model backend being finished.
export const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE ?? 'true') === 'true'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 2D classification: single MRI slice -> tumor type.
 * Expected real response shape:
 * {
 *   "prediction": "Glioma",
 *   "confidences": { "Glioma": 0.81, "Meningioma": 0.09, "Pituitary": 0.04, "No Tumor": 0.06 }
 * }
 */
export async function predict2D(file) {
  if (DEMO_MODE) {
    await wait(1400)
    const classes = ['Glioma', 'Meningioma', 'Pituitary', 'No Tumor']
    const raw = classes.map(() => Math.random())
    const sum = raw.reduce((a, b) => a + b, 0)
    let confidences = Object.fromEntries(classes.map((c, i) => [c, raw[i] / sum]))
    // bias one class up so the demo looks like a real prediction
    const winner = classes[Math.floor(Math.random() * classes.length)]
    confidences[winner] += 0.4
    const total = Object.values(confidences).reduce((a, b) => a + b, 0)
    confidences = Object.fromEntries(Object.entries(confidences).map(([k, v]) => [k, v / total]))
    const prediction = Object.entries(confidences).sort((a, b) => b[1] - a[1])[0][0]
    return { prediction, confidences, demo: true }
  }

  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_BASE}/api/predict/2d`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    throw new Error(`2D inference failed (${res.status})`)
  }
  return res.json()
}

/**
 * 3D segmentation: four modalities (t1n, t1c, t2w, t2f) -> tumor
 * detection + localization.
 * Expected real response shape:
 * {
 *   "tumor_detected": true,
 *   "dice": 0.8958,
 *   "voxel_count": 18234,
 *   "slices": ["<base64 png slice 0>", "<base64 png slice 1>", ...],
 *   "mask_slices": ["<base64 png mask overlay 0>", ...]
 * }
 */
export async function predict3D(modalities) {
  if (DEMO_MODE) {
    await wait(2200)
    const tumorDetected = Math.random() > 0.25
    return {
      tumor_detected: tumorDetected,
      dice: tumorDetected ? 0.83 + Math.random() * 0.08 : null,
      voxel_count: tumorDetected ? Math.floor(6000 + Math.random() * 20000) : 0,
      slice_count: 64,
      demo: true,
    }
  }

  const form = new FormData()
  Object.entries(modalities).forEach(([key, file]) => {
    if (file) form.append(key, file)
  })

  const res = await fetch(`${API_BASE}/api/predict/3d`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    throw new Error(`3D inference failed (${res.status})`)
  }
  return res.json()
}

export async function checkHealth() {
  if (DEMO_MODE) return true
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2500) })
    return res.ok
  } catch {
    return false
  }
}
