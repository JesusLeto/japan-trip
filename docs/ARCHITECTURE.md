# Архитектура

## Слой хранилища

`src/storage/StorageAdapter.ts` — интерфейс:

```ts
interface StorageAdapter {
  load(): Promise<PersistedState | null>;
  save(state: PersistedState): Promise<void>;
}
```

`src/storage/LocalStorageAdapter.ts` — текущая реализация: JSON под ключом `travel-planner:${trip.id}` (ключ включает id поездки, чтобы прогресс разных поездок не пересекался). Try/catch на обоих методах — при недоступности localStorage работает как no-op, состояние остаётся только в памяти.

### Как добавить Supabase-адаптер

1. Создать `src/storage/SupabaseAdapter.ts`, реализующий тот же `StorageAdapter` (`load`/`save`).
2. В `App.tsx` заменить `new LocalStorageAdapter(...)` на `new SupabaseAdapter(...)`.
3. Компоненты и reducer не меняются — они работают с `AppContext`, а не с конкретным адаптером напрямую.

## State management

`src/state/AppContext.tsx`:

```ts
interface AppContextValue {
  trip: TripData;      // контент активной поездки (заголовки, чеклисты, маршрут)
  state: PersistedState; // checked, custom, modes, hideDone, day
  actions: AppActions;   // toggleItem, addCustomItem, deleteCustomItem, setMode, setHideDone, selectDay
}
```

`AppProvider({ adapter, trip, children })` — единственное место, знающее про способ хранения:
- при маунте вызывает `adapter.load()` и гидрирует `useReducer`-стейт;
- при каждом изменении стейта (после гидрации) вызывает `adapter.save(state)`.

Компоненты читают контекст через `use(AppContext)` (React 19, не `useContext`) хук-обёртку `useApp()`.

Эфемерные UI-поля (раскрытая карточка пункта, состояние инлайн-формы добавления) **не входят** в `PersistedState` — это локальный `useState` внутри `ChecklistItem`/`ChecklistAddItemForm`.

## Компонентная архитектура (composition patterns)

Следует `vercel-composition-patterns`:

- **`src/components/checklist/`** — compound-набор `Checklist.Section/Category/Item/AddItemForm` (собран в `index.ts` как объект `Checklist`). `PreDepartureChecklist` и `ArrivalChecklist` — explicit variants, а не один компонент с boolean-пропом `numbered`: `ArrivalChecklist` передаёт номер шага как `children` в `Checklist.Item`, `PreDepartureChecklist` — нет.
  - `ChecklistSectionContext` (файл `ChecklistSectionContext.tsx`) — локальный контекст, скоуп — один `Checklist.Section` (несёт `mode`/`hideDone`); отдельно от глобального `AppContext`.
  - `Checklist.Category` использует `renderItem`-render-prop (не `children`) для передачи `item`/`index`/`canDelete` наружу — обоснованный случай render-props, так как эти данные известны только внутри цикла категории.
- **`src/components/route/`** — единственная секция маршрута (`RouteSection`): `DayStrip` (табы дней) → `DayCard` (описание выбранного дня) → `RouteMap` (его же маршрут), плюс `DayPanelDayDetail` сбоку от карты, когда у дня есть точки. Выбор дня живёт в глобальном `state.day`, поэтому табы, описание и карта всегда показывают один и тот же день без пропов-переключателей.
- **`RouteMap`** принимает `ref` как обычный проп (React 19, без `forwardRef`) с императивным хэндлом `{ flyToPoint(dayId, pointIndex) }`, которым `RouteSection` даёт `DayPanelDayDetail` центрировать карту по клику на точку.
- **`SectionHeading`** — общий заголовок секции (`/ 0N` + заголовок с accent-курсивом + подзаголовок), переиспользуется всеми секциями страницы.
- **Секции сами решают, показываться ли**: `HotelsSection`/`BudgetSection`/`PracticalSection`/`SkipListSection` возвращают `null`, если соответствующего поля нет в `trip`. Родитель (`App.tsx`) просто перечисляет их все по порядку, без условной логики.

## Карта (RouteMap)

- Leaflet-инстанс создаётся один раз в `useEffect` с пустым deps-массивом; хранится в `useRef`, не пересоздаётся при смене дня.
- Второй `useEffect` (deps `[day]`) обновляет иконки маркеров, линии и зум/полёт камеры.
- **Важный нюанс**: свежесозданный `L.Map` не имеет вида (center/zoom) до первого `setView`/`fitBounds` — `flyTo`/`flyToBounds` в этот момент бросают `"Set map center and zoom first"`. `isInitialRef` сбрасывается в `true` при каждом создании карты (в т.ч. при двойном вызове эффектов React StrictMode в dev) и гарантирует, что самый первый вызов внутри `[day]`-эффекта использует `fitBounds`, а не `flyTo*`. Когда точек нет вообще, вид задаётся из `trip.mapView` — иначе карта осталась бы без вида и любой последующий `flyTo` упал бы.
- Выбран день без координат (частый случай, пока точки не заполнены) — карта показывает общий вид поездки, а не пытается вписать пустые bounds.
- Fallback при обрыве тайлов — счётчик подряд идущих `tileerror` в `useRef`, при >5 показывается оверлей-заглушка со списком точек (`tilesFailed` state).

## Экспорт

`src/utils/exportMarkdown.ts` — чистая функция `buildMarkdown(trip, state)`, не зависит от React; используется и в `ExportSection` (copy/download), и переиспользует свою `checklistItems()`-хелпер в `PrintDocument` для консистентности данных между MD-экспортом и печатной версией. Оба выбирают формат дня (нарративный/картовый) по тем же признакам, что и UI, и добавляют разделы отелей/бюджета/практики/skip-листа, если они есть в `trip`.

`src/utils/richText.tsx` — парсер markdown-lite (`**жирный**`, `*курсив*`) в React-узлы для нарративных текстов дня. Данные хранят разметку как обычный текст, а не HTML, — так они безопасны для MD-экспорта и не требуют `dangerouslySetInnerHTML`.
