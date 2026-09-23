import os
import subprocess
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont

VOICE = "en-US-GuyNeural"
RATE = "+0%"
PITCH = "+0Hz"

EPISODE_98 = {
    "number": 98,
    "title": "#98 Google Unveils Arm-Based Data Center Processors to Accelerate AI & Cloud Compute",
    "subtitle": "Google Axion Silicon: Disrupting Intel and AMD with High-Efficiency Arm Architecture",
    "script": """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today, in Episode 98, we are exploring a landmark development in hyperscale infrastructure: Google unveiling its brand-new Arm-based data center processor, known as Google Axion.

In an aggressive push to cut energy consumption and reduce reliance on traditional x86 server chips from Intel and AMD, Google announced Axion—its first custom Arm-based central processing unit designed specifically for modern cloud data centers and high-throughput AI workloads.

According to Google's engineering benchmarks, Axion delivers up to 30% better performance than existing general-purpose Arm instances in the cloud, and an astounding 50% better performance and up to 60% better energy efficiency than comparable current-generation x86-based compute instances.

To understand why this is a pivotal moment in enterprise technology, let us look at the three major driving forces behind this move:

First, The Skyrocketing Energy Demands of Modern AI. The generative AI explosion has created an unprecedented power crunch across global data centers. Training and serving trillion-parameter models requires gigawatts of electricity. By transitioning foundational cloud services, databases, and microservices to highly efficient Arm architecture, Google can free up massive power and cooling capacity for its specialized TPU and GPU clusters.

Second, Full-Stack Silicon Vertical Integration. Following Apple's triumph with Apple Silicon on the consumer front and Amazon's success with Graviton in AWS, Google is completing its vertical silicon stack. With TPUs handling matrix acceleration and Axion handling general-purpose compute and data preprocessing, Google can optimize every layer of its infrastructure from the silicon die all the way to Kubernetes and Android.

Third, Frictionless Enterprise Migration. Axion is built on the standard Armv9 architecture and Neoverse V2 cores, meaning enterprise workloads running on Linux, open-source databases, and containerized microservices can migrate seamlessly without rewriting code.

For enterprise decision-makers and CTOs, the implications are clear: the cost curve of cloud computing and AI inference is shifting rapidly. Organizations deploying on Google Cloud can look forward to lower operational costs, reduced carbon footprints, and superior performance per dollar.

Thank you for tuning into Episode 98 of Voxstar AI Automation.

To read the complete research article and access full architectural notes, visit voxstar.substack.com. Subscribe to our podcast on Spotify and Apple Podcasts, and connect with me on LinkedIn and X at Gene Da Rocha.

Until next time, optimize your compute, keep innovating, and keep automating everything. I'm Gene Da Rocha.
"""
}

async def generate_ep98_audio():
    os.makedirs("podcast_assets/output", exist_ok=True)
    os.makedirs("public/podcast", exist_ok=True)
    
    ep_num = EPISODE_98["number"]
    voice_path = f"podcast_assets/output/ep{ep_num}_voice_raw.mp3"
    print(f"[{ep_num}] 1. Synthesizing voice with {VOICE}...")
    comm = edge_tts.Communicate(EPISODE_98["script"].strip(), VOICE, rate=RATE, pitch=PITCH)
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
        "-metadata", f"title={EPISODE_98['title']}",
        "-metadata", "artist=Gene Da Rocha",
        "-metadata", "album=Voxstar AI Automation",
        "-metadata", f"track={ep_num}",
        "-metadata", f"comment={EPISODE_98['subtitle']} | voxstar.substack.com",
        "-metadata", "genre=Podcast",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        final_output
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    subprocess.run(["cp", final_output, public_output], check=True)
    print(f"[{ep_num}] 3. Created public master: {public_output} ({os.path.getsize(public_output)} bytes)")

def generate_ep98_social_cover():
    """Generates 1024x1024 social graphic image for episode 98."""
    # Load base cover or create high-res gradient banner
    width, height = 1024, 1024
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Dark slate base
    draw = ImageDraw.Draw(img)

    # Gradient background
    for y in range(height):
        r = int(15 + (y / height) * 10)
        g = int(23 + (y / height) * 20)
        b = int(42 + (y / height) * 50)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Add accent glowing border
    draw.rectangle([(16, 16), (width - 16, height - 16)], outline=(59, 130, 246), width=3)
    draw.rectangle([(24, 24), (width - 24, height - 24)], outline=(139, 92, 246, 120), width=1)

    # Paste cover thumbnail if exists
    try:
        thumb = Image.open("podcast_assets/podcast_logo_cloudfront.jpg").convert("RGB")
        thumb = thumb.resize((240, 240))
        img.paste(thumb, (width // 2 - 120, 80))
        # border around thumb
        draw.rectangle([(width // 2 - 122, 78), (width // 2 + 121, 321)], outline=(147, 51, 234), width=2)
    except Exception as e:
        print("Could not paste thumb:", e)

    # We can use default or basic fonts or draw stylized text
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 46)
        font_mid = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 30)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
        font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20)
    except:
        font_large = ImageFont.load_default()
        font_mid = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Episode Pill Badge
    badge_text = "VOXSTAR AI AUTOMATION • EPISODE #98"
    draw.rounded_rectangle([(width // 2 - 280, 360), (width // 2 + 280, 405)], radius=10, fill=(30, 58, 138), outline=(96, 165, 250), width=2)
    draw.text((width // 2, 382), badge_text, fill=(255, 255, 255), font=font_badge, anchor="mm")

    # Main Headline
    draw.text((width // 2, 460), "GOOGLE UNVEILS ARM-BASED", fill=(255, 255, 255), font=font_large, anchor="mm")
    draw.text((width // 2, 515), "DATA CENTER PROCESSORS", fill=(56, 189, 248), font=font_large, anchor="mm")
    draw.text((width // 2, 570), "(GOOGLE AXION SILICON)", fill=(192, 132, 252), font=font_large, anchor="mm")

    # Subtitle cards
    points = [
        "⚡ 50% Higher Performance & 60% Better Energy Efficiency",
        "🚀 Disrupting x86 Dominance with Custom Armv9 Silicon",
        "🌐 Accelerating AI Cloud Pipelines & TPU Workloads",
        "🎙️ Hosted by Gene Da Rocha • Full Broadcast on Spotify"
    ]
    
    y_start = 650
    for i, pt in enumerate(points):
        box_top = y_start + (i * 68)
        draw.rounded_rectangle([(80, box_top), (width - 80, box_top + 54)], radius=8, fill=(17, 24, 39, 200), outline=(55, 65, 81), width=1)
        draw.text((110, box_top + 27), pt, fill=(243, 244, 246), font=font_sub, anchor="lm")

    # Footer
    draw.text((width // 2, 960), "voxstar.substack.com  •  open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8", fill=(156, 163, 175), font=font_sub, anchor="mm")

    img.save("public/podcast/ep98_social_image.jpg", "JPEG", quality=95)
    img.save("podcast_assets/output/ep98_social_image.jpg", "JPEG", quality=95)
    print("Created public/podcast/ep98_social_image.jpg successfully.")

if __name__ == "__main__":
    asyncio.run(generate_ep98_audio())
    generate_ep98_social_cover()
