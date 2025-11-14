"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { LatLngExpression } from "leaflet";

type IndustrySite = {
  id: string;
  name: string;
  sector: string;
  lat: number;
  lng: number;
  capacity: number;
  active: boolean;
};

type LandParcel = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area_ha: number;
  zoning: "industri" | "permukiman" | "campuran" | "lainnya";
  built_ratio: number;
};

type Road = {
  id: string;
  name: string;
  type: string;
  path: [number, number][];
};

type POI = {
  id: string;
  name: string;
  type: "port" | "airport";
  lat: number;
  lng: number;
};

type Flood = {
  area: string;
  risk_index: number;
  lat: number;
  lng: number;
};

const Map = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });

export default function PrediksiPage() {
  const [industry, setIndustry] = useState<IndustrySite[]>([]);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [floods, setFloods] = useState<Flood[]>([]);
  const [minArea, setMinArea] = useState(0);
  const [allowedZoning, setAllowedZoning] = useState<Record<LandParcel["zoning"], boolean>>({ industri: true, permukiman: true, campuran: true, lainnya: true });
  const [weights, setWeights] = useState({ proximity: 0.35, vacancy: 0.25, zoning: 0.2, area: 0.1, road: 0.1, port: 0.1, floodPenalty: 0.1 });
  const [showRoads, setShowRoads] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showFlood, setShowFlood] = useState(false);
  const center: LatLngExpression = [-6.2, 106.8];

  useEffect(() => {
    Promise.all([
      fetch("/data/industry_sites.json").then(r => r.json()),
      fetch("/data/land_parcels.json").then(r => r.json()),
      fetch("/data/roads.json").then(r => r.json()),
      fetch("/data/ports_airports.json").then(r => r.json()),
      fetch("/data/flood_risk.json").then(r => r.json()),
    ]).then(([i, p, rd, po, fr]) => {
      setIndustry(i);
      setParcels(p);
      setRoads(rd);
      setPois(po);
      setFloods(fr);
    });
  }, []);

  const scored = useMemo(() => {
    const w = weights;
    const sumW = w.proximity + w.vacancy + w.zoning + w.area + w.road + w.port + w.floodPenalty;
    return parcels
      .filter((parcel) => parcel.area_ha >= minArea && allowedZoning[parcel.zoning])
      .map((parcel) => {
        const proximityScore = bound01(1 - minDistance(parcel, industry.map(i => [i.lat, i.lng])) / 20);
        const zoningScore = parcel.zoning === "industri" || parcel.zoning === "campuran" ? 1 : 0.3;
        const vacancyScore = bound01(1 - parcel.built_ratio);
        const areaScore = bound01(parcel.area_ha / 5);
        const roadScore = roads.length ? bound01(1 - minDistance(parcel, flattenRoadNodes(roads)) / 15) : 0;
        const portScore = pois.length ? bound01(1 - minDistance(parcel, pois.map(p => [p.lat, p.lng])) / 30) : 0;
        const floodPenalty = floods.length ? nearestFloodRisk(parcel, floods) : 0;
        const scoreRaw = w.proximity * proximityScore + w.vacancy * vacancyScore + w.zoning * zoningScore + w.area * areaScore + w.road * roadScore + w.port * portScore - w.floodPenalty * floodPenalty;
        const score = round2(bound01(scoreRaw / sumW));
        return { parcel, score };
      });
  }, [parcels, industry, roads, pois, floods, weights, minArea, allowedZoning]);

  const topCandidates = useMemo(() => {
    return scored.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [scored]);

  const insights = useMemo(() => {
    const count = scored.length;
    const avgScore = count ? round2(scored.reduce((s, x) => s + x.score, 0) / count) : 0;
    const totalArea = round2(scored.reduce((s, x) => s + x.parcel.area_ha, 0));
    const avgDistanceIndustry = count
      ? round2(
          scored.reduce(
            (s, x) => s + minDistance(x.parcel, industry.map((i) => [i.lat, i.lng])),
            0
          ) / count
        )
      : 0;
    return { filteredCount: count, avgScore, totalArea, avgDistanceIndustry };
  }, [scored, industry]);

  useEffect(() => {}, []);

  return (
    <section className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Prediksi Lahan Kosong</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Visualisasi kandidat lahan kosong potensial untuk pengembangan industri berdasarkan kedekatan, zonasi, keterbangunan, dan luas.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-zinc-200/60 p-2 dark:border-zinc-800">
          <Map center={center} zoom={11} style={{ height: 520, width: "100%" }} scrollWheelZoom>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            {showRoads && roads.map((r) => (
              <Polyline key={r.id} positions={r.path.map(p => [p[0], p[1]])} pathOptions={{ color: r.type === "tol" ? "#0ea5e9" : "#475569", weight: 3, opacity: 0.7 }} />
            ))}
            {showPorts && pois.map((p) => (
              <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={5} pathOptions={{ color: p.type === "port" ? "#22c55e" : "#f97316" }}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">{p.name}</div>
                    <div>Tipe: {p.type}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {showFlood && floods.map((f) => (
              <CircleMarker key={f.area} center={[f.lat, f.lng]} radius={6} pathOptions={{ color: floodColor(f.risk_index) }}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">{f.area}</div>
                    <div>Risk: {f.risk_index}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {topCandidates.map(({ parcel, score }) => (
              <CircleMarker key={parcel.id} center={[parcel.lat, parcel.lng]} radius={6} pathOptions={{ color: colorForScore(score) }}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">{parcel.name}</div>
                    <div>Skor: {score}</div>
                    <div>Luas: {parcel.area_ha} ha</div>
                    <div>Zonasi: {parcel.zoning}</div>
                    <div>Keterbangunan: {Math.round(parcel.built_ratio * 100)}%</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {industry.map((i) => (
              <CircleMarker key={i.id} center={[i.lat, i.lng]} radius={4} pathOptions={{ color: "#6366f1" }}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">{i.name}</div>
                    <div>Sektor: {i.sector}</div>
                    <div>Kapasitas: {i.capacity}</div>
                    <div>Status: {i.active ? "Aktif" : "Tidak aktif"}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </Map>
        </div>
        <div className="rounded-xl border border-zinc-200/60 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Kontrol & Kandidat</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <div className="text-sm font-medium">Min. Luas (ha)</div>
              <input type="range" min={0} max={10} step={0.5} value={minArea} onChange={(e) => setMinArea(parseFloat(e.target.value))} className="w-full" />
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{minArea} ha</div>
            </div>
            <div>
              <div className="text-sm font-medium">Zonasi Diizinkan</div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {(["industri","campuran","permukiman","lainnya"] as LandParcel["zoning"][ ]).map(z => (
                  <label key={z} className="inline-flex items-center gap-1">
                    <input type="checkbox" checked={allowedZoning[z]} onChange={(e) => setAllowedZoning({ ...allowedZoning, [z]: e.target.checked })} />
                    <span>{z}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Bobot Skor</div>
              {([
                ["Kedekatan Industri","proximity"],
                ["Kekosongan Lahan","vacancy"],
                ["Zonasi","zoning"],
                ["Luas","area"],
                ["Akses Jalan","road"],
                ["Akses Pelabuhan/Bandara","port"],
                ["Penalti Risiko Banjir","floodPenalty"],
              ] as const).map(([label, key]) => (
                <div key={key} className="mt-2">
                  <div className="flex items-center justify-between text-xs"><span>{label}</span><span>{weights[key as keyof typeof weights]}</span></div>
                  <input type="range" min={0} max={1} step={0.05} value={weights[key as keyof typeof weights]} onChange={(e) => setWeights({ ...weights, [key]: parseFloat(e.target.value) })} className="w-full" />
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm font-medium">Layer Peta</div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={showRoads} onChange={(e) => setShowRoads(e.target.checked)} />Jalan</label>
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={showPorts} onChange={(e) => setShowPorts(e.target.checked)} />Pelabuhan/Bandara</label>
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={showFlood} onChange={(e) => setShowFlood(e.target.checked)} />Risiko Banjir</label>
              </div>
            </div>
          </div>

          <h3 className="mt-6 text-base font-medium">Kandidat Teratas</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {topCandidates.map(({ parcel, score }) => (
              <li key={parcel.id} className="flex items-center justify-between rounded-lg border border-zinc-200/60 p-3 dark:border-zinc-800">
                <div>
                  <div className="font-medium">{parcel.name}</div>
                  <div className="text-zinc-600 dark:text-zinc-400">{parcel.zoning} • {parcel.area_ha} ha</div>
                </div>
                <span className="rounded bg-zinc-900 px-2 py-1 text-white dark:bg-zinc-100 dark:text-black">{score}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => exportTopCSV(topCandidates, industry, roads, pois, floods)} className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200">Export CSV</button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard title="Kandidat Tersaring" value={insights.filteredCount} />
        <InsightCard title="Rata-rata Skor" value={insights.avgScore} />
        <InsightCard title="Luas Total (ha)" value={insights.totalArea} />
        <InsightCard title="Jarak Rata2 ke Industri (km)" value={insights.avgDistanceIndustry} />
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
        <div className="border-b border-zinc-200/60 px-4 py-3 text-sm font-medium dark:border-zinc-800">Detail Kandidat</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Skor</th>
                <th className="px-4 py-2 text-left">Luas (ha)</th>
                <th className="px-4 py-2 text-left">Zonasi</th>
                <th className="px-4 py-2 text-left">Industri (km)</th>
                <th className="px-4 py-2 text-left">Jalan (km)</th>
                <th className="px-4 py-2 text-left">Pel/Bdr (km)</th>
                <th className="px-4 py-2 text-left">Risiko Banjir</th>
              </tr>
            </thead>
            <tbody>
              {topCandidates.slice(0, 10).map(({ parcel, score }) => {
                const dm = distMetrics(parcel, industry, roads, pois);
                const fr = nearestFloodRisk(parcel, floods);
                return (
                  <tr key={parcel.id} className="border-t border-zinc-200/60 dark:border-zinc-800">
                    <td className="px-4 py-2">{parcel.name}</td>
                    <td className="px-4 py-2">{score}</td>
                    <td className="px-4 py-2">{parcel.area_ha}</td>
                    <td className="px-4 py-2">{parcel.zoning}</td>
                    <td className="px-4 py-2">{dm.industry.toFixed(2)}</td>
                    <td className="px-4 py-2">{dm.road.toFixed(2)}</td>
                    <td className="px-4 py-2">{dm.port.toFixed(2)}</td>
                    <td className="px-4 py-2">{fr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200/60 p-6 dark:border-zinc-800">
          <div className="text-sm font-medium">Legenda</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#16a34a]" /> Skor &gt; 0.8</div>
            <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#84cc16]" /> Skor 0.6–0.8</div>
            <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#f59e0b]" /> Skor 0.4–0.6</div>
            <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#ef4444]" /> Skor &lt; 0.4</div>
            <div className="mt-4 flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#22c55e]" /> Pelabuhan</div>
            <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#f97316]" /> Bandara</div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200/60 p-6 dark:border-zinc-800">
          <div className="text-sm font-medium">Top 5 Skor</div>
          <div className="mt-3 space-y-3">
            {topCandidates.slice(0, 5).map(({ parcel, score }) => (
              <div key={parcel.id} className="">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate">{parcel.name}</span>
                  <span>{score}</span>
                </div>
                <div className="mt-1 h-2 w-full rounded bg-zinc-200 dark:bg-zinc-800">
                  <div style={{ width: `${score * 100}%` }} className="h-2 rounded bg-indigo-600"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200/60 p-6 dark:border-zinc-800">
          <div className="text-sm font-medium">Rekomendasi</div>
          <div className="mt-3 space-y-3">
            {topCandidates.slice(0, 3).map(({ parcel }) => {
              const dm = distMetrics(parcel, industry, roads, pois);
              const notes = [] as string[];
              if (parcel.zoning === "industri") notes.push("Zonasi industri");
              if (parcel.built_ratio < 0.3) notes.push("Keterbangunan rendah");
              if (dm.road < 5) notes.push("Dekat jalan utama");
              if (dm.port < 30) notes.push("Akses pelabuhan/bandara");
              return (
                <div key={parcel.id} className="rounded-lg border border-zinc-200/60 p-3 text-xs dark:border-zinc-800">
                  <div className="font-medium">{parcel.name}</div>
                  <div className="mt-1 text-zinc-600 dark:text-zinc-400">{notes.join(" • ")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function colorForScore(score: number) {
  if (score > 0.8) return "#16a34a";
  if (score > 0.6) return "#84cc16";
  if (score > 0.4) return "#f59e0b";
  return "#ef4444";
}

function bound01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function flattenRoadNodes(roads: Road[]) {
  const nodes: [number, number][] = [];
  for (const r of roads) {
    for (const p of r.path) nodes.push(p);
  }
  return nodes;
}

function minDistance(parcel: LandParcel, points: [number, number][]) {
  if (!points.length) return Infinity;
  let min = Infinity;
  for (const [lat, lng] of points) {
    const d = haversine(parcel.lat, parcel.lng, lat, lng);
    if (d < min) min = d;
  }
  return min;
}

function nearestFloodRisk(parcel: LandParcel, floods: Flood[]) {
  if (!floods.length) return 0;
  let best = { d: Infinity, risk: 0 };
  for (const f of floods) {
    const d = haversine(parcel.lat, parcel.lng, f.lat, f.lng);
    if (d < best.d) best = { d, risk: f.risk_index };
  }
  return best.risk;
}

function floodColor(risk: number) {
  if (risk > 0.7) return "#ef4444";
  if (risk > 0.5) return "#f59e0b";
  if (risk > 0.3) return "#84cc16";
  return "#22c55e";
}

function distMetrics(parcel: LandParcel, industry: IndustrySite[], roads: Road[], pois: POI[]) {
  const di = minDistance(parcel, industry.map(i => [i.lat, i.lng]));
  const dr = minDistance(parcel, flattenRoadNodes(roads));
  const dp = minDistance(parcel, pois.map(p => [p.lat, p.lng]));
  return { industry: di === Infinity ? 0 : di, road: dr === Infinity ? 0 : dr, port: dp === Infinity ? 0 : dp };
}

function exportTopCSV(top: { parcel: LandParcel; score: number }[], industry: IndustrySite[], roads: Road[], pois: POI[], floods: Flood[]) {
  if (typeof document === "undefined" || !document.body) return;
  const header = ["id","name","score","area_ha","zoning","built_ratio","dist_industry_km","dist_road_km","dist_port_km","flood_risk"];
  const rows = top.map(({ parcel, score }) => {
    const d = distMetrics(parcel, industry, roads, pois);
    const fr = nearestFloodRisk(parcel, floods);
    return [parcel.id, parcel.name, score, parcel.area_ha, parcel.zoning, parcel.built_ratio, round2(d.industry), round2(d.road), round2(d.port), fr];
  });
  const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kandidat_lahan.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function InsightCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}