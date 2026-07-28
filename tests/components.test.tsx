import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EventCard } from '@/components/event-card';
import { events } from '@/lib/data';

describe('EventCard', () => {
  it('renders a descriptive, crawlable event link', () => {
    render(<EventCard event={events[0]!} />);
    const link = screen.getByRole('link', { name: events[0]!.name });
    expect(link).toHaveAttribute('href', `/events/${events[0]!.slug}`);
  });
});
