import React, { useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";

function uid(n=24){const c='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let o='';for(let i=0;i<n;i++)o+=c[Math.floor(Math.random()*c.length)];return o}

const demo = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1600&auto=format&fit=crop"
];

export default function App(){
  const [events, setEvents] = useState(()=>{
    const id = uid(8);
    return [{ id, name:"Demo Event", date:new Date().toISOString().slice(0,10), venue:"Atlanta, GA", photos: demo.map(u=>({id:uid(6),url:u,addedAt:Date.now()})) }]
  });
  const [active, setActive] = useState(events[0].id);
  const ev = useMemo(()=>events.find(e=>e.id===active), [events, active]);
  const [links, setLinks] = useState([]);

  const tokenParam = new URLSearchParams(location.search).get("g");
  const link = links.find(l=>l.token===tokenParam);
  if (tokenParam && link) return <ClientView link={link} events={events} />;

  return (
    <>
      <header>
        <div className="logo">Pulse & Pixel ATL</div>
        <div>Night photos • Client links • Instant QR</div>
      </header>

      <main>
        <div className="controls" style={{marginBottom:12}}>
          <button onClick={()=>{
            const id=uid(8);
            setEvents([{ id, name:"New Event", date:new Date().toISOString().slice(0,10), venue:"Atlanta, GA", photos:[] }, ...events]);
            setActive(id);
          }}>New event</button>
          {ev && <GenerateLink event={ev} onCreate={l=>setLinks([l,...links])} />}
        </div>

        {ev && (
          <>
            <div style={{margin:'8px 0'}}><strong>{ev.name}</strong> — {ev.date} • {ev.venue}</div>
            <Uploader onAdd={(urls)=>{
              setEvents(prev=>prev.map(e=>e.id===ev.id?{...e,photos:[...urls.map(u=>({id:uid(6),url:u,addedAt:Date.now()})),...e.photos]}:e))
            }} />
            <div className="grid" style={{marginTop:12}}>
              {ev.photos.map(p=>(
                <div key={p.id} className="card">
                  <img src={p.url} alt="photo" />
                  <div className="badge">PREVIEW</div>
                </div>
              ))}
            </div>
          </>
        )}

        <h3 style={{marginTop:24}}>Generated Links</h3>
        <div style={{display:'grid', gap:8}}>
          {links.length===0 && <div style={{color:'#8b8fa3'}}>No links yet.</div>}
          {links.map(l=> <LinkRow key={l.token} link={l} />)}
        </div>
      </main>

      <footer>© {new Date().getFullYear()} Pulse & Pixel ATL — Make the night move.</footer>
    </>
  );
}

function getLinkUrl(token){ const base = location.origin+location.pathname; return `${base}?g=${token}` }

function GenerateLink({event,onCreate}){
  const [name,setName] = useState("VIP Guest / Table");
  const [days,setDays] = useState(7);
  function create(){
    const token = uid(18);
    const expiresAt = new Date(Date.now()+days*24*60*60*1000).toISOString().slice(0,10);
    const link = { token, eventId:event.id, clientName:name, expiresAt, requireEmail:false, paid:false };
    onCreate(link);
    navigator.clipboard?.writeText(getLinkUrl(token));
    alert("Link copied: "+getLinkUrl(token));
  }
  return (
    <div className="controls">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Client / Table name" />
      <input type="number" value={days} onChange={e=>setDays(Number(e.target.value)||1)} title="Expiration days" />
      <button onClick={create}>Create client link</button>
    </div>
  );
}

function LinkRow({link}){
  return (
    <div className="card" style={{padding:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
        <div style={{minWidth:0}}>
          <div style={{fontWeight:600}}>{link.clientName}</div>
          <div style={{fontSize:12,color:'#8b8fa3',overflow:'hidden',textOverflow:'ellipsis'}}>{getLinkUrl(link.token)}</div>
          <div style={{fontSize:11,color:'#8b8fa3'}}>Expires: {link.expiresAt || "—"}</div>
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

function ClientView({link,events}){
  const ev = events.find(e=>e.id===link.eventId);
  const [unlocked,setUnlocked] = useState(false);

  async function buy(){
    const base = location.origin+location.pathname;
    const r = await fetch("/api/create-checkout-session",{
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ token:link.token, eventId:link.eventId, clientName:link.clientName, returnBase:base })
    });
    const data = await r.json(); if (data.url) location.href = data.url;
  }

  if (!ev) return <div style={{padding:24}}>Gallery not found.</div>;

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
          {ev.photos.map(p=>(
            <div key={p.id} className="card">
              <img src={p.url} alt="photo" />
              {!unlocked && <div className="badge">PREVIEW</div>}
              <div style={{position:'absolute',right:8,bottom:8}}>
                <a className="btn" href={p.url} download disabled={!unlocked}>Download</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
