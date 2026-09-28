/**
 * Material flammability limits used in the video.
 *
 * MOC = Maximum Oxygen Concentration: the highest oxygen % at which the
 * material always puts itself out in NASA-STD-6001 Test 1 (upward flame
 * propagation; pass = self-extinguishes within 15 cm).
 *
 * PROVISIONAL: every value below was transcribed from
 * Harper et al., NASA White Sands Test Facility, NTRS 20160001047, Table 2,
 * and has NOT yet been checked against the PDF. When a team member verifies
 * a value, fill in `sourcePage` and flip `verified` to true. Any value with
 * verified === false is rendered with an amber "PROVISIONAL" tag.
 */

export type MocPoint = {
	/** Total pressure at which the MOC was measured, psia. */
	testedPressurePsia: number;
	/** Maximum oxygen concentration, % O2 by volume. */
	mocPct: number;
	/** Page in the source PDF; null until verified. */
	sourcePage: number | null;
	verified: boolean;
};

export type Material = {
	id: string;
	name: string;
	points: MocPoint[];
};

export const SOURCE = {
	authors: 'Harper et al.',
	facility: 'NASA White Sands Test Facility',
	ntrsId: '20160001047',
	table: 'Table 2',
} as const;

const p = (testedPressurePsia: number, mocPct: number): MocPoint => ({
	testedPressurePsia,
	mocPct,
	sourcePage: null,
	verified: false,
});

export const MATERIALS: Material[] = [
	{id: 'ptfe', name: 'PTFE (Teflon)', points: [p(7, 53), p(14.7, 42)]},
	{id: 'silicone', name: 'Silicone rubber', points: [p(7, 28), p(14.7, 21)]},
	{id: 'nomex', name: 'Nomex HT90-40', points: [p(10.2, 37), p(14.7, 31.5)]},
	{id: 'kydex', name: 'Kydex 100', points: [p(10.2, 32)]},
	{id: 'ultem', name: 'Ultem 1000', points: [p(10.2, 24)]},
	{id: 'delrin', name: 'Delrin', points: [p(7, 13), p(14.7, 11)]},
];

/**
 * The MOC measured at the tested pressure nearest to the cabin pressure.
 * (Harper found MOC changes little with pressure above ~6 psia for most
 * materials, but the tested pressure is always displayed.)
 */
export const nearestPoint = (m: Material, cabinPsia: number): MocPoint =>
	m.points.reduce((best, pt) =>
		Math.abs(pt.testedPressurePsia - cabinPsia) < Math.abs(best.testedPressurePsia - cabinPsia) ? pt : best,
	);

/** Fire margin = MOC − cabin O2 %. Positive: self-extinguishes. ≤ 0: burn zone. */
export const fireMargin = (mocPct: number, cabinO2Pct: number): number => mocPct - cabinO2Pct;

export const formatPsia = (v: number): string => (Number.isInteger(v) ? `${v}` : v.toFixed(1));
export const formatPct = (v: number): string => (Number.isInteger(v) ? `${v}` : v.toFixed(1));
