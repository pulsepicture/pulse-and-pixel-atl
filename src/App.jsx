import React, { useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";

/** Utilities */
function uid(n=24){const c='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let o='';for(let i=0;i<n;i++)o+=c[Math.floor(Math.random()*c.length)];return o}
function getBase(){ return location.origin + location.pathname.replace(/\/$/, ""); }
function getLinkUrl(token){ return `${getBase()}?g=${token}` }

/** === MAIN APP === */
export default function App(){
  // Galleries / client links state
  const [events, setEvents] = useState(()=>{
    const id = uid(8);
    return [{ id, name:"New Event", date:new Date().toISOString().slice(0,10), venue:"Atlanta, GA", photos:[] }];
  });
  const [active, setActive] = useState(events[0].id);
  const ev = useMemo(()=>events.find(e=>e.id===active), [events, active]);
  const [links, setLinks] = useState([]);

  // Promotions (Upcoming Events) state
  const [promos, setPromos] = useState([]);
  const [pTitle, setPTitle] = useState("");
  const [pDate, setPDate] = useState("");
  const [pVenue, setPVenue] = useState("Atlanta, GA");
  const [pCover, setPCover] = useState("");   // flyer image URL
  const [pLink, setPLink] = useState("");     // tickets / RSVP / IG link

  // Deep link client view (?g=token)
  const tokenParam = new URLSearchParams(location.search).get("g");
  const link = links.find(l=>l.token===tokenParam);
  if (tokenParam && link) return <ClientView link={link} events={events} />;

  return (
    <>
      <header>
        <div className="logo">Pulse & Pixel ATL</div>
        <div className="nav-right">
          {/* Instagram */}
          <a className="btn" href="https://instagram.com/pulseandpixelatl" target="_blank" rel="noreferrer" title="Instagram">
            {/* petit icône IG en SVG */}
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11.001A5.5 5.5 0 0 1 12 7.5zm0 2a3.5 3.5 0 1 0 0 7.001 3.5 3.5 0 0 0 0-7zm5.75-2.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
              </svg>
            </span>
            <span style={{marginLeft:6}}>Instagram</span>
          </a>
        </div>
      </header>

      <main>
        {/* === Galleries / Links section === */}
        <div className="controls" style={{marginBottom:12}}>
          <button onClick={()=>{
            const id=uid(8);
            setEvents([{ id, name:`Event ${id}`, date:new Date().toISOString().slice(0,10), venue:"Atlanta, GA", photos:[] }, ...events]);
            setActive(id);
          }}>New event</button>

          {/* Event name */}
          {ev && (
            <input
              className="input"
              style={{maxWidth:360}}
              value={ev.name}
              onChange={e=>setEvents(prev=>prev.map(x=>x.id===ev.id?{...x,name:e.target.value}:x))}
              placeholder="Event name (e.g., Teranga — 2025-10-07)"
            />
          )}

          {/* Two explicit buttons (no dropdown) */}
          {ev && (
            <>
              <button onClick={()=>createEventQR(ev, setLinks)}>Create Event QR (public)</button>
              <button onClick={()=>createClientLink(ev, setLinks)}>Create client link (selected photos)</button>
            </>
          )}
        </div>

        {/* Uploader + grid */}
        {ev && (
          <>
            <div style={{margin:'8px 0'}}><strong>{ev.name}</strong> — {ev.date} • {ev.venue}</div>
            <Uploader onAdd={(urls)=>{
              setEvents(prev=>prev.map(e=>e.id===ev.id?{
                ...e,
                photos:[...urls.map(u=>({id:uid(6),url:u,addedAt:Date.now(),selected:false})),...e.photos]
              }:e))
            }} />
            <div className="grid" style={{marginTop:12}}>
              {ev.photos.map(p=>(
                <PhotoCard key={p.id} photo={p} onToggle={()=>{
                  setEvents(prev=>prev.map(e=>e.id===ev.id?{
                    ...e,
                    photos:e.photos.map(ph=>ph.id===p.id?{...ph,selected:!ph.selected}:ph)
                  }:e))
                }} />
              ))}
            </div>
          </>
        )}

        {/* Generated links */}
        <h3 style={{marginTop:24}}>Generated Links</h3>
        <div style={{display:'grid', gap:8}}>
          {links.length===0 && <div style={{color:'#8b8fa3'}}>No links yet.</div>}
          {links.map(l=> <LinkRow key={l.token} link={l} />)}
        </div>

        {/* === Promotions / Upcoming Events === */}
        <section className="section">
          <h3>Upcoming Events & Promotions</h3>
          <div className="card" style={{padding:12, marginBottom:12}}>
            <div className="row">
              <input className="input" style={{maxWidth:260}} value={pTitle} onChange={e=>setPTitle(e.target.value)} placeholder="Title (e.g., Afrobeats Night – Fri)" />
              <input className="input" style={{maxWidth:180}} value={pDate} onChange={e=>setPDate(e.target.value)} placeholder="Date (YYYY-MM-DD)" />
              <input className="input" style={{maxWidth:220}} value={pVenue} onChange={e=>setPVenue(e.target.value)} placeholder="Venue (e.g., Teranga ATL)" />
              <input className="input" value={pCover} onChange={e=>setPCover(e.target.value)} placeholder="Flyer image URL (optional)" />
              <input className="input" value={pLink} onChange={e=>setPLink(e.target.value)} placeholder="Tickets/RSVP/IG link (optional)" />
              <button onClick={()=>{
                if(!pTitle){ alert("Add a title"); return; }
                const id = uid(10);
                setPromos([{ id, title:pTitle, date:pDate, venue:pVenue, cover:pCover, link:pLink }, ...promos]);
                setPTitle(""); setPDate(""); setPVenue("Atlanta, GA"); setPCover(""); setPLink("");
              }}>Add promotion</button>
            </div>
          </div>

          <div className="promo-grid">
            {promos.length===0 && <div className="small">No promotions yet. Add flyers, partner restaurants/clubs, upcoming birthdays, etc.</div>}
            {promos.map(pr=>(
              <div key={pr.id} className="promo-card">
                {pr.cover ? <img className="promo-cover" src={pr.cover} alt="flyer" /> : <div className="promo-cover" />}
                <div className="promo-body">
                  <div style={{fontWeight:700}}>{pr.title}</div>
                  <div className="small">{pr.date || "Date TBA"} • {pr.venue}</div>
                  <div className="row" style={{marginTop:8}}>
                    {pr.link && <a className="btn" href={pr.link} target="_blank" rel="noreferrer">Open link</a>}
                    <details>
                      <summary>QR</summary>
                      <div style={{background:'#0b0d12',padding:10,borderRadius:12}}>
                        <QRCode value={pr.link || `${getBase()}#${pr.id}`} size={160} />
                      </div>
                    </details>
                    <button onClick={()=>setPromos(promos.filter(x=>x.id!==pr.id))}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        © {new Date().getFullYear()} Pulse & Pixel ATL — Make the night move. • Follow us on Instagram: @pulseandpixelatl
      </footer>
    </>
  );
}

/** === UI Components === */
function PhotoCard({photo, onToggle}){
  return (
    <div className="card" onClick={onToggle} style={{cursor:'pointer'}}>
      <img src={photo.url} alt="photo" />
      <div className="badge">{photo.selected ? "SELECTED" : "PREVIEW"}</div>
    </div>
  );
}

function LinkRow({link}){
  return (
    <div className="card" style={{padding:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
        <div style={{minWidth:0}}>
          <div style={{fontWeight:600}}>{link.clientName}</div>
          <div style={{fontSize:12, color:'#8b8fa3', overflow:'hidden', textOverflow:'ellipsis'}}>{getLinkUrl(link.token)}</div>
          <div style={{fontSize:11, color:'#8b8fa3'}}>Expires: {link.expiresAt || "—"}</div>
        </div>
        <details>
          <summary>QR</summary>
          <div style={{background:'#0b0d12',padding:10,borderRadius:12}}>
            <QRCode value={getLinkUrl(link.token)} size={160} />
          </div>
        </details>
      </div>
    </div>
  );
}

function Uploader({onAdd}){
  const ref = useRef(null);
  function handle(files){ const arr=[...files]; const urls=arr.map(f=>URL.createObjectURL(f)); if(urls.length) onAdd(urls); }
  return (
    <div className="card" style={{padding:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{color:'#cbd5e1'}}>Import photos (drag & drop or choose)</div>
        <input ref={ref} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handle(e.target.files)} />
        <button onClick={()=>ref.current?.click()}>Choose files</button>
      </div>
      <div onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault(); handle(e.dataTransfer.files)}} style={{marginTop:12,height:100,display:'grid',placeItems:'center',border:'2px dashed #2a3140',borderRadius:12}}>
        Drop images here…
      </div>
    </div>
  );
}

/** === Link builders === */
function createEventQR(event, setLinks){
  const token = uid(18);
  const expiresAt = new Date(Date.now()+7*24*60*60*1000).toISOString().slice(0,10);
  const link = { token, eventId:event.id, clientName:`Event QR — ${event.name}`, expiresAt, kind:"event" };
  setLinks(prev=>[link, ...prev]);
  navigator.clipboard?.writeText(getLinkUrl(token));
  alert("Event QR copied: "+getLinkUrl(token));
}

function createClientLink(event, setLinks){
  const selected = event.photos.filter(p=>p.selected);
  if (selected.length===0) { alert("Select at least 1 photo first."); return; }
  const token = uid(18);
  const expiresAt = new Date(Date.now()+7*24*60*60*1000).toISOString().slice(0,10);
  const link = { token, eventId:event.id, clientName:`Client link (${selected.length} photos)`, expiresAt, kind:"client", selectedIds:selected.map(p=>p.id) };
  setLinks(prev=>[link, ...prev]);
  navigator.clipboard?.writeText(getLinkUrl(token));
  alert("Client link copied: "+getLinkUrl(token));
}

/** === Client view (gallery) === */
function ClientView({link,events}){
  const ev = events.find(e=>e.id===link.eventId);
  const [unlocked,setUnlocked] = useState(!!new URLSearchParams(location.search).get("paid"));
  if(!ev) return <div style={{padding:24}}>Gallery not found.</div>;

  const photos = link.kind==="client" && link.selectedIds?.length
    ? ev.photos.filter(p=>link.selectedIds.includes(p.id))
    : ev.photos;

  async function buy(){
    const r = await fetch("/api/create-checkout-session",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ token:link.token, eventId:link.eventId, clientName:link.clientName, returnBase:getBase() })
    });
    const data = await r.json(); if (data.url) location.href = data.url;
  }

  return (
    <>
      <header>
        <div className="logo">Pulse & Pixel ATL</div>
        <div>{ev.name} • {ev.date}</div>
      </header>
      <main>
        <div className="card" style={{padding:12,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          {!unlocked ? (
            <>
              <div>HD downloads after secure payment.</div>
              <div className="controls">
                <button onClick={buy}>Buy HD</button>
                <button onClick={()=>setUnlocked(true)} title="Demo unlock">Unlock (demo)</button>
              </div>
            </>
          ) : <div>Thank you! HD downloads are now enabled.</div>}
        </div>
        <div className="grid">
          {photos.map(p=>(
            <div key={p.id} className="card">
              <img src={p.url} alt="photo" />
              {!unlocked && <div className="badge">PREVIEW</div>}
              <div style={{position:'absolute',right:8,bottom:8}}>
                <a className="btn" href={p.url} download={true} onClick={e=>{ if(!unlocked){ e.preventDefault(); alert("Complete payment to download HD."); }}}>Download</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
