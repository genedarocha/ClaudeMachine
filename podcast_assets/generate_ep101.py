import os
import subprocess
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont

VOICE = "en-US-GuyNeural"
RATE = "+0%"
PITCH = "+0Hz"

EPISODE_101 = {
    "number": 101,
    "title": "#101 Developing Autonomous Drones Using Python and AI",
    "subtitle": "Ardupilot, MAVLink, DroneKit and AI computer vision: how Python is powering autonomous drones",
    "script": """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today, in Episode 101, we are exploring a fascinating intersection of two transformative technologies: Developing Autonomous Drones Using Python and Artificial Intelligence.

The drone industry has entered a new era. What was once limited to remote-controlled hobbyist devices has evolved into fully autonomous systems capable of delivering packages, surveying agriculture, monitoring critical infrastructure, and even conducting search-and-rescue operations, all without direct human intervention.

At the heart of this revolution is Python, the programming language that has become the de facto standard for drone autonomy and AI integration.

Let us break down the key architectural pillars of autonomous drone development.

First, The Open-Source Software Stack. Platforms like Ardupilot and PX4 provide robust, battle-tested autopilot firmware. These open-source systems handle low-level flight control, stabilisation, GPS navigation, and sensor fusion, giving developers a solid foundation to build upon without starting from scratch.

Second, The MAVLink Communication Protocol. MAVLink is the lightweight messaging protocol that enables structured, real-time communication between drones and ground control stations. It transmits telemetry data, waypoints, and commands at high frequency, forming the nervous system of any autonomous drone deployment.

Third, Python and DroneKit. DroneKit is a Python library that provides high-level APIs for controlling drones. Using just a few lines of Python code, developers can command a drone to arm, take off, navigate to specific GPS coordinates, execute complex waypoint missions, and return to base, all programmatically. Python's simplicity and readability make it accessible even to engineers who are new to robotics.

Fourth, AI-Powered Computer Vision. By integrating Python AI frameworks like TensorFlow, PyTorch, and OpenCV, drones gain the ability to see and interpret their environment in real time. Object detection, obstacle avoidance, terrain classification, and autonomous landing zone identification all become possible when machine learning models run on edge computing hardware aboard the drone.

Fifth, Simulation Before Deployment. Tools like SITL, which stands for Software In The Loop, allow developers to test their Python drone scripts in a virtual environment before ever flying a physical aircraft. This dramatically reduces development risk, crash costs, and iteration time.

The practical applications are enormous. Precision agriculture drones can autonomously survey crop health using multispectral imaging. Delivery drones can navigate urban environments using AI path planning. Security drones can patrol perimeters with intelligent anomaly detection. And disaster response drones can map affected areas and locate survivors using thermal imaging.

For enterprise leaders and developers, the key takeaway is this: Python and AI have democratised autonomous drone development. The barriers to entry have never been lower, and the capabilities have never been greater.

Thank you for tuning into Episode 101 of Voxstar AI Automation. To read the complete research article on autonomous drone development with Python and AI, visit gene da rocha dot substack dot com. Subscribe to our podcast on Spotify and Apple Podcasts, and connect with me on LinkedIn and X at Gene Da Rocha.

Until next time, keep building, keep automating, and keep pushing the boundaries of what's possible. I'm Gene Da Rocha.
"""
}

async def generate_ep101_audio():
    os.makedirs("podcast_assets/output", exist_ok=True)
    os.makedirs("public/podcast", exist_ok=True)
    
    ep_num = EPISODE_101["number"]
    voice_path = f"podcast_assets/output/ep{ep_num}_voice_raw.mp3"
    print(f"[{ep_num}] 1. Synthesizing voice with {VOICE}...")
    comm = edge_tts.Communicate(EPISODE_101["script"].strip(), VOICE, rate=RATE, pitch=PITCH)
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
        "-metadata", f"title={EPISODE_101['title']}",
        "-metadata", "artist=Gene Da Rocha",
        "-metadata", "album=Voxstar AI Automation",
        "-metadata", f"track={ep_num}",
        "-metadata", f"comment={EPISODE_101['subtitle']} | genedarocha.substack.com",
        "-metadata", "genre=Podcast",
        "-metadata", "date=2026",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        final_output
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    subprocess.run(["cp", final_output, public_output], check=True)
    print(f"[{ep_num}] 3. Created public master: {public_output} ({os.path.getsize(public_output)} bytes)")

def generate_ep101_social_cover():
    """Generates 1024x1024 social graphic image for episode 101."""
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
    draw.text((width // 2, 86), "VOXSTAR AI AUTOMATION PODCAST • EP #101", fill=(255, 255, 255), font=font_badge, anchor="mm")

    # Episode Title
    draw.text((width // 2, 165), "#101 Autonomous Drones", fill=(255, 255, 255), font=font_title, anchor="mm")
    draw.text((width // 2, 215), "Developing Drones with Python and AI", fill=(147, 197, 253), font=font_title, anchor="mm")

    # Takeaways Box
    draw.rounded_rectangle([(60, 265), (width - 60, 830)], radius=20, fill=(15, 23, 42), outline=(59, 130, 246), width=2)

    takeaways = [
        "Open-Source Drone Stack: Ardupilot and PX4 handle stabilisation, GPS and sensor fusion.",
        "MAVLink Protocol: real-time telemetry, waypoints and commands to ground control.",
        "Python & DroneKit: arm, take off, fly missions and return to base in a few lines.",
        "AI Computer Vision: object detection and obstacle avoidance with PyTorch and OpenCV.",
        "SITL Simulation: test drone scripts virtually before any real flight."
    ]

    for i, t in enumerate(takeaways):
        box_y = 290 + i * 102
        draw.rounded_rectangle([(80, box_y), (width - 80, box_y + 84)], radius=14, fill=(30, 41, 59), outline=(71, 85, 105), width=1)
        draw.text((105, box_y + 42), f"•  {t}", fill=(243, 244, 246), font=font_bullet, anchor="lm")

    # Host Banner
    draw.rounded_rectangle([(60, 860), (width - 60, 975)], radius=18, fill=(15, 23, 42), outline=(147, 51, 234), width=2)
    draw.text((width // 2, 900), "Host: Gene Da Rocha  •  Voxstar AI Systems", fill=(255, 255, 255), font=font_host, anchor="mm")
    draw.text((width // 2, 940), "genedarocha.substack.com  •  open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8", fill=(156, 163, 175), font=font_sub, anchor="mm")

    public_img = "public/podcast/ep101_social_image.jpg"
    img.save(public_img, quality=95)
    print(f"[101] 4. Created public social graphic: {public_img}")

if __name__ == "__main__":
    asyncio.run(generate_ep101_audio())
    generate_ep101_social_cover()
