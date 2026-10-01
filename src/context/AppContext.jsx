import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { createDemoBudgets, createDemoTransactions, uid } from '../utils/demoData.js'

const STORAGE_KEY = 'finora_state_v1'

const AppContext = createContext(null)

const defaultSettings = {
  userName: 'Người dùng Finora',
  currency: 'VND',
  theme: 'dark',
  notifications: true,
}

const initialState = {
  ready: false,
  loading: true,
  transactions: [],
  budgets: [],
  settings: defaultSettings,
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    }
  } catch {
    return null
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'INIT': {
      const stored = loadFromStorage()
      if (stored) {
        return {
          ...state,
          ...stored,
          ready: true,
          loading: false,
        }
      }
      return {
        ...state,
        transactions: createDemoTransactions(),
        budgets: createDemoBudgets(),
        settings: defaultSettings,
        ready: true,
        loading: false,
      }
    }
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t,
        ),
      }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      }
    case 'ADD_BUDGET': {
      const exists = state.budgets.some((b) => b.category === action.payload.category)
      if (exists) {
        return {
          ...state,
          budgets: state.budgets.map((b) =>
            b.category === action.payload.category ? { ...b, ...action.payload } : b,
          ),
        }
      }
      return { ...state, budgets: [...state.budgets, action.payload] }
    }
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map((b) =>
          b.id === action.payload.id ? { ...b, ...action.payload } : b,
        ),
      }
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.id !== action.payload) }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'RESET_DEMO':
      return {
        ...state,
        transactions: createDemoTransactions(),
        budgets: createDemoBudgets(),
      }
    case 'CLEAR_ALL':
      return { ...state, transactions: [], budgets: [] }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    dispatch({ type: 'INIT' })
  }, [])

  useEffect(() => {
    if (!state.ready) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          transactions: state.transactions,
          budgets: state.budgets,
          settings: state.settings,
        }),
      )
    } catch {
      /* ignore quota errors */
    }
  }, [state.ready, state.transactions, state.budgets, state.settings])

  const addTransaction = useCallback((data) => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: { id: uid(), ...data, amount: Number(data.amount) || 0 },
    })
  }, [])

  const updateTransaction = useCallback((data) => {
    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: { ...data, amount: Number(data.amount) || 0 },
    })
  }, [])

  const deleteTransaction = useCallback((id) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id })
  }, [])

  const addBudget = useCallback((data) => {
    dispatch({
      type: 'ADD_BUDGET',
      payload: { id: `bg_${data.category}`, ...data, limit: Number(data.limit) || 0 },
    })
  }, [])

  const updateBudget = useCallback((data) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: { ...data, limit: Number(data.limit) || 0 } })
  }, [])

  const deleteBudget = useCallback((id) => {
    dispatch({ type: 'DELETE_BUDGET', payload: id })
  }, [])

  const updateSettings = useCallback((data) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: data })
  }, [])

  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO' }), [])
  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), [])

  const value = useMemo(
    () => ({
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      updateSettings,
      resetDemo,
      clearAll,
    }),
    [
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      updateSettings,
      resetDemo,
      clearAll,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}