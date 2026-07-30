# Модель данных

Типы — в [src/types/trip.ts](../src/types/trip.ts) и [src/types/state.ts](../src/types/state.ts).

## TripData

```ts
interface TripData {
  id: string;                     // напр. 'japan-2026' — часть ключа localStorage
  meta: TripMeta;                  // контент Header/Hero/Footer — НЕ хардкодить в компонентах
  cities: Record<string, string>;  // имя города → hex-цвет (маркеры карты, чипы/акценты дней)
  pre: ChecklistData;               // чеклист «До вылета»
  arrival: ChecklistData;           // чеклист «Сразу по прилёту»
  days: TripDay[];                  // маршрут по дням
  hotels?: HotelsSectionData;       // «Где спать»       (/ 04)
  budget?: BudgetSectionData;       // «Бюджет»          (/ 05)
  practical?: PracticalSectionData; // «Практика»        (/ 06)
  skipList?: SkipListSectionData;   // «Куда не ходить»  (/ 07)
}
```

Четыре последних раздела опциональны: соответствующая секция просто не рендерится, если поля нет.

`TripMeta` содержит все трип-специфичные строки для `Header`/`Hero`/`Footer`/сводки маршрута: `kicker`, `routeSummary`, `heroLabel`, `heroTitle`, `heroTitleAccent`, `heroSubtitle` (**массив абзацев**), `heroChips` (пилюли под хиро), `footerNote`, `routeOverviewSummary` (опционально — нужен только когда у дней есть точки на карте). Названия и подзаголовки самих чеклистов («До вылета» / «Сразу по прилёту») и разметка секций (`/ 01`…`/ 08`) — фичевый UI-копирайт, захардкожен в компонентах, а не часть `TripData` (это не меняется между поездками).

## Два вида дня

`TripDay` поддерживает **два взаимоисключающих формата**, и UI сам выбирает, что рендерить:

**1. Нарративный день** (текущая японская поездка) — `blocks` заполнены, `points`/`legs` пустые:

```ts
{
  id, label, city, title,
  points: [], legs: [],
  base?: 'ночь в Осаке',              // где ночуете
  keyTag?: 'Ключевое: Dotonbori вечером',
  blocks?: { morning?, day?, evening? },  // связный текст, поддерживает **жирный** и *курсив*
  transitNotes?: ['Кансай аэропорт → Намба · Nankai Airport Express, ~45 мин · ~¥970/чел'],
  foodNote?: '...',
  planBNote?: '...',
  skipNote?: '...',                    // без префикса «Пропустите:» — его добавляет UI
}
```

Рендерится в `ItinerarySection` (`/ 03 День за днём`) как карточки Утро/День/Вечер с транзит-чипами и заметками. Разметка `**жирный**`/`*курсив*` парсится в [utils/richText.tsx](../src/utils/richText.tsx).

**2. День с картой** (формат исходного демо) — `points`/`legs` заполнены, `blocks` нет:

```ts
{ id, label, city, title, points: [{ name, coords, arr, dur, durMin, desc, city? }], legs: [{ tag, line, time, cost, note? }] }
```

Рендерится в `RouteSection` (`/ 03 Маршрут на карте`) с Leaflet-картой и таймлайном дня. `points[].city` заполняется только когда точка не в «домашнем» городе дня; `legs[i]` — транспорт между `points[i]` и `points[i+1]`.

**Правила видимости**: `RouteSection` и счётчик точек в хедере скрываются, если ни у одного дня нет `points`; `ItinerarySection` скрывается, если ни у одного дня нет `blocks`. MD-экспорт и печатная версия выбирают формат по тому же признаку.

## Как добавить новую поездку

1. Создать `src/data/trips/<slug>.ts`, экспортирующий константу типа `TripData` (по образцу `japan.ts`).
2. В `src/data/index.ts` поменять `activeTrip` на новую константу (либо — для полноценного мультипоездочного режима в будущем — добавить реальный селектор поездок; в MVP это не реализовано, см. дизайн-спеку).
3. Ничего в `components/`, `state/`, `storage/` менять не нужно — вся адаптация идёт через `TripData`.

## PersistedState

```ts
interface PersistedState {
  checked: Record<string, boolean>;               // itemId → отмечен ли
  custom: Record<string, { id; label }[]>;          // catId → пользовательские пункты
  modes: { pre: 'brief'|'detail'; arrival: ... };    // режим отображения чеклиста
  hideDone: { pre: boolean; arrival: boolean };      // скрывать выполненные
  day: string | null;                                // выбранный день на карте (null = весь маршрут)
}
```

Хранится целиком под ключом `travel-planner:${trip.id}` через `StorageAdapter` (см. [ARCHITECTURE.md](ARCHITECTURE.md)). `normalizePersistedState` в `types/state.ts` добивает недостающие ключи дефолтами при чтении битого/устаревшего JSON.

## Как редактировать существующий маршрут/чеклист

Правьте напрямую `src/data/trips/japan.ts` — это единственная константа, содержащая весь контент (чеклисты, дни, отели, бюджет, практика, skip-лист). Стартовые пункты чеклистов удалить из UI нельзя (`canDelete` вычисляется по признаку «пришёл из `custom`», не из статических данных) — это осознанное ограничение дизайна, не баг.
