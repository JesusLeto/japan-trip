import { useRef } from 'react';
import { useApp } from '../../state/AppContext';
import { computeDayInfo, computeTotalCost } from '../../utils/dayInfo';
import { formatYen } from '../../utils/money';
import { ruPlural } from '../../utils/pluralize';
import { DayStrip } from './DayStrip';
import { DayPanel } from './DayPanel';
import { RouteMap, type RouteMapHandle } from './RouteMap';

export function RouteSection() {
  const { trip, state } = useApp();
  const mapRef = useRef<RouteMapHandle>(null);
  const day = trip.days.find((d) => d.id === state.day) ?? null;

  const summary = day
    ? (() => {
        const info = computeDayInfo(day);
        return `${day.label} · ${info.points} ${ruPlural(info.points, ['точка', 'точки', 'точек'])} · ~${info.hours} ч на ногах · транспорт ~${formatYen(info.cost)}`;
      })()
    : (() => {
        const totalPts = trip.days.reduce((sum, d) => sum + d.points.length, 0);
        const totalCost = computeTotalCost(trip.days);
        return `${totalPts} ${ruPlural(totalPts, ['точка', 'точки', 'точек'])} · ${trip.meta.routeOverviewSummary} · транспорт всего ~${formatYen(totalCost)}`;
      })();

  return (
    <section id="sec-map" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <div className="font-mono text-xs font-medium tracking-[0.12em] text-text-faint">/ 03</div>
        <h2 className="mt-3.5 mb-2.5 text-[34px] leading-[1.15] font-bold tracking-[-0.01em] text-text-bright">
          Маршрут <em className="text-accent">на карте</em>
        </h2>
        <p className="max-w-[560px] text-[15px] leading-[1.6] text-text-muted">
          Клик по дню — карта зумится на его точки. Клик по точке в панели дня — центрирует карту.
        </p>

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
