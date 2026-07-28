import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { eventJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { events, findBySlug } from '@/lib/data';

export function generateStaticParams() { return events.map(({ slug }) => ({ slug })); }
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = findBySlug(events, slug);
  if (!event) return {};
  return {
    title: event.name,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: { type: 'article', title: event.name, description: event.summary, url: `/events/${event.slug}` }
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = findBySlug(events, (await params).slug);
  if (!event) notFound();
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(event.startDate));
  return (
    <>
      <JsonLd data={[eventJsonLd(event), breadcrumbJsonLd([{ name: 'Accueil', path: '/' }, { name: 'Événements', path: '/#calendar' }, { name: event.name, path: `/events/${event.slug}` }])]} />
      <header className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Calendrier', href: '/#calendar' }, { label: event.name }]} /><div className="eyebrow">{event.championship}</div><h1>{event.name}</h1><p className="lead">{event.summary}</p></div></header>
      <section className="section shell detail-grid">
        <article className="prose"><h2>Présentation de l’épreuve</h2><p>{event.summary}</p><p>Cette fiche est rendue côté serveur, dispose d’une URL canonique et reste utilisable sans JavaScript. Les données de calendrier peuvent être remplacées par une source CMS ou API.</p></article>
        <aside className="fact-panel" aria-label="Informations de course"><div className="fact-row"><span>Date</span><strong>{date}</strong></div><div className="fact-row"><span>Circuit</span><strong>{event.circuit}</strong></div><div className="fact-row"><span>Longueur</span><strong>{event.distanceKm} km</strong></div><div className="fact-row"><span>Tours</span><strong>{event.laps}</strong></div></aside>
      </section>
    </>
  );
}
