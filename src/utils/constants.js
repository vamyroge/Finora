export const CATEGORIES = [
  { id: 'food', name: 'Ăn uống', icon: '🍜', color: '#ff8a5b' },
  { id: 'transport', name: 'Di chuyển', icon: '🚕', color: '#4dabf7' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛍️', color: '#e64980' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎮', color: '#9775fa' },
  { id: 'study', name: 'Học tập', icon: '📚', color: '#20c997' },
  { id: 'bills', name: 'Hóa đơn', icon: '🧾', color: '#fcc419' },
  { id: 'health', name: 'Sức khỏe', icon: '💊', color: '#ff6b6b' },
  { id: 'salary', name: 'Lương', icon: '💼', color: '#51cf66' },
  { id: 'bonus', name: 'Thưởng', icon: '🎁', color: '#22b8cf' },
  { id: 'other', name: 'Khác', icon: '📦', color: '#868e96' },
]

export const INCOME_CATEGORIES = ['salary', 'bonus', 'other']
export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'study',
  'bills',
  'health',
  'other',
]

export function getCategory(id) {
  return (
    CATEGORIES.find((c) => c.id === id) || { id, name: id, icon: '📦', color: '#868e96' }
  )
}

export function categoriesForType(type) {
  const ids = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return CATEGORIES.filter((c) => ids.includes(c.id))
}