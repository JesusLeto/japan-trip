import { useApp } from '../../state/AppContext';
import { SectionHeading } from '../SectionHeading';

export function HotelsSection() {
  const { trip } = useApp();
  const hotels = trip.hotels;
  if (!hotels) return null;

  return (
    <section id="sec-hotels" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <SectionHeading num="/ 04" titlePrefix="Где" titleAccent="спать" subtitle={hotels.intro} />
        <div className="mt-[30px] grid gap-4">
          {hotels.cards.map((card) => (
            <div key={card.city} className="rounded-[10px] border border-divider bg-bg-raised p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="font-semibold text-text-bright">{card.city}</span>
                <span className="font-mono text-xs text-text-faint">{card.nights}</span>
              </div>
              <p className="mt-2 text-sm text-text-muted">{card.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {card.names.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-border bg-bg px-2.5 py-1 text-[13px] text-text"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
