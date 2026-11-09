/**
 * Official sources behind the Italy guidance on this site.
 * `checkedOn` is the date AsterPath last compared our text against the source.
 * Phase 7 moves these into the knowledge base with reviewer and version history.
 */

export type Source = { id: string; label: string; url: string; publisher: string };

export const CONTENT_CHECKED_ON = "2026-11-09";

/** Reviewer sign-off. Until a named team member verifies, pages say so. */
export const contentReview = {
  reviewedBy: null as string | null,
  status: "researched" as "researched" | "reviewed",
};

export const sources = {
  universitaly: { id: "universitaly", label: "Universitaly", url: "https://www.universitaly.it", publisher: "Italian Ministry of University and Research (MUR)" },
  studyInItaly: { id: "studyInItaly", label: "Study in Italy", url: "https://studyinitaly.esteri.it", publisher: "Italian Ministry of Foreign Affairs (MAECI)" },
  vistoPerItalia: { id: "vistoPerItalia", label: "Visto per l'Italia", url: "https://vistoperitalia.esteri.it", publisher: "Italian Ministry of Foreign Affairs (MAECI)" },
  cimea: { id: "cimea", label: "CIMEA", url: "https://www.cimea.it", publisher: "Italian ENIC-NARIC centre" },
  meaApostille: { id: "meaApostille", label: "MEA Apostille", url: "https://www.mea.gov.in/apostille-menu.htm", publisher: "Ministry of External Affairs, Government of India" },
  embassyDelhi: { id: "embassyDelhi", label: "Embassy of Italy, New Delhi", url: "https://ambnewdelhi.esteri.it", publisher: "MAECI" },
  consulateMumbai: { id: "consulateMumbai", label: "Consulate General of Italy, Mumbai", url: "https://consmumbai.esteri.it", publisher: "MAECI" },
  consulateBengaluru: { id: "consulateBengaluru", label: "Consulate General of Italy, Bengaluru", url: "https://consbangalore.esteri.it/en/", publisher: "MAECI" },
  consulateKolkata: { id: "consulateKolkata", label: "Consulate General of Italy, Kolkata", url: "https://conscalcutta.esteri.it", publisher: "MAECI" },
  uniItalia: { id: "uniItalia", label: "Uni-Italia", url: "https://uni-italia.it", publisher: "Uni-Italia (MAECI / MUR)" },
  mur: { id: "mur", label: "MUR", url: "https://www.mur.gov.it", publisher: "Italian Ministry of University and Research" },
  dovChecklistMumbai: {
    id: "dovChecklistMumbai",
    label: "DOV checklist for study 2026/27 (Mumbai)",
    url: "https://consmumbai.esteri.it/wp-content/uploads/2026/06/Checklist_dov_mumbai-for-study-purposes-2026-2027-vers-05-06-2026.pdf",
    publisher: "Consulate General of Italy, Mumbai (revised June 2026)",
  },
  visaChecklistBengaluru: {
    id: "visaChecklistBengaluru",
    label: "Study visa checklist 2026/27 and 2027/28 (Bengaluru)",
    url: "https://www.vfsglobal.com/one-pager/italy/india/bangalore/italian/pdf/Checklist-Study-C-and-D-2026-EN.pdf",
    publisher: "Consulate General of Italy, Bengaluru",
  },
  murDsu: {
    id: "murDsu",
    label: "MUR: right to study",
    url: "https://www.mur.gov.it/it/aree-tematiche/universita/studenti-diritto-allo-studio-e-residenze/iniziative-statali-tema-di",
    publisher: "Italian Ministry of University and Research",
  },
  iseeDocs: {
    id: "iseeDocs",
    label: "ISEE parificato documents 2026/27",
    url: "https://www.unive.it/pag/fileadmin/user_upload/ateneo/diritto-allo-studio/tasse/DOCUMENTS_REQUIRED_FOR_ISEE_PARIFICATO_2026_2027.pdf",
    publisher: "Ca' Foscari University of Venice",
  },
  cisia: {
    id: "cisia",
    label: "CISIA: CEnT-S",
    url: "https://www.cisiaonline.it/en/news/cent-s-new-unified-cisia-english-test",
    publisher: "CISIA, the Italian inter-university consortium for admission tests",
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof sources;
