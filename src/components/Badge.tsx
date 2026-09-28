import React from 'react';
import {COLOR, FONT} from '../theme';

export type BadgeKind =
	| 'conceptual'
	| 'illustrative'
	| 'provisional'
	| 'limited'
	| 'nodata'
	| 'measured'
	| 'calculated'
	| 'published'
	| 'recorded'
	| 'verified';

const STYLE: Record<BadgeKind, {label: string; color: string; fill: number; dashed?: boolean; dot?: boolean}> = {
	conceptual: {label: 'CONCEPTUAL', color: COLOR.amber, fill: 0.12},
	illustrative: {label: 'ILLUSTRATIVE DATA', color: COLOR.amber, fill: 0.12},
	provisional: {label: 'PROVISIONAL', color: COLOR.amber, fill: 0.14},
	limited: {label: 'LIMITED DATA', color: COLOR.amber, fill: 0.12},
	nodata: {label: 'NO DATA', color: COLOR.amber, fill: 0.12},
	measured: {label: 'MEASURED', color: COLOR.cyan, fill: 0.1, dot: true},
	calculated: {label: 'CALCULATED', color: COLOR.text, fill: 0.06},
	published: {label: 'PUBLISHED', color: COLOR.cyan, fill: 0.04, dashed: true},
	recorded: {label: 'RECORDED DATA', color: COLOR.cyan, fill: 0.1, dot: true},
	verified: {label: 'VERIFIED', color: COLOR.safe, fill: 0.1},
};

const hexToRgba = (hex: string, a: number) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export const Badge: React.FC<{
	kind: BadgeKind;
	label?: string;
	style?: React.CSSProperties;
}> = ({kind, label, style}) => {
	const s = STYLE[kind];
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 10,
				fontFamily: FONT.mono,
				fontSize: 28,
				fontWeight: 500,
				lineHeight: 1,
				letterSpacing: '0.06em',
				color: s.color,
				padding: '7px 14px 6px',
				borderRadius: 6,
				border: `2px ${s.dashed ? 'dashed' : 'solid'} ${hexToRgba(s.color, 0.85)}`,
				background: hexToRgba(s.color, s.fill),
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			{s.dot ? <span style={{width: 10, height: 10, borderRadius: 5, background: s.color}} /> : null}
			{label ?? s.label}
		</span>
	);
};
