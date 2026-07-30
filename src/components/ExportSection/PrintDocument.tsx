import { useApp } from '../../state/AppContext';
import { checklistItems } from '../../utils/exportMarkdown';
import { formatLegCost } from '../../utils/money';
import { renderRichText } from '../../utils/richText';

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

      {trip.days.length > 0 && (
        <>
          <h2 className="mt-[18px] mb-1 border-b border-[#dddddd] pb-[3px] text-[15px]">
            / 03 Маршрут день за днём
          </h2>
          {trip.days.map((day) => (
            <div key={day.id} className="mt-2.5">
              <h3 className="mb-[3px] text-[12.5px] font-semibold">
                {day.label} · {day.city} — {day.title}
                {day.base ? ` (${day.base})` : ''}
              </h3>
              {day.blocks?.morning && (
                <div className="py-[1.5px] text-xs">
                  <b>Утро.</b> {renderRichText(day.blocks.morning)}
                </div>
              )}
              {day.blocks?.day && (
                <div className="py-[1.5px] text-xs">
                  <b>День.</b> {renderRichText(day.blocks.day)}
                </div>
              )}
              {day.blocks?.evening && (
                <div className="py-[1.5px] text-xs">
                  <b>Вечер.</b> {renderRichText(day.blocks.evening)}
                </div>
              )}
              {day.transitNotes?.map((note) => (
                <div key={note} className="py-[1.5px] text-xs whitespace-pre-wrap">
                  {'   → '}
                  {note}
                </div>
              ))}
              {day.foodNote && (
                <div className="py-[1.5px] text-xs">
                  <b>Еда:</b> {renderRichText(day.foodNote)}
                </div>
              )}
              {day.planBNote && (
                <div className="py-[1.5px] text-xs">
                  <b>План Б:</b> {renderRichText(day.planBNote)}
                </div>
              )}
              {day.skipNote && (
                <div className="py-[1.5px] text-xs">
                  <b>Пропустите:</b> {renderRichText(day.skipNote)}
                </div>
              )}
              {day.points.map((point, i) => (
                <div key={point.name}>
                  <div className="py-[1.5px] text-xs whitespace-pre-wrap">
                    {point.arr ? `${point.arr} · ` : ''}
                    {point.name}
                    {point.dur && point.dur !== '—' ? ` · ${point.dur}` : ''} — {point.desc}
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
        </>
      )}

      {trip.hotels && (
        <>
          <h2 className="mt-[18px] mb-1 border-b border-[#dddddd] pb-[3px] text-[15px]">/ 04 Где спать</h2>
          <div className="py-[1.5px] text-xs">{trip.hotels.intro}</div>
          {trip.hotels.cards.map((card) => (
            <div key={card.city} className="mt-2">
              <h3 className="mb-[3px] text-[12.5px] font-semibold">
                {card.city} ({card.nights})
              </h3>
              <div className="py-[1.5px] text-xs">{card.description}</div>
              <div className="py-[1.5px] text-xs">{card.names.join(' · ')}</div>
            </div>
          ))}
        </>
      )}

      {trip.budget && (
        <>
          <h2 className="mt-[18px] mb-1 border-b border-[#dddddd] pb-[3px] text-[15px]">/ 05 Бюджет на двоих</h2>
          <div className="py-[1.5px] text-xs">{trip.budget.intro}</div>
          {trip.budget.rows.map((row) => (
            <div key={row.item} className="py-[1.5px] text-xs">
              {row.item} — {row.comment} — <b>${row.costLabel}</b>
            </div>
          ))}
          <div className="py-[1.5px] text-xs font-semibold">
            {trip.budget.totalLabel} — ${trip.budget.totalCostLabel}
          </div>
          <div className="py-[1.5px] text-xs">{trip.budget.footnote}</div>
        </>
      )}

      {trip.practical && (
        <>
          <h2 className="mt-[18px] mb-1 border-b border-[#dddddd] pb-[3px] text-[15px]">/ 06 Практика</h2>
          {trip.practical.cards.map((card) => (
            <div key={card.title} className="mt-2">
              <h3 className="mb-[3px] text-[12.5px] font-semibold">{card.title}</h3>
              <div className="py-[1.5px] text-xs">{card.text}</div>
            </div>
          ))}
        </>
      )}

      {trip.skipList && (
        <>
          <h2 className="mt-[18px] mb-1 border-b border-[#dddddd] pb-[3px] text-[15px]">
            / 07 Куда заходить не обязательно
          </h2>
          <div className="py-[1.5px] text-xs">{trip.skipList.intro}</div>
          {trip.skipList.items.map((item) => (
            <div key={item.place} className="py-[1.5px] text-xs">
              <b>{item.place}</b> — {item.why}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
