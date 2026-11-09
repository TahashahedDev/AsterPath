/**
 * Italy's 20 regions with their DSU (student support) bodies; universities
 * live in universities.ts, keyed by region code. Keys are ISTAT region codes, matching the map data in
 * src/content/geo/italy-regions.json. Agency URLs were checked on 2026-11-09;
 * where an official address could not be confirmed, no link is shown.
 */

export type DsuBody = { name: string; url?: string; note?: string };

export type Region = {
  code: string;
  slug: string;
  name: string;
  dsu: DsuBody[];
  cities: { name: string; coordinates: [lon: number, lat: number] }[];
};

export const regions: Region[] = [
  {
    code: "01",
    slug: "piemonte",
    name: "Piemonte",
    dsu: [{ name: "EDISU Piemonte", url: "https://www.edisu.piemonte.it" }],
    cities: [{ name: "Turin", coordinates: [7.6869, 45.0703] }],
  },
  {
    code: "02",
    slug: "valle-d-aosta",
    name: "Valle d'Aosta",
    dsu: [{ name: "Regione Autonoma Valle d'Aosta", note: "Student support is managed by the regional administration." }],
    cities: [],
  },
  {
    code: "03",
    slug: "lombardia",
    name: "Lombardia",
    dsu: [{ name: "Managed by each university", note: "In Lombardy, every university runs its own DSU call." }],
    cities: [
      { name: "Milan", coordinates: [9.19, 45.4642] },
      { name: "Pavia", coordinates: [9.1582, 45.1847] },
    ],
  },
  {
    code: "04",
    slug: "trentino-alto-adige",
    name: "Trentino-Alto Adige",
    dsu: [
      { name: "Opera Universitaria di Trento", url: "https://www.operauni.tn.it" },
      { name: "Autonomous Province of Bolzano", note: "Student support for Bolzano is managed by the province." },
    ],
    cities: [{ name: "Trento", coordinates: [11.1217, 46.0748] }],
  },
  {
    code: "05",
    slug: "veneto",
    name: "Veneto",
    dsu: [
      { name: "ESU Padova", url: "https://www.esu.pd.it" },
      { name: "ESU Venezia", url: "https://www.esuvenezia.it" },
      { name: "ESU Verona", url: "https://www.esu.vr.it" },
    ],
    cities: [
      { name: "Padua", coordinates: [11.8768, 45.4064] },
      { name: "Venice", coordinates: [12.3155, 45.4408] },
      { name: "Verona", coordinates: [10.9916, 45.4384] },
    ],
  },
  {
    code: "06",
    slug: "friuli-venezia-giulia",
    name: "Friuli-Venezia Giulia",
    dsu: [{ name: "ARDiS", url: "https://www.ardis.fvg.it" }],
    cities: [{ name: "Trieste", coordinates: [13.7768, 45.6495] }],
  },
  {
    code: "07",
    slug: "liguria",
    name: "Liguria",
    dsu: [{ name: "ALiSEO", url: "https://www.aliseo.liguria.it" }],
    cities: [{ name: "Genoa", coordinates: [8.9463, 44.4056] }],
  },
  {
    code: "08",
    slug: "emilia-romagna",
    name: "Emilia-Romagna",
    dsu: [{ name: "ER.GO", url: "https://www.er-go.it" }],
    cities: [
      { name: "Bologna", coordinates: [11.3426, 44.4949] },
      { name: "Parma", coordinates: [10.3279, 44.8015] },
    ],
  },
  {
    code: "09",
    slug: "toscana",
    name: "Toscana",
    dsu: [{ name: "DSU Toscana", url: "https://www.dsu.toscana.it" }],
    cities: [
      { name: "Florence", coordinates: [11.2558, 43.7696] },
      { name: "Pisa", coordinates: [10.4017, 43.7228] },
      { name: "Siena", coordinates: [11.3308, 43.3188] },
    ],
  },
  {
    code: "10",
    slug: "umbria",
    name: "Umbria",
    dsu: [{ name: "ADiSU Umbria", url: "https://www.adisu.umbria.it" }],
    cities: [{ name: "Perugia", coordinates: [12.3908, 43.1107] }],
  },
  {
    code: "11",
    slug: "marche",
    name: "Marche",
    dsu: [{ name: "ERDIS Marche", url: "https://erdis.it" }],
    cities: [{ name: "Ancona", coordinates: [13.5189, 43.6158] }],
  },
  {
    code: "12",
    slug: "lazio",
    name: "Lazio",
    dsu: [{ name: "DiSCo Lazio", url: "https://laziodisco.it" }],
    cities: [{ name: "Rome", coordinates: [12.4964, 41.9028] }],
  },
  {
    code: "13",
    slug: "abruzzo",
    name: "Abruzzo",
    dsu: [
      { name: "ADSU L'Aquila", url: "https://adsuaq.org" },
      { name: "ADSU Teramo", url: "https://www.adsuteramo.it" },
      { name: "ADSU Chieti-Pescara" },
    ],
    cities: [{ name: "L'Aquila", coordinates: [13.3995, 42.3498] }],
  },
  {
    code: "14",
    slug: "molise",
    name: "Molise",
    dsu: [{ name: "Regione Molise", url: "https://www.regione.molise.it", note: "Contact the University of Molise for the current DSU call." }],
    cities: [],
  },
  {
    code: "15",
    slug: "campania",
    name: "Campania",
    dsu: [{ name: "ADISURC", url: "https://www.adisurcampania.it" }],
    cities: [
      { name: "Naples", coordinates: [14.2681, 40.8518] },
      { name: "Salerno", coordinates: [14.7681, 40.6824] },
    ],
  },
  {
    code: "16",
    slug: "puglia",
    name: "Puglia",
    dsu: [{ name: "ADISU Puglia", url: "https://www.adisupuglia.it" }],
    cities: [{ name: "Bari", coordinates: [16.8719, 41.1171] }],
  },
  {
    code: "17",
    slug: "basilicata",
    name: "Basilicata",
    dsu: [{ name: "ARDSU Basilicata", url: "https://www.ardsubasilicata.it" }],
    cities: [],
  },
  {
    code: "18",
    slug: "calabria",
    name: "Calabria",
    dsu: [{ name: "Managed by each university", note: "Calabrian universities run their own student support services." }],
    cities: [{ name: "Cosenza", coordinates: [16.2508, 39.3008] }],
  },
  {
    code: "19",
    slug: "sicilia",
    name: "Sicilia",
    dsu: [
      { name: "ERSU Palermo", url: "https://www.ersupalermo.it" },
      { name: "ERSU Catania", url: "https://www.ersucatania.it" },
      { name: "ERSU Messina", url: "https://www.ersumessina.it" },
    ],
    cities: [
      { name: "Palermo", coordinates: [13.3615, 38.1157] },
      { name: "Catania", coordinates: [15.0873, 37.5079] },
    ],
  },
  {
    code: "20",
    slug: "sardegna",
    name: "Sardegna",
    dsu: [
      { name: "ERSU Cagliari", url: "https://www.ersucagliari.it" },
      { name: "ERSU Sassari", url: "https://ersusassari.it" },
    ],
    cities: [{ name: "Cagliari", coordinates: [9.1217, 39.2238] }],
  },
];

export function getRegionBySlug(slug: string): Region | undefined {
  return regions.find((r) => r.slug === slug);
}
