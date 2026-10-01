import { useMemo, useState } from 'react'
import Modal from '../components/Modal.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionItem from '../components/TransactionItem.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES, getCategory } from '../utils/constants.js'

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, settings } = useApp()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [sort, setSort] = useState('date-desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    let list = [...transactions]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          (t.note || '').toLowerCase().includes(q) ||
          getCategory(t.category).name.toLowerCase().includes(q),
      )
    }
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter)
    if (catFilter !== 'all') list = list.filter((t) => t.category === catFilter)

    list.sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date)
      if (sort === 'date-asc') return new Date(a.date) - new Date(b.date)
      if (sort === 'amount-desc') return Number(b.amount) - Number(a.amount)
      if (sort === 'amount-asc') return Number(a.amount) - Number(b.amount)
      return 0
    })
    return list
  }, [transactions, search, typeFilter, catFilter, sort])

  function openAdd() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(tx) {
    setEditing(tx)
    setModalOpen(true)
  }

  function handleSubmit(data) {
    if (editing) updateTransaction({ ...editing, ...data })
    else addTransaction(data)
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-heading">Giao dịch</h2>
          <p className="muted">{filtered.length} giao dịch</p>
        </div>
        <button type="button" className="btn primary" onClick={openAdd}>
          + Thêm giao dịch
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm theo ghi chú hoặc danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Tất cả loại</option>
          <option value="income">Thu nhập</option>
          <option value="expense">Chi tiêu</option>
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date-desc">Ngày mới nhất</option>
          <option value="date-asc">Ngày cũ nhất</option>
          <option value="amount-desc">Số tiền giảm dần</option>
          <option value="amount-asc">Số tiền tăng dần</option>
        </select>
      </div>

      <section className="card">
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Không có giao dịch"
            description="Thử thay đổi bộ lọc hoặc thêm giao dịch mới."
            action={
              <button type="button" className="btn primary" onClick={openAdd}>
                + Thêm giao dịch
              </button>
            }
          />
        ) : (
          <div className="tx-list">
            {filtered.map((t) => (
              <TransactionItem key={t.id} tx={t} onEdit={openEdit} />
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <Modal
          title={editing ? 'Sửa giao dịch' : 'Thêm giao dịch'}
          onClose={() => setModalOpen(false)}
        >
          <TransactionForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}