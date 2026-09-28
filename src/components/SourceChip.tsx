import React from 'react';
import {useCurrentFrame} from 'remotion';
import {fade} from '../anim';
import {COLOR, FONT} from '../theme';

export type ChipSpec = {label: string; from: number; until?: number};

export const SourceChip: React.FC<{label: string; opacity?: number}> = ({label, opacity = 1}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 12,
			fontFamily: FONT.mono,
			fontSize: 28,
			lineHeight: 1,
			color: COLOR.text,
			padding: '9px 16px 8px',
			borderRadius: 8,
			border: `1.5px solid rgba(56, 189, 248, 0.55)`,
			background: 'rgba(56, 189, 248, 0.07)',
			opacity,
			whiteSpace: 'nowrap',
		}}
	>
		<span style={{color: COLOR.cyan, letterSpacing: '0.08em'}}>SRC</span>
		<span>{label}</span>
	</div>
);

/** Source chips, always anchored bottom-left. */
export const SourceChips: React.FC<{chips: ChipSpec[]}> = ({chips}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{position: 'absolute', left: 80, bottom: 44, display: 'flex', gap: 16}}>
			{chips.map((c) => {
				const visible = frame >= c.from && (c.until === undefined || frame < c.until);
				if (!visible) return null;
				const o = fade(frame, c.from, 15) * (c.until === undefined ? 1 : Math.min(1, (c.until - frame) / 12));
				return <SourceChip key={c.label} label={c.label} opacity={o} />;
			})}
		</div>
	);
};
