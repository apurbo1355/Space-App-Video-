import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, fade, fadeOut} from '../anim';
import {Badge} from '../components/Badge';
import {HudFrame} from '../components/HudFrame';
import {Pipeline} from '../components/Pipeline';
import {SourceChips} from '../components/SourceChip';
import {cueFrom} from '../config';
import {SOURCES} from '../data/facts';
import {formatPct, formatPsia, MATERIALS, SOURCE} from '../data/materials';
import {COLOR, FONT} from '../theme';
import {Voiceover} from '../voiceover/Voiceover';

const S = 'Scene3' as const;

// Deterministic scatter for the report cards.
const CARDS = Array.from({length: 14}, (_, i) => {
	const col = i % 5;
	const row = Math.floor(i / 5);
	const jitter = (n: number) => Math.sin(i * 12.9898 + n * 78.233) * 0.5;
	return {
		x: 130 + col * 340 + jitter(1) * 90,
		y: 190 + row * 250 + jitter(2) * 60,
		rot: jitter(3) * 10,
		fromX: (col - 2) * 900,
		fromY: (row - 1) * 700 + jitter(4) * 300,
		delay: i * 4,
	};
});

const ReportCard: React.FC<{i: number; collapseAt: number}> = ({i, collapseAt}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = CARDS[i];
	const inK = ease(frame, fps, 5 + c.delay, 45);
	const outK = ease(frame, fps, collapseAt + i * 1.5, 30);
	const drift = Math.sin((frame + i * 20) / 45) * 6;
	const x = interpolate(outK, [0, 1], [c.x + (1 - inK) * c.fromX, 960 - 130]);
	const y = interpolate(outK, [0, 1], [c.y + (1 - inK) * c.fromY + drift, 540 - 85]);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: 260,
				height: 170,
				padding: '18px 20px',
				boxSizing: 'border-box',
				borderRadius: 10,
				border: `1.5px solid rgba(226, 232, 240, 0.25)`,
				background: 'rgba(15, 23, 42, 0.9)',
				transform: `rotate(${c.rot * (1 - outK)}deg) scale(${1 - 0.7 * outK})`,
				opacity: inK * (1 - outK),
			}}
		>
			<div style={{fontSize: 28, fontWeight: 600, lineHeight: 1.15}}>NASA technical report</div>
			{[0.9, 0.7, 0.8].map((w, k) => (
				<div key={k} style={{marginTop: 10, height: 6, width: `${w * 100}%`, borderRadius: 3, background: 'rgba(226, 232, 240, 0.14)'}} />
			))}
		</div>
	);
};

const COLS = [
	{label: 'Material', w: 430},
	{label: 'Tested pressure', w: 320},
	{label: 'MOC', w: 200},
	{label: 'Source page', w: 420},
	{label: 'Checked', w: 300},
];

const ROWS = MATERIALS.flatMap((m) => m.points.map((pt, k) => ({m, pt, first: k === 0})));

const VerifiedTable: React.FC<{at: number; outAt: number}> = ({at, outAt}) => {
	const frame = useCurrentFrame();
	const cell = (w: number, child: React.ReactNode, style?: React.CSSProperties) => (
		<div style={{width: w, padding: '0 20px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', ...style}}>{child}</div>
	);
	return (
		<div
			style={{
				position: 'absolute',
				left: 125,
				top: 180,
				width: 1670,
				opacity: fade(frame, at, 18) * fadeOut(frame, outAt, 18),
				borderRadius: 14,
				border: `1.5px solid ${COLOR.grid}`,
				background: COLOR.panel,
				overflow: 'hidden',
			}}
		>
			<div style={{display: 'flex', height: 62, background: 'rgba(56, 189, 248, 0.10)', borderBottom: `1.5px solid rgba(56,189,248,0.4)`}}>
				{COLS.map((c) =>
					cell(c.w, c.label, {fontFamily: FONT.mono, fontSize: 28, color: COLOR.cyan, letterSpacing: '0.04em'}),
				)}
			</div>
			{ROWS.map((r, i) => (
				<div
					key={`${r.m.id}-${r.pt.testedPressurePsia}`}
					style={{
						display: 'flex',
						height: 58,
						borderTop: r.first && i > 0 ? `1.5px solid ${COLOR.grid}` : 'none',
						opacity: fade(frame, at + 8 + i * 4, 12),
					}}
				>
					{cell(COLS[0].w, r.first ? r.m.name : '', {fontSize: 30, fontWeight: 600})}
					{cell(COLS[1].w, `${formatPsia(r.pt.testedPressurePsia)} psia`, {fontFamily: FONT.mono, fontSize: 28})}
					{cell(COLS[2].w, `${formatPct(r.pt.mocPct)}%`, {fontFamily: FONT.mono, fontSize: 30, fontWeight: 700, color: COLOR.cyan})}
					{cell(COLS[3].w, `${SOURCE.table} · p. ${r.pt.sourcePage ?? '—'}`, {fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim})}
					{cell(
						COLS[4].w,
						r.pt.verified ? <Badge kind="verified" style={{padding: '3px 10px 2px'}} /> : <Badge kind="provisional" style={{padding: '3px 10px 2px'}} />,
					)}
				</div>
			))}
		</div>
	);
};

export const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const tB = cueFrom(S, 's3b');
	const tC = cueFrom(S, 's3c');
	const collapseAt = tB - 40;
	const pipelineAt = tC - 35;

	return (
		<HudFrame index={3} title="From Buried Reports to One Table">
			{frame < tB + 20 ? CARDS.map((_, i) => <ReportCard key={i} i={i} collapseAt={collapseAt} />) : null}
			{frame >= tB - 5 && frame < pipelineAt + 20 ? <VerifiedTable at={tB} outAt={pipelineAt + 5} /> : null}
			{frame >= pipelineAt ? <Pipeline start={pipelineAt} aiStart={tC + 20} /> : null}
			<SourceChips chips={[{label: SOURCES.harperTable, from: tB, until: pipelineAt + 5}]} />
			<Voiceover sceneId={S} />
		</HudFrame>
	);
};
