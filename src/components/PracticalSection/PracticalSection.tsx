import { useApp } from '../../state/AppContext';
import { SectionHeading } from '../SectionHeading';

export function PracticalSection() {
  const { trip } = useApp();
  const practical = trip.practical;
  if (!practical) return null;

  return (
    <section id="sec-practical" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <SectionHeading num="/ 06" titlePrefix="Практика" titleAccent="перед поездкой" />
        <div className="mt-[30px] grid gap-4 sm:grid-cols-2">
          {practical.cards.map((card) => (
            <div key={card.title} className="rounded-[10px] border border-divider bg-bg-raised p-4">
              <h3 className="mb-2 text-sm font-semibold text-accent">{card.title}</h3>
              <p className="text-[13.8px] leading-[1.55] text-text-muted">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
