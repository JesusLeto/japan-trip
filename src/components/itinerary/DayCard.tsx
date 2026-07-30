import { renderRichText } from '../../utils/richText';
import type { TripDay } from '../../types/trip';

interface DayBlockProps {
  label: string;
  text: string;
}

function DayBlock({ label, text }: DayBlockProps) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-[10px] border border-divider bg-bg-raised p-3">
      <div className="pt-0.5 text-[11px] tracking-[0.06em] text-text-faint uppercase">{label}</div>
      <p className="text-[14.5px] leading-[1.6] text-text">{renderRichText(text)}</p>
    </div>
  );
}

interface NoteBoxProps {
  kind: 'food' | 'plan';
  text: string;
}

function NoteBox({ kind, text }: NoteBoxProps) {
  const label = kind === 'food' ? 'Еда' : 'План Б';
  const labelColorClass = kind === 'food' ? 'text-accent' : 'text-[#7FB069]';

  return (
    <div className="rounded-[9px] border border-divider bg-bg-raised p-3 text-[13.5px] leading-[1.5] text-text-muted">
      <span className={`mb-1 block text-[11px] font-bold tracking-[0.05em] uppercase ${labelColorClass}`}>
        {label}
      </span>
      {renderRichText(text)}
    </div>
  );
}

interface DayCardProps {
  day: TripDay;
  dayNumber: string;
  cityColor: string;
}

export function DayCard({ day, dayNumber, cityColor }: DayCardProps) {
  const blocks = day.blocks;

  return (
    <section
      id={`itin-${day.id}`}
      className="grid scroll-mt-[112px] grid-cols-1 gap-4 border-b border-divider py-8 last:border-b-0 md:grid-cols-[110px_minmax(0,1fr)] md:gap-6"
    >
      <div className="flex items-baseline gap-3 md:block">
        <div className="font-mono text-3xl font-bold" style={{ color: cityColor }}>
          {dayNumber}
        </div>
        <div className="mt-1 text-sm text-text-muted">{day.city}</div>
        {day.base && <div className="mt-0.5 text-xs text-text-faint">{day.base}</div>}
      </div>

      <div className="min-w-0">
        <div className="mb-3.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-2">
          <h3 className="text-xl font-semibold text-text-bright">{day.title}</h3>
          {day.keyTag && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px]"
              style={{ color: cityColor, borderColor: cityColor }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: cityColor }} />
              {day.keyTag}
            </span>
          )}
        </div>

        <div className="grid gap-3.5">
          {blocks?.morning && <DayBlock label="Утро" text={blocks.morning} />}
          {blocks?.day && <DayBlock label="День" text={blocks.day} />}
          {blocks?.evening && <DayBlock label="Вечер" text={blocks.evening} />}
        </div>

        {day.transitNotes && day.transitNotes.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-2">
            {day.transitNotes.map((note) => (
              <span
                key={note}
                className="rounded-lg border border-border bg-bg-raised px-2.5 py-1.5 font-mono text-[12.5px] text-text-dim"
              >
                {note}
              </span>
            ))}
          </div>
        )}

        {(day.foodNote || day.planBNote) && (
          <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
            {day.foodNote && <NoteBox kind="food" text={day.foodNote} />}
            {day.planBNote && <NoteBox kind="plan" text={day.planBNote} />}
          </div>
        )}

        {day.skipNote && (
          <p className="mt-2.5 text-[13px] text-text-faint">
            <span className="font-semibold text-accent">Пропустите: </span>
            {renderRichText(day.skipNote)}
          </p>
        )}
      </div>
    </section>
  );
}
