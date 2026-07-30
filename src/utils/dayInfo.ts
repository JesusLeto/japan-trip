import type { TripData, TripDay } from '../types/trip';
import { formatYen } from './money';
import { ruPlural } from './pluralize';

export interface DayInfo {
  points: number;
  minutes: number;
  hours: string;
  cost: number;
}

export function computeDayInfo(day: TripDay): DayInfo {
  const minutes = day.points.reduce((sum, point) => sum + (point.durMin ?? 0), 0);
  const cost = day.legs.reduce((sum, leg) => sum + leg.cost, 0);
  const hours = String(Math.round(minutes / 30) / 2).replace('.', ',');
  return { points: day.points.length, minutes, hours, cost };
}

export function computeTotalCost(days: TripDay[]): number {
  return days.reduce((sum, day) => sum + day.legs.reduce((s, leg) => s + leg.cost, 0), 0);
}

/**
 * Summaries are assembled from the parts that actually have data: a trip is filled in
 * incrementally, so a day may have points but no times, or neither yet.
 */
export function formatDaySummary(day: TripDay): string {
  const info = computeDayInfo(day);
  const parts = [day.label, day.city];
  if (info.points > 0) {
    parts.push(`${info.points} ${ruPlural(info.points, ['точка', 'точки', 'точек'])} на карте`);
  }
  if (info.minutes > 0) parts.push(`~${info.hours} ч на ногах`);
  if (info.cost > 0) parts.push(`транспорт ~${formatYen(info.cost)}`);
  if (info.points === 0) parts.push(day.title);
  return parts.join(' · ');
}

export function formatTripSummary(trip: TripData): string {
  const days = trip.days.length;
  const points = trip.days.reduce((sum, day) => sum + day.points.length, 0);
  const cost = computeTotalCost(trip.days);

  const parts = [`${days} ${ruPlural(days, ['день', 'дня', 'дней'])}`];
  if (trip.meta.routeOverviewSummary) parts.push(trip.meta.routeOverviewSummary);
  if (points > 0) parts.push(`${points} ${ruPlural(points, ['точка', 'точки', 'точек'])} на карте`);
  if (cost > 0) parts.push(`транспорт ~${formatYen(cost)}`);
  if (points === 0) parts.push('выберите день, чтобы прочитать план и увидеть его на карте');
  return parts.join(' · ');
}
