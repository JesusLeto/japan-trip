const FALLBACK_COLOR = '#8A94A6';

/**
 * Resolves a day's accent colour. Day labels can name several cities
 * ("Кобэ / Авадзи", "Киото → Токио") — the first one wins.
 */
export function resolveCityColor(cities: Record<string, string>, cityLabel: string): string {
  if (cities[cityLabel]) return cities[cityLabel];
  const firstToken = cityLabel.split(/[/→]/)[0]?.trim();
  return (firstToken && cities[firstToken]) || FALLBACK_COLOR;
}
