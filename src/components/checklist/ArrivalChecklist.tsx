import { useApp } from '../../state/AppContext';
import { Checklist } from './index';

export function ArrivalChecklist() {
  const { trip, actions } = useApp();

  return (
    <Checklist.Section
      sectionId="arrival"
      anchor="sec-arr"
      num="/ 02"
      titlePrefix="Чеклист"
      titleAccent="«Сразу по прилёту»"
      subtitle="Первые 2–3 часа в аэропорту решают комфорт всей поездки. Шаги — по порядку."
    >
      {trip.arrival.cats.map((cat) => (
        <Checklist.Category
          key={cat.id}
          cat={cat}
          renderItem={(item, index, canDelete) => (
            <Checklist.Item
              key={item.id}
              item={item}
              canDelete={canDelete}
              onDelete={() => actions.deleteCustomItem(cat.id, item.id)}
            >
              <span className="min-w-[20px] font-mono text-[11px] font-medium text-accent">
                {String(index + 1).padStart(2, '0')}
              </span>
            </Checklist.Item>
          )}
        >
          <Checklist.AddItemForm catId={cat.id} />
        </Checklist.Category>
      ))}
    </Checklist.Section>
  );
}
