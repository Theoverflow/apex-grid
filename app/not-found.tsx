import Link from 'next/link';
export default function NotFound() { return <section className="page-hero"><div className="shell"><div className="eyebrow">Erreur 404</div><h1>Hors piste</h1><p className="lead">La page demandée n’existe pas ou a été déplacée.</p><Link className="button" href="/">Retour à l’accueil</Link></div></section>; }
