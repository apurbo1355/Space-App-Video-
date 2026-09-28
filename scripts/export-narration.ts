/**
 * Prints every voiceover cue from src/config.ts as JSON so the Python TTS
 * script can read it. Usage: tsx scripts/export-narration.ts > .cache/narration.json
 */
import {FPS, SCENES, VOICEOVER} from '../src/config';

const out = {
	fps: FPS,
	voice: VOICEOVER.voice,
	speed: VOICEOVER.speed,
	cues: SCENES.flatMap((scene) =>
		scene.cues.map((c) => ({id: c.id, scene: scene.id, from: c.from, text: c.text, say: c.say ?? c.text})),
	),
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
