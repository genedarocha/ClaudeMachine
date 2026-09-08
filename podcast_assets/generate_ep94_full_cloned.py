import os
import subprocess
import soundfile as sf
import torch

os.environ["DYLD_LIBRARY_PATH"] = "/opt/homebrew/lib"
from f5_tts.api import F5TTS

EPISODE_NUMBER = 94
EPISODE_TITLE = "#94 Unveiling the Future: Llama 3's Arrival Sets New Horizons"
PODCAST_NAME = "Voxstar AI Automation"
ARTIST = "Gene Da Rocha"
SUBTITLE = "The Dawn of Llama 3: Meta's Open-Source AI Assistant Takes the Stage"

# Full unified script to be spoken in the cloned voice:
FULL_SCRIPT = """Welcome to Automating Everything. I'm your host, Gene Da Rocha. Today, we are diving into episode 94, exploring a massive milestone in open-source AI: Meta's unveiling of Llama 3. In a move that has sent shockwaves through the tech industry, Meta announced the rollout of Llama 3 during their recent event in London. Building directly on the momentum of Llama 1 and Llama 2, this next-generation open-source large language model represents a dramatic leap forward in scale and capability. Llama 3 is designed to scale up to an astounding 140 billion parameters—more than doubling the capacity of Llama 2's 70 billion parameter model. But the story is much bigger than parameter counts. It is about how open-source architecture is poised to challenge proprietary giants like OpenAI's ChatGPT. Meta is taking an orchestrated, phased approach. The initial priority is squarely focused on mastering text generation, code synthesis, and advanced reasoning. By focusing on core language capabilities first, Meta ensures developers have an ultra-stable foundation before rolling out multimodal features like the Emu image generation engine. Llama 3 will be integrated across Meta's ecosystem—into Facebook, Instagram, WhatsApp, and the metaverse. Over three billion daily active users will have access to a responsive AI assistant. What sets Llama 3 apart is the open-source advantage. By releasing model weights to the global community, Meta is accelerating democratization. Independent developers, research institutions, and enterprises can fine-tune Llama 3 for specialized domains in legal, healthcare, finance, and automated customer support. As we stand on the threshold of Llama 3's adoption, the open-source AI landscape is advancing at breakneck speed. The tools to build, automate, and innovate are becoming more accessible than ever. Thank you for tuning into Voxstar AI Automation. Subscribe to our Substack publication at voxstar.substack.com, leave a review on Spotify or Apple Podcasts, and stay tuned. Until next time, I'm Gene Da Rocha."""

def main():
    os.makedirs("podcast_assets/output", exist_ok=True)
    ref_audio = "podcast_assets/voice_ref_ep92.wav"
    ref_text = "Today we are diving into the world of Microsoft AutoDev and Devin AI, exploring the AI-driven revolution in software development."
    raw_voice_wav = "podcast_assets/output/ep94_cloned_voice_full.wav"
    
    print("1. Cloning full episode script with F5-TTS...")
    f5tts = F5TTS()
    f5tts.infer(
        ref_file=ref_audio,
        ref_text=ref_text,
        gen_text=FULL_SCRIPT,
        file_wave=raw_voice_wav
    )
    print(f"   -> Generated cloned speech: {raw_voice_wav}")
    
    music_bed = "podcast_assets/voxstar_intro_standard_17s.mp3"
    artwork = "podcast_assets/podcast_logo_cloudfront.jpg"
    final_master_mp3 = "podcast_assets/output/Episode_94_Llama3_Cloned_Master.mp3"
    
    print("2. Stitching with signature intro music bed & applying broadcast -16 LUFS loudness...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", raw_voice_wav,
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
        final_master_mp3
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"3. Master Episode Created: {final_master_mp3}")

if __name__ == "__main__":
    main()
