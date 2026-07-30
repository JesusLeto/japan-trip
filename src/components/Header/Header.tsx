import { useEffect, useState } from 'react';
import { useApp } from '../../state/AppContext';
import { getSectionCounts } from '../../utils/checklist';
import { ruPlural } from '../../utils/pluralize';

type SectionKey = 'pre' | 'arrival' | 'map';

interface SectionRef {
  id: string;
  key: SectionKey;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 60;
  window.scrollTo({ top, behavior: 'smooth' });
}

function useActiveSection(sections: SectionRef[]): SectionKey | null {
  const [active, setActive] = useState<SectionKey | null>(null);

  useEffect(() => {
    function onScroll() {
      let current: SectionKey | null = null;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top < 170) current = section.key;
      }
      setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join(',')]);

  return active;
}

function counterClass(isActive: boolean) {
  return `font-mono text-xs tracking-wide transition-colors ${
    isActive ? 'text-accent' : 'text-text-dim hover:text-text-bright'
  }`;
}

export function Header() {
  const { trip, state } = useApp();

  const preCounts = getSectionCounts(trip.pre, state);
  const arrivalCounts = getSectionCounts(trip.arrival, state);
  const pointCount = trip.days.reduce((sum, day) => sum + day.points.length, 0);
  const hasNarrativeDays = trip.days.some((day) => day.blocks);

  // Once points have coordinates the route counter is the more precise number; until then, count days.
  const routeNav =
    pointCount > 0
      ? { id: 'sec-map', label: `${pointCount} ${ruPlural(pointCount, ['точка', 'точки', 'точек'])} маршрута` }
      : hasNarrativeDays
        ? { id: 'sec-map', label: `${trip.days.length} ${ruPlural(trip.days.length, ['день', 'дня', 'дней'])} маршрута` }
        : null;

  const sections: SectionRef[] = [
    { id: 'sec-pre', key: 'pre' },
    { id: 'sec-arr', key: 'arrival' },
    ...(routeNav ? [{ id: routeNav.id, key: 'map' as const }] : []),
  ];
  const active = useActiveSection(sections);

  return (
    <header className="sticky top-0 z-[1100] border-b border-bg-active bg-bg/92 backdrop-blur-[8px]">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-3.5 max-[900px]:px-5">
        <div className="whitespace-nowrap font-mono text-[13px] tracking-[0.04em]">
          <span className="font-bold text-accent">{trip.meta.kicker}</span>
          <span className="text-text-faint"> · {trip.meta.routeSummary}</span>
        </div>
        <nav className="hidden gap-[22px] min-[901px]:flex">
          <button type="button" onClick={() => scrollToSection('sec-pre')} className={counterClass(active === 'pre')}>
            {preCounts.checked}/{preCounts.total} до вылета
          </button>
          <button type="button" onClick={() => scrollToSection('sec-arr')} className={counterClass(active === 'arrival')}>
            {arrivalCounts.checked}/{arrivalCounts.total} по прилёту
          </button>
          {routeNav && (
            <button type="button" onClick={() => scrollToSection(routeNav.id)} className={counterClass(active === 'map')}>
              {routeNav.label}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
