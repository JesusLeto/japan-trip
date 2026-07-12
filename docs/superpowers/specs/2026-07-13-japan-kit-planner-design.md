# JAPAN KIT — планировщик поездки в Японию: дизайн реализации

## Обзор

Личный одностраничный веб-инструмент: чеклист «До вылета», чеклист «Сразу по прилёту», интерактивная карта маршрута по дням (Leaflet). Прогресс — в localStorage. Источник дизайна: `design_handoff_japan_kit/` (README.md — полная спецификация UI/UX/данных, `data.js` — модель данных, `JAPAN KIT.dc.html` — HTML-референс поведения). Дизайн высокоточный (high-fidelity), воспроизводится как есть; эта спецификация описывает **реализацию** в React, а не UI/UX-решения.

## Стек

- React 19 + TypeScript, сборка — Vite (`@vitejs/plugin-react`)
- Tailwind CSS v4 (`@tailwindcss/vite`, без отдельного postcss.config)
- Leaflet 1.9+ (прямой API, без react-leaflet) — соответствует референсу: карта инициализируется один раз через `useRef`+`useEffect`, без пересоздания при смене дня
- Пакетный менеджер: npm

### npm-зависимости

Runtime:
- `react`, `react-dom`
- `leaflet`, `@types/leaflet`

Dev:
- `typescript`, `vite`, `@vitejs/plugin-react`
- `tailwindcss`, `@tailwindcss/vite`
- `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `prettier`

Осознанно не используем: react-leaflet (другая модель контроля карты), zustand/redux (глобальный стор избыточен для одного JSON-блока состояния), роутер (одна страница), тестовые фреймворки (MVP проверяется визуально в браузере — решение пользователя).

## Структура проекта

```
src/
  types/            — типы модели данных и состояния приложения
  data/             — japanKitData.ts (перенос data.js как typed const)
  storage/          — StorageAdapter (интерфейс) + LocalStorageAdapter
  state/            — AppContext, AppProvider, reducer, action creators
  components/
    Header/
    Hero/
    checklist/      — Checklist.* compound-компоненты + PreDepartureChecklist, ArrivalChecklist
    route/          — RouteMap, DayStrip, DayPanel.Overview, DayPanel.DayDetail, RouteSection
    ExportSection/
    Footer/
  utils/            — markdown-экспорт, форматирование ¥/времени, русская плюрализация
  App.tsx
docs/
  ARCHITECTURE.md   — слой хранилища, state shape, как добавить Supabase-адаптер
  DATA_MODEL.md     — описание типов, структуры data.js, как редактировать маршрут
CLAUDE.md           — точка входа для агента: стек, команды, конвенции, ссылки на docs/
```

## Модель данных

Переносится из `data.js` (`window.JK_DATA`) в типизированную константу `src/data/japanKitData.ts`:

```ts
interface City { name: string; color: string }
interface ChecklistItemData { id: string; label: string; dl: string; desc: string }
interface ChecklistCategory { id: string; name: string; items: ChecklistItemData[] }
interface ChecklistData { cats: ChecklistCategory[] }

interface RoutePoint {
  name: string; coords: [number, number]; arr: string; dur: string; durMin: number;
  desc: string; city?: string; // city указан только когда точка не в "домашнем" городе дня
}
interface RouteLeg { tag: string; line: string; time: string; cost: number; note?: string }
interface RouteDay { id: string; label: string; city: string; title: string; points: RoutePoint[]; legs: RouteLeg[] }

interface JapanKitData {
  cities: Record<string, string>; // имя города → hex-цвет
  pre: ChecklistData;
  arrival: ChecklistData;
  days: RouteDay[];
}
```

Стартовые пункты чеклистов и точки маршрута — неизменяемый read-only контент (`canDelete: false` по умолчанию); пользовательские пункты (`custom`) — отдельная runtime-структура, не часть `JapanKitData`.

## Слой хранилища

```ts
interface PersistedState {
  checked: Record<string, boolean>;
  custom: Record<string, { id: string; label: string }[]>; // ключ — catId
  modes: { pre: 'brief' | 'detail'; arrival: 'brief' | 'detail' };
  hideDone: { pre: boolean; arrival: boolean };
  day: string | null;
}

