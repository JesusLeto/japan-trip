import { useApp } from '../../state/AppContext';
import { Checklist } from './index';

export function PreDepartureChecklist() {
  const { trip, actions } = useApp();

  return (
    <Checklist.Section
      sectionId="pre"
      anchor="sec-pre"
      num="/ 01"
      titlePrefix="Чеклист"
      titleAccent="«До вылета»"
      subtitle="Всё, что нужно закрыть заранее — с дедлайнами. Клик по названию пункта раскрывает пояснение."
    >
      {trip.pre.cats.map((cat) => (
        <Checklist.Category
          key={cat.id}
          cat={cat}
          renderItem={(item, _index, canDelete) => (
            <Checklist.Item
              key={item.id}
              item={item}
              canDelete={canDelete}
              onDelete={() => actions.deleteCustomItem(cat.id, item.id)}
            />
          )}
        >
          <Checklist.AddItemForm catId={cat.id} />
        </Checklist.Category>
      ))}
    </Checklist.Section>
  );
}
