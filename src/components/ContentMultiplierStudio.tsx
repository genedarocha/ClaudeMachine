import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, Share2, Layers, Film, 
  Play, Pause, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Radio, Zap, Flame, Globe, Wand2
} from 'lucide-react';
import { ScreenHelpBanner } from './ScreenHelpBanner';

// Custom SVG Icons
const LinkedInIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.47 1.47 0 1 0 0 2.94 1.47 1.47 0 0 0 0-2.94z"/>
  </svg>
);

const XTwitterIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V5.81a6.33 6.33 0 0 0-4.64.44A6.34 6.34 0 0 0 2.25 12a6.34 6.34 0 0 0 10.83 4.47v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.74-.9z"/>
  </svg>
);

export interface CarouselSlide {
  slideNumber: number;
  type: 'hook' | 'insight' | 'cta';
  headline: string;
  body: string;
  bulletPoints?: string[];
  visualPrompt: string;
}

export interface MultipliedContent {
  linkedinPost: string;
  xPost: string;
  facebookPost: string;
  tiktokScript: {
    hook: string;
    bodyNarration: string;
    visualCues: string[];
    onScreenCaptions: string[];
    cta: string;
  };
  carouselSlides: CarouselSlide[];
  ltxVideoPrompt: string;
  ffmpegCommand: string;
}

const PRESET_IDEAS = [
  {
    id: 'ep100',
    title: 'Episode #100: The Century Milestone & Autonomous AI Systems',
    sourceUrl: 'https://voxstar.substack.com/p/100-the-century-milestone-autonomous',
    audioUrl: '/podcast/Episode_100_Master.mp3',
    sourceText: `Autonomous AI Systems and Frontier Reasoning Models are shifting enterprises from single-turn chat assistants to coordinated swarms of autonomous agents. The key breakthrough is deterministic state management: probabilistic LLMs cannot self-regulate without kernel-level software brakes and cryptographic intent tokens. Organizations deploying supervisor-worker swarms with automated rollback circuits achieve 10x ROI while eliminating runaway recursive token burn.`
  },
  {
    id: 'ep99',
    title: 'Episode #99: Microsoft Custom AI Silicon & Maia 100 Accelerators',
    sourceUrl: 'https://voxstar.substack.com/p/99-microsoft-is-finally-making-custom',
    audioUrl: '/podcast/Episode_99_Master.mp3',
    sourceText: `Microsoft is finally making custom data center silicon to accelerate AI & cloud workloads. The Maia 100 and Cobalt 100 custom chips provide sovereign hyperscale compute, bypassing Nvidia GPU shortages and drastically lowering inference costs for enterprise generative models.`
  },
  {
    id: 'ep98',
    title: 'Episode #98: Hannah Fry $100 Runaway AI Agent Case Study',
    sourceUrl: 'https://voxstar.substack.com/p/98-dr-hannah-fry-and-the-100',
    audioUrl: '/podcast/Episode_98_Master.mp3',
    sourceText: `Dr. Hannah Fry's experimental AI agent burned through $100 in API tokens in seconds and filled 7GB of local logs because of an unbounded recursive feedback loop. Prompt-based guardrails fail under edge conditions; deterministic circuit breakers and zero-trust execution are mandatory.`
  }
];

