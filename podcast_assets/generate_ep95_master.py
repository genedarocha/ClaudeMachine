import os
import subprocess
import asyncio
import edge_tts

VOICE = "en-US-GuyNeural"
RATE = "+0%"
PITCH = "+0Hz"

EPISODE_NUMBER = 95
EPISODE_TITLE = "#95 Microsoft AI Spearheads Innovation with a New Hub in London"
PODCAST_NAME = "Voxstar AI Automation"
ARTIST = "Gene Da Rocha"
SUBTITLE = "Microsoft Opens Flagship AI Hub in London Led by Mustafa Suleyman"

FULL_SCRIPT = """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today, in Episode 95, we are exploring a major milestone in enterprise AI: Microsoft AI spearheading innovation with the launch of their brand-new flagship AI Hub in London.

Led by DeepMind co-founder and Microsoft AI CEO Mustafa Suleyman, this new central hub in the heart of London is designed to advance state-of-the-art language models, supporting infrastructure, and world-class tooling for foundational AI.

The UK has long been a powerhouse for machine learning research and engineering talent. By establishing this dedicated hub, Microsoft is doubling down on London as a premier global AI capital, collaborating closely with the UK AI Safety Institute, academic institutions, and enterprise partners across Europe.

What does this mean for developers and tech leaders?
First, the rapid acceleration of the Copilot ecosystem. As frontier research moves closer to enterprise execution, we are seeing real-time advancements in autonomous agent workflows, reasoning engines, and multimodal applications.
Second, a massive boost for local tech ecosystems, opening high-impact roles for scientists, engineers, and AI architects to drive the next wave of intelligent automation.

The race to build sovereign, trusted, and production-grade AI infrastructure is accelerating. For founders and automation builders, having major research hubs bridging academic breakthroughs and commercial deployment is exactly what drives the industry forward.

Thank you for tuning into Voxstar AI Automation. If you found value in today's broadcast, subscribe to our Substack publication at voxstar.substack.com, follow on Spotify, and share this episode with your engineering team. Until next time, I'm Gene Da Rocha.
"""

async def generate_voice():
    os.makedirs("podcast_assets/output", exist_ok=True)
    voice_path = "podcast_assets/output/ep95_voice_raw.mp3"
    
    print(f"1. Synthesizing full episode 95 script with voice [{VOICE}]...")
    comm = edge_tts.Communicate(FULL_SCRIPT.strip(), VOICE, rate=RATE, pitch=PITCH)
    await comm.save(voice_path)
    print("   -> Voice synthesis complete.")

def mix_and_master():
    music_bed = "podcast_assets/voxstar_intro_standard_17s.mp3"
    voice_audio = "podcast_assets/output/ep95_voice_raw.mp3"
    artwork = "podcast_assets/podcast_logo_cloudfront.jpg"
    final_output = "podcast_assets/output/Episode_95_Microsoft_London_Hub_Master.mp3"
    public_output = "public/podcast/Episode_95_Microsoft_London_Hub_Master.mp3"
    
    print("2. Layering signature intro music under voice + -16 LUFS broadcast mastering...")
    
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", voice_audio,
        "-i", music_bed,
        "-i", artwork,
        "-filter_complex",
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
    subprocess.run(["cp", final_output, public_output], check=True)
    print(f"3. Master Episode 95 Created: {final_output} and copied to {public_output}")
    print(f"   File size: {os.path.getsize(final_output)} bytes")

if __name__ == "__main__":
    asyncio.run(generate_voice())
    mix_and_master()
