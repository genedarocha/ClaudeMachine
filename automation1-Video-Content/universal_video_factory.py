#!/usr/bin/env python3
"""
Universal 30-Second Video Factory & Social Syndication Engine
Supports AIToolboard.com tools, Voxstar ecosystem, SaaS apps, and any company directory.

Workflow:
1. Ingestion: Reads company/product list from CSV, JSON, or direct arguments.
2. Script Synthesis: Generates structured 30-second 5-scene viral scripts (Hook, Pain, Solution, Killer Feature, CTA).
3. Audio Synthesis: Produces crisp broadcast voiceover via zero-cost local Edge-TTS / Kokoro (£0 cost).
4. Subtitle & Overlay Generation: Generates timed SRT captions and FFmpeg text cards.
5. 1080x1920 9:16 Video Rendering: Renders vertical MP4 video via FFmpeg with animated backgrounds and text overlays.
6. Social Packaging: Formats ready-to-publish bundles for TikTok, Instagram Reels, YouTube Shorts, X, and LinkedIn.
"""

import os
import sys
import csv
import json
import time
import argparse
import subprocess
import shutil
from typing import Dict, Any, List, Optional

# Mandatory & Global Brand Hashtags
MANDATORY_BRAND_TAGS = "#voxstar #voxstarai #wiredvibeapp #atltrust #aitoolboard #aitools #futuretech"

