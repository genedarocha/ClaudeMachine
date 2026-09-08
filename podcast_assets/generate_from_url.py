#!/usr/bin/env python3
"""
Voxstar AI Automation - Automated URL-to-Podcast Engine
Usage:
    python podcast_assets/generate_from_url.py --url "<SUBSTACK_OR_BLOG_URL>" --ep 95
"""
import sys
import os
import argparse
import asyncio
import urllib.request
import re
import subprocess
import edge_tts
from bs4 import BeautifulSoup

def fetch_article_text(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8")
    
    soup = BeautifulSoup(html, "html.parser")
    title = soup.find("title").text if soup.find("title") else "New Episode"
    
    # Extract body paragraphs
    paragraphs = []
    body_div = soup.find("div", class_="dt-post-body") or soup.find("article") or soup.find("body")
    if body_div:
        for p in body_div.find_all(["p", "h2", "h3", "h4"]):
            txt = p.text.strip()
            # filter out boilerplate
            if "Substack is a reader-supported publication" in txt or "#" in txt and len(txt) > 50:
                continue
            if txt:
                paragraphs.append(txt)
    
    content = "\n\n".join(paragraphs)
    return title, content

async def synthesize_script(script_text: str, output_path: str, voice: str = "en-GB-RyanNeural"):
    communicate = edge_tts.Communicate(script_text.strip(), voice, rate="+3%", pitch="+0Hz")
    await communicate.save(output_path)

def stitch_master(intro_wav: str, body_mp3: str, artwork_jpg: str, output_mp3: str, title: str, ep_num: int):
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", intro_wav,
        "-i", body_mp3,
        "-i", artwork_jpg,
        "-filter_complex",
        "[0:a][1:a]concat=n=2:v=0:a=1[aout];[aout]loudnorm=I=-16:TP=-1.5:LRA=11[norm]",
        "-map", "[norm]",
        "-map", "2:v",
        "-c:v", "copy",
        "-id3v2_version", "3",
        "-metadata:s:v", "title=Episode Artwork",
        "-metadata:s:v", "comment=Cover (front)",
        "-metadata", f"title={title}",
        "-metadata", "artist=Gene Da Rocha",
        "-metadata", "album=Voxstar AI Automation",
        "-metadata", f"track={ep_num}",
        "-metadata", "genre=Podcast",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        output_mp3
    ]
    subprocess.run(ffmpeg_cmd, check=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Voxstar Podcast Episode from Blog URL")
    parser.add_argument("--url", required=True, help="Article/Blog URL")
    parser.add_argument("--ep", type=int, required=True, help="Episode Number")
    args = parser.parse_args()

    print(f"=== Voxstar Automated Podcast Pipeline (Episode #{args.ep}) ===")
    print(f"1. Ingesting URL: {args.url}")
    # Ingestion & generation logic
