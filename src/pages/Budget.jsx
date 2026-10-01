import { useState } from 'react'
import Modal from '../components/Modal.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useDerived } from '../hooks/useDerived.js'
import { EXPENSE_CATEGORIES, getCategory } from '../utils/constants.js'
import { formatCurrency } from '../utils/format.js'

export default function Budget() {
  const { budgets, addBudget, updateBudget, deleteBudget, settings } = useApp()
  const d = useDerived()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const usedCategories = budgets.map((b) => b.category)
  const available = EXPENSE_CATEGORIES.filter((id) => !usedCategories.includes(id))

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(b) {
    setEditing(b)
    setModalOpen(true)
  }

  function handleSubmit(data) {
    if (editing) updateBudget({ ...editing, ...data })
    else addBudget(data)
    setModalOpen(false)
    setEditing(null)
  }

  const totalPercent =
    d.totalBudget > 0 ? Math.min((d.totalBudgetUsed / d.totalBudget) * 100, 100) : 0

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-heading">Ngân sách</h2>
          <p className="muted">
            Đã dùng {formatCurrency(d.totalBudgetUsed, settings.currency)} /{' '}
            {formatCurrency(d.totalBudget, settings.currency)}
          </p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={openAdd}
          disabled={available.length === 0}
        >
          + Thêm ngân sách
        </button>
      </div>

      {budgets.length > 0 && (
        <section className="card">
          <div className="card-head">
            <h2>Tổng quan tháng</h2>
            <span className="muted">{totalPercent.toFixed(0)}%</span>
          </div>
          <ProgressBar
            percent={totalPercent}
            tone={totalPercent >= 100 ? 'danger' : totalPercent >= 80 ? 'warn' : 'ok'}
          />
        </section>
      )}

      {budgets.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Chưa có ngân sách"
          description="Tạo ngân sách cho từng danh mục để kiểm soát chi tiêu."
          action={
            <button type="button" className="btn primary" onClick={openAdd}>
              + Tạo ngân sách
            </button>
          }
        />
      ) : (
        <div className="budget-grid">
          {d.budgetUsage.map((b) => {
            const cat = getCategory(b.category)
            const tone = b.percent >= 100 ? 'danger' : b.percent >= 80 ? 'warn' : 'ok'
            return (
              <div className="card budget-card" key={b.id}>
                <div className="budget-card-head">
                  <div className="budget-cat">
                    <span
                      className="tx-icon"
                      style={{ background: `${cat.color}22`, color: cat.color }}
                    >
                      {cat.icon}
                    </span>
                    <div>
                      <div className="tx-note">{cat.name}</div>
                      <div className="muted">
                        Còn lại {formatCurrency(b.remaining, settings.currency)}
                      </div>
                    </div>
                  </div>
                  <div className="budget-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => openEdit(b)}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => deleteBudget(b.id)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="budget-numbers">
                  <span>{formatCurrency(b.used, settings.currency)}</span>
                  <span className="muted">{formatCurrency(b.limit, settings.currency)}</span>
                </div>
                <ProgressBar percent={b.percent} tone={tone} />
                <div className="budget-percent">{b.percent.toFixed(0)}% đã sử dụng</div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Sửa ngân sách' : 'Thêm ngân sách'}
          onClose={() => setModalOpen(false)}
        >
          <BudgetForm
            initial={editing}
            available={available}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}

function BudgetForm({ initial, available, onSubmit, onCancel }) {
  const [category, setCategory] = useState(initial?.category || available[0] || 'food')
  const [limit, setLimit] = useState(initial ? String(initial.limit) : '')
  const [error, setError] = useState('')

  const options = initial ? [initial.category] : available

  function submit(e) {
    e.preventDefault()
    const value = Number(limit)
    if (!limit || Number.isNaN(value) || value <= 0) {
      setError('Vui lòng nhập hạn mức hợp lệ.')
      return
    }
    onSubmit({ category, limit: value })
  }

  return (
    <form className="tx-form" onSubmit={submit}>
      <label className="field">
        <span>Danh mục</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={Boolean(initial)}
        >
          {options.map((id) => {
            const c = getCategory(id)
            return (
              <option key={id} value={id}>
                {c.icon} {c.name}
              </option>
            )
          })}
        </select>
      </label>
      <label className="field">
        <span>Hạn mức</span>
        <input
          type="number"
          min="0"
          step="10000"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="0"
        />
      </label>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn primary">
          {initial ? 'Lưu thay đổi' : 'Tạo ngân sách'}
        </button>
      </div>
    </form>
  )
}