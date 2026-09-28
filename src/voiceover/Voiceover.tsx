import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {getScene, SceneId, VOICEOVER} from '../config';
import durations from './durations.json';

type DurationEntry = {seconds: number; hash: string};
const DURATIONS = durations as Record<string, DurationEntry>;

/**
 * Plays the synthesised narration for one scene. Each cue is its own
 * <Sequence> starting at the cue's `from` frame in src/config.ts, so the
 * voiceover follows any retiming done there.
 */
export const Voiceover: React.FC<{sceneId: SceneId}> = ({sceneId}) => {
	const {fps} = useVideoConfig();
	if (!VOICEOVER.enabled) return null;
	return (
		<>
			{getScene(sceneId).cues.map((cue) => {
				const entry = DURATIONS[cue.id];
				if (!entry) return null; // not synthesised yet — run `npm run voiceover`
				return (
					<Sequence
						key={cue.id}
						from={cue.from}
						durationInFrames={Math.ceil(entry.seconds * fps) + 3}
						name={`VO ${cue.id}`}
						layout="none"
					>
						<Audio src={staticFile(`voiceover/${cue.id}.wav`)} volume={VOICEOVER.volume} />
					</Sequence>
				);
			})}
		</>
	);
};
