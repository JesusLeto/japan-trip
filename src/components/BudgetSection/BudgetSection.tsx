import { useApp } from '../../state/AppContext';
import { SectionHeading } from '../SectionHeading';

export function BudgetSection() {
  const { trip } = useApp();
  const budget = trip.budget;
  if (!budget) return null;

  return (
    <section id="sec-budget" className="border-t border-bg-active">
      <div className="mx-auto max-w-[1160px] px-6 pt-[72px] pb-[80px] max-[900px]:px-5">
        <SectionHeading num="/ 05" titlePrefix="Бюджет" titleAccent="на двоих" subtitle={budget.intro} />
        <div className="mt-[30px] overflow-x-auto rounded-[10px] border border-bg-active">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-bg-active bg-bg-raised text-left text-xs tracking-[0.05em] text-text-faint uppercase">
                <th className="px-4 py-3 font-medium">Статья</th>
                <th className="px-4 py-3 font-medium">Комментарий</th>
                <th className="px-4 py-3 text-right font-medium">На двоих, $</th>
              </tr>
            </thead>
            <tbody>
              {budget.rows.map((row) => (
                <tr key={row.item} className="border-b border-divider last:border-b-0">
                  <td className="px-4 py-3 whitespace-nowrap text-text-bright">{row.item}</td>
                  <td className="px-4 py-3 text-text-muted">{row.comment}</td>
                  <td className="px-4 py-3 text-right font-mono whitespace-nowrap text-text">{row.costLabel}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 font-semibold text-text-bright">{budget.totalLabel}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-mono font-semibold text-accent">
                  {budget.totalCostLabel}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2.5 max-w-[640px] text-[13px] text-text-faint">{budget.footnote}</p>
      </div>
    </section>
  );
}
