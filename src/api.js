// ============================================================
// API CLIENT
// ============================================================

export const API_BASE = "http://127.0.0.1:8001";

export const DEMO_MODE = false;

// ============================================================
// SMALL WAIT HELPER
// ============================================================

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// 2D PREDICTION
// ============================================================

export async function predict2D(file) {
  // ----------------------------------------------------------
  // DEMO MODE
  // ----------------------------------------------------------

  if (DEMO_MODE) {
    await wait(1400);

    const classes = ["Glioma", "Meningioma", "No Tumor", "Pituitary"];

    const raw = classes.map(() => Math.random());

    const sum = raw.reduce((a, b) => a + b, 0);

    let confidences = Object.fromEntries(
      classes.map((c, i) => [c, raw[i] / sum]),
    );

    const winner = classes[Math.floor(Math.random() * classes.length)];

    confidences[winner] += 0.4;

    const total = Object.values(confidences).reduce((a, b) => a + b, 0);

    confidences = Object.fromEntries(
      Object.entries(confidences).map(([k, v]) => [k, v / total]),
    );

    const prediction = Object.entries(confidences).sort(
      (a, b) => b[1] - a[1],
    )[0][0];

    return {
      prediction,
      confidences,
      demo: true,
    };
  }

  // ----------------------------------------------------------
  // REAL BACKEND
  // ----------------------------------------------------------

  const form = new FormData();

  form.append("file", file);

  console.log("Sending 2D MRI to:", `${API_BASE}/api/predict/2d`);

  const res = await fetch(`${API_BASE}/api/predict/2d`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();

    throw new Error(`2D inference failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ============================================================
// 3D SEGMENTATION
// ============================================================

export async function predict3D(modalities) {
  // ----------------------------------------------------------
  // CHECK FOUR FILES
  // ----------------------------------------------------------

  if (!modalities) {
    throw new Error("No MRI files were provided.");
  }

  const required = ["t1n", "t1c", "t2w", "t2f"];

  for (const key of required) {
    if (!modalities[key]) {
      throw new Error(`${key.toUpperCase()} MRI file is missing.`);
    }
  }

  // ----------------------------------------------------------
  // CREATE FORM DATA
  // ----------------------------------------------------------

  const form = new FormData();

  form.append("t1n", modalities.t1n);

  form.append("t1c", modalities.t1c);

  form.append("t2w", modalities.t2w);

  form.append("t2f", modalities.t2f);

  // ----------------------------------------------------------
  // DEBUG
  // ----------------------------------------------------------

  console.log("Sending 3D MRI files to:", `${API_BASE}/api/predict/3d`);

  console.log("T1n:", modalities.t1n.name);

  console.log("T1c:", modalities.t1c.name);

  console.log("T2w:", modalities.t2w.name);

  console.log("T2f:", modalities.t2f.name);

  // ----------------------------------------------------------
  // SEND REQUEST
  // ----------------------------------------------------------

  const res = await fetch(`${API_BASE}/api/predict/3d`, {
    method: "POST",
    body: form,
  });

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  if (!res.ok) {
    const text = await res.text();

    console.error("3D backend error:", text);

    throw new Error(`3D inference failed (${res.status}): ${text}`);
  }

  // ----------------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------------

  const data = await res.json();

  console.log("3D backend response:", data);

  return data;
}

// ============================================================
// BACKEND HEALTH CHECK
// ============================================================

export async function checkHealth() {
  if (DEMO_MODE) {
    return true;
  }

  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      signal: AbortSignal.timeout(2500),
    });

    return res.ok;
  } catch {
    return false;
  }
}
