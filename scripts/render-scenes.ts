/**
 * Renders each scene composition (with its voiceover) to out/scenes/<SceneN>.mp4.
 * Usage: npm run render:scenes            (all scenes)
 *        npm run render:scenes -- Scene4  (only the named scenes)
 */
import fs from 'fs';
import path from 'path';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {SCENES} from '../src/config';
import {browserExecutable, makeBundle} from './_bundle';

const main = async () => {
	const serveUrl = await makeBundle();
	const outDir = path.join(process.cwd(), 'out/scenes');
	fs.mkdirSync(outDir, {recursive: true});
	const only = process.argv.slice(2);
	for (const scene of SCENES.filter((s) => only.length === 0 || only.includes(s.id))) {
		const composition = await selectComposition({serveUrl, id: scene.id, browserExecutable});
		const outputLocation = path.join(outDir, `${scene.id}.mp4`);
		await renderMedia({
			serveUrl,
			composition,
			codec: 'h264',
			crf: 20,
			imageFormat: 'jpeg',
			jpegQuality: 92,
			outputLocation,
			browserExecutable,
			onProgress: ({progress}) => process.stdout.write(`\r${scene.id} ${(progress * 100).toFixed(0)}%   `),
		});
		console.log(`\n${outputLocation}`);
	}
};

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
