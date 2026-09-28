import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, fade} from '../anim';
import {COLOR, FONT} from '../theme';

type Node = {id: string; label: string; sub?: string; x: number; y: number; w: number; h: number; accent?: string};

const NODE_W = 290;
const NODE_H = 130;
const ROW_Y = 470;
const xs = [90, 440, 790, 1140, 1490];

export const PIPELINE_NODES: Node[] = [
	{id: 'reports', label: 'NASA reports', x: xs[0], y: ROW_Y, w: NODE_W, h: NODE_H},
	{id: 'table', label: 'Verified table', x: xs[1], y: ROW_Y, w: NODE_W, h: NODE_H},
	{id: 'engine', label: 'Margin engine', sub: '(math)', x: xs[2], y: ROW_Y, w: NODE_W, h: NODE_H, accent: COLOR.cyan},
	{id: 'dash', label: 'Dashboard', x: xs[3], y: ROW_Y, w: NODE_W, h: NODE_H},
	{id: 'drawer', label: 'Evidence drawer', x: xs[4], y: ROW_Y, w: NODE_W, h: NODE_H},
];
const ESP32: Node = {id: 'esp', label: 'ESP32 sensors', x: xs[2], y: 760, w: NODE_W, h: 100};
const AI = {x: 150, y: 190, w: 880, h: 150};

const center = (n: Node) => ({cx: n.x + n.w / 2, cy: n.y + n.h / 2});

/** A connector with a soft glow and a pulse travelling along it. */
const Connector: React.FC<{d: string; length: number; progress: number; dashed?: boolean; color?: string; pulseOffset?: number}> = ({
	d,
	length,
	progress,
	dashed,
	color = COLOR.cyan,
	pulseOffset = 0,
}) => {
	const frame = useCurrentFrame();
	const pulse = ((frame * 4 + pulseOffset) % (length + 120)) - 60;
	return (
		<g>
			<path d={d} fill="none" stroke={color} strokeWidth={8} opacity={0.12 * progress} strokeLinecap="round" />
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth={2.5}
				strokeLinecap="round"
				strokeDasharray={dashed ? '10 10' : `${length}`}
				strokeDashoffset={dashed ? 0 : length * (1 - progress)}
				opacity={dashed ? 0.8 * progress : 0.9}
				markerEnd={!dashed && progress > 0.95 ? 'url(#pipe-arrow)' : undefined}
			/>
			{!dashed && progress >= 1 ? (
				<path
					d={d}
					fill="none"
					stroke={COLOR.text}
					strokeWidth={4}
					strokeLinecap="round"
					strokeDasharray={`40 ${length + 200}`}
					strokeDashoffset={-pulse}
					opacity={0.85}
				/>
			) : null}
		</g>
	);
};

const Box: React.FC<{n: Node; opacity: number; lift: number}> = ({n, opacity, lift}) => (
	<div
		style={{
			position: 'absolute',
			left: n.x,
			top: n.y + (1 - lift) * 20,
			width: n.w,
			height: n.h,
			opacity,
			borderRadius: 12,
			border: `2px solid ${n.accent ?? 'rgba(56, 189, 248, 0.55)'}`,
			background: n.accent ? 'rgba(56, 189, 248, 0.10)' : COLOR.panel,
			boxShadow: n.accent ? '0 0 30px rgba(56, 189, 248, 0.25)' : 'none',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 4,
			textAlign: 'center',
		}}
	>
		<div style={{fontSize: 32, fontWeight: 600}}>{n.label}</div>
		{n.sub ? <div style={{fontFamily: FONT.mono, fontSize: 28, color: COLOR.cyan}}>{n.sub}</div> : null}
	</div>
);

/** NASA reports → Verified table → Margin engine → Dashboard → Evidence drawer, plus sensors and AI. */
export const Pipeline: React.FC<{start: number; aiStart: number}> = ({start, aiStart}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const f = frame - start;
	const nodeIn = (i: number) => ease(f, fps, i * 12, 24);
	const linkIn = (i: number) => ease(f, fps, 12 + i * 12, 24);

	const links = PIPELINE_NODES.slice(0, -1).map((a, i) => {
		const b = PIPELINE_NODES[i + 1];
		const y = a.y + a.h / 2;
		return {d: `M ${a.x + a.w} ${y} L ${b.x} ${y}`, len: b.x - (a.x + a.w)};
	});

	const eng = center(PIPELINE_NODES[2]);
	const espIn = ease(f, fps, 60, 24);
	const aiIn = ease(frame, fps, aiStart, 30);
	const aiBottom = AI.y + AI.h;
	const aiLinks = [
		{d: `M ${center(PIPELINE_NODES[0]).cx} ${aiBottom} L ${center(PIPELINE_NODES[0]).cx} ${ROW_Y}`, len: ROW_Y - aiBottom},
		{d: `M ${center(PIPELINE_NODES[1]).cx} ${aiBottom} L ${center(PIPELINE_NODES[1]).cx} ${ROW_Y}`, len: ROW_Y - aiBottom},
		{
			d: `M ${AI.x + AI.w} ${AI.y + AI.h / 2} L ${center(PIPELINE_NODES[4]).cx} ${AI.y + AI.h / 2} L ${center(PIPELINE_NODES[4]).cx} ${ROW_Y}`,
			len: 1200,
		},
	];

	return (
		<>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<defs>
					<marker id="pipe-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR.cyan} />
					</marker>
				</defs>
				{links.map((l, i) => (
					<Connector key={i} d={l.d} length={l.len} progress={linkIn(i)} pulseOffset={i * 90} />
				))}
				<Connector d={`M ${eng.cx} ${ESP32.y} L ${eng.cx} ${ROW_Y + NODE_H}`} length={ESP32.y - ROW_Y - NODE_H} progress={espIn} pulseOffset={40} />
				{aiLinks.map((l, i) => (
					<Connector key={`ai${i}`} d={l.d} length={l.len} progress={aiIn} dashed color={COLOR.amber} />
				))}
			</svg>
			{PIPELINE_NODES.map((n, i) => (
				<Box key={n.id} n={n} opacity={nodeIn(i)} lift={nodeIn(i)} />
			))}
			<Box n={ESP32} opacity={espIn} lift={espIn} />
			<div
				style={{
					position: 'absolute',
					left: AI.x,
					top: AI.y,
					width: AI.w,
					height: AI.h,
					opacity: fade(frame, aiStart, 20),
					borderRadius: 14,
					border: `2px dashed ${COLOR.amber}`,
					background: 'rgba(245, 158, 11, 0.08)',
					display: 'flex',
					alignItems: 'center',
					gap: 28,
					padding: '0 32px',
				}}
			>
				<div style={{fontFamily: FONT.mono, fontSize: 48, fontWeight: 700, color: COLOR.amber}}>AI</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
					<div style={{fontSize: 32, fontWeight: 500}}>AI reads, matches, explains.</div>
					<div style={{fontSize: 32, fontWeight: 700, color: COLOR.amber}}>It never makes the safety call.</div>
				</div>
			</div>
		</>
	);
};
