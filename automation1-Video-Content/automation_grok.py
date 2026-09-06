"""
Automation 1: xAI Grok Version
Uses xAI Grok API (Grok 2 / Grok 3) for witty, high-engagement viral copy and bold video hooks.
"""

import os
import json
import requests
from loop_engine import LoopEngine

def grok_synthesizer(idea_data: dict) -> dict:
    """
    Invokes xAI Grok API for contrarian, high-velocity viral video copy and packaging.
    """
    api_key = os.getenv("GROK_API_KEY", "")
    topic = idea_data.get("topic_idea", "")
    target_audience = idea_data.get("target_audience", "Tech founders & Creators")
    soundscape = idea_data.get("soundscape", "Gamma Retention Pulse")
    cta_type = idea_data.get("cta_type", "Visit wiredvibe.ai")

    prompt = f"""
    You are an irreverent, ultra-smart viral copywriter and video producer for Wiredvibeapp (wiredvibe.ai).
    Topic: "{topic}"
    Target Audience: {target_audience}
    Soundscape: {soundscape}
    CTA: {cta_type}

    Generate a high-velocity viral title, a futuristic video prompt, an engaging description, and an authentic CTA.
    Return JSON only:
    {{
        "title": "Bold viral hook title (under 70 chars with emoji)",
        "video_prompt": "Futuristic high-energy visual prompt",
        "description": "Engaging, punchy multi-platform copy",
        "cta": "Direct, cool Call To Action",
        "retention_score": 98
    }}
    """

    if api_key:
        try:
            url = "https://api.x.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "grok-beta",
                "messages": [
                    {"role": "system", "content": "You are Grok, an expert viral automation engineer."},
                    {"role": "user", "content": prompt}
                ]
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                text_out = res.json()["choices"][0]["message"]["content"]
                clean_json = text_out.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_json)
        except Exception as e:
            print(f"⚠️ Grok API fallback triggered: {e}")

    # Fallback template
    return {
        "title": f"⚡ Why 99% of Focus Advice is Wrong (And What Neural Audio Actually Does)",
        "video_prompt": f"Hyper-modern cybernetic studio, neon orange and deep purple light beams interacting with acoustic waveforms, rapid kinetic text animations",
        "description": f"Forget drinking a 4th espresso. Your brain is an electrical circuit and frequency modulation is the volume knob. Wiredvibe (wiredvibe.ai) uses science-backed auditory soundscapes that eliminate distractions in 60 seconds flat.\n\nAutomate your content loop, supercharge your output.",
        "cta": f"🚀 Want the complete automation code? Drop 'GROK' below or {cta_type}!",
        "retention_score": 98
    }

if __name__ == "__main__":
    print("🤖 Launching Automation 1: xAI Grok Autopilot Engine...")
    engine = LoopEngine(model_name="xAI Grok 2 / 3", ai_synthesizer=grok_synthesizer)
    engine.run_single_loop()
