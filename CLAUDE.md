# Travel Planner

Личный веб-планировщик путешествий. MVP реализует одну поездку — Японию (`JAPAN KIT`, Осака → Токио, 14 дней): чеклисты подготовки, маршрут день за днём с планами Б, отели, бюджет и практическая справка. Дизайн-референс (визуальный язык, чеклисты, карта) — в [design_handoff_japan_kit/README.md](design_handoff_japan_kit/README.md).

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
  components/   — Header, Hero, checklist/ (compound), itinerary/ (день за днём),
                  route/ (карта, панель дня), Hotels/Budget/Practical/SkipList-Section,
                  ExportSection, Footer
  utils/        — pluralize, checklist counts, money/day-info formatting, richText, MD-экспорт
```

Секции страницы: `/01` До вылета · `/02` По прилёту · `/03` Маршрут день за днём · `/04` Где спать · `/05` Бюджет · `/06` Практика · `/07` Куда не ходить · `/08` Экспорт.

Подробности архитектуры — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Модель данных и как добавить новую поездку — [docs/DATA_MODEL.md](docs/DATA_MODEL.md). Дизайн-спека — [docs/superpowers/specs/2026-07-13-japan-kit-planner-design.md](docs/superpowers/specs/2026-07-13-japan-kit-planner-design.md).

## Конвенции

- **Абстрактные имена, не `JapanKit*`**: проект потенциально хранит несколько поездок, поэтому типы и модули называются `Trip*`, а не `Japan*`. Конкретная поездка — только данные в `data/trips/`.
- **Composition patterns**: React-логика следует `vercel-composition-patterns` — compound-компоненты вместо boolean-пропов, explicit variants вместо режимов внутри одного компонента, `children`/render-props вместо `renderX`-пропов. См. `Checklist.*` и `DayPanel.*` как примеры.
- **Трип-специфичный контент — из данных**: строки о конкретной поездке (города, даты, маршрут — `kicker`, `routeSummary`, `heroLabel/Title/Subtitle`, `footerNote`, `routeOverviewSummary`) рендерятся из `trip.meta`, не хардкодятся в `Header`/`Hero`/`Footer`. Фичевый UI-копирайт, одинаковый для любой поездки (заголовки чеклистов «До вылета»/«Сразу по прилёту», подписи счётчиков хедера, дисклеймер футера «личный планировщик· всё сохраняется локально») — обычные строки в компонентах, это не часть `TripData`.
- **Один день — одна секция**: `/03` это табы дней; клик по табу открывает описание дня (`blocks` — Утро/День/Вечер, переезды, еда, план Б), а под ним карту с маршрутом того же дня (`points`+`legs`). Описание и карта — две грани одного `TripDay`, не отдельные секции. Координаты заполняются по дням (готов Д1), у точек обязательны только `name`/`coords`/`desc` — времена подставим, когда будут точные даты. Подробности — [docs/DATA_MODEL.md](docs/DATA_MODEL.md).
- Автотестов нет (осознанное решение для MVP) — проверка через дев-сервер в браузере.
