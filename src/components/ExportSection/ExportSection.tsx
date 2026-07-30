import { useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppContext';
import { SectionHeading } from '../SectionHeading';
import { buildMarkdown } from '../../utils/exportMarkdown';

function ExportButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[3px] border border-border-strong bg-transparent px-5 py-3 font-mono text-xs font-semibold tracking-[0.08em] text-text-bright uppercase transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

function copyViaExecCommand(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Clipboard permission denied or unavailable — fall back below.
    }
  }
  copyViaExecCommand(text);
}

export function ExportSection() {
  const { trip, state } = useApp();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(buildMarkdown(trip, state));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([buildMarkdown(trip, state)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <section id="sec-export" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-24 max-[900px]:px-5">
        <div className="max-w-[720px]">
          <SectionHeading
            num="/ 08"
            titlePrefix="Экспорт"
            titleAccent="плана"
            subtitle="Чеклисты, маршрут по дням и вся справка — в Markdown или на печать."
          />
          <div className="mt-[30px] flex flex-wrap gap-3">
            <ExportButton onClick={handleCopy}>{copied ? 'Скопировано ✓' : 'Скопировать (MD)'}</ExportButton>
            <ExportButton onClick={handleDownload}>Скачать .md</ExportButton>
            <ExportButton onClick={() => window.print()}>Печать / PDF</ExportButton>
          </div>
        </div>
      </div>
    </section>
  );
}
