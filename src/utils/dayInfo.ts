import type { TripDay } from '../types/trip';
import { formatYen } from './money';
import { ruPlural } from './pluralize';

export interface DayInfo {
  points: number;
  hours: string;
  cost: number;
}

export function computeDayInfo(day: TripDay): DayInfo {
  const mins = day.points.reduce((sum, point) => sum + point.durMin, 0);
  const cost = day.legs.reduce((sum, leg) => sum + leg.cost, 0);
  const hours = String(Math.round(mins / 30) / 2).replace('.', ',');
  return { points: day.points.length, hours, cost };
}

export function computeTotalCost(days: TripDay[]): number {
  return days.reduce((sum, day) => sum + day.legs.reduce((s, leg) => s + leg.cost, 0), 0);
}

export function formatDaySummary(day: TripDay): string {
  const info = computeDayInfo(day);
  return `${day.label} · ${info.points} ${ruPlural(info.points, ['точка', 'точки', 'точек'])} · ~${info.hours} ч на ногах · транспорт ~${formatYen(info.cost)}`;
}
