import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, fade, fadeOut} from '../anim';
import {Badge} from '../components/Badge';
import {HudFrame} from '../components/HudFrame';
import {SourceChips} from '../components/SourceChip';
import {cueFrom} from '../config';
import {SOURCES} from '../data/facts';
import {COLOR, FONT} from '../theme';
import {Voiceover} from '../voiceover/Voiceover';

const S = 'Scene6' as const;

const Icon1g: React.FC = () => (
	<svg width={96} height={96} viewBox="0 0 96 96">
		<circle cx={48} cy={48} r={42} fill="none" stroke={COLOR.cyan} strokeWidth={3} />
		<text x={48} y={60} textAnchor="middle" fill={COLOR.cyan} fontFamily={FONT.mono} fontSize={34} fontWeight={700}>
			1 g
		</text>
	</svg>
);

const IconMoon: React.FC = () => (
	<svg width={96} height={96} viewBox="0 0 96 96">
		<path d="M 62 10 A 40 40 0 1 0 86 62 A 32 32 0 1 1 62 10 Z" fill="none" stroke={COLOR.amber} strokeWidth={3} />
	</svg>
);

const IconDoc: React.FC = () => (
	<svg width={96} height={96} viewBox="0 0 96 96">
		<path d="M 22 8 H 60 L 76 24 V 88 H 22 Z M 60 8 V 24 H 76" fill="none" stroke={COLOR.cyan} strokeWidth={3} strokeLinejoin="round" />
		{[40, 52, 64].map((y) => (
			<line key={y} x1={32} x2={66} y1={y} y2={y} stroke={COLOR.cyan} strokeWidth={3} opacity={0.6} />
		))}
		<circle cx={66} cy={72} r={10} fill={COLOR.bg} stroke={COLOR.safe} strokeWidth={3} />
		<path d="M 61 72 l 4 4 l 7 -8" fill="none" stroke={COLOR.safe} strokeWidth={3} />
	</svg>
);

const LimitCard: React.FC<{at: number; top: number; icon: React.ReactNode; children: React.ReactNode}> = ({at, top, icon, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const k = ease(frame, fps, at, 30);
	return (
		<div
			style={{
				position: 'absolute',
				left: 190,
				top: top + (1 - k) * 24,
				width: 1540,
				height: 190,
				opacity: k,
				boxSizing: 'border-box',
				padding: '0 44px',
				borderRadius: 16,
				border: `1.5px solid ${COLOR.grid}`,
				background: COLOR.panel,
				display: 'flex',
				alignItems: 'center',
				gap: 40,
			}}
		>
			{icon}
			<div style={{fontSize: 40, lineHeight: 1.3, fontWeight: 500}}>{children}</div>
		</div>
	);
};

const FlameMark: React.FC = () => (
	<svg width={120} height={150} viewBox="0 0 120 150">
		<path
			d="M 62 8 C 70 36, 102 56, 100 98 A 40 40 0 0 1 20 98 C 20 74, 34 60, 42 44 C 44 60, 50 68, 58 72 C 52 52, 54 28, 62 8 Z"
			fill="rgba(56, 189, 248, 0.08)"
			stroke={COLOR.cyan}
			strokeWidth={4}
			strokeLinejoin="round"
		/>
		<path d="M 60 76 C 66 90, 80 96, 78 110 A 18 18 0 0 1 42 110 C 42 98, 54 92, 60 76 Z" fill={COLOR.amber} opacity={0.85} />
	</svg>
);

export const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tA = cueFrom(S, 's6a');
	const tB = cueFrom(S, 's6b');
	const tC = cueFrom(S, 's6c');
	const tD = cueFrom(S, 's6d');
	const endAt = tD + 5;
	const cardsOpacity = fadeOut(frame, endAt + 12, 20);
	const endK = ease(frame, fps, endAt, 40);

	return (
		<HudFrame index={6} title="Honest Limits" fadeOutAtEnd={false}>
			{frame < endAt + 10 ? (
				<div style={{position: 'absolute', inset: 0, opacity: cardsOpacity}}>
					<LimitCard at={tA} top={200} icon={<Icon1g />}>
						Limits come from 1 g Earth tests.
						<br />
						<span style={{color: COLOR.cyan}}>Real margins in microgravity may be smaller.</span>
					</LimitCard>
					<LimitCard at={tB} top={420} icon={<IconMoon />}>
						Moon: NASA's lunar fire experiment hasn't reported yet.
						<br />
						<span style={{display: 'inline-flex', alignItems: 'center', gap: 16}}>
							AstraFlame shows <Badge kind="nodata" style={{fontSize: 32}} />
						</span>
					</LimitCard>
					<LimitCard at={tC} top={640} icon={<IconDoc />}>
						Every number traces to a NASA report page.
					</LimitCard>
					<SourceChips chips={[{label: SOURCES.std6001, from: tA + 10}]} />
				</div>
			) : null}

			{frame >= endAt ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						opacity: endK,
						transform: `translateY(${(1 - endK) * 20}px)`,
					}}
				>
					<FlameMark />
					<div style={{marginTop: 18, fontSize: 150, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1}}>
						Astra<span style={{color: COLOR.cyan}}>Flame</span>
					</div>
					<div style={{marginTop: 26, fontSize: 44, fontWeight: 500, color: COLOR.textDim, letterSpacing: '0.08em'}}>Team Agni Shikha</div>
					<div style={{marginTop: 50, fontSize: 44, fontWeight: 600, color: COLOR.cyan, opacity: fade(frame, endAt + 20, 20)}}>
						Test the habitat before the flame tests the crew.
					</div>
					<div style={{marginTop: 40, fontFamily: FONT.mono, fontSize: 28, color: COLOR.textDim, opacity: fade(frame, endAt + 35, 20)}}>
						NASA Space Apps 2026
					</div>
				</div>
			) : null}
			<Voiceover sceneId={S} />
		</HudFrame>
	);
};
