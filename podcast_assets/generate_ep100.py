import os
import subprocess
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont

VOICE = "en-US-GuyNeural"
RATE = "+0%"
PITCH = "+0Hz"

EPISODE_100 = {
    "number": 100,
    "title": "#100 The Century Milestone: Autonomous AI Systems, Reasoning Frontier Models & Enterprise Transformation",
    "subtitle": "Episode 100 Special Broadcast: From Prompt Engineering to Autonomous Swarms & Sovereign Intelligence",
    "script": """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today marks a monumental milestone for our broadcast: Episode 100 of the Voxstar AI Automation Podcast.

When we launched this show, generative artificial intelligence was primarily defined by simple, single-turn chat prompts. Today, as we hit Episode 100 in 2026, the entire technological landscape has undergone a profound paradigm shift: from passive chatbots to autonomous, reasoning multi-agent systems and sovereign cloud infrastructure.

In this special 100th episode broadcast, we are examining the three core pillars that will define the next decade of enterprise artificial intelligence:

First, The Rise of Test-Time Compute and Reasoning Engines. Frontier models are no longer judged solely by pretraining token counts or raw parameter scale. Instead, modern reasoning models perform dynamic chain-of-thought verification, self-correction, and synthetic simulation before returning a final deterministic output. This fundamentally shifts AI from probabilistic guesswork into dependable operational software.

Second, Autonomous Multi-Agent Swarms and Deterministic Brakes. Enterprise engineering teams are moving away from fragile monolithic prompts toward modular, role-specialized agent swarms. These swarms are orchestrated by supervisor controllers and protected by deterministic software brakes, preventing runaway token burn and enforcing strict policy compliance under frameworks like ATL-TRUST.

Third, Hardware Diversification and Sovereign Edge Execution. With custom silicon like Google Axion, Microsoft Azure Maia and Cobalt, Intel Gaudi 3, and Apple Silicon NPUs, computing power is democratizing. Forward-thinking enterprises are deploying quantized Small Language Models directly on-premise and on-device, cutting cloud inference bills by over eighty percent while guaranteeing absolute data privacy.

To our global listeners, CTOs, engineers, founders, and automation leaders across 100 episodes: thank you for being on this journey with us.

To read the complete research article and access full architectural notes, visit voxstar.substack.com. Subscribe to our podcast on Spotify and Apple Podcasts, and connect with me on LinkedIn and X at Gene Da Rocha.

Here is to the next 100 episodes of pushing boundaries. Until next time, innovate with intent, keep building, and keep automating everything. I'm Gene Da Rocha.
"""
}

