import Link from 'next/link';
import type { RaceEvent } from '@/lib/data';

const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export function EventCard({ event }: { event: RaceEvent }) {
  return (
    <article className="card event-card">
      <div className="card-kicker">{event.championship}</div>
      <div className="event-date">{formatter.format(new Date(event.startDate))}</div>
      <h3><Link href={`/events/${event.slug}`}>{event.name}</Link></h3>
      <p>{event.city}, {event.country} · {event.circuit}</p>
      <Link className="text-link" href={`/events/${event.slug}`}>Voir la fiche <span aria-hidden="true">↗</span></Link>
    </article>
  );
}
