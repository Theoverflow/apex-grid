import type { Article, Event, Organization, WebSite, BreadcrumbList, SportsEvent } from 'schema-dts';
import { absoluteUrl, siteConfig } from './site';

export const organizationJsonLd: Organization = {
  '@type': 'Organization',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  alternateName: siteConfig.alternativeNames,
  description: siteConfig.description,
  url: siteConfig.url,
  logo: absoluteUrl('/brand-mark.svg'),
  sameAs: Object.values(siteConfig.social)
};

export const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': `${siteConfig.url}/#website`,
  url: siteConfig.url,
  name: siteConfig.name,
  inLanguage: 'fr-FR',
  publisher: { '@id': `${siteConfig.url}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteConfig.url}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
} as WebSite;

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function eventJsonLd(event: {
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  circuit: string;
  summary: string;
}): SportsEvent {
  return {
    '@type': 'SportsEvent',
    '@id': `${absoluteUrl(`/events/${event.slug}`)}#event`,
    name: event.name,
    description: event.summary,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.circuit,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: event.country
      }
    },
    url: absoluteUrl(`/events/${event.slug}`),
    organizer: { '@id': `${siteConfig.url}/#organization` }
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
}): Article {
  return {
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: 'fr-FR',
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
    author: { '@type': 'Person', name: article.author },
    publisher: { '@id': `${siteConfig.url}/#organization` },
    image: absoluteUrl('/og-default.svg')
  };
}
