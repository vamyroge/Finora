import { CATEGORIES } from './constants.js'

function iso(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

let counter = 0
export function uid() {
  counter += 1
  return `tx_${Date.now().toString(36)}_${counter}_${Math.random().toString(36).slice(2, 7)}`
}

export function createDemoTransactions() {
  const raw = [
    { type: 'income', category: 'salary', amount: 18000000, date: iso(3), note: 'Lương tháng này' },
    { type: 'income', category: 'bonus', amount: 2500000, date: iso(6), note: 'Thưởng dự án' },
    { type: 'income', category: 'other', amount: 1200000, date: iso(20), note: 'Bán đồ cũ' },
    { type: 'expense', category: 'food', amount: 145000, date: iso(0), note: 'Ăn trưa văn phòng' },
    { type: 'expense', category: 'transport', amount: 90000, date: iso(0), note: 'Grab đi làm' },
    { type: 'expense', category: 'food', amount: 320000, date: iso(1), note: 'Đi chợ cuối tuần' },
    { type: 'expense', category: 'shopping', amount: 780000, date: iso(2), note: 'Áo khoác mới' },
    { type: 'expense', category: 'entertainment', amount: 260000, date: iso(2), note: 'Vé xem phim' },
    { type: 'expense', category: 'study', amount: 450000, date: iso(4), note: 'Khóa học online' },
    { type: 'expense', category: 'bills', amount: 620000, date: iso(5), note: 'Tiền điện nước' },
    { type: 'expense', category: 'health', amount: 350000, date: iso(6), note: 'Khám sức khỏe' },
    { type: 'expense', category: 'food', amount: 210000, date: iso(7), note: 'Cà phê với bạn' },
    { type: 'expense', category: 'transport', amount: 150000, date: iso(8), note: 'Đổ xăng' },
    { type: 'expense', category: 'shopping', amount: 1200000, date: iso(10), note: 'Tai nghe bluetooth' },
    { type: 'expense', category: 'entertainment', amount: 180000, date: iso(12), note: 'Game mới' },
    { type: 'expense', category: 'food', amount: 275000, date: iso(14), note: 'Ăn tối gia đình' },
    { type: 'expense', category: 'study', amount: 300000, date: iso(16), note: 'Sách chuyên ngành' },
    { type: 'expense', category: 'bills', amount: 540000, date: iso(18), note: 'Internet tháng' },
    { type: 'expense', category: 'transport', amount: 120000, date: iso(22), note: 'Xe bus tháng' },
    { type: 'expense', category: 'food', amount: 400000, date: iso(25), note: 'Tiệc sinh nhật' },
    { type: 'expense', category: 'shopping', amount: 650000, date: iso(28), note: 'Đồ gia dụng' },
    { type: 'expense', category: 'entertainment', amount: 220000, date: iso(33), note: 'Karaoke' },
    { type: 'expense', category: 'health', amount: 280000, date: iso(38), note: 'Thuốc bổ' },
    { type: 'expense', category: 'food', amount: 190000, date: iso(42), note: 'Ăn vặt' },
    { type: 'income', category: 'salary', amount: 18000000, date: iso(33), note: 'Lương tháng trước' },
    { type: 'expense', category: 'bills', amount: 610000, date: iso(35), note: 'Điện nước tháng trước' },
  ]
  return raw.map((t) => ({ id: uid(), ...t }))
}

export function createDemoBudgets() {
  const map = {
    food: 3000000,
    transport: 1200000,
    shopping: 2500000,
    entertainment: 1000000,
    study: 1500000,
  }
  return CATEGORIES.filter((c) => map[c.id]).map((c) => ({
    id: `bg_${c.id}`,
    category: c.id,
    limit: map[c.id],
  }))
}