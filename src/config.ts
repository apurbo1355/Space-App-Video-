/**
 * AstraFlame explainer — single source of truth for timing.
 *
 * Every scene duration and every voiceover cue lives here. The full
 * composition (AstraFlameVideo) and each per-scene composition read their
 * timings from this file, and each scene anchors its on-screen beats to the
 * `from` frame of its voiceover cues. To retime:
 *
 *   1. Edit `durationInFrames` and/or a cue's `from` below.
 *   2. If you change a cue's words, run `npm run voiceover` to re-synthesise
 *      the narration and re-check that no cue overruns the next one.
 *   3. `npm run check-sync` prints the timing table on its own.
 *
 * Frames are at FPS (30). Cue `from` values are relative to the scene start.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Minimum on-screen time for any text card (3 s). */
export const MIN_TEXT_FRAMES = 3 * FPS;

export type SceneId = 'Scene1' | 'Scene2' | 'Scene3' | 'Scene4' | 'Scene5' | 'Scene6';

export type Cue = {
	/** Stable id; also the audio file name: public/voiceover/<id>.wav */
	id: string;
	/** Start frame, relative to the start of the scene. */
	from: number;
	/** What the narrator says (as written for the audience). */
	text: string;
	/** Optional pronunciation override sent to the TTS engine instead of `text`. */
	say?: string;
};

export type SceneConfig = {
	id: SceneId;
	title: string;
	durationInFrames: number;
	cues: Cue[];
};

export const SCENES: SceneConfig[] = [
	{
		id: 'Scene1',
		title: 'The Air Is Changing',
		durationInFrames: 600, // 0–20 s
		cues: [
			{
				id: 's1a',
				from: 15,
				text: "NASA's planned exploration atmosphere is meant for future vehicles and habitats.",
			},
			{
				id: 's1b',
				from: 195,
				text: 'Compared with Earth air, it has less pressure and a higher oxygen percentage, but about the same oxygen to breathe.',
			},
			{
				id: 's1c',
				from: 440,
				text: 'And NASA tests show that oxygen percentage drives flammability.',
			},
		],
	},
	{
		id: 'Scene2',
		title: 'Fire Without Up',
		durationInFrames: 660, // 20–42 s
		cues: [
			{
				id: 's2a',
				from: 15,
				text: 'On Earth, hot air rises, stretching flames into flickering teardrops.',
			},
			{
				id: 's2b',
				from: 155,
				text: 'In microgravity nothing rises. Flames turn rounder, dimmer and slower, yet survive in very weak airflow.',
			},
			{
				id: 's2c',
				from: 380,
				text: 'For thin fuels, too little airflow starves a flame, too much blows it out, and in between is most flammable.',
			},
		],
	},
	{
		id: 'Scene3',
		title: 'From Buried Reports to One Table',
		durationInFrames: 540, // 42–60 s
		cues: [
			{
				id: 's3a',
				from: 15,
				text: 'The test data exists, but it is scattered across NASA technical reports.',
			},
			{
				id: 's3b',
				from: 165,
				text: 'AstraFlame gathers it into one table, where every value cites its source.',
			},
			{
				id: 's3c',
				from: 330,
				text: 'AI reads, matches and explains. It never makes the safety call. That is simple, checkable math.',
			},
		],
	},
	{
		id: 'Scene4',
		title: 'Fire Margin Gauges',
		durationInFrames: 750, // 60–85 s
		cues: [
			{
				id: 's4a',
				from: 15,
				text: "Our core metric is the fire margin: a material's maximum oxygen concentration, minus the cabin oxygen percentage.",
			},
			{
				id: 's4b',
				from: 265,
				text: 'As the cabin moves from Earth air to the exploration atmosphere, margins shrink. At zero or below, a gauge enters the burn zone.',
			},
			{
				id: 's4c',
				from: 555,
				text: 'Every value opens its evidence: the report, the table, and whether it has been checked.',
			},
		],
	},
	{
		id: 'Scene5',
		title: 'Live Hardware Bridge',
		durationInFrames: 510, // 85–102 s
		cues: [
			{
				id: 's5a',
				from: 15,
				text: 'An ESP32 reads pressure and temperature, sets the fan airflow, and uses a smoke sensor as an alarm only.',
				say: 'An E S P thirty-two reads pressure and temperature, sets the fan airflow, and uses a smoke sensor as an alarm only.',
			},
			{
				id: 's5b',
				from: 290,
				text: 'Readings stream over USB as JSON, straight into the dashboard.',
				say: 'Readings stream over U S B as Jason, straight into the dashboard.',
			},
		],
	},
	{
		id: 'Scene6',
		title: 'Honest Limits',
		durationInFrames: 540, // 102–120 s
		cues: [
			{
				id: 's6a',
				from: 8,
				text: 'Our limits come from Earth tests, so real margins in microgravity may be smaller.',
			},
			{
				id: 's6b',
				from: 165,
				text: "NASA's lunar fire experiment hasn't reported yet, so the Moon shows no data.",
			},
			{
				id: 's6c',
				from: 318,
				text: 'Every number traces to a NASA report page.',
			},
			{
				id: 's6d',
				from: 410,
				text: 'AstraFlame. Test the habitat before the flame tests the crew.',
				say: 'Astra Flame. Test the habitat, before the flame tests the crew.',
			},
		],
	},
];

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);

export const getScene = (id: SceneId): SceneConfig => {
	const scene = SCENES.find((s) => s.id === id);
	if (!scene) throw new Error(`Unknown scene ${id}`);
	return scene;
};

/** Start frame (relative to its scene) of a voiceover cue. Scenes use this to anchor visual beats. */
export const cueFrom = (sceneId: SceneId, cueId: string): number => {
	const cue = getScene(sceneId).cues.find((c) => c.id === cueId);
	if (!cue) throw new Error(`Unknown cue ${cueId} in ${sceneId}`);
	return cue.from;
};

/** Start frame of a scene inside the full composition. */
export const sceneStart = (id: SceneId): number => {
	let start = 0;
	for (const s of SCENES) {
		if (s.id === id) return start;
		start += s.durationInFrames;
	}
	throw new Error(`Unknown scene ${id}`);
};

// ---------------------------------------------------------------------------
// Voiceover
// ---------------------------------------------------------------------------

export const VOICEOVER = {
	/** Set false to render silent picture only. */
	enabled: true,
	/** Kokoro-82M voice id used by scripts/generate_voiceover.py. */
	voice: 'af_heart',
	speed: 1.0,
	/** Narration level, 0–1. */
	volume: 1,
};

// ---------------------------------------------------------------------------
// Telemetry (Scene 5)
// ---------------------------------------------------------------------------

/**
 * When true AND src/data/telemetry.csv contains data rows
 * (columns: t_s, pressure_psia, fan_pct, smoke_raw), Scene 5 plots the
 * recorded data and drops the "ILLUSTRATIVE DATA" badge.
 * Otherwise it plots a clearly-badged illustrative waveform.
 */
export const USE_RECORDED_TELEMETRY = false;
