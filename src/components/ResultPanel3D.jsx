const PLANES = [
  {
    key: "axial",
    label: "Axial",
  },
  {
    key: "coronal",
    label: "Coronal",
  },
  {
    key: "sagittal",
    label: "Sagittal",
  },
];

function formatProbability(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return `${(Number(value) * 100).toFixed(2)}%`;
}


function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-value">
        {value}
      </div>

      <div className="metric-label">
        {label}
      </div>
    </div>
  );
}


/*
  Backend returns raw Base64.

  Example:
  iVBORw0KGgoAAAANSUhEUg...

  Browser needs:
  data:image/png;base64,iVBORw0KGgoAAAANS...
*/

function getImageSrc(src) {
  if (!src) {
    return null;
  }

  // If backend already sends data URI
  if (src.startsWith("data:image")) {
    return src;
  }

  // Backend currently sends raw Base64
  return `data:image/png;base64,${src}`;
}


function VisualizationCard({
  title,
  src,
  emptyText,
  type,
}) {
  const imageSrc = getImageSrc(src);

  return (
    <div className={`result-image-card ${type || ""}`}>

      <div className="result-image-title">
        {title}
      </div>

      <div className="result-image-container">

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="result-image"
          />
        ) : (
          <div className="result-image-empty">
            {emptyText}
          </div>
        )}

      </div>

    </div>
  );
}


function PlaneVisualization({
  plane,
  planeData,
}) {
  return (
    <div className="plane-visualization">

      {/* ------------------------------------------
          PLANE TITLE
         ------------------------------------------ */}

      <div className="plane-title">
        {plane.label}
      </div>


      {/* ------------------------------------------
          FOUR IMAGE COLUMNS
         ------------------------------------------ */}

      <div className="visualization-grid">

        <VisualizationCard
          title={`${plane.label} — Input MRI`}
          src={planeData?.input}
          emptyText="Input MRI visualization unavailable."
          type="input"
        />


        <VisualizationCard
          title={`${plane.label} — Ground Truth`}
          src={planeData?.ground_truth}
          emptyText="Ground truth not provided for this prediction."
          type="ground-truth"
        />


        <VisualizationCard
          title={`${plane.label} — 3D U-Net Prediction`}
          src={planeData?.prediction}
          emptyText="Prediction visualization unavailable."
          type="prediction"
        />


        <VisualizationCard
          title={`${plane.label} — GT vs Prediction`}
          src={planeData?.comparison}
          emptyText="Comparison unavailable because ground truth was not provided."
          type="comparison"
        />

      </div>

    </div>
  );
}


export default function ResultPanel3D({ result }) {

  if (!result) {
    return (
      <div className="error-banner">
        No 3D prediction result received from backend.
      </div>
    );
  }


  const {
    tumor_detected,
    voxel_count,
    tumor_slice_count,
    total_slices,
    max_probability,
    mean_probability,
    ground_truth_available = false,
    metrics = {},
    visualization = {},
  } = result;


  return (
    <section className="result-panel-3d">

      {/* =====================================================
          RESULT HEADER
         ===================================================== */}

      <div className="result-head">

        <div>

          <span className="result-kicker">
            3D U-NET ANALYSIS
          </span>

          <h2>
            3D Brain Tumor Segmentation
          </h2>

          <p>
            Multi-plane visualization of the MRI volume
            and the predicted tumor segmentation.
          </p>

        </div>


        <div
          className={`result-status ${
            tumor_detected
              ? "detected"
              : "not-detected"
          }`}
        >

          <span className="result-status-dot" />

          {tumor_detected
            ? "Tumor detected"
            : "No tumor detected"}

        </div>

      </div>


      {/* =====================================================
          PREDICTION METRICS
         ===================================================== */}

      <div className="metric-grid">

        <MetricCard
          label="Tumor voxels"
          value={
            voxel_count !== undefined
              ? Number(voxel_count).toLocaleString()
              : "N/A"
          }
        />


        <MetricCard
          label="Tumor slices"
          value={
            tumor_slice_count !== undefined &&
            total_slices !== undefined
              ? `${tumor_slice_count} / ${total_slices}`
              : "N/A"
          }
        />


        <MetricCard
          label="Total slices"
          value={
            total_slices !== undefined
              ? total_slices
              : "N/A"
          }
        />


        <MetricCard
          label="Max probability"
          value={formatProbability(max_probability)}
        />


        <MetricCard
          label="Mean probability"
          value={formatProbability(mean_probability)}
        />

      </div>


      {/* =====================================================
          EVALUATION METRICS
         ===================================================== */}

      <div className="result-section">

        <div className="result-section-head">

          <div>

            <h3>
              Evaluation Metrics
            </h3>

            <p>
              Segmentation quality metrics require a
              ground-truth segmentation mask.
            </p>

          </div>


          {!ground_truth_available && (
            <span className="result-info-badge">
              Ground Truth not provided
            </span>
          )}

        </div>


        <div className="metric-grid evaluation-grid">

          <MetricCard
            label="Dice"
            value={
              ground_truth_available &&
              metrics?.dice != null
                ? metrics.dice
                : "N/A"
            }
          />


          <MetricCard
            label="IoU"
            value={
              ground_truth_available &&
              metrics?.iou != null
                ? metrics.iou
                : "N/A"
            }
          />


          <MetricCard
            label="Precision"
            value={
              ground_truth_available &&
              metrics?.precision != null
                ? metrics.precision
                : "N/A"
            }
          />


          <MetricCard
            label="Recall"
            value={
              ground_truth_available &&
              metrics?.recall != null
                ? metrics.recall
                : "N/A"
            }
          />

        </div>


        {!ground_truth_available && (
          <div className="ground-truth-note">

            Dice, IoU, Precision and Recall cannot be
            calculated because a segmentation ground-truth
            file such as <code>seg.nii.gz</code> was not
            provided.

          </div>
        )}

      </div>


      {/* =====================================================
          MULTI-PLANE VISUALIZATION
         ===================================================== */}

      <div className="result-section">

        <div className="result-section-head">

          <div>

            <h3>
              Multi-Plane Visualization
            </h3>

            <p>
              MRI and 3D U-Net prediction across all
              anatomical planes.
            </p>

          </div>

        </div>


        {/* =================================================
            AXIAL
           ================================================= */}

        <PlaneVisualization
          plane={PLANES[0]}
          planeData={visualization?.axial}
        />


        {/* =================================================
            CORONAL
           ================================================= */}

        <PlaneVisualization
          plane={PLANES[1]}
          planeData={visualization?.coronal}
        />


        {/* =================================================
            SAGITTAL
           ================================================= */}

        <PlaneVisualization
          plane={PLANES[2]}
          planeData={visualization?.sagittal}
        />


        {/* =================================================
            LEGEND
           ================================================= */}

        <div className="visualization-legend">

          <div className="legend-item">

            <span className="legend-color prediction" />

            <span>
              3D U-Net Prediction
            </span>

          </div>


          <div className="legend-item">

            <span className="legend-color ground-truth" />

            <span>
              Ground Truth
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}