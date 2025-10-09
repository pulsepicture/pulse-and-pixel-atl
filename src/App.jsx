import { Routes, Route, NavLink } from 'react-router-dom'
import ClientLinks from './pages/ClientLinks.jsx'
import Events from './pages/Events.jsx'
import Contact from './pages/Contact.jsx'

function Home() {
  return (
    <div style={{padding:'1rem'}}>
      <h2>Pulse & Pixel ATL</h2>
      <p>Make the night move — instant galleries, client links, events & promos.</p>
    </div>
  )
}

const navStyle = {
  display:'flex', gap:'1rem', alignItems:'center',
  padding:'12px 16px', borderBottom:'1px solid #333', position:'sticky', top:0, background:'#0b0b0b'
}

export default function App() {
  return (
    <>
      <header style={navStyle}>
        <b>Pulse & Pixel ATL</b>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/client-links">Client links</NavLink>
        <NavLink to="/events">Events & promos</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/client-links" element={<ClientLinks />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  )
}
