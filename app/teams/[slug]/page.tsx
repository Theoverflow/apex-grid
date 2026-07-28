import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { findBySlug, teams } from '@/lib/data';

export function generateStaticParams() { return teams.map(({ slug }) => ({ slug })); }
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const team = findBySlug(teams, (await params).slug);
  return team ? { title: team.name, description: team.summary, alternates: { canonical: `/teams/${team.slug}` } } : {};
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const team = findBySlug(teams, (await params).slug);
  if (!team) notFound();
  return <><header className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Équipes', href: '/#teams' }, { label: team.name }]} /><div className="eyebrow">{team.country}</div><h1>{team.name}</h1><p className="lead">{team.summary}</p></div></header><section className="section shell detail-grid"><article className="prose"><h2>Profil technique</h2><p>{team.summary}</p><p>L’architecture de cette page permet d’ajouter pilotes, palmarès, résultats, partenaires et contenus éditoriaux sans modifier les fondations SEO.</p></article><aside className="fact-panel"><div className="fact-row"><span>Voiture</span><strong>{team.car}</strong></div><div className="fact-row"><span>Motorisation</span><strong>{team.powertrain}</strong></div><div className="fact-row"><span>Pays</span><strong>{team.country}</strong></div></aside></section></>;
}
