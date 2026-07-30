import { useApp } from '../../state/AppContext';
import { SectionHeading } from '../SectionHeading';

export function SkipListSection() {
  const { trip } = useApp();
  const skipList = trip.skipList;
  if (!skipList) return null;

  return (
    <section id="sec-skip" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <SectionHeading num="/ 07" titlePrefix="Куда заходить" titleAccent="не обязательно" subtitle={skipList.intro} />
        <div className="mt-[30px] grid gap-3">
          {skipList.items.map((item) => (
            <div
              key={item.place}
              className="grid gap-1 border-b border-divider pb-3 last:border-b-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4"
            >
              <span className="font-semibold text-accent">{item.place}</span>
              <span className="text-sm text-text-muted">{item.why}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
