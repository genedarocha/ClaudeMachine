import os
import subprocess
import asyncio
import edge_tts

VOICE = "en-US-GuyNeural"
RATE = "+0%"
PITCH = "+0Hz"

EPISODES = [
    {
        "number": 95,
        "title": "#95 Microsoft AI Spearheads Innovation with a New Hub in London",
        "subtitle": "Microsoft Opens Flagship AI Hub in London Led by Mustafa Suleyman",
        "script": """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today, in Episode 95, we are exploring a major milestone in global artificial intelligence: Microsoft AI spearheading innovation with the launch of their brand-new flagship AI Hub in the heart of London.

In a landmark announcement that signals a massive vote of confidence in the UK technology ecosystem, Microsoft revealed that it is opening a dedicated AI research and engineering hub in London. This new organization is led by one of the most prominent pioneers in modern machine learning, Mustafa Suleyman, co-founder of DeepMind and Inflection AI, who recently stepped into the role of Executive Vice President and CEO of Microsoft AI. Joining him is Jordan Hoffmann, a distinguished AI scientist from Inflection and DeepMind, serving as the research and engineering lead for this ambitious new outpost.

To truly appreciate the significance of this move, we need to understand the broader context of what is happening across the enterprise technology landscape in 2026. For years, the epicenters of frontier large language model development were heavily clustered in Silicon Valley and Seattle. However, London has quietly maintained an unmatched density of foundational machine learning talent, home to elite research institutions like University College London, Imperial College, Cambridge, and Oxford, as well as the founding grounds of DeepMind itself.

By establishing this dedicated hub, Microsoft is not just opening an office; they are planting a definitive flag in Europe's most vibrant AI corridor.

Let us break down the core mission of Microsoft AI London into three fundamental pillars:

First, Frontier Model Research and State-of-the-Art Tooling. The London team will collaborate directly with Microsoft's global research divisions and partners, including OpenAI, to design next-generation multimodal models, reasoning engines, and foundational architectures. This includes pioneering work on synthetic data generation, reinforcement learning from human and AI feedback, and novel optimization techniques to reduce compute overhead while dramatically increasing inference speed and accuracy.

Second, the Acceleration of the Enterprise Copilot Ecosystem. Today, Microsoft Copilot has transitioned from an experimental digital assistant into a mission-critical productivity platform across Microsoft 365, Azure, GitHub, and Windows. The engineering talent based in London will be squarely tasked with pushing the boundaries of what these agents can achieve—moving from passive question-answering systems into active, autonomous agents capable of complex multi-step orchestration, code refactoring, enterprise database querying, and autonomous workflow execution.

Third, Trust, Safety, and Regulatory Collaboration. One of the unique advantages of London is its proximity to international governance bodies, including the UK AI Safety Institute. As regulatory frameworks such as the European Union AI Act and international safety standards take effect, enterprise clients demand verifiable proof that their models are resilient against jailbreaks, prompt injection, and hallucination. The London hub is positioned to work side-by-side with researchers and policymakers to develop open benchmarks and deterministic safety guardrails.

Now, let us examine the strategic implications for founders, enterprise technology leaders, and software engineers.

For software engineers and data scientists, this represents one of the most aggressive hiring drives in the UK. Microsoft has committed substantial capital and Azure compute resources to scale this team, opening high-impact roles for research scientists, AI architects, infrastructure engineers, and systems designers.

For enterprise decision-makers, this announcement reinforces a critical reality: the pace of AI innovation is accelerating, and the competition between hyperscalers is intensifying. Microsoft's aggressive investment ensures that businesses building on Azure and Copilot will have direct access to cutting-edge model improvements and localized sovereign cloud capabilities.

Furthermore, this hub bridges the traditional gap between pure academic research and commercial software delivery. Too often in the past, breakthrough research papers took years to find practical applications. By placing top-tier research scientists directly within the Microsoft AI product organization, breakthroughs in model reasoning, memory retention, and context retrieval can be deployed into production applications within weeks, not years.

As we look toward the remainder of the year, the race to build trustworthy, high-performance, and autonomous AI infrastructure is reaching fever pitch. London's emergence as a central node in Microsoft's global network is a powerful catalyst for the entire European technology ecosystem.

Thank you for tuning into Episode 95 of Voxstar AI Automation. 

If you found value in today's broadcast, make sure to subscribe to our publication at voxstar.substack.com for full research notes, architectural deep dives, and enterprise case studies. Follow us on Spotify, Apple Podcasts, and connect with me on LinkedIn and X at Gene Da Rocha.

Until next time, keep innovating, keep building, and keep automating everything. I'm Gene Da Rocha.
"""
    },
    {
        "number": 97,
        "title": "#97 The Sovereign Edge: Why True AI Privacy Demands Local Models",
        "subtitle": "The Architectural Migration from Cloud Data Centers to Native On-Device Intelligence",
        "script": """
Welcome to Automating Everything. I'm your host, Gene Da Rocha.

Today, in Episode 97, we are exploring one of the most fundamental shifts in the history of computing: The Sovereign Edge, and why true enterprise AI privacy demands local models and on-device execution.

For the past three years, the generative AI revolution was defined by massive, centralized cloud data centers. Every prompt, every proprietary business document, and every customer interaction was beamed across the internet to hyperscale server farms. 

However, with the rapid maturation of highly optimized, quantized models like Meta's Llama series, Google's Gemma, and Apple's ReALM on-device context engines, the computing paradigm has officially flipped. Artificial intelligence is moving to the edge.

Over the next twenty-four months, billions of smartphones, developer workstations, and enterprise laptops will be running native, quantized models directly on neural processing units and local GPUs. The promise is extraordinary: zero latency, complete offline reliability, zero per-token cloud costs, and hyper-personalized context.

Yet, for enterprise Chief Information Security Officers and regulatory compliance directors, this architectural shift presents a massive new challenge: The Evaporation of the Corporate Perimeter.

When AI lived in the cloud, corporate security teams could safeguard proprietary data by erecting centralized firewalls and proxy inspection gateways. But when the AI model lives natively on an employee's personal smartphone or local MacBook, the traditional network perimeter completely vanishes.

If a local on-device copilot processes sensitive customer data without a localized zero-trust execution wrapper, the edge becomes nothing more than a billion un-patched vulnerabilities waiting to be exploited.

In this episode, we break down how forward-thinking enterprises are navigating this transition:

First: Hybrid Edge-Cloud Orchestration. Modern architectures use small, ultra-fast 3-billion to 8-billion parameter models locally for real-time inference, UI automation, and preliminary data sanitization. Only anonymized, encrypted embeddings or complex reasoning sub-tasks are routed to larger cloud models.

Second: Local Hardware Security and Enclaves. Modern Apple Silicon and Snapdragon NPU chips feature dedicated secure enclaves. By pairing local model weights with hardware-bound encryption, enterprises ensure that weights and cached memory cannot be extracted even if the host operating system is compromised.

Third: Localized Zero-Trust Wrappers. By deploying lightweight, deterministic proxies directly on the edge device, organizations maintain centralized policy enforcement, rate limiting, and telemetry without needing to stream raw data back to a central server.

The future of AI is local, sovereign, and private. Leaders who build on this architecture today are creating durable competitive moats that safeguard customer trust while slashing cloud inference bills by over eighty percent.

Thank you for tuning into Episode 97 of Voxstar AI Automation. 

Subscribe to our Substack publication at voxstar.substack.com to access the complete architectural blueprint and deployment guide. Stream all episodes on Spotify and Apple Podcasts, and connect with me, Gene Da Rocha, across social media.

Until next time, keep your models sovereign and keep automating everything.
"""
    }
]

