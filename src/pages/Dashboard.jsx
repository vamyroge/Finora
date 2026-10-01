import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StatCard from '../components/StatCard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useDerived } from '../hooks/useDerived.js'
import { getCategory } from '../utils/constants.js'
import { formatCompact, formatCurrency, formatDate, monthLabel } from '../utils/format.js'

export default function Dashboard() {
  const { settings, budgets } = useApp()
  const d = useDerived()

  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const dt = new Date()
    dt.setDate(dt.getDate() - i)
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
      dt.getDate(),
    ).padStart(2, '0')}`
    const dayTx = d.sortedTx.filter((t) => t.date === key)
    last7.push({
      day: dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      income: dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      expense: dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    })
  }

  const pieData = Object.entries(d.byCategory)
    .map(([id, value]) => ({ name: getCategory(id).name, value, color: getCategory(id).color }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  if (!d.hasData) {
    return (
      <EmptyState
        icon="💸"
        title="Chưa có dữ liệu"
        description="Thêm giao dịch đầu tiên hoặc khôi phục dữ liệu demo trong Cài đặt."
        action={
          <Link to="/transactions" className="btn primary">
            Thêm giao dịch
          </Link>
        }
      />
    )
  }

  return (
    <div className="page">
      <div className="stat-grid">
        <StatCard
          label="Số dư hiện tại"
          value={formatCurrency(d.balance, settings.currency)}
          icon="💰"
          tone={d.balance >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          label="Thu nhập tháng"
          value={formatCurrency(d.monthIncome, settings.currency)}
          icon="📥"
          tone="positive"
        />
        <StatCard
          label="Chi tiêu tháng"
          value={formatCurrency(d.monthExpense, settings.currency)}
          icon="📤"
          tone="negative"
        />
        <StatCard
          label="Tiết kiệm tháng"
          value={formatCurrency(d.monthSaving, settings.currency)}
          icon="🏦"
          tone={d.monthSaving >= 0 ? 'positive' : 'negative'}
        />
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Thu / chi 7 ngày</h2>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={last7}>
                <XAxis dataKey="day" stroke="#8b90a8" fontSize={12} />
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

        <section className="card">
          <div className="card-head">
            <h2>Chi tiêu theo danh mục</h2>
          </div>
          {pieData.length === 0 ? (
            <EmptyState icon="🥧" title="Chưa có chi tiêu" />
          ) : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
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
          )}
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Giao dịch gần đây</h2>
            <Link to="/transactions" className="link">
              Xem tất cả
            </Link>
          </div>
          <div className="tx-list">
            {d.sortedTx.slice(0, 6).map((t) => {
              const cat = getCategory(t.category)
              return (
                <div className="tx-item" key={t.id}>
                  <div
                    className="tx-icon"
                    style={{ background: `${cat.color}22`, color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <div className="tx-info">
                    <div className="tx-note">{t.note || cat.name}</div>
                    <div className="tx-meta">
                      {cat.name} · {formatDate(t.date)}
                    </div>
                  </div>
                  <div className={`tx-amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount, settings.currency)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Tiến độ ngân sách tháng</h2>
            <Link to="/budget" className="link">
              Quản lý
            </Link>
          </div>
          {budgets.length === 0 ? (
            <EmptyState icon="🎯" title="Chưa có ngân sách" description="Tạo ngân sách để theo dõi chi tiêu." />
          ) : (
            <div className="budget-list">
              {d.budgetUsage.map((b) => {
                const cat = getCategory(b.category)
                const tone = b.percent >= 100 ? 'danger' : b.percent >= 80 ? 'warn' : 'ok'
                return (
                  <div className="budget-row" key={b.id}>
                    <div className="budget-row-head">
                      <span>
                        {cat.icon} {cat.name}
                      </span>
                      <span className="muted">
                        {formatCurrency(b.used, settings.currency)} /{' '}
                        {formatCurrency(b.limit, settings.currency)}
                      </span>
                    </div>
                    <ProgressBar percent={b.percent} tone={tone} />
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const tooltipStyle = {
  background: '#161824',
  border: '1px solid #2a2f45',
  borderRadius: 12,
  color: '#e7e9f3',
}