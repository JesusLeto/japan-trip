import { useApp } from '../../state/AppContext';

function chipClass(active: boolean) {
  return `inline-flex cursor-pointer items-center gap-[7px] rounded-[3px] px-3 py-[7px] font-mono text-xs font-medium tracking-[0.03em] transition-colors ${
    active ? 'border border-accent bg-accent-tint text-text-bright' : 'border border-border bg-transparent text-text-dim'
  }`;
}

export function DayStrip() {
  const { trip, state, actions } = useApp();

  return (
    <div className="mt-[30px] mb-3 flex flex-wrap gap-2">
      <button type="button" onClick={() => actions.selectDay(null)} className={chipClass(state.day === null)}>
        Весь маршрут
      </button>
      {trip.days.map((day) => (
        <button
          key={day.id}
          type="button"
          onClick={() => actions.selectDay(day.id)}
          className={chipClass(state.day === day.id)}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: trip.cities[day.city] ?? '#8A94A6' }}
          />
          <span>{day.label}</span>
          <span className="opacity-65">{day.city}</span>
        </button>
      ))}
    </div>
  );
}
