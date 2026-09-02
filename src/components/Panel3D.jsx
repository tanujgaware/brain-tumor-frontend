import { useRef, useState } from "react";
import { predict3D } from "../api";
import ResultPanel3D from "./ResultPanel3D";

const MODALITIES = [
  {
    key: "t1n",
    name: "T1n",
    desc: "Native T1-weighted MRI",
  },
  {
    key: "t1c",
    name: "T1c",
    desc: "Post-contrast T1-weighted MRI",
  },
  {
    key: "t2w",
    name: "T2w",
    desc: "T2-weighted MRI",
  },
  {
    key: "t2f",
    name: "T2f",
    desc: "T2-FLAIR MRI",
  },
];

export default function Panel3D() {
  const inputRefs = useRef({});

  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const filledCount =
    Object.values(files).filter(Boolean).length;

  const allFilled = filledCount === 4;

  function setModalityFile(key, file) {
    if (!file) return;

    const filename = file.name.toLowerCase();

    if (
      !filename.endsWith(".nii") &&
      !filename.endsWith(".nii.gz")
    ) {
      setError(
        `${key.toUpperCase()} must be a .nii or .nii.gz file.`
      );
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    setResult(null);
    setError(null);
  }

  async function runSegmentation() {
    if (!allFilled || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Sending 4 MRI modalities...");

      const response = await predict3D(files);

      console.log(
        "3D backend response:",
        response
      );

      setResult(response);

    } catch (err) {
      console.error(
        "3D segmentation error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while running 3D segmentation."
      );

    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFiles({});
    setResult(null);
    setError(null);

    Object.values(inputRefs.current).forEach(
      (input) => {
        if (input) {
          input.value = "";
        }
      }
    );
  }

  return (
    <div className="panel glass">

      {/* HEADER */}

      <div className="panel-head">

        <div>

          <h2>
            3D Tumor Segmentation
          </h2>

          <p>
            Upload all four MRI modalities separately
            for one patient. The 3D U-Net analyzes the
            complete volume and detects tumor regions.
          </p>

        </div>

        <span className="tag violet">
          3D U-NET
        </span>

      </div>


      {/* FOUR MRI INPUTS */}

      <div className="modality-grid">

        {MODALITIES.map(
          ({ key, name, desc }) => (

            <div
              className={`modality-slot ${
                files[key] ? "filled" : ""
              }`}
              key={key}
            >

              <div className="modality-top">

                <span className="modality-name">
                  {name}
                </span>

                {files[key] && (
                  <span
                    className="modality-check"
                    aria-label="File selected"
                  >
                    ✓
                  </span>
                )}

              </div>


              <div className="modality-desc">
                {desc}
              </div>


              {files[key] ? (

                <div className="modality-file">
                  {files[key].name}
                </div>

              ) : (

                <div className="modality-placeholder">
                  .nii / .nii.gz not selected
                </div>

              )}


              {/* HIDDEN REAL FILE INPUT */}

              <input
                ref={(element) => {
                  inputRefs.current[key] = element;
                }}
                type="file"
                accept=".nii,.nii.gz"
                style={{ display: "none" }}
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  setModalityFile(
                    key,
                    file
                  );
                }}
              />


              {/* CUSTOM FILE BUTTON */}

              <button
                type="button"
                className="pick-btn"
                onClick={() =>
                  inputRefs.current[key]?.click()
                }
              >
                {files[key]
                  ? "Replace file"
                  : "Choose file"}
              </button>

            </div>

          )
        )}

      </div>


      {/* ACTION BUTTONS */}

      <div className="action-row">

        <button
          className="btn-primary violet"
          disabled={!allFilled || loading}
          onClick={runSegmentation}
        >
          {loading
            ? "Segmenting..."
            : `Run segmentation (${filledCount}/4 loaded)`}
        </button>


        {filledCount > 0 && (

          <button
            type="button"
            className="btn-ghost"
            onClick={reset}
            disabled={loading}
          >
            Clear all
          </button>

        )}

      </div>


      {/* LOADING */}

      {loading && (
        <>
          <div className="progress-track">
            <div className="progress-fill" />
          </div>

          <div className="progress-label">
            Preprocessing MRI volumes → running
            3D U-Net segmentation...
          </div>
        </>
      )}


      {/* ERROR */}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}


      {/* RESULT */}

      {result && (
        <ResultPanel3D
          result={result}
        />
      )}

    </div>
  );
}