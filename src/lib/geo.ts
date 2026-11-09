import "server-only";
import { geoConicConformal, geoInterpolate, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import countriesTopology from "@/content/geo/countries-india-pov.json";
import regionsTopology from "@/content/geo/italy-regions.json";
import { italianMissionsInIndia } from "@/content/italy/facts";
import { regions as regionContent } from "@/content/italy/regions";

/**
 * Map geometry is computed on the server and shipped as SVG path strings, so
 * pages carry no map library. Country borders use Natural Earth's India
 * point-of-view dataset, which follows the boundaries recognised by India.
 * Italian regions: ISTAT boundaries via openpolis (CC BY 4.0).
 */

type CountryProps = { iso: string; name: string };
type RegionProps = { name: string; code: string };

const countries = (() => {
  const topology = countriesTopology as unknown as Topology<{ countries: GeometryCollection<CountryProps> }>;
  return feature(topology, topology.objects.countries) as FeatureCollection<Geometry, CountryProps>;
})();

const italyRegions = (() => {
  const topology = regionsTopology as unknown as Topology<{ regions: GeometryCollection<RegionProps> }>;
  return feature(topology, topology.objects.regions) as FeatureCollection<Geometry, RegionProps>;
})();

const round = (n: number) => Math.round(n * 10) / 10;

function countryByIso(iso: string): Feature<Geometry, CountryProps> {
  const found = countries.features.find((f) => f.properties.iso === iso);
  if (!found) throw new Error(`Country ${iso} missing from map data`);
  return found;
}

/** A great-circle route sampled into a projected path, with its length for draw-on animation. */
function projectRoute(projection: GeoProjection, from: [number, number], to: [number, number]) {
  const interpolate = geoInterpolate(from, to);
  const points: [number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const p = projection(interpolate(i / 64));
    if (p) points.push(p);
  }
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
  }
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${round(p[0])},${round(p[1])}`).join("");
  return { d, length: Math.ceil(length) };
}

const ITALY_ANCHOR: [number, number] = [12.5, 42.3];

export type JourneyMapData = {
  width: number;
  height: number;
  countries: { iso: string; d: string }[];
  india: string;
  italy: string;
  routes: { city: string; d: string; length: number }[];
  missions: { city: string; x: number; y: number }[];
  labels: { india: [number, number]; italy: [number, number] };
  camera: { x: number; y: number; scale: number };
  regions: { code: string; d: string }[];
  cities: { name: string; x: number; y: number }[];
};

/** India → Italy overview that zooms into Italy's regions. */
export function buildJourneyMap(width = 800, height = 640): JourneyMapData {
  const frame: Feature = {
    type: "Feature",
    properties: {},
    geometry: { type: "MultiPoint", coordinates: [[6, 8], [95, 8], [6, 49], [95, 49]] },
  };
  const projection = geoMercator().fitExtent([[24, 24], [width - 24, height - 24]], frame);
  const path = geoPath(projection);

  const india = countryByIso("IND");
  const italy = countryByIso("ITA");

  const [[x0, y0], [x1, y1]] = path.bounds(italy);
  const scale = Math.min((width * 0.62) / (x1 - x0), (height * 0.86) / (y1 - y0));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const projectPoint = (c: [number, number]) => {
    const p = projection(c)!;
    return { x: round(p[0]), y: round(p[1]) };
  };

  return {
    width,
    height,
    countries: countries.features
      .filter((f) => f.properties.iso !== "IND" && f.properties.iso !== "ITA")
      .map((f) => ({ iso: f.properties.iso, d: path(f) ?? "" }))
      .filter((c) => c.d),
    india: path(india) ?? "",
    italy: path(italy) ?? "",
    routes: italianMissionsInIndia.map((m) => ({ city: m.city, ...projectRoute(projection, m.coordinates, ITALY_ANCHOR) })),
    missions: italianMissionsInIndia.map((m) => ({ city: m.city, ...projectPoint(m.coordinates) })),
    labels: {
      india: projection([79, 22])!.map(round) as [number, number],
      italy: projection([16, 46.5])!.map(round) as [number, number],
    },
    camera: { x: round(width / 2 - scale * cx), y: round(height / 2 - scale * cy), scale: round(scale * 100) / 100 },
    regions: italyRegions.features.map((f) => ({ code: f.properties.code, d: path(f) ?? "" })),
    cities: regionContent.flatMap((r) => r.cities).map((c) => ({ name: c.name, ...projectPoint(c.coordinates) })),
  };
}

export type RegionMapData = {
  width: number;
  height: number;
  regions: { code: string; name: string; d: string; centroid: [number, number]; bounds: [[number, number], [number, number]] }[];
};

/** Italy alone, sized for the interactive scholarship map. */
export function buildItalyRegionMap(width = 560, height = 640): RegionMapData {
  const projection = geoConicConformal().parallels([38, 46]).rotate([-12.5, 0]).fitExtent([[16, 16], [width - 16, height - 16]], italyRegions);
  const path = geoPath(projection);
  return {
    width,
    height,
    regions: italyRegions.features.map((f) => {
      const [[a, b], [c, d]] = path.bounds(f);
      const [mx, my] = path.centroid(f);
      return {
        code: f.properties.code,
        name: f.properties.name,
        d: path(f) ?? "",
        centroid: [round(mx), round(my)],
        bounds: [[round(a), round(b)], [round(c), round(d)]],
      };
    }),
  };
}

export type IndiaMapData = {
  width: number;
  height: number;
  india: string;
  missions: { city: string; x: number; y: number }[];
};

/** India with the four Italian missions marked. */
export function buildIndiaMissionsMap(width = 480, height = 520): IndiaMapData {
  const india = countryByIso("IND");
  const projection = geoMercator().fitExtent([[20, 20], [width - 20, height - 20]], india);
  const path = geoPath(projection);
  return {
    width,
    height,
    india: path(india) ?? "",
    missions: italianMissionsInIndia.map((m) => {
      const p = projection(m.coordinates)!;
      return { city: m.city, x: round(p[0]), y: round(p[1]) };
    }),
  };
}
