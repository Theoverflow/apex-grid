import Link from 'next/link';
import { EventCard } from '@/components/event-card';
import { SectionHeading } from '@/components/section-heading';
import { TeamCard } from '@/components/team-card';
import { articles, championships, events, teams } from '@/lib/data';

export default function HomePage() {
  const featured = articles[0]!;
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Apex Grid · racing premium</div>
            <h1>Le luxe race, au point de corde</h1>
            <p>Apex Grid réunit calendriers, équipes, technologies et analyses de courses automobiles dans une expérience éditoriale sportive, précise et premium.</p>
            <div className="hero-actions">
              <Link className="button" href="#calendar">Voir le calendrier</Link>
              <Link className="text-link" href={`/news/${featured.slug}`}>Lire l’analyse phare</Link>
            </div>
          </div>
          <div className="telemetry" aria-label="Indicateurs éditoriaux">
            <div><strong>03</strong><span>Championnats suivis</span></div>
            <div><strong>12</strong><span>Circuits analysés</span></div>
            <div><strong>24/7</strong><span>Veille paddock</span></div>
          </div>
        </div>
      </section>

      <section className="section shell" id="calendar">
        <SectionHeading eyebrow="Prochains départs" title="Calendrier 2026" intro="Les rendez-vous à suivre, avec les informations essentielles accessibles sur des pages permanentes." />
        <div className="grid-3">{events.map((event) => <EventCard key={event.slug} event={event} />)}</div>
      </section>

      <section className="section alt">
        <div className="shell">
          <SectionHeading eyebrow="Compétitions" title="Trois disciplines. Une obsession." />
          <div className="championship-list">
            {championships.map((championship) => (
              <article className="championship-row" key={championship.slug}>
                <div className="number">{championship.accent}</div>
                <div><div className="card-kicker">{championship.category}</div><h3>{championship.name}</h3></div>
                <p>{championship.description}</p>
                <Link className="text-link" href={`/championships#${championship.slug}`}>Explorer</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell" id="teams">
        <SectionHeading eyebrow="Constructeurs" title="Les forces en présence" />
        <div className="grid-3">{teams.map((team, index) => <TeamCard key={team.slug} team={team} index={index} />)}</div>
      </section>

      <section className="section alt" id="news">
        <div className="shell">
          <SectionHeading eyebrow="Décryptage" title="Ingénierie et stratégie" />
          <div className="news-grid">
            <article className="card news-feature">
              <div className="card-kicker">{featured.topic}</div>
              <h3><Link href={`/news/${featured.slug}`}>{featured.title}</Link></h3>
              <p>{featured.excerpt}</p>
            </article>
            <div className="news-stack">
              {articles.slice(1).map((article) => (
                <article className="card" key={article.slug}>
                  <div className="card-kicker">{article.topic}</div>
                  <h3><Link href={`/news/${article.slug}`}>{article.title}</Link></h3>
                  <p>{article.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" aria-labelledby="editorial-positioning">
        <div className="editorial-manifesto">
          <div>
            <div className="eyebrow"><Link href="/guides/racing-apex">Racing Apex</Link></div>
            <h2 id="editorial-positioning">Comprendre la course au-delà du chronomètre</h2>
          </div>
          <p>Notre ligne éditoriale relie trajectoires, aérodynamique, stratégie et culture automobile. Chaque analyse distingue les faits vérifiés, les données disponibles et l’interprétation de la rédaction.</p>
        </div>
      </section>
    </>
  );
}
