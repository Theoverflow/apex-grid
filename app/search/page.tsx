import type { Metadata } from 'next';
import Link from 'next/link';
import { articles, events, teams } from '@/lib/data';

export const metadata: Metadata = { title: 'Recherche', robots: { index: false, follow: true }, alternates: { canonical: '/search' } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().toLocaleLowerCase('fr');
  const items = [...events.map(x => ({ title: x.name, href: `/events/${x.slug}`, text: x.summary })), ...teams.map(x => ({ title: x.name, href: `/teams/${x.slug}`, text: x.summary })), ...articles.map(x => ({ title: x.title, href: `/news/${x.slug}`, text: x.excerpt }))];
  const results = q ? items.filter(x => `${x.title} ${x.text}`.toLocaleLowerCase('fr').includes(q)).slice(0, 20) : [];
  return <><header className="page-hero"><div className="shell"><div className="eyebrow">Recherche interne</div><h1>Rechercher</h1><p className="lead">Retrouvez une course, une équipe ou une analyse.</p></div></header><section className="section shell"><form className="search-form" action="/search"><label className="skip-link" htmlFor="q">Votre recherche</label><input id="q" name="q" defaultValue={q} type="search" minLength={2} maxLength={80} placeholder="Ex. aérodynamique" /><button className="button" type="submit">Rechercher</button></form>{q ? <div className="section"><h2>{results.length} résultat{results.length > 1 ? 's' : ''}</h2><div className="championship-list">{results.map(r => <article className="card" key={r.href}><h3><Link href={r.href}>{r.title}</Link></h3><p>{r.text}</p></article>)}</div></div> : null}</section></>;
}
