import "server-only";
import { faqs } from "@/content/faqs";
import { afterGraduation, dovRules, dsuBasics, entranceTests, maeciScholarship, visaFunds, visaRules } from "@/content/italy/facts";
import { CONTENT_CHECKED_ON, sources, type SourceId } from "@/content/italy/sources";

/**
 * Approved knowledge the AI agents may answer from: the same sourced content the
 * public site publishes, nothing else. Each passage carries its official source
 * and the date AsterPath last checked it, so every answer can cite both.
 * No student records are ever included here.
 */
export type KnowledgePassage = { id: string; topic: string; text: string; sources: { label: string; url: string }[]; checkedOn: string };

const cite = (ids: SourceId[]) => ids.map((id) => ({ label: sources[id].label, url: sources[id].url }));
const ASTERPATH = [{ label: "AsterPath website FAQ", url: "/" }];

export const knowledgeBase: KnowledgePassage[] = [
  ...faqs.map((f, i) => ({ id: `faq-${i}`, topic: f.question, text: f.answer, sources: ASTERPATH, checkedOn: CONTENT_CHECKED_ON })),
  {
    id: "visa-funds",
    topic: "Italian study visa: proof of funds",
    text: `Minimum means of support for an Italian study visa: €${visaFunds.annualEur.toLocaleString("en-IN")} per academic year (${visaFunds.appliesTo}). ${visaFunds.note}`,
    sources: cite(visaFunds.sources),
    checkedOn: CONTENT_CHECKED_ON,
  },
  { id: "visa-rules", topic: "Italian study visa rules", text: visaRules.join(" "), sources: cite(["vistoPerItalia", "consulateKolkata"]), checkedOn: CONTENT_CHECKED_ON },
  { id: "dov", topic: "Declaration of Value (DOV), attestation, apostille, CIMEA", text: dovRules.points.join(" "), sources: cite(dovRules.sources), checkedOn: CONTENT_CHECKED_ON },
  { id: "dsu", topic: "DSU regional scholarships and ISEE parificato", text: `${dsuBasics.summary} ${dsuBasics.isee} ${dsuBasics.timing}`, sources: cite(["murDsu"]), checkedOn: CONTENT_CHECKED_ON },
  { id: "maeci", topic: "Italian government (MAECI) scholarship", text: maeciScholarship.summary, sources: cite([maeciScholarship.sourceId]), checkedOn: CONTENT_CHECKED_ON },
  ...entranceTests.map((t, i) => ({ id: `test-${i}`, topic: `Entrance tests: ${t.name}`, text: `${t.name} (${t.who}): ${t.body}`, sources: cite([t.sourceId]), checkedOn: CONTENT_CHECKED_ON })),
  { id: "after-graduation", topic: "After graduation in Italy: job-seeker permit", text: `${afterGraduation.summary} ${afterGraduation.note}`, sources: cite(["studyInItaly"]), checkedOn: CONTENT_CHECKED_ON },
];

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "for", "is", "do", "i", "my", "what", "how", "can", "you", "it", "on", "with", "are", "be", "me"]);
const terms = (text: string) => text.toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => t.length > 1 && !STOP.has(t)) ?? [];

/** Simple keyword retrieval — enough for a few dozen passages; swap for embeddings when the knowledge table ships. */
export function retrieve(question: string, limit = 4): KnowledgePassage[] {
  const q = new Set(terms(question));
  return knowledgeBase
    .map((p) => {
      const words = terms(`${p.topic} ${p.topic} ${p.text}`);
      return { p, score: words.reduce((n, w) => n + (q.has(w) ? 1 : 0), 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}
