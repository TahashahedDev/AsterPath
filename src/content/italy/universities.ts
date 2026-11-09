/**
 * Italian state universities, polytechnics and state higher-education schools.
 * Official websites checked on 2026-11-09 (every URL returned HTTP 200).
 * Programmes, languages and deadlines change every year, so we link to each
 * university rather than restating its catalogue.
 */

export type UniversityKind = "university" | "polytechnic" | "school" | "foreigners";

export type University = {
  slug: string;
  name: string;
  city: string;
  regionCode: string;
  kind: UniversityKind;
  url: string;
};

export const universityKindLabel: Record<UniversityKind, string> = {
  university: "Public university",
  polytechnic: "Polytechnic",
  school: "Higher school (graduate and PhD focus)",
  foreigners: "University for foreigners",
};

export const universities: University[] = [
  // Piemonte
  { slug: "politecnico-di-torino", name: "Politecnico di Torino", city: "Turin", regionCode: "01", kind: "polytechnic", url: "https://www.polito.it" },
  { slug: "university-of-turin", name: "University of Turin", city: "Turin", regionCode: "01", kind: "university", url: "https://www.unito.it" },
  { slug: "university-of-eastern-piedmont", name: "University of Eastern Piedmont", city: "Vercelli", regionCode: "01", kind: "university", url: "https://www.uniupo.it" },
  // Valle d'Aosta
  { slug: "university-of-aosta-valley", name: "University of Aosta Valley", city: "Aosta", regionCode: "02", kind: "university", url: "https://www.univda.it" },
  // Lombardia
  { slug: "politecnico-di-milano", name: "Politecnico di Milano", city: "Milan", regionCode: "03", kind: "polytechnic", url: "https://www.polimi.it" },
  { slug: "university-of-milan", name: "University of Milan", city: "Milan", regionCode: "03", kind: "university", url: "https://www.unimi.it" },
  { slug: "university-of-milano-bicocca", name: "University of Milano-Bicocca", city: "Milan", regionCode: "03", kind: "university", url: "https://www.unimib.it" },
  { slug: "university-of-pavia", name: "University of Pavia", city: "Pavia", regionCode: "03", kind: "university", url: "https://portale.unipv.it" },
  { slug: "university-of-bergamo", name: "University of Bergamo", city: "Bergamo", regionCode: "03", kind: "university", url: "https://www.unibg.it" },
  { slug: "university-of-brescia", name: "University of Brescia", city: "Brescia", regionCode: "03", kind: "university", url: "https://www.unibs.it" },
  { slug: "university-of-insubria", name: "University of Insubria", city: "Varese", regionCode: "03", kind: "university", url: "https://www.uninsubria.it" },
  // Trentino-Alto Adige
  { slug: "university-of-trento", name: "University of Trento", city: "Trento", regionCode: "04", kind: "university", url: "https://www.unitn.it" },
  { slug: "free-university-of-bozen-bolzano", name: "Free University of Bozen-Bolzano", city: "Bolzano", regionCode: "04", kind: "university", url: "https://www.unibz.it" },
  // Veneto
  { slug: "university-of-padua", name: "University of Padua", city: "Padua", regionCode: "05", kind: "university", url: "https://www.unipd.it" },
  { slug: "ca-foscari-university-of-venice", name: "Ca' Foscari University of Venice", city: "Venice", regionCode: "05", kind: "university", url: "https://www.unive.it" },
  { slug: "university-of-verona", name: "University of Verona", city: "Verona", regionCode: "05", kind: "university", url: "https://www.univr.it" },
  { slug: "iuav-university-of-venice", name: "Iuav University of Venice", city: "Venice", regionCode: "05", kind: "university", url: "https://www.iuav.it" },
  // Friuli-Venezia Giulia
  { slug: "university-of-trieste", name: "University of Trieste", city: "Trieste", regionCode: "06", kind: "university", url: "https://www.units.it" },
  { slug: "university-of-udine", name: "University of Udine", city: "Udine", regionCode: "06", kind: "university", url: "https://www.uniud.it" },
  { slug: "sissa-trieste", name: "SISSA, International School for Advanced Studies", city: "Trieste", regionCode: "06", kind: "school", url: "https://www.sissa.it" },
  // Liguria
  { slug: "university-of-genoa", name: "University of Genoa", city: "Genoa", regionCode: "07", kind: "university", url: "https://unige.it" },
  // Emilia-Romagna
  { slug: "university-of-bologna", name: "University of Bologna", city: "Bologna", regionCode: "08", kind: "university", url: "https://www.unibo.it" },
  { slug: "university-of-modena-and-reggio-emilia", name: "University of Modena and Reggio Emilia", city: "Modena", regionCode: "08", kind: "university", url: "https://www.unimore.it" },
  { slug: "university-of-parma", name: "University of Parma", city: "Parma", regionCode: "08", kind: "university", url: "https://www.unipr.it" },
  { slug: "university-of-ferrara", name: "University of Ferrara", city: "Ferrara", regionCode: "08", kind: "university", url: "https://www.unife.it" },
  // Toscana
  { slug: "university-of-pisa", name: "University of Pisa", city: "Pisa", regionCode: "09", kind: "university", url: "https://www.unipi.it" },
  { slug: "university-of-florence", name: "University of Florence", city: "Florence", regionCode: "09", kind: "university", url: "https://www.unifi.it" },
  { slug: "university-of-siena", name: "University of Siena", city: "Siena", regionCode: "09", kind: "university", url: "https://www.unisi.it" },
  { slug: "scuola-superiore-santanna", name: "Scuola Superiore Sant'Anna", city: "Pisa", regionCode: "09", kind: "school", url: "https://www.santannapisa.it" },
  { slug: "scuola-normale-superiore", name: "Scuola Normale Superiore", city: "Pisa", regionCode: "09", kind: "school", url: "https://www.sns.it" },
  { slug: "imt-school-lucca", name: "IMT School for Advanced Studies Lucca", city: "Lucca", regionCode: "09", kind: "school", url: "https://www.imtlucca.it" },
  // Umbria
  { slug: "university-of-perugia", name: "University of Perugia", city: "Perugia", regionCode: "10", kind: "university", url: "https://www.unipg.it" },
  { slug: "university-for-foreigners-of-perugia", name: "University for Foreigners of Perugia", city: "Perugia", regionCode: "10", kind: "foreigners", url: "https://www.unistrapg.it" },
  // Marche
  { slug: "marche-polytechnic-university", name: "Marche Polytechnic University", city: "Ancona", regionCode: "11", kind: "polytechnic", url: "https://www.univpm.it" },
  { slug: "university-of-camerino", name: "University of Camerino", city: "Camerino", regionCode: "11", kind: "university", url: "https://www.unicam.it" },
  { slug: "university-of-macerata", name: "University of Macerata", city: "Macerata", regionCode: "11", kind: "university", url: "https://www.unimc.it" },
  { slug: "university-of-urbino", name: "University of Urbino Carlo Bo", city: "Urbino", regionCode: "11", kind: "university", url: "https://www.uniurb.it" },
  // Lazio
  { slug: "sapienza-university-of-rome", name: "Sapienza University of Rome", city: "Rome", regionCode: "12", kind: "university", url: "https://www.uniroma1.it" },
  { slug: "university-of-rome-tor-vergata", name: "University of Rome Tor Vergata", city: "Rome", regionCode: "12", kind: "university", url: "https://web.uniroma2.it" },
  { slug: "roma-tre-university", name: "Roma Tre University", city: "Rome", regionCode: "12", kind: "university", url: "https://www.uniroma3.it" },
  { slug: "university-of-cassino", name: "University of Cassino and Southern Lazio", city: "Cassino", regionCode: "12", kind: "university", url: "https://www.unicas.it" },
  { slug: "university-of-tuscia", name: "University of Tuscia", city: "Viterbo", regionCode: "12", kind: "university", url: "https://www.unitus.it" },
  // Abruzzo
  { slug: "university-of-laquila", name: "University of L'Aquila", city: "L'Aquila", regionCode: "13", kind: "university", url: "https://www.univaq.it" },
  { slug: "university-of-chieti-pescara", name: "University of Chieti-Pescara", city: "Chieti", regionCode: "13", kind: "university", url: "https://www.unich.it" },
  { slug: "university-of-teramo", name: "University of Teramo", city: "Teramo", regionCode: "13", kind: "university", url: "https://www.unite.it" },
  // Molise
  { slug: "university-of-molise", name: "University of Molise", city: "Campobasso", regionCode: "14", kind: "university", url: "https://www.unimol.it" },
  // Campania
  { slug: "university-of-naples-federico-ii", name: "University of Naples Federico II", city: "Naples", regionCode: "15", kind: "university", url: "https://www.unina.it" },
  { slug: "university-of-salerno", name: "University of Salerno", city: "Salerno", regionCode: "15", kind: "university", url: "https://www.unisa.it" },
  { slug: "university-of-campania-luigi-vanvitelli", name: "University of Campania Luigi Vanvitelli", city: "Caserta", regionCode: "15", kind: "university", url: "https://www.unicampania.it" },
  { slug: "university-of-naples-lorientale", name: "University of Naples L'Orientale", city: "Naples", regionCode: "15", kind: "university", url: "https://www.unior.it" },
  { slug: "university-of-naples-parthenope", name: "University of Naples Parthenope", city: "Naples", regionCode: "15", kind: "university", url: "https://www.uniparthenope.it" },
  // Puglia
  { slug: "university-of-bari", name: "University of Bari Aldo Moro", city: "Bari", regionCode: "16", kind: "university", url: "https://www.uniba.it" },
  { slug: "polytechnic-university-of-bari", name: "Polytechnic University of Bari", city: "Bari", regionCode: "16", kind: "polytechnic", url: "https://www.poliba.it" },
  { slug: "university-of-salento", name: "University of Salento", city: "Lecce", regionCode: "16", kind: "university", url: "https://www.unisalento.it" },
  { slug: "university-of-foggia", name: "University of Foggia", city: "Foggia", regionCode: "16", kind: "university", url: "https://www.unifg.it" },
  // Basilicata
  { slug: "university-of-basilicata", name: "University of Basilicata", city: "Potenza", regionCode: "17", kind: "university", url: "https://portale.unibas.it" },
  // Calabria
  { slug: "university-of-calabria", name: "University of Calabria", city: "Rende", regionCode: "18", kind: "university", url: "https://www.unical.it" },
  { slug: "magna-graecia-university-of-catanzaro", name: "Magna Græcia University of Catanzaro", city: "Catanzaro", regionCode: "18", kind: "university", url: "https://web.unicz.it" },
  { slug: "mediterranean-university-of-reggio-calabria", name: "Mediterranean University of Reggio Calabria", city: "Reggio Calabria", regionCode: "18", kind: "university", url: "https://www.unirc.it" },
  // Sicilia
  { slug: "university-of-palermo", name: "University of Palermo", city: "Palermo", regionCode: "19", kind: "university", url: "https://www.unipa.it" },
  { slug: "university-of-catania", name: "University of Catania", city: "Catania", regionCode: "19", kind: "university", url: "https://www.unict.it" },
  { slug: "university-of-messina", name: "University of Messina", city: "Messina", regionCode: "19", kind: "university", url: "https://www.unime.it" },
  // Sardegna
  { slug: "university-of-cagliari", name: "University of Cagliari", city: "Cagliari", regionCode: "20", kind: "university", url: "https://www.unica.it" },
  { slug: "university-of-sassari", name: "University of Sassari", city: "Sassari", regionCode: "20", kind: "university", url: "https://www.uniss.it" },
];

export function getUniversity(slug: string): University | undefined {
  return universities.find((u) => u.slug === slug);
}

export function universitiesInRegion(regionCode: string): University[] {
  return universities.filter((u) => u.regionCode === regionCode);
}
