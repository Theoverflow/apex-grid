import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { championships } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Championnats automobiles',
  description: 'Découvrez les championnats suivis par Apex Grid : endurance, monoplaces électriques et grand tourisme.',
  alternates: { canonical: '/championships' }
};

export default function ChampionshipsPage() {
  return (
    <>
      <header className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Championnats' }]} /><div className="eyebrow">Compétitions</div><h1>Championnats</h1><p className="lead">Trois univers techniques, des formats distincts et une même recherche de performance.</p></div></header>
      <section className="section shell championship-list">
        {championships.map((item) => <article id={item.slug} className="championship-row" key={item.slug}><div className="number">{item.accent}</div><div><div className="card-kicker">{item.category}</div><h2>{item.name}</h2></div><p>{item.description}</p></article>)}
      </section>
    </>
  );
}
