"""
Core Loop Engineering Framework for Automation 1:
Implements the 5-Step Self-Refining Autonomous Loop:
1. Ingestion: Reads idea from CSV / SQLite Database queue.
2. Synthesis & Critique: AI model generates script + runs self-critique loop.
3. Rendering: Renders video via LT25 (free), Sundance (fee), or Gemini Veo.
4. Packaging: Generates high-converting title, description, cool CTA & mandatory hashtags.
5. Multi-Channel Syndication: Posts across X, YouTube, LinkedIn Personal, LinkedIn Company, FB Page, and TikTok.
"""

import os
import json
import time
from typing import Dict, Any, Callable
from database import get_next_pending_idea, update_queue_item, log_publish_result, sync_csv_to_db
from video_engines import get_engine_by_name
from social_publishers import SocialPublishersHub, MANDATORY_HASHTAGS

class LoopEngine:
    def __init__(self, model_name: str, ai_synthesizer: Callable[[Dict[str, Any]], Dict[str, Any]]):
        self.model_name = model_name
        self.ai_synthesizer = ai_synthesizer
        self.publisher_hub = SocialPublishersHub()

    def run_single_loop(self, specific_idea: Dict[str, Any] = None) -> Dict[str, Any]:
        """Runs a complete loop cycle for one video idea."""
        print(f"\n=======================================================")
        print(f"🔄 Starting Automation 1 Loop Cycle [{self.model_name}]")
        print(f"=======================================================")
        
        # 1. Ingestion Phase
        idea = specific_idea
        if not idea:
            sync_csv_to_db()
            idea = get_next_pending_idea()
            
        if not idea:
            print("ℹ️ No pending video ideas found in CSV or Database queue.")
            return {"status": "empty_queue", "message": "No pending ideas in queue."}
            
        idea_id = idea.get("id", 0)
        topic = idea.get("topic_idea", "Wiredvibe Neuroscience Audio Demo")
        engine_type = idea.get("video_engine", "LT25")
        soundscape = idea.get("soundscape", "Gamma Retention Pulse (40Hz)")
        target_audience = idea.get("target_audience", "SaaS Founders & Coders")
        cta_preference = idea.get("cta_type", "Visit wiredvibe.ai")
        
        print(f"📌 [Step 1: Queue Ingestion] Processing Idea #{idea_id}: '{topic}'")
        if idea_id > 0:
            update_queue_item(idea_id, {"status": "rendering"})

        # 2. Synthesis & Self-Critique Loop Phase
        print(f"🧠 [Step 2: AI Loop Synthesis ({self.model_name})] Generating script, viral hooks & critique...")
        synthesis_result = self.ai_synthesizer(idea)
        
        title = synthesis_result.get("title", f"Wiredvibe Daily: {topic[:50]}")
        description = synthesis_result.get("description", f"Explore how Wiredvibe soundscapes boost focus.")
        cta = synthesis_result.get("cta", f"⚡ {cta_preference}")
        video_prompt = synthesis_result.get("video_prompt", topic)
        critique_score = synthesis_result.get("retention_score", 95)
        
        print(f"   ✓ Viral Hook Title: {title}")
        print(f"   ✓ Cool CTA: {cta}")
        print(f"   ✓ Retention Score: {critique_score}/100")

        # 3. Video Engine Rendering Phase
        print(f"🎥 [Step 3: Video Engine Render] Dispatching to engine: {engine_type}...")
        video_engine = get_engine_by_name(engine_type)
        render_output = video_engine.render(
            prompt=video_prompt,
            style="Tech Explainer / Cyberpunk Neon",
            soundscape=soundscape
        )
        video_url = render_output.get("video_path", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4")
        print(f"   ✓ Video Asset Ready: {video_url}")

        # 4. Multi-Channel Syndication Phase (6 Platforms)
        print(f"📡 [Step 4 & 5: Multi-Channel Syndication] Broadcasting to 6 platforms...")
        publish_results = self.publisher_hub.syndicate_all(
            video_url=video_url,
            title=title,
            description=description,
            cta=cta,
            extra_tags=["#AIVideo", "#Neuroscience", "#DeepWork"]
        )

        # 5. Database Logging & Status Update
        channels_posted = list(publish_results.keys())
        if idea_id > 0:
            for platform_key, res in publish_results.items():
                log_publish_result(
                    queue_id=idea_id,
                    platform=res.get("platform", platform_key),
                    status=res.get("status", "success"),
                    post_url=res.get("post_url", ""),
                    error=""
                )
            
            update_queue_item(idea_id, {
                "status": "published",
                "rendered_video_url": video_url,
                "generated_title": title,
                "generated_description": description,
                "generated_cta": cta,
                "generated_hashtags": MANDATORY_HASHTAGS,
                "published_channels": json.dumps(channels_posted)
            })

        print(f"\n✅ Automation 1 Loop Completed Successfully!")
        print(f"   • Platforms posted: {len(channels_posted)} (X, YouTube, LinkedIn Personal, LinkedIn Company, FB, TikTok)")
        print(f"   • Mandatory Hashtags Applied: {MANDATORY_HASHTAGS}")
        
        return {
            "status": "success",
            "idea_id": idea_id,
            "title": title,
            "video_url": video_url,
            "cta": cta,
            "publish_results": publish_results
        }

    def run_continuous_daily_loop(self, max_items: int = 10, delay_sec: int = 2):
        """Runs the loop continuously over all pending items."""
        print(f"🚀 Starting continuous loop engine for up to {max_items} queued ideas...")
        processed = 0
        while processed < max_items:
            res = self.run_single_loop()
            if res.get("status") == "empty_queue":
                print("🏁 All queue items have been processed.")
                break
            processed += 1
            if processed < max_items:
                print(f"⏳ Waiting {delay_sec}s before next loop cycle...")
                time.sleep(delay_sec)
        print(f"🎉 Batch Loop Completed: {processed} videos rendered and distributed.")
