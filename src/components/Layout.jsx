import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const NAV = [
  { to: '/', label: 'Tổng quan', icon: '📊', end: true },
  { to: '/transactions', label: 'Giao dịch', icon: '💳' },
  { to: '/budget', label: 'Ngân sách', icon: '🎯' },
  { to: '/analytics', label: 'Phân tích', icon: '📈' },
  { to: '/taixiu', label: 'Tài xỉu', icon: '🎲' },
  { to: '/settings', label: 'Cài đặt', icon: '⚙️' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { settings } = useApp()
  const location = useLocation()

  const current = NAV.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
  )

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">F</span>
          {!collapsed && <span className="brand-name">Finora</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </aside>

      {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)} />}

      <div className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            ☰
          </button>
          <h1 className="page-title">{current?.label || 'Finora'}</h1>

          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm kiếm giao dịch..." />
          </div>

          <div className="topbar-actions">
            <button type="button" className="icon-btn" title="Thông báo">
              🔔
              {settings.notifications && <span className="dot" />}
            </button>
            <div className="avatar" title={settings.userName}>
              {settings.userName.trim().charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}