class UniversalVideoFactory:
    def __init__(self, output_dir: str = "output_videos", voice: str = "en-US-GuyNeural"):
        self.output_dir = output_dir
        self.voice = voice
        os.makedirs(self.output_dir, exist_ok=True)
        self.has_ffmpeg = shutil.which("ffmpeg") is not None

    def ingest_csv(self, csv_path: str) -> List[Dict[str, Any]]:
        """Parses products/companies from CSV."""
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV file not found: {csv_path}")
        
        products = []
        with open(csv_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                products.append({
                    "id": row.get("id", str(len(products) + 1)),
                    "name": row.get("name", "").strip(),
                    "category": row.get("category", "AI Tool").strip(),
                    "tagline": row.get("tagline", "").strip(),
                    "problem_solved": row.get("problem_solved", "").strip(),
                    "killer_feature": row.get("killer_feature", "").strip(),
                    "pricing": row.get("pricing", "Free Access").strip(),
                    "target_audience": row.get("target_audience", "Founders & Creators").strip(),
                    "cta_url": row.get("cta_url", "https://aitoolboard.com").strip(),
                    "brand_hashtags": row.get("brand_hashtags", "").strip()
                })
        return products

    def generate_30s_script(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a high-retention 5-scene 30-second script for vertical video.
        Strict timing: 0-3s Hook, 3-9s Pain, 9-18s Demo/Solution, 18-24s Feature, 24-30s CTA.
        """
        name = product.get("name", "This Secret AI Tool")
        tagline = product.get("tagline", "Automate your daily workflow in seconds.")
        pain = product.get("problem_solved", "doing repetitive tasks manually and wasting hours.")
        feature = product.get("killer_feature", "autonomous intelligence with instant one-click results.")
        cta_url = product.get("cta_url", "aitoolboard.com")
        pricing = product.get("pricing", "Free")

        # 5 distinct scenes for exact 30s pacing
        scenes = [
            {
                "scene_number": 1,
                "time_range": "0:00 - 0:03",
                "duration_sec": 3.0,
                "label": "Viral Pattern Interrupt",
                "onscreen_text": f"🚨 STOP WASTING HOURS!\nCheck out {name}",
                "narration": f"Stop doing this manually in 2026. This secret AI tool called {name} changes everything."
            },
            {
                "scene_number": 2,
                "time_range": "0:03 - 0:09",
                "duration_sec": 6.0,
                "label": "Pain Point / Problem",
                "onscreen_text": f"THE PROBLEM:\n{pain[:65]}...",
                "narration": f"Most creators and founders waste countless hours {pain}."
            },
            {
                "scene_number": 3,
                "time_range": "0:09 - 0:18",
                "duration_sec": 9.0,
                "label": "Solution & Demo",
                "onscreen_text": f"MEET {name.upper()}:\n{tagline[:70]}",
                "narration": f"Here is how {name} fixes it. {tagline}."
            },
            {
                "scene_number": 4,
                "time_range": "0:18 - 0:24",
                "duration_sec": 6.0,
                "label": "Killer Feature & Edge",
                "onscreen_text": f"KILLER FEATURE:\n⚡ {feature[:65]}",
                "narration": f"Its killer superpower? {feature}. Plus it starts at {pricing}."
            },
            {
                "scene_number": 5,
                "time_range": "0:24 - 0:30",
                "duration_sec": 6.0,
                "label": "Call To Action & Link",
                "onscreen_text": f"TRY IT TODAY:\n👉 {cta_url}",
                "narration": f"Try it today at {cta_url} or tap the link in bio to test it out."
            }
        ]

        full_narration = " ".join([s["narration"] for s in scenes])
        
        # Viral hook title variations
        hook_titles = [
            f"This AI Tool Replaces 10 Hours of Work in 30 Seconds ({name})",
            f"The Hidden AI Gem Nobody Is Talking About: {name}",
            f"Why Everyone Is Switching to {name} in 2026",
            f"I Tested {name} So You Don't Have To (Shocking Results)"
        ]

        return {
            "product_name": name,
            "category": product.get("category", "AI Software"),
            "hook_title": hook_titles[0],
            "hook_variations": hook_titles,
            "scenes": scenes,
            "full_narration": full_narration,
            "cta_url": cta_url,
            "pricing": pricing
        }

    def generate_voiceover(self, text: str, output_audio_path: str) -> bool:
        """Synthesizes voiceover using local edge-tts or python TTS."""
        print(f"🎙️ [Voiceover Engine] Synthesizing speech for 30s video...")
        try:
            # Try edge-tts via command line
            cmd = [
                "edge-tts",
                "--voice", self.voice,
                "--text", text,
                "--write-media", output_audio_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
            if result.returncode == 0 and os.path.exists(output_audio_path) and os.path.getsize(output_audio_path) > 1000:
                print(f"   ✓ Audio generated via edge-tts: {output_audio_path}")
                return True
        except Exception as e:
            print(f"   ⚠️ edge-tts CLI skipped ({e}). Falling back to python edge_tts...")

        try:
            import asyncio
            import edge_tts

            async def _synth():
                communicate = edge_tts.Communicate(text, self.voice)
                await communicate.save(output_audio_path)

            asyncio.run(_synth())
            if os.path.exists(output_audio_path) and os.path.getsize(output_audio_path) > 1000:
                print(f"   ✓ Audio generated via Python edge_tts: {output_audio_path}")
                return True
        except Exception as e:
            print(f"   ⚠️ Python edge_tts failed ({e}). Generating fallback silence / mock track.")

        # Fallback: create empty/mock audio file if no TTS library available
        with open(output_audio_path, "wb") as f:
            f.write(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00")
        return False

    def generate_subtitles_srt(self, scenes: List[Dict[str, Any]], output_srt_path: str):
        """Generates standard SRT subtitles matched with the 5 scene time intervals."""
        srt_content = []
        cumulative_time = 0.0

        for idx, scene in enumerate(scenes, 1):
            dur = scene["duration_sec"]
            start_s = cumulative_time
            end_s = cumulative_time + dur
            cumulative_time = end_s

            start_str = self._format_srt_time(start_s)
            end_str = self._format_srt_time(end_s)

            srt_content.append(f"{idx}")
            srt_content.append(f"{start_str} --> {end_str}")
            srt_content.append(scene["narration"])
            srt_content.append("")

        with open(output_srt_path, "w", encoding="utf-8") as f:
            f.write("\n".join(srt_content))
        print(f"   ✓ Subtitle SRT saved: {output_srt_path}")

    def _format_srt_time(self, seconds: float) -> str:
        hrs = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        msecs = int((seconds - int(seconds)) * 1000)
        return f"{hrs:02d}:{mins:02d}:{secs:02d},{msecs:03d}"

    def render_vertical_video(self, script_data: Dict[str, Any], audio_path: str, output_video_path: str) -> bool:
        """
        Renders a crisp 1080x1920 (9:16) MP4 video using high-res Pillow graphical cards
        and FFmpeg concatenation + audio muxing.
        """
        if not self.has_ffmpeg:
            print(f"   ⚠️ FFmpeg not found in system PATH. Video render skipped. (Audio & metadata preserved).")
            return False

        try:
            from PIL import Image, ImageDraw, ImageFont
        except ImportError:
            print(f"   ⚠️ Pillow not available for frame rendering.")
            return False

        print(f"🎬 [Video Engine] Rendering 1080x1920 9:16 Vertical Video with FFmpeg & Pillow...")
        product_name = script_data.get("product_name", "AI Product")
        category = script_data.get("category", "AI Product").upper()
        cta_url = script_data.get("cta_url", "aitoolboard.com").replace("https://", "")
        scenes = script_data.get("scenes", [])

        # Directory for temporary scene frames
        frames_dir = os.path.join(self.output_dir, "temp_frames")
        os.makedirs(frames_dir, exist_ok=True)
        segment_videos = []

        # Load fonts
        try:
            font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
            font_header = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
            font_label = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 44)
            font_body = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 38)
            font_footer = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
        except Exception:
            font_title = font_header = font_label = font_body = font_footer = ImageFont.load_default()

        # Scene accent colors
        accent_colors = [
            (244, 63, 94),   # Scene 1: Viral Rose
            (251, 191, 36),  # Scene 2: Problem Amber
            (52, 211, 153),  # Scene 3: Solution Emerald
            (168, 85, 247),  # Scene 4: Superpower Purple
            (56, 189, 248)   # Scene 5: CTA Cyan
        ]

        for idx, sc in enumerate(scenes):
            img = Image.new("RGB", (1080, 1920), color=(11, 15, 25))
            draw = ImageDraw.Draw(img)

            # 1. Top Header Banner
            draw.rounded_rectangle([60, 100, 1020, 190], radius=14, fill=(30, 41, 59), outline=(99, 102, 241), width=3)
            draw.text((540, 145), "⚡ AITOOLBOARD SPOTLIGHT", font=font_header, fill=(129, 140, 248), anchor="mm")

            # 2. Product Name Card
            draw.rounded_rectangle([80, 240, 1000, 430], radius=18, fill=(15, 23, 42), outline=(56, 189, 248), width=3)
            draw.text((540, 310), product_name, font=font_title, fill=(255, 255, 255), anchor="mm")
            draw.text((540, 380), f"[{category}]", font=font_footer, fill=(56, 189, 248), anchor="mm")

            # 3. Dynamic Scene Card
            accent = accent_colors[idx % len(accent_colors)]
            draw.rounded_rectangle([80, 520, 1000, 1100], radius=22, fill=(15, 23, 42), outline=accent, width=4)
            
            # Scene Label Pill
            draw.rounded_rectangle([300, 560, 780, 630], radius=12, fill=accent)
            draw.text((540, 595), sc.get("label", "SCENE").upper(), font=font_header, fill=(11, 15, 25), anchor="mm")

            # On-screen text & narration highlight
            text_lines = sc.get("onscreen_text", "").split("\n")
            y_offset = 720
            for line in text_lines:
                draw.text((540, y_offset), line, font=font_label, fill=(255, 255, 255), anchor="mm")
                y_offset += 70

            # Subtitle narration snippet
            narration_snippet = f'"{sc.get("narration", "")[:100]}..."'
            draw.text((540, 980), narration_snippet, font=font_body, fill=(254, 240, 138), anchor="mm")

            # 4. Footer Brand & Links
            draw.rounded_rectangle([80, 1600, 1000, 1780], radius=16, fill=(30, 41, 59), outline=(71, 85, 105), width=2)
            draw.text((540, 1650), f"👉 Link in Bio or Visit: {cta_url}", font=font_body, fill=(56, 189, 248), anchor="mm")
            draw.text((540, 1720), "#aitoolboard #voxstar #futuretech #ai", font=font_footer, fill=(148, 163, 184), anchor="mm")

            # 5. Scene Progress Indicator
            progress_w = int((idx + 1) / len(scenes) * 920)
            draw.rectangle([80, 1860, 80 + progress_w, 1880], fill=(99, 102, 241))

            frame_img_path = os.path.join(frames_dir, f"scene_{idx + 1}.png")
            img.save(frame_img_path)

            # Render individual segment video for this scene duration
            dur = sc.get("duration_sec", 6.0)
            seg_video_path = os.path.join(frames_dir, f"seg_{idx + 1}.mp4")
            cmd_seg = [
                "ffmpeg", "-y", "-loop", "1", "-i", frame_img_path,
                "-c:v", "libx264", "-t", str(dur), "-pix_fmt", "yuv420p", "-r", "30",
                seg_video_path
            ]
            subprocess.run(cmd_seg, check=True, capture_output=True)
            segment_videos.append(seg_video_path)

        # Concatenate scene video segments and merge with voiceover audio
        concat_list_file = os.path.join(frames_dir, "concat_list.txt")
        with open(concat_list_file, "w") as f:
            for seg in segment_videos:
                f.write(f"file '{os.path.abspath(seg)}'\n")

        raw_video_path = os.path.join(frames_dir, "raw_video.mp4")
        cmd_concat = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list_file,
            "-c", "copy", raw_video_path
        ]
        subprocess.run(cmd_concat, check=True, capture_output=True)

        # Final merge with audio
        cmd_final = [
            "ffmpeg", "-y", "-i", raw_video_path, "-i", audio_path,
            "-c:v", "copy", "-c:a", "aac", "-shortest", "-movflags", "+faststart",
            output_video_path
        ]
        try:
            subprocess.run(cmd_final, check=True, capture_output=True, timeout=120)
            # Clean up temp frames
            shutil.rmtree(frames_dir, ignore_errors=True)
            print(f"   ✅ [Render Success] 1080x1920 30s MP4 ready: {output_video_path}")
            return True
        except Exception as e:
            print(f"   ⚠️ Final FFmpeg merge failed: {e}")
            return False

    def package_social_metadata(self, product: Dict[str, Any], script_data: Dict[str, Any]) -> Dict[str, Any]:
        """Formats optimized metadata packages for TikTok, Instagram Reels, YouTube Shorts, X, and LinkedIn."""
        name = product["name"]
        cta = product.get("cta_url", "https://aitoolboard.com")
        extra_tags = product.get("brand_hashtags", "")

        all_hashtags = f"{MANDATORY_BRAND_TAGS} {extra_tags}".strip()

        # TikTok Package
        tiktok = {
            "title": f"Stop doing this manually! {name} AI #aitools #futuretech",
            "caption": (
                f"🚨 Stop wasting hours doing this manually!\n\n"
                f"Meet {name} — {product.get('tagline', '')}\n\n"
                f"⚡ Killer Feature: {product.get('killer_feature', '')}\n"
                f"💰 Pricing: {product.get('pricing', 'Free')}\n\n"
                f"👉 Link in bio to test it or visit {cta}\n\n"
                f"{all_hashtags}"
            ),
            "sound_recommendation": "Trending Tech / Phonk Beat (Muted background audio)"
        }

        # Instagram Reels Package
        instagram = {
            "caption": (
                f"Is this the best AI tool of 2026? 🤔\n\n"
                f"We just tested {name} and it automates {product.get('problem_solved', '')} in seconds.\n\n"
                f"Key Superpower: {product.get('killer_feature', '')}\n\n"
                f"🔗 Bookmark this reel & tap the link in bio to try it for free: {cta}\n\n"
                f".\n.\n.\n"
                f"{all_hashtags}"
            ),
            "cover_text": f"SECRET AI GEM:\n{name}"
        }

        # YouTube Shorts Package
        youtube = {
            "title": f"{name}: The AI Tool That Automates Your Workflow in 30s #Shorts",
            "description": (
                f"⚡ Spotlight on {name} | Curated by AIToolboard & Voxstar AI\n\n"
                f"Summary: {product.get('tagline', '')}\n"
                f"Problem Solved: {product.get('problem_solved', '')}\n"
                f"Superpower: {product.get('killer_feature', '')}\n\n"
                f"🔗 Explore {name} and 1,000+ top AI agents:\n"
                f"👉 {cta}\n\n"
                f"🌐 Connected Ecosystem:\n"
                f"• AIToolboard: https://aitoolboard.com\n"
                f"• Voxstar: https://voxstar.ai\n"
                f"• WiredVibe: https://wiredvibeapp.com\n\n"
                f"{all_hashtags} #Shorts #TechReview #AIApps"
            ),
            "tags": ["Shorts", name, "AIToolboard", "AI Tools", "Productivity", "Tech News", "Voxstar", "SaaS"]
        }

        # LinkedIn & X
        linkedin = {
            "post_body": (
                f"🚀 AI Tool Spotlight: {name}\n\n"
                f"If your team is spending hours {product.get('problem_solved', '')}, you need to look at {name}.\n\n"
                f"What it does: {product.get('tagline', '')}\n"
                f"Standout Capability: {product.get('killer_feature', '')}\n\n"
                f"Check out the live directory listing on AIToolboard: {cta}\n\n"
                f"{all_hashtags}"
            )
        }

        return {
            "product_name": name,
            "tiktok": tiktok,
            "instagram": instagram,
            "youtube": youtube,
            "linkedin": linkedin
        }

    def process_single_company(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Runs full 30s video generation lifecycle for one company."""
        print(f"\n==================================================================")
        print(f"🚀 Processing 30s Video Factory for: {product.get('name', 'Company')}")
        print(f"==================================================================")

        safe_name = "".join(c for c in product.get("name", "tool") if c.isalnum() or c in ("-", "_")).lower()
        
        # 1. Script Generation
        script_data = self.generate_30s_script(product)
        
        # 2. Audio Synthesis
        audio_path = os.path.join(self.output_dir, f"{safe_name}_voiceover.mp3")
        self.generate_voiceover(script_data["full_narration"], audio_path)

        # 3. Subtitles
        srt_path = os.path.join(self.output_dir, f"{safe_name}_captions.srt")
        self.generate_subtitles_srt(script_data["scenes"], srt_path)

        # 4. Video Render
        video_path = os.path.join(self.output_dir, f"{safe_name}_30s_short.mp4")
        video_rendered = self.render_vertical_video(script_data, audio_path, video_path)

        # 5. Social Packages
        social_package = self.package_social_metadata(product, script_data)

        # 6. Save JSON Bundle
        json_path = os.path.join(self.output_dir, f"{safe_name}_package.json")
        bundle = {
            "product": product,
            "script": script_data,
            "assets": {
                "voiceover_audio": audio_path,
                "subtitles_srt": srt_path,
                "video_mp4": video_path if video_rendered else None,
                "rendered": video_rendered
            },
            "social_syndication": social_package
        }

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(bundle, f, indent=2)

        print(f"✅ Distribution bundle created: {json_path}")
        return bundle

    def process_batch(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Processes a list of multiple companies sequentially."""
        results = []
        for p in products:
            res = self.process_single_company(p)
            results.append(res)
        return results


def main():
    parser = argparse.ArgumentParser(description="Universal 30-Second Video Factory for AIToolboard and Companies")
    parser.add_argument("--input", "-i", default="company_directory_sample.csv", help="Path to company list CSV")
    parser.add_argument("--output_dir", "-o", default="output_videos", help="Directory to save videos and packages")
    parser.add_argument("--single_company", "-s", help="Name of a single company to run")
    parser.add_argument("--voice", "-v", default="en-US-GuyNeural", help="TTS Voice name (e.g. en-US-GuyNeural, en-US-JennyNeural)")
    parser.add_argument("--dry_run", action="store_true", help="Generate scripts and metadata without rendering heavy video")

    args = parser.parse_args()

    factory = UniversalVideoFactory(output_dir=args.output_dir, voice=args.voice)
    
    # Load products
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = args.input if os.path.isabs(args.input) else os.path.join(script_dir, args.input)

    if not os.path.exists(csv_file):
        print(f"Creating default sample CSV at {csv_file}...")
        csv_file = os.path.join(script_dir, "company_directory_sample.csv")

    products = factory.ingest_csv(csv_file)
    print(f"Loaded {len(products)} companies/products from {csv_file}")

    if args.single_company:
        products = [p for p in products if args.single_company.lower() in p["name"].lower()]
        if not products:
            print(f"No company matched '{args.single_company}'. Using first item.")
            products = [factory.ingest_csv(csv_file)[0]]

    if args.dry_run:
        factory.has_ffmpeg = False

    results = factory.process_batch(products)
    print(f"\n🎉 Successfully processed {len(results)} 30-second video packages in '{args.output_dir}'!")


if __name__ == "__main__":
    main()
