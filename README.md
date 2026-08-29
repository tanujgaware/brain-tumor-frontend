# NeuroGlass — Brain Tumor AI Frontend

A React (Vite) frontend for the two-pipeline brain tumor project:

- **2D mode** — upload one MRI slice → 2D CNN → tumor type (Glioma / Meningioma / Pituitary / No Tumor)
- **3D mode** — upload all four BraTS modalities (T1n, T1c, T2w, T2f) → 3D U-Net → tumor detection + localization

Visual style: Apple "Liquid Glass" — translucent frosted panels, animated color-shifting background blobs, a sliding segmented control between the two modes.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

It opens on `http://localhost:5173`. **By default it runs in demo mode** (`VITE_DEMO_MODE=true`), so you can see and click through the full UI — including fake-but-realistic classification bars and segmentation results — with no backend running at all. This is deliberate, since your training is still at epoch 3/10 and the backend/API doesn't exist yet per your project notes.

## Wiring it to your real backend

When your FastAPI/Flask service is ready:

1. Set `VITE_DEMO_MODE=false` and `VITE_API_BASE_URL` to your server in `.env`.
2. Implement two endpoints (or rename the paths in `src/api.js` to match yours):

**`POST /api/predict/2d`** — multipart form, field `file` (the 2D slice image). Expected JSON response:
```json
{
  "prediction": "Glioma",
  "confidences": { "Glioma": 0.81, "Meningioma": 0.09, "Pituitary": 0.04, "No Tumor": 0.06 }
}
```

**`POST /api/predict/3d`** — multipart form with four fields: `t1n`, `t1c`, `t2w`, `t2f` (each a `.nii`/`.nii.gz`). Expected JSON response:
```json
{
  "tumor_detected": true,
  "dice": 0.8958,
  "voxel_count": 18234,
  "slice_count": 64,
  "slices": ["<base64 png, one per axial slice>", "..."],
  "mask_slices": ["<base64 png overlay, one per axial slice>", "..."]
}
```
The `slices` / `mask_slices` arrays are optional extras — the frontend currently draws a stand-in silhouette in `ResultPanel3D.jsx`. Once your backend returns real base64 slice PNGs, swap the `<canvas>` drawing for:
```jsx
<img src={`data:image/png;base64,${slices[sliceIndex]}`} />
```

**`GET /api/health`** (optional) — return `200 OK` so the status pill in the header shows "Backend connected".

3. Remember your dataset note: don't present the current validation Dice (0.8958) as final — once you run the untouched test-patient evaluation, wire that number in instead.

## Project structure

```
src/
├── App.jsx                    # shell: header, hero, mode switch, panel routing
├── api.js                     # backend client + demo-mode mocks
├── index.css                  # liquid glass design system (tokens + all styles)
└── components/
    ├── LiquidBackground.jsx   # animated blurred gradient blobs, color shifts by mode
    ├── ModeSwitch.jsx         # segmented 2D/3D control
    ├── Panel2D.jsx            # single-slice upload + classify
    ├── ResultPanel2D.jsx      # classification bars
    ├── Panel3D.jsx            # 4-modality upload + segment
    └── ResultPanel3D.jsx      # detection banner, metrics, slice scrubber
```

## Notes

- This only builds the frontend. It does not touch your `brain-tumor-3d` training code — point it at a backend that loads `models/unet3d_best.pth` (or the equivalent 2D checkpoint) and exposes the two endpoints above.
- The 2D and 3D panels intentionally show different result shapes (classification vs. detection+localization) — that mirrors the real difference between your two pipelines, so don't merge them into one generic "result" component later.
