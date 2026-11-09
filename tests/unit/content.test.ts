import { describe, expect, it } from "vitest";
import italyRegions from "@/content/geo/italy-regions.json";
import { regions } from "@/content/italy/regions";
import { italianMissionsInIndia } from "@/content/italy/facts";
import { sources } from "@/content/italy/sources";
import { processStages } from "@/content/italy/process";

describe("Italy content integrity", () => {
  it("has content for every region in the map data, and no extras", () => {
    const mapCodes = (italyRegions as { objects: { regions: { geometries: { properties: { code: string } }[] } } }).objects.regions.geometries
      .map((g) => g.properties.code)
      .sort();
    expect(regions.map((r) => r.code).sort()).toEqual(mapCodes);
  });

  it("only links to https URLs for agencies and sources", () => {
    const urls = [...regions.flatMap((r) => r.dsu.map((d) => d.url).filter(Boolean)), ...Object.values(sources).map((s) => s.url)];
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
  });

  it("lists the four Italian missions in India", () => {
    expect(italianMissionsInIndia.map((m) => m.city)).toEqual(["New Delhi", "Mumbai", "Bengaluru", "Kolkata"]);
  });

  it("numbers the five process stages in order, each with a source", () => {
    expect(processStages.map((s) => s.number)).toEqual([1, 2, 3, 4, 5]);
    for (const stage of processStages) expect(stage.sources.length).toBeGreaterThan(0);
  });
});
