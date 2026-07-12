import { useState } from 'react';
import { useApp } from '../../state/AppContext';

export function ChecklistAddItemForm({ catId }: { catId: string }) {
  const { actions } = useApp();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');

  function cancel() {
    setAdding(false);
    setText('');
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    actions.addCustomItem(catId, trimmed);
    setText('');
    setAdding(false);
  }

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="cursor-pointer border-none bg-transparent pt-[11px] pb-0 pl-0.5 font-mono text-xs font-medium tracking-[0.04em] text-text-faint hover:text-accent"
      >
        + добавить пункт
      </button>
    );
  }

  return (
    <div className="animate-jk-fade flex gap-2 py-3">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') cancel();
        }}
        placeholder="Новый пункт…"
        className="min-w-0 flex-1 rounded-[3px] border border-border bg-bg-raised px-2.5 py-2 font-sans text-[13.5px] text-text-bright outline-none"
      />
      <button
        type="button"
        onClick={submit}
        className="cursor-pointer rounded-[3px] border border-accent bg-accent px-3.5 py-2 font-mono text-xs font-semibold text-white"
      >
        Добавить
      </button>
      <button
        type="button"
        onClick={cancel}
        className="cursor-pointer rounded-[3px] border border-border bg-transparent px-3 py-2 font-mono text-xs font-medium text-text-dim"
      >
        Отмена
      </button>
    </div>
  );
}
