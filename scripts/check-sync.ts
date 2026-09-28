/**
 * Verifies that every voiceover cue finishes before the next cue starts and
 * before its scene ends, using the durations measured by generate_voiceover.py.
 * Exits non-zero on any overlap so retiming mistakes are caught before render.
 */
import {FPS, SCENES, TOTAL_FRAMES} from '../src/config';
import durations from '../src/voiceover/durations.json';

const D = durations as Record<string, {seconds: number}>;
const GAP = 6; // frames of breathing room required between cues
let ok = true;
let start = 0;
const rows: string[] = [];
for (const scene of SCENES) {
	scene.cues.forEach((cue, i) => {
		const d = D[cue.id];
		const next = scene.cues[i + 1]?.from ?? scene.durationInFrames;
		if (!d) {
			rows.push(`${scene.id} ${cue.id}  MISSING AUDIO — run npm run voiceover`);
			ok = false;
			return;
		}
		const end = cue.from + Math.ceil(d.seconds * FPS);
		const slack = next - GAP - end;
		const status = slack >= 0 ? 'ok' : 'OVERLAP';
		if (slack < 0) ok = false;
		rows.push(
			`${scene.id} ${cue.id.padEnd(4)} ${String(cue.from).padStart(4)} → ${String(end).padStart(4)}  (abs ${((start + cue.from) / FPS).toFixed(1).padStart(5)}s–${((start + end) / FPS).toFixed(1).padStart(5)}s)  limit ${String(next).padStart(4)}  slack ${String(slack).padStart(4)}f  ${status}`,
		);
	});
	start += scene.durationInFrames;
}
console.log(rows.join('\n'));
console.log(`Total: ${TOTAL_FRAMES} frames = ${TOTAL_FRAMES / FPS}s`);
if (TOTAL_FRAMES !== 3600) console.warn('Warning: total is not 3600 frames (120 s).');
if (!ok) {
	console.error('Voiceover sync check FAILED — adjust cue `from` values or durations in src/config.ts.');
	process.exit(1);
}
console.log('Voiceover sync check passed.');
