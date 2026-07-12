import { useApp } from '../../state/AppContext';

export function Footer() {
  const { trip } = useApp();

  return (
    <footer className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 py-8 font-mono text-[11px] leading-[1.6] text-text-faint max-[900px]:px-5">
        <div>{trip.meta.kicker} · личный планировщик · всё сохраняется локально</div>
        <div>{trip.meta.footerNote}</div>
      </div>
    </footer>
  );
}
