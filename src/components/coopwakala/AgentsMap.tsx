"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface Agent {
  name: string;
  region: string;
  district: string;
  ward: string;
  street: string;
}

interface Props {
  agents: Agent[];
  activeRegion: string | null;
  onRegionClick: (region: string) => void;
}

const REGION_CENTROIDS: Record<string, [number, number]> = {
  "Arusha":        [-3.387,  36.683],
  "Dar Es Salaam": [-6.792,  39.208],
  "Dodoma":        [-6.173,  35.739],
  "Geita":         [-2.873,  32.237],
  "Kagera":        [-1.298,  31.246],
  "Katavi":        [-6.367,  31.133],
  "Kigoma":        [-4.877,  29.627],
  "Kilimanjaro":   [-3.354,  37.344],
  "Lindi":         [-9.998,  39.714],
  "Manyara":       [-3.601,  35.772],
  "Mara":          [-1.774,  34.005],
  "Mbeya":         [-8.900,  33.460],
  "Morogoro":      [-6.821,  37.662],
  "Mtwara":        [-10.267, 40.183],
  "Mwanza":        [-2.516,  32.918],
  "Ruvuma":        [-10.683, 35.650],
  "Shinyanga":     [-3.660,  33.423],
  "Simiyu":        [-2.633,  34.217],
  "Singida":       [-4.819,  34.750],
  "Songwe":        [-8.933,  33.167],
  "Tabora":        [-5.017,  32.800],
  "Tanga":         [-5.069,  38.992],
};

export default function AgentsMap({ agents, activeRegion, onRegionClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    // Guard against StrictMode double-invoke — Leaflet marks the container with _leaflet_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;

    // Dynamic import to avoid SSR
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      // Fix default marker icon path issue with webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [-6.5, 35.0],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      leafletMap.current = map;

      // Count agents per region
      const counts: Record<string, number> = {};
      for (const a of agents) counts[a.region] = (counts[a.region] ?? 0) + 1;

      // Create markers
      for (const [region, coords] of Object.entries(REGION_CENTROIDS)) {
        const count = counts[region];
        if (!count) continue;

        const isActive = activeRegion === region;

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              background: ${isActive ? "#1A8A3A" : "#1A56A0"};
              color: white;
              border: 2.5px solid white;
              border-radius: 50px;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 700;
              font-family: system-ui, sans-serif;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 5px;
              transition: all 0.2s;
            ">
              <span style="font-size:13px">📍</span>
              <span>${region}</span>
              <span style="
                background: rgba(255,255,255,0.25);
                border-radius: 999px;
                padding: 1px 6px;
                font-size: 10px;
              ">${count}</span>
            </div>`,
          iconAnchor: [0, 0],
        });

        const marker = L.marker(coords, { icon }).addTo(map);
        marker.on("click", () => onRegionClick(region));
        markersRef.current.set(region, marker);
      }
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker styles when activeRegion changes
  useEffect(() => {
    if (!leafletMap.current) return;
    import("leaflet").then((L) => {
      const counts: Record<string, number> = {};
      for (const a of agents) counts[a.region] = (counts[a.region] ?? 0) + 1;

      for (const [region, markerInstance] of markersRef.current.entries()) {
        const count = counts[region] ?? 0;
        const isActive = activeRegion === region;
        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              background: ${isActive ? "#1A8A3A" : "#1A56A0"};
              color: white;
              border: ${isActive ? "2.5px solid #fff" : "2.5px solid white"};
              border-radius: 50px;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 700;
              font-family: system-ui, sans-serif;
              white-space: nowrap;
              box-shadow: ${isActive ? "0 3px 12px rgba(26,138,58,0.4)" : "0 2px 8px rgba(0,0,0,0.25)"};
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 5px;
              transform: ${isActive ? "scale(1.1)" : "scale(1)"};
            ">
              <span style="font-size:13px">📍</span>
              <span>${region}</span>
              <span style="
                background: rgba(255,255,255,0.25);
                border-radius: 999px;
                padding: 1px 6px;
                font-size: 10px;
              ">${count}</span>
            </div>`,
          iconAnchor: [0, 0],
        });
        (markerInstance as ReturnType<typeof L.marker>).setIcon(icon);
      }
    });
  }, [activeRegion, agents]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden border border-gray-200"
      style={{ height: "480px" }}
    />
  );
}
