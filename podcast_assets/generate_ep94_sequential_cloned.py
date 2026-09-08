import os
import subprocess
import soundfile as sf
import numpy as np

os.environ["PYTHONHASHSEED"] = "0"
os.environ["DYLD_LIBRARY_PATH"] = "/opt/homebrew/lib"
from f5_tts.api import F5TTS

EPISODE_NUMBER = 94
EPISODE_TITLE = "#94 Unveiling the Future: Llama 3's Arrival Sets New Horizons"
PODCAST_NAME = "Voxstar AI Automation"
ARTIST = "Gene Da Rocha"
SUBTITLE = "The Dawn of Llama 3: Meta's Open-Source AI Assistant Takes the Stage"

PARAGRAPHS = [
    "Welcome to Automating Everything. I am your host, Gene Da Rocha.",
    "Today, we are diving into episode 94, exploring a massive milestone in open-source AI: Meta's unveiling of Llama 3.",
    "In a move that has sent shockwaves through the tech industry, Meta announced the rollout of Llama 3 during their recent event in London. Building directly on the momentum of Llama 1 and Llama 2, this next-generation open-source large language model represents a dramatic leap forward in both scale and capability.",
    "Llama 3 is designed to scale up to an astounding 140 billion parameters, more than doubling the capacity of Llama 2's 70 billion parameter model. But the story is much bigger than parameter counts. It is about how open-source architecture is poised to challenge proprietary giants like OpenAI's ChatGPT.",
    "Meta is taking a carefully orchestrated, phased approach. The initial priority is squarely focused on mastering text generation, code synthesis, and advanced reasoning. By focusing on core language capabilities first, Meta ensures developers have an ultra-stable foundation before rolling out multimodal features like the Emu image generation engine.",
    "Where will you see Llama 3 in action? Everywhere across Meta's ecosystem, including Facebook, Instagram, WhatsApp, and the metaverse. Over three billion daily active users will have access to a responsive AI assistant directly inside their messaging apps.",
    "What truly sets Llama 3 apart is the open-source advantage. By releasing model weights to the global community, Meta is accelerating democratization. Independent developers, research institutions, and enterprises can fine-tune Llama 3 for specialized domains in legal, healthcare, finance, and automated customer support.",
    "As we stand on the threshold of Llama 3's widespread adoption, the open-source AI landscape is advancing at breakneck speed. The tools to build, automate, and innovate are becoming more accessible than ever.",
    "Thank you for tuning into Voxstar AI Automation. If you enjoyed this episode, make sure to subscribe to our Substack publication at voxstar.substack.com, leave a review on Spotify or Apple Podcasts, and stay tuned. Until next time, I am Gene Da Rocha."
]

def main():
    os.makedirs("podcast_assets/output/chunks", exist_ok=True)
    ref_audio = "podcast_assets/voice_ref_ep92.wav"
    ref_text = "Today we are diving into the world of Microsoft AutoDev and Devin AI, exploring the AI-driven revolution in software development."
    
    print("1. Initializing F5-TTS...")
    f5tts = F5TTS()
    
    chunk_wavs = []
    for i, para in enumerate(PARAGRAPHS):
        chunk_file = f"podcast_assets/output/chunks/chunk_{i:02d}.wav"
        print(f"   Generating chunk {i+1}/{len(PARAGRAPHS)}: {para[:50]}...")
        f5tts.infer(
            ref_file=ref_audio,
            ref_text=ref_text,
            gen_text=para,
            file_wave=chunk_file
        )
        chunk_wavs.append(chunk_file)
    
    print("2. Concatenating all audio chunks with natural pacing...")
    all_audio = []
    sample_rate = 24000
    silence = np.zeros(int(sample_rate * 0.4), dtype=np.float32) # 400ms pause between paragraphs
    
    for cw in chunk_wavs:
        data, sr = sf.read(cw)
        sample_rate = sr
        all_audio.append(data.astype(np.float32))
        all_audio.append(silence)
    
    full_voice = np.concatenate(all_audio)
    full_voice_path = "podcast_assets/output/ep94_cloned_full_voice.wav"
    sf.write(full_voice_path, full_voice, sample_rate)
    print(f"   -> Full cloned voice ready at: {full_voice_path}")
    
    print("3. Mixing with signature intro music bed & applying broadcast -16 LUFS loudness...")
    music_bed = "podcast_assets/voxstar_intro_standard_17s.mp3"
    artwork = "podcast_assets/podcast_logo_cloudfront.jpg"
    final_output = "podcast_assets/output/Episode_94_Llama3_Authentic_Voice_Master.mp3"
    
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", full_voice_path,
        "-i", music_bed,
        "-i", artwork,
        "-filter_complex",
        "[1:a]atrim=0:14,afade=t=out:st=9.5:d=4.5,volume=0.32[music];"
        "[0:a]adelay=1200|1200[voice];"
        "[voice][music]amix=inputs=2:duration=first:dropout_transition=2[mixed];"
        "[mixed]loudnorm=I=-16:TP=-1.5:LRA=11[norm]",
        "-map", "[norm]",
        "-map", "2:v",
        "-c:v", "copy",
        "-id3v2_version", "3",
        "-metadata:s:v", "title=Episode Artwork",
        "-metadata:s:v", "comment=Cover (front)",
        "-metadata", f"title={EPISODE_TITLE}",
        "-metadata", f"artist={ARTIST}",
        "-metadata", f"album={PODCAST_NAME}",
        "-metadata", f"track={EPISODE_NUMBER}",
        "-metadata", f"comment={SUBTITLE} | voxstar.substack.com",
        "-metadata", "genre=Podcast",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        final_output
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"4. Authentic Master Episode Created: {final_output}")
    print(f"   Size: {os.path.getsize(final_output)} bytes")

if __name__ == "__main__":
    main()
