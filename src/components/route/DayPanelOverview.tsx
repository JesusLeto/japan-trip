import { useApp } from '../../state/AppContext';

export function DayPanelOverview() {
  const { trip, actions } = useApp();

  return (
    <div>
      <div className="mb-2.5 font-mono text-[11px] font-medium tracking-[0.1em] text-text-faint uppercase">
        Выберите день
      </div>
      {trip.days.map((day) => (
        <button
          key={day.id}
          type="button"
          onClick={() => actions.selectDay(day.id)}
          className="flex w-full items-baseline justify-between gap-2.5 rounded-[2px] border-t border-divider bg-transparent px-1 py-[11px] text-left font-sans hover:bg-bg-raised"
        >
          <span className="flex min-w-0 items-baseline gap-[9px]">
            <span
              className="font-mono text-[11px] font-semibold"
              style={{ color: trip.cities[day.city] ?? '#8A94A6' }}
            >
              {day.label}
            </span>
            <span className="text-[13.5px] font-semibold whitespace-nowrap text-text-bright">{day.city}</span>
          </span>
          <span className="text-right text-xs text-text-faint">{day.title}</span>
        </button>
      ))}
    </div>
  );
}
