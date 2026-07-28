import Link from 'next/link';
import type { Team } from '@/lib/data';

export function TeamCard({ team, index }: { team: Team; index: number }) {
  return (
    <article className="card team-card">
      <div className="ordinal">0{index + 1}</div>
      <div>
        <div className="card-kicker">{team.country}</div>
        <h3><Link href={`/teams/${team.slug}`}>{team.name}</Link></h3>
        <p>{team.car} · {team.powertrain}</p>
      </div>
    </article>
  );
}
