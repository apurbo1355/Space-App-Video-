#!/usr/bin/env python3
"""
Synthesise the AstraFlame narration with Kokoro-82M (open-weights neural TTS,
Apache-2.0), fully offline once the model files are downloaded.

    pip install kokoro-onnx
    npm run voiceover          # exports cues from src/config.ts, runs this, checks sync

Writes one WAV per cue to public/voiceover/<cue id>.wav and the measured
durations to src/voiceover/durations.json (read by the video). Cues whose
text, voice and speed are unchanged are skipped.

Model files (~350 MB) are fetched from the kokoro-onnx GitHub release into
.cache/kokoro/ unless KOKORO_MODEL_DIR points at an existing copy.
"""
import hashlib
import json
import os
import sys
import urllib.request
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "voiceover")
DURATIONS = os.path.join(ROOT, "src", "voiceover", "durations.json")
MODEL_DIR = os.environ.get("KOKORO_MODEL_DIR", os.path.join(ROOT, ".cache", "kokoro"))
RELEASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = ["kokoro-v1.0.onnx", "voices-v1.0.bin"]


def ensure_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    for name in FILES:
        path = os.path.join(MODEL_DIR, name)
        if not os.path.exists(path):
            print(f"downloading {name} ...", flush=True)
            urllib.request.urlretrieve(RELEASE + name, path)
    return [os.path.join(MODEL_DIR, f) for f in FILES]


def trim_silence(samples, sr, threshold=0.004, pad_s=0.06):
    loud = np.where(np.abs(samples) > threshold)[0]
    if len(loud) == 0:
        return samples
    pad = int(pad_s * sr)
    start = max(0, loud[0] - pad)
    end = min(len(samples), loud[-1] + pad)
    return samples[start:end]


def write_wav(path, samples, sr):
    fade = min(len(samples) // 4, int(0.01 * sr))
    if fade > 0:
        samples = samples.copy()
        samples[:fade] *= np.linspace(0, 1, fade)
        samples[-fade:] *= np.linspace(1, 0, fade)
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: generate_voiceover.py narration.json")
    with open(sys.argv[1]) as f:
        narration = json.load(f)
    try:
        with open(DURATIONS) as f:
            durations = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        durations = {}

    os.makedirs(OUT_DIR, exist_ok=True)
    kokoro = None
    wanted = set()
    for cue in narration["cues"]:
        wanted.add(cue["id"])
        key = f'{narration["voice"]}|{narration["speed"]}|{cue["say"]}'
        digest = hashlib.sha1(key.encode()).hexdigest()[:12]
        wav_path = os.path.join(OUT_DIR, f'{cue["id"]}.wav')
        prev = durations.get(cue["id"])
        if prev and prev.get("hash") == digest and os.path.exists(wav_path):
            continue
        if kokoro is None:
            from kokoro_onnx import Kokoro

            kokoro = Kokoro(*ensure_models())
        samples, sr = kokoro.create(cue["say"], voice=narration["voice"], speed=narration["speed"], lang="en-us")
        samples = trim_silence(np.asarray(samples, dtype=np.float32), sr)
        write_wav(wav_path, samples, sr)
        durations[cue["id"]] = {"seconds": round(len(samples) / sr, 3), "hash": digest}
        print(f'{cue["id"]}: {durations[cue["id"]]["seconds"]:.2f}s  "{cue["text"]}"', flush=True)

    for stale in set(durations) - wanted:
        durations.pop(stale)
    with open(DURATIONS, "w") as f:
        json.dump(dict(sorted(durations.items())), f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
