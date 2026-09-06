"""
Automation 1: Anthropic Claude Version
Uses Anthropic Claude API (Claude 3.7 Sonnet / Claude 3.5 Haiku) for nuanced prompt engineering and video packaging.
"""

import os
import json
import requests
from loop_engine import LoopEngine

def claude_synthesizer(idea_data: dict) -> dict:
    """
    Invokes Anthropic Claude Messages API to engineer viral video script, hook, description, and CTA.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    topic = idea_data.get("topic_idea", "")
    target_audience = idea_data.get("target_audience", "Tech founders & Creators")
    soundscape = idea_data.get("soundscape", "Gamma Retention Pulse")
    cta_type = idea_data.get("cta_type", "Visit wiredvibe.ai")

    prompt = f"""
    You are an elite video producer and copywriter for Wiredvibeapp (wiredvibe.ai).
    Topic: "{topic}"
    Audience: {target_audience}
    Soundscape: {soundscape}
    CTA: {cta_type}

    Run a loop engineering pass to create an irresistible short video concept, viral title, high-value caption, and compelling CTA.
    Return ONLY valid JSON matching this schema:
    {{
        "title": "Viral Hook Title (under 70 chars with emoji)",
        "video_prompt": "Cinematic visual prompt for AI video renderer",
        "description": "Engaging description for multi-platform posting",
        "cta": "Cool Call To Action",
        "retention_score": 99
    }}
    """

    if api_key:
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            if res.status_code == 200:
                text_out = res.json()["content"][0]["text"]
                # Clean markdown backticks if any
                clean_json = text_out.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_json)
        except Exception as e:
            print(f"⚠️ Claude API fallback triggered: {e}")

    # Fallback template
    return {
        "title": f"🧠 The Cognitive Science Behind 3-Hour Deep Work Sessions",
        "video_prompt": f"Close-up of developer wearing headphones in a dark neon ambient workspace, brain activity graphic pulsing in sync with sound waves, 8k resolution, cinematic lighting",
        "description": f"When your brain enters alpha and gamma states, dopamine stabilizes and mental resistance drops. Wiredvibe (wiredvibe.ai) engineers soundscapes specifically tuned to align neural frequencies for effortless focus.\n\nDiscover how founders and engineers automate their day while staying in deep flow.",
        "cta": f"🔥 Drop 'NEURO' below or {cta_type} for instant access!",
        "retention_score": 99
    }

if __name__ == "__main__":
    print("🤖 Launching Automation 1: Anthropic Claude Autopilot Engine...")
    engine = LoopEngine(model_name="Anthropic Claude 3.7 Sonnet", ai_synthesizer=claude_synthesizer)
    engine.run_single_loop()
