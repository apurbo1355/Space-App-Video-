/**
 * Renders QA stills at the middle of every scene (plus a few key beats) into
 * out/stills/. Usage: npm run stills
 */
import fs from 'fs';
import path from 'path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {SCENES} from '../src/config';
import {browserExecutable, makeBundle} from './_bundle';

const extra: Record<string, number[]> = {
	Scene1: [120, 590],
	Scene2: [200, 330, 560],
	Scene3: [100, 240, 500],
	Scene4: [200, 460, 700],
	Scene5: [200, 480],
	Scene6: [380, 530],
};

const main = async () => {
	const serveUrl = await makeBundle();
	const outDir = path.join(process.cwd(), 'out/stills');
	fs.mkdirSync(outDir, {recursive: true});
	for (const scene of SCENES) {
		const composition = await selectComposition({serveUrl, id: scene.id, browserExecutable});
		const frames = [Math.floor(scene.durationInFrames / 2), ...(extra[scene.id] ?? [])];
		for (const frame of frames) {
			const output = path.join(outDir, `${scene.id}-f${String(frame).padStart(3, '0')}.png`);
			await renderStill({serveUrl, composition, frame, output, browserExecutable});
			console.log(output);
		}
	}
};

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
