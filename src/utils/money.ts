import type { TripLeg } from '../types/trip';

export function formatYen(amount: number): string {
  return `¥${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
}

export function formatLegCost(leg: TripLeg): string {
  if (leg.cost === 0) return leg.note ?? 'бесплатно';
  const amount = formatYen(leg.cost);
  return leg.note === '≈' ? `~${amount}` : amount;
}
