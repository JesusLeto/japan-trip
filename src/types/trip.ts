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

export interface TripDay {
  id: string;
  label: string;
  city: string;
  title: string;
  points: TripPoint[];
  legs: TripLeg[];
}

export interface TripMeta {
  kicker: string;
  routeSummary: string;
  heroLabel: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  footerNote: string;
  /** e.g. "10 дней · 4 города" — used in the route overview summary line. */
  routeOverviewSummary: string;
}

export interface TripData {
  id: string;
  meta: TripMeta;
  cities: Record<string, string>;
  pre: ChecklistData;
  arrival: ChecklistData;
  days: TripDay[];
}
