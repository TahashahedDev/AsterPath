export type IntakeOption = { value: string; label: string };

/**
 * The next four European intake windows from a given date: autumn (Sept–Oct) is
 * the main intake everywhere, spring (Feb–Mar) is offered by some programmes.
 * An intake less than six months away is labelled as late: applications, the
 * DOV and the visa rarely fit, so the student knows before choosing it.
 */
const LATE_WITHIN_MONTHS = 6;
export function upcomingIntakes(now: Date = new Date()): IntakeOption[] {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const nextSpring = month < 1 ? year : year + 1;
  const nextAutumn = month < 8 ? year : year + 1;

  const windows = [
    { season: "spring" as const, year: nextSpring },
    { season: "autumn" as const, year: nextAutumn },
    { season: "spring" as const, year: nextSpring + 1 },
    { season: "autumn" as const, year: nextAutumn + 1 },
  ].sort((a, b) => a.year - b.year || (a.season === "spring" ? -1 : 1));

  return [
    ...windows.map(({ season, year: y }) => {
      const monthsAway = (y - year) * 12 + (season === "autumn" ? 8 : 1) - month;
      const base = season === "autumn" ? `Autumn ${y} (September or October)` : `Spring ${y} (February or March)`;
      return { value: `${season}-${y}`, label: monthsAway < LATE_WITHIN_MONTHS ? `${base}, late: limited options` : base };
    }),
    { value: "undecided", label: "Not decided yet" },
  ];
}