async def generate_ep100_audio():
    os.makedirs("podcast_assets/output", exist_ok=True)
    os.makedirs("public/podcast", exist_ok=True)
    
    ep_num = EPISODE_100["number"]
    voice_path = f"podcast_assets/output/ep{ep_num}_voice_raw.mp3"
    print(f"[{ep_num}] 1. Synthesizing voice with {VOICE}...")
    comm = edge_tts.Communicate(EPISODE_100["script"].strip(), VOICE, rate=RATE, pitch=PITCH)
    await comm.save(voice_path)
    print(f"[{ep_num}]    -> Voice synthesis complete.")

    # Mix and master
    music_bed = "podcast_assets/voxstar_intro_standard_17s.mp3"
    artwork = "podcast_assets/podcast_logo_cloudfront.jpg"
    final_output = f"podcast_assets/output/Episode_{ep_num}_Master.mp3"
    public_output = f"public/podcast/Episode_{ep_num}_Master.mp3"

    print(f"[{ep_num}] 2. Layering signature intro music + -16 LUFS broadcast mastering...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", voice_path,
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
        "-metadata", f"title={EPISODE_100['title']}",
        "-metadata", "artist=Gene Da Rocha",
        "-metadata", "album=Voxstar AI Automation",
        "-metadata", f"track={ep_num}",
        "-metadata", f"comment={EPISODE_100['subtitle']} | voxstar.substack.com",
        "-metadata", "genre=Podcast",
        "-metadata", "date=2026",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        final_output
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    subprocess.run(["cp", final_output, public_output], check=True)
    print(f"[{ep_num}] 3. Created public master: {public_output} ({os.path.getsize(public_output)} bytes)")

def generate_ep100_social_cover():
    """Generates 1024x1024 social graphic image for episode 100."""
    width, height = 1024, 1024
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Dark slate base
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(height):
        r = int(15 + (y / height) * 20)
        g = int(23 + (y / height) * 35)
        b = int(42 + (y / height) * 75)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Grid overlay
    grid_color = (40, 60, 110, 40)
    for x in range(0, width, 48):
        draw.line([(x, 0), (x, height)], fill=(30, 45, 80))
    for y in range(0, height, 48):
        draw.line([(0, y), (width, y)], fill=(30, 45, 80))

    # Outer border
    draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(59, 130, 246), width=4)
    draw.rectangle([(32, 32), (width - 32, height - 32)], outline=(147, 51, 234), width=2)

    # Load fonts
    try:
        font_badge = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
        font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 21)
        font_bullet = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
        font_host = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    except:
        font_badge = font_title = font_sub = font_bullet = font_host = ImageFont.load_default()

    # Top Header Pill
    pill_w, pill_h = 580, 52
    pill_x = (width - pill_w) // 2
    draw.rounded_rectangle([(pill_x, 60), (pill_x + pill_w, 60 + pill_h)], radius=26, fill=(30, 58, 138), outline=(96, 165, 250), width=2)
    draw.text((width // 2, 86), "VOXSTAR AI AUTOMATION PODCAST • EP #100", fill=(255, 255, 255), font=font_badge, anchor="mm")

    # Episode Title
    draw.text((width // 2, 165), "#100 The Century Milestone", fill=(255, 255, 255), font=font_title, anchor="mm")
    draw.text((width // 2, 215), "Autonomous AI Systems & Enterprise Transformation", fill=(147, 197, 253), font=font_title, anchor="mm")

    # Takeaways Box
    draw.rounded_rectangle([(60, 265), (width - 60, 830)], radius=20, fill=(15, 23, 42), outline=(59, 130, 246), width=2)

    takeaways = [
        "100th Milestone Edition: A special retrospective and future roadmap for enterprise builders.",
        "From Prompting to Reasoning: Test-time compute scaling, synthetic self-correction, and verification.",
        "Deterministic Multi-Agent Swarms: Hierarchical orchestration, software throttles, and ATL-Trust gates.",
        "Diversified Compute Revolution: Slashing inference overhead by 80% on local NPUs and sovereign cloud.",
        "Available Everywhere: Full master broadcast on Spotify, Substack, YouTube Shorts, and Apple Podcasts."
    ]

    for i, t in enumerate(takeaways):
        box_y = 290 + i * 102
        draw.rounded_rectangle([(80, box_y), (width - 80, box_y + 84)], radius=14, fill=(30, 41, 59), outline=(71, 85, 105), width=1)
        draw.text((105, box_y + 42), f"⚡  {t}", fill=(243, 244, 246), font=font_bullet, anchor="lm")

    # Host Banner
    draw.rounded_rectangle([(60, 860), (width - 60, 975)], radius=18, fill=(15, 23, 42), outline=(147, 51, 234), width=2)
    draw.text((width // 2, 900), "🎙️ Host: Gene Da Rocha  •  Voxstar AI Systems", fill=(255, 255, 255), font=font_host, anchor="mm")
    draw.text((width // 2, 940), "voxstar.substack.com  •  open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8", fill=(156, 163, 175), font=font_sub, anchor="mm")

    public_img = "public/podcast/ep100_social_image.jpg"
    img.save(public_img, quality=95)
    print(f"[100] 4. Created public social graphic: {public_img}")

if __name__ == "__main__":
    asyncio.run(generate_ep100_audio())
    generate_ep100_social_cover()
