import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { CURRENCIES } from '../utils/format.js'

export default function Settings() {
  const { settings, updateSettings, clearAll, resetDemo, transactions } = useApp()
  const [name, setName] = useState(settings.userName)
  const [saved, setSaved] = useState(false)

  function saveName(e) {
    e.preventDefault()
    updateSettings({ userName: name.trim() || 'Người dùng Finora' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleClear() {
    if (window.confirm('Xóa toàn bộ giao dịch và ngân sách? Hành động này không thể hoàn tác.')) {
      clearAll()
    }
  }

  function handleReset() {
    if (window.confirm('Khôi phục dữ liệu demo? Dữ liệu hiện tại sẽ bị thay thế.')) {
      resetDemo()
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="card-head">
          <h2>Hồ sơ</h2>
        </div>
        <form className="settings-form" onSubmit={saveName}>
          <label className="field">
            <span>Tên người dùng</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button type="submit" className="btn primary">
            Lưu tên
          </button>
          {saved && <span className="saved-tag">Đã lưu ✓</span>}
        </form>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Tuỳ chỉnh</h2>
        </div>
        <div className="settings-list">
          <div className="settings-row">
            <div>
              <div className="settings-label">Tiền tệ</div>
              <div className="muted">Đơn vị hiển thị cho mọi số tiền</div>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
            >
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <option key={code} value={code}>
                  {c.symbol} {code}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Chế độ hiển thị</div>
              <div className="muted">Dark hoặc light mode</div>
            </div>
            <div className="segmented">
              <button
                type="button"
                className={settings.theme === 'dark' ? 'active' : ''}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                🌙 Dark
              </button>
              <button
                type="button"
                className={settings.theme === 'light' ? 'active' : ''}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                ☀️ Light
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Thông báo</div>
              <div className="muted">Nhắc nhở về ngân sách</div>
            </div>
            <button
              type="button"
              className={`toggle ${settings.notifications ? 'on' : ''}`}
              onClick={() => updateSettings({ notifications: !settings.notifications })}
              aria-label="Bật tắt thông báo"
            >
              <span className="knob" />
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Dữ liệu</h2>
          <span className="muted">{transactions.length} giao dịch</span>
        </div>
        <div className="danger-actions">
          <button type="button" className="btn outline" onClick={handleReset}>
            ♻️ Khôi phục dữ liệu demo
          </button>
          <button type="button" className="btn danger" onClick={handleClear}>
            🗑️ Xóa toàn bộ dữ liệu
          </button>
        </div>
      </section>
    </div>
  )
}