import { geoInterpolate, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import countriesTopology from "../../src/content/geo/countries-india-pov.json";
import regionsTopology from "../../src/content/geo/italy-regions.json";

/** Same data as the website: Natural Earth India point of view, ISTAT regions. */
type Props = { iso: string };

const countries = (() => {
  const t = countriesTopology as unknown as Topology<{ countries: GeometryCollection<Props> }>;
  return feature(t, t.objects.countries) as FeatureCollection<Geometry, Props>;
})();
const regions = (() => {
  const t = regionsTopology as unknown as Topology<{ regions: GeometryCollection }>;
  return feature(t, t.objects.regions) as FeatureCollection;
})();

const MISSIONS: [number, number][] = [
  [77.209, 28.6139],
  [72.8777, 19.076],
  [77.5946, 12.9716],
  [88.3639, 22.5726],
];
const ITALY: [number, number] = [12.5, 42.3];

export function buildMap(width: number, height: number) {
  const frame: Feature = { type: "Feature", properties: {}, geometry: { type: "MultiPoint", coordinates: [[6, 8], [95, 8], [6, 49], [95, 49]] } };
  const projection = geoMercator().fitExtent([[40, 40], [width - 40, height - 40]], frame);
  const path = geoPath(projection);
  const italy = countries.features.find((f) => f.properties.iso === "ITA")!;
  const india = countries.features.find((f) => f.properties.iso === "IND")!;
  const [[x0, y0], [x1, y1]] = path.bounds(italy);
  const scale = Math.min((width * 0.5) / (x1 - x0), (height * 0.8) / (y1 - y0));

  const routes = MISSIONS.map((from) => {
    const interpolate = geoInterpolate(from, ITALY);
    const pts = Array.from({ length: 65 }, (_, i) => projection(interpolate(i / 64))!);
    let length = 0;
    for (let i = 1; i < pts.length; i++) length += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
    return { d: pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(""), length };
  });

  return {
    countries: countries.features.filter((f) => f !== italy && f !== india).map((f) => path(f) ?? ""),
    india: path(india) ?? "",
    italy: path(italy) ?? "",
    regions: regions.features.map((f) => path(f) ?? ""),
    routes,
    missions: MISSIONS.map((m) => projection(m)!),
    camera: { scale, x: width / 2 - scale * ((x0 + x1) / 2), y: height / 2 - scale * ((y0 + y1) / 2) },
  };
}
