/**
 * Italy's 20 regions with their DSU (student support) bodies and main public
 * universities. Keys are ISTAT region codes, matching the map data in
 * src/content/geo/italy-regions.json. Agency URLs were checked on 2026-11-09;
 * where an official address could not be confirmed, no link is shown.
 */

export type DsuBody = { name: string; url?: string; note?: string };

export type Region = {
  code: string;
  name: string;
  dsu: DsuBody[];
  universities: string[];
  cities: { name: string; coordinates: [lon: number, lat: number] }[];
};

export const regions: Region[] = [
  {
    code: "01",
    name: "Piemonte",
    dsu: [{ name: "EDISU Piemonte", url: "https://www.edisu.piemonte.it" }],
    universities: ["Politecnico di Torino", "University of Turin", "University of Eastern Piedmont"],
    cities: [{ name: "Turin", coordinates: [7.6869, 45.0703] }],
  },
  {
    code: "02",
    name: "Valle d'Aosta",
    dsu: [{ name: "Regione Autonoma Valle d'Aosta", note: "Student support is managed by the regional administration." }],
    universities: ["University of Aosta Valley"],
    cities: [],
  },
  {
    code: "03",
    name: "Lombardia",
    dsu: [{ name: "Managed by each university", note: "In Lombardy, every university runs its own DSU call." }],
    universities: ["Politecnico di Milano", "University of Milan", "University of Milano-Bicocca", "University of Pavia", "University of Bergamo", "University of Brescia"],
    cities: [
      { name: "Milan", coordinates: [9.19, 45.4642] },
      { name: "Pavia", coordinates: [9.1582, 45.1847] },
    ],
  },
  {
    code: "04",
    name: "Trentino-Alto Adige",
    dsu: [
      { name: "Opera Universitaria di Trento", url: "https://www.operauni.tn.it" },
      { name: "Autonomous Province of Bolzano", note: "Student support for Bolzano is managed by the province." },
    ],
    universities: ["University of Trento", "Free University of Bozen-Bolzano"],
    cities: [{ name: "Trento", coordinates: [11.1217, 46.0748] }],
  },
  {
    code: "05",
    name: "Veneto",
    dsu: [
      { name: "ESU Padova", url: "https://www.esu.pd.it" },
      { name: "ESU Venezia", url: "https://www.esuvenezia.it" },
      { name: "ESU Verona", url: "https://www.esu.vr.it" },
    ],
    universities: ["University of Padua", "Ca' Foscari University of Venice", "University of Verona", "IUAV University of Venice"],
    cities: [
      { name: "Padua", coordinates: [11.8768, 45.4064] },
      { name: "Venice", coordinates: [12.3155, 45.4408] },
      { name: "Verona", coordinates: [10.9916, 45.4384] },
    ],
  },
  {
    code: "06",
    name: "Friuli-Venezia Giulia",
    dsu: [{ name: "ARDiS", url: "https://www.ardis.fvg.it" }],
    universities: ["University of Trieste", "University of Udine", "SISSA Trieste"],
    cities: [{ name: "Trieste", coordinates: [13.7768, 45.6495] }],
  },
  {
    code: "07",
    name: "Liguria",
    dsu: [{ name: "ALiSEO", url: "https://www.aliseo.liguria.it" }],
    universities: ["University of Genoa"],
    cities: [{ name: "Genoa", coordinates: [8.9463, 44.4056] }],
  },
  {
    code: "08",
    name: "Emilia-Romagna",
    dsu: [{ name: "ER.GO", url: "https://www.er-go.it" }],
    universities: ["University of Bologna", "University of Modena and Reggio Emilia", "University of Parma", "University of Ferrara"],
    cities: [
      { name: "Bologna", coordinates: [11.3426, 44.4949] },
      { name: "Parma", coordinates: [10.3279, 44.8015] },
    ],
  },
  {
    code: "09",
    name: "Toscana",
    dsu: [{ name: "DSU Toscana", url: "https://www.dsu.toscana.it" }],
    universities: ["University of Pisa", "University of Florence", "University of Siena", "Scuola Superiore Sant'Anna", "Scuola Normale Superiore"],
    cities: [
      { name: "Florence", coordinates: [11.2558, 43.7696] },
      { name: "Pisa", coordinates: [10.4017, 43.7228] },
      { name: "Siena", coordinates: [11.3308, 43.3188] },
    ],
  },
  {
    code: "10",
    name: "Umbria",
    dsu: [{ name: "ADiSU Umbria", url: "https://www.adisu.umbria.it" }],
    universities: ["University of Perugia", "University for Foreigners of Perugia"],
    cities: [{ name: "Perugia", coordinates: [12.3908, 43.1107] }],
  },
  {
    code: "11",
    name: "Marche",
    dsu: [{ name: "ERDIS Marche", url: "https://erdis.it" }],
    universities: ["Marche Polytechnic University", "University of Camerino", "University of Macerata", "University of Urbino"],
    cities: [{ name: "Ancona", coordinates: [13.5189, 43.6158] }],
  },
  {
    code: "12",
    name: "Lazio",
    dsu: [{ name: "DiSCo Lazio", url: "https://laziodisco.it" }],
    universities: ["Sapienza University of Rome", "University of Rome Tor Vergata", "Roma Tre University", "University of Cassino"],
    cities: [{ name: "Rome", coordinates: [12.4964, 41.9028] }],
  },
  {
    code: "13",
    name: "Abruzzo",
    dsu: [
      { name: "ADSU L'Aquila", url: "https://adsuaq.org" },
      { name: "ADSU Teramo", url: "https://www.adsuteramo.it" },
      { name: "ADSU Chieti-Pescara" },
    ],
    universities: ["University of L'Aquila", "University of Chieti-Pescara", "University of Teramo"],
    cities: [{ name: "L'Aquila", coordinates: [13.3995, 42.3498] }],
  },
  {
    code: "14",
    name: "Molise",
    dsu: [{ name: "Regione Molise", url: "https://www.regione.molise.it", note: "Contact the University of Molise for the current DSU call." }],
    universities: ["University of Molise"],
    cities: [],
  },
  {
    code: "15",
    name: "Campania",
    dsu: [{ name: "ADISURC", url: "https://www.adisurcampania.it" }],
    universities: ["University of Naples Federico II", "University of Salerno", "University of Campania Luigi Vanvitelli", "University of Naples L'Orientale"],
    cities: [
      { name: "Naples", coordinates: [14.2681, 40.8518] },
      { name: "Salerno", coordinates: [14.7681, 40.6824] },
    ],
  },
  {
    code: "16",
    name: "Puglia",
    dsu: [{ name: "ADISU Puglia", url: "https://www.adisupuglia.it" }],
    universities: ["University of Bari", "Polytechnic University of Bari", "University of Salento", "University of Foggia"],
    cities: [{ name: "Bari", coordinates: [16.8719, 41.1171] }],
  },
  {
    code: "17",
    name: "Basilicata",
    dsu: [{ name: "ARDSU Basilicata", url: "https://www.ardsubasilicata.it" }],
    universities: ["University of Basilicata"],
    cities: [],
  },
  {
    code: "18",
    name: "Calabria",
    dsu: [{ name: "Managed by each university", note: "Calabrian universities run their own student support services." }],
    universities: ["University of Calabria", "Magna Græcia University of Catanzaro", "Mediterranean University of Reggio Calabria"],
    cities: [{ name: "Cosenza", coordinates: [16.2508, 39.3008] }],
  },
  {
    code: "19",
    name: "Sicilia",
    dsu: [
      { name: "ERSU Palermo", url: "https://www.ersupalermo.it" },
      { name: "ERSU Catania", url: "https://www.ersucatania.it" },
      { name: "ERSU Messina", url: "https://www.ersumessina.it" },
    ],
    universities: ["University of Palermo", "University of Catania", "University of Messina"],
    cities: [
      { name: "Palermo", coordinates: [13.3615, 38.1157] },
      { name: "Catania", coordinates: [15.0873, 37.5079] },
    ],
  },
  {
    code: "20",
    name: "Sardegna",
    dsu: [
      { name: "ERSU Cagliari", url: "https://www.ersucagliari.it" },
      { name: "ERSU Sassari", url: "https://ersusassari.it" },
    ],
    universities: ["University of Cagliari", "University of Sassari"],
    cities: [{ name: "Cagliari", coordinates: [9.1217, 39.2238] }],
  },
];
