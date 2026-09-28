import React from 'react';
import {Composition, Folder} from 'remotion';
import {AstraFlameVideo, SCENE_COMPONENTS} from './AstraFlameVideo';
import {FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH} from './config';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="AstraFlameVideo" component={AstraFlameVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
		<Folder name="Scenes">
			{SCENES.map((s) => (
				<Composition
					key={s.id}
					id={s.id}
					component={SCENE_COMPONENTS[s.id]}
					durationInFrames={s.durationInFrames}
					fps={FPS}
					width={WIDTH}
					height={HEIGHT}
				/>
			))}
		</Folder>
	</>
);
