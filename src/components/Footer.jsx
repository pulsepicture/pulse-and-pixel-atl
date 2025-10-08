// src/components/Footer.jsx
import site from '../siteConfig';

export default function Footer() {
  const c = site.contact;
  return (
    <footer className="footer">
      <div className="container">
        <strong>{site.brand}</strong> — {site.slogan}
        <div className="links">
          <a href={`mailto:${c.email}`}>{c.email}</a>
          <span>•</span>
          <a href={`tel:${c.phone}`}>{c.phoneDisplay}</a>
          <span>•</span>
          <a href={c.instagramUrl} target="_blank" rel="noreferrer">
            @{c.instagramHandle}
          </a>
          <span>•</span>
          <a href={c.mapsUrl} target="_blank" rel="noreferrer">Atlanta, GA</a>
        </div>
        <small>© {new Date().getFullYear()} {site.brand}. All rights reserved.</small>
      </div>
    </footer>
  );
}

