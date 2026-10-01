import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { monthKey } from '../utils/format.js'

export function useDerived() {
  const { transactions, budgets } = useApp()

  return useMemo(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    let totalIncome = 0
    let totalExpense = 0
    let monthIncome = 0
    let monthExpense = 0

    const byCategory = {}
    const byMonth = {}

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0
      const mk = monthKey(t.date)
      if (t.type === 'income') {
        totalIncome += amt
        if (mk === currentMonth) monthIncome += amt
      } else {
        totalExpense += amt
        if (mk === currentMonth) monthExpense += amt
        byCategory[t.category] = (byCategory[t.category] || 0) + amt
      }

      if (!byMonth[mk]) byMonth[mk] = { income: 0, expense: 0 }
      if (t.type === 'income') byMonth[mk].income += amt
      else byMonth[mk].expense += amt
    })

    const balance = totalIncome - totalExpense
    const monthSaving = monthIncome - monthExpense

    const sortedTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))

    const budgetUsage = budgets
      .map((b) => {
        const used = transactions
          .filter(
            (t) =>
              t.type === 'expense' &&
              t.category === b.category &&
              monthKey(t.date) === currentMonth,
          )
          .reduce((s, t) => s + (Number(t.amount) || 0), 0)
        const limit = Number(b.limit) || 0
        const remaining = limit - used
        const percent = limit > 0 ? Math.min((used / limit) * 100, 999) : 0
        return { ...b, used, remaining, percent }
      })
      .sort((a, b) => b.percent - a.percent)

    const totalBudget = budgets.reduce((s, b) => s + (Number(b.limit) || 0), 0)
    const totalBudgetUsed = budgetUsage.reduce((s, b) => s + b.used, 0)

    const savingRate = monthIncome > 0 ? (monthSaving / monthIncome) * 100 : 0

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

    const monthKeys = Object.keys(byMonth).sort()
    const last6 = monthKeys.slice(-6)

    return {
      currentMonth,
      totalIncome,
      totalExpense,
      balance,
      monthIncome,
      monthExpense,
      monthSaving,
      byCategory,
      byMonth,
      sortedTx,
      budgetUsage,
      totalBudget,
      totalBudgetUsed,
      savingRate,
      topCategory: topCategory ? { id: topCategory[0], amount: topCategory[1] } : null,
      monthKeys: last6,
      hasData: transactions.length > 0,
    }
  }, [transactions, budgets])
}