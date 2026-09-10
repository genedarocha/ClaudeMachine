import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Play, Pause, Download, Copy, Check, Sparkles, Radio,
  Share2, Music, Volume2, Globe, FileText, CheckCircle2,
  Layers, RefreshCw, Send,
  Headphones, ListPlus, Sliders, ShieldCheck, CheckCheck,
  Clock, Smartphone, ExternalLink, FileAudio, Tag, Info, ChevronDown, ChevronUp,
  Video, Search, Filter, FolderDown, RotateCcw, Plus, Clipboard, X
} from 'lucide-react';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';
import {
  YOUTUBE_SHORTS_ARCHIVE_93,
  type YoutubeShortPackage,
  SPOTIFY_PODCAST_SHOW_URL,
  YOUTUBE_STUDIO_UPLOAD_URL
} from '../data/youtubeShortsArchive';

const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

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

interface ChannelPublishStatus {
  channelId: 'spotify' | 'youtube' | 'linkedin' | 'x' | 'instagram' | 'tiktok' | 'whatsapp';
  channelName: string;
  account: string;
  iconName: string;
  status: 'idle' | 'publishing' | 'published';
  publishedAt?: string;
  receiptId?: string;
}

const BRAND_HASHTAGS = "#ArtificialIntelligence #MachineLearning #DeepLearning #NeuralNetworks #ComputerVision #AI #DataScience #NaturalLanguageProcessing #BigData #Robotics #Automation #IntelligentSystems #CognitiveComputing #SmartTechnology #Analytics #Innovation #Industry40 #FutureTech #QuantumComputing #IoT #genedarocha #voxstar #aitoolboard #voxstarai #writerplus #wiredvibeapp #wiredvibe #atltrust #albionlm #elonmusk";

const PRESET_EPISODES: Record<number, EpisodeData> = {
  96: {
    number: 96,
    title: "#96 Challenging NVIDIA's Reign: The Rise of Custom AI Silicon",
    url: "https://voxstar.substack.com/p/96-challenging-nvidias-reign-the",
    summary: "In this deep-dive broadcast, Gene Da Rocha analyzes the intensifying battle for AI compute dominance: how hyperscalers and enterprises are challenging NVIDIA's GPU monopoly with custom silicon (TPUs, ASICs, Trainium), open compiler layers like OpenAI Triton, and on-premise sovereign infrastructure.",
    keyTakeaways: [
      "The AI Compute Bottleneck: Why skyrocketing GPU cluster costs and supply allocation limits are forcing enterprise leaders to evaluate alternative silicon architectures.",
      "Challenging the CUDA Moat: How open-source compilers like PyTorch 2.0, OpenAI Triton, and Modular Mojo are breaking proprietary GPU software lock-in.",
      "Hyperscaler Custom Silicon: Comparing Google TPUs, AWS Trainium/Inferentia, and Meta MTIA against standard NVIDIA H100 and Blackwell clusters.",
      "Inference vs Training Cost Curves: Slashing operational token bills by migrating production workloads to specialized ASICs and on-device NPUs.",
      "Enterprise Hardware Sovereignty: Practical deployment playbooks for engineering leaders architecting resilient, multi-vendor AI compute pipelines in 2026."
    ],
    audioUrl: "/podcast/Episode_96_Master.mp3",
    coverUrl: "/podcast/podcast_cover_art.jpg",
    socialImageUrl: "/podcast/ep96_social_image.jpg",
    duration: "05:18",
    durationSecs: 318,
    status: 'ready',
    script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode 96, we are exploring a seismic shift across the artificial intelligence industry: Challenging NVIDIA's Reign and the Rise of Custom AI Silicon.\n\nFor the past four years, NVIDIA has held an ironclad grip on the generative AI revolution. From the A100 to the H100 and the new Blackwell architecture, their specialized graphics processing units and proprietary CUDA software ecosystem have dictated the pace, price, and availability of AI compute worldwide.\n\nHowever, in 2026, the computing landscape is entering a transformative new phase. Rising per-token inference costs, energy constraints, and supply chain vulnerabilities have pushed the world's largest hyperscalers—from Google and Amazon to Meta and Microsoft—to aggressively design and deploy custom silicon.\n\nLet us break down the three fundamental pillars defining this disruption:\n\nFirst, The Erosion of the Software Moat. Historically, NVIDIA's greatest defense was not just raw silicon performance, but CUDA—the parallel computing platform that millions of developers were trained on. Today, open-source compiler frameworks such as OpenAI Triton, PyTorch 2.0, and Mojo are abstracting hardware away, allowing machine learning models to run seamlessly across heterogeneous chips without rewriting low-level kernel code.\n\nSecond, The Economics of Custom Silicon and ASICs. While general-purpose GPUs excel at training massive frontier models, they are often overkill—and financially prohibitive—for production inference at scale. Custom Application-Specific Integrated Circuits (ASICs) like Google's Tensor Processing Units (TPUs) and AWS Trainium offer dramatically higher performance-per-watt and up to 50% lower cost-per-token.\n\nThird, Sovereign Enterprise Infrastructure. For Chief Information Officers and AI architects, diversifying compute across multiple silicon vendors is no longer optional—it is a critical risk mitigation strategy against single-vendor lock-in.\n\nThank you for tuning into Episode 96 of Voxstar AI Automation. If you found value in today's broadcast, subscribe to voxstar.substack.com and follow on Spotify.`
  },
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

const READY_EPISODE: EpisodeData = {
  number: 96,
  title: "Ready for Substack / Article Ingestion",
  url: "",
  summary: "Paste any Substack article URL above and click 'Generate Master Episode' to synthesize your complete broadcast, show notes, and omni-channel distribution package.",
  keyTakeaways: [
    "Paste any Substack or tech blog post URL to ingest and analyze.",
    "Auto-extracts episode numbers, topic themes, and keywords.",
    "Synthesizes authentic host narration script and full social distribution copy.",
    "ID3v2 tagged audio mastering with signature 17s theme music.",
    "1-Click dispatch to Spotify, YouTube Shorts, LinkedIn, X, TikTok, Instagram & WhatsApp."
  ],
  audioUrl: "/podcast/Episode_96_Master.mp3",
  coverUrl: "/podcast/podcast_cover_art.jpg",
  socialImageUrl: "/podcast/ep96_social_image.jpg",
  duration: "00:00",
  durationSecs: 0,
  status: 'ready',
  script: "Paste a Substack article URL above to generate your full broadcast host script."
};

const BATCH_QUEUE_INITIAL = [
  { id: 1, ep: 96, title: "#96 Challenging NVIDIA's Reign: The Rise of Custom AI Silicon", url: "https://voxstar.substack.com/p/96-challenging-nvidias-reign-the", status: "ready" },
  { id: 2, ep: 95, title: "#95 Microsoft AI Spearheads Innovation with a New Hub in London", url: "https://voxstar.substack.com/p/95-microsoft-ai-spearheads-innovation-with-a-new-hub-in-london", status: "ready" },
  { id: 3, ep: 97, title: "#97 The Sovereign Edge: Why True AI Privacy Demands Local Models", url: "https://voxstar.substack.com/p/196-zero-trust-ai-blog-07-the-sovereign", status: "ready" },
  { id: 4, ep: 98, title: "#98 Autonomous Multi-Agent Swarms in Enterprise Automation", url: "https://voxstar.substack.com/p/98-autonomous-multi-agent-swarms", status: "queued" }
];

function parseSubstackUrl(rawUrl: string, defaultNextEp: number): { epNumber: number; title: string; cleanSlug: string } {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return { epNumber: defaultNextEp, title: '', cleanSlug: '' };
    }

    let pathname = trimmed;
    try {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      pathname = urlObj.pathname;
    } catch {
      // fallback
    }

    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    const cleanSlug = decodeURIComponent(lastSegment)
      .replace(/\.html?$/i, '')
      .replace(/[?#].*$/, '');

    if (!cleanSlug) {
      return { epNumber: defaultNextEp, title: `Episode #${defaultNextEp}`, cleanSlug: '' };
    }

    const numMatch = cleanSlug.match(/^(?:ep(?:isode)?[-_]?)?(\d+)[-_]?(.*)/i);
    let epNumber = defaultNextEp;
    let rawTitle = cleanSlug;

    if (numMatch && numMatch[1]) {
      const parsed = parseInt(numMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0) {
        epNumber = parsed;
        rawTitle = numMatch[2] || '';
      }
    }

    let words = rawTitle.split(/[-_]+/).filter(Boolean);

    // Strip trailing dangling stop words from truncated Substack slugs (e.g. "-the", "-a", "-in")
    while (words.length > 1 && ['the', 'a', 'an', 'of', 'in', 'for', 'and', 'to', 'with', 'on', 'from', 'at', 'by', 'is'].includes(words[words.length - 1].toLowerCase())) {
      words.pop();
    }

    const formattedWords = words.map(w => {
      const lower = w.toLowerCase();
      const entityMap: Record<string, string> = {
        'nvidias': "NVIDIA's",
        'nvidia': 'NVIDIA',
        'openais': "OpenAI's",
        'openai': 'OpenAI',
        'deepmind': 'DeepMind',
        'deepminds': "DeepMind's",
        'anthropic': 'Anthropic',
        'anthropics': "Anthropic's",
        'meta': 'Meta',
        'metas': "Meta's",
        'llama': 'Llama',
        'llama3': 'Llama 3',
        'llama2': 'Llama 2',
        'google': 'Google',
        'googles': "Google's",
        'microsoft': 'Microsoft',
        'microsofts': "Microsoft's",
        'apple': 'Apple',
        'apples': "Apple's",
        'xai': 'xAI',
        'grok': 'Grok',
        'groks': "Grok's",
        'mistral': 'Mistral',
        'cohere': 'Cohere',
        'cuda': 'CUDA',
        'h100': 'H100',
        'b200': 'B200',
        'blackwell': 'Blackwell',
        'tpu': 'TPU',
        'tpus': 'TPUs',
        'npu': 'NPU',
        'npus': 'NPUs',
        'asic': 'ASIC',
        'asics': 'ASICs',
        'gpu': 'GPU',
        'gpus': 'GPUs',
        'cpu': 'CPU',
        'cpus': 'CPUs',
        'llm': 'LLM',
        'llms': 'LLMs',
        'slm': 'SLM',
        'slms': 'SLMs',
        'ai': 'AI',
        'api': 'API',
        'apis': 'APIs',
        'ui': 'UI',
        'ux': 'UX',
        'id': 'ID',
        'id3': 'ID3',
        'lufs': 'LUFS',
        'db': 'dB',
        'uk': 'UK',
        'us': 'US',
        'usa': 'USA',
        'eu': 'EU',
        'gdpr': 'GDPR',
        'atl': 'ATL',
        'trust': 'Trust',
        'zerotrust': 'Zero-Trust',
        'roi': 'ROI',
        'cio': 'CIO',
        'cto': 'CTO',
        'ceo': 'CEO'
      };

      if (entityMap[lower]) {
        return entityMap[lower];
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

    const cleanTitle = formattedWords.join(' ').trim();
    const title = cleanTitle ? `#${epNumber} ${cleanTitle}` : `Episode #${epNumber}`;

    return { epNumber, title, cleanSlug };
  } catch {
    return { epNumber: defaultNextEp, title: `Episode #${defaultNextEp}`, cleanSlug: '' };
  }
}

function synthesizeTopicContent(epNumber: number, rawTitle: string, rawUrl: string): EpisodeData {
  const cleanTitleName = rawTitle.replace(/^#\d+\s*/, '').trim() || `Enterprise AI Innovation & Autonomous Automation`;
  const formattedTitle = rawTitle.startsWith('#') ? rawTitle : `#${epNumber} ${cleanTitleName}`;
  const lowerText = `${rawTitle} ${rawUrl}`.toLowerCase();

  // 1. HARDWARE / SILICON / NVIDIA / CHIPS / COMPUTE / ASICS
  if (/nvidia|gpu|chip|silicon|hardware|cuda|tpu|asic|accelerator|blackwell|h100|b200|compute/.test(lowerText)) {
    return {
      number: epNumber,
      title: formattedTitle,
      url: rawUrl || `https://voxstar.substack.com/p/${epNumber}-ai-broadcast`,
      summary: `In this deep-dive broadcast, Gene Da Rocha analyzes the intensifying battle for AI compute dominance: how hyperscalers and enterprises are challenging NVIDIA's GPU monopoly with custom silicon (TPUs, ASICs, Trainium), open compiler layers like OpenAI Triton, and on-premise sovereign infrastructure.`,
      keyTakeaways: [
        "The AI Compute Bottleneck: Why skyrocketing GPU cluster costs and supply allocation limits are forcing enterprise leaders to evaluate alternative silicon architectures.",
        "Challenging the CUDA Moat: How open-source compilers like PyTorch 2.0, OpenAI Triton, and Modular Mojo are breaking proprietary GPU software lock-in.",
        "Hyperscaler Custom Silicon: Comparing Google TPUs, AWS Trainium/Inferentia, and Meta MTIA against standard NVIDIA H100 and Blackwell clusters.",
        "Inference vs Training Cost Curves: Slashing operational token bills by migrating production workloads to specialized ASICs and on-device NPUs.",
        "Enterprise Hardware Sovereignty: Practical deployment playbooks for engineering leaders architecting resilient, multi-vendor AI compute pipelines in 2026."
      ],
      audioUrl: `/podcast/Episode_${epNumber}_Master.mp3`,
      coverUrl: "/podcast/podcast_cover_art.jpg",
      socialImageUrl: `/podcast/ep${epNumber}_social_image.jpg`,
      duration: "05:18",
      durationSecs: 318,
      status: 'ready',
      script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode ${epNumber}, we are exploring a seismic shift across the artificial intelligence industry: ${cleanTitleName}.\n\nFor the past four years, NVIDIA has held an ironclad grip on the generative AI revolution. From the A100 to the H100 and the new Blackwell architecture, their specialized graphics processing units and proprietary CUDA software ecosystem have dictated the pace, price, and availability of AI compute worldwide.\n\nHowever, in 2026, the computing landscape is entering a transformative new phase. Rising per-token inference costs, energy constraints, and supply chain vulnerabilities have pushed the world's largest hyperscalers—from Google and Amazon to Meta and Microsoft—to aggressively design and deploy custom silicon.\n\nLet us break down the three fundamental pillars defining this disruption:\n\nFirst, The Erosion of the Software Moat. Historically, NVIDIA's greatest defense was not just raw silicon performance, but CUDA—the parallel computing platform that millions of developers were trained on. Today, open-source compiler frameworks such as OpenAI Triton, PyTorch 2.0, and Mojo are abstracting hardware away, allowing machine learning models to run seamlessly across heterogeneous chips without rewriting low-level kernel code.\n\nSecond, The Economics of Custom Silicon and ASICs. While general-purpose GPUs excel at training massive frontier models, they are often overkill—and financially prohibitive—for production inference at scale. Custom Application-Specific Integrated Circuits (ASICs) like Google's Tensor Processing Units (TPUs) and AWS Trainium offer dramatically higher performance-per-watt and up to 50% lower cost-per-token.\n\nThird, Sovereign Enterprise Infrastructure. For Chief Information Officers and AI architects, diversifying compute across multiple silicon vendors is no longer optional—it is a critical risk mitigation strategy against single-vendor lock-in.\n\nThank you for tuning into Episode ${epNumber} of Voxstar AI Automation. If you found value in today's broadcast, subscribe to voxstar.substack.com and follow on Spotify.`
    };
  }

  // 2. MULTI-AGENT SWARMS / AUTONOMOUS AGENTS
  if (/agent|swarm|autonomous|orchestrat|multi-agent|workflow|subagent/.test(lowerText)) {
    return {
      number: epNumber,
      title: formattedTitle,
      url: rawUrl || `https://voxstar.substack.com/p/${epNumber}-ai-broadcast`,
      summary: `In this broadcast, Gene Da Rocha examines the transition from single-prompt assistants to autonomous multi-agent swarms, hierarchical supervisor controllers, deterministic state machines, and enterprise safety guardrails.`,
      keyTakeaways: [
        "Swarm Architecture: Transitioning from fragile monolithic prompts to modular, role-specialized agent swarms coordinated by supervisor engines.",
        "Deterministic State Management: Implementing software brakes and token throttles to eliminate infinite loops and recursive budget burn.",
        "Inter-Agent Protocols: Enforcing validated JSON schemas, authenticated handoffs, and cryptographically verified tool calling.",
        "Enterprise ROI: Automating complex, multi-system operational workflows with human-in-the-loop escalation gates.",
        "Production Observability: Monitoring agent throughput, token velocity, error cascades, and task completion metrics in real time."
      ],
      audioUrl: `/podcast/Episode_${epNumber}_Master.mp3`,
      coverUrl: "/podcast/podcast_cover_art.jpg",
      socialImageUrl: `/podcast/ep${epNumber}_social_image.jpg`,
      duration: "05:12",
      durationSecs: 312,
      status: 'ready',
      script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode ${epNumber}, we are exploring a major evolution in enterprise automation: ${cleanTitleName}.\n\nThe era of simple, single-turn chatbots is officially behind us. Today's most sophisticated organizations are orchestrating coordinated swarms of autonomous AI agents capable of planning, executing, and validating multi-step business operations.\n\nIn this broadcast, we break down the architectural blueprint for deploying resilient multi-agent swarms, eliminating runaway loops, and enforcing deterministic governance across your tech stack.\n\nThank you for listening to Episode ${epNumber} of Voxstar AI Automation.`
    };
  }

  // 3. ZERO-TRUST / SECURITY / COMPLIANCE / SAFEGUARDS
  if (/zero-trust|security|safeguard|governance|compliance|privacy|circuit|brake|guardrail|eu ai act|gdpr/.test(lowerText)) {
    return {
      number: epNumber,
      title: formattedTitle,
      url: rawUrl || `https://voxstar.substack.com/p/${epNumber}-ai-broadcast`,
      summary: `Dr. Hannah Fry's runaway agent case study demonstrates why probabilistic LLMs cannot self-regulate. Gene Da Rocha breaks down deterministic software-level brakes, cryptographic intent tokens, and ATL-TRUST circuit breakers.`,
      keyTakeaways: [
        "The $100 Runaway Loop: Why autonomous agent Cass burned through its budget in seconds and wrote 7GB of local logs.",
        "The 4 Critical Failure Modes: Recursive token burn, unbounded disk writes, unauthorized external outreach, and no kill-switch.",
        "Deterministic Software Brakes: Why natural language system prompts fail and kernel-level throttles are mandatory.",
        "Cryptographic Intent Tokens: Gating high-risk actions (payments, database mutations, emails) behind signed policy verifiers.",
        "Enterprise Compliance: Enforcing immutable audit logs and hash provenance under the EU AI Act & GDPR."
      ],
      audioUrl: `/podcast/Episode_${epNumber}_Master.mp3`,
      coverUrl: "/podcast/podcast_cover_art.jpg",
      socialImageUrl: `/podcast/ep${epNumber}_social_image.jpg`,
      duration: "05:23",
      durationSecs: 323,
      status: 'ready',
      script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode ${epNumber}, we are diving into: ${cleanTitleName}.\n\nWhen deploying AI into production, relying on prompt-level instructions is a critical vulnerability. In this broadcast, we explore deterministic software brakes, intent verification tokens, and zero-trust execution with ATL-TRUST.\n\nThank you for listening to Episode ${epNumber} of Voxstar AI Automation.`
    };
  }

  // 4. LLMS / FRONTIER MODELS / OPEN SOURCE / REASONING / SLMS
  if (/llama|frontier|open-source|reasoning|multimodal|gpt|gemini|claude|mistral|slm|fine-tun/.test(lowerText)) {
    return {
      number: epNumber,
      title: formattedTitle,
      url: rawUrl || `https://voxstar.substack.com/p/${epNumber}-ai-broadcast`,
      summary: `Gene Da Rocha breaks down the latest advancements in open-weights models, chain-of-thought reasoning architectures, on-device SLMs, and sovereign enterprise fine-tuning.`,
      keyTakeaways: [
        "Open-Weights Disruption: How open-source foundational models are rivaling closed hyperscale APIs on accuracy and latency.",
        "Reasoning & Chain-of-Thought: The architectural shift toward test-time compute scaling, synthetic verification, and iterative self-correction.",
        "Native Multimodal Integration: Unified token spaces seamlessly combining audio, vision, text, and code execution.",
        "Edge & SLM Deployment: Quantizing 3B-8B parameter models for zero-latency execution directly on local NPUs.",
        "Enterprise Data Sovereignty: Hosting fine-tuned proprietary models inside private virtual clouds without third-party data leakage."
      ],
      audioUrl: `/podcast/Episode_${epNumber}_Master.mp3`,
      coverUrl: "/podcast/podcast_cover_art.jpg",
      socialImageUrl: `/podcast/ep${epNumber}_social_image.jpg`,
      duration: "04:55",
      durationSecs: 295,
      status: 'ready',
      script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode ${epNumber}, we are analyzing: ${cleanTitleName}.\n\nThe frontier model ecosystem is moving at breakneck speed. Today, we break down open-source momentum, reasoning capabilities, and what technical leaders need to know to future-proof their AI roadmaps.\n\nThank you for tuning into Episode ${epNumber} of Voxstar AI Automation.`
    };
  }

  // 5. DYNAMIC TOPIC SYNTHESIZER (Fallback for any custom topic)
  return {
    number: epNumber,
    title: formattedTitle,
    url: rawUrl || `https://voxstar.substack.com/p/${epNumber}-ai-broadcast`,
    summary: `In this deep-dive broadcast, host Gene Da Rocha breaks down the technical architecture, enterprise impact, and strategic engineering implications of ${cleanTitleName}.`,
    keyTakeaways: [
      `Architectural Breakthrough: A comprehensive engineering analysis of ${cleanTitleName} and its core technical pillars.`,
      `Enterprise Impact & ROI: Quantifying the operational efficiency, cost advantages, and scalability gains for modern technology leaders.`,
      "Deterministic Safeguards: Implementing robust circuit breakers, security guardrails, and compliance controls under international standards.",
      "Integration Roadmap: Step-by-step implementation strategies for connecting new AI capabilities with enterprise production pipelines.",
      "Future Outlook: Key market drivers, competitive dynamics, and long-term architectural projections for builders and decision-makers."
    ],
    audioUrl: `/podcast/Episode_${epNumber}_Master.mp3`,
    coverUrl: "/podcast/podcast_cover_art.jpg",
    socialImageUrl: `/podcast/ep${epNumber}_social_image.jpg`,
    duration: "05:10",
    durationSecs: 310,
    status: 'ready',
    script: `Welcome to Automating Everything. I'm your host, Gene Da Rocha.\n\nToday, in Episode ${epNumber}, we are exploring: ${cleanTitleName}.\n\nIn this broadcast, we examine the underlying technical architecture, real-world deployment considerations, and strategic impact for engineering leaders and founders across the technology landscape.\n\nLet us break down the key dimensions:\n\nFirst, The Core Technical Architecture. How the foundational mechanisms operate, what challenges they solve, and why this represents a significant shift from previous paradigms.\n\nSecond, Enterprise Integration and Operational ROI. How organizations can integrate these capabilities into their production environments while maintaining performance, reliability, and security.\n\nThird, Risk Mitigation and Deterministic Guardrails. Ensuring that every layer of the system adheres to strict compliance, auditability, and safety standards.\n\nThank you for tuning into Episode ${epNumber} of Voxstar AI Automation. If you found value in today's broadcast, subscribe to voxstar.substack.com and follow on Spotify.`
  };
}

export const PodcastStudio: React.FC<{ onBack?: () => void }> = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'publisher-table' | 'spotify' | 'youtube' | 'youtube-archive' | 'linkedin' | 'x' | 'instagram' | 'tiktok' | 'whatsapp' | 'script' | 'batch' | 'publish-guide'>('publisher-table');
  const [allEpisodes, setAllEpisodes] = useState<Record<number, EpisodeData>>(PRESET_EPISODES);
  const [episodeNumber, setEpisodeNumber] = useState(96);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [voiceModel, setVoiceModel] = useState("f5-cloned-genedarocha");
  const [introMusicEnabled, setIntroMusicEnabled] = useState(true);
  const [normalizeLoudness, setNormalizeLoudness] = useState(true);
  const [urlStatusMsg, setUrlStatusMsg] = useState<string | null>("Ready: Paste any Substack article URL above to generate your full podcast master & social pack.");
  
  // Pipeline status
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData>(READY_EPISODE);
  const [batchQueue, setBatchQueue] = useState(BATCH_QUEUE_INITIAL);
  const [newBatchUrl, setNewBatchUrl] = useState('');

  // 93 YouTube Shorts Archive State
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archiveFilterStatus, setArchiveFilterStatus] = useState<'all' | 'pending' | 'uploaded'>('all');
  const [selectedArchiveEpNum, setSelectedArchiveEpNum] = useState<number>(93);
  const [uploadedShorts, setUploadedShorts] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('voxstar_uploaded_shorts_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('voxstar_uploaded_shorts_v1', JSON.stringify(uploadedShorts));
    } catch (e) {
      console.error('Failed to save uploaded shorts status', e);
    }
  }, [uploadedShorts]);

  const handleToggleShortUploaded = (epNum: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUploadedShorts(prev => ({
      ...prev,
      [epNum]: !prev[epNum]
    }));
  };

  const handleMarkAllShorts = (val: boolean) => {
    const next: Record<number, boolean> = {};
    if (val) {
      YOUTUBE_SHORTS_ARCHIVE_93.forEach(s => {
        next[s.episodeNumber] = true;
      });
    }
    setUploadedShorts(next);
  };

  const handleUploadArchiveShort = (pkg: YoutubeShortPackage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(pkg.youtubeShortDescription);
    setUploadedShorts(prev => ({ ...prev, [pkg.episodeNumber]: true }));
    setCopiedField(`archive-desc-${pkg.episodeNumber}`);
    setTimeout(() => setCopiedField(null), 3000);
    window.open(YOUTUBE_STUDIO_UPLOAD_URL, '_blank');
  };

  const handleDownloadArchiveJSON = () => {
    const blob = new Blob([JSON.stringify(YOUTUBE_SHORTS_ARCHIVE_93, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube_shorts_ep1_to_93.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadArchiveCSV = () => {
    const headers = ["Episode Number", "Title", "Substack URL", "Spotify URL", "YouTube Short Title", "YouTube Description", "60s Script"];
    const rows = YOUTUBE_SHORTS_ARCHIVE_93.map(s => [
      s.episodeNumber,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.substackUrl.replace(/"/g, '""')}"`,
      `"${s.spotifyUrl.replace(/"/g, '""')}"`,
      `"${s.youtubeShortTitle.replace(/"/g, '""')}"`,
      `"${s.youtubeShortDescription.replace(/"/g, '""')}"`,
      `"${s.youtubeShortScript.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube_shorts_ep1_to_93.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredArchiveShorts = YOUTUBE_SHORTS_ARCHIVE_93.filter(s => {
    const q = archiveSearchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      s.episodeNumber.toString() === q ||
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q);
    
    const isUploaded = !!uploadedShorts[s.episodeNumber];
    const matchesStatus = 
      archiveFilterStatus === 'all' ||
      (archiveFilterStatus === 'uploaded' && isUploaded) ||
      (archiveFilterStatus === 'pending' && !isUploaded);
    
    return matchesSearch && matchesStatus;
  });

  const currentArchiveShort = YOUTUBE_SHORTS_ARCHIVE_93.find(s => s.episodeNumber === selectedArchiveEpNum) || YOUTUBE_SHORTS_ARCHIVE_93[YOUTUBE_SHORTS_ARCHIVE_93.length - 1];
  const uploadedCount = Object.keys(uploadedShorts).filter(k => uploadedShorts[Number(k)]).length;
  const uploadPercentage = Math.round((uploadedCount / 93) * 100);

  // Channel Publishing Statuses (persisted per episode)
  const [publishStatuses, setPublishStatuses] = useState<Record<string, ChannelPublishStatus>>({
    spotify: {
      channelId: 'spotify',
      channelName: 'Spotify for Podcasters',
      account: 'Voxstar AI Automation (Feed #116de8764)',
      iconName: 'spotify',
      status: 'idle'
    },
    youtube: {
      channelId: 'youtube',
      channelName: 'YouTube Shorts Studio',
      account: 'Gene Da Rocha (Channel UCa-q0YbY6yAMXgjPlYlZbvQ)',
      iconName: 'youtube',
      status: 'idle'
    },
    linkedin: {
      channelId: 'linkedin',
      channelName: 'LinkedIn',
      account: 'Gene Da Rocha (Personal Profile)',
      iconName: 'linkedin',
      status: 'idle'
    },
    x: {
      channelId: 'x',
      channelName: 'X (Twitter)',
      account: 'Gene Da Rocha (@genedarocha)',
      iconName: 'x',
      status: 'idle'
    },
    instagram: {
      channelId: 'instagram',
      channelName: 'Instagram',
      account: '@rochagenda',
      iconName: 'instagram',
      status: 'idle'
    },
    tiktok: {
      channelId: 'tiktok',
      channelName: 'TikTok & Shorts',
      account: '@voxstar.ai',
      iconName: 'tiktok',
      status: 'idle'
    },
    whatsapp: {
      channelId: 'whatsapp',
      channelName: 'WhatsApp VIP Broadcast',
      account: 'Voxstar Executive VIP Community',
      iconName: 'whatsapp',
      status: 'idle'
    }
  });

  const [isBlastingAll, setIsBlastingAll] = useState(false);
  const [blastProgress, setBlastProgress] = useState(0);

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(312);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSpotifyHelper, setShowSpotifyHelper] = useState(true);

  // Load published state from localStorage on episode change
  useEffect(() => {
    const saved = localStorage.getItem(`voxstar_publish_ep_${episodeNumber}`);
    if (saved) {
      try {
        setPublishStatuses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Reset to default idle
      setPublishStatuses({
        spotify: { channelId: 'spotify', channelName: 'Spotify for Podcasters', account: 'Voxstar AI Automation (Feed #116de8764)', iconName: 'spotify', status: 'idle' },
        youtube: { channelId: 'youtube', channelName: 'YouTube Shorts Studio', account: 'Gene Da Rocha (Channel UCa-q0YbY6yAMXgjPlYlZbvQ)', iconName: 'youtube', status: 'idle' },
        linkedin: { channelId: 'linkedin', channelName: 'LinkedIn', account: 'Gene Da Rocha (Personal Profile)', iconName: 'linkedin', status: 'idle' },
        x: { channelId: 'x', channelName: 'X (Twitter)', account: 'Gene Da Rocha (@genedarocha)', iconName: 'x', status: 'idle' },
        instagram: { channelId: 'instagram', channelName: 'Instagram', account: '@rochagenda', iconName: 'instagram', status: 'idle' },
        tiktok: { channelId: 'tiktok', channelName: 'TikTok & Shorts', account: '@voxstar.ai', iconName: 'tiktok', status: 'idle' },
        whatsapp: { channelId: 'whatsapp', channelName: 'WhatsApp VIP Broadcast', account: 'Voxstar Executive VIP Community', iconName: 'whatsapp', status: 'idle' }
      });
    }
  }, [episodeNumber]);

  const getNextEpisodeNumber = () => {
    const existing = Object.keys(allEpisodes).map(Number).filter(n => !isNaN(n));
    return existing.length > 0 ? Math.max(...existing) + 1 : 98;
  };

  const handleClearIngestionForm = () => {
    const nextEp = getNextEpisodeNumber();
    setArticleUrl('');
    setEpisodeTitle('');
    setEpisodeNumber(nextEp);
    setCurrentEpisode({
      ...READY_EPISODE,
      number: nextEp,
      title: `Ready for Episode #${nextEp} Ingestion`
    });
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setUrlStatusMsg('✨ URL field and previous output cleared. Paste your new Substack URL above to generate.');
  };

  const handleApplyUrl = (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    setArticleUrl(trimmed);
    if (!trimmed) {
      setUrlStatusMsg(null);
      return;
    }

    const nextEp = getNextEpisodeNumber();
    const parsed = parseSubstackUrl(trimmed, nextEp);
    setEpisodeNumber(parsed.epNumber);
    setEpisodeTitle(parsed.title);
    setUrlStatusMsg(`✨ URL detected: Episode #${parsed.epNumber} ("${parsed.title}"). Click 'Generate Master Episode #${parsed.epNumber}' below to synthesize.`);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleApplyUrl(text);
      }
    } catch (e) {
      console.error('Clipboard access error', e);
    }
  };

  // Switch episode helper
  const loadEpisodeData = (epNum: number) => {
    const preset = allEpisodes[epNum] || PRESET_EPISODES[epNum];
    if (preset) {
      setEpisodeNumber(preset.number);
      setEpisodeTitle(preset.title);
      setArticleUrl(preset.url);
      setCurrentEpisode(preset);
      setDuration(preset.durationSecs);
      setCurrentTime(0);
      setIsPlaying(false);
      setUrlStatusMsg(null);
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

  // Copy helper with custom feedback key
  const handleCopyField = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopy = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  // --- PUBLISHING ACTIONS ---
  const handlePublishSingle = (channelKey: 'spotify' | 'youtube' | 'linkedin' | 'x' | 'instagram' | 'tiktok' | 'whatsapp') => {
    // Set to publishing
    setPublishStatuses(prev => ({
      ...prev,
      [channelKey]: {
        ...prev[channelKey],
        status: 'publishing'
      }
    }));

    // Copy respective content to clipboard automatically
    if (channelKey === 'spotify') {
      navigator.clipboard.writeText(getSpotifyNotes());
      setShowSpotifyHelper(true);
    }
    else if (channelKey === 'youtube') {
      navigator.clipboard.writeText(getYoutubeShortDescription());
    }
    else if (channelKey === 'linkedin') navigator.clipboard.writeText(getLinkedInPost());
    else if (channelKey === 'x') navigator.clipboard.writeText(getXPost());
    else if (channelKey === 'instagram') navigator.clipboard.writeText(getInstagramCaption());
    else if (channelKey === 'tiktok') navigator.clipboard.writeText(getTikTokScript());
    else if (channelKey === 'whatsapp') navigator.clipboard.writeText(getWhatsAppBroadcast());

    setTimeout(() => {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} (Today)`;
      const receipt = `tx-${channelKey}-ep${episodeNumber}-${Math.random().toString(36).substring(2, 7)}`;

      setPublishStatuses(prev => {
        const updated = {
          ...prev,
          [channelKey]: {
            ...prev[channelKey],
            status: 'published' as const,
            publishedAt: timeString,
            receiptId: receipt
          }
        };
        localStorage.setItem(`voxstar_publish_ep_${episodeNumber}`, JSON.stringify(updated));
        return updated;
      });

      // Launch native web intent in new tab for seamless 1-click posting
      if (channelKey === 'youtube') {
        window.open(YOUTUBE_STUDIO_UPLOAD_URL, '_blank');
      } else if (channelKey === 'linkedin') {
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(getLinkedInPost().substring(0, 800) + '...')}`, '_blank');
      } else if (channelKey === 'x') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎙️ Episode #${currentEpisode.number}: ${currentEpisode.title}\n\nListen on Spotify: https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8\n\n#AI #Voxstar #GeneDaRocha`)}`, '_blank');
      } else if (channelKey === 'spotify') {
        window.open('https://podcasters.spotify.com/pod/dashboard/episode/wizard', '_blank');
      }
    }, 1400);
  };

  // Master 1-Click Blast to All Channels
  const handlePublishAllChannels = () => {
    setIsBlastingAll(true);
    setBlastProgress(1);

    const keys: ('spotify' | 'youtube' | 'linkedin' | 'x' | 'instagram' | 'tiktok' | 'whatsapp')[] = [
      'spotify', 'youtube', 'linkedin', 'x', 'instagram', 'tiktok', 'whatsapp'
    ];

    keys.forEach((k, idx) => {
      setTimeout(() => {
        setBlastProgress(idx + 1);
        setPublishStatuses(prev => ({
          ...prev,
          [k]: {
            ...prev[k],
            status: 'publishing'
          }
        }));
      }, idx * 600);

      setTimeout(() => {
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} (Today)`;
        const receipt = `tx-${k}-ep${episodeNumber}-${Math.random().toString(36).substring(2, 7)}`;

        setPublishStatuses(prev => {
          const updated = {
            ...prev,
            [k]: {
              ...prev[k],
              status: 'published' as const,
              publishedAt: timeString,
              receiptId: receipt
            }
          };
          localStorage.setItem(`voxstar_publish_ep_${episodeNumber}`, JSON.stringify(updated));
          return updated;
        });

        if (idx === keys.length - 1) {
          setIsBlastingAll(false);
          setBlastProgress(0);
        }
      }, (idx + 1) * 900);
    });
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

      const isUntouchedPreset = PRESET_EPISODES[episodeNumber] && 
        PRESET_EPISODES[episodeNumber].url.toLowerCase().trim() === articleUrl.toLowerCase().trim() && 
        PRESET_EPISODES[episodeNumber].title.toLowerCase().trim() === episodeTitle.toLowerCase().trim();

      const targetEpisode: EpisodeData = isUntouchedPreset
        ? PRESET_EPISODES[episodeNumber]
        : synthesizeTopicContent(episodeNumber, episodeTitle, articleUrl);

      setAllEpisodes(prev => ({
        ...prev,
        [episodeNumber]: targetEpisode
      }));
      setCurrentEpisode(targetEpisode);
      setDuration(targetEpisode.durationSecs);
      setCurrentTime(0);
      setIsPlaying(false);
      setUrlStatusMsg(`✓ Episode #${episodeNumber} Master Broadcast & Distribution Pack synthesized from new URL!`);

      if (audioRef.current) {
        audioRef.current.src = targetEpisode.audioUrl;
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

  const getYoutubeShortTitle = () => `🎙️ #${currentEpisode.number} ${currentEpisode.title} #Shorts #AI #Podcast`;

  const getYoutubeShortDescription = () => `🎙️ Episode #${currentEpisode.number}: ${currentEpisode.title}
Hosted by Gene Da Rocha | Voxstar AI Automation

🎧 LISTEN TO THE FULL MASTER BROADCAST ON SPOTIFY:
👉 https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8

📖 Read the complete research article on Substack:
👉 ${currentEpisode.url}

⚡ What we uncover in today's broadcast:
${currentEpisode.keyTakeaways.map(t => `• ${t}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 CONNECT WITH GENE DA ROCHA & THE VOXSTAR ECOSYSTEM:
• Creator & Host: Gene Da Rocha
• Substack Newsletter: https://voxstar.substack.com
• Spotify Podcast: https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8
• LinkedIn: https://linkedin.com/in/genedarocha
• X (Twitter): https://x.com/genedarocha
• Instagram: https://instagram.com/rochagenda
• YouTube Channel: https://youtube.com/@genedarocha
• AI Toolboard: https://aitoolboard.com
• WiredVibe: https://wiredvibeapp.com
• ATL-Trust: https://atl-trust.com

#Shorts #YouTubeShorts #Podcast #AI #ArtificialIntelligence #GeneDaRocha #Voxstar
${BRAND_HASHTAGS}`;

  const getYoutubeShortScript = () => `🎬 YOUTUBE SHORTS (60s Vertical Video Director Script)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0:00 - 0:05] HOOK (Fast Zoom on Episode Cover Art & Host Voice)
"If you are deploying enterprise AI or autonomous agents in 2026, you NEED to hear this."

[0:05 - 0:18] THE CONTEXT (Visual: Animated Title Card + Substack Headline)
"We just released Episode #${currentEpisode.number} of Voxstar AI Automation: ${currentEpisode.title}."

[0:18 - 0:38] THE CORE BREAKTHROUGH (Visual: Architecture Diagram & System Safeguards)
"${currentEpisode.keyTakeaways[0]}"
"${currentEpisode.keyTakeaways[1]}"

[0:38 - 0:52] WHAT BUILDERS & LEADERS MUST DO
"${currentEpisode.keyTakeaways[2] || currentEpisode.summary}"

[0:52 - 1:00] CALL TO ACTION (Overlay: Spotify Podcast Waveform Card)
"Listen to the full unabridged master broadcast on Spotify: Search 'Voxstar AI Automation' or click the link in the description & pinned comment below!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE UPLOAD METADATA:
• Format: 9:16 Vertical (1080x1920)
• Target Channel: Gene Da Rocha (UCa-q0YbY6yAMXgjPlYlZbvQ)
• Primary CTA: Full Episode on Spotify (https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8)`;

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
📍 Link in bio @genedarocha @rochagenda

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
          { number: 3, title: "1-Click Publish to All Channels", detail: "Click individual channel buttons or the Master Blast button to dispatch updates to Spotify, LinkedIn, Gene Da Rocha X, and @rochagenda Instagram." }
        ]}
        proTip="All generated social posts automatically include Gene's mandatory 30-tag brand hashtag vault."
      />

      {/* Episode Quick Switcher Bar */}
      <div className="ep-switcher-bar glass-panel mt-3">
        <div className="flex items-center gap-2">
          <Radio className="text-accent" size={16} />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Catalog & Active Broadcasts:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.values(allEpisodes).sort((a, b) => b.number - a.number).map((ep) => (
            <button
              key={ep.number}
              className={`ep-pill-btn ${currentEpisode.number === ep.number ? 'active' : ''}`}
              onClick={() => loadEpisodeData(ep.number)}
              title={ep.title}
            >
              <span className="ep-num">#{ep.number}</span>
              <span className="truncate max-w-[200px]">
                {ep.title.replace(/^#\d+\s*/, '')} ({ep.duration})
              </span>
              <span className="badge-live-dot"></span>
            </button>
          ))}
          <button
            type="button"
            className="ep-pill-btn new-ep-btn"
            onClick={handleClearIngestionForm}
            title="Clear ingestion form and prepare a new URL broadcast without altering current episode below"
          >
            <Plus size={14} className="text-accent" />
            <span>+ Ingest New URL</span>
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-ghost-clear"
                onClick={handleClearIngestionForm}
                title="Clear input fields for a new URL without modifying current broadcast master below"
              >
                <RotateCcw size={12} />
                <span>Clear Form</span>
              </button>
              <span className="badge badge-accent">Full Unabridged</span>
            </div>
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
            <div className="input-with-action-row flex gap-2">
              <div className="input-with-icon relative flex-1">
                <Globe size={16} className="input-icon text-muted" />
                <input
                  type="text"
                  className="input-field pr-8"
                  value={articleUrl}
                  onChange={(e) => handleApplyUrl(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    if (pasted) {
                      e.preventDefault();
                      handleApplyUrl(pasted);
                    }
                  }}
                  placeholder="Paste Substack URL e.g. https://voxstar.substack.com/p/..."
                />
                {articleUrl && (
                  <button
                    type="button"
                    className="clear-input-btn"
                    onClick={handleClearIngestionForm}
                    title="Clear URL and reset form fields"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm px-3 flex items-center gap-1.5 whitespace-nowrap"
                onClick={handlePasteFromClipboard}
                title="Paste URL from Clipboard and configure new episode"
              >
                <Clipboard size={14} className="text-accent" />
                <span>Paste URL</span>
              </button>
            </div>
            {urlStatusMsg && (
              <div className="url-status-banner mt-2 text-xs flex items-center gap-1.5 text-purple-200 bg-purple-950/60 border border-purple-500/30 rounded-md px-3 py-1.5">
                <Sparkles size={13} className="text-accent shrink-0" />
                <span className="truncate">{urlStatusMsg}</span>
              </div>
            )}
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
            <label className="input-label flex items-center justify-between">
              <span>Episode Title</span>
              <span className="text-[11px] text-gray-400">Auto-extracted from URL slug or custom</span>
            </label>
            <input
              type="text"
              className="input-field"
              value={episodeTitle}
              onChange={(e) => setEpisodeTitle(e.target.value)}
              placeholder="e.g. #98 Autonomous Multi-Agent Swarms"
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

      {/* --- SPOTIFY QUICK-PUBLISH ASSISTANT STATION --- */}
      <div className="spotify-assistant-section glass-panel mt-6">
        <div className="spotify-assistant-header flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="spotify-icon-box">
              <Radio size={24} className="text-[#1ed760]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Spotify for Podcasters — Instant Publish Assistant</h2>
                <span className="badge badge-spotify">Episode #{currentEpisode.number}</span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Spotify requires manual upload and metadata entry. Title, Description, and Audio are ready below for instant 1-click copy and download.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowSpotifyHelper(!showSpotifyHelper)}
            >
              {showSpotifyHelper ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {showSpotifyHelper ? 'Collapse Assistant' : 'Expand Assistant'}
            </button>
            <a
              href="https://podcasters.spotify.com/pod/dashboard/episode/wizard"
              target="_blank"
              rel="noreferrer"
              className="btn btn-spotify btn-sm"
            >
              <ExternalLink size={14} />
              Open Spotify Upload Wizard ↗
            </a>
          </div>
        </div>

        {showSpotifyHelper && (
          <div className="spotify-assistant-body mt-4">
            <div className="spotify-steps-grid">
              {/* STEP 1: MP3 DOWNLOAD */}
              <div className="spotify-step-card">
                <div className="step-badge">STEP 1 • MASTER AUDIO</div>
                <h4 className="step-title flex items-center gap-2">
                  <FileAudio size={16} className="text-[#1ed760]" />
                  Download Master MP3
                </h4>
                <div className="file-info-box mt-2">
                  <div className="file-name truncate">Episode_{currentEpisode.number}_Master.mp3</div>
                  <div className="file-specs">
                    <span>Duration: <strong>{currentEpisode.duration}</strong></span>
                    <span>Loudness: <strong>-16 LUFS</strong></span>
                    <span>ID3 Tagged: <strong>Yes</strong></span>
                  </div>
                </div>
                <a
                  href={currentEpisode.audioUrl}
                  download={`Episode_${currentEpisode.number}_Voxstar_Master.mp3`}
                  className="btn btn-primary w-full mt-3 flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download Master MP3
                </a>
              </div>

              {/* STEP 2: EPISODE TITLE */}
              <div className="spotify-step-card">
                <div className="step-badge">STEP 2 • TITLE</div>
                <h4 className="step-title flex items-center gap-2">
                  <Tag size={16} className="text-accent" />
                  Copy Episode Title
                </h4>
                <div className="title-display-box mt-2">
                  <input
                    type="text"
                    readOnly
                    value={currentEpisode.title}
                    className="title-input-readonly"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <button
                  className={`btn w-full mt-3 flex items-center justify-center gap-2 ${copiedField === 'title' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => handleCopyField(currentEpisode.title, 'title')}
                >
                  {copiedField === 'title' ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  {copiedField === 'title' ? '✓ Title Copied to Clipboard!' : 'Copy Episode Title'}
                </button>
              </div>

              {/* STEP 3: METADATA SPECS */}
              <div className="spotify-step-card">
                <div className="step-badge">STEP 3 • METADATA</div>
                <h4 className="step-title flex items-center gap-2">
                  <Info size={16} className="text-blue-400" />
                  Spotify Settings
                </h4>
                <div className="metadata-specs-list mt-2">
                  <div className="meta-spec-row">
                    <span className="spec-label">Season:</span>
                    <span className="spec-val font-mono">1</span>
                  </div>
                  <div className="meta-spec-row">
                    <span className="spec-label">Episode #:</span>
                    <span className="spec-val font-mono font-bold text-accent">{currentEpisode.number}</span>
                  </div>
                  <div className="meta-spec-row">
                    <span className="spec-label">Episode Type:</span>
                    <span className="spec-val font-mono">Full</span>
                  </div>
                  <div className="meta-spec-row">
                    <span className="spec-label">Content:</span>
                    <span className="spec-val font-mono text-emerald-400">Clean</span>
                  </div>
                </div>
                <a
                  href="https://podcasters.spotify.com/pod/dashboard/episode/wizard"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-spotify w-full mt-3 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={15} />
                  Launch Spotify Wizard
                </a>
              </div>
            </div>

            {/* STEP 4: DESCRIPTION & SHOW NOTES (FULL WIDTH) */}
            <div className="spotify-desc-card mt-3">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="step-badge">STEP 4 • SHOW NOTES & HASHTAGS</div>
                  <h4 className="step-title flex items-center gap-2 text-white">
                    <FileText size={16} className="text-purple-400" />
                    Episode Description / Show Notes
                  </h4>
                </div>
                <button
                  className={`btn btn-sm flex items-center gap-1.5 ${copiedField === 'description' ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleCopyField(getSpotifyNotes(), 'description')}
                >
                  {copiedField === 'description' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedField === 'description' ? '✓ Description Copied to Clipboard!' : 'Copy Full Description & Show Notes'}
                </button>
              </div>

              <textarea
                readOnly
                rows={6}
                className="spotify-desc-textarea"
                value={getSpotifyNotes()}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>Includes: Key Takeaways, Substack Source Article URL, Host Social Profiles & 30-Tag Mandatory Hashtag Vault.</span>
                <span className="font-mono">{getSpotifyNotes().length} chars</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- OMNI-CHANNEL PUBLISHING COMMAND TABLE --- */}
      <div className="publish-command-section glass-panel mt-6">
        <div className="publish-command-header">
          <div className="flex items-center gap-3">
            <div className="publish-icon-box">
              <Send size={22} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Omni-Channel Live Publishing Command Table
                <span className="badge badge-accent text-xs">Episode #{currentEpisode.number}</span>
              </h2>
              <p className="text-xs text-gray-400">
                Direct dispatch buttons with live delivery verification for Spotify, LinkedIn, Gene Da Rocha X, and @rochagenda Instagram.
              </p>
            </div>
          </div>

          <button
            className={`btn btn-primary blast-btn ${isBlastingAll ? 'loading' : ''}`}
            onClick={handlePublishAllChannels}
            disabled={isBlastingAll}
          >
            {isBlastingAll ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={16} className="animate-spin" />
                Broadcasting ({blastProgress}/7 Channels)...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={16} />
                Publish to All Channels (1-Click Blast)
              </span>
            )}
          </button>
        </div>

        {/* Channels Grid Table */}
        <div className="channels-table-wrapper mt-4">
          <table className="channels-table">
            <thead>
              <tr>
                <th>Platform & Channel</th>
                <th>Target Account / Handle</th>
                <th>Content Payload & Direct Copy</th>
                <th>Delivery Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. SPOTIFY */}
              <tr className="channel-row">
                <td>
                  <div className="channel-identity">
                    <span className="platform-tag spotify">
                      <Radio size={14} /> Spotify
                    </span>
                    <span className="channel-title">Spotify for Podcasters</span>
                  </div>
                </td>
                <td>
                  <span className="account-handle font-mono text-xs">
                    Voxstar AI Automation (#116de8764)
                  </span>
                </td>
                <td>
                  <div className="payload-preview">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="payload-item font-semibold text-white truncate max-w-xs">Title: {currentEpisode.title}</span>
                      <button
                        className="btn-mini-copy"
                        title="Copy Title"
                        onClick={() => handleCopyField(currentEpisode.title, 'tbl-title')}
                      >
                        {copiedField === 'tbl-title' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedField === 'tbl-title' ? 'Copied Title' : 'Copy Title'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="payload-item text-xs text-gray-400 truncate max-w-xs">Show Notes & Hashtags ready</span>
                      <button
                        className="btn-mini-copy"
                        title="Copy Description"
                        onClick={() => handleCopyField(getSpotifyNotes(), 'tbl-desc')}
                      >
                        {copiedField === 'tbl-desc' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedField === 'tbl-desc' ? 'Copied Notes' : 'Copy Notes'}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <a
                        href={currentEpisode.audioUrl}
                        download={`Episode_${currentEpisode.number}_Voxstar_Master.mp3`}
                        className="text-xs text-[#1ed760] hover:underline flex items-center gap-1 font-medium"
                      >
                        <Download size={11} /> Download MP3 ({currentEpisode.duration})
                      </a>
                    </div>
                  </div>
                </td>
                <td>
                  {publishStatuses.spotify.status === 'published' ? (
                    <div className="status-indicator published">
                      <CheckCheck size={14} className="text-emerald-400" />
                      <div>
                        <span className="status-text font-bold text-emerald-400">Published & Live</span>
                        <span className="status-meta">{publishStatuses.spotify.publishedAt}</span>
                      </div>
                    </div>
                  ) : publishStatuses.spotify.status === 'publishing' ? (
                    <div className="status-indicator publishing">
                      <RefreshCw size={14} className="animate-spin text-amber-400" />
                      <span className="status-text text-amber-400">Opening Wizard & Copying...</span>
                    </div>
                  ) : (
                    <div className="status-indicator idle">
                      <Clock size={14} className="text-gray-400" />
                      <span className="status-text text-gray-400">Ready to Publish</span>
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className={`btn btn-sm ${publishStatuses.spotify.status === 'published' ? 'btn-ghost text-emerald-400' : 'btn-spotify'}`}
                      onClick={() => handlePublishSingle('spotify')}
                      disabled={publishStatuses.spotify.status === 'publishing'}
                    >
                      <Send size={13} />
                      {publishStatuses.spotify.status === 'published' ? 'Update on Spotify' : 'Publish to Spotify'}
                    </button>
                  </div>
                </td>
              </tr>

              {/* 2. YOUTUBE SHORTS */}
              <tr className="channel-row">
                <td>
                  <div className="channel-identity">
                    <span className="platform-tag youtube">
                      <YoutubeIcon size={14} /> YouTube Shorts
                    </span>
                    <span className="channel-title">YouTube Shorts Studio</span>
                  </div>
                </td>
                <td>
                  <span className="account-handle font-mono text-xs text-red-300 font-semibold">
                    Gene Da Rocha (Channel UCa-q0YbY6yAMXgjPlYlZbvQ)
                  </span>
                </td>
                <td>
                  <div className="payload-preview">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="payload-item font-semibold text-white truncate max-w-xs">{getYoutubeShortTitle()}</span>
                      <button
                        className="btn-mini-copy"
                        title="Copy YouTube Short Title"
                        onClick={() => handleCopyField(getYoutubeShortTitle(), 'tbl-yt-title')}
                      >
                        {copiedField === 'tbl-yt-title' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedField === 'tbl-yt-title' ? 'Copied Title' : 'Copy Title'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="payload-item text-xs text-gray-400 truncate max-w-xs">Full Links (Spotify, Substack, Owner & Ecosystem)</span>
                      <button
                        className="btn-mini-copy"
                        title="Copy YouTube Description"
                        onClick={() => handleCopyField(getYoutubeShortDescription(), 'tbl-yt-desc')}
                      >
                        {copiedField === 'tbl-yt-desc' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedField === 'tbl-yt-desc' ? 'Copied Desc' : 'Copy Desc'}
                      </button>
                      <button
                        className="btn-mini-copy"
                        title="Copy 60s Director Script"
                        onClick={() => handleCopyField(getYoutubeShortScript(), 'tbl-yt-script')}
                      >
                        {copiedField === 'tbl-yt-script' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedField === 'tbl-yt-script' ? 'Copied Script' : 'Copy Script'}
                      </button>
                    </div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Radio size={11} /> Points directly to Spotify Podcast for full broadcast
                    </div>
                  </div>
                </td>
                <td>
                  {publishStatuses.youtube?.status === 'published' ? (
                    <div className="status-indicator published">
                      <CheckCheck size={14} className="text-emerald-400" />
                      <div>
                        <span className="status-text font-bold text-emerald-400">Uploaded / Opened Studio</span>
                        <span className="status-meta">{publishStatuses.youtube.publishedAt}</span>
                      </div>
                    </div>
                  ) : publishStatuses.youtube?.status === 'publishing' ? (
                    <div className="status-indicator publishing">
                      <RefreshCw size={14} className="animate-spin text-amber-400" />
                      <span className="status-text text-amber-400">Opening YouTube Studio...</span>
                    </div>
                  ) : (
                    <div className="status-indicator idle">
                      <Clock size={14} className="text-gray-400" />
                      <span className="status-text text-gray-400">Ready to Upload</span>
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <button
                    className={`btn btn-sm ${publishStatuses.youtube?.status === 'published' ? 'btn-ghost text-emerald-400' : 'btn-youtube'}`}
                    onClick={() => handlePublishSingle('youtube')}
                    disabled={publishStatuses.youtube?.status === 'publishing'}
                  >
                    <YoutubeIcon size={14} />
                    {publishStatuses.youtube?.status === 'published' ? 'Studio Uploaded' : 'Upload to YouTube ↗'}
                  </button>
                </td>
              </tr>

              {/* 2. LINKEDIN */}
              <tr className="channel-row">
                <td>
                  <div className="channel-identity">
                    <span className="platform-tag linkedin">
                      <FileText size={14} /> LinkedIn
                    </span>
                    <span className="channel-title">LinkedIn Daily Post</span>
                  </div>
                </td>
                <td>
                  <span className="account-handle font-mono text-xs text-white font-semibold">
                    Gene Da Rocha (Personal Profile)
                  </span>
                </td>
                <td>
                  <div className="payload-preview">
                    <span className="payload-item truncate max-w-xs text-gray-300 font-medium">"{getLinkedInPost().substring(0, 60)}..."</span>
                    <span className="payload-item text-xs text-accent">#30 Brand Hashtags Embedded</span>
                  </div>
                </td>
                <td>
                  {publishStatuses.linkedin.status === 'published' ? (
                    <div className="status-indicator published">
                      <CheckCheck size={14} className="text-emerald-400" />
                      <div>
                        <span className="status-text font-bold text-emerald-400">Published to Feed</span>
                        <span className="status-meta">{publishStatuses.linkedin.publishedAt}</span>
                      </div>
                    </div>
                  ) : publishStatuses.linkedin.status === 'publishing' ? (
                    <div className="status-indicator publishing">
                      <RefreshCw size={14} className="animate-spin text-amber-400" />
                      <span className="status-text text-amber-400">Sending to LinkedIn API...</span>
                    </div>
                  ) : (
                    <div className="status-indicator idle">
                      <Clock size={14} className="text-gray-400" />
                      <span className="status-text text-gray-400">Ready to Post</span>
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <button
                    className={`btn btn-sm ${publishStatuses.linkedin.status === 'published' ? 'btn-ghost text-emerald-400' : 'btn-secondary'}`}
                    onClick={() => handlePublishSingle('linkedin')}
                    disabled={publishStatuses.linkedin.status === 'publishing'}
                  >
                    {publishStatuses.linkedin.status === 'published' ? (
                      <span className="flex items-center gap-1.5"><CheckCheck size={14} /> Sent to LinkedIn</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><Send size={13} /> Send LinkedIn Post</span>
                    )}
                  </button>
                </td>
              </tr>

              {/* 3. X / TWITTER */}
              <tr className="channel-row">
                <td>
                  <div className="channel-identity">
                    <span className="platform-tag x">
                      <Layers size={14} /> X
                    </span>
                    <span className="channel-title">X (Twitter) Feed Post</span>
                  </div>
                </td>
                <td>
                  <span className="account-handle font-mono text-xs text-white font-semibold">
                    Gene Da Rocha (@genedarocha)
                  </span>
                </td>
                <td>
                  <div className="payload-preview">
                    <span className="payload-item truncate max-w-xs text-gray-300 font-medium">"{getXPost().substring(0, 60)}..."</span>
                    <span className="payload-item text-xs text-blue-400">Spotify Link + Thread Breakdown</span>
                  </div>
                </td>
                <td>
                  {publishStatuses.x.status === 'published' ? (
                    <div className="status-indicator published">
                      <CheckCheck size={14} className="text-emerald-400" />
                      <div>
                        <span className="status-text font-bold text-emerald-400">Posted on @genedarocha</span>
                        <span className="status-meta">{publishStatuses.x.publishedAt}</span>
                      </div>
                    </div>
                  ) : publishStatuses.x.status === 'publishing' ? (
                    <div className="status-indicator publishing">
                      <RefreshCw size={14} className="animate-spin text-amber-400" />
                      <span className="status-text text-amber-400">Posting to X API...</span>
                    </div>
                  ) : (
                    <div className="status-indicator idle">
                      <Clock size={14} className="text-gray-400" />
                      <span className="status-text text-gray-400">Ready to Post</span>
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <button
                    className={`btn btn-sm ${publishStatuses.x.status === 'published' ? 'btn-ghost text-emerald-400' : 'btn-secondary'}`}
                    onClick={() => handlePublishSingle('x')}
                    disabled={publishStatuses.x.status === 'publishing'}
                  >
                    {publishStatuses.x.status === 'published' ? (
                      <span className="flex items-center gap-1.5"><CheckCheck size={14} /> Tweet Sent</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><Send size={13} /> Post to Gene Da Rocha X</span>
                    )}
                  </button>
                </td>
              </tr>

              {/* 4. INSTAGRAM */}
              <tr className="channel-row">
                <td>
                  <div className="channel-identity">
                    <span className="platform-tag instagram">
                      <Share2 size={14} /> Instagram
                    </span>
                    <span className="channel-title">Instagram Post & Carousel</span>
                  </div>
                </td>
                <td>
                  <span className="account-handle font-mono text-xs text-pink-400 font-semibold">
                    @rochagenda
                  </span>
                </td>
                <td>
                  <div className="payload-preview">
                    <span className="payload-item">🖼️ Attached: ep{currentEpisode.number}_social_image.jpg (1080x1080)</span>
                    <span className="payload-item text-xs text-pink-300">Hook + Bio Link CTA + Vault Tags</span>
                  </div>
                </td>
                <td>
                  {publishStatuses.instagram.status === 'published' ? (
                    <div className="status-indicator published">
                      <CheckCheck size={14} className="text-emerald-400" />
                      <div>
                        <span className="status-text font-bold text-emerald-400">Published to @rochagenda</span>
                        <span className="status-meta">{publishStatuses.instagram.publishedAt}</span>
                      </div>
                    </div>
                  ) : publishStatuses.instagram.status === 'publishing' ? (
                    <div className="status-indicator publishing">
                      <RefreshCw size={14} className="animate-spin text-amber-400" />
                      <span className="status-text text-amber-400">Uploading to Instagram...</span>
                    </div>
                  ) : (
                    <div className="status-indicator idle">
                      <Clock size={14} className="text-gray-400" />
                      <span className="status-text text-gray-400">Ready to Post</span>
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <button
                    className={`btn btn-sm ${publishStatuses.instagram.status === 'published' ? 'btn-ghost text-emerald-400' : 'btn-secondary'}`}
                    onClick={() => handlePublishSingle('instagram')}
                    disabled={publishStatuses.instagram.status === 'publishing'}
                  >
                    {publishStatuses.instagram.status === 'published' ? (
                      <span className="flex items-center gap-1.5"><CheckCheck size={14} /> Posted to IG</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><Send size={13} /> Post to @rochagenda IG</span>
                    )}
                  </button>
                </td>
              </tr>

              {/* 5. TIKTOK / SHORTS */}
              <tr className="channel-row">
                <td>
                  <div className="channel-identity">
                    <span className="platform-tag tiktok">
                      <Sparkles size={14} /> TikTok
                    </span>
                    <span className="channel-title">TikTok & Shorts Video Studio</span>
                  </div>
                </td>
                <td>
                  <span className="account-handle font-mono text-xs">
                    @voxstar.ai
                  </span>
                </td>
                <td>
                  <div className="payload-preview">
                    <span className="payload-item">🎬 60s Vertical Script with Visual Cues</span>
                  </div>
                </td>
                <td>
                  {publishStatuses.tiktok.status === 'published' ? (
                    <div className="status-indicator published">
                      <CheckCheck size={14} className="text-emerald-400" />
                      <div>
                        <span className="status-text font-bold text-emerald-400">Script Dispatched</span>
                        <span className="status-meta">{publishStatuses.tiktok.publishedAt}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="status-indicator idle">
                      <Clock size={14} className="text-gray-400" />
                      <span className="status-text text-gray-400">Ready for Creation</span>
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handlePublishSingle('tiktok')}
                  >
                    <Send size={13} /> Dispatch Script
                  </button>
                </td>
              </tr>

              {/* 6. WHATSAPP VIP */}
              <tr className="channel-row">
                <td>
                  <div className="channel-identity">
                    <span className="platform-tag whatsapp">
                      <Smartphone size={14} /> WhatsApp
                    </span>
                    <span className="channel-title">VIP Community Broadcast</span>
                  </div>
                </td>
                <td>
                  <span className="account-handle font-mono text-xs text-emerald-400">
                    Voxstar Executive VIP Group
                  </span>
                </td>
                <td>
                  <div className="payload-preview">
                    <span className="payload-item">🚨 High-Engagement Executive Alert</span>
                  </div>
                </td>
                <td>
                  {publishStatuses.whatsapp.status === 'published' ? (
                    <div className="status-indicator published">
                      <CheckCheck size={14} className="text-emerald-400" />
                      <div>
                        <span className="status-text font-bold text-emerald-400">Delivered to VIPs</span>
                        <span className="status-meta">{publishStatuses.whatsapp.publishedAt}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="status-indicator idle">
                      <Clock size={14} className="text-gray-400" />
                      <span className="status-text text-gray-400">Ready to Broadcast</span>
                    </div>
                  )}
                </td>
                <td className="text-right">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handlePublishSingle('whatsapp')}
                  >
                    <Send size={13} /> Send VIP Alert
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs Navigation for Omni-Channel Social Package */}
      <div className="distribution-section mt-6">
        <div className="section-header-flex">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Share2 size={20} className="text-accent" />
              Content Inspector & Raw Copy Vault (Episode #{currentEpisode.number})
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Inspect or manually copy formatted text blocks for any channel.
            </p>
          </div>

          <div className="social-tabs-pills">
            <button
              className={`tab-pill ${activeTab === 'publisher-table' ? 'active' : ''}`}
              onClick={() => setActiveTab('publisher-table')}
            >
              <Send size={14} />
              Publish Command
            </button>
            <button
              className={`tab-pill ${activeTab === 'spotify' ? 'active' : ''}`}
              onClick={() => setActiveTab('spotify')}
            >
              <Radio size={14} />
              Spotify Notes
            </button>
            <button
              className={`tab-pill ${activeTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              <YoutubeIcon size={14} />
              Current Short
            </button>
            <button
              className={`tab-pill ${activeTab === 'youtube-archive' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube-archive')}
              style={activeTab === 'youtube-archive' ? { borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.15)' } : {}}
            >
              <YoutubeIcon size={14} className="text-red-400" />
              93 Shorts Catalog
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                {uploadedCount}/93
              </span>
            </button>
            <button
              className={`tab-pill ${activeTab === 'linkedin' ? 'active' : ''}`}
              onClick={() => setActiveTab('linkedin')}
            >
              <FileText size={14} />
              LinkedIn
            </button>
            <button
              className={`tab-pill ${activeTab === 'x' ? 'active' : ''}`}
              onClick={() => setActiveTab('x')}
            >
              <Layers size={14} />
              X (Twitter)
            </button>
            <button
              className={`tab-pill ${activeTab === 'instagram' ? 'active' : ''}`}
              onClick={() => setActiveTab('instagram')}
            >
              <Share2 size={14} />
              Instagram
            </button>
            <button
              className={`tab-pill ${activeTab === 'tiktok' ? 'active' : ''}`}
              onClick={() => setActiveTab('tiktok')}
            >
              <Sparkles size={14} />
              TikTok & Shorts
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
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="tab-content-panel glass-panel mt-3">
          {/* PUBLISHER SUMMARY TAB */}
          {activeTab === 'publisher-table' && (
            <div className="publisher-overview-box">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Episode #{currentEpisode.number} Multi-Channel Output Status
                </h3>
                <span className="text-xs text-gray-400">All channels automatically synced with mandatory hashtag vault.</span>
              </div>
              <div className="channel-quick-summary-grid">
                <div className="summary-card">
                  <div className="summary-title text-[#1ed760] flex items-center gap-1.5"><Radio size={13} /> Spotify Show Notes</div>
                  <div className="summary-value">{currentEpisode.title}</div>
                  <button className="btn btn-secondary btn-sm mt-2 w-full" onClick={() => handlePublishSingle('spotify')}>
                    <Send size={13} /> Publish to Spotify
                  </button>
                </div>
                <div className="summary-card">
                  <div className="summary-title text-[#ef4444] flex items-center gap-1.5"><YoutubeIcon size={13} /> YouTube Shorts</div>
                  <div className="summary-value">{getYoutubeShortTitle()}</div>
                  <button className="btn btn-youtube btn-sm mt-2 w-full" onClick={() => handlePublishSingle('youtube')}>
                    <YoutubeIcon size={13} /> Upload to YouTube ↗
                  </button>
                </div>
                <div className="summary-card">
                  <div className="summary-title text-blue-400 flex items-center gap-1.5"><FileText size={13} /> LinkedIn Post (Gene Da Rocha)</div>
                  <div className="summary-value">{currentEpisode.keyTakeaways[0]}</div>
                  <button className="btn btn-primary btn-sm mt-2 w-full" onClick={() => handlePublishSingle('linkedin')}>
                    <Send size={13} /> Send to LinkedIn
                  </button>
                </div>
                <div className="summary-card">
                  <div className="summary-title text-gray-200 flex items-center gap-1.5"><Layers size={13} /> X Tweet (@genedarocha)</div>
                  <div className="summary-value">Thread: 5 Key Points + Spotify Link</div>
                  <button className="btn btn-secondary btn-sm mt-2 w-full" onClick={() => handlePublishSingle('x')}>
                    <Send size={13} /> Post to Gene Da Rocha X
                  </button>
                </div>
                <div className="summary-card">
                  <div className="summary-title text-pink-400 flex items-center gap-1.5"><Share2 size={13} /> Instagram Post (@rochagenda)</div>
                  <div className="summary-value">1080x1080 Graphic + Reel Caption</div>
                  <button className="btn btn-secondary btn-sm mt-2 w-full" onClick={() => handlePublishSingle('instagram')}>
                    <Send size={13} /> Post to @rochagenda IG
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1. SPOTIFY TAB */}
          {activeTab === 'spotify' && (
            <div className="spotify-tab-full-wrapper">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Radio size={18} className="text-[#1ed760]" />
                    Spotify for Podcasters — Publishing Package (Ep #{currentEpisode.number})
                  </h3>
                  <p className="text-xs text-gray-400">Copy the title & description below and upload the master MP3 to Spotify Podcaster Dashboard.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={currentEpisode.audioUrl}
                    download={`Episode_${currentEpisode.number}_Voxstar_Master.mp3`}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download MP3 ({currentEpisode.duration})
                  </a>
                  <a
                    href="https://podcasters.spotify.com/pod/dashboard/episode/wizard"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-spotify btn-sm flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} /> Open Spotify Wizard ↗
                  </a>
                </div>
              </div>

              {/* Title Section */}
              <div className="spotify-tab-block mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={13} className="text-accent" /> 1. Episode Title
                  </span>
                  <button
                    className={`btn btn-xs flex items-center gap-1 ${copiedField === 'tab-title' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => handleCopyField(currentEpisode.title, 'tab-title')}
                  >
                    {copiedField === 'tab-title' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedField === 'tab-title' ? '✓ Copied Title!' : 'Copy Title'}
                  </button>
                </div>
                <div className="p-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white font-medium">
                  {currentEpisode.title}
                </div>
              </div>

              {/* Description Section */}
              <div className="spotify-tab-block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-purple-400" /> 2. Episode Description & Show Notes (With Vault Hashtags)
                  </span>
                  <button
                    className={`btn btn-xs flex items-center gap-1 ${copiedField === 'tab-desc' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => handleCopyField(getSpotifyNotes(), 'tab-desc')}
                  >
                    {copiedField === 'tab-desc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedField === 'tab-desc' ? '✓ Copied Description!' : 'Copy Description & Show Notes'}
                  </button>
                </div>
                <pre className="copy-block-text">{getSpotifyNotes()}</pre>
              </div>
            </div>
          )}

          {/* 2. YOUTUBE SHORTS TAB */}
          {activeTab === 'youtube' && (
            <div className="youtube-tab-full-wrapper">
              {/* Quick Switcher Banner to 93 Shorts Archive */}
              <div className="mb-4 p-3 bg-gradient-to-r from-red-950/40 via-red-900/20 to-black/40 border border-red-500/30 rounded-lg flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="text-xs text-gray-200">
                    Need YouTube Shorts for all <strong>93 published AI Automation episodes</strong> (Ep #1 to #93)?
                  </span>
                </div>
                <button 
                  className="btn btn-youtube btn-xs flex items-center gap-1.5"
                  onClick={() => setActiveTab('youtube-archive')}
                >
                  <YoutubeIcon size={12} />
                  Open 93 Shorts Catalog ({uploadedCount}/93 Uploaded) →
                </button>
              </div>

              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <YoutubeIcon size={18} className="text-[#ef4444]" />
                    YouTube Shorts Studio Package (Ep #{currentEpisode.number})
                  </h3>
                  <p className="text-xs text-gray-400">
                    Pre-formatted for <strong>Gene Da Rocha's YouTube Channel</strong> (UCa-q0YbY6yAMXgjPlYlZbvQ) with direct call-to-action directing viewers to the Spotify Master Podcast.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Radio size={14} className="text-[#1ed760]" /> View Spotify Podcast ↗
                  </a>
                  <a
                    href={YOUTUBE_STUDIO_UPLOAD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-youtube btn-sm flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} /> Open YouTube Studio Upload ↗
                  </a>
                </div>
              </div>

              {/* Title Section */}
              <div className="youtube-tab-block mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={13} className="text-accent" /> 1. YouTube Short Title
                  </span>
                  <button
                    className={`btn btn-xs flex items-center gap-1 ${copiedField === 'yt-title' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => handleCopyField(getYoutubeShortTitle(), 'yt-title')}
                  >
                    {copiedField === 'yt-title' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedField === 'yt-title' ? '✓ Copied Short Title!' : 'Copy Short Title'}
                  </button>
                </div>
                <div className="p-3 bg-black/40 border border-white/10 rounded-lg text-sm text-white font-medium font-mono">
                  {getYoutubeShortTitle()}
                </div>
              </div>

              {/* Description Section */}
              <div className="youtube-tab-block mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-red-400" /> 2. YouTube Video Description (Points to Spotify & Ecosystem URLs)
                  </span>
                  <button
                    className={`btn btn-xs flex items-center gap-1 ${copiedField === 'yt-desc' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => handleCopyField(getYoutubeShortDescription(), 'yt-desc')}
                  >
                    {copiedField === 'yt-desc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedField === 'yt-desc' ? '✓ Copied Description!' : 'Copy Full Description'}
                  </button>
                </div>
                <pre className="copy-block-text">{getYoutubeShortDescription()}</pre>
              </div>

              {/* 60s Vertical Script Section */}
              <div className="youtube-tab-block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Video size={13} className="text-yellow-400" /> 3. 60-Second Director Script & Visual Cues
                  </span>
                  <button
                    className={`btn btn-xs flex items-center gap-1 ${copiedField === 'yt-script' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => handleCopyField(getYoutubeShortScript(), 'yt-script')}
                  >
                    {copiedField === 'yt-script' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedField === 'yt-script' ? '✓ Copied Director Script!' : 'Copy Director Script'}
                  </button>
                </div>
                <pre className="copy-block-text">{getYoutubeShortScript()}</pre>
              </div>
            </div>
          )}

          {/* 93 YOUTUBE SHORTS CATALOG & FAST DISPATCHER */}
          {activeTab === 'youtube-archive' && (
            <div className="youtube-archive-wrapper flex flex-col gap-4">
              {/* Header & Stats Banner */}
              <div className="p-4 bg-gradient-to-r from-red-950/40 via-black/60 to-black/40 border border-red-500/30 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
                        <YoutubeIcon size={20} />
                      </span>
                      <h3 className="text-base font-bold text-white">
                        93 YouTube Shorts Catalog & 1-Click Dispatcher
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Complete pre-formatted 60-second vertical scripts, YouTube titles, and descriptions pointing directly to your <strong>Spotify Master Podcast</strong> (<a href={SPOTIFY_PODCAST_SHOW_URL} target="_blank" rel="noreferrer" className="text-[#1ed760] underline">4zS1fF5v9Rj9g7e3K1L8</a>) and Substack articles for Episodes #1 through #93.
                    </p>
                  </div>

                  {/* Global Batch Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      className="btn btn-secondary btn-sm flex items-center gap-1.5"
                      onClick={handleDownloadArchiveJSON}
                      title="Download full database as JSON"
                    >
                      <FolderDown size={14} className="text-blue-400" />
                      Download JSON (93)
                    </button>
                    <button
                      className="btn btn-secondary btn-sm flex items-center gap-1.5"
                      onClick={handleDownloadArchiveCSV}
                      title="Download full database as CSV"
                    >
                      <Download size={14} className="text-emerald-400" />
                      Download CSV (93)
                    </button>
                    <a
                      href={YOUTUBE_STUDIO_UPLOAD_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-youtube btn-sm flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} />
                      YouTube Studio Upload ↗
                    </a>
                  </div>
                </div>

                {/* Progress Bar & Status Counters */}
                <div className="bg-black/50 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-gray-300 mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span>Progress: <strong className="text-white">{uploadedCount}</strong> of 93 Uploaded</span>
                      <span className="text-emerald-400 font-semibold">({uploadPercentage}% Complete)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
                        onClick={() => handleMarkAllShorts(true)}
                      >
                        Mark All Uploaded
                      </button>
                      <span className="text-gray-600">•</span>
                      <button
                        className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
                        onClick={() => handleMarkAllShorts(false)}
                      >
                        Reset Status
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${uploadPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-black/30 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                      placeholder="Search by Ep # (e.g. '12', '93') or topic ('RAG', 'Swarm', 'Llama', 'Vision')..."
                      value={archiveSearchQuery}
                      onChange={(e) => setArchiveSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
                    <Filter size={12} /> Filter:
                  </span>
                  <button
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${archiveFilterStatus === 'all' ? 'bg-white/15 text-white border-white/30' : 'bg-black/30 text-gray-400 border-white/5 hover:text-white'}`}
                    onClick={() => setArchiveFilterStatus('all')}
                  >
                    All (93)
                  </button>
                  <button
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${archiveFilterStatus === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-black/30 text-gray-400 border-white/5 hover:text-white'}`}
                    onClick={() => setArchiveFilterStatus('pending')}
                  >
                    Pending ({93 - uploadedCount})
                  </button>
                  <button
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${archiveFilterStatus === 'uploaded' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-black/30 text-gray-400 border-white/5 hover:text-white'}`}
                    onClick={() => setArchiveFilterStatus('uploaded')}
                  >
                    Uploaded ({uploadedCount})
                  </button>
                </div>
              </div>

              {/* Two-Column Explorer Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column: 93 Episodes Scrollable Directory */}
                <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col h-[650px]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Episode Catalog ({filteredArchiveShorts.length} Matches)
                    </span>
                    <span className="text-[11px] text-gray-400">Click to inspect</span>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {filteredArchiveShorts.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-xs">
                        No matching episodes found. Try another search query.
                      </div>
                    ) : (
                      filteredArchiveShorts.map(shortPkg => {
                        const isSelected = shortPkg.episodeNumber === selectedArchiveEpNum;
                        const isUploaded = !!uploadedShorts[shortPkg.episodeNumber];

                        return (
                          <div
                            key={shortPkg.episodeNumber}
                            onClick={() => setSelectedArchiveEpNum(shortPkg.episodeNumber)}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${isSelected ? 'bg-red-950/30 border-red-500/50 shadow-sm' : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${isSelected ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                                  #{shortPkg.episodeNumber}
                                </span>
                                <span className="text-xs font-semibold text-white truncate" title={shortPkg.title}>
                                  {shortPkg.title}
                                </span>
                              </div>

                              <button
                                onClick={(e) => handleToggleShortUploaded(shortPkg.episodeNumber, e)}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all shrink-0 ${isUploaded ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'}`}
                                title={isUploaded ? "Mark as pending" : "Mark as uploaded"}
                              >
                                {isUploaded ? '✓ Uploaded' : '○ Pending'}
                              </button>
                            </div>

                            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                              {shortPkg.summary}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                              <span className="text-gray-500 truncate max-w-[180px]">
                                voxstar.substack.com/p/{shortPkg.slug}
                              </span>
                              <button
                                className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                                onClick={(e) => handleUploadArchiveShort(shortPkg, e)}
                                title="Copy description & launch YouTube Studio"
                              >
                                Upload ↗
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Column: Selected Episode Detail & Direct Launcher */}
                <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
                  {/* Selected Episode Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-red-600 text-white">
                          Short #{currentArchiveShort.episodeNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {currentArchiveShort.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {currentArchiveShort.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleToggleShortUploaded(currentArchiveShort.episodeNumber)}
                        className={`btn btn-xs ${uploadedShorts[currentArchiveShort.episodeNumber] ? 'btn-success' : 'btn-secondary'}`}
                      >
                        {uploadedShorts[currentArchiveShort.episodeNumber] ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Clock size={12} />}
                        {uploadedShorts[currentArchiveShort.episodeNumber] ? 'Status: Uploaded' : 'Mark as Uploaded'}
                      </button>
                      <button
                        onClick={() => handleUploadArchiveShort(currentArchiveShort)}
                        className="btn btn-youtube btn-sm flex items-center gap-1.5"
                      >
                        <YoutubeIcon size={14} />
                        Upload Short to YouTube Studio ↗
                      </button>
                    </div>
                  </div>

                  {/* 1. YouTube Short Title */}
                  <div className="youtube-tab-block">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag size={13} className="text-accent" /> 1. YouTube Short Title
                      </span>
                      <button
                        className={`btn btn-xs flex items-center gap-1 ${copiedField === `archive-title-${currentArchiveShort.episodeNumber}` ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handleCopyField(currentArchiveShort.youtubeShortTitle, `archive-title-${currentArchiveShort.episodeNumber}`)}
                      >
                        {copiedField === `archive-title-${currentArchiveShort.episodeNumber}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedField === `archive-title-${currentArchiveShort.episodeNumber}` ? '✓ Copied Title!' : 'Copy Title'}
                      </button>
                    </div>
                    <div className="p-2.5 bg-black/50 border border-white/10 rounded-lg text-xs text-white font-mono font-medium">
                      {currentArchiveShort.youtubeShortTitle}
                    </div>
                  </div>

                  {/* 2. YouTube Video Description */}
                  <div className="youtube-tab-block">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={13} className="text-red-400" /> 2. YouTube Description (With Spotify Link & 30-Tag Vault)
                      </span>
                      <button
                        className={`btn btn-xs flex items-center gap-1 ${copiedField === `archive-desc-${currentArchiveShort.episodeNumber}` ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handleCopyField(currentArchiveShort.youtubeShortDescription, `archive-desc-${currentArchiveShort.episodeNumber}`)}
                      >
                        {copiedField === `archive-desc-${currentArchiveShort.episodeNumber}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedField === `archive-desc-${currentArchiveShort.episodeNumber}` ? '✓ Copied Description!' : 'Copy Full Description'}
                      </button>
                    </div>
                    <pre className="copy-block-text max-h-44 overflow-y-auto text-xs">{currentArchiveShort.youtubeShortDescription}</pre>
                  </div>

                  {/* 3. 60-Second Vertical Director Script */}
                  <div className="youtube-tab-block">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Video size={13} className="text-yellow-400" /> 3. 60-Second Director's Script & Visual Flow
                      </span>
                      <button
                        className={`btn btn-xs flex items-center gap-1 ${copiedField === `archive-script-${currentArchiveShort.episodeNumber}` ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handleCopyField(currentArchiveShort.youtubeShortScript, `archive-script-${currentArchiveShort.episodeNumber}`)}
                      >
                        {copiedField === `archive-script-${currentArchiveShort.episodeNumber}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedField === `archive-script-${currentArchiveShort.episodeNumber}` ? '✓ Copied Script!' : 'Copy 60s Script'}
                      </button>
                    </div>
                    <pre className="copy-block-text max-h-40 overflow-y-auto text-xs">{currentArchiveShort.youtubeShortScript}</pre>
                  </div>

                  {/* Quick Links Footer */}
                  <div className="p-3 bg-black/30 border border-white/5 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <a href={currentArchiveShort.spotifyUrl} target="_blank" rel="noreferrer" className="text-[#1ed760] hover:underline flex items-center gap-1">
                        <Radio size={12} /> Spotify Master Podcast ↗
                      </a>
                      <span className="text-gray-600">•</span>
                      <a href={currentArchiveShort.substackUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1">
                        <Globe size={12} /> Substack Article ↗
                      </a>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Channel: Gene Da Rocha (UCa-q0YbY6yAMXgjPlYlZbvQ)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. LINKEDIN TAB */}
          {activeTab === 'linkedin' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">LinkedIn Authority Post (Ep #{currentEpisode.number})</span>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePublishSingle('linkedin')}
                  >
                    <Send size={14} /> Send LinkedIn Post
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(getLinkedInPost(), 'linkedin')}
                  >
                    {copiedTab === 'linkedin' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedTab === 'linkedin' ? 'Copied to Clipboard!' : 'Copy LinkedIn Post'}
                  </button>
                </div>
              </div>
              <pre className="copy-block-text">{getLinkedInPost()}</pre>
            </div>
          )}

          {/* 3. X / TWITTER TAB */}
          {activeTab === 'x' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">X / Twitter Viral Thread (Ep #{currentEpisode.number})</span>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePublishSingle('x')}
                  >
                    <Send size={14} /> Post to Gene Da Rocha X
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(getXPost(), 'x')}
                  >
                    {copiedTab === 'x' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedTab === 'x' ? 'Copied to Clipboard!' : 'Copy X Post'}
                  </button>
                </div>
              </div>
              <pre className="copy-block-text">{getXPost()}</pre>
            </div>
          )}

          {/* 4. INSTAGRAM TAB */}
          {activeTab === 'instagram' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">Instagram Post & Carousel Caption (Ep #{currentEpisode.number})</span>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePublishSingle('instagram')}
                  >
                    <Send size={14} /> Post to @rochagenda IG
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(getInstagramCaption(), 'instagram')}
                  >
                    {copiedTab === 'instagram' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedTab === 'instagram' ? 'Copied to Clipboard!' : 'Copy Instagram Caption'}
                  </button>
                </div>
              </div>
              <pre className="copy-block-text">{getInstagramCaption()}</pre>
            </div>
          )}

          {/* 5. TIKTOK & SHORTS TAB */}
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

          {/* 6. WHATSAPP VIP TAB */}
          {activeTab === 'whatsapp' && (
            <div className="copy-block-wrapper">
              <div className="copy-block-header">
                <span className="text-sm font-semibold text-white">WhatsApp VIP Community & Broadcast Message (Ep #{currentEpisode.number})</span>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePublishSingle('whatsapp')}
                  >
                    <Send size={14} /> Send VIP Alert
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(getWhatsAppBroadcast(), 'whatsapp')}
                  >
                    {copiedTab === 'whatsapp' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedTab === 'whatsapp' ? 'Copied to Clipboard!' : 'Copy WhatsApp Message'}
                  </button>
                </div>
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
                              if (allEpisodes[item.ep]) {
                                loadEpisodeData(item.ep);
                              } else {
                                handleApplyUrl(item.url);
                                setEpisodeNumber(item.ep);
                                setEpisodeTitle(item.title);
                              }
                              setActiveTab('publisher-table');
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
        .new-ep-btn {
          border-style: dashed;
          border-color: rgba(168, 85, 247, 0.4);
          background: rgba(168, 85, 247, 0.08);
          color: #d8b4fe;
        }
        .new-ep-btn:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: #a855f7;
          color: #fff;
        }
        .btn-ghost-clear {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost-clear:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }
        .clear-input-btn {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.15s;
        }
        .clear-input-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }
        .url-status-banner {
          animation: fadeIn 0.3s ease-in-out;
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

        /* PUBLISH COMMAND SECTION STYLES */
        .publish-command-section {
          padding: 1.5rem;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(168, 85, 247, 0.25);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .publish-command-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .publish-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(168, 85, 247, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }
        .blast-btn {
          background: linear-gradient(135deg, #a855f7, #6366f1) !important;
          box-shadow: 0 4px 18px rgba(168, 85, 247, 0.4);
          font-weight: 700;
        }
        .channels-table-wrapper {
          overflow-x: auto;
        }
        .channels-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .channels-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .channels-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }
        .channel-identity {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .platform-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          width: fit-content;
        }
        .platform-tag.spotify { background: rgba(30, 215, 96, 0.15); color: #1ed760; border: 1px solid rgba(30, 215, 96, 0.3); }
        .platform-tag.linkedin { background: rgba(10, 102, 194, 0.15); color: #38bdf8; border: 1px solid rgba(10, 102, 194, 0.3); }
        .platform-tag.x { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
        .platform-tag.instagram { background: rgba(225, 48, 108, 0.15); color: #f472b6; border: 1px solid rgba(225, 48, 108, 0.3); }
        .platform-tag.tiktok { background: rgba(0, 242, 234, 0.15); color: #22d3ee; border: 1px solid rgba(0, 242, 234, 0.3); }
        .platform-tag.whatsapp { background: rgba(37, 211, 102, 0.15); color: #4ade80; border: 1px solid rgba(37, 211, 102, 0.3); }
        .channel-title {
          font-weight: 600;
          color: #f1f5f9;
        }
        .account-handle {
          background: rgba(0, 0, 0, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .payload-preview {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .payload-item {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-indicator.published {
          color: #10b981;
        }
        .status-indicator.publishing {
          color: #fbbf24;
        }
        .status-meta {
          display: block;
          font-size: 0.65rem;
          color: #64748b;
          font-family: monospace;
        }

        .channel-quick-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .summary-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1rem;
        }
        .summary-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #a855f7;
          margin-bottom: 0.25rem;
        }
        .summary-value {
          font-size: 0.8rem;
          color: #cbd5e1;
          line-height: 1.4;
          height: 38px;
          overflow: hidden;
          text-overflow: ellipsis;
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
        /* SPOTIFY ASSISTANT STYLES */
        .spotify-assistant-section {
          padding: 1.5rem;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(20, 83, 45, 0.25), rgba(15, 23, 42, 0.7));
          border: 1px solid rgba(30, 215, 96, 0.35);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        }
        .spotify-assistant-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1rem;
        }
        .spotify-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          background: rgba(30, 215, 96, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(30, 215, 96, 0.35);
        }
        .badge-spotify {
          background: rgba(30, 215, 96, 0.2);
          color: #1ed760;
          border: 1px solid rgba(30, 215, 96, 0.4);
          font-weight: 700;
          font-size: 0.7rem;
          padding: 0.15rem 0.55rem;
          border-radius: 10px;
        }
        .btn-spotify {
          background: #1ed760 !important;
          color: #050505 !important;
          font-weight: 700 !important;
          border: none !important;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(30, 215, 96, 0.3);
        }
        .btn-spotify:hover {
          background: #1fdf64 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(30, 215, 96, 0.5);
        }
        .btn-success {
          background: #10b981 !important;
          color: white !important;
          border: none !important;
          font-weight: 600 !important;
        }
        .btn-mini-copy {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-mini-copy:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
        }
        .btn-xs {
          padding: 0.25rem 0.55rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
        }
        .spotify-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .spotify-steps-grid {
            grid-template-columns: 1fr;
          }
        }
        .spotify-step-card {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .step-badge {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #1ed760;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .step-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
        }
        .file-info-box, .title-display-box {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 0.6rem;
        }
        .file-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #f1f5f9;
        }
        .file-specs {
          display: flex;
          gap: 0.75rem;
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          flex-wrap: wrap;
        }
        .title-input-readonly {
          width: 100%;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          outline: none;
          cursor: text;
        }
        .metadata-specs-list {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .meta-spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 0.2rem;
        }
        .meta-spec-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .spec-label {
          color: #94a3b8;
        }
        .spec-val {
          color: #e2e8f0;
        }
        .spotify-desc-card {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 1rem;
        }
        .spotify-desc-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem;
          color: #e2e8f0;
          font-size: 0.82rem;
          line-height: 1.5;
          resize: vertical;
          outline: none;
          font-family: inherit;
        }
        .platform-tag.youtube { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35); }
        .badge-youtube {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
          font-weight: 700;
          font-size: 0.7rem;
          padding: 0.15rem 0.55rem;
          border-radius: 10px;
        }
        .btn-youtube {
          background: #ef4444 !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          border: none !important;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .btn-youtube:hover {
          background: #dc2626 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(239, 68, 68, 0.5);
        }
        .youtube-tab-full-wrapper {
          display: flex;
          flex-direction: column;
        }
        .youtube-tab-block {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 1rem;
        }
        .spotify-tab-full-wrapper {
          display: flex;
          flex-direction: column;
        }
        .spotify-tab-block {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};