async def generate_episode_audio(ep):
    ep_num = ep["number"]
    voice_path = f"podcast_assets/output/ep{ep_num}_voice_raw.mp3"
    print(f"[{ep_num}] 1. Synthesizing full script with voice [{VOICE}]...")
    comm = edge_tts.Communicate(ep["script"].strip(), VOICE, rate=RATE, pitch=PITCH)
    await comm.save(voice_path)
    print(f"[{ep_num}]    -> Voice synthesis complete.")

def mix_and_master_episode(ep):
    ep_num = ep["number"]
    music_bed = "podcast_assets/voxstar_intro_standard_17s.mp3"
    voice_audio = f"podcast_assets/output/ep{ep_num}_voice_raw.mp3"
    artwork = "podcast_assets/podcast_logo_cloudfront.jpg"
    final_output = f"podcast_assets/output/Episode_{ep_num}_Master.mp3"
    public_output = f"public/podcast/Episode_{ep_num}_Master.mp3"
    
    print(f"[{ep_num}] 2. Layering signature intro music + -16 LUFS broadcast mastering...")
    
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", voice_audio,
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
        "-metadata", f"title={ep['title']}",
        "-metadata", "artist=Gene Da Rocha",
        "-metadata", "album=Voxstar AI Automation",
        "-metadata", f"track={ep_num}",
        "-metadata", f"comment={ep['subtitle']} | voxstar.substack.com",
        "-metadata", "genre=Podcast",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        final_output
    ]
    
    subprocess.run(ffmpeg_cmd, check=True)
    subprocess.run(["cp", final_output, public_output], check=True)
    
    # Also create specific named symlinks / copies
    if ep_num == 95:
        subprocess.run(["cp", final_output, "public/podcast/Episode_95_Microsoft_London_Hub_Master.mp3"], check=True)
    elif ep_num == 96:
        subprocess.run(["cp", final_output, "public/podcast/Episode_96_Zero_Trust_AI_Master.mp3"], check=True)
    elif ep_num == 97:
        subprocess.run(["cp", final_output, "public/podcast/Episode_97_Sovereign_Edge_Master.mp3"], check=True)
        
    print(f"[{ep_num}] 3. Finished Master: {final_output} ({os.path.getsize(final_output)} bytes)")

async def main():
    os.makedirs("podcast_assets/output", exist_ok=True)
    os.makedirs("public/podcast", exist_ok=True)
    
    for ep in EPISODES:
        await generate_episode_audio(ep)
        mix_and_master_episode(ep)

if __name__ == "__main__":
    asyncio.run(main())
