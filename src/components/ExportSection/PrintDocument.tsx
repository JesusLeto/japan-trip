import { useApp } from '../../state/AppContext';
import { checklistItems } from '../../utils/exportMarkdown';
import { formatLegCost } from '../../utils/money';

export function PrintDocument() {
  const { trip, state } = useApp();

  const checklistSections = [
    { title: '/ 01 До вылета', section: trip.pre },
    { title: '/ 02 Сразу по прилёту', section: trip.arrival },
  ];

  return (
    <div id="printdoc" className="hidden bg-white p-2 font-sans text-[#111111]">
      <h1 className="mb-1 text-[22px]">
        {trip.meta.kicker} — {trip.meta.routeSummary}
      </h1>
      <div className="mb-3.5 text-xs text-[#555555]">Чеклисты подготовки и маршрут по дням</div>

      {checklistSections.map(({ title, section }) => (
        <div key={title}>
          <h2 className="mt-4 mb-1 border-b border-[#dddddd] pb-[3px] text-[15px]">{title}</h2>
          {checklistItems(section, state.custom).map(({ cat, items }) => (
            <div key={cat.id}>
              <h3 className="mt-2.5 mb-[3px] text-[12.5px] tracking-[0.04em] uppercase">{cat.name}</h3>
              {items.map((item) => (
                <div key={item.id} className="py-[1.5px] text-xs">
                  {state.checked[item.id] ? '☑' : '☐'} {item.label}
                  {item.dl ? ` — ${item.dl}` : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <h2 className="mt-[18px] mb-1 border-b border-[#dddddd] pb-[3px] text-[15px]">/ 03 Маршрут по дням</h2>
      {trip.days.map((day) => (
        <div key={day.id}>
          <h3 className="mt-2.5 mb-[3px] text-[12.5px]">
            {day.label} · {day.city} — {day.title}
          </h3>
          {day.points.map((point, i) => (
            <div key={point.name}>
              <div className="py-[1.5px] text-xs whitespace-pre-wrap">
                {point.arr} · {point.name}
                {point.dur !== '—' ? ` · ${point.dur}` : ''} — {point.desc}
              </div>
              {day.legs[i] && (
                <div className="py-[1.5px] text-xs whitespace-pre-wrap">
                  {'   → '}
                  {day.legs[i].tag} {day.legs[i].line} · {day.legs[i].time} · {formatLegCost(day.legs[i])}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
