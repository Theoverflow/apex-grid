import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand"><span className="brand-mark">AG</span><span>APEX GRID</span></div>
          <p className="muted">La course automobile expliquée avec précision, vitesse et élégance.</p>
        </div>
        <div>
          <h2 className="footer-title">Explorer</h2>
          <Link href="/championships">Championnats</Link>
          <Link href="/#calendar">Calendrier</Link>
          <Link href="/#news">Analyses</Link>
        </div>
        <div>
          <h2 className="footer-title">Confiance</h2>
          <Link href="/legal/privacy">Confidentialité</Link>
          <a href="mailto:editorial@example.com">Rédaction</a>
        </div>
      </div>
      <div className="shell footer-bottom">© {new Date().getFullYear()} Apex Grid. Démonstration éditoriale.</div>
    </footer>
  );
}
