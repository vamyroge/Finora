import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StatCard from '../components/StatCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useDerived } from '../hooks/useDerived.js'
import { getCategory } from '../utils/constants.js'
import { formatCompact, formatCurrency, formatPercent, monthLabel } from '../utils/format.js'

const tooltipStyle = {
  background: '#161824',
  border: '1px solid #2a2f45',
  borderRadius: 12,
  color: '#e7e9f3',
}

export default function Analytics() {
  const { settings } = useApp()
  const d = useDerived()

  if (!d.hasData) {
    return (
      <div className="page">
        <EmptyState
          icon="📈"
          title="Chưa có dữ liệu phân tích"
          description="Thêm giao dịch để xem biểu đồ và thống kê."
        />
      </div>
    )
  }

  const monthData = d.monthKeys.map((k) => ({
    month: monthLabel(k),
    income: d.byMonth[k]?.income || 0,
    expense: d.byMonth[k]?.expense || 0,
    saving: (d.byMonth[k]?.income || 0) - (d.byMonth[k]?.expense || 0),
  }))

  const pieData = Object.entries(d.byCategory)
    .map(([id, value]) => ({ name: getCategory(id).name, value, color: getCategory(id).color }))
    .sort((a, b) => b.value - a.value)

  const top = d.topCategory ? getCategory(d.topCategory.id) : null
  const avgExpense =
    d.monthKeys.length > 0
      ? d.monthKeys.reduce((s, k) => s + (d.byMonth[k]?.expense || 0), 0) / d.monthKeys.length
      : 0

  return (
    <div className="page">
      <div className="stat-grid">
        <StatCard
          label="Tỷ lệ tiết kiệm"
          value={formatPercent(d.savingRate)}
          icon="🏦"
          tone={d.savingRate >= 20 ? 'positive' : d.savingRate >= 0 ? 'default' : 'negative'}
        />
        <StatCard
          label="Chi tiêu nhiều nhất"
          value={top ? `${top.icon} ${top.name}` : '—'}
          icon="🔥"
          sub={top ? formatCurrency(d.topCategory.amount, settings.currency) : ''}
        />
        <StatCard
          label="Chi tiêu TB / tháng"
          value={formatCurrency(avgExpense, settings.currency)}
          icon="📊"
        />
        <StatCard label="Số giao dịch" value={String(d.sortedTx.length)} icon="🧾" />
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Thu nhập & chi tiêu theo tháng</h2>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262a3d" vertical={false} />
              <XAxis dataKey="month" stroke="#8b90a8" fontSize={12} />
              <YAxis
                stroke="#8b90a8"
                fontSize={12}
                tickFormatter={(v) => formatCompact(v, settings.currency)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => formatCurrency(v, settings.currency)}
              />
              <Legend />
              <Bar dataKey="income" name="Thu nhập" fill="#51cf66" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Chi tiêu" fill="#ff6b6b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Chi tiêu theo danh mục</h2>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {pieData.map((p) => (
                    <Cell key={p.name} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => formatCurrency(v, settings.currency)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Xu hướng tiết kiệm</h2>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262a3d" vertical={false} />
                <XAxis dataKey="month" stroke="#8b90a8" fontSize={12} />
                <YAxis
                  stroke="#8b90a8"
                  fontSize={12}
                  tickFormatter={(v) => formatCompact(v, settings.currency)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => formatCurrency(v, settings.currency)}
                />
                <Line
                  type="monotone"
                  dataKey="saving"
                  name="Tiết kiệm"
                  stroke="#4dabf7"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Xếp hạng danh mục chi tiêu</h2>
        </div>
        <div className="rank-list">
          {pieData.map((p, i) => {
            const max = pieData[0]?.value || 1
            return (
              <div className="rank-row" key={p.name}>
                <span className="rank-index">#{i + 1}</span>
                <span className="rank-name">{p.name}</span>
                <div className="rank-bar">
                  <div
                    className="rank-bar-fill"
                    style={{ width: `${(p.value / max) * 100}%`, background: p.color }}
                  />
                </div>
                <span className="rank-value">{formatCurrency(p.value, settings.currency)}</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}