/**
 * Atmosphere facts from the project fact sheet. These are the only
 * atmosphere numbers shown in the video.
 */
export const EARTH_AIR = {
	label: 'Earth · sea level',
	pressurePsia: 14.7,
	o2Pct: 21,
	/** ≈ 14.7 × 0.21 */
	ppO2Psia: 3.1,
} as const;

export const EXPLORATION_AIR = {
	label: "NASA's planned exploration atmosphere",
	pressurePsia: 8.2,
	o2Pct: 34,
	/** ≈ 8.2 × 0.34 */
	ppO2Psia: 2.8,
} as const;

export const SOURCES = {
	harper: 'NTRS 20160001047',
	harperTable: 'NTRS 20160001047 · Table 2',
	std6001: 'NASA-STD-6001 Test 1',
	bass: 'NASA BASS-II',
	olson: 'Olson · NASA Glenn',
} as const;
