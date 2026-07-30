import { useApp } from '../../state/AppContext';
import { SectionHeading } from '../SectionHeading';
import { DayCard } from './DayCard';

function resolveCityColor(cities: Record<string, string>, cityLabel: string): string {
  if (cities[cityLabel]) return cities[cityLabel];
  const firstToken = cityLabel.split(/[/→]/)[0]?.trim();
  return (firstToken && cities[firstToken]) || '#8A94A6';
}

export function ItinerarySection() {
  const { trip } = useApp();
  const narrativeDays = trip.days.filter((day) => day.blocks);

  if (narrativeDays.length === 0) return null;

  return (
    <section id="sec-itinerary" className="border-t border-bg-active">
      <div className="sticky top-12 z-[4] border-b border-bg-active bg-bg/92 backdrop-blur-[8px]">
        <div className="mx-auto flex max-w-[1160px] gap-1.5 overflow-x-auto px-6 py-2.5 max-[900px]:px-5">
          {narrativeDays.map((day) => (
            <a
              key={day.id}
              href={`#itin-${day.id}`}
              className="flex-none rounded-md border border-border px-2.5 py-1.5 font-mono text-[12px] whitespace-nowrap text-text-dim hover:border-accent hover:text-accent"
            >
              {day.label} {day.city}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1160px] px-6 pt-[52px] pb-2 max-[900px]:px-5">
        <SectionHeading
          num="/ 03"
          titlePrefix="День за"
          titleAccent="днём"
          subtitle="Утро / День / Вечер — с реальными переездами и планом Б, если погода или очередь всё испортят. Цены и время ориентировочные (±10–15%); ближе к поездке перепроверьте расписание в Japan Travel by Navitime."
        />

        <div>
          {narrativeDays.map((day, index) => (
            <DayCard
              key={day.id}
              day={day}
              dayNumber={String(index + 1).padStart(2, '0')}
              cityColor={resolveCityColor(trip.cities, day.city)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
