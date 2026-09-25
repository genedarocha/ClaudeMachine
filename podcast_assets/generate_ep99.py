import os
import subprocess
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont

VOICE = "en-US-GuyNeural"
RATE = "+0%"
PITCH = "+0Hz"

EPISODE_99 = {
    "number": 99,
    "title": "#99 Microsoft Is Finally Making Custom AI Chips to Power Azure & OpenAI",
    "subtitle": "Azure Maia 100 & Cobalt 100: Microsoft's Custom Silicon Revolution for Generative AI",
    "script": """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today, in Episode 99, we are diving into a major technological turning point for cloud computing and generative artificial intelligence: Microsoft is finally making its own custom AI chips.

At its Ignite conference, Microsoft officially unveiled two groundbreaking custom processors designed from the silicon up for its Azure cloud datacenters: the Azure Maia 100 AI Accelerator and the Azure Cobalt 100 CPU.

For years, Microsoft relied almost exclusively on NVIDIA GPUs to power its massive OpenAI workloads, ChatGPT, and Copilot. But with skyrocketing AI compute costs, power constraints, and soaring enterprise demand, Microsoft decided to take control of its own silicon destiny.

Let us break down the key innovations behind this monumental announcement:

First, The Azure Maia 100 AI Accelerator. This chip is built on a 5-nanometer process with 105 billion transistors. It is customized specifically for deep learning, large language model training, and low-latency inference. Microsoft partnered closely with OpenAI to optimize Maia for models like GPT-4, testing and refining the silicon architecture to maximize throughput and minimize cost per token.

Second, The Azure Cobalt 100 CPU. Built on standard Armv9 architecture with 128 computing cores, Cobalt delivers up to 40% better energy efficiency than existing commercial server processors. It is designed to handle high-density microservices, databases, and enterprise applications across Microsoft Teams and Azure services.

Third, Revolutionary Liquid-Cooled "Sidekick" Datacenter Racks. Because AI chips generate intense heat, Microsoft custom-designed liquid-cooling racks called Sidekicks. These racks circulate chilled fluid directly across the Maia silicon, allowing massive compute density without blowing datacenter thermal envelopes.

For enterprise leaders, CTOs, and developers, this vertical integration means faster inference, higher reliability, and more cost-effective AI solutions across Azure OpenAI Service.

Thank you for tuning into Episode 99 of Voxstar AI Automation.

To read the complete research article and access full architectural notes, visit voxstar.substack.com. Subscribe to our podcast on Spotify and Apple Podcasts, and connect with me on LinkedIn and X at Gene Da Rocha.

Until next time, optimize your compute, keep innovating, and keep automating everything. I'm Gene Da Rocha.
"""
}

async def generate_ep99_audio():
    os.makedirs("podcast_assets/output", exist_ok=True)
    os.makedirs("public/podcast", exist_ok=True)
    
    ep_num = EPISODE_99["number"]
    voice_path = f"podcast_assets/output/ep{ep_num}_voice_raw.mp3"
    print(f"[{ep_num}] 1. Synthesizing voice with {VOICE}...")
    comm = edge_tts.Communicate(EPISODE_99["script"].strip(), VOICE, rate=RATE, pitch=PITCH)
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
        "-metadata", f"title={EPISODE_99['title']}",
        "-metadata", "artist=Gene Da Rocha",
        "-metadata", "album=Voxstar AI Automation",
        "-metadata", f"track={ep_num}",
        "-metadata", f"comment={EPISODE_99['subtitle']} | voxstar.substack.com",
        "-metadata", "genre=Podcast",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        final_output
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    subprocess.run(["cp", final_output, public_output], check=True)
    print(f"[{ep_num}] 3. Created public master: {public_output} ({os.path.getsize(public_output)} bytes)")

def generate_ep99_social_cover():
    """Generates 1024x1024 social graphic image for episode 99."""
    width, height = 1024, 1024
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Dark slate base
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(height):
        r = int(15 + (y / height) * 15)
        g = int(23 + (y / height) * 30)
        b = int(42 + (y / height) * 60)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Decorative tech grid / cyan cyber lines
    for x in range(0, width, 64):
        draw.line([(x, 0), (x, height)], fill=(30, 58, 138, 40), width=1)
    for y in range(0, height, 64):
        draw.line([(0, y), (width, y)], fill=(30, 58, 138, 40), width=1)

    # Accent Top Badge
    draw.rounded_rectangle([60, 60, 480, 110], radius=8, fill=(59, 130, 246))
    
    # Try loading fonts or fallback
    try:
        font_badge = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 52)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
        font_footer = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
    except:
        font_badge = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_footer = ImageFont.load_default()

    draw.text((80, 72), "VOXSTAR AI • EPISODE #99", fill=(255, 255, 255), font=font_badge)

    # Title lines
    title_text = "Microsoft Custom AI Chips:\nAzure Maia 100 & Cobalt 100"
    draw.text((60, 160), title_text, fill=(255, 255, 255), font=font_title)

    # Subtitle
    sub_text = "Powering OpenAI, Copilot & Azure Infrastructure\nWith Next-Gen 5nm Silicon & Liquid-Cooled Racks"
    draw.text((60, 310), sub_text, fill=(147, 197, 253), font=font_sub)

    # Key Stat Callout Cards
    # Card 1: Maia 100
    draw.rounded_rectangle([60, 430, 480, 620], radius=12, fill=(17, 24, 39), outline=(59, 130, 246), width=2)
    draw.text((85, 455), "AZURE MAIA 100", fill=(96, 165, 250), font=font_badge)
    draw.text((85, 495), "105 Billion Transistors\nCustom AI Acceleration\nOptimized for GPT-4 & LLMs", fill=(226, 232, 240), font=font_sub)

    # Card 2: Cobalt 100
    draw.rounded_rectangle([520, 430, 960, 620], radius=12, fill=(17, 24, 39), outline=(16, 185, 129), width=2)
    draw.text((545, 455), "AZURE COBALT 100", fill=(52, 211, 153), font=font_badge)
    draw.text((545, 495), "128-Core Armv9 CPU\n40% Energy Efficiency\nHigh-Density Cloud Compute", fill=(226, 232, 240), font=font_sub)

    # Host Banner Card
    draw.rounded_rectangle([60, 660, 960, 840], radius=12, fill=(15, 23, 42), outline=(236, 72, 153), width=2)
    draw.text((85, 685), "HOSTED BY GENE DA ROCHA", fill=(244, 114, 182), font=font_badge)
    draw.text((85, 730), "Founder & AI Systems Architect | Voxstar AI\nFull Broadcast on Spotify, Apple Podcasts & Substack", fill=(241, 245, 249), font=font_sub)

    # Footer Branding
    draw.text((60, 920), "voxstar.substack.com  •  @GeneDaRocha  •  Automating Everything", fill=(148, 163, 184), font=font_footer)

    output_path = "public/podcast/ep99_social_image.jpg"
    img.save(output_path, quality=95)
    print(f"[99] 4. Generated social cover artwork: {output_path}")

if __name__ == "__main__":
    asyncio.run(generate_ep99_audio())
    generate_ep99_social_cover()