export const ContentMultiplierStudio: React.FC = () => {
  const [sourceIdea, setSourceIdea] = useState(PRESET_IDEAS[0].sourceText);
  const [sourceTitle, setSourceTitle] = useState(PRESET_IDEAS[0].title);
  const [activeTab, setActiveTab] = useState<'multiplier' | 'carousel' | 'video-916' | 'prompts'>('multiplier');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedSlide, setSelectedSlide] = useState<number>(1);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);

  const videoRef = useRef<HTMLDivElement | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Generate Multiplied Content dynamically from Source Text
  const generateMultiplication = (_text: string, title: string): MultipliedContent => {
    const cleanTopic = title.replace(/^Episode #\d+:\s*/i, '') || 'Enterprise AI Automation';

    const linkedinPost = `Most leaders still think AI is about asking ChatGPT to write an email.

They are completely missing the shift.

Here is what is actually happening with ${cleanTopic}:

1. Single-prompt chatbots are dying. Coordinated multi-agent swarms are taking over operations.
2. Probabilistic LLMs cannot self-regulate. Deterministic software brakes and circuit breakers are now mandatory.
3. The real ROI isn't drafting text—it's autonomous multi-system execution with human-in-the-loop verification gates.

The companies winning in 2026 aren't using more prompts.
They are building resilient automation architectures.

Are you still using AI as an assistant, or have you deployed your first autonomous swarm?

#AIAutomation #EnterpriseAI #AutonomousAgents #TechLeadership #Productivity`;

    const xPost = `Single chatbots are dead. Coordinated agent swarms are running real operations.

If you don't have deterministic software brakes, you're one loop away from burning your budget.

Here's how we build resilient AI in 2026 🧵👇`;

    const facebookPost = `A quick reality check for anyone running a business right now:

If you are still only using AI for copywriting, you are leaving 90% of the value on the table.

We just broke down how leading teams are building autonomous AI systems with strict safeguards to handle complex multi-step workflows.

The biggest takeaway? You can't rely on natural language prompts to stop runaway errors—you need real software brakes.

What is the single most repetitive task in your business you wish an AI swarm could handle right now? Drop it below and let's discuss! 👇`;

    const tiktokScript = {
      hook: `Stop using ChatGPT like a search engine. Here is the AI breakthrough nobody is telling you about.`,
      bodyNarration: `In 2026, single chatbots are officially obsolete. Today's top engineers are deploying autonomous agent swarms that plan, code, and execute entire business operations. But here is the catch: without deterministic circuit breakers, an agent can burn your entire API budget in seconds. That's why the future belongs to zero-trust AI architectures.`,
      visualCues: [
        '[0-3s] Fast zoom-in on host with animated neon text: "CHATBOTS ARE DEAD"',
        '[3-8s] Screen recording showing 5 AI agents executing parallel tasks simultaneously',
        '[8-15s] Red alert warning graphic illustrating runaway token loops and software brakes',
        '[15-22s] Sleek dashboard visual showing 10x ROI and 100% automated workflows'
      ],
      onScreenCaptions: [
        'Chatbots are dead 💀',
        'Autonomous Agent Swarms 🤖⚡',
        'The $100 Runaway Loop 🛑',
        'Zero-Trust Automation 🛡️'
      ],
      cta: `Hit follow and comment 'AGENT' to get our free autonomous swarm blueprint!`
    };

    const carouselSlides: CarouselSlide[] = [
      {
        slideNumber: 1,
        type: 'hook',
        headline: `Why Single AI Chatbots Are Dead In 2026.`,
        body: `And the 1 autonomous shift separating amateurs from 10x market leaders.`,
        visualPrompt: `Minimalist dark-mode typography on deep obsidian gradient, bold electric amber accent text, sleek glowing circuit outlines, 3D abstract sphere, high resolution, 8k UI design style.`
      },
      {
        slideNumber: 2,
        type: 'insight',
        headline: `1. From Prompts to Autonomous Swarms`,
        body: `Instead of 1 human prompting 1 model, supervisor agents now orchestrate specialized worker agents in parallel.`,
        bulletPoints: [
          'Supervisor breaks down complex goals',
          'Workers execute code, research & ops',
          'Quality reviewer validates before output'
        ],
        visualPrompt: `Futuristic node graph network showing 1 central supervisor node connecting to 4 specialized worker nodes, neon cyan and violet glow, dark glassmorphism card.`
      },
      {
        slideNumber: 3,
        type: 'insight',
        headline: `2. The Fatal Runaway Loop Flaw`,
        body: `LLMs are probabilistic. If an agent hits an error, it can loop infinitely and burn thousands in tokens within minutes.`,
        bulletPoints: [
          'Unbounded recursive retry loops',
          'Massive disk logging bloat',
          'Zero self-regulation ability'
        ],
        visualPrompt: `A sleek 3D digital hourglass burning glowing energy tokens, cinematic warning red and gold highlights, futuristic cybernetic design.`
      },
      {
        slideNumber: 4,
        type: 'insight',
        headline: `3. Deterministic Software Brakes`,
        body: `Never rely on "system prompts" to stop errors. Real protection requires hard kernel-level execution limits.`,
        bulletPoints: [
          'Strict token velocity rate limiters',
          'Max execution step ceilings',
          'Automatic circuit breaker trips'
        ],
        visualPrompt: `Industrial high-tech mechanical brake clamp glowing with neon blue cybernetic data streams, ultra-clean premium render.`
      },
      {
        slideNumber: 5,
        type: 'insight',
        headline: `4. Cryptographic Intent Tokens`,
        body: `High-risk actions (spending money, database edits, public emails) must require signed, cryptographically verified tokens.`,
        bulletPoints: [
          'Immutable action authorization',
          'Human-in-the-loop escalation gates',
          'Full audit provenance trail'
        ],
        visualPrompt: `Glowing holographic cryptographic key card floating above a secure server rack, emerald green and dark slate palette.`
      },
      {
        slideNumber: 6,
        type: 'insight',
        headline: `5. Native Multimodal Workflows`,
        body: `State-of-the-art models don't just read text—they reason over audio, video, charts, and live browser sessions seamlessly.`,
        bulletPoints: [
          'Direct computer-use automation',
          'Instant audio & video synthesis',
          'Unified reasoning token space'
        ],
        visualPrompt: `Abstract prism splitting a single laser beam of data into video, audio, and code streams, vibrant spectrum against dark background.`
      },
      {
        slideNumber: 7,
        type: 'insight',
        headline: `6. The Enterprise Blueprint`,
        body: `Start with 1 high-friction repetitive process. Build a 3-agent pipeline with deterministic validation before scaling.`,
        bulletPoints: [
          '1. Research & Data Ingest Agent',
          '2. Synthesis & Drafting Agent',
          '3. QA & Compliance Inspector'
        ],
        visualPrompt: `Step-by-step modular 3D pipeline blocks assembling into a golden trophy structure, clean architectural isometric render.`
      },
      {
        slideNumber: 8,
        type: 'cta',
        headline: `Stop Prompting. Start Automating.`,
        body: `Save this post for your next sprint.\n\nComment 'SWARM' below and I'll send you our complete zero-cost automation code pack.`,
        bulletPoints: [
          '📌 Save for later reference',
          '🚀 Share with your engineering team',
          '💬 Drop your thoughts below'
        ],
        visualPrompt: `Clean final slide with glowing bookmark and paper plane icons, luxury dark aesthetic, bold white and amber typography.`
      }
    ];

    const ltxVideoPrompt = `Cinematic 9:16 vertical video of a futuristic high-tech AI command center with glowing holographic charts, smooth slow pan over glowing fiber-optic data streams and floating agent node graph, neon cyan and amber lighting, photorealistic 8k, 60fps, shallow depth of field.`;

    const ffmpegCommand = `ffmpeg -loop 1 -i ep100_social_image.jpg -i Episode_100_Master.mp3 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[bg]; [1:a]showwaves=s=900x240:mode=p2p:colors=0x60a5fa@0.9[wave]; [bg][wave]overlay=(W-w)/2:H-h-350[v]" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k -shortest ep100_vertical_short.mp4`;

    return {
      linkedinPost,
      xPost,
      facebookPost,
      tiktokScript,
      carouselSlides,
      ltxVideoPrompt,
      ffmpegCommand
    };
  };

  const multiplied = generateMultiplication(sourceIdea, sourceTitle);

  // Timer simulation for 9:16 video player preview
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlayingVideo) {
      interval = setInterval(() => {
        setVideoTimer(prev => (prev >= 15 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingVideo]);

  const rawPrompt1 = `Act as my social media editor.

Turn the source content below into:

• 1 conversational LinkedIn post
• 1 X post under 280 characters
• 1 conversational Facebook post
• 1 Tiktok video script with a strong hook

Preserve my main idea and voice. Make each version feel native to its platform instead of copying the same wording. Do not invent facts.

Source content:
${sourceIdea}`;

  const rawPrompt2 = `Turn the source content below into an 8-slide Instagram carousel: a curiosity-driven hook on slide 1, 1 clear idea per slide, and a CTA on slide 8.

Use simple language and short sentences. Keep every claim grounded in the source. Return the exact prompts I can paste directly into an AI image generation tool to make all 8 slides.

Source content:
${sourceIdea}`;

  return (
    <div className="content-multiplier-studio animate-fade">
      {/* Screen Help Banner */}
      <ScreenHelpBanner
        screenTitle="Content Multiplier & Free Video Engine (Blotato Alternative)"
        subtitle="1 Proven Idea → Multiplied natively for LinkedIn, X, Facebook, TikTok & 8-Slide Instagram Carousels. 100% Free with zero subscription fees."
        steps={[
          {
            number: 1,
            title: "Input 1 Proven Idea",
            detail: "Paste an article, podcast summary, video script, or select an episode preset."
          },
          {
            number: 2,
            title: "Multiply Across Platforms",
            detail: "Instantly generate native conversational posts, viral 8-slide carousels, and TikTok scripts."
          },
          {
            number: 3,
            title: "Zero-Cost 9:16 Video & B-Roll",
            detail: "Use LTX-Video, free stock footage, and FFmpeg audio waveforms to produce vertical Shorts & Reels."
          }
        ]}
        proTip="No $29-$499/mo Blotato credit limits. You have unlimited local generation and direct 1-click clipboard blast."
      />

      {/* 1. SOURCE IDEA INPUT HERO */}
      <div className="glass-panel multiplier-source-card">
        <div className="source-card-header">
          <div className="flex-align-center gap-2">
            <Zap className="text-amber" size={20} />
            <h3 className="card-title">1. Start with 1 Proven Idea (The Core Source)</h3>
          </div>
          <div className="preset-selector-row">
            <span className="text-secondary text-xs">Load Preset:</span>
            {PRESET_IDEAS.map(preset => (
              <button
                key={preset.id}
                className={`btn btn-sm ${sourceTitle === preset.title ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setSourceTitle(preset.title);
                  setSourceIdea(preset.sourceText);
                }}
              >
                {preset.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="source-input-grid">
          <div>
            <label className="field-label">Topic / Headline</label>
            <input
              type="text"
              className="text-input"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g. Episode #100: Autonomous AI Systems & Safeguards"
            />
          </div>
          <div>
            <label className="field-label">Source Content / Key Insights</label>
            <textarea
              className="textarea-input"
              rows={3}
              value={sourceIdea}
              onChange={(e) => setSourceIdea(e.target.value)}
              placeholder="Paste your video transcript, Substack article, or rough voice notes here..."
            />
          </div>
        </div>

        {/* PROMPT 1 & 2 QUICK COPY BAR */}
        <div className="prompt-quick-actions">
          <div className="flex-align-center gap-2">
            <Sparkles className="text-accent" size={16} />
            <span className="font-semibold text-sm">2 Free Viral Multiplication Prompts:</span>
          </div>
          <div className="flex-align-center gap-2">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => copyToClipboard(rawPrompt1, 'prompt1')}
            >
              {copiedKey === 'prompt1' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              Copy Prompt 1 (All Platforms)
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => copyToClipboard(rawPrompt2, 'prompt2')}
            >
              {copiedKey === 'prompt2' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              Copy Prompt 2 (8-Slide Carousel)
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="multiplier-tabs-nav">
        <button
          className={`tab-button ${activeTab === 'multiplier' ? 'active' : ''}`}
          onClick={() => setActiveTab('multiplier')}
        >
          <Share2 size={16} />
          <span>Platform Multiplier (LinkedIn, X, FB, TikTok)</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'carousel' ? 'active' : ''}`}
          onClick={() => setActiveTab('carousel')}
        >
          <Layers size={16} />
          <span>8-Slide Instagram & LinkedIn Carousel</span>
          <span className="badge-pill">8 Slides</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'video-916' ? 'active' : ''}`}
          onClick={() => setActiveTab('video-916')}
        >
          <Film size={16} />
          <span>9:16 Vertical Video & LTX Engine</span>
          <span className="badge-pill badge-free">Free Video</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'prompts' ? 'active' : ''}`}
          onClick={() => setActiveTab('prompts')}
        >
          <Wand2 size={16} />
          <span>Raw Prompt Templates</span>
        </button>
      </div>

      {/* TAB 1: 4 PLATFORMS MULTIPLIER */}
      {activeTab === 'multiplier' && (
        <div className="platforms-grid animate-fade">
          {/* A. LINKEDIN POST */}
          <div className="glass-panel platform-card">
            <div className="platform-card-header">
              <div className="flex-align-center gap-2">
                <div className="icon-badge linkedin-badge">
                  <LinkedInIcon size={16} />
                </div>
                <div>
                  <h4 className="platform-name">LinkedIn Conversational Post</h4>
                  <span className="text-muted text-xs">Formatted for high Dwell Time & Comments</span>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(multiplied.linkedinPost, 'li-post')}
              >
                {copiedKey === 'li-post' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy LinkedIn
              </button>
            </div>
            <div className="platform-content-box">
              <pre className="post-preview-text">{multiplied.linkedinPost}</pre>
            </div>
          </div>

          {/* B. X (TWITTER) POST */}
          <div className="glass-panel platform-card">
            <div className="platform-card-header">
              <div className="flex-align-center gap-2">
                <div className="icon-badge x-badge">
                  <XTwitterIcon size={16} />
                </div>
                <div>
                  <h4 className="platform-name">X Post (Under 280 Chars)</h4>
                  <span className="text-muted text-xs">
                    Length: {multiplied.xPost.length} / 280 chars • {280 - multiplied.xPost.length} remaining
                  </span>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(multiplied.xPost, 'x-post')}
              >
                {copiedKey === 'x-post' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy X Post
              </button>
            </div>
            <div className="platform-content-box">
              <pre className="post-preview-text">{multiplied.xPost}</pre>
            </div>
          </div>

          {/* C. FACEBOOK CONVERSATIONAL POST */}
          <div className="glass-panel platform-card">
            <div className="platform-card-header">
              <div className="flex-align-center gap-2">
                <div className="icon-badge fb-badge">
                  <FacebookIcon size={16} />
                </div>
                <div>
                  <h4 className="platform-name">Facebook Conversational Post</h4>
                  <span className="text-muted text-xs">Story-driven with engagement discussion CTA</span>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(multiplied.facebookPost, 'fb-post')}
              >
                {copiedKey === 'fb-post' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy Facebook
              </button>
            </div>
            <div className="platform-content-box">
              <pre className="post-preview-text">{multiplied.facebookPost}</pre>
            </div>
          </div>

          {/* D. TIKTOK / REELS VIDEO SCRIPT */}
          <div className="glass-panel platform-card">
            <div className="platform-card-header">
              <div className="flex-align-center gap-2">
                <div className="icon-badge tt-badge">
                  <TikTokIcon size={16} />
                </div>
                <div>
                  <h4 className="platform-name">TikTok & Reels Video Script</h4>
                  <span className="text-muted text-xs">3-Second Hook + Fast Visual Cues + High-Retention CTA</span>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(
                  `HOOK (0-3s):\n${multiplied.tiktokScript.hook}\n\nNARRATION:\n${multiplied.tiktokScript.bodyNarration}\n\nVISUAL CUES:\n${multiplied.tiktokScript.visualCues.join('\n')}\n\nCTA:\n${multiplied.tiktokScript.cta}`,
                  'tt-script'
                )}
              >
                {copiedKey === 'tt-script' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy TikTok Script
              </button>
            </div>
            <div className="platform-content-box tiktok-script-box">
              <div className="script-hook-banner">
                <Flame size={16} className="text-amber" />
                <span className="font-semibold text-xs">VIRAL HOOK (0-3s):</span>
                <p className="hook-text">"{multiplied.tiktokScript.hook}"</p>
              </div>

              <div className="script-section">
                <span className="script-section-label">🎙️ NARRATION (Voiceover):</span>
                <p className="narration-text">{multiplied.tiktokScript.bodyNarration}</p>
              </div>

              <div className="script-section">
                <span className="script-section-label">🎬 VISUAL CUES & B-ROLL:</span>
                <ul className="visual-cues-list">
                  {multiplied.tiktokScript.visualCues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>

              <div className="script-cta-banner">
                <span className="font-semibold text-xs">🚀 CALL TO ACTION:</span>
                <p>{multiplied.tiktokScript.cta}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 8-SLIDE CAROUSEL GENERATOR */}
      {activeTab === 'carousel' && (
        <div className="carousel-studio-layout animate-fade">
          {/* LEFT: SLIDE PREVIEW CANVAS */}
          <div className="glass-panel carousel-preview-container">
            <div className="carousel-nav-controls">
              <button 
                className="btn btn-secondary btn-sm"
                disabled={selectedSlide === 1}
                onClick={() => setSelectedSlide(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={16} /> Prev Slide
              </button>
              <div className="slide-counter-badge">
                Slide {selectedSlide} of 8 ({multiplied.carouselSlides[selectedSlide - 1]?.type.toUpperCase()})
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={selectedSlide === 8}
                onClick={() => setSelectedSlide(prev => Math.min(8, prev + 1))}
              >
                Next Slide <ChevronRight size={16} />
              </button>
            </div>

            {/* VISUAL CAROUSEL CARD (Square 1:1 Aspect Ratio) */}
            {multiplied.carouselSlides[selectedSlide - 1] && (
              <div className="carousel-visual-card">
                <div className="card-top-bar">
                  <span className="card-brand-tag">VOXSTAR AI AUTOMATION</span>
                  <span className="card-slide-pill">{selectedSlide} / 8</span>
                </div>

                <div className="card-body-content">
                  <h3 className="card-slide-title">
                    {multiplied.carouselSlides[selectedSlide - 1].headline}
                  </h3>
                  <p className="card-slide-sub">
                    {multiplied.carouselSlides[selectedSlide - 1].body}
                  </p>

                  {multiplied.carouselSlides[selectedSlide - 1].bulletPoints && (
                    <div className="card-bullets">
                      {multiplied.carouselSlides[selectedSlide - 1].bulletPoints?.map((b, i) => (
                        <div key={i} className="card-bullet-item">
                          <span className="bullet-dot">▸</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-bottom-bar">
                  <span>Gene Da Rocha</span>
                  <span>Swipe ➔</span>
                </div>
              </div>
            )}

            {/* SLIDE THUMBNAIL TRACK */}
            <div className="carousel-thumbnails-track">
              {multiplied.carouselSlides.map((slide) => (
                <button
                  key={slide.slideNumber}
                  className={`slide-thumb ${selectedSlide === slide.slideNumber ? 'active' : ''}`}
                  onClick={() => setSelectedSlide(slide.slideNumber)}
                >
                  <span className="thumb-num">{slide.slideNumber}</span>
                  <span className="thumb-type">{slide.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: AI IMAGE PROMPTS & EXPORT FOR ALL 8 SLIDES */}
          <div className="glass-panel carousel-prompts-panel">
            <div className="flex-between">
              <div className="flex-align-center gap-2">
                <ImageIcon className="text-accent" size={18} />
                <h4 className="panel-title">AI Image Prompts for 8 Slides</h4>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => copyToClipboard(
                  multiplied.carouselSlides.map(s => `SLIDE ${s.slideNumber} (${s.type.toUpperCase()}):\nHeadline: ${s.headline}\nText: ${s.body}\nImage Prompt: ${s.visualPrompt}\n`).join('\n---\n'),
                  'all-slides'
                )}
              >
                {copiedKey === 'all-slides' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy All 8 Slide Prompts
              </button>
            </div>

            <div className="slide-prompt-details">
              <div className="current-slide-inspector">
                <div className="inspector-header">
                  <span className="badge-pill">Slide #{selectedSlide} Prompt</span>
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => copyToClipboard(multiplied.carouselSlides[selectedSlide - 1].visualPrompt, `prompt-${selectedSlide}`)}
                  >
                    {copiedKey === `prompt-${selectedSlide}` ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    Copy Prompt #{selectedSlide}
                  </button>
                </div>
                <div className="prompt-text-box">
                  <code>{multiplied.carouselSlides[selectedSlide - 1]?.visualPrompt}</code>
                </div>
              </div>

              <div className="all-slides-list">
                <span className="text-secondary text-xs font-semibold">ALL 8 SLIDES SUMMARY:</span>
                {multiplied.carouselSlides.map(s => (
                  <div 
                    key={s.slideNumber} 
                    className={`slide-summary-row ${selectedSlide === s.slideNumber ? 'active' : ''}`}
                    onClick={() => setSelectedSlide(s.slideNumber)}
                  >
                    <span className="slide-num-badge">#{s.slideNumber}</span>
                    <div className="slide-summary-text">
                      <strong>{s.headline}</strong>
                      <p className="text-xs text-muted truncate">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 9:16 VERTICAL VIDEO & LTX / FFMPEG ENGINE */}
      {activeTab === 'video-916' && (
        <div className="video-studio-layout animate-fade">
          {/* LEFT: 9:16 VERTICAL PHONE PREVIEW */}
          <div className="glass-panel video-phone-card">
            <div className="phone-wrapper">
              <div className="phone-screen" ref={videoRef}>
                {/* Background Simulation / Video */}
                <div className="phone-bg-glow" />

                {/* Top Badge */}
                <div className="phone-top-badge">
                  <Flame size={14} className="text-amber animate-pulse" />
                  <span>VIRAL SHORTS • #100</span>
                </div>

                {/* Animated Captions & Waveform */}
                <div className="phone-center-hook">
                  <span className="hook-pill">EPISODE REVEAL</span>
                  <h2 className="hook-heading">
                    {sourceTitle.replace(/^Episode #\d+:\s*/i, '')}
                  </h2>
                  
                  {/* Dynamic Subtitle Highlight */}
                  <div className="karaoke-captions">
                    <span className="caption-word active">Autonomous</span>
                    <span className="caption-word">agent</span>
                    <span className="caption-word">swarms</span>
                    <span className="caption-word">with</span>
                    <span className="caption-word highlight">deterministic</span>
                    <span className="caption-word">brakes.</span>
                  </div>
                </div>

                {/* Animated Waveform Visualizer */}
                <div className="phone-waveform-container">
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '60%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '85%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '40%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '95%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '70%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '90%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '50%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '80%' }} />
                  <div className={`waveform-bar ${isPlayingVideo ? 'animating' : ''}`} style={{ height: '65%' }} />
                </div>

                {/* Bottom Host Tag */}
                <div className="phone-host-tag">
                  <Radio size={14} className="text-accent" />
                  <span>Gene Da Rocha • Voxstar AI</span>
                </div>
              </div>

              {/* Video Player Controls */}
              <div className="video-player-controls">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                >
                  {isPlayingVideo ? <Pause size={16} /> : <Play size={16} />}
                  {isPlayingVideo ? 'Pause Preview' : 'Play 9:16 Preview'}
                </button>
                <span className="text-secondary text-xs">
                  {videoTimer}s / 15s Demo
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: ZERO-COST VIDEO PIPELINE (LTX, PEXELS, FFMPEG) */}
          <div className="glass-panel video-pipeline-panel">
            <div className="flex-align-center gap-2 mb-3">
              <Film className="text-accent" size={20} />
              <div>
                <h4 className="panel-title">Zero-Cost Video & B-Roll Generation Stack</h4>
                <p className="text-secondary text-xs">
                  Replaces Blotato's $97/mo HeyGen/Sora video fees with 100% free open models & FFmpeg
                </p>
              </div>
            </div>

            {/* 1. LTX-Video / LTX-2.5 Prompt */}
            <div className="pipeline-step-card">
              <div className="step-header">
                <span className="step-badge">1. Open AI Video (LTX-Video / LTX-2.5)</span>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => copyToClipboard(multiplied.ltxVideoPrompt, 'ltx-prompt')}
                >
                  {copiedKey === 'ltx-prompt' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  Copy LTX Prompt
                </button>
              </div>
              <p className="step-desc">
                Paste this into free Hugging Face Spaces (LTX-Video / CogVideoX) or run locally on your GPU:
              </p>
              <div className="code-snippet-box">
                <code>{multiplied.ltxVideoPrompt}</code>
              </div>
            </div>

            {/* 2. Free Pexels / Pixabay Vertical B-Roll */}
            <div className="pipeline-step-card">
              <div className="step-header">
                <span className="step-badge">2. Free HD Vertical Stock B-Roll</span>
                <a
                  href={`https://www.pexels.com/search/videos/artificial%20intelligence/?orientation=portrait`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-xs"
                >
                  <Globe size={12} /> Open Free Pexels 9:16 B-Roll
                </a>
              </div>
              <p className="step-desc">
                Download 100% royalty-free 9:16 vertical clips of servers, futuristic data centers, or abstract neural networks.
              </p>
            </div>

            {/* 3. 1-Line FFmpeg Master Render Command */}
            <div className="pipeline-step-card">
              <div className="step-header">
                <span className="step-badge">3. 1-Line FFmpeg Automated Video Render</span>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => copyToClipboard(multiplied.ffmpegCommand, 'ffmpeg-cmd')}
                >
                  {copiedKey === 'ffmpeg-cmd' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  Copy Terminal Command
                </button>
              </div>
              <p className="step-desc">
                Combines your mastered podcast audio, background visual, moving waveform, and outputs a 1080x1920 MP4:
              </p>
              <div className="code-snippet-box">
                <code>{multiplied.ffmpegCommand}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RAW PROMPT TEMPLATES */}
      {activeTab === 'prompts' && (
        <div className="prompts-tab-layout animate-fade">
          <div className="glass-panel prompt-template-card">
            <div className="flex-between mb-2">
              <div className="flex-align-center gap-2">
                <Sparkles className="text-accent" size={18} />
                <h4 className="card-title">Prompt 1: Turn 1 Idea into Posts for Every Platform</h4>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => copyToClipboard(rawPrompt1, 'p1-full')}
              >
                {copiedKey === 'p1-full' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy Prompt 1
              </button>
            </div>
            <pre className="raw-prompt-pre">{rawPrompt1}</pre>
          </div>

          <div className="glass-panel prompt-template-card">
            <div className="flex-between mb-2">
              <div className="flex-align-center gap-2">
                <Layers className="text-accent" size={18} />
                <h4 className="card-title">Prompt 2: Turn 1 Idea into an 8-Slide Instagram Carousel</h4>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => copyToClipboard(rawPrompt2, 'p2-full')}
              >
                {copiedKey === 'p2-full' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy Prompt 2
              </button>
            </div>
            <pre className="raw-prompt-pre">{rawPrompt2}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
