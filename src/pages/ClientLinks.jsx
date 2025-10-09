import { useEffect, useMemo, useState } from 'react'

const storageKey = 'ppatl_links'
const qrURL = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data)}`

function makeId(len = 22) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function ClientLinks() {
  const [links, setLinks] = useState([])
  const [guestType, setGuestType] = useState('VIP Guest / Table')
  const [expire, setExpire] = useState('')
  const [count, setCount] = useState(1)

  useEffect(() => {
    setLinks(JSON.parse(localStorage.getItem(storageKey) || '[]'))
  }, [])
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(links))
  }, [links])

  const baseOrigin = useMemo(() => window.location.origin, [])

  function createLinks() {
    const exp = expire ? new Date(expire).toISOString().slice(0,10) : null
    const batch = []
    for (let i = 0; i < Math.max(1, Number(count || 1)); i++) {
      const id = makeId()
      const url = `${baseOrigin}/?g=${id}${exp ? `&e=${exp}` : ''}`
      batch.push({ id, url, type: guestType, createdAt: Date.now(), exp })
    }
    setLinks(prev => [...batch, ...prev])
  }

  function removeLink(id) {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  function copy(text) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{padding:'1rem'}}>
      <h2>Client links</h2>

      <div style={{
        display:'grid', gap:'8px', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',
        alignItems:'end', margin:'12px 0'
      }}>
        <div>
          <label>Guest type</label><br/>
          <select value={guestType} onChange={e=>setGuestType(e.target.value)} style={{width:'100%'}}>
            <option>VIP Guest / Table</option>
            <option>Birthday</option>
            <option>Brunch</option>
            <option>Private booking</option>
          </select>
        </div>
        <div>
          <label>Expires (optional)</label><br/>
          <input type="date" value={expire} onChange={e=>setExpire(e.target.value)} style={{width:'100%'}} />
        </div>
        <div>
          <label>How many links?</label><br/>
          <input type="number" min="1" value={count} onChange={e=>setCount(e.target.value)} style={{width:'100%'}} />
        </div>
        <button onClick={createLinks} style={{height:38}}>Create link(s)</button>
      </div>

      <h3>Generated links</h3>
      {links.length === 0 && <p>No links yet.</p>}
      <div style={{display:'grid', gap:'12px'}}>
        {links.map(l => (
          <div key={l.id} style={{border:'1px solid #333', borderRadius:8, padding:12, display:'grid', gap:8}}>
            <div style={{display:'flex', justifyContent:'space-between', gap:8, flexWrap:'wrap'}}>
              <div>
                <b>{l.type}</b><br/>
                <small>ID: {l.id.slice(0,8)}…</small><br/>
                {l.exp && <small>Expires: {l.exp}</small>}
              </div>
              <img alt="QR" src={qrURL(l.url)} width="90" height="90" style={{borderRadius:6}}/>
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <input readOnly value={l.url} style={{flex:1, minWidth:240}} />
              <button onClick={()=>copy(l.url)}>Copy</button>
              <a href={l.url} target="_blank" rel="noreferrer">
                <button>Open</button>
              </a>
              <button onClick={()=>removeLink(l.id)} style={{background:'#742', color:'#fff'}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
