import { useApp } from '../../state/AppContext';
import { formatDaySummary } from '../../utils/dayInfo';
import { formatLegCost } from '../../utils/money';
import type { TripDay } from '../../types/trip';

interface DayPanelDayDetailProps {
  day: TripDay;
  onSelectPoint: (index: number) => void;
}

export function DayPanelDayDetail({ day, onSelectPoint }: DayPanelDayDetailProps) {
  const { trip } = useApp();
  const summary = formatDaySummary(day);
  const color = trip.cities[day.city] ?? '#8A94A6';

  return (
    <div>
      <div className="font-mono text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color }}>
        {day.label} · {day.city.toUpperCase()}
      </div>
      <div className="mt-1.5 mb-[3px] text-xl font-bold tracking-[-0.01em] text-text-bright">{day.title}</div>
      <div className="mb-3 font-mono text-[11px] font-medium text-text-faint">{summary}</div>

      {day.points.map((point, index) => (
        <div key={index}>
          <button
            type="button"
            onClick={() => onSelectPoint(index)}
            className="grid w-full grid-cols-[48px_minmax(0,1fr)] gap-2.5 rounded-[2px] border-t border-divider bg-transparent px-1 py-[11px] text-left font-sans hover:bg-bg-raised"
          >
            <span className="pt-px font-mono text-xs font-semibold text-accent">{point.arr ?? index + 1}</span>
            <span className="block min-w-0">
              <span className="block text-sm leading-[1.35] font-semibold text-text-bright">{point.name}</span>
              {point.dur && point.dur !== '—' && (
                <span className="mt-[3px] block font-mono text-[11px] font-medium text-text-faint">
                  {point.dur} на месте
                </span>
              )}
              <span className="mt-1 block text-[12.5px] leading-[1.55] text-text-muted">{point.desc}</span>
            </span>
          </button>
          {day.legs[index] && (
            <div className="flex items-center gap-[9px] py-[7px] pr-1 pl-[62px] font-mono text-[11px] font-medium text-text-dim">
              <span className="rounded-[2px] border border-border px-1.5 py-0.5 tracking-[0.07em] whitespace-nowrap">
                {day.legs[index].tag}
              </span>
              <span>
                {day.legs[index].line} · {day.legs[index].time} · {formatLegCost(day.legs[index])}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