interface StorageAdapter {
  load(): Promise<PersistedState | null>;
  save(state: PersistedState): Promise<void>;
}
```

- `LocalStorageAdapter` — читает/пишет JSON под ключом `japankit_v1`; try/catch на оба метода, при недоступности localStorage — молча работает как no-op (in-memory fallback через сам reducer).
- Будущий `SupabaseAdapter` реализует тот же интерфейс — компоненты и reducer не меняются, меняется только адаптер, переданный в `AppProvider`.
- Эфемерные UI-поля (`expanded`, `adding`, `addText`) — **не входят** в `PersistedState`, живут как локальный `useState` внутри компонентов.

## State management

Единый глобальный контекст поверх `useReducer`, интерфейс в стиле dependency-injection (state / actions):

```ts
interface AppActions {
  toggleItem(itemId: string): void;
  addCustomItem(catId: string, label: string): void;
  deleteCustomItem(catId: string, itemId: string): void;
  setMode(section: 'pre' | 'arrival', mode: 'brief' | 'detail'): void;
  setHideDone(section: 'pre' | 'arrival', value: boolean): void;
  selectDay(dayId: string | null): void;
}
interface AppContextValue { state: PersistedState; actions: AppActions }
const AppContext = createContext<AppContextValue | null>(null);
```

- `AppProvider({ adapter, children })` — единственное место, знающее про способ хранения. При маунте вызывает `adapter.load()`; при каждом изменении `state` — `adapter.save(state)` через `useEffect`.
- Компоненты читают контекст через `use(AppContext)` (React 19), не `useContext`.
- Смена реализации хранилища = смена `adapter`-пропса у `AppProvider`, без изменений в UI-слое.

## Компонентная архитектура (composition patterns)

Следуем `vercel-composition-patterns` + `vercel-react-best-practices` при написании всей React-логики:

- **Без boolean-пропов для вариантов поведения.** Вместо одного `ChecklistSection` с пропом `numbered` — два explicit-варианта: `PreDepartureChecklist` и `ArrivalChecklist`, оба компонуют общий compound-набор `Checklist.*`.
- **Compound components:** `Checklist.Section`, `Checklist.Category`, `Checklist.Item`, `Checklist.AddItemForm`. `ArrivalChecklist` передаёт номер шага как `children` в `Checklist.Item` (не через `numLabel`-проп) — используется composition (children), не render-проп.
- **DayPanel как explicit variants:** `DayPanel.Overview` (список 10 дней, режим «весь маршрут») и `DayPanel.DayDetail` (таймлайн дня) — вместо одного компонента с внутренним переключением по `day`. Родительский `RouteSection` рендерит нужный вариант на основе `day` из `AppContext`.
- **State lifting:** `AppProvider` оборачивает всё приложение; компоненты вне визуальной иерархии конкретной секции (например, счётчики хедера) читают то же состояние через контекст, без prop drilling.
- React 19: `ref` — обычный проп (без `forwardRef`), `use()` вместо `useContext()`.

### Полный список компонентов
`Header`, `Hero`, `Checklist.Section/Category/Item/AddItemForm`, `PreDepartureChecklist`, `ArrivalChecklist`, `RouteSection`, `DayStrip`, `RouteMap`, `DayPanel.Overview`, `DayPanel.DayDetail`, `ExportSection`, `Footer`.

## Карта (RouteMap)

- Leaflet-инстанс создаётся в `useEffect` с пустым deps-массивом (один раз), хранится в `useRef`.
- Второй `useEffect` с зависимостью `[day]` — обновляет маркеры (`L.divIcon`), линии (сплошная по дню / пунктирная между городами в режиме «весь маршрут»), вызывает `flyToBounds`/`flyTo`.
- Клик по точке в `DayPanel.DayDetail` → `flyTo(coords, 15)` + открыть попап. `RouteMap` принимает `ref` (React 19 — обычный проп) с императивным хэндлом `{ flyToPoint(coords, popupContent) }`; `RouteSection` держит этот `ref` и передаёт `flyToPoint` вниз в `DayPanel.DayDetail` как проп действия.
- Fallback: счётчик подряд идущих `tileerror` в `useState`; при >5 — оверлей-заглушка со списком точек; сброс счётчика при успешной загрузке тайла.

## Стилизация

Дизайн-токены (цвета, типографика, отступы из README дизайна) заводятся как Tailwind theme-токены (`@theme` в CSS для Tailwind v4): `bg`, `bg-raised`, `bg-elevated`, `bg-active`, `border`, `border-strong`, `divider`, `text`, `text-bright`, `text-muted`, `text-dim`, `text-faint`, `accent`, `accent-tint`, плюс цвета городов. Инлайн-стили HTML-референса — источник поведения/значений, не копируются как код; в компонентах — Tailwind-классы поверх этих токенов.

## Экспорт и печать

`ExportSection` — три действия (copy MD / download .md / print), логика генерации Markdown — чистая функция в `utils/exportMarkdown.ts`, принимает `PersistedState` + `JapanKitData`, возвращает строку. Печать — через глобальные print-стили (Tailwind `print:` варианты или отдельный CSS-блок), отдельный print-only DOM-блок скрыт от экрана и наоборот.

## Документация для будущих агентов

- `CLAUDE.md` (корень) — стек, команды (`npm run dev/build/lint`), обзор структуры, ссылки на `docs/ARCHITECTURE.md` и `docs/DATA_MODEL.md`.
- `docs/ARCHITECTURE.md` — слой хранилища и как добавить `SupabaseAdapter`, форма `AppContext`, паттерны композиции компонентов.
- `docs/DATA_MODEL.md` — типы данных, как редактировать `japanKitData.ts` (добавить день/пункт чеклиста).

## Тестирование

Автотестов на MVP-этапе нет (решение пользователя) — проверка через дев-сервер в браузере по критериям готовности ниже. Абстракция `StorageAdapter` спроектирована так, что unit-тесты можно добавить позже без изменения архитектуры.

## Критерии готовности (из README дизайна)

- Счётчики хедера совпадают с реальным числом пунктов (включая добавленные).
- У каждой пары соседних точек дня есть транспортный сегмент.
- Клик по дню зумит карту и синхронно обновляет панель; клик по точке панели центрирует карту и открывает попап.
- «+ добавить пункт» работает в каждой категории обоих чеклистов; свои пункты удаляются, стартовые — нет.
- На 375px ничего не разъезжается: одна колонка, карта 60vh, счётчики хедера скрыты.
- Печать даёт светлый документ без карты.
- Данные полностью соответствуют `data.js` (5 категорий/22 пункта в `pre`, 7 шагов в `arrival`, 10 дней/34 точки в `days`).

## Git

Репозиторий инициализируется (`git init`) с первым коммитом, дальнейшая работа — обычными коммитами по мере реализации.
