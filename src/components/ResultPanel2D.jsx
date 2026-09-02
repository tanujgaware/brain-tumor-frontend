const COLORS = {
  Glioma: '#ff5d6c',
  Meningioma: '#ff9f45',
  Pituitary: '#7c6bff',
  'No Tumor': '#34e2c7',
}

export default function ResultPanel2D({ result }) {
  const { prediction, confidences, demo } = result
  const isTumor = prediction !== 'No Tumor'
  const entries = Object.entries(confidences).sort((a, b) => b[1] - a[1])

  return (
    <div className="result-wrap">
      <div className={`result-banner ${isTumor ? 'positive' : 'negative'}`}>
        <div className="result-icon">{isTumor ? '⚠️' : '✅'}</div>
        <div>
          <h3>{isTumor ? `${prediction} detected` : 'No tumor detected'}</h3>
          <p>
            {isTumor
              ? `Classified as ${prediction.toLowerCase()} with ${(confidences[prediction] * 100).toFixed(1)}% confidence.`
              : `The 2D CNN found no tumor signature in this slice.`}
            {demo && ' (demo mode — connect the backend for real predictions)'}
          </p>
        </div>
      </div>

      {entries.map(([label, value]) => (
        <div className="class-bar-row" key={label}>
          <div className="class-bar-label">{label}</div>
          <div className="class-bar-track">
            <div
              className="class-bar-fill"
              style={{ width: `${value * 100}%`, background: COLORS[label] }}
            />
          </div>
          <div className="class-bar-value">{(value * 100).toFixed(3)}%</div>
        </div>
      ))}

      {result.grad_images && (
        <div className="gradcam-section">
          <h3>Grad-CAM Visualization</h3>

          <img
            src={result.grad_images}
            alt="Grad-CAM visualization"
            className="gradcam-image"
          />
        </div>
      )}

      {result.explanation && (<>
      <hr />
        <h3>Explanation</h3>
          <div className="">
            <p>{result.explanation}</p>
          </div>
        </>
      )}
      <hr />
      <div>
        <p>*This system provides AI-assisted image classification. The heatmap represents regions that influenced the model's prediction and should not be interpreted as a definitive tumor boundary. Results should be reviewed by a qualified medical professional.</p>
      </div>
    </div>
  )
}
