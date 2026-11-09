export type IntakeOption = { value: string; label: string };

/**
 * The next four European intake windows from a given date: autumn (Sept–Oct) is
 * the main intake everywhere, spring (Feb–Mar) is offered by some programmes.
 */
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
    ...windows.map(({ season, year: y }) => ({
      value: `${season}-${y}`,
      label: season === "autumn" ? `Autumn ${y} (September or October)` : `Spring ${y} (February or March)`,
    })),
    { value: "undecided", label: "Not decided yet" },
  ];
}
