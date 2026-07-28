import Link from 'next/link';

const nav = [
  ['Championnats', '/championships'],
  ['Calendrier', '/#calendar'],
  ['Équipes', '/#teams'],
  ['Analyses', '/#news']
] as const;

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Apex Grid — accueil">
          <span className="brand-mark" aria-hidden="true">AG</span>
          <span>APEX GRID</span>
        </Link>
        <nav aria-label="Navigation principale">
          <ul className="nav-list">
            {nav.map(([label, href]) => (
              <li key={href}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        </nav>
        <Link className="button button-small" href="/search">Rechercher</Link>
      </div>
    </header>
  );
}
