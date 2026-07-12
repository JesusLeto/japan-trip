import type { ReactNode } from 'react';
import { useApp } from '../../state/AppContext';
import { ChecklistSectionContext } from './ChecklistSectionContext';
import type { ChecklistSectionId } from '../../types/state';

interface ChecklistSectionProps {
  sectionId: ChecklistSectionId;
  anchor: string;
  num: string;
  titlePrefix: string;
  titleAccent: string;
  subtitle: string;
  children: ReactNode;
}

function segmentClass(active: boolean) {
  return `cursor-pointer border-none px-[13px] py-1.5 font-mono text-xs font-medium tracking-[0.04em] transition-colors ${
    active ? 'bg-bg-active text-text-bright' : 'bg-transparent text-text-faint'
  }`;
}

function switchTrackClass(on: boolean) {
  return `relative inline-block h-4 w-[30px] rounded-full border transition-colors duration-200 ${
    on ? 'border-accent bg-[rgba(230,57,70,0.22)]' : 'border-border-strong bg-transparent'
  }`;
}

function switchKnobClass(on: boolean) {
  return `absolute top-0.5 h-2.5 w-2.5 rounded-full transition-all duration-200 ${
    on ? 'left-[15px] bg-accent' : 'left-0.5 bg-text-faint'
  }`;
}

export function ChecklistSection({
  sectionId,
  anchor,
  num,
  titlePrefix,
  titleAccent,
  subtitle,
  children,
}: ChecklistSectionProps) {
  const { state, actions } = useApp();
  const mode = state.modes[sectionId];
  const hideDone = state.hideDone[sectionId];

  return (
    <section id={anchor} className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <div className="max-w-[720px]">
          <div className="font-mono text-xs font-medium tracking-[0.12em] text-text-faint">{num}</div>
          <h2 className="mt-3.5 mb-2.5 text-[34px] leading-[1.15] font-bold tracking-[-0.01em] text-text-bright">
            {titlePrefix} <em className="text-accent">{titleAccent}</em>
          </h2>
          <p className="max-w-[560px] text-[15px] leading-[1.6] text-text-muted">{subtitle}</p>

          <div className="mt-[30px] mb-1 flex flex-wrap items-center gap-5">
            <div className="flex overflow-hidden rounded-[3px] border border-border">
              <button
                type="button"
                onClick={() => actions.setMode(sectionId, 'brief')}
                className={segmentClass(mode === 'brief')}
              >
                Кратко
              </button>
              <button
                type="button"
                onClick={() => actions.setMode(sectionId, 'detail')}
                className={segmentClass(mode === 'detail')}
              >
                Подробно
              </button>
            </div>
            <button
              type="button"
              onClick={() => actions.setHideDone(sectionId, !hideDone)}
              className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 font-mono text-xs font-medium text-text-dim"
            >
              <span className={switchTrackClass(hideDone)}>
                <span className={switchKnobClass(hideDone)} />
              </span>
              <span>Скрыть выполненное</span>
            </button>
          </div>

          <ChecklistSectionContext value={{ mode, hideDone }}>{children}</ChecklistSectionContext>
        </div>
      </div>
    </section>
  );
}
