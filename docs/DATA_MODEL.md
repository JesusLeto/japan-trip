# Модель данных

Типы — в [src/types/trip.ts](../src/types/trip.ts) и [src/types/state.ts](../src/types/state.ts).

## TripData

```ts
interface TripData {
  id: string;            // напр. 'japan-2026' — часть ключа localStorage
  meta: TripMeta;         // контент Header/Hero/Footer — НЕ хардкодить в компонентах
  cities: Record<string, string>; // имя города → hex-цвет (маркеры карты, чипы дней)
  pre: ChecklistData;      // чеклист «До вылета»
  arrival: ChecklistData;  // чеклист «Сразу по прилёту»
  days: TripDay[];         // маршрут по дням
}
```

`TripMeta` содержит все трип-специфичные строки для `Header`/`Hero`/`Footer`/сводки маршрута (`kicker`, `routeSummary`, `heroLabel`, `heroTitle`, `heroTitleAccent`, `heroSubtitle`, `footerNote`, `routeOverviewSummary`). Названия и подзаголовки самих чеклистов («До вылета» / «Сразу по прилёту») и разметка секций (`/ 01`…`/ 04`) — фичевый UI-копирайт, захардкожен в `PreDepartureChecklist`/`ArrivalChecklist`/`RouteSection`/`ExportSection`, а не часть `TripData` (это не меняется между поездками).

`TripDay.points[].city` заполняется только когда точка находится не в «домашнем» городе дня (см. `d5`/`d6`/`d9` в `japan.ts` — переезды между городами).

`TripDay.legs[i]` — транспортный сегмент между `points[i]` и `points[i+1]`; у каждой пары соседних точек должен быть сегмент.

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
  day: string | null;                                // выбранный день маршрута (null = весь маршрут)
}
```

Хранится целиком под ключом `travel-planner:${trip.id}` через `StorageAdapter` (см. [ARCHITECTURE.md](ARCHITECTURE.md)).

## Как редактировать существующий маршрут/чеклист

Правьте напрямую `src/data/trips/japan.ts` — это единственная константа, содержащая весь контент (чеклисты + маршрут). Стартовые пункты чеклистов и точки маршрута удалить из UI нельзя (`canDelete` вычисляется по признаку "пришёл из `custom`", не из статических данных) — это осознанное ограничение дизайна, не баг.
