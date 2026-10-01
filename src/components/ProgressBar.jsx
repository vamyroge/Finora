export default function ProgressBar({ percent, tone }) {
  const p = Math.max(0, Math.min(Number(percent) || 0, 100))
  return (
    <div className="progress">
      <div className={`progress-fill ${tone || ''}`} style={{ width: `${p}%` }} />
    </div>
  )
}