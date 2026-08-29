export default function LiquidBackground({ mode }) {
  const isThreeD = mode === '3d'

  const blobA = isThreeD
    ? 'radial-gradient(circle, #7c6bff, transparent 70%)'
    : 'radial-gradient(circle, #0a84ff, transparent 70%)'
  const blobB = isThreeD
    ? 'radial-gradient(circle, #34e2c7, transparent 70%)'
    : 'radial-gradient(circle, #5aa9ff, transparent 70%)'
  const blobC = isThreeD
    ? 'radial-gradient(circle, #ff9f45, transparent 70%)'
    : 'radial-gradient(circle, #7c6bff, transparent 70%)'

  return (
    <div className="liquid-bg" aria-hidden="true">
      <div className="liquid-blob blob-a" style={{ background: blobA }} />
      <div className="liquid-blob blob-b" style={{ background: blobB }} />
      <div className="liquid-blob blob-c" style={{ background: blobC }} />
    </div>
  )
}
