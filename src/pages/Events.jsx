import { useEffect, useState } from 'react'
const storeKey = 'ppatl_events'

export default function Events() {
  const [events, setEvents] = useState([])
  const [title, setTitle]   = useState('')
  const [date, setDate]     = useState('')
  const [city,  setCity]    = useState('Atlanta, GA')
  const [flyer, setFlyer]   = useState('')

  useEffect(() => {
    setEvents(JSON.parse(localStorage.getItem(storeKey) || '[]'))
  }, [])
  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify(events))
  }, [events])

  function addEvent() {
    if (!title || !date) return alert('Title and date are required.')
    setEvents(prev => [{ id: Date.now(), title, date, city, flyer }, ...prev])
    setTitle(''); setDate(''); setCity('Atlanta, GA'); setFlyer('')
  }
  function remove(id) {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{padding:'1rem'}}>
      <h2>Upcoming events & promotions</h2>

      <div style={{display:'grid', gap:8, gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', alignItems:'end', margin:'12px 0'}}>
        <div>
          <label>Title</label><br/>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Afrobeats Night – Ve" style={{width:'100%'}}/>
        </div>
        <div>
          <label>Date</label><br/>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%'}}/>
        </div>
        <div>
          <label>City</label><br/>
          <input value={city} onChange={e=>setCity(e.target.value)} style={{width:'100%'}}/>
        </div>
        <div>
          <label>Flyer URL (optional)</label><br/>
          <input value={flyer} onChange={e=>setFlyer(e.target.value)} placeholder="https://…" style={{width:'100%'}}/>
        </div>
        <button onClick={addEvent} style={{height:38}}>Add event</button>
      </div>

      <div style={{display:'grid', gap:12}}>
        {events.length === 0 && <p>No events yet.</p>}
        {events.map(ev => (
          <div key={ev.id} style={{border:'1px solid #333', borderRadius:8, padding:12, display:'flex', gap:12}}>
            {ev.flyer ? (
              <img src={ev.flyer} alt="flyer" style={{width:120, height:120, objectFit:'cover', borderRadius:8}}/>
            ) : (
              <div style={{width:120, height:120, border:'1px dashed #444', borderRadius:8, display:'grid', placeItems:'center', color:'#777'}}>No flyer</div>
            )}
            <div style={{flex:1}}>
              <h3 style={{margin:'4px 0'}}>{ev.title}</h3>
              <div><b>{ev.date}</b> — {ev.city}</div>
              <div style={{marginTop:8, display:'flex', gap:8}}>
                <button onClick={()=>remove(ev.id)} style={{background:'#742', color:'#fff'}}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
