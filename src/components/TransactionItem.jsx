import { getCategory } from '../utils/constants.js'
import { formatCurrency, formatDate } from '../utils/format.js'
import { useApp } from '../context/AppContext.jsx'

export default function TransactionItem({ tx, onEdit }) {
  const { settings, deleteTransaction } = useApp()
  const cat = getCategory(tx.category)
  const isIncome = tx.type === 'income'

  return (
    <div className="tx-item">
      <div className="tx-icon" style={{ background: `${cat.color}22`, color: cat.color }}>
        {cat.icon}
      </div>
      <div className="tx-info">
        <div className="tx-note">{tx.note || cat.name}</div>
        <div className="tx-meta">
          {cat.name} · {formatDate(tx.date)}
        </div>
      </div>
      <div className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
        {isIncome ? '+' : '-'}
        {formatCurrency(tx.amount, settings.currency)}
      </div>
      <div className="tx-actions">
        <button type="button" className="icon-btn" onClick={() => onEdit(tx)} title="Sửa">
          ✏️
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => deleteTransaction(tx.id)}
          title="Xóa"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}