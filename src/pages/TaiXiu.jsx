import { useEffect, useMemo, useRef, useState } from 'react'
import './TaiXiu.css'

const COIN_KEY = 'finora_coins_v1'
const HISTORY_KEY = 'finora_taixiu_history_v1'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const CHIPS = [1000, 5000, 10000, 50000, 100000]
const SOI_COST = 2000
const NAN_COST = 5000
const NAN_PER_ROUND = 3

function rollDie() {
  return 1 + Math.floor(Math.random() * 6)
}

function loadCoins() {
  try {
    const raw = localStorage.getItem(COIN_KEY)
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 100000
  } catch {
    return 100000
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function formatCoins(n) {
  return `${Number(n || 0).toLocaleString('vi-VN')} xu`
}

function classify(total) {
  if (total >= 4 && total <= 10) return 'xiu'
  if (total >= 11 && total <= 17) return 'tai'
  return 'bao'
}

function labelOf(key) {
  if (key === 'tai') return 'TÀI'
  if (key === 'xiu') return 'XỈU'
  return 'BÃO'
}

export default function TaiXiu() {
  const [coins, setCoins] = useState(loadCoins)
  const [bet, setBet] = useState(5000)
  const [pick, setPick] = useState('tai')
  const [dice, setDice] = useState([1, 1, 1])
  const [rolling, setRolling] = useState(false)
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('idle')
  const [history, setHistory] = useState(loadHistory)

  const [napsLeft, setNapsLeft] = useState(NAN_PER_ROUND)
  const [napped, setNapped] = useState([false, false, false])
  const [soiOpen, setSoiOpen] = useState(false)
  const [soiResult, setSoiResult] = useState(null)
  const [shakeIdx, setShakeIdx] = useState(-1)

  const timers = useRef([])

  useEffect(() => {
    try {
      localStorage.setItem(COIN_KEY, String(coins))
    } catch {
      /* ignore */
    }
  }, [coins])

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)))
    } catch {
      /* ignore */
    }
  }, [history])

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearInterval(t))
    }
  }, [])

  const total = useMemo(() => dice.reduce((s, d) => s + d, 0), [dice])
  const resultKey = useMemo(() => classify(total), [total])

  function clearTimers() {
    timers.current.forEach((t) => clearInterval(t))
    timers.current = []
  }

  function resetActions() {
    setNapsLeft(NAN_PER_ROUND)
    setNapped([false, false, false])
    setSoiOpen(false)
    setSoiResult(null)
  }

  function nanDie(index) {
    if (rolling) return
    if (napped[index]) {
      setMessage('Con xúc xắc này đã được nặn rồi.')
      setTone('warn')
      return
    }
    if (napsLeft <= 0) {
      setMessage('Bạn đã hết lượt nặn trong ván này.')
      setTone('warn')
      return
    }
    if (coins < NAN_COST) {
      setMessage(`Không đủ xu để nặn (cần ${formatCoins(NAN_COST)}).`)
      setTone('warn')
      return
    }

    const next = [...dice]
    next[index] = (next[index] % 6) + 1
    setDice(next)
    setCoins((c) => c - NAN_COST)
    setNapsLeft((n) => n - 1)
    setNapped((arr) => arr.map((v, i) => (i === index ? true : v)))
    setShakeIdx(index)
    setTimeout(() => setShakeIdx(-1), 380)
    setMessage(`Đã nặn con thứ ${index + 1} thành ${next[index]} (-${formatCoins(NAN_COST)})`)
    setTone('idle')
  }

  function soi() {
    if (rolling) return
    if (coins < SOI_COST) {
      setMessage(`Không đủ xu để soi (cần ${formatCoins(SOI_COST)}).`)
      setTone('warn')
      return
    }
    setCoins((c) => c - SOI_COST)
    const preview = [dice[0], dice[1], dice[2]]
    const sum = preview.reduce((s, d) => s + d, 0)
    setSoiResult({ dice: preview, sum, key: classify(sum) })
    setSoiOpen(true)
    setMessage(`Soi kết quả hiện tại (-${formatCoins(SOI_COST)}). Nặn để đổi con bạn muốn.`)
    setTone('idle')
  }

  function play() {
    if (rolling) return
    if (bet <= 0) {
      setMessage('Vui lòng chọn mức cược hợp lệ.')
      setTone('warn')
      return
    }
    if (bet > coins) {
      setMessage('Bạn không đủ xu để đặt mức cược này.')
      setTone('warn')
      return
    }

    setRolling(true)
    setSoiOpen(false)
    setSoiResult(null)
    setMessage('Đang lắc...')
    setTone('rolling')
    setCoins((c) => c - bet)

    clearTimers()
    const spin = setInterval(() => {
      setDice([rollDie(), rollDie(), rollDie()])
    }, 90)
    timers.current.push(spin)

    const anchored = [...dice]
    const wasNapped = [...napped]

    setTimeout(() => {
      clearTimers()
      const rolled = [rollDie(), rollDie(), rollDie()]
      const final = rolled.map((v, i) => (wasNapped[i] ? anchored[i] : v))
      setDice(final)
      const sum = final.reduce((s, d) => s + d, 0)
      const res = classify(sum)

      let delta = 0
      if (res === 'bao') {
        delta = Math.round(bet * 2)
        setMessage(`BÃO ${sum} — Bạn thắng lớn! +${formatCoins(delta)}`)
        setTone('win')
      } else if (res === pick) {
        delta = bet * 2
        setMessage(`${labelOf(res)} ${sum} — Bạn thắng! +${formatCoins(bet)}`)
        setTone('win')
      } else {
        setMessage(`${labelOf(res)} ${sum} — Bạn thua. -${formatCoins(bet)}`)
        setTone('lose')
      }

      if (delta > 0) setCoins((c) => c + delta)

      setHistory((h) => [
        {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          pick,
          result: res,
          total: sum,
          bet,
          delta,
          napped: wasNapped.filter(Boolean).length,
          at: new Date().toISOString(),
        },
        ...h,
      ])
      setRolling(false)
      resetActions()
    }, 1200)
  }

  function resetCoins() {
    if (window.confirm('Nạp lại 100.000 xu miễn phí? Xu hiện tại sẽ được thay thế.')) {
      setCoins(100000)
      setMessage('Đã nạp lại 100.000 xu.')
      setTone('idle')
    }
  }

  function clearHistory() {
    setHistory([])
    setMessage('Đã xóa lịch sử chơi.')
    setTone('idle')
  }

  const preview = DICE_FACES[dice[0] - 1] + DICE_FACES[dice[1] - 1] + DICE_FACES[dice[2] - 1]

  return (
    <div className="page taixiu-page">
      <div className="txu-balance">
        <div>
          <div className="muted">Số dư xu giải trí</div>
          <div className="txu-coin-value">{formatCoins(coins)}</div>
        </div>
        <button type="button" className="btn outline" onClick={resetCoins}>
          🎁 Nạp 100.000 xu
        </button>
      </div>

      <section className="card txu-board">
        <div className="txu-dice-wrap">
          <div className={`txu-dice ${rolling ? 'rolling' : ''} txu-${resultKey}`}>
            {dice.map((face, i) => (
              <button
                type="button"
                key={i}
                className={`die-btn ${napped[i] ? 'napped' : ''} ${
                  shakeIdx === i ? 'shaking' : ''
                }`}
                onClick={() => nanDie(i)}
                disabled={rolling || napped[i] || napsLeft <= 0}
                title={`Nặn con thứ ${i + 1} (-${formatCoins(NAN_COST)})`}
              >
                <span className="die">{DICE_FACES[face - 1]}</span>
                <span className="die-pin">
                  {napped[i] ? 'ĐÃ NẶN' : `NẶN ${napsLeft}`}
                </span>
              </button>
            ))}
          </div>

          <div className="txu-total">
            Tổng: <strong>{total}</strong> · {labelOf(resultKey)}
          </div>
          <div className="txu-preview" aria-hidden="true">
            {preview}
          </div>
        </div>

        <div className={`txu-message ${tone}`}>
          {message || 'Chọn cửa, nặn/soi xúc xắc rồi đặt cược để bắt đầu.'}
        </div>

        <div className="txu-tools">
          <button
            type="button"
            className="btn outline txu-tool"
            onClick={soi}
            disabled={rolling || soiOpen}
          >
            🔮 Soi kết quả ({formatCoins(SOI_COST)})
          </button>
          <button
            type="button"
            className="btn outline txu-tool"
            onClick={resetActions}
            disabled={rolling}
          >
            ♻️ Đặt lại nặn ({napsLeft}/{NAN_PER_ROUND})
          </button>
        </div>

        {soiOpen && soiResult && (
          <div className={`txu-soi ${soiResult.key}`}>
            <span className="txu-soi-label">🔮 Kết quả soi</span>
            <span className="txu-soi-dice">
              {soiResult.dice.map((d, i) => (
                <span key={i} className="soi-die">
                  {DICE_FACES[d - 1]}
                </span>
              ))}
            </span>
            <span className="txu-soi-total">
              {labelOf(soiResult.key)} · Tổng {soiResult.sum}
            </span>
          </div>
        )}

        <div className="txu-pick">
          <button
            type="button"
            className={`txu-pick-btn tai ${pick === 'tai' ? 'active' : ''}`}
            onClick={() => setPick('tai')}
            disabled={rolling}
          >
            <span className="pick-icon">🔺</span>
            <span className="pick-name">TÀI</span>
            <span className="pick-range">11 – 17</span>
            <span className="pick-rate">x2 · Bão x3</span>
          </button>
          <button
            type="button"
            className={`txu-pick-btn xiu ${pick === 'xiu' ? 'active' : ''}`}
            onClick={() => setPick('xiu')}
            disabled={rolling}
          >
            <span className="pick-icon">🔻</span>
            <span className="pick-name">XỈU</span>
            <span className="pick-range">4 – 10</span>
            <span className="pick-rate">x2 · Bão x3</span>
          </button>
        </div>

        <div className="txu-bet-row">
          <div className="txu-chips">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${bet === c ? 'active' : ''}`}
                onClick={() => setBet(c)}
                disabled={rolling}
              >
                {c.toLocaleString('vi-VN')}
              </button>
            ))}
          </div>
          <label className="txu-custom">
            <span>Mức cược</span>
            <input
              type="number"
              min="1000"
              step="1000"
              value={bet}
              onChange={(e) => setBet(Number(e.target.value) || 0)}
              disabled={rolling}
            />
          </label>
        </div>

        <button
          type="button"
          className="btn primary txu-play"
          onClick={play}
          disabled={rolling}
        >
          {rolling ? 'Đang lắc...' : `🎲 Lắc xúc xắc (cược ${formatCoins(bet)})`}
        </button>

        <p className="txu-note">
          Nặn giữ nguyên con xúc xắc bạn chọn. Chỉ mang tính giải trí với xu ảo, không liên quan tiền thật.
        </p>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Lịch sử chơi</h2>
          {history.length > 0 && (
            <button type="button" className="link-btn" onClick={clearHistory}>
              Xóa lịch sử
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div className="txu-empty">Chưa có lượt chơi nào.</div>
        ) : (
          <div className="txu-history">
            {history.map((h) => (
              <div className="txu-history-row" key={h.id}>
                <span className={`txu-badge ${h.result}`}>{labelOf(h.result)}</span>
                <span className="txu-history-total">Tổng {h.total}</span>
                <span className="muted">
                  Cược {labelOf(h.pick)} · {formatCoins(h.bet)}
                  {h.napped ? ` · nặn ${h.napped}` : ''}
                </span>
                <span className={`txu-delta ${h.delta > 0 ? 'win' : 'lose'}`}>
                  {h.delta > 0 ? `+${formatCoins(h.delta)}` : `-${formatCoins(h.bet)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}