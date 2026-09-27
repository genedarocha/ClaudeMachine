#!/usr/bin/env python3
"""
LT25 Local AI & Fast-Render Server
Listens on http://localhost:7860
Connects to local Ollama LLMs and the Universal Video Factory engine for £0 local AI video generation.
"""

import os
import sys
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.parse
from universal_video_factory import UniversalVideoFactory

PORT = int(os.getenv("LT25_PORT", 7860))
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:latest")

factory = UniversalVideoFactory(output_dir="output_videos")

class LT25Handler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json({"status": "ok"})

    def do_GET(self):
        if self.path == "/" or self.path == "/health":
            self._send_json({
                "status": "online",
                "service": "LT25 Local AI & Video Engine",
                "port": PORT,
                "ollama_connected": self._check_ollama()
            })
        else:
            self._send_json({"error": "Endpoint not found"}, status=404)

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if self.path == "/api/render":
            # 1. Video render job
            prompt = payload.get("prompt", "AIToolboard Showcase")
            product_name = payload.get("product_name", prompt[:30])
            category = payload.get("category", "AI Software")
            cta_url = payload.get("cta_url", "https://aitoolboard.com")

            product = {
                "name": product_name,
                "category": category,
                "tagline": prompt,
                "problem_solved": payload.get("problem_solved", "wasting hours on manual tasks"),
                "killer_feature": payload.get("killer_feature", "instant 1-click autonomous workflow"),
                "pricing": payload.get("pricing", "Free Access"),
                "cta_url": cta_url,
                "brand_hashtags": "#aitoolboard #voxstar #futuretech"
            }

            result_bundle = factory.process_single_company(product)
            video_path = result_bundle.get("assets", {}).get("video_mp4", "")
            
            self._send_json({
                "engine": "LT25 (Free / Local)",
                "status": "success",
                "video_url": video_path,
                "bundle": result_bundle
            })

        elif self.path == "/api/generate_script":
            # 2. Local LLM Script generation via Ollama
            product_name = payload.get("product_name", "AI Tool")
            description = payload.get("description", "Automate business workflows")
            
            llm_result = self._call_ollama(product_name, description)
            self._send_json({
                "status": "success",
                "model": OLLAMA_MODEL,
                "script": llm_result
            })
        else:
            self._send_json({"error": "Unknown POST endpoint"}, status=404)

    def _check_ollama(self) -> bool:
        try:
            req = urllib.request.Request("http://localhost:11434/api/tags")
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    def _call_ollama(self, name: str, desc: str) -> str:
        prompt_text = (
            f"You are a viral TikTok & YouTube Shorts creator. "
            f"Write a high-converting 30-second 5-scene video script for '{name}'. "
            f"Description: {desc}. Include Hook, Problem, Solution, Feature, and Call to Action."
        )
        data = {
            "model": OLLAMA_MODEL,
            "prompt": prompt_text,
            "stream": False
        }
        try:
            req = urllib.request.Request(
                OLLAMA_URL,
                data=json.dumps(data).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    return resp_json.get("response", "")
        except Exception as e:
            print(f"Ollama local call skipped: {e}")
        
        # Fallback deterministic script
        return f"🚨 Stop doing this manually! Check out {name}. It solves {desc} in 30 seconds. Tap the link in bio to test it now!"


def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, LT25Handler)
    print(f"\n=======================================================")
    print(f"🚀 LT25 Local AI Video Engine Server running on port {PORT}")
    print(f"   • Local Endpoint: http://localhost:{PORT}")
    print(f"   • Ollama Connected: {LT25Handler(None, ('', 0), None)._check_ollama()}")
    print(f"   • Video Output Dir: output_videos/")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down LT25 server.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
