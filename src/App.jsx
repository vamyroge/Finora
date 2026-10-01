import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Budget from './pages/Budget.jsx'
import Analytics from './pages/Analytics.jsx'
import TaiXiu from './pages/TaiXiu.jsx'
import Settings from './pages/Settings.jsx'
import { useApp } from './context/AppContext.jsx'

export default function App() {
  const { loading, settings } = useApp()

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      settings.theme === 'light' ? 'light' : 'dark',
    )
  }, [settings.theme])

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-logo">F</div>
        <div className="boot-text">Đang tải Finora...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/taixiu" element={<TaiXiu />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}