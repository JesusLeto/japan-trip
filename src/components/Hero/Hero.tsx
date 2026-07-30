import { useApp } from '../../state/AppContext';

export function Hero() {
  const { trip } = useApp();

  return (
    <section className="mx-auto max-w-[1160px] px-6 pt-24 pb-[72px] max-[900px]:px-5 max-[900px]:pt-14 max-[900px]:pb-12">
      <div className="font-mono text-xs font-medium tracking-[0.16em] text-accent uppercase">
        {trip.meta.heroLabel}
      </div>
      <h1 className="mt-5 mb-6 max-w-[860px] text-[62px] leading-[1.06] font-bold tracking-[-0.02em] text-text-bright text-balance max-[900px]:text-[38px]">
        {trip.meta.heroTitle} <em className="text-accent">{trip.meta.heroTitleAccent}</em>
      </h1>
      {trip.meta.heroSubtitle.map((paragraph) => (
        <p key={paragraph} className="mt-3 max-w-[620px] text-lg leading-[1.6] text-text-muted first:mt-0">
          {paragraph}
        </p>
      ))}
      {trip.meta.heroChips.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {trip.meta.heroChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-border bg-bg-raised px-3.5 py-1.5 font-mono text-[12.5px] text-text-dim"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
