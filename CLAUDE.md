# Travel Planner

Личный веб-планировщик путешествий. MVP реализует одну поездку — Японию (`JAPAN KIT`): чеклисты подготовки и подробный маршрут на интерактивной карте. Дизайн-референс и полная UX-спецификация — в [design_handoff_japan_kit/README.md](design_handoff_japan_kit/README.md).

## Стек

- React 19 + TypeScript, Vite
- Tailwind CSS v4 (`@tailwindcss/vite`, токены — в [src/index.css](src/index.css) как `@theme`)
- Leaflet 1.9 (прямой API через `useRef`+`useEffect`, без react-leaflet)
- Состояние: React Context + `useReducer` (см. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md))
- Хранилище: `localStorage` через `StorageAdapter`-интерфейс, готовый к замене на Supabase

## Команды

```
npm run dev      # дев-сервер (Vite)
npm run build    # tsc -b + production build
npm run lint     # ESLint
npm run preview  # предпросмотр production-сборки
```

## Структура

```
src/
  types/        — Trip*, PersistedState (типы модели данных и состояния)
  data/         — data/trips/<trip>.ts (данные поездки) + data/index.ts (activeTrip)
  storage/      — StorageAdapter (интерфейс) + LocalStorageAdapter
  state/        — AppContext, AppProvider, reducer
  components/   — Header, Hero, checklist/ (compound), route/ (карта, панель дня), ExportSection, Footer
  utils/        — pluralize, checklist counts, money/day-info formatting, MD-экспорт
```

Подробности архитектуры — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Модель данных и как добавить новую поездку — [docs/DATA_MODEL.md](docs/DATA_MODEL.md). Дизайн-спека — [docs/superpowers/specs/2026-07-13-japan-kit-planner-design.md](docs/superpowers/specs/2026-07-13-japan-kit-planner-design.md).

## Конвенции

- **Абстрактные имена, не `JapanKit*`**: проект потенциально хранит несколько поездок, поэтому типы и модули называются `Trip*`, а не `Japan*`. Конкретная поездка — только данные в `data/trips/`.
- **Composition patterns**: React-логика следует `vercel-composition-patterns` — compound-компоненты вместо boolean-пропов, explicit variants вместо режимов внутри одного компонента, `children`/render-props вместо `renderX`-пропов. См. `Checklist.*` и `DayPanel.*` как примеры.
- **Контент — из данных**: `Header`/`Hero`/`Footer` рендерят строки из `trip.meta`, не хардкод.
- Автотестов нет (осознанное решение для MVP) — проверка через дев-сервер в браузере.
