import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import L from 'leaflet';
import { resolveCityColor } from '../../utils/cityColor';
import type { TripData, TripDay, TripPoint } from '../../types/trip';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const MONO_FONT = "ui-monospace,'SF Mono',Menlo,Consolas,monospace";

export interface RouteMapHandle {
  flyToPoint(dayId: string, pointIndex: number): void;
}

interface MarkerRecord {
  marker: L.Marker;
  day: TripDay;
  point: TripPoint;
  index: number;
}

function cityColor(trip: TripData, city: string): string {
  return resolveCityColor(trip.cities, city);
}

function makeIcon(color: string, num: number | null, dim: boolean) {
  const size = num ? 22 : 12;
  const bg = dim ? '#242C3B' : color;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid #0B1016;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font:700 11px ${MONO_FONT};color:#0B1016;opacity:${dim ? 0.5 : 1}">${num ?? ''}</div>`;
  return L.divIcon({
    className: 'jk-di',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

interface RouteMapProps {
  trip: TripData;
  day: TripDay | null;
  ref?: Ref<RouteMapHandle>;
}

export function RouteMap({ trip, day, ref }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const lineGroupRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<MarkerRecord[]>([]);
  const tileErrorsRef = useRef(0);
  const isInitialRef = useRef(true);
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, { zoomControl: true, scrollWheelZoom: true });
    mapRef.current = map;
    // Each fresh Leaflet instance (incl. StrictMode's dev remount) has no view yet:
    // flyTo/flyToBounds require one to already be set, so force the first [day]-effect run to use fitBounds.
    isInitialRef.current = true;

    const tileLayer = L.tileLayer(TILE_URL, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap · &copy; CARTO',
    });
    tileLayer.on('tileerror', () => {
      tileErrorsRef.current += 1;
      if (tileErrorsRef.current > 5) setTilesFailed(true);
    });
    tileLayer.on('tileload', () => {
      tileErrorsRef.current = 0;
      setTilesFailed(false);
    });
    tileLayer.addTo(map);

    const lineGroup = L.layerGroup().addTo(map);
    lineGroupRef.current = lineGroup;

    const records: MarkerRecord[] = [];
    trip.days.forEach((d) => {
      d.points.forEach((point, index) => {
        const color = cityColor(trip, point.city ?? d.city);
        const marker = L.marker(point.coords, { icon: makeIcon(color, null, false) }).addTo(map);
        const metaParts = [d.label];
        if (point.arr) metaParts.push(`прибытие ${point.arr}`);
        if (point.dur && point.dur !== '—') metaParts.push(point.dur);
        marker.bindPopup(
          `<div style="min-width:190px;max-width:240px">` +
            `<div style="font:600 14px system-ui;color:#EDEAE3">${point.name}</div>` +
            `<div style="font:11px ${MONO_FONT};color:#8A94A6;margin:5px 0">${metaParts.join(' · ')}</div>` +
            `<div style="font:12.5px/1.55 system-ui;color:#A7B0BF">${point.desc}</div></div>`,
        );
        records.push({ marker, day: d, point, index });
      });
    });
    markersRef.current = records;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Map is created once for the app's lifetime; trip data does not change at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const lineGroup = lineGroupRef.current;
    if (!map || !lineGroup) return;

    lineGroup.clearLayers();
    markersRef.current.forEach((rec) => {
      const isSelected = day !== null && rec.day.id === day.id;
      const dim = day !== null && !isSelected;
      rec.marker.setIcon(
        makeIcon(cityColor(trip, rec.point.city ?? rec.day.city), isSelected ? rec.index + 1 : null, dim),
      );
      rec.marker.setZIndexOffset(isSelected ? 1000 : 0);
    });

    function applyView(bounds: L.LatLngBounds) {
      if (!map) return;
      if (isInitialRef.current) map.fitBounds(bounds);
      else map.flyToBounds(bounds, { duration: 0.8 });
    }

    const dayCoords = day?.points.map((p) => p.coords) ?? [];
    const all = trip.days.flatMap((d) => d.points.map((p) => ({ coords: p.coords, city: p.city ?? d.city })));

    if (dayCoords.length > 0) {
      const color = cityColor(trip, day!.city);
      // One polyline per leg: a leg with `path` follows the real route, the rest stay straight.
      const drawn: [number, number][] = [...dayCoords];
      for (let i = 0; i < dayCoords.length - 1; i++) {
        const path = day!.legs[i]?.path ?? [];
        const segment: [number, number][] = [dayCoords[i], ...path, dayCoords[i + 1]];
        drawn.push(...path);
        L.polyline(segment, { color, weight: 2, opacity: 0.9 }).addTo(lineGroup);
      }
      applyView(L.latLngBounds(drawn).pad(0.3));
    } else if (all.length > 0) {
      // Overview, or a selected day whose points have no coordinates yet: show the whole trip.
      if (!day) {
        for (let i = 1; i < all.length; i++) {
          if (all[i].city !== all[i - 1].city) {
            L.polyline([all[i - 1].coords, all[i].coords], {
              color: '#7B8598',
              weight: 1.5,
              dashArray: '4 7',
              opacity: 0.55,
            }).addTo(lineGroup);
          }
        }
      }
      applyView(L.latLngBounds(all.map((x) => x.coords)).pad(0.08));
    } else if (isInitialRef.current) {
      // No coordinates anywhere yet — Leaflet still needs an explicit view before any flyTo works.
      map.setView(trip.mapView.center, trip.mapView.zoom);
    }
    isInitialRef.current = false;
    // trip is static for the app's lifetime; only `day` should retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  useImperativeHandle(
    ref,
    () => ({
      flyToPoint(dayId, pointIndex) {
        const map = mapRef.current;
        const rec = markersRef.current.find((r) => r.day.id === dayId && r.index === pointIndex);
        if (!map || !rec) return;
        map.flyTo(rec.point.coords, 15, { duration: 0.7 });
        window.setTimeout(() => rec.marker.openPopup(), 750);
      },
    }),
    [],
  );

  const fallbackRows = trip.days.flatMap((d) => d.points.map((p) => ({ key: `${d.id}-${p.name}`, day: d.label, name: p.name, arr: p.arr })));

  return (
    <div className="relative overflow-hidden rounded-[4px] border border-bg-active">
      <div ref={containerRef} className="h-[560px] bg-bg max-[900px]:h-[60vh]" />
      {tilesFailed && (
        <div className="absolute inset-0 z-[800] overflow-auto bg-bg-raised p-5">
          <div className="mb-3 font-mono text-xs font-semibold tracking-[0.08em] text-accent">
            КАРТА НЕ ЗАГРУЗИЛАСЬ — ТОЧКИ СПИСКОМ
          </div>
          {fallbackRows.map((row) => (
            <div key={row.key} className="flex gap-2.5 border-b border-bg-active py-[5px] text-[13px] text-text-muted">
              <span className="min-w-[30px] font-mono text-[11px] font-semibold text-accent">{row.day}</span>
              <span className="flex-1">{row.name}</span>
              <span className="font-mono text-[11px] font-medium text-text-faint">{row.arr}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
