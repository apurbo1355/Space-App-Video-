import React from 'react';
import {Series} from 'remotion';
import {SCENES, SceneId} from './config';
import {Scene1} from './scenes/Scene1';
import {Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Scene6} from './scenes/Scene6';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {Scene1, Scene2, Scene3, Scene4, Scene5, Scene6};

/** The full 120 s explainer. Scene lengths come from SCENES in src/config.ts. */
export const AstraFlameVideo: React.FC = () => (
	<Series>
		{SCENES.map((s) => {
			const Scene = SCENE_COMPONENTS[s.id];
			return (
				<Series.Sequence key={s.id} durationInFrames={s.durationInFrames} name={`${s.id} · ${s.title}`}>
					<Scene />
				</Series.Sequence>
			);
		})}
	</Series>
);
