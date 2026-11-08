/**
 * Pure milestone arithmetic. Amounts are whole rupees (integers) so totals never
 * drift through floating-point rounding. Phase 6 will switch to paise once real
 * payments are recorded, matching Razorpay's smallest-unit convention.
 */

export type Milestone = { label: string; amount: number };

export function milestoneTotal(milestones: readonly Milestone[]): number {
  return milestones.reduce((sum, milestone) => {
    if (!Number.isInteger(milestone.amount) || milestone.amount <= 0) {
      throw new RangeError(`Milestone "${milestone.label}" must have a positive whole-rupee amount`);
    }
    return sum + milestone.amount;
  }, 0);
}

export type ScheduleCheck = { ok: true } | { ok: false; difference: number };

/** Confirms a schedule adds up exactly to the package price. */
export function checkSchedule(milestones: readonly Milestone[], packagePrice: number): ScheduleCheck {
  const difference = packagePrice - milestoneTotal(milestones);
  return difference === 0 ? { ok: true } : { ok: false, difference };
}

/** Share of the total for each milestone, as whole percentages that always sum to 100. */
export function milestoneShares(milestones: readonly Milestone[]): number[] {
  const total = milestoneTotal(milestones);
  if (total === 0) return [];
  const raw = milestones.map((m) => (m.amount / total) * 100);
  const floored = raw.map(Math.floor);
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  // Largest-remainder method so displayed percentages add up to exactly 100.
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { index } of order) {
    if (remainder <= 0) break;
    floored[index] = (floored[index] ?? 0) + 1;
    remainder -= 1;
  }
  return floored;
}
