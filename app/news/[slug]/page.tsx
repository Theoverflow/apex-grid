import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/jsonld';
import { articles, findBySlug } from '@/lib/data';

export function generateStaticParams() { return articles.map(({ slug }) => ({ slug })); }
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = findBySlug(articles, (await params).slug);
  return article ? { title: article.title, description: article.excerpt, alternates: { canonical: `/news/${article.slug}` }, openGraph: { type: 'article', publishedTime: article.publishedAt, modifiedTime: article.updatedAt, authors: [article.author] } } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = findBySlug(articles, (await params).slug);
  if (!article) notFound();
  return <><JsonLd data={[articleJsonLd(article), breadcrumbJsonLd([{ name: 'Accueil', path: '/' }, { name: 'Analyses', path: '/#news' }, { name: article.title, path: `/news/${article.slug}` }])]} /><header className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Analyses', href: '/#news' }, { label: article.title }]} /><div className="eyebrow">{article.topic}</div><h1>{article.title}</h1><p className="lead">{article.excerpt}</p><p className="muted">Par {article.author} · Mis à jour le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(article.updatedAt))}</p></div></header><article className="section shell prose">{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></>;
}
