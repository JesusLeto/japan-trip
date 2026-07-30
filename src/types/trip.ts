export interface ChecklistItemData {
  id: string;
  label: string;
  dl: string;
  desc: string;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItemData[];
}

export interface ChecklistData {
  cats: ChecklistCategory[];
}

export interface TripPoint {
  name: string;
  coords: [number, number];
  arr: string;
  dur: string;
  durMin: number;
  desc: string;
  /** Set only when this point is not in the day's "home" city. */
  city?: string;
}

export interface TripLeg {
  tag: string;
  line: string;
  time: string;
  cost: number;
  note?: string;
}

/** Morning/day/evening narrative for a day with no map points. Text may use markdown-lite bold and italic markup. */
export interface DayBlocks {
  morning?: string;
  day?: string;
  evening?: string;
}

export interface TripDay {
  id: string;
  label: string;
  city: string;
  title: string;
  /** Map-timeline points; empty for narrative-only days (see `blocks`). */
  points: TripPoint[];
  /** Transport segment between points[i] and points[i+1]; empty for narrative-only days. */
  legs: TripLeg[];

  /** Where you sleep that night, e.g. "ночь в Осаке" / "вылет". */
  base?: string;
  /** Short "Ключевое: ..." highlight for the day. */
  keyTag?: string;
  blocks?: DayBlocks;
  /** Preformatted transit chip lines, e.g. "Осака → Киото · JR Special Rapid, ~29 мин · ~¥580". */
  transitNotes?: string[];
  foodNote?: string;
  planBNote?: string;
  /** Optional "Пропустите: ..." note — not every day has one. */
  skipNote?: string;
}

export interface TripMeta {
  kicker: string;
  routeSummary: string;
  heroLabel: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string[];
  /** Meta chips under the hero, e.g. "Даты · конец окт — нач нояб". */
  heroChips: string[];
  footerNote: string;
  /** e.g. "10 дней · 4 города" — used in the map's "весь маршрут" summary line. Only needed when days have map points. */
  routeOverviewSummary?: string;
}

export interface HotelCard {
  city: string;
  nights: string;
  description: string;
  names: string[];
}

export interface HotelsSectionData {
  intro: string;
  cards: HotelCard[];
}

export interface BudgetRow {
  item: string;
  comment: string;
  costLabel: string;
}

export interface BudgetSectionData {
  intro: string;
  rows: BudgetRow[];
  totalLabel: string;
  totalCostLabel: string;
  footnote: string;
}

export interface PracticalCard {
  title: string;
  text: string;
}

export interface PracticalSectionData {
  cards: PracticalCard[];
}

export interface SkipItem {
  place: string;
  why: string;
}

export interface SkipListSectionData {
  intro: string;
  items: SkipItem[];
}

/** Initial map view, used until points with coordinates exist to fit bounds against. */
export interface TripMapView {
  center: [number, number];
  zoom: number;
}

export interface TripData {
  id: string;
  meta: TripMeta;
  mapView: TripMapView;
  cities: Record<string, string>;
  pre: ChecklistData;
  arrival: ChecklistData;
  days: TripDay[];
  hotels?: HotelsSectionData;
  budget?: BudgetSectionData;
  practical?: PracticalSectionData;
  skipList?: SkipListSectionData;
}
