import { useEffect, useState } from 'react'
import { categoriesForType } from '../utils/constants.js'
import { todayISO } from '../utils/format.js'

const empty = {
  type: 'expense',
  category: 'food',
  amount: '',
  date: todayISO(),
  note: '',
}

export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        type: initial.type || 'expense',
        category: initial.category || 'food',
        amount: String(initial.amount ?? ''),
        date: initial.date || todayISO(),
        note: initial.note || '',
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [initial])

  const cats = categoriesForType(form.type)

  function change(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value }
      if (key === 'type') {
        const allowed = categoriesForType(value).map((c) => c.id)
        if (!allowed.includes(next.category)) next.category = allowed[0]
      }
      return next
    })
  }

  function submit(e) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.amount || Number.isNaN(amount) || amount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ (lớn hơn 0).')
      return
    }
    if (!form.date) {
      setError('Vui lòng chọn ngày.')
      return
    }
    onSubmit({
      type: form.type,
      category: form.category,
      amount,
      date: form.date,
      note: form.note.trim(),
    })
  }

  return (
    <form className="tx-form" onSubmit={submit}>
      <div className="type-switch">
        <button
          type="button"
          className={form.type === 'expense' ? 'active expense' : ''}
          onClick={() => change('type', 'expense')}
        >
          Chi tiêu
        </button>
        <button
          type="button"
          className={form.type === 'income' ? 'active income' : ''}
          onClick={() => change('type', 'income')}
        >
          Thu nhập
        </button>
      </div>

      <label className="field">
        <span>Số tiền</span>
        <input
          type="number"
          min="0"
          step="1000"
          value={form.amount}
          onChange={(e) => change('amount', e.target.value)}
          placeholder="0"
        />
      </label>

      <label className="field">
        <span>Danh mục</span>
        <select value={form.category} onChange={(e) => change('category', e.target.value)}>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Ngày</span>
        <input
          type="date"
          value={form.date}
          onChange={(e) => change('date', e.target.value)}
        />
      </label>

      <label className="field">
        <span>Ghi chú</span>
        <input
          type="text"
          value={form.note}
          onChange={(e) => change('note', e.target.value)}
          placeholder="Ví dụ: Ăn trưa"
        />
      </label>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn primary">
          {initial ? 'Lưu thay đổi' : 'Thêm giao dịch'}
        </button>
      </div>
    </form>
  )
}