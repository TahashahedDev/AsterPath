import type { Metadata } from "next";
import { dsu2026, dsuBasics, iseeDocuments, maeciScholarship } from "@/content/italy/facts";
import { regions } from "@/content/italy/regions";
import { universities } from "@/content/italy/universities";
import { buildItalyRegionMap } from "@/lib/geo";
import { RegionExplorer } from "@/components/maps/region-explorer";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { ReviewStatus, SourceNote } from "@/components/marketing/cards";

export const metadata: Metadata = {
  title: "Scholarships in Italy for Indian students",
  description: "How regional DSU scholarships work, the 2026/27 amounts and income limits, the ISEE parificato documents an Indian family needs, and government and university awards.",
  alternates: { canonical: "/scholarships" },
};

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

const covers = [
  { title: "A yearly grant", body: "Paid in instalments through the year, higher if you live away from home." },
  { title: "Student housing", body: "A place in a regional residence, where the region has them." },
  { title: "Meals", body: "Free or reduced-price meals at university canteens." },
  { title: "A tuition waiver", body: "Exemption from university contributions in most cases." },
];

const ourWork = [
  { title: "Plan the reference year", body: "We list every family document for the year the call asks about, before your offer arrives." },
  { title: "Collect the certificates", body: "Income, property, bank balances and family composition, issued by the right Indian authority." },
  { title: "Apostille and translate", body: "Each document is apostilled, then translated into Italian by a certified translator." },
  { title: "File the ISEE parificato", body: "Through an authorised assistance centre (CAF) or the university, with the delegation form signed." },
  { title: "Apply to the region", body: "The DSU application goes to the office serving your university's region, before its deadline." },
  { title: "Keep it next year", body: "Renewal depends on credits earned; we tell you the number to reach in your first year." },
];

export default function ScholarshipsPage() {
  const map = buildItalyRegionMap();
  return (
    <>
      <PageHero
        eyebrow="Regional scholarships"
        title={
          <>
            Scholarships that <span className="display-italic text-primary">can pay for Italy.</span>
          </>
        }
        description={dsuBasics.summary}>
        <ReviewStatus />
      </PageHero>

      {/* Figures: the Ministry's own numbers */}
      <section className="field section" aria-labelledby="amounts-title">
        <div className="page-container">
          <h2 id="amounts-title" className="max-w-[20ch]">
            The minimum grant for {dsu2026.year}.
          </h2>
          <dl className="cols mt-[var(--space-2xl)] gap-y-10">
            {dsu2026.amounts.map((a) => (
              <div key={a.label} className="col-span-4">
                <dt className="label">{a.label}</dt>
                <dd className="figure-xl mt-2 text-[clamp(2.75rem,5.5vw,4.75rem)]">{eur.format(a.eur)}</dd>
              </div>
            ))}
          </dl>
          <p className="lead mt-[var(--space-2xl)] max-w-[60ch]">
            To qualify, the family&rsquo;s ISEE must be under {eur.format(dsu2026.iseeLimitEur)} and its ISPE under {eur.format(dsu2026.ispeLimitEur)}. These are
            national minimums and limits; each region sets its own bands and may pay more.
          </p>
          <SourceNote ids={dsu2026.sources} className="mt-6 text-field-ink" />
        </div>
      </section>

      <section className="section" aria-labelledby="covers-title">
        <div className="page-container cols gap-y-10">
          <h2 id="covers-title" className="col-span-12">
            What a DSU scholarship can cover
          </h2>
          {covers.map((c) => (
            <div key={c.title} className="card col-span-3">
              <h3>{c.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-2">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="where-title">
        <div className="page-container">
          <div className="cols items-end">
            <h2 id="where-title" className="col-span-6">
              Who runs support where
            </h2>
            <p className="lead col-span-5 col-start-8 text-ink-2">You apply to the office serving your university&rsquo;s region, not the region you live in.</p>
          </div>
          <div className="mt-[var(--space-2xl)]">
            <RegionExplorer map={map} regions={regions} universities={universities} />
          </div>
          <p className="mt-8 text-sm text-muted">Map boundaries: ISTAT, via openpolis (CC BY 4.0). Office links checked against their official websites.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="isee-title">
        <div className="page-container cols">
          <div className="col-span-4">
            <h2 id="isee-title">The ISEE parificato, for an Indian family</h2>
            <p className="lead mt-5 text-ink-2">{iseeDocuments.rule}</p>
            <p className="mt-4 text-ink-2">{iseeDocuments.referenceYear}</p>
          </div>
          <ul className="rows col-span-8">
            {iseeDocuments.items.map((d) => (
              <li key={d.title} className="grid gap-2 py-6 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-8">
                <h3 className="text-[1.25rem]">{d.title}</h3>
                <p className="leading-relaxed text-ink-2">{d.body}</p>
              </li>
            ))}
          </ul>
          <SourceNote ids={[iseeDocuments.sourceId]} className="col-span-8 col-start-5 mt-6" />
        </div>
      </section>

      <section className="section" aria-labelledby="work-title">
        <div className="page-container">
          <h2 id="work-title" className="max-w-[18ch]">
            How we handle the paperwork
          </h2>
          <ol className="cols mt-[var(--space-2xl)] gap-y-12">
            {ourWork.map((s, i) => (
              <li key={s.title} className="card col-span-4">
                <span className="figure-xl block text-[clamp(2.75rem,4.5vw,4rem)] text-accent">{i + 1}</span>
                <h3 className="mt-3">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-[var(--space-xl)] max-w-[60ch] text-ink-2">{dsuBasics.timing} The translations and legalisation for your ISEE are inside the AsterPath plan.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="other-title">
        <div className="page-container cols gap-y-10">
          <h2 id="other-title" className="col-span-4">
            Other awards
          </h2>
          <div className="col-span-4">
            <h3>Italian government</h3>
            <p className="mt-2 leading-relaxed text-ink-2">{maeciScholarship.summary}</p>
          </div>
          <div className="col-span-4">
            <h3>Universities</h3>
            <p className="mt-2 leading-relaxed text-ink-2">Many universities offer merit awards and fee reductions for international students, each with its own call and deadline.</p>
          </div>
        </div>
      </section>

      <CtaSection title="See what you could receive." description="We check your family's documents against the calls for your universities' regions and plan the ISEE parificato in time." />
    </>
  );
}
