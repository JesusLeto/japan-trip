import { useRef } from 'react';
import { useApp } from '../../state/AppContext';
import { computeTotalCost, formatDaySummary } from '../../utils/dayInfo';
import { formatYen } from '../../utils/money';
import { ruPlural } from '../../utils/pluralize';
import { SectionHeading } from '../SectionHeading';
import { DayStrip } from './DayStrip';
import { DayPanel } from './DayPanel';
import { RouteMap, type RouteMapHandle } from './RouteMap';

export function RouteSection() {
  const { trip, state } = useApp();
  const mapRef = useRef<RouteMapHandle>(null);
  const hasMapPoints = trip.days.some((d) => d.points.length > 0);
  const day = trip.days.find((d) => d.id === state.day) ?? null;

  if (!hasMapPoints) return null;

  const summary = day
    ? formatDaySummary(day)
    : (() => {
        const totalPts = trip.days.reduce((sum, d) => sum + d.points.length, 0);
        const totalCost = computeTotalCost(trip.days);
        return `${totalPts} ${ruPlural(totalPts, ['точка', 'точки', 'точек'])} · ${trip.meta.routeOverviewSummary ?? ''} · транспорт всего ~${formatYen(totalCost)}`;
      })();

  return (
    <section id="sec-map" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <SectionHeading
          num="/ 03"
          titlePrefix="Маршрут"
          titleAccent="на карте"
          subtitle="Клик по дню — карта зумится на его точки. Клик по точке в панели дня — центрирует карту."
        />

        <DayStrip />
        <div className="mb-[18px] font-mono text-xs font-medium text-text-dim">{summary}</div>

        <div className="grid items-start gap-5 max-[900px]:grid-cols-1 min-[901px]:grid-cols-[minmax(0,1fr)_360px]">
          <RouteMap ref={mapRef} trip={trip} day={day} />
          <aside className="max-h-[560px] overflow-auto rounded-[4px] border border-bg-active p-[18px] pb-2.5 max-[900px]:max-h-none">
            {day ? (
              <DayPanel.DayDetail day={day} onSelectPoint={(index) => mapRef.current?.flyToPoint(day.id, index)} />
            ) : (
              <DayPanel.Overview />
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
