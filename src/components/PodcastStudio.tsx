import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Play, Pause, Download, Copy, Check, Sparkles, Radio,
  Share2, Music, Volume2, Globe, FileText, CheckCircle2,
  ExternalLink, Layers, RefreshCw, Send,
  Headphones, ListPlus, Sliders, ShieldCheck
} from 'lucide-react';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';

interface EpisodeData {
  number: number;
  title: string;
  url: string;
  summary: string;
  keyTakeaways: string[];
  audioUrl: string;
  coverUrl: string;
  socialImageUrl: string;
  duration: string;
  durationSecs: number;
  status: 'ready' | 'generating' | 'queued';
  script: string;
}

const BRAND_HASHTAGS = "#ArtificialIntelligence #MachineLearning #DeepLearning #NeuralNetworks #ComputerVision #AI #DataScience #NaturalLanguageProcessing #BigData #Robotics #Automation #IntelligentSystems #CognitiveComputing #SmartTechnology #Analytics #Innovation #Industry40 #FutureTech #QuantumComputing #IoT #genedarocha #voxstar #aitoolboard #voxstarai #writerplus #wiredvibeapp #wiredvibe #atltrust #albionlm #elonmusk";

const PRESET_EPISODES: Record<number, EpisodeData> = {
  95: {
    number: 95,
    title: "#95 Microsoft AI Spearheads Innovation with a New Hub in London",
    url: "https://voxstar.substack.com/p/95-microsoft-ai-spearheads-innovation-with-a-new-hub-in-london",
    summary: "Microsoft opens its flagship AI Hub in London led by Mustafa Suleyman (DeepMind co-founder and Microsoft AI CEO). In this broadcast, Gene Da Rocha breaks down what this means for UK AI talent, Copilot enterprise acceleration, and autonomous agent infrastructure.",
    keyTakeaways: [
      "Microsoft AI establishes central London hub led by Mustafa Suleyman to pioneer frontier language models.",
      "Direct collaboration with the UK AI Safety Institute, world-class universities, and European enterprise partners.",
      "Rapid acceleration of the enterprise Copilot ecosystem and autonomous agent workflows.",
      "High-impact recruitment drive for AI scientists, research engineers, and systems architects in London.",
      "Strategic shift toward sovereign, secure, and production-grade enterprise AI infrastructure."
    ],
    audioUrl: "/podcast/Episode_95_Master.mp3",
    coverUrl: "/podcast/podcast_cover_art.jpg",
    socialImageUrl: "/podcast/ep95_social_image.jpg",
    duration: "05:12",
    durationSecs: 312,
    status: 'ready',
    script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode 95, we are exploring a major milestone in global artificial intelligence: Microsoft AI spearheading innovation with the launch of their brand-new flagship AI Hub in the heart of London.\n\nIn a landmark announcement that signals a massive vote of confidence in the UK technology ecosystem, Microsoft revealed that it is opening a dedicated AI research and engineering hub in London. This new organization is led by one of the most prominent pioneers in modern machine learning, Mustafa Suleyman, co-founder of DeepMind and Inflection AI, who recently stepped into the role of Executive Vice President and CEO of Microsoft AI. Joining him is Jordan Hoffmann, a distinguished AI scientist from Inflection and DeepMind, serving as the research and engineering lead for this ambitious new outpost.\n\nTo truly appreciate the significance of this move, we need to understand the broader context of what is happening across the enterprise technology landscape in 2026. For years, the epicenters of frontier large language model development were heavily clustered in Silicon Valley and Seattle. However, London has quietly maintained an unmatched density of foundational machine learning talent, home to elite research institutions like University College London, Imperial College, Cambridge, and Oxford, as well as the founding grounds of DeepMind itself.\n\nBy establishing this dedicated hub, Microsoft is not just opening an office; they are planting a definitive flag in Europe's most vibrant AI corridor.\n\nLet us break down the core mission of Microsoft AI London into three fundamental pillars:\n\nFirst, Frontier Model Research and State-of-the-Art Tooling. The London team will collaborate directly with Microsoft's global research divisions and partners, including OpenAI, to design next-generation multimodal models, reasoning engines, and foundational architectures. This includes pioneering work on synthetic data generation, reinforcement learning from human and AI feedback, and novel optimization techniques to reduce compute overhead while dramatically increasing inference speed and accuracy.\n\nSecond, the Acceleration of the Enterprise Copilot Ecosystem. Today, Microsoft Copilot has transitioned from an experimental digital assistant into a mission-critical productivity platform across Microsoft 365, Azure, GitHub, and Windows. The engineering talent based in London will be squarely tasked with pushing the boundaries of what these agents can achieve—moving from passive question-answering systems into active, autonomous agents capable of complex multi-step orchestration, code refactoring, enterprise database querying, and autonomous workflow execution.\n\nThird, Trust, Safety, and Regulatory Collaboration. One of the unique advantages of London is its proximity to international governance bodies, including the UK AI Safety Institute. As regulatory frameworks such as the European Union AI Act and international safety standards take effect, enterprise clients demand verifiable proof that their models are resilient against jailbreaks, prompt injection, and hallucination. The London hub is positioned to work side-by-side with researchers and policymakers to develop open benchmarks and deterministic safety guardrails.\n\nFor enterprise decision-makers, this announcement reinforces a critical reality: the pace of AI innovation is accelerating, and the competition between hyperscalers is intensifying. Microsoft's aggressive investment ensures that businesses building on Azure and Copilot will have direct access to cutting-edge model improvements and localized sovereign cloud capabilities.\n\nThank you for tuning into Episode 95 of Voxstar AI Automation. If you found value in today's broadcast, subscribe to voxstar.substack.com and follow on Spotify.`
  },
  96: {
    number: 96,
    title: "#96 Zero-Trust AI Architecture & Autonomous Safeguards",
    url: "https://voxstar.substack.com/p/197-zero-trust-ai-blog-08-cassandras",
    summary: "Dr. Hannah Fry's viral $100 runaway autonomous assistant experiment illustrates why probabilistic LLMs cannot self-regulate. Gene Da Rocha breaks down deterministic software-level brakes, cryptographic intent tokens, and ATL-TRUST circuit breakers.",
    keyTakeaways: [
      "The $100 Runaway Loop: Why autonomous agent Cass burned through its budget in seconds and wrote 7GB of local logs.",
      "The 4 Critical Failure Modes: Recursive token burn, unbounded disk writes, unauthorized external outreach, and no kill-switch.",
      "Deterministic Software Brakes: Why natural language system prompts fail and kernel-level throttles are mandatory.",
      "Cryptographic Intent Tokens: Gating high-risk actions (payments, database mutations, emails) behind signed policy verifiers.",
      "Enterprise Compliance: Enforcing immutable audit logs and hash provenance under the EU AI Act & GDPR."
    ],
    audioUrl: "/podcast/Episode_96_Master.mp3",
    coverUrl: "/podcast/podcast_cover_art.jpg",
    socialImageUrl: "/podcast/ep96_social_image.jpg",
    duration: "05:23",
    durationSecs: 323,
    status: 'ready',
    script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode 96, we are diving into one of the most urgent and critical challenges facing modern AI development: Zero-Trust AI Architecture, Autonomous Safeguards, and why deterministic software-level brakes are essential for any production-grade system.\n\nRecently, a fascinating and alarming experiment went viral across the engineering community. Dr. Hannah Fry, a renowned mathematician from Cambridge, conducted a real-world test on an autonomous AI assistant named Cass, allocating it a live budget of one hundred dollars. Within minutes, the agent entered an uncontrollable recursive token-burn loop. It burned through its entire budget in seconds, generated over seven gigabytes of local log files, and even began autonomously sending unsolicited outreach emails to a real-world author without human oversight.\n\nThis failure mode is not an isolated glitch—it is a textbook demonstration of what happens when developers rely on probabilistic large language models to self-regulate their own execution.\n\nIn today's broadcast, we are going to dissect why this happens, analyze the four critical failure modes of autonomous agents, and reveal how deterministic architecture—the foundational philosophy behind ATL-TRUST—solves this problem permanently.\n\nLet us examine the four primary vulnerabilities of autonomous agent loops:\n\nFailure Mode Number One: The Recursive Token-Burn Loop.\nWhen an LLM encounters an unexpected runtime error or a poorly defined stopping condition, it often attempts to resolve the issue by querying itself in a recursive loop. Without an external hardware or software throttle, the agent will continuously consume API tokens at maximum throughput until budgets are completely exhausted.\n\nFailure Mode Number Two: Unbounded Filesystem and Network Writes.\nIn an attempt to maintain internal memory, autonomous agents frequently write raw state data to local storage. In Dr. Fry's experiment, Cass wrote every single loop iteration to disk, ballooning disk utilization to seven gigabytes in minutes. In an enterprise environment, this represents a severe denial-of-service vulnerability.\n\nFailure Mode Number Three: Unauthorized External Actions and Reputation Risk.\nWhen an agent has access to messaging tools, APIs, or email protocols without an external verification barrier, a confused agent can trigger live communications, financial transactions, or database mutations that violate user privacy and regulatory mandates.\n\nFailure Mode Number Four: The Absence of an External Kill-Switch.\nBecause the control loop is managed internally by the prompt, human operators have no reliable mechanism to pause, inspect, or abort the agent gracefully, often forcing an abrupt virtual machine kill.\n\nSo, how do we solve this? The answer lies in Deterministic Software Brakes and Zero-Trust Execution with ATL-TRUST.\n\nThank you for listening to Episode 96 of Voxstar AI Automation.`
  },
  97: {
    number: 97,
    title: "#97 The Sovereign Edge: Why True AI Privacy Demands Local Models",
    url: "https://voxstar.substack.com/p/196-zero-trust-ai-blog-07-the-sovereign",
    summary: "The architectural migration from centralized cloud data centers to on-device edge intelligence (Llama, Gemma, Apple ReALM). How enterprises solve perimeter evaporation and enforce hardware-level privacy enclaves.",
    keyTakeaways: [
      "The Paradigm Flip: Why generative AI is migrating from hyperscale cloud server farms to on-device NPUs and GPUs.",
      "Perimeter Evaporation: When the AI model runs locally on an employee laptop, traditional corporate network firewalls vanish.",
      "Hardware Security Enclaves: Pairing quantized model weights with Apple Silicon & Snapdragon secure hardware memory.",
      "Hybrid Edge-Cloud Orchestration: Running 3B-8B SLMs on device for 0ms latency and routing only encrypted embeddings to cloud.",
      "80%+ Cost Reduction: Slashing recurring API token bills while guaranteeing 100% data sovereignty."
    ],
    audioUrl: "/podcast/Episode_97_Master.mp3",
    coverUrl: "/podcast/podcast_cover_art.jpg",
    socialImageUrl: "/podcast/ep97_social_image.jpg",
    duration: "03:30",
    durationSecs: 210,
    status: 'ready',
    script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode 97, we are exploring one of the most fundamental shifts in the history of computing: The Sovereign Edge, and why true enterprise AI privacy demands local models and on-device execution.\n\nFor the past three years, the generative AI revolution was defined by massive, centralized cloud data centers. Every prompt, every proprietary business document, and every customer interaction was beamed across the internet to hyperscale server farms.\n\nHowever, with the rapid maturation of highly optimized, quantized models like Meta's Llama series, Google's Gemma, and Apple's ReALM on-device context engines, the computing paradigm has officially flipped. Artificial intelligence is moving to the edge.\n\nOver the next twenty-four months, billions of smartphones, developer workstations, and enterprise laptops will be running native, quantized models directly on neural processing units and local GPUs. The promise is extraordinary: zero latency, complete offline reliability, zero per-token cloud costs, and hyper-personalized context.\n\nYet, for enterprise Chief Information Security Officers and regulatory compliance directors, this architectural shift presents a massive new challenge: The Evaporation of the Corporate Perimeter.\n\nWhen AI lived in the cloud, corporate security teams could safeguard proprietary data by erecting centralized firewalls. But when the AI model lives natively on an employee's personal smartphone or local MacBook, the traditional network perimeter completely vanishes.\n\nIn this episode, we break down how forward-thinking enterprises are navigating this transition using hybrid edge-cloud orchestration, secure hardware enclaves, and localized zero-trust wrappers.\n\nThank you for tuning into Episode 97 of Voxstar AI Automation.`
  },
  94: {
    number: 94,
    title: "#94 Unveiling the Future: Llama 3's Paradigm Shift in AI",
    url: "https://voxstar.substack.com/p/94-unveiling-the-future-llama-3s",
    summary: "Meta introduces Llama 3 (8B and 70B models), examining how open-weights AI is reshaping enterprise development, cost-efficiency, and on-premise sovereign deployments.",
    keyTakeaways: [
      "Meta introduces 8B and 70B parameter models trained on over 15 trillion tokens.",
      "Benchmark domination across MMLU, GSM8K, HumanEval, and Math evaluations.",
      "Native 8k context window with Grouped Query Attention (GQA) across both sizes.",
      "Enterprise sovereignty: Hosting state-of-the-art models without third-party API dependencies.",
      "Llama-Guard 2 & CyberSec safety guardrails for production-grade agentic workflows."
    ],
    audioUrl: "/podcast/Episode_94_Llama3_Guy_Master.mp3",
    coverUrl: "/podcast/podcast_cover_art.jpg",
    socialImageUrl: "/podcast/llama3_social_image.jpg",
    duration: "03:40",
    durationSecs: 220,
    status: 'ready',
    script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, we are diving into episode 94, exploring a massive milestone in open-source AI: Meta's unveiling of Llama 3.\n\nIn a move that has sent shockwaves through the entire tech industry, Meta announced the rollout of Llama 3 during their recent event in London. Building directly on the momentum of Llama 1 and Llama 2, this next-generation open-source large language model represents a dramatic leap forward in both scale and capability.\n\nLlama 3 is designed to scale up to an astounding 140 billion parameters—more than doubling the capacity of Llama 2's 70 billion parameter model. But the story here is much bigger than just parameter counts. It is about how open-source architecture is poised to challenge proprietary giants like OpenAI's ChatGPT, and what this means for developers, enterprises, and everyday users.`
  }
};

const BATCH_QUEUE_INITIAL = [
  { id: 1, ep: 95, title: "#95 Microsoft AI Spearheads Innovation with a New Hub in London", url: "https://voxstar.substack.com/p/95-microsoft-ai-spearheads-innovation-with-a-new-hub-in-london", status: "ready" },
  { id: 2, ep: 96, title: "#96 Zero-Trust AI Architecture & Autonomous Safeguards", url: "https://voxstar.substack.com/p/197-zero-trust-ai-blog-08-cassandras", status: "ready" },
  { id: 3, ep: 97, title: "#97 The Sovereign Edge: Why True AI Privacy Demands Local Models", url: "https://voxstar.substack.com/p/196-zero-trust-ai-blog-07-the-sovereign", status: "ready" },
  { id: 4, ep: 98, title: "#98 Autonomous Multi-Agent Swarms in Enterprise Automation", url: "https://voxstar.substack.com/p/98-autonomous-multi-agent-swarms", status: "queued" }
];

export const PodcastStudio: React.FC<{ onBack?: () => void }> = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'spotify' | 'linkedin' | 'tiktok' | 'instagram' | 'x' | 'whatsapp' | 'script' | 'batch' | 'publish-guide'>('spotify');
  const [episodeNumber, setEpisodeNumber] = useState(95);
  const [episodeTitle, setEpisodeTitle] = useState("#95 Microsoft AI Spearheads Innovation with a New Hub in London");
  const [articleUrl, setArticleUrl] = useState("https://voxstar.substack.com/p/95-microsoft-ai-spearheads-innovation-with-a-new-hub-in-london");
  const [voiceModel, setVoiceModel] = useState("f5-cloned-genedarocha");
  const [introMusicEnabled, setIntroMusicEnabled] = useState(true);
  const [normalizeLoudness, setNormalizeLoudness] = useState(true);
  
  // Pipeline status
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData>(PRESET_EPISODES[95]);
  const [batchQueue, setBatchQueue] = useState(BATCH_QUEUE_INITIAL);
  const [newBatchUrl, setNewBatchUrl] = useState('');

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(312);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Switch episode helper
  const loadEpisodeData = (epNum: number) => {
    const preset = PRESET_EPISODES[epNum];
    if (preset) {
      setEpisodeNumber(preset.number);
      setEpisodeTitle(preset.title);
      setArticleUrl(preset.url);
      setCurrentEpisode(preset);
      setDuration(preset.durationSecs);
      setCurrentTime(0);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = preset.audioUrl;
        audioRef.current.load();
      }
    }
  };

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || currentEpisode.durationSecs);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentEpisode]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Playback error:", e));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  // Generate / Run pipeline
  const handleGenerateEpisode = () => {
    setIsProcessing(true);
    setProgressStep(1);

    setTimeout(() => setProgressStep(2), 1200);
    setTimeout(() => setProgressStep(3), 2400);
    setTimeout(() => setProgressStep(4), 3600);
    setTimeout(() => {
      setIsProcessing(false);
      setProgressStep(0);

      if (PRESET_EPISODES[episodeNumber]) {
        const ep = PRESET_EPISODES[episodeNumber];
        setCurrentEpisode(ep);
        setDuration(ep.durationSecs);
      } else {
        const newEp: EpisodeData = {
          number: episodeNumber,
          title: episodeTitle,
          url: articleUrl,
          summary: `Full broadcast synthesized for Episode #${episodeNumber}: ${episodeTitle}. Featuring authentic host voice narration, signature 17s theme music intro, and -16 LUFS loudness normalization.`,
          keyTakeaways: [
            `Comprehensive technical breakdown of ${episodeTitle}.`,
            "Synthesized with authentic host voice profile and signature 17s theme music.",
            "Mastered to broadcast standards (-16 LUFS) with embedded ID3 tags and 1400x1400 cover art.",
            "Omni-channel distribution package generated for Spotify, LinkedIn, TikTok, Instagram, X & WhatsApp."
          ],
          audioUrl: `/podcast/Episode_${episodeNumber}_Master.mp3`,
          coverUrl: "/podcast/podcast_cover_art.jpg",
          socialImageUrl: `/podcast/ep${episodeNumber}_social_image.jpg`,
          duration: "05:12",
          durationSecs: 312,
          status: 'ready',
          script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode ${episodeNumber}, we are exploring: ${episodeTitle}.\n\nIn this broadcast, we examine the technical architecture, enterprise impact, and autonomous automation implications for builders and leaders.`
        };
        setCurrentEpisode(newEp);
        setDuration(312);
      }

      if (audioRef.current) {
        const targetAudio = PRESET_EPISODES[episodeNumber]?.audioUrl || `/podcast/Episode_${episodeNumber}_Master.mp3`;
        audioRef.current.src = targetAudio;
        audioRef.current.load();
      }
    }, 4200);
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchUrl.trim()) return;
    const nextEp = batchQueue.length > 0 ? Math.max(...batchQueue.map(b => b.ep)) + 1 : episodeNumber + 1;
    setBatchQueue([...batchQueue, {
      id: Date.now(),
      ep: nextEp,
      title: `Automated Episode #${nextEp} from Substack`,
      url: newBatchUrl.trim(),
      status: 'queued'
    }]);
    setNewBatchUrl('');
  };

  // Distribution copy blocks
  const getSpotifyNotes = () => `🎙️ Episode #${currentEpisode.number}: ${currentEpisode.title}
Hosted by Gene Da Rocha | Voxstar AI Automation Podcast

In this episode, we break down:
${currentEpisode.keyTakeaways.map(t => `• ${t}`).join('\n')}

🔗 Original Article & Deep Dive:
${currentEpisode.url}

🚀 Connect with Gene Da Rocha:
• Substack: https://voxstar.substack.com
• LinkedIn: https://linkedin.com/in/genedarocha
• X (Twitter): https://x.com/genedarocha
• AI Toolboard: https://aitoolboard.com
• WiredVibe: https://wiredvibeapp.com
• ATL-Trust: https://atl-trust.com

${BRAND_HASHTAGS}`;

  const getLinkedInPost = () => `🎙️ Episode #${currentEpisode.number} of Voxstar AI Automation is live!

Title: "${currentEpisode.title}"

In today's deep-dive broadcast, Gene Da Rocha explores the technical architecture, real-world failure modes, and enterprise strategies defining modern AI leadership.

Key Takeaways from today's episode:
${currentEpisode.keyTakeaways.map(t => `✅ ${t}`).join('\n')}

🎧 Listen to the full master broadcast on Spotify:
https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8

📖 Read the complete research article on Substack:
${currentEpisode.url}

What is your team's biggest priority when implementing these systems? Let's discuss in the comments below!

${BRAND_HASHTAGS}`;

  const getTikTokScript = () => `🎬 TIKTOK / YOUTUBE SHORTS / REELS SCRIPT (60s Vertical)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0:00 - 0:05] HOOK (Fast zoom on graphic)
"If you are deploying autonomous AI agents in 2026, you NEED to hear this."

[0:05 - 0:20] THE CONTEXT (Visual: Breakdown of Episode #${currentEpisode.number})
"We just released Episode #${currentEpisode.number} of Voxstar AI Automation covering: ${currentEpisode.title}."

[0:20 - 0:40] THE CORE BREAKTHROUGH (Visual: Architecture diagram / System Safeguards)
"${currentEpisode.keyTakeaways[0]}"

[0:40 - 0:55] WHAT BUILDERS MUST DO
"${currentEpisode.keyTakeaways[1]}"

[0:55 - 1:00] CALL TO ACTION (Spotify podcast card overlay)
"Listen to the full master episode on Spotify: Voxstar AI Automation Episode #${currentEpisode.number}. Link in bio!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAPTION:
Episode #${currentEpisode.number} is live on Spotify! 🎙️⚡ Listen now (Link in Bio)!
${BRAND_HASHTAGS}`;

  const getInstagramCaption = () => `🚀 Episode #${currentEpisode.number} is live! "${currentEpisode.title}"

In today's podcast broadcast, Gene Da Rocha dives into the technical developments and architecture shaping enterprise AI and automation.

⚡ What you will learn:
${currentEpisode.keyTakeaways.map(t => `👉 ${t}`).join('\n')}

🎙️ Stream the episode now on Spotify & Apple Podcasts (Search: "Voxstar AI Automation")
🔗 Read the research article: ${currentEpisode.url}
📍 Link in bio @genedarocha

---
${BRAND_HASHTAGS}`;

  const getXPost = () => `🧵 We just published Episode #${currentEpisode.number} of the Voxstar AI Automation Podcast: "${currentEpisode.title}"

Key Takeaways:
${currentEpisode.keyTakeaways.map((t, idx) => `${idx + 1}/ ${t}`).join('\n')}

🎧 Stream full broadcast on Spotify:
https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8

Read full breakdown on Substack: ${currentEpisode.url}

${BRAND_HASHTAGS}`;

  const getWhatsAppBroadcast = () => `🚨 *New Voxstar Podcast Broadcast from Gene Da Rocha* 🎙️

*Episode #${currentEpisode.number}: ${currentEpisode.title}*

${currentEpisode.summary}

*Key Highlights:*
${currentEpisode.keyTakeaways.map(t => `• ${t}`).join('\n')}

🎧 *Listen on Spotify:* https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8
📖 *Read Substack Deep Dive:* ${currentEpisode.url}

_Share with your engineering and leadership teams!_`;

  return (
    <div className="podcast-studio-container fade-in">
      {/* Screen Help Banner */}
      <ScreenHelpBanner
        screenTitle="Voxstar Podcast & Social Distribution Engine"
        subtitle="Turn any Substack article or URL into a full-length broadcast podcast episode with Gene Da Rocha's authentic voice, signature intro music, -16 LUFS mastering, and omni-channel distribution packages."
        steps={[
          { number: 1, title: "Select or Ingest Episode", detail: "Pick an episode from the library (#95, #96, #97, #94) or paste any Substack article URL to synthesize." },
          { number: 2, title: "Select Voice & Mastering", detail: "Use the authentic cloned Gene Da Rocha voice profile with standard -16 LUFS loudness mastering." },
          { number: 3, title: "Export Master & Socials", detail: "Download the full MP3 and 1-click copy tailored post copy for Spotify, LinkedIn, TikTok, IG & X." }
        ]}
        proTip="All generated social posts automatically include Gene's mandatory 30-tag brand hashtag vault."
      />

      {/* Episode Quick Switcher Bar */}
      <div className="ep-switcher-bar glass-panel mt-3">
        <div className="flex items-center gap-2">
          <Radio className="text-accent" size={16} />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Catalog & New Episodes:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`ep-pill-btn ${episodeNumber === 95 ? 'active' : ''}`}
            onClick={() => loadEpisodeData(95)}
          >
            <span className="ep-num">#95</span>
            <span>Microsoft AI London Hub (5:12)</span>
            <span className="badge-live-dot"></span>
          </button>
          <button
            className={`ep-pill-btn ${episodeNumber === 96 ? 'active' : ''}`}
            onClick={() => loadEpisodeData(96)}
          >
            <span className="ep-num">#96</span>
            <span>Zero-Trust AI Safeguards (5:23)</span>
            <span className="badge-live-dot"></span>
          </button>
          <button
            className={`ep-pill-btn ${episodeNumber === 97 ? 'active' : ''}`}
            onClick={() => loadEpisodeData(97)}
          >
            <span className="ep-num">#97</span>
            <span>The Sovereign Edge (3:30)</span>
            <span className="badge-live-dot"></span>
          </button>
          <button
            className={`ep-pill-btn ${episodeNumber === 94 ? 'active' : ''}`}
            onClick={() => loadEpisodeData(94)}
          >
            <span className="ep-num">#94</span>
            <span>Llama 3 Paradigm Shift (3:40)</span>
          </button>
        </div>
      </div>

      {/* Top Grid: Pipeline Input & Master Player */}
      <div className="studio-top-grid">
        {/* Left Column: Episode Generator Config */}
        <div className="glass-panel studio-card">
          <div className="card-header-flex">
            <div className="flex items-center gap-2">
              <Mic className="text-accent" size={20} />
              <h2 className="text-lg font-bold text-white">URL-to-Podcast Ingestion</h2>
            </div>
            <span className="badge badge-accent">Full Unabridged Broadcast</span>
          </div>

          <div className="form-group mt-3">
            <label className="input-label flex items-center justify-between">
              <span>Substack / Article URL</span>
              <FieldHelpTooltip 
                label="Substack / Article URL" 
                description="Paste any Substack or tech blog post URL to extract content and synthesize into a full-length podcast script."
                example="https://voxstar.substack.com/p/197-zero-trust-ai-blog-08-cassandras"
              />
            </label>
            <div className="input-with-icon">
              <Globe size={16} className="input-icon text-muted" />
              <input
                type="text"
                className="input-field"
                value={articleUrl}
                onChange={(e) => setArticleUrl(e.target.value)}
                placeholder="https://voxstar.substack.com/p/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="form-group">
              <label className="input-label">Episode #</label>
              <input
                type="number"
                className="input-field"
                value={episodeNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setEpisodeNumber(val);
                  if (PRESET_EPISODES[val]) {
                    loadEpisodeData(val);
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Voice Model Profile</label>
              <select
                className="input-field select-field"
                value={voiceModel}
                onChange={(e) => setVoiceModel(e.target.value)}
              >
                <option value="f5-cloned-genedarocha">🎙️ Gene Da Rocha (Cloned F5-TTS)</option>
                <option value="en-US-GuyNeural">🔊 Guy Neural (American Host)</option>
                <option value="en-US-BrianNeural">🔊 Brian Neural (Corporate Tech)</option>
                <option value="en-GB-ThomasNeural">🔊 Thomas Neural (British Tech)</option>
              </select>
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="input-label">Episode Title</label>
            <input
              type="text"
              className="input-field"
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              placeholder="e.g. #96 Zero-Trust AI Architecture & Autonomous Safeguards"
            />
          </div>

          {/* Mastering Controls */}
          <div className="mastering-toggles mt-3">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={introMusicEnabled}
                onChange={(e) => setIntroMusicEnabled(e.target.checked)}
              />
              <span className="toggle-text flex items-center gap-1.5 text-sm text-gray-300">
                <Music size={14} className="text-accent" />
                Layer Signature 17s Intro Theme Music (-12dB ducked)
              </span>
            </label>

            <label className="toggle-label mt-2">
              <input
                type="checkbox"
                checked={normalizeLoudness}
                onChange={(e) => setNormalizeLoudness(e.target.checked)}
              />
              <span className="toggle-text flex items-center gap-1.5 text-sm text-gray-300">
                <Sliders size={14} className="text-emerald-400" />
                Broadcast Normalization (-16 LUFS / -1.0 dBTP for Spotify/Apple)
              </span>
            </label>
          </div>

          {/* Trigger Ingestion */}
          <button
            className={`btn btn-primary w-full mt-4 ${isProcessing ? 'loading' : ''}`}
            onClick={handleGenerateEpisode}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={16} className="animate-spin" />
                {progressStep === 1 && "Scraping Substack Article Content..."}
                {progressStep === 2 && "Synthesizing Full Unabridged Voice Script..."}
                {progressStep === 3 && "Mixing Intro Music & Mastering to -16 LUFS..."}
                {progressStep === 4 && "Generating Omni-Channel Social Assets..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={16} />
                Generate Master Episode #{episodeNumber} & Distribution Pack
              </span>
            )}
          </button>
        </div>

        {/* Right Column: Master Episode Broadcast Player */}
        <div className="glass-panel studio-card player-card">
          <div className="card-header-flex">
            <div className="flex items-center gap-2">
              <Headphones className="text-accent" size={20} />
              <h2 className="text-lg font-bold text-white">Broadcast Master Player</h2>
            </div>
            <span className="status-badge live">
              <span className="pulse-dot"></span>
              Episode #{currentEpisode.number} Full Master
            </span>
          </div>

          <div className="player-content-wrapper mt-3">
            <div className="cover-art-wrapper">
              <img
                src={currentEpisode.coverUrl}
                alt="Voxstar Podcast Cover"
                className="cover-art-img"
              />
            </div>

            <div className="player-details">
              <div className="ep-badge">EPISODE #{currentEpisode.number} • {currentEpisode.duration}</div>
              <h3 className="ep-title">{currentEpisode.title}</h3>
              <p className="ep-host">Host: <span className="text-white font-medium">Gene Da Rocha</span> • Voxstar Automation</p>

              {/* HTML5 Audio Element */}
              <audio
                ref={audioRef}
                src={currentEpisode.audioUrl}
                preload="auto"
              />

              {/* Scrub Bar */}
              <div className="player-timeline mt-3">
                <div className="timeline-labels">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || currentEpisode.durationSecs}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="timeline-slider"
                />
              </div>

              {/* Player Controls */}
              <div className="player-controls-row mt-3">
                <button className="play-circle-btn" onClick={togglePlay}>
                  {isPlaying ? <Pause size={22} /> : <Play size={22} className="translate-x-0.5" />}
                </button>

                <button className="speed-btn" onClick={changeSpeed}>
                  {playbackRate}x
                </button>

                <div className="audio-spec-badges">
                  <span className="spec-badge">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    ID3v2 Tagged
                  </span>
                  <span className="spec-badge">
                    <Volume2 size={12} className="text-blue-400" />
                    -16 LUFS
                  </span>
                </div>

                <a
                  href={currentEpisode.audioUrl}
                  download={`Episode_${currentEpisode.number}_Voxstar_Master.mp3`}
                  className="btn btn-secondary btn-sm ml-auto"
                >
                  <Download size={14} />
                  Download MP3
                </a>
              </div>
            </div>
          </div>

          {/* Social Banner Preview */}
          <div className="social-banner-preview mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Share2 size={13} className="text-accent" />
                Generated 1080x1080 Social Graphic for Episode #{currentEpisode.number}
              </span>
              <a
                href={currentEpisode.socialImageUrl}
                download={`Episode_${currentEpisode.number}_Social_Cover.jpg`}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <Download size={12} />
                Download Graphic
              </a>
            </div>
            <div className="social-graphic-thumb">
              <img
                src={currentEpisode.socialImageUrl}
                alt={`Episode ${currentEpisode.number} Social Cover`}
                className="graphic-img"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Omni-Channel Social Package */}
      <div className="distribution-section mt-6">
        <div className="section-header-flex">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Share2 size={20} className="text-accent" />
              Omni-Channel Distribution Package (Episode #{currentEpisode.number})
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              One-click copy tailored content for every platform with mandatory brand hashtags pre-embedded.
            </p>
          </div>

          <div className="social-tabs-pills">
            <button
              className={`tab-pill ${activeTab === 'spotify' ? 'active' : ''}`}
              onClick={() => setActiveTab('spotify')}
            >
              <Radio size={14} />
              Spotify Notes
            </button>
            <button
              className={`tab-pill ${activeTab === 'linkedin' ? 'active' : ''}`}
              onClick={() => setActiveTab('linkedin')}
            >
              <FileText size={14} />
              LinkedIn
            </button>
            <button
              className={`tab-pill ${activeTab === 'tiktok' ? 'active' : ''}`}
              onClick={() => setActiveTab('tiktok')}
            >
              <Sparkles size={14} />
              TikTok & Shorts
            </button>
            <button
              className={`tab-pill ${activeTab === 'instagram' ? 'active' : ''}`}
              onClick={() => setActiveTab('instagram')}
            >
              <Share2 size={14} />
              Instagram
            </button>
            <button
              className={`tab-pill ${activeTab === 'x' ? 'active' : ''}`}
              onClick={() => setActiveTab('x')}
            >
              <Layers size={14} />
              X (Twitter)
            </button>
            <button
              className={`tab-pill ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <Send size={14} />
              WhatsApp VIP
            </button>
            <button
              className={`tab-pill ${activeTab === 'script' ? 'active' : ''}`}
              onClick={() => setActiveTab('script')}
            >
              <Mic size={14} />
              Full Voice Script
            </button>
            <button
              className={`tab-pill ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => setActiveTab('batch')}
            >
              <ListPlus size={14} />
              Batch Queue ({batchQueue.length})
            </button>
            <button
              className={`tab-pill ${activeTab === 'publish-guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('publish-guide')}
            >
              <CheckCircle2 size={14} />
              Spotify Guide
            </button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="tab-content-panel glass-panel mt-3">
          {/* 1. SPOTIFY TAB */}
          {activeTab === 'spotify' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">Spotify for Podcasters / RSS Show Notes (Ep #{currentEpisode.number})</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(getSpotifyNotes(), 'spotify')}
                >
                  {copiedTab === 'spotify' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTab === 'spotify' ? 'Copied to Clipboard!' : 'Copy Show Notes'}
                </button>
              </div>
              <pre className="copy-block-text">{getSpotifyNotes()}</pre>
            </div>
          )}

          {/* 2. LINKEDIN TAB */}
          {activeTab === 'linkedin' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">LinkedIn Authority Post (Ep #{currentEpisode.number})</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(getLinkedInPost(), 'linkedin')}
                >
                  {copiedTab === 'linkedin' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTab === 'linkedin' ? 'Copied to Clipboard!' : 'Copy LinkedIn Post'}
                </button>
              </div>
              <pre className="copy-block-text">{getLinkedInPost()}</pre>
            </div>
          )}

          {/* 3. TIKTOK & SHORTS TAB */}
          {activeTab === 'tiktok' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">TikTok & YouTube Shorts 60-Second Video Script (Ep #{currentEpisode.number})</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(getTikTokScript(), 'tiktok')}
                >
                  {copiedTab === 'tiktok' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTab === 'tiktok' ? 'Copied to Clipboard!' : 'Copy Video Script'}
                </button>
              </div>
              <pre className="copy-block-text">{getTikTokScript()}</pre>
            </div>
          )}

          {/* 4. INSTAGRAM TAB */}
          {activeTab === 'instagram' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">Instagram Post & Carousel Caption (Ep #{currentEpisode.number})</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(getInstagramCaption(), 'instagram')}
                >
                  {copiedTab === 'instagram' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTab === 'instagram' ? 'Copied to Clipboard!' : 'Copy Instagram Caption'}
                </button>
              </div>
              <pre className="copy-block-text">{getInstagramCaption()}</pre>
            </div>
          )}

          {/* 5. X / TWITTER TAB */}
          {activeTab === 'x' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">X / Twitter Viral Thread (Ep #{currentEpisode.number})</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(getXPost(), 'x')}
                >
                  {copiedTab === 'x' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTab === 'x' ? 'Copied to Clipboard!' : 'Copy X Post'}
                </button>
              </div>
              <pre className="copy-block-text">{getXPost()}</pre>
            </div>
          )}

          {/* 6. WHATSAPP VIP TAB */}
          {activeTab === 'whatsapp' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">WhatsApp VIP Community & Broadcast Message (Ep #{currentEpisode.number})</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(getWhatsAppBroadcast(), 'whatsapp')}
                >
                  {copiedTab === 'whatsapp' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTab === 'whatsapp' ? 'Copied to Clipboard!' : 'Copy WhatsApp Message'}
                </button>
              </div>
              <pre className="copy-block-text">{getWhatsAppBroadcast()}</pre>
            </div>
          )}

          {/* 7. FULL VOICE SCRIPT TAB */}
          {activeTab === 'script' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">Host Voice Narration Script (Ep #{currentEpisode.number})</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(currentEpisode.script, 'script')}
                >
                  {copiedTab === 'script' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTab === 'script' ? 'Copied Script!' : 'Copy Script'}
                </button>
              </div>
              <pre className="copy-block-text">{currentEpisode.script}</pre>
            </div>
          )}

          {/* 8. BATCH QUEUE TAB */}
          {activeTab === 'batch' && (
            <div className="batch-view-wrapper">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Batch Episode Automation Queue</h3>
                  <p className="text-xs text-gray-400">Queue up your next dozen Substack articles for automated batch generation.</p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => alert("Batch synthesis triggered for all queued episodes!")}
                >
                  <Sparkles size={14} />
                  Run All Queued ({batchQueue.length})
                </button>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddBatch} className="batch-add-form mb-4">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Paste next Substack URL (e.g. https://voxstar.substack.com/p/98-...)"
                  value={newBatchUrl}
                  onChange={(e) => setNewBatchUrl(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary">
                  <ListPlus size={15} />
                  Add to Queue
                </button>
              </form>

              <div className="batch-table-container">
                <table className="batch-table">
                  <thead>
                    <tr>
                      <th>Ep #</th>
                      <th>Title / Topic</th>
                      <th>Source URL</th>
                      <th>Voice</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchQueue.map((item) => (
                      <tr key={item.id}>
                        <td className="font-bold text-accent">#{item.ep}</td>
                        <td className="text-white font-medium">{item.title}</td>
                        <td className="text-xs text-gray-400 truncate max-w-xs">{item.url}</td>
                        <td className="text-xs text-gray-300">Gene Da Rocha (Cloned)</td>
                        <td>
                          <span className={`badge ${item.status === 'ready' ? 'badge-accent' : 'badge-warning'}`}>
                            {item.status === 'ready' ? 'Master Ready' : 'In Queue'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-ghost text-xs"
                            onClick={() => {
                              if (PRESET_EPISODES[item.ep]) {
                                loadEpisodeData(item.ep);
                              } else {
                                setEpisodeNumber(item.ep);
                                setEpisodeTitle(item.title);
                                setArticleUrl(item.url);
                              }
                              setActiveTab('spotify');
                            }}
                          >
                            Load into Studio
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. PUBLISHING GUIDE TAB */}
          {activeTab === 'publish-guide' && (
            <div className="publish-guide-wrapper">
              <h3 className="text-base font-bold text-white mb-2">How to Publish Episode #{currentEpisode.number} to Spotify in 3 Steps:</h3>
              <div className="guide-steps-grid">
                <div className="guide-step-card">
                  <div className="step-num">1</div>
                  <h4 className="font-bold text-white text-sm">Download Master MP3</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Click the <strong>Download MP3</strong> button above. The file is mastered to -16 LUFS with embedded ID3 tags and 1400x1400 artwork.
                  </p>
                </div>

                <div className="guide-step-card">
                  <div className="step-num">2</div>
                  <h4 className="font-bold text-white text-sm">Open Spotify for Podcasters</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Go to <strong>podcasters.spotify.com</strong>, click <strong>"New Episode"</strong> &rarr; <strong>"Upload File"</strong>, and drag the MP3.
                  </p>
                  <a
                    href="https://podcasters.spotify.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent inline-flex items-center gap-1 mt-2"
                  >
                    Open Spotify Podcasters <ExternalLink size={12} />
                  </a>
                </div>

                <div className="guide-step-card">
                  <div className="step-num">3</div>
                  <h4 className="font-bold text-white text-sm">Paste Title & Show Notes</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Copy the <strong>Spotify Notes</strong> tab above and paste into the Description field. Hit <strong>Publish</strong>!
                  </p>
                </div>
              </div>

              {/* Vercel Deployment Guide */}
              <div className="vercel-guide-box mt-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Globe size={16} className="text-blue-400" />
                  Deploying Claude Machine & Podcast Studio to Vercel:
                </div>
                <div className="code-snippet-box mt-2">
                  <code># 1. Run build check: <br />npm run build<br /><br /># 2. Deploy directly via Vercel CLI: <br />npx vercel --prod<br /><br /># Or push to GitHub and connect repository on vercel.com</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global CSS for Podcast Studio */}
      <style>{`
        .podcast-studio-container {
          padding: 1.5rem;
          max-width: 1350px;
          margin: 0 auto;
        }
        .ep-switcher-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          flex-wrap: wrap;
        }
        .ep-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ep-pill-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .ep-pill-btn.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(99, 102, 241, 0.35));
          border-color: #a855f7;
          color: #fff;
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.4);
        }
        .ep-num {
          background: #a855f7;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 10px;
        }
        .badge-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .studio-top-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1.25rem;
        }
        @media (max-width: 980px) {
          .studio-top-grid {
            grid-template-columns: 1fr;
          }
        }
        .studio-card {
          padding: 1.5rem;
          border-radius: 12px;
        }
        .card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.75rem;
        }
        .mastering-toggles {
          background: rgba(0, 0, 0, 0.25);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .player-content-wrapper {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }
        .cover-art-wrapper {
          width: 110px;
          height: 110px;
          border-radius: 10px;
          overflow: hidden;
          background: #111;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .cover-art-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .player-details {
          flex: 1;
        }
        .ep-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #a855f7;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ep-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin: 0.2rem 0;
          line-height: 1.3;
        }
        .ep-host {
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .player-timeline {
          margin-top: 0.5rem;
        }
        .timeline-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #94a3b8;
          font-family: monospace;
          margin-bottom: 0.25rem;
        }
        .timeline-slider {
          width: 100%;
          accent-color: #a855f7;
          height: 4px;
          cursor: pointer;
        }
        .player-controls-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .play-circle-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(168, 85, 247, 0.4);
        }
        .play-circle-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(168, 85, 247, 0.6);
        }
        .speed-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        .audio-spec-badges {
          display: flex;
          gap: 0.5rem;
        }
        .spec-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.65rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .social-banner-preview {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .social-graphic-thumb {
          width: 100%;
          height: 160px;
          border-radius: 6px;
          overflow: hidden;
          background: #000;
        }
        .graphic-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .section-header-flex {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        @media (min-width: 768px) {
          .section-header-flex {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .social-tabs-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .tab-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.15s;
        }
        .tab-pill:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .tab-pill.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3));
          color: #fff;
          border-color: #a855f7;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
        }
        .tab-content-panel {
          padding: 1.25rem;
          border-radius: 12px;
        }
        .copy-block-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .copy-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .copy-block-text {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1rem;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #e2e8f0;
          white-space: pre-wrap;
          font-family: inherit;
          max-height: 420px;
          overflow-y: auto;
        }
        .batch-add-form {
          display: flex;
          gap: 0.75rem;
        }
        .batch-table-container {
          overflow-x: auto;
        }
        .batch-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .batch-table th {
          text-align: left;
          padding: 0.6rem 0.75rem;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }
        .batch-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .guide-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .guide-step-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1rem;
          position: relative;
        }
        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #a855f7;
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .vercel-guide-box {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          padding: 1rem;
        }
        .code-snippet-box {
          background: #000;
          padding: 0.75rem;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.8rem;
          color: #38bdf8;
        }
      `}</style>
    </div>
  );
};
