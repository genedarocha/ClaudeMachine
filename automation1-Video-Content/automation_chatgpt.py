"""
Automation 1: OpenAI ChatGPT Version
Uses OpenAI API (GPT-4o / GPT-4o-mini) + OpenAI Sora Video formatting.
"""

import os
import json
import requests
from loop_engine import LoopEngine

def chatgpt_synthesizer(idea_data: dict) -> dict:
    """
    Invokes OpenAI ChatGPT Chat Completions API with structured JSON output.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    topic = idea_data.get("topic_idea", "")
    target_audience = idea_data.get("target_audience", "Tech founders & Creators")
    soundscape = idea_data.get("soundscape", "Gamma Retention Pulse")
    cta_type = idea_data.get("cta_type", "Visit wiredvibe.ai")

    prompt = f"""
    You are an elite short-form video creator for Wiredvibeapp (wiredvibe.ai).
    Topic: "{topic}"
    Target Audience: {target_audience}
    Soundscape: {soundscape}
    CTA: {cta_type}

    Generate high-converting video metadata with a strong pattern-interrupt hook and a cool CTA.
    Return JSON only:
    {{
        "title": "Pattern interrupt hook title (under 70 chars with emoji)",
        "video_prompt": "Cinematic visual prompt for video rendering",
        "description": "Multi-platform high-conversion copy",
        "cta": "Irresistible CTA",
        "retention_score": 97
    }}
    """

    if api_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o",
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": "You are a viral growth engineer and social video automator."},
                    {"role": "user", "content": prompt}
                ]
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                text_out = res.json()["choices"][0]["message"]["content"]
                return json.loads(text_out)
        except Exception as e:
            print(f"⚠️ ChatGPT API fallback triggered: {e}")

    # Fallback template
    return {
        "title": f"🚀 Stop Forcing Focus: How 40Hz Audio Retrains Your Brain",
        "video_prompt": f"Dynamic isometric 3D animation of neural pathways lighting up in electric blue as binaural soundwaves ripple across the screen, sleek minimal UI overlay",
        "description": f"Willpower is overrated. Neuro-entrainment is reproducible. Wiredvibe (wiredvibe.ai) plays frequency-modulated soundscapes that naturally synchronize your brainwaves into deep concentration.\n\nAutomate your content, elevate your focus.",
        "cta": f"👉 {cta_type} to claim your free soundscape starter kit!",
        "retention_score": 97
    }

if __name__ == "__main__":
    print("🤖 Launching Automation 1: OpenAI ChatGPT Autopilot Engine...")
    engine = LoopEngine(model_name="OpenAI ChatGPT / GPT-4o", ai_synthesizer=chatgpt_synthesizer)
    engine.run_single_loop()
