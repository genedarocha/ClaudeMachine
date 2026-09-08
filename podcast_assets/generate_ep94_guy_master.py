import os
import subprocess
import asyncio
import edge_tts

VOICE = "en-US-GuyNeural"
RATE = "+0%"
PITCH = "+0Hz"

EPISODE_NUMBER = 94
EPISODE_TITLE = "#94 Unveiling the Future: Llama 3's Arrival Sets New Horizons"
PODCAST_NAME = "Voxstar AI Automation"
ARTIST = "Gene Da Rocha"
SUBTITLE = "The Dawn of Llama 3: Meta's Open-Source AI Assistant Takes the Stage"

# Full script read continuously by the EXACT SAME VOICE from intro to outro:
FULL_SCRIPT = """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today, we are diving into episode 94, exploring a massive milestone in open-source AI: Meta's unveiling of Llama 3.

In a move that has sent shockwaves through the entire tech industry, Meta announced the rollout of Llama 3 during their recent event in London. Building directly on the momentum of Llama 1 and Llama 2, this next-generation open-source large language model represents a dramatic leap forward in both scale and capability.

Llama 3 is designed to scale up to an astounding 140 billion parameters—more than doubling the capacity of Llama 2's 70 billion parameter model. But the story here is much bigger than just parameter counts. It is about how open-source architecture is poised to challenge proprietary giants like OpenAI's ChatGPT, and what this means for developers, enterprises, and everyday users.

Meta is taking a carefully orchestrated, phased approach to this rollout. The initial priority is squarely focused on mastering text generation, code synthesis, and advanced reasoning. By focusing on these core language capabilities first, Meta ensures developers have an ultra-stable, highly accurate foundation before rolling out multimodal features like the Emu image generation engine later in the cycle.

So where will you see Llama 3 in action? 
Everywhere across Meta's ecosystem. We're talking about deep, native integrations into Facebook, Instagram, and WhatsApp. Imagine over three billion daily active users having seamless access to a responsive, context-aware AI assistant right inside their daily messaging apps. Beyond social media, Llama 3 will also power Meta's immersive metaverse environments, driving smarter virtual interactions, real-time translations, and collaborative workspaces.

What truly sets Llama 3 apart is the open-source advantage. By releasing model weights to the global community, Meta is accelerating democratization. Independent developers, research institutions, and enterprises can fine-tune Llama 3 for specialized domains—whether that's complex legal document analysis, precision medical triage, or automated customer support pipelines.

Furthermore, Meta has emphasized responsible development and ethical AI governance, implementing strict safety guardrails against bias and misuse while collaborating closely with international regulatory frameworks.

As we stand on the threshold of Llama 3's widespread adoption, the message for founders, developers, and businesses is clear: the open-source AI landscape is advancing at breakneck speed. The tools to build, automate, and innovate are becoming more powerful and accessible than ever before.

Thank you for tuning into Voxstar AI Automation. If you enjoyed this episode, make sure to subscribe to our Substack publication at voxstar.substack.com, leave a review on Spotify or Apple Podcasts, and stay tuned as we continue bringing you the forefront of AI and automation. Until next time, I'm Gene Da Rocha.
"""

async def generate_voice():
    os.makedirs("podcast_assets/output", exist_ok=True)
    voice_path = "podcast_assets/output/ep94_guy_voice_raw.mp3"
    
    print(f"1. Synthesizing full episode script with Guy Neural voice [{VOICE}]...")
    comm = edge_tts.Communicate(FULL_SCRIPT.strip(), VOICE, rate=RATE, pitch=PITCH)
    await comm.save(voice_path)
    print("   -> Voice synthesis complete.")

def mix_and_master():
    music_bed = "podcast_assets/voxstar_intro_standard_17s.mp3"
    voice_audio = "podcast_assets/output/ep94_guy_voice_raw.mp3"
    artwork = "podcast_assets/podcast_logo_cloudfront.jpg"
    final_output = "podcast_assets/output/Episode_94_Llama3_Guy_Master.mp3"
    
    print("2. Layering signature intro music under Guy voice + -16 LUFS broadcast mastering...")
    
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", voice_audio,
        "-i", music_bed,
        "-i", artwork,
        "-filter_complex",
        # Intro music plays with a 1.2s lead-in, then ducks under voice, fading out smoothly
        "[1:a]atrim=0:14,afade=t=out:st=9.5:d=4.5,volume=0.30[music];"
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
    print(f"3. Master Episode Created: {final_output}")
    print(f"   File size: {os.path.getsize(final_output)} bytes")

if __name__ == "__main__":
    asyncio.run(generate_voice())
    mix_and_master()
