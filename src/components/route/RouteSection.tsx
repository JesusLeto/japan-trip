import { useRef } from 'react';
import { useApp } from '../../state/AppContext';
import { resolveCityColor } from '../../utils/cityColor';
import { computeTotalCost, formatDaySummary } from '../../utils/dayInfo';
import { formatYen } from '../../utils/money';
import { ruPlural } from '../../utils/pluralize';
import { SectionHeading } from '../SectionHeading';
import { DayCard } from './DayCard';
import { DayStrip } from './DayStrip';
import { DayPanelDayDetail } from './DayPanelDayDetail';
import { RouteMap, type RouteMapHandle } from './RouteMap';

export function RouteSection() {
  const { trip, state } = useApp();
  const mapRef = useRef<RouteMapHandle>(null);
  const day = trip.days.find((d) => d.id === state.day) ?? null;
  const dayNumber = day ? trip.days.indexOf(day) + 1 : 0;
  const totalPoints = trip.days.reduce((sum, d) => sum + d.points.length, 0);
  const hasDayTimeline = day !== null && day.points.length > 0;

  const summary = (() => {
    if (day) {
      return day.points.length > 0 ? formatDaySummary(day) : `${day.label} · ${day.city} · ${day.title}`;
    }
    if (totalPoints === 0) {
      return `${trip.days.length} ${ruPlural(trip.days.length, ['день', 'дня', 'дней'])} · выберите день, чтобы прочитать план и увидеть его на карте`;
    }
    return `${totalPoints} ${ruPlural(totalPoints, ['точка', 'точки', 'точек'])} · ${trip.meta.routeOverviewSummary ?? ''} · транспорт всего ~${formatYen(computeTotalCost(trip.days))}`;
  })();

  return (
    <section id="sec-map" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <SectionHeading
          num="/ 03"
          titlePrefix="Маршрут"
          titleAccent="день за днём"
          subtitle="Выберите день — сначала план словами (утро / день / вечер, переезды, еда, план Б), ниже тот же день на карте."
        />

        <DayStrip />
        <div className="mb-[18px] font-mono text-xs font-medium text-text-dim">{summary}</div>

        {day && (
          <div className="mb-6 border-b border-divider pb-8">
            <DayCard day={day} dayNumber={String(dayNumber).padStart(2, '0')} cityColor={resolveCityColor(trip.cities, day.city)} />
          </div>
        )}

        <div
          className={`grid items-start gap-5 grid-cols-1 ${
            hasDayTimeline ? 'min-[901px]:grid-cols-[minmax(0,1fr)_360px]' : ''
          }`}
        >
          <RouteMap ref={mapRef} trip={trip} day={day} />
          {hasDayTimeline && (
            <aside className="max-h-[560px] overflow-auto rounded-[4px] border border-bg-active p-[18px] pb-2.5 max-[900px]:max-h-none">
              <DayPanelDayDetail day={day} onSelectPoint={(index) => mapRef.current?.flyToPoint(day.id, index)} />
            </aside>
          )}
        </div>

        {totalPoints === 0 && (
          <p className="mt-3 text-[12.5px] leading-[1.55] text-text-faint">
            Точки маршрута пока без координат — карта покажет их, когда добавим координаты в данные поездки.
          </p>
        )}
      </div>
    </section>
  );
}
