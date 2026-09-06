# Automation 1: Daily Video Content Autopilot Engine
### Built for Wiredvibeapp & Multi-Channel Syndication
**Author:** Gene Da Rocha, MSc BSc (Hons) | **Company:** Voxstar Ltd ([voxstar.com](https://voxstar.com))

---

## 🌟 Overview
**Automation 1** is an enterprise-grade autonomous video generation and multi-channel publishing system. Using **Loop Engineering**, it ingests daily video ideas from a CSV file or SQLite database table, synthesizes viral hooks and scripts across 4 leading LLM architectures (**Google Gemini**, **Anthropic Claude**, **OpenAI ChatGPT**, and **xAI Grok**), renders video assets via 3 swappable engines (**LT25 Free/Local**, **Sundance AI Fee/Local**, or **Google Gemini App / Veo Cloud**), and automatically distributes the video across 6 major platforms.

---

## 🚀 Key Features

1. **Loop Engineering Queue**:
   - Ingests from `video_ideas_queue.csv` or SQLite database (`automation_videos.db`).
   - Self-refines hook curiosity, retention scores, and viral copy over multiple iterative critique passes.

2. **4 AI Model Architectures Supported**:
   - `automation_gemini.py` (Google Gemini 2.5 Flash / Pro & Veo)
   - `automation_claude.py` (Anthropic Claude 3.7 Sonnet / Opus)
   - `automation_chatgpt.py` (OpenAI GPT-4o / Sora)
   - `automation_grok.py` (xAI Grok 2 / 3)

3. **3 Flexible Video Engines**:
   - **LT25**: Fast-render, completely free and local diffusion checkpoint.
   - **Sundance AI**: High-fidelity cinematic local / API video synthesis (fee).
   - **Google Gemini App / Veo**: Cloud-native generative video.

4. **6-Channel Automated Social Syndication**:
   - **X.com (Twitter)**: Full video tweet + hook caption.
   - **YouTube.com**: Shorts ingestion with SEO title, description, and tags.
   - **LinkedIn (Gene Da Rocha Home Profile)**: Personal thought leadership video post.
   - **LinkedIn (Wiredvibeapp Company Page)**: Brand product spotlight post.
   - **Facebook Company Page**: Video Reel + link.
   - **TikTok (Wiredvibeapp Login)**: Vertical FYP-optimized short video + viral caption.

5. **Mandatory & Contextual Hashtags Included**:
   `#voxstar #voxstar.ai #wiredvibeapp #atltrust #aitoolboard`

---

## 📁 Repository Structure

```
automation1-Video-Content/
├── config.env.example          # Environment & API Key configuration template
├── requirements.txt            # Python dependencies
├── setup_and_run.sh            # Interactive launch script
├── database.py                 # SQLite & CSV queue management engine
├── video_engines.py            # LT25, Sundance, and Gemini Veo rendering adapters
├── social_publishers.py        # X, YouTube, LinkedIn (x2), FB & TikTok publishers
├── loop_engine.py              # 5-Step Loop Engineering execution framework
├── automation_gemini.py        # Gemini-powered automation script
├── automation_claude.py        # Claude-powered automation script
├── automation_chatgpt.py       # ChatGPT-powered automation script
├── automation_grok.py          # Grok-powered automation script
├── video_ideas_queue.csv       # Pre-loaded video idea queue (30 ideas)
└── README.md                   # Complete documentation
```

---

## ⚡ Quick Start

### 1. Clone or Extract
```bash
unzip automation1-Video-Content.zip
cd automation1-Video-Content
```

### 2. Configure Credentials
```bash
cp config.env.example config.env
# Edit config.env with your desired API keys
```

### 3. Run Any Version
```bash
chmod +x setup_and_run.sh
./setup_and_run.sh
```
Or run directly in Python:
```bash
# Gemini Version
python automation_gemini.py

# Claude Version
python automation_claude.py

# ChatGPT Version
python automation_chatgpt.py

# Grok Version
python automation_grok.py
```

---

## 📄 License & Commercial Distribution
© Voxstar Ltd. All rights reserved. Created by Gene Da Rocha.
Licensed for personal and commercial deployment by the purchasing organization.
