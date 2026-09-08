import whisper

model = whisper.load_model("base")

episodes = [
    ("Episode 92", "podcast_assets/intro_30s.wav"),
    ("Episode 85", "podcast_assets/ep_samples/ep_7_20s.wav"),
    ("Episode 87", "podcast_assets/ep_samples/ep_5_20s.wav")
]

for title, path in episodes:
    res = model.transcribe(path, word_timestamps=True)
    print("=" * 40)
    print(title)
    print("=" * 40)
    for seg in res["segments"]:
        start = seg["start"]
        end = seg["end"]
        text = seg["text"]
        print(f"[{start:5.2f}s -> {end:5.2f}s]: {text}")
        if "words" in seg:
            for w in seg["words"]:
                w_start = w["start"]
                w_end = w["end"]
                w_word = w["word"]
                print(f"   {w_start:5.2f}s -> {w_end:5.2f}s: {w_word}")
