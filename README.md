# AstraFlame — explainer video (NASA Space Apps 2026 · Team Agni Shikha)

A 120 s, 1920×1080, 30 fps explainer built entirely in code with [Remotion](https://www.remotion.dev/):
SVG, typography and charts only (no logos, stock photos or AI images), with a synthesised
voiceover that is timed from the same config as the visuals.

| Output | Path |
| --- | --- |
| Full video (3600 frames, with voiceover) | `out/astraflame_explainer.mp4` |
| Individual scenes for editing | `out/scenes/Scene1.mp4` … `Scene6.mp4` |

## Compositions

`src/Root.tsx` registers:

- **AstraFlameVideo**: the full 120 s video.
- **Scene1 … Scene6** (folder "Scenes"): each scene on its own, with its own narration.

| # | Scene | Frames | Time |
| --- | --- | --- | --- |
| 1 | The Air Is Changing | 0–600 | 0–20 s |
| 2 | Fire Without Up | 600–1260 | 20–42 s |
| 3 | From Buried Reports to One Table | 1260–1800 | 42–60 s |
| 4 | Fire Margin Gauges | 1800–2550 | 60–85 s |
| 5 | Live Hardware Bridge | 2550–3060 | 85–102 s |
| 6 | Honest Limits + close | 3060–3600 | 102–120 s |

## Retiming: `src/config.ts`

All timing lives in **`src/config.ts`**: each scene's `durationInFrames` and each voiceover
cue (`from` frame relative to the scene, `text`, optional `say` pronunciation). The full
composition reads scene lengths from it, and every scene anchors its on-screen beats to its
cue `from` frames, so moving a cue moves both the voice and the visuals that go with it.

```bash
npm run check-sync   # table of every cue: start, end, slack before the next cue; fails on overlap
```

Other switches in the same file: `VOICEOVER` (enable, voice, speed, volume) and
`USE_RECORDED_TELEMETRY`.

## Voiceover

`@remotion/tts` is not a published package, so narration is synthesised offline with
**Kokoro-82M** (open-weights neural TTS, Apache-2.0) through `kokoro-onnx`:

```bash
pip install kokoro-onnx          # once
npm run voiceover                # export cues → synthesise changed lines → check sync
```

- Writes `public/voiceover/<cue id>.wav` and measured lengths to `src/voiceover/durations.json`.
- Only cues whose text, voice or speed changed are re-synthesised.
- Model files (~350 MB) download into `.cache/kokoro/` on first run (or set `KOKORO_MODEL_DIR`).
- To use recorded human narration instead, drop WAVs with the same names into
  `public/voiceover/` and update the `seconds` values in `durations.json`.

## Data and accuracy rules

- **`src/data/materials.ts`**: every MOC value (Harper et al., NTRS 20160001047, Table 2)
  with `testedPressurePsia`, `sourcePage` and `verified`. All values are currently
  `verified: false`, so each one renders with an amber **PROVISIONAL** tag. After checking a
  value against the PDF, fill in `sourcePage` and set `verified: true`, then re-render.
- For the 8.2 psia cabin the gauges use the MOC at the **nearest tested pressure** and always
  show that pressure (e.g. "MOC 28% @ 7 psia").
- **`src/data/facts.ts`**: the atmosphere numbers (14.7 psia / 21% / ≈3.1 psia and
  8.2 psia / 34% / ≈2.8 psia) and source chip labels.
- The Olson flammability map (Scene 2) is drawn without numbers and badged **CONCEPTUAL**.
- Scene 5's waveform and JSON ticker are badged **ILLUSTRATIVE DATA**.

### Using real sensor data (Scene 5)

Put a recording in **`src/data/telemetry.csv`** with the columns

```
t_s,pressure_psia,fan_pct,smoke_raw
```

and set `USE_RECORDED_TELEMETRY = true` in `src/config.ts`. When the CSV has data rows, Scene 5
plots them (time-compressed to the scene), the ticker shows the recorded packets, and the badge
changes to **RECORDED · telemetry.csv**. The file ships with just the header row.

## Commands

```bash
npm install
npm run studio           # live preview / scrub in Remotion Studio
npm run stills           # QA stills at the middle of each scene (+ key beats) → out/stills/
npm run render           # full video → out/astraflame_explainer.mp4
npm run render:scenes    # every scene → out/scenes/  (or: npm run render:scenes -- Scene4)
npm run typecheck
```

If Remotion cannot download its headless Chrome (offline or locked-down machines), point it at
a local Chrome/Chromium:

```bash
export REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell
```

## Layout

```
src/
  index.ts              registerRoot
  Root.tsx              AstraFlameVideo + Scene1…Scene6 compositions
  AstraFlameVideo.tsx   <Series> of scenes, lengths from config
  config.ts             ALL timings, voiceover cues, flags
  theme.ts / anim.ts    palette, fonts (@remotion/google-fonts), spring/interpolate helpers
  data/                 materials.ts, facts.ts, telemetry.ts, telemetry.csv
  components/           Badge, SourceChip, Gauge, FlameSVG, Pipeline, HudFrame
  scenes/               Scene1.tsx … Scene6.tsx
  voiceover/            Voiceover.tsx, durations.json (generated)
public/voiceover/       synthesised narration WAVs (generated)
scripts/                export-narration, generate_voiceover.py, check-sync, render-stills, render-scenes
```
