export default function StatCard({ label, value, icon, tone = 'default', sub }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}