#!/usr/bin/env python3
"""
Generate YouTube Shorts archive for Episodes 1 through 93.
Outputs:
1. podcast_assets/youtube_shorts_ep1_to_93.json
2. podcast_assets/youtube_shorts_ep1_to_93.csv
3. src/data/youtubeShortsArchive.ts
"""

import json
import csv
import re
import os

SPOTIFY_SHOW_URL = "https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8"
YOUTUBE_STUDIO_UPLOAD_URL = "https://studio.youtube.com/channel/UCa-q0YbY6yAMXgjPlYlZbvQ/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D"
SUBSTACK_BASE = "https://voxstar.substack.com"

HASHTAG_VAULT = "#ArtificialIntelligence #MachineLearning #DeepLearning #NeuralNetworks #ComputerVision #AI #DataScience #NaturalLanguageProcessing #BigData #Robotics #Automation #IntelligentSystems #CognitiveComputing #SmartTechnology #Analytics #Innovation #Industry40 #FutureTech #QuantumComputing #IoT #genedarocha #voxstar #aitoolboard #voxstarai #writerplus #wiredvibeapp #wiredvibe #atltrust #albionlm #elonmusk"

TOPICS_93 = [
    (1, "The Dawn of Autonomous AI Workflows", "autonomous-ai-workflows", "How modern autonomous loops are replacing static RPA and shifting enterprise business logic from rules to reasoning."),
    (2, "Large Language Models in Daily Business Operations", "llms-in-business-operations", "Integrating LLMs into core customer support, ERP, and internal decision intelligence."),
    (3, "Prompt Engineering vs Model Fine-Tuning", "prompt-engineering-vs-fine-tuning", "Determining the ROI crossover point between dynamic in-context prompting and custom parameter adaptation."),
    (4, "Building Enterprise RAG with Vector Databases", "building-enterprise-rag-vector-db", "How chunking strategies, cosine similarity, and hybrid sparse-dense search eliminate hallucination in production."),
    (5, "Autonomous Multi-Agent Collaboration Patterns", "autonomous-multi-agent-patterns", "Architecting manager-worker and debate agent swarms for complex software development and financial forecasting."),
    (6, "Open Source vs Closed Source AI: The Real Cost Breakdown", "open-source-vs-closed-source-ai", "Comparing API token inflation against self-hosted vLLM, TensorRT-LLM, and sovereign infrastructure."),
    (7, "Zero-Shot and Few-Shot Learning in Production", "zero-shot-few-shot-production", "Leveraging meta-learning and exemplar curation to achieve 95%+ precision without dataset labeling overhead."),
    (8, "AI-Powered Code Generation: From Copilot to Devin", "ai-code-generation-copilot-devin", "How autonomous software engineering agents write, test, debug, and open pull requests autonomously."),
    (9, "Deterministic Safeguards for Non-Deterministic Models", "deterministic-safeguards-ai", "Wrapping stochastic language models with schema validation, AST parsing, and state machine guards."),
    (10, "Voice Cloning and Neural Speech Synthesis Architecture", "voice-cloning-neural-speech", "The mechanics of zero-shot diffusion voice models, flow matching, and low-latency streaming TTS."),
    (11, "Automating Customer Support with Cognitive Routing", "automating-customer-support-cognitive", "Moving beyond decision trees into semantic sentiment routing, knowledge retrieval, and autonomous refund logic."),
    (12, "Knowledge Graphs and Vector Search: The Hybrid RAG Future", "knowledge-graphs-vector-search-hybrid", "Combining deterministic ontology traversal with probabilistic vector embeddings for enterprise accuracy."),
    (13, "Fine-Tuning Llama Models on Proprietary Enterprise Data", "fine-tuning-llama-enterprise-data", "Step-by-step parameter-efficient fine-tuning with LoRA, QLoRA, and custom domain synthetic datasets."),
    (14, "Multi-Modal AI: Vision, Audio, and Text Synergy", "multimodal-ai-vision-audio-text", "Unifying multimodal tokenizers to process blueprints, audio streams, and financial spreadsheets simultaneously."),
    (15, "AI In Healthcare: Diagnostic Automation and Clinical LLMs", "ai-healthcare-diagnostic-automation", "Navigating HIPAA compliance, synthetic EHR records, and precision diagnostic assistance pipelines."),
    (16, "Autonomous Cold Outreach & Hyper-Personalized SDR Agents", "autonomous-cold-outreach-sdr", "Building contextual SDR agents that ingest prospect LinkedIn feeds, company 10-Ks, and produce tailored pitches."),
    (17, "The Mathematics of Transformer Attention Mechanisms", "mathematics-transformer-attention", "Deconstructing scaled dot-product attention, multi-head projections, and flash attention memory optimizations."),
    (18, "Synthetic Data Generation for Training Edge Models", "synthetic-data-generation-edge", "Using frontier reasoning models to bootstrap specialized datasets for small 1B-3B quantized edge models."),
    (19, "Autonomous Finance: Algorithmic Trading & Risk Modeling", "autonomous-finance-risk-modeling", "Real-time market sentiment analysis, SEC filing parsing, and autonomous hedging strategies."),
    (20, "AI Governance & The EU AI Act Compliance Framework", "ai-governance-eu-ai-act-compliance", "Classifying high-risk AI systems, enforcing audit trails, and meeting regulatory transparency mandates."),
    (21, "Quantization Techniques: GGUF, AWQ, and GPTQ Explained", "quantization-gguf-awq-gptq", "Compressing 70B parameter models into 4-bit weights for smooth inference on commodity GPUs and Apple Silicon."),
    (22, "Agentic Memory Systems: Short-Term, Long-Term & Epistemic", "agentic-memory-systems", "Building hierarchical memory architectures combining Redis scratchpads, vector search, and episodic recall."),
    (23, "AI-Driven Supply Chain Optimization and Predictive Logistics", "ai-supply-chain-predictive-logistics", "Forecasting inventory shortages, weather disruptions, and dynamically rerouting global freight fleets."),
    (24, "Computer Vision on the Edge: YOLOv10 and Real-Time Inference", "computer-vision-edge-yolov10", "Deploying high-speed object detection models on Raspberry Pi, Jetson Orin, and mobile devices."),
    (25, "Autonomous Content Engines: Scaling from 1 to 1,000 Articles", "autonomous-content-engines-scale", "Building multi-stage editorial pipelines that research, draft, fact-check, and publish SEO-optimized copy."),
    (26, "Preventing Prompt Injection and Jailbreaking in Enterprise LLMs", "preventing-prompt-injection-jailbreaking", "Implementing input sanitization, dual-LLM arbiters, and token perturbation defense layers."),
    (27, "AI in Legal Tech: Contract Analysis and Case Precedent RAG", "ai-legal-tech-contract-rag", "Automating clause comparison, redlining, and jurisdictional case law retrieval with extreme fidelity."),
    (28, "The Rise of Small Language Models: Gemma, Phi-3, and Mistral", "rise-of-small-language-models", "Why efficient 3B-7B models are outperforming legacy 70B behemoths on targeted domain tasks."),
    (29, "Self-Healing Software Infrastructure with AI DevOps Agents", "self-healing-infrastructure-ai-devops", "Autonomous log analysis, automated root-cause diagnosis, and self-applying Terraform patches."),
    (30, "Autonomous Audio Mastering and Soundscape Engineering", "autonomous-audio-mastering-soundscapes", "How neural audio processors dynamically adjust LUFS, frequency spectrums, and binaural focus audio."),
    (31, "The Economics of AI Tokenomics and API Budgeting", "economics-ai-tokenomics-budgeting", "Strategies to reduce monthly API spend by 80% through semantic caching, model routing, and batching."),
    (32, "Building Custom AI Chrome Extensions for Browser Automation", "custom-ai-chrome-extensions", "Injecting autonomous agents directly into browser tabs to scrape, summarize, and automate web actions."),
    (33, "Graph Neural Networks in Drug Discovery and Bio-Informatics", "graph-neural-networks-drug-discovery", "Predicting molecular binding affinities, protein folding dynamics, and accelerating preclinical pipelines."),
    (34, "Autonomous Email Triage and Smart Inbox Zero", "autonomous-email-triage-smart-inbox", "Classifying priority correspondence, drafting executive replies, and auto-scheduling calendar meetings."),
    (35, "AI In Real Estate: Automated Valuation & Market Forecasting", "ai-real-estate-automated-valuation", "Analyzing neighborhood demographics, satellite imagery, and municipal zoning for high-yield deals."),
    (36, "Semantic Caching: Slashing LLM Latency to Sub-10ms", "semantic-caching-slashing-latency", "Using vector similarity on historical prompt embeddings to bypass redundant LLM inference passes."),
    (37, "Autonomous Social Media Engine: Cross-Platform Repurposing", "autonomous-social-media-repurposing", "Transforming single long-form podcasts into YouTube Shorts, LinkedIn carousels, and X threads."),
    (38, "Federated Learning: Training AI on Distributed Private Data", "federated-learning-distributed-privacy", "Updating global model weights across hospitals and mobile devices without transmitting raw user data."),
    (39, "Reinforcement Learning from Human Feedback (RLHF) Demystified", "rlhf-demystified-alignment", "Understanding reward model training, PPO optimization, and Direct Preference Optimization (DPO)."),
    (40, "AI-Powered HR: Automated Resume Screening & Talent Matching", "ai-hr-automated-resume-talent-matching", "Removing cognitive bias, matching skill graphs, and automating technical screening interviews."),
    (41, "The Sovereign Cloud: Air-Gapped AI for Defense and Banking", "sovereign-cloud-air-gapped-ai", "Deploying fully isolated LLM clusters with zero internet ingress/egress for mission-critical security."),
    (42, "Automating Video Generation: Diffusion Models and Sora", "automating-video-generation-diffusion-sora", "The evolution of spatio-temporal video patches, consistency models, and automated B-roll generation."),
    (43, "AI In Cybersecurity: Autonomous Penetration Testing & Threat Hunting", "ai-cybersecurity-autonomous-pentest", "Deploying offensive Red Team agents to probe web firewalls and defensive Blue Team anomaly detectors."),
    (44, "Speech-to-Text Evolution: Whisper, Conformer, and Real-Time Transcripts", "speech-to-text-whisper-conformer", "Benchmarking word error rates, timestamp alignment, and diarization for multilingual audio streams."),
    (45, "Autonomous Marketing Analytics & Attribution Modeling", "autonomous-marketing-analytics-attribution", "Connecting disparate ad platforms into unified Bayesian marketing mix models powered by AI agents."),
    (46, "Local AI Hardware: Building a 4x RTX 4090 Deep Learning Rig", "local-ai-hardware-4090-rig", "PCIe lane bandwidth, NVLink topology, thermal dissipation, and budget-friendly home lab setups."),
    (47, "Function Calling and Tool Use in Frontier Models", "function-calling-tool-use-frontier-models", "How OpenAI, Claude, and Gemini parse structured JSON schemas to invoke database queries and APIs."),
    (48, "AI in Education: Personalized Tutoring and Adaptive Curriculums", "ai-education-personalized-tutoring", "Creating Socratic AI tutors that adjust pedagogical difficulty based on student comprehension latency."),
    (49, "Autonomous Database Administration: Self-Tuning SQL Engines", "autonomous-database-admin-self-tuning-sql", "Using reinforcement learning to index queries, reallocate RAM buffers, and prevent query deadlocks."),
    (50, "The 50th Episode Milestone: The State of AI in 2026", "50th-episode-milestone-state-of-ai", "Reflecting on 50 breakthroughs in autonomous systems, model architectures, and enterprise adoption."),
    (51, "Building Autonomous Web Scrapers with Playwright & Vision LLMs", "autonomous-web-scrapers-playwright-vision", "Navigating dynamic SPAs, solving captchas, and extracting clean JSON tables with multimodal scrapers."),
    (52, "AI-Powered Personal Knowledge Management (PKM)", "ai-pkm-second-brain-obsidian", "Connecting Obsidian, Notion, and local vector search to create an autonomous personal second brain."),
    (53, "Autonomous Inventory Forecasting with Time-Series Foundation Models", "autonomous-inventory-forecasting-timeseries", "Leveraging Chronos, TimesFM, and Lag-Llama for zero-shot retail demand and supply prediction."),
    (54, "Voice-Enabled AI Agents for Automotive and IoT", "voice-enabled-ai-agents-automotive-iot", "Integrating offline wake-word engines, ultra-fast intent classification, and vehicle telemetry hooks."),
    (55, "Deepfake Detection and Cryptographic Media Watermarking", "deepfake-detection-cryptographic-watermarking", "Deploying C2PA provenance standards and frequency artifact analysis to verify media authenticity."),
    (56, "AI in Agriculture: Precision Farming and Autonomous Drones", "ai-agriculture-precision-farming-drones", "Thermal crop health scanning, automated pesticide targeting, and yield prediction with edge models."),
    (57, "Autonomous Customer Onboarding Workflows", "autonomous-customer-onboarding-workflows", "Verifying identity documents, setting up tenant databases, and delivering customized product tours."),
    (58, "Context Window Wars: 1M Tokens vs Targeted RAG Retrieval", "context-window-wars-1m-tokens-vs-rag", "Analyzing needle-in-a-haystack recall degradation, latency penalties, and when RAG still wins."),
    (59, "Building AI-First SaaS Products from Scratch", "building-ai-first-saas-products", "Architectural patterns for multi-tenant LLM state management, rate limiting, and Stripe billing meters."),
    (60, "Autonomous Compliance Auditing for SOC2 and ISO 27001", "autonomous-compliance-auditing-soc2-iso", "Continuous evidence gathering, screenshot verification, and automated vulnerability remediation."),
    (61, "Neural Architecture Search (NAS) and Automated Model Design", "neural-architecture-search-nas-automated", "How AI algorithms design higher-efficiency neural network layers than human machine learning engineers."),
    (62, "AI in Journalism: Fact-Checking, Source Verification, and News Curation", "ai-journalism-fact-checking-verification", "Cross-referencing breaking news against government gazettes and verifiable statistical registries."),
    (63, "Autonomous Lead Scoring and Predictive CRM Enrichment", "autonomous-lead-scoring-predictive-crm", "Enriching inbound leads with technographic data, employee growth rates, and intent signals."),
    (64, "Fine-Tuning Embedding Models for Domain-Specific Retrieval", "fine-tuning-embedding-models-domain-retrieval", "Using contrastive loss and triplet mining to boost medical, legal, and financial vector retrieval accuracy."),
    (65, "AI In Manufacturing: Computer Vision Quality Assurance", "ai-manufacturing-vision-quality-assurance", "Detecting microscopic surface fractures on assembly line components at 120 frames per second."),
    (66, "Autonomous Meeting Assistants: Action Item Extraction & Execution", "autonomous-meeting-assistants-action-items", "Beyond transcription: automatically generating Jira tickets, Slack updates, and follow-up emails."),
    (67, "The Energy Grid & AI: Nuclear SMRs for Hyperscale Data Centers", "energy-grid-ai-nuclear-smrs-data-centers", "Why the next AI compute bottleneck is electrical power and how tech giants are partnering with nuclear energy."),
    (68, "Autonomous Search Engine Optimization (SEO) Systems", "autonomous-seo-systems-keyword-strategy", "Programmatic keyword clustering, automated internal linking, and real-time SERP volatility tracking."),
    (69, "AI In Insurance: Automated Claims Processing & Fraud Detection", "ai-insurance-automated-claims-fraud", "Analyzing accident scene photos, telematics data, and detecting synthetic claim manipulation."),
    (70, "The Open Source AI Revolution: Mistral Large, DeepSeek, and Qwen", "open-source-ai-revolution-mistral-deepseek-qwen", "How international open weights are matching closed frontier benchmarks at a fraction of the cost."),
    (71, "Autonomous Event Management: Registration to Post-Event Nurturing", "autonomous-event-management-nurturing", "Dynamic speaker scheduling, automated attendee Q&A routing, and personalized recap generation."),
    (72, "Model Merging: Combining Specialized LLMs Without Retraining", "model-merging-dare-ties-frankenmerging", "Using DARE, TIES-Merging, and spherical interpolation to combine coding and medical weights seamlessly."),
    (73, "AI In Architecture: Generative Floorplans and Structural Optimization", "ai-architecture-generative-floorplans", "Generating energy-efficient structural framing and daylight-optimized architectural blueprints in seconds."),
    (74, "Autonomous Data Pipelines: ETL to Reverse-ETL with AI Agents", "autonomous-data-pipelines-etl-reverse-etl", "Auto-generating SQL transformations, schema migration monitors, and data warehouse anomaly alerts."),
    (75, "Prompt Compression: Cutting Token Usage by 50% Without Accuracy Loss", "prompt-compression-cutting-token-usage", "Using selective entropy filtering and token pruning to fit huge context windows into tight budget limits."),
    (76, "AI In E-Commerce: Dynamic Pricing and Hyper-Personalized Storefronts", "ai-ecommerce-dynamic-pricing-personalization", "Real-time competitor scraping, elastic demand modeling, and generative product recommendation feeds."),
    (77, "Autonomous Crisis Management and Public Relations AI", "autonomous-crisis-management-pr-ai", "Monitoring social sentiment spikes, identifying PR emergencies early, and drafting executive responses."),
    (78, "Diffusion Models vs Autoregressive Transformers for Image Generation", "diffusion-vs-autoregressive-image-gen", "Comparing Stable Diffusion 3, Flux, and Midjourney architectures for commercial graphic workflows."),
    (79, "AI in Construction: Safety Monitoring and Schedule Optimization", "ai-construction-safety-schedule-optimization", "Detecting PPE compliance from CCTV cameras and predicting weather-related concrete curing delays."),
    (80, "Autonomous Podcast Production: From Script to Multilingual Distribution", "autonomous-podcast-production-multilingual", "How Voxstar automates voice generation, mastering, social clipping, and Spotify RSS distribution."),
    (81, "Vector Databases Benchmarked: Pinecone, Qdrant, Milvus, and pgvector", "vector-databases-benchmarked-pinecone-qdrant", "Evaluating recall at scale, indexing speed (HNSW vs IVF), memory footprint, and hosting cost."),
    (82, "AI in Retail: Cashierless Checkout and Smart Shelf Monitoring", "ai-retail-cashierless-smart-shelves", "Sensor fusion, overhead computer vision, and autonomous restocking triggers for modern supermarkets."),
    (83, "Autonomous Document Processing: Invoices, Receipts & Bank Statements", "autonomous-document-processing-ocr-llm", "Extracting structured financial records from crumpled paper photos using vision-language parsers."),
    (84, "LLM Evaluation Frameworks: Ragas, TruLens, and DeepEval", "llm-evaluation-frameworks-ragas-trulens", "Measuring faithfulness, answer relevancy, and context recall in continuous automated CI/CD pipelines."),
    (85, "AI in Gaming: Procedural World Generation and Autonomous NPCs", "ai-gaming-procedural-worlds-autonomous-npcs", "Giving video game non-player characters dynamic personalities, persistent memory, and voice dialogue."),
    (86, "Autonomous Competitive Intelligence: 24/7 Competitor Tracking", "autonomous-competitive-intelligence-tracking", "Scraping competitor pricing updates, job postings, patent filings, and generating weekly strategic briefs."),
    (87, "Audio Separation and Neural Audio Upscaling", "audio-separation-neural-upscaling-demucs", "Demucs stem splitting, removing background street noise, and converting 16kHz voice into 48kHz studio audio."),
    (88, "AI in Aviation: Flight Path Optimization and Predictive Maintenance", "ai-aviation-flight-path-predictive-maintenance", "Turbine sensor anomaly detection, reducing carbon emissions through dynamic altitude routing."),
    (89, "Autonomous Social Listening: Trend Spotting Before Virality", "autonomous-social-listening-trend-spotting", "Detecting nascent cultural keywords on TikTok, Reddit, and X before they enter mainstream news feeds."),
    (90, "Building Autonomous AI Sales Funnels", "building-autonomous-ai-sales-funnels", "From organic social lead capture to automated interactive qualification and checkout conversion."),
    (91, "Multimodal RAG: Searching Images, PDFs, and Audio Simultaneously", "multimodal-rag-searching-images-audio", "ColPali and CLIP embeddings for indexing corporate slide decks, schematics, and recorded customer calls."),
    (92, "The Architecture of Voxstar: Automated Content Ecosystems", "architecture-of-voxstar-content-ecosystem", "Gene Da Rocha reveals the full technical stack behind Voxstar, AI Toolboard, WiredVibe, and ATL-Trust."),
    (93, "The Autonomous Enterprise: The Next 1,000 Days of AI", "autonomous-enterprise-next-1000-days", "How self-operating corporations will function by 2029 with AI agent executive boards and human oversight.")
]

def generate_youtube_short_package(ep_num, title, slug, summary):
    yt_title = f"🎙️ #{ep_num} {title} #Shorts #AI #Podcast"
    if len(yt_title) > 100:
        yt_title = yt_title[:97] + "..."
    
    substack_url = f"{SUBSTACK_BASE}/p/{slug}"
    
    # Generate YouTube Description
    description = f"""🎙️ Episode #{ep_num}: {title}
Host & Creator: Gene Da Rocha | Voxstar AI Automation

{summary}

🎧 STREAM THE FULL PODCAST ON SPOTIFY:
👉 {SPOTIFY_SHOW_URL}

📖 READ THE FULL ARTICLE & ARCHITECTURAL BREAKDOWN ON SUBSTACK:
👉 {substack_url}

🌐 CONNECT WITH GENE DA ROCHA & THE ECOSYSTEM:
• Substack Publication: https://voxstar.substack.com
• Spotify Show: https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8
• YouTube Channel: https://youtube.com/@genedarocha
• LinkedIn: https://linkedin.com/in/genedarocha
• X (Twitter): https://x.com/genedarocha
• Instagram: https://instagram.com/rochagenda
• AI Toolboard: https://aitoolboard.com
• WiredVibe: https://wiredvibeapp.com
• ATL-Trust: https://atl-trust.com

{HASHTAG_VAULT}"""

    # Generate 60s Vertical Script
    script = f"""🎬 YOUTUBE SHORTS (60s Vertical Video Director Script)
Episode #{ep_num}: {title}
Format: 9:16 Vertical Video (1080x1920) | Target Duration: 55-60 Seconds

[0:00 - 0:05] HOOK (Fast Paced / Text on Screen)
Host (Gene Da Rocha): "If your enterprise is still treating AI like a chatbot instead of an autonomous system, you're falling behind."

[0:05 - 0:20] THE PROBLEM & CONTEXT
Visual: Fast B-Roll / Dynamic diagram of {title}
Host: "In Episode #{ep_num}, we dive deep into {title}. Most teams struggle because {summary.lower()}"

[0:20 - 0:40] THE TECHNICAL BREAKTHROUGH
Visual: Terminal code walkthrough / Architecture flowchart / Metric comparison
Host: "Here is the architectural secret: by decoupling the reasoning loop from deterministic safeguards, you achieve sub-second execution while cutting recurring token costs by up to 80%."

[0:40 - 0:52] KEY TAKEAWAY FOR FOUNDERS & ENGINEERS
Visual: Close-up / High-contrast text overlay
Host: "Whether you're building with open-source weights or sovereign edge enclaves, deterministic reliability is the only path to production."

[0:52 - 0:60] CALL TO ACTION
Visual: Spotify Podcast & Substack UI graphic
Host: "Stream the full Episode #{ep_num} right now on Spotify, and read the complete blueprint on voxstar.substack.com. Link in the description!"
"""

    return {
        "episodeNumber": ep_num,
        "title": title,
        "slug": slug,
        "summary": summary,
        "substackUrl": substack_url,
        "spotifyUrl": SPOTIFY_SHOW_URL,
        "youtubeStudioUrl": YOUTUBE_STUDIO_UPLOAD_URL,
        "youtubeShortTitle": yt_title,
        "youtubeShortDescription": description,
        "youtubeShortScript": script,
        "tags": ["AI", "Artificial Intelligence", "Podcast", "Shorts", "Gene Da Rocha", "Voxstar", "Automation", "Machine Learning"]
    }

def main():
    shorts = []
    for ep_num, title, slug, summary in TOPICS_93:
        shorts.append(generate_youtube_short_package(ep_num, title, slug, summary))
    
    # 1. Output JSON
    os.makedirs("podcast_assets", exist_ok=True)
    json_path = "podcast_assets/youtube_shorts_ep1_to_93.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(shorts, f, indent=2, ensure_ascii=False)
    print(f"Generated {len(shorts)} YouTube Shorts in {json_path}")

    # 2. Output CSV
    csv_path = "podcast_assets/youtube_shorts_ep1_to_93.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Episode Number", "Title", "Substack URL", "Spotify URL", "YouTube Short Title", "YouTube Description", "60s Script"])
        for s in shorts:
            writer.writerow([
                s["episodeNumber"],
                s["title"],
                s["substackUrl"],
                s["spotifyUrl"],
                s["youtubeShortTitle"],
                s["youtubeShortDescription"],
                s["youtubeShortScript"]
            ])
    print(f"Generated CSV in {csv_path}")

    # 3. Output TypeScript Data File src/data/youtubeShortsArchive.ts
    ts_path = "src/data/youtubeShortsArchive.ts"
    ts_content = f"""// Complete YouTube Shorts Archive for Episodes 1 through 93
// Pointing to Spotify Master Podcast: {SPOTIFY_SHOW_URL}
// YouTube Channel: Gene Da Rocha (UCa-q0YbY6yAMXgjPlYlZbvQ)

export interface YoutubeShortPackage {{
  episodeNumber: number;
  title: string;
  slug: string;
  summary: string;
  substackUrl: string;
  spotifyUrl: string;
  youtubeStudioUrl: string;
  youtubeShortTitle: string;
  youtubeShortDescription: string;
  youtubeShortScript: string;
  tags: string[];
}}

export const SPOTIFY_PODCAST_SHOW_URL = "{SPOTIFY_SHOW_URL}";
export const YOUTUBE_STUDIO_UPLOAD_URL = "{YOUTUBE_STUDIO_UPLOAD_URL}";

export const YOUTUBE_SHORTS_ARCHIVE_93: YoutubeShortPackage[] = {json.dumps(shorts, indent=2, ensure_ascii=False)};

export const getShortByEpisodeNumber = (epNum: number): YoutubeShortPackage | undefined => {{
  return YOUTUBE_SHORTS_ARCHIVE_93.find(s => s.episodeNumber === epNum);
}};

export const searchShortsArchive = (query: string): YoutubeShortPackage[] => {{
  const q = query.toLowerCase().trim();
  if (!q) return YOUTUBE_SHORTS_ARCHIVE_93;
  return YOUTUBE_SHORTS_ARCHIVE_93.filter(s => 
    s.episodeNumber.toString() === q ||
    s.title.toLowerCase().includes(q) ||
    s.summary.toLowerCase().includes(q)
  );
}};
"""
    with open(ts_path, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Generated TypeScript archive in {ts_path}")

if __name__ == "__main__":
    main()
