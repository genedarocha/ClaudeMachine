import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Copy, Check, Share2, Layers, Film, 
  Play, Pause, Radio, Zap, Flame, Globe, Wand2, MessageCircle,
  History, CheckCircle2, Send, Clock, Trash2, Edit3
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

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ThreadsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.72 0 12.186 5.094 12.186 11.814 0 2.766-.96 5.4-2.705 7.42-1.745 2.02-4.185 3.166-6.87 3.166-3.882 0-6.75-2.22-6.75-5.46 0-3.328 2.92-5.46 7.21-5.46.72 0 1.48.06 2.22.18v-.68c0-1.88-1.32-3.08-3.48-3.08-1.54 0-2.88.62-3.48 1.62l-2.02-1.42C9.445 6.064 11.585 5.1 14.045 5.1c3.6 0 6.08 2.12 6.08 5.62v7.1c0 1.84.82 2.68 2.06 2.68.86 0 1.54-.42 2.02-1.04l1.62 1.68C24.845 22.42 23.325 24 20.825 24c-2.42 0-4.14-1.32-4.52-3.44-1.16 2.18-3.3 3.44-5.96 3.44zm.82-7.14c-2.6 0-4.22 1.18-4.22 2.92 0 1.62 1.44 2.74 3.76 2.74 2.5 0 4.26-1.54 4.26-3.76v-.66c-.92-.16-1.88-.24-2.8-.24z"/>
  </svg>
);

const BlueskyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 0 1.9 0 5.4c0 1.042.52 7.083.86 8.35.98 3.65 4.54 4.6 7.74 3.95-4.5 1.5-5.7 4.5-2.2 7.8 4.2 3.9 5.6-2.5 5.6-2.5s1.4 6.4 5.6 2.5c3.5-3.3 2.3-6.3-2.2-7.8 3.2.65 6.76-.3 7.74-3.95.34-1.267.86-7.308.86-8.35 0-3.5-2.566-4.39-5.202-2.595C16.046 4.747 13.087 8.686 12 10.8z"/>
  </svg>
);

const SubstackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
);

export interface DestinationPiece {
  id: string;
  category: 'newsletter' | 'video-long' | 'shorts' | 'stories' | 'written';
  destination: string;
  title: string;
  countLabel: string;
  content: string;
  status: 'draft' | 'approved' | 'published';
  dmAutomationTrigger?: string;
  backlinkUrl?: string;
  icon: React.ReactNode;
}

export interface CampaignRecord {
  id: string;
  timestamp: string;
  dateStr: string;
  title: string;
  sourceText: string;
  totalPieces: number;
  status: 'published' | 'scheduled' | 'draft';
  channels: string[];
  pieces: DestinationPiece[];
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
  const [activeTab, setActiveTab] = useState<'architecture' | 'all-26' | 'vault' | 'video-916' | 'prompts'>('architecture');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);

  // Approval & Autonomous Autopilot State
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false);
  const [isPushingAll, setIsPushingAll] = useState(false);
  const [pushProgress, setPushProgress] = useState(0);
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');

  const videoRef = useRef<HTMLDivElement | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Generate All 26 Finished Pieces across 13 Destinations
  const generate26Pieces = (_text: string, title: string): DestinationPiece[] => {
    const cleanTopic = title.replace(/^Episode #\d+:\s*/i, '') || 'Autonomous AI Systems & Zero-Trust Safeguards';
    const mainBacklink = `https://voxstar.substack.com/p/100-the-century-milestone-autonomous`;

    return [
      // 1. NEWSLETTER (1 Complete Guide)
      {
        id: 'dest-newsletter',
        category: 'newsletter',
        destination: 'Newsletter',
        title: '1 Complete In-Depth Guide & Architecture Breakdown',
        countLabel: '1 complete guide',
        status: 'draft',
        icon: <SubstackIcon size={16} />,
        backlinkUrl: mainBacklink,
        content: `# ${title}\nBy Gene Da Rocha — Voxstar AI Automation\n\n## The Core Thesis\nSingle-prompt chatbots are dead. In 2026, leading organizations are deploying coordinated swarms of autonomous agents with deterministic state controllers.\n\n### 3 Key Pillars Covered in This Guide:\n1. **Supervisor-Worker Swarms**: Decoupling planning from execution.\n2. **Deterministic Software Brakes**: Preventing runaway recursive token loops and unbounded disk writes.\n3. **Cryptographic Intent Tokens**: Gating sensitive actions (payments, database mutations) behind verified policy verifiers.\n\nRead the full interactive breakdown and download the code pack: ${mainBacklink}`
      },

      // 2. YOUTUBE (1 Edited Long Video)
      {
        id: 'dest-youtube-long',
        category: 'video-long',
        destination: 'YouTube',
        title: '1 Edited Long-Form Video Script & Chapters',
        countLabel: '1 edited long video',
        status: 'draft',
        icon: <YoutubeIcon size={16} />,
        backlinkUrl: mainBacklink,
        content: `TITLE: ${title} | Full Blueprint & Production Architecture\n\nTIMESTAMPS:\n00:00 - The Death of Simple Chatbots\n02:15 - Why Probabilistic LLMs Fail Under Production Load\n05:40 - The $100 Runaway Loop Case Study\n09:10 - Deterministic Software Brakes & Circuit Breakers\n14:30 - How to Deploy Supervisor Swarms with 10x ROI\n\nDESCRIPTION & RESOURCES:\nDownload the free code templates and subscribe to the Voxstar Newsletter at: ${mainBacklink}`
      },

      // 3. TIKTOK (Short Video #1)
      {
        id: 'dest-tiktok',
        category: 'shorts',
        destination: 'TikTok',
        title: 'Short Video: Chatbots are Dead (Hook 1)',
        countLabel: 'Short video',
        status: 'draft',
        icon: <TikTokIcon size={16} />,
        content: `[0-3s HOOK]: Stop using ChatGPT like a search engine. Here is the AI breakthrough nobody is talking about.\n\n[NARRATION]: Single chatbots are officially obsolete. Today's top engineers are deploying autonomous agent swarms that plan, code, and execute multi-step operations. But without deterministic circuit breakers, an agent can burn your budget in seconds.\n\n[CTA]: Hit follow and check the bio link for the complete blueprint!`
      },

      // 4. YOUTUBE SHORTS (Short Video #2)
      {
        id: 'dest-yt-shorts',
        category: 'shorts',
        destination: 'YouTube Shorts',
        title: 'Short Video: The $100 Runaway Loop (Hook 2)',
        countLabel: 'Short video',
        status: 'draft',
        icon: <YoutubeIcon size={16} />,
        content: `[0-3s HOOK]: An AI agent just burned $100 in tokens in 45 seconds. Here is why.\n\n[NARRATION]: Natural language system prompts fail when errors cascade. To build real AI automation in 2026, you need hard software brakes that kill runaway loops before they drain your bank account.\n\n[CTA]: Full master guide linked in comments!`
      },

      // 5. THREADS VIDEO (Short Video #3)
      {
        id: 'dest-threads-video',
        category: 'shorts',
        destination: 'Threads Video',
        title: 'Short Video: Autonomous Swarms vs Prompts (Hook 3)',
        countLabel: 'Short video',
        status: 'draft',
        icon: <ThreadsIcon size={16} />,
        content: `[0-3s HOOK]: The difference between amateur AI users and 10x teams.\n\n[NARRATION]: Amateurs type prompts into a chat window. 10x teams orchestrate supervisor-worker agent swarms with human-in-the-loop verification gates.\n\n[CTA]: Comment 'AGENT' and I'll send you the full breakdown!`
      },

      // 6. INSTAGRAM REELS (Short Video #4 + DM Automation)
      {
        id: 'dest-ig-reels',
        category: 'shorts',
        destination: 'Instagram Reels',
        title: 'Short Video: Zero-Trust AI Architecture (DM Automation)',
        countLabel: 'Short video • DM drives to original',
        status: 'draft',
        icon: <InstagramIcon size={16} />,
        dmAutomationTrigger: 'Comment "SWARM" to receive the instant link in DM',
        backlinkUrl: mainBacklink,
        content: `[0-3s HOOK]: If your AI agents don't have circuit breakers, stop running them right now.\n\n[NARRATION]: In this video, we break down why probabilistic LLMs cannot self-regulate and how cryptographic intent tokens protect your production databases.\n\n[CAPTION & DM TRIGGER]:\nWant our complete autonomous agent safeguard checklist?\n👉 Comment 'SWARM' below and my automated assistant will DM you the direct link right now!`
      },

      // 7. FACEBOOK REELS (Short Video #5 + DM Automation)
      {
        id: 'dest-fb-reels',
        category: 'shorts',
        destination: 'Facebook Reels',
        title: 'Short Video: Enterprise AI ROI Blueprint (DM Automation)',
        countLabel: 'Short video • DM drives to original',
        status: 'draft',
        icon: <FacebookIcon size={16} />,
        dmAutomationTrigger: 'Comment "GUIDE" to receive the instant link in DM',
        backlinkUrl: mainBacklink,
        content: `[0-3s HOOK]: The single biggest mistake founders make when automating with AI.\n\n[NARRATION]: You don't need more prompt templates. You need deterministic state controllers that manage agent memory, tool calls, and automated rollbacks.\n\n[CAPTION & DM TRIGGER]:\nDrop the word 'GUIDE' in the comments to get our full breakdown sent to your inbox!`
      },

      // 8. INSTAGRAM / FACEBOOK STORY 1
      {
        id: 'dest-story-1',
        category: 'stories',
        destination: 'Instagram / Facebook Stories (1/2)',
        title: 'Story 1: Behind-the-Scenes & Poll Sticker',
        countLabel: 'Story post • DM drives to original',
        status: 'draft',
        icon: <InstagramIcon size={16} />,
        dmAutomationTrigger: 'Reply "100" to get the link',
        backlinkUrl: mainBacklink,
        content: `STORY 1 GRAPHIC:\nDark luxury background with bold text: "Just dropped Episode #100: The Century Milestone of AI Automation 🚀"\n\nINTERACTIVE STICKER POLL:\n"Are you running autonomous AI swarms yet?"\n🔘 Yes, in production\n🔘 Not yet, still exploring\n\nSTICKER CTA: Reply "100" for the VIP link!`
      },

      // 9. INSTAGRAM / FACEBOOK STORY 2
      {
        id: 'dest-story-2',
        category: 'stories',
        destination: 'Instagram / Facebook Stories (2/2)',
        title: 'Story 2: Key Takeaway Teaser + Link Sticker',
        countLabel: 'Story post • DM drives to original',
        status: 'draft',
        icon: <FacebookIcon size={16} />,
        dmAutomationTrigger: 'Direct Link Sticker',
        backlinkUrl: mainBacklink,
        content: `STORY 2 GRAPHIC:\nHighlight card showcasing: "Rule #1 of 2026 AI: Never trust a prompt to stop a runaway loop. Use software brakes."\n\nDIRECT LINK STICKER: [Read Full Episode #100 ➔]\nURL: ${mainBacklink}`
      },

      // 10. LINKEDIN (1 Written Post)
      {
        id: 'dest-linkedin',
        category: 'written',
        destination: 'LinkedIn',
        title: '1 Written Thought Leadership Post',
        countLabel: '1 written post • Links back',
        status: 'draft',
        icon: <LinkedInIcon size={16} />,
        backlinkUrl: mainBacklink,
        content: `Most leaders still think AI is about asking ChatGPT to write an email.\n\nThey are completely missing the shift.\n\nHere is what is actually happening with ${cleanTopic}:\n\n1. Single-prompt chatbots are dying. Coordinated multi-agent swarms are taking over operations.\n2. Probabilistic LLMs cannot self-regulate. Deterministic software brakes and circuit breakers are now mandatory.\n3. The real ROI isn't drafting text—it's autonomous multi-system execution with human-in-the-loop verification gates.\n\nThe companies winning in 2026 aren't using more prompts.\nThey are building resilient automation architectures.\n\nRead the full guide: ${mainBacklink}\n\n#AIAutomation #EnterpriseAI #AutonomousAgents #Leadership`
      },

      // 11-14. X / TWITTER (4 Short Tweets / Thread)
      {
        id: 'dest-x-1',
        category: 'written',
        destination: 'X (Twitter)',
        title: 'X Post 1/4: The Hook & Paradigm Shift',
        countLabel: '4 short tweets (1/4)',
        status: 'draft',
        icon: <XTwitterIcon size={16} />,
        content: `Single chatbots are dead. Coordinated agent swarms are running real enterprise operations.\n\nIf you don't have deterministic software brakes, you're one error loop away from burning your budget.\n\nHere is how to build resilient AI in 2026 🧵👇`
      },
      {
        id: 'dest-x-2',
        category: 'written',
        destination: 'X (Twitter)',
        title: 'X Post 2/4: The Supervisor-Worker Swarm',
        countLabel: '4 short tweets (2/4)',
        status: 'draft',
        icon: <XTwitterIcon size={16} />,
        content: `Supervisor agents break complex goals into structured sub-tasks.\n\nWorker agents execute code, APIs, and data synthesis in parallel.\n\nA dedicated QA inspector verifies output before anything touches production.`
      },
      {
        id: 'dest-x-3',
        category: 'written',
        destination: 'X (Twitter)',
        title: 'X Post 3/4: Cryptographic Intent Tokens',
        countLabel: '4 short tweets (3/4)',
        status: 'draft',
        icon: <XTwitterIcon size={16} />,
        content: `Never allow an LLM to directly trigger database mutations or financial transactions.\n\nGate high-risk actions behind cryptographically signed intent tokens with immutable audit provenance.`
      },
      {
        id: 'dest-x-4',
        category: 'written',
        destination: 'X (Twitter)',
        title: 'X Post 4/4: Full Guide Link Back',
        countLabel: '4 short tweets (4/4) • Links back',
        status: 'draft',
        icon: <XTwitterIcon size={16} />,
        backlinkUrl: mainBacklink,
        content: `We documented the full architecture, code templates, and safeguards in Episode #100:\n\n👉 ${mainBacklink}\n\nRetweet to share with your engineering team!`
      },

      // 15-18. THREADS (4 Short Posts)
      {
        id: 'dest-threads-1',
        category: 'written',
        destination: 'Threads',
        title: 'Threads Post 1/4: Why Prompts Fail',
        countLabel: '4 short posts (1/4)',
        status: 'draft',
        icon: <ThreadsIcon size={16} />,
        content: `Natural language system prompts are not security guardrails.\n\nWhen edge cases hit, models will hallucinate past your instructions. Hard software limits are non-negotiable.`
      },
      {
        id: 'dest-threads-2',
        category: 'written',
        destination: 'Threads',
        title: 'Threads Post 2/4: The $100 Runaway Loop',
        countLabel: '4 short posts (2/4)',
        status: 'draft',
        icon: <ThreadsIcon size={16} />,
        content: `Dr. Hannah Fry's experimental agent burned $100 in seconds because of an unbounded recursive loop.\n\nAlways enforce strict step ceilings and token velocity throttles.`
      },
      {
        id: 'dest-threads-3',
        category: 'written',
        destination: 'Threads',
        title: 'Threads Post 3/4: Modular Swarm Architecture',
        countLabel: '4 short posts (3/4)',
        status: 'draft',
        icon: <ThreadsIcon size={16} />,
        content: `Decouple planning from execution.\n\nSmall, specialized agents out-perform monolithic prompt monsters 10 times out of 10.`
      },
      {
        id: 'dest-threads-4',
        category: 'written',
        destination: 'Threads',
        title: 'Threads Post 4/4: Substack Link Back',
        countLabel: '4 short posts (4/4) • Links back',
        status: 'draft',
        icon: <ThreadsIcon size={16} />,
        backlinkUrl: mainBacklink,
        content: `Check out our full Episode #100 master broadcast for the complete step-by-step breakdown: ${mainBacklink}`
      },

      // 19-22. BLUESKY (4 Short Posts)
      {
        id: 'dest-bs-1',
        category: 'written',
        destination: 'Bluesky',
        title: 'Bluesky Post 1/4: Open Models & Swarms',
        countLabel: '4 short posts (1/4)',
        status: 'draft',
        icon: <BlueskyIcon size={16} />,
        content: `Open-weights models and local SLMs are rewriting the economics of autonomous agent swarms. You no longer need to pay hyperscale API tax for routine operational subtasks.`
      },
      {
        id: 'dest-bs-2',
        category: 'written',
        destination: 'Bluesky',
        title: 'Bluesky Post 2/4: Deterministic State Brakes',
        countLabel: '4 short posts (2/4)',
        status: 'draft',
        icon: <BlueskyIcon size={16} />,
        content: `Deterministic state machines + probabilistic reasoning = the winning enterprise stack in 2026.`
      },
      {
        id: 'dest-bs-3',
        category: 'written',
        destination: 'Bluesky',
        title: 'Bluesky Post 3/4: Zero-Trust Protocol',
        countLabel: '4 short posts (3/4)',
        status: 'draft',
        icon: <BlueskyIcon size={16} />,
        content: `Every agent tool call should be treated as an untrusted external request until cryptographically signed and validated.`
      },
      {
        id: 'dest-bs-4',
        category: 'written',
        destination: 'Bluesky',
        title: 'Bluesky Post 4/4: Deep Dive Link',
        countLabel: '4 short posts (4/4)',
        status: 'draft',
        icon: <BlueskyIcon size={16} />,
        backlinkUrl: mainBacklink,
        content: `Read the full architectural case study on Voxstar AI: ${mainBacklink}`
      },

      // 23-26. SUBSTACK NOTES & COMMUNITY POSTS (4 Written Posts)
      {
        id: 'dest-sub-1',
        category: 'written',
        destination: 'Substack Notes',
        title: 'Substack Note 1/4: Century Milestone Reflection',
        countLabel: '4 written posts (1/4)',
        status: 'draft',
        icon: <SubstackIcon size={16} />,
        content: `100 episodes of Voxstar AI Automation.\n\nFrom simple GPT-3 prompts to full multi-agent autonomous swarms.\n\nThank you to our community of founders, engineers, and builders.`
      },
      {
        id: 'dest-sub-2',
        category: 'written',
        destination: 'Substack Notes',
        title: 'Substack Note 2/4: Key Takeaways Summary',
        countLabel: '4 written posts (2/4)',
        status: 'draft',
        icon: <SubstackIcon size={16} />,
        content: `If you only remember one thing from Episode #100: Build software-level circuit breakers before you connect any agent to an external tool or database.`
      },
      {
        id: 'dest-sub-3',
        category: 'written',
        destination: 'Substack Notes',
        title: 'Substack Note 3/4: Audio Master Release',
        countLabel: '4 written posts (3/4)',
        status: 'draft',
        icon: <SubstackIcon size={16} />,
        content: `Episode #100 master audio broadcast is live on Spotify, Apple Podcasts, and Voxstar.\n\nMastered at -16 LUFS with full ID3 metadata.`
      },
      {
        id: 'dest-sub-4',
        category: 'written',
        destination: 'Substack Notes',
        title: 'Substack Note 4/4: Direct Article Link',
        countLabel: '4 written posts (4/4) • Links back',
        status: 'draft',
        icon: <SubstackIcon size={16} />,
        backlinkUrl: mainBacklink,
        content: `Catch the full article and code templates right here: ${mainBacklink}`
      }
    ];
  };

  const [currentPieces, setCurrentPieces] = useState<DestinationPiece[]>(() => generate26Pieces(sourceIdea, sourceTitle));

  // Update pieces when source changes
  useEffect(() => {
    setCurrentPieces(generate26Pieces(sourceIdea, sourceTitle));
  }, [sourceIdea, sourceTitle]);

  // Load / Save Vault History from localStorage
  const [vaultRecords, setVaultRecords] = useState<CampaignRecord[]>(() => {
    const saved = localStorage.getItem('voxstar_multiplier_vault');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Seed initial historical campaigns
    return [
      {
        id: 'camp-100',
        timestamp: new Date().toISOString(),
        dateStr: '2026-09-27 11:30',
        title: 'Episode #100: The Century Milestone & Autonomous AI Systems',
        sourceText: PRESET_IDEAS[0].sourceText,
        totalPieces: 26,
        status: 'published',
        channels: ['LinkedIn', 'X', 'YouTube', 'Instagram', 'Facebook', 'TikTok', 'Threads', 'Bluesky', 'Substack'],
        pieces: generate26Pieces(PRESET_IDEAS[0].sourceText, PRESET_IDEAS[0].title)
      },
      {
        id: 'camp-99',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        dateStr: '2026-09-25 09:15',
        title: 'Episode #99: Microsoft Custom AI Silicon & Maia 100 Accelerators',
        sourceText: PRESET_IDEAS[1].sourceText,
        totalPieces: 26,
        status: 'published',
        channels: ['LinkedIn', 'X', 'YouTube', 'Instagram', 'Facebook', 'TikTok', 'Substack'],
        pieces: generate26Pieces(PRESET_IDEAS[1].sourceText, PRESET_IDEAS[1].title)
      },
      {
        id: 'camp-98',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        dateStr: '2026-09-22 14:40',
        title: 'Episode #98: Hannah Fry $100 Runaway AI Agent Case Study',
        sourceText: PRESET_IDEAS[2].sourceText,
        totalPieces: 26,
        status: 'published',
        channels: ['LinkedIn', 'X', 'Instagram', 'Facebook', 'Substack'],
        pieces: generate26Pieces(PRESET_IDEAS[2].sourceText, PRESET_IDEAS[2].title)
      }
    ];
  });

  const saveVault = (records: CampaignRecord[]) => {
    setVaultRecords(records);
    localStorage.setItem('voxstar_multiplier_vault', JSON.stringify(records));
  };

  const handlePieceTextChange = (id: string, newText: string) => {
    setCurrentPieces(prev => prev.map(p => p.id === id ? { ...p, content: newText } : p));
  };

  const handleApproveAndPushSingle = (id: string) => {
    setCurrentPieces(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'published' };
      }
      return p;
    }));
    const target = currentPieces.find(p => p.id === id);
    setPushStatusMsg(`✓ Published to ${target?.destination || 'Channel'} via API/Webhook.`);
    setTimeout(() => setPushStatusMsg(null), 3500);
  };

  const handleApproveAndBlastAll = async () => {
    setIsPushingAll(true);
    setPushProgress(0);
    setPushStatusMsg('Connecting to social channels via API / Webhooks...');

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 250));
      setPushProgress(i);
    }

    // Set all to published
    const updated = currentPieces.map(p => ({ ...p, status: 'published' as const }));
    setCurrentPieces(updated);

    // Save into Vault
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const newRecord: CampaignRecord = {
      id: `camp-${Date.now()}`,
      timestamp: now.toISOString(),
      dateStr,
      title: sourceTitle,
      sourceText: sourceIdea,
      totalPieces: updated.length,
      status: 'published',
      channels: ['LinkedIn', 'X', 'YouTube', 'Instagram', 'Facebook', 'TikTok', 'Threads', 'Bluesky', 'Substack', 'WhatsApp'],
      pieces: updated
    };

    saveVault([newRecord, ...vaultRecords]);
    setIsPushingAll(false);
    setPushStatusMsg(`🚀 All 26 Finished Pieces Approved & Dispatched across 13 Social Channels!`);
  };

  const handleLoadVaultRecord = (rec: CampaignRecord) => {
    setSourceTitle(rec.title);
    setSourceIdea(rec.sourceText);
    setCurrentPieces(rec.pieces);
    setActiveTab('all-26');
    setPushStatusMsg(`Loaded campaign from ${rec.dateStr} (${rec.title}) into Studio.`);
  };

  const handleDeleteVaultRecord = (id: string) => {
    const filtered = vaultRecords.filter(r => r.id !== id);
    saveVault(filtered);
  };

  const filteredPieces = filterCategory === 'all' 
    ? currentPieces 
    : currentPieces.filter(p => p.category === filterCategory);

  const filteredVaultRecords = vaultRecords.filter(r => 
    r.title.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
    r.dateStr.includes(vaultSearchQuery)
  );

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

  const copyAllPiecesAsMarkdown = () => {
    const md = currentPieces.map((p, idx) => `### [${idx + 1}/26] ${p.destination}: ${p.title} (${p.countLabel})\nStatus: ${p.status.toUpperCase()}\n\n${p.content}\n\n${p.dmAutomationTrigger ? `*DM Automation Trigger*: ${p.dmAutomationTrigger}\n` : ''}${p.backlinkUrl ? `*Backlink*: ${p.backlinkUrl}\n` : ''}\n---\n`).join('\n');
    copyToClipboard(md, 'copy-all-26');
  };

  return (
    <div className="content-multiplier-studio animate-fade">
      {/* Screen Help Banner */}
      <ScreenHelpBanner
        screenTitle="Long-Form Multiplication & Social Autopilot (Beat Blotato)"
        subtitle="1 Source Idea ➔ 13 Destinations ➔ 26 Finished Pieces. Human-In-The-Loop Approval with 1-Click Push, Dated Historical Vault Archive, and Full Autonomous Autopilot Mode."
        steps={[
          {
            number: 1,
            title: "Review & Refine 26 Pieces",
            detail: "Inspect or edit the generated newsletter, YouTube script, 5 short videos, 2 stories, and 17 written posts."
          },
          {
            number: 2,
            title: "1-Click Approve & Push",
            detail: "Push individual pieces or blast all 13 destinations simultaneously via connected APIs and Webhooks."
          },
          {
            number: 3,
            title: "Dated Campaign Vault Archive",
            detail: "Keep a persistent, searchable record of all past published campaigns across dates."
          }
        ]}
        proTip="Switch on '⚡ Full Autonomous Autopilot Mode' to automatically ingest new Substack/Podcasts, generate all 26 pieces, and publish on a schedule."
      />

      {/* 1. SOURCE IDEA INPUT HERO & AUTOPILOT CONTROL */}
      <div className="glass-panel multiplier-source-card">
        <div className="source-card-header">
          <div className="flex-align-center gap-2">
            <Zap className="text-amber" size={20} />
            <h3 className="card-title">1. Start with 1 High-Quality Long-Form Piece</h3>
          </div>
          
          <div className="autopilot-toggle-bar">
            <button
              className={`autopilot-switch-btn ${isAutopilotEnabled ? 'enabled' : ''}`}
              onClick={() => setIsAutopilotEnabled(!isAutopilotEnabled)}
              title="Toggle Full Autonomous Autopilot (Auto Ingest -> Auto Multiply -> Auto Push)"
            >
              <Zap size={14} className={isAutopilotEnabled ? 'animate-pulse text-amber' : ''} />
              <span>{isAutopilotEnabled ? '⚡ Autopilot: ACTIVE' : '⚡ Autopilot: OFF (Manual Review)'}</span>
            </button>

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

        {/* 1 -> 26 HERO STAT STRIP & APPROVE ALL BUTTON */}
        <div className="multiplication-hero-badge-strip">
          <div className="hero-1-to-26">
            <span className="num-1">1</span>
            <span className="arrow-green">➔</span>
            <span className="num-26">26</span>
          </div>
          <div className="hero-stat-desc">
            <strong>1 long-form idea becomes 26 published pieces.</strong>
            <p>1 newsletter + 1 edited video + 5 short videos + 2 Stories + 17 written posts.</p>
          </div>
          
          <div className="hero-action-buttons">
            <button 
              className="btn btn-primary approve-blast-btn"
              onClick={handleApproveAndBlastAll}
              disabled={isPushingAll}
            >
              <Send size={15} className={isPushingAll ? 'animate-spin' : ''} />
              <span>{isPushingAll ? `Pushing... (${pushProgress}%)` : '🚀 Approve & Push All 13 Channels'}</span>
            </button>
          </div>
        </div>

        {pushStatusMsg && (
          <div className="push-status-toast animate-fade">
            <CheckCircle2 size={16} className="text-success" />
            <span>{pushStatusMsg}</span>
          </div>
        )}
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="multiplier-tabs-nav">
        <button
          className={`tab-button ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          <Layers size={16} />
          <span>Interactive Architecture Flow (1 ➔ 26)</span>
          <span className="badge-pill">Visual Blueprint</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'all-26' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-26')}
        >
          <Share2 size={16} />
          <span>All 26 Finished Pieces (Review & Push)</span>
          <span className="badge-pill badge-free">26 Ready</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => setActiveTab('vault')}
        >
          <History size={16} />
          <span>Dated Campaign Vault ({vaultRecords.length})</span>
          <span className="badge-pill">Archive</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'video-916' ? 'active' : ''}`}
          onClick={() => setActiveTab('video-916')}
        >
          <Film size={16} />
          <span>9:16 Video & LTX Engine</span>
          <span className="badge-pill badge-free">Free Video</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'prompts' ? 'active' : ''}`}
          onClick={() => setActiveTab('prompts')}
        >
          <Wand2 size={16} />
          <span>Raw Prompts</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE ARCHITECTURE FLOW GRAPH */}
      {activeTab === 'architecture' && (
        <div className="architecture-flow-container animate-fade">
          <div className="architecture-diagram-card glass-panel">
            <div className="diagram-header-bar">
              <span className="diagram-sub-label">1 BECOMES MANY • 13 CHANNELS</span>
              <button 
                className="btn btn-primary btn-sm"
                onClick={copyAllPiecesAsMarkdown}
              >
                {copiedKey === 'copy-all-26' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy All 26 Pieces (.md)
              </button>
            </div>

            {/* FLOW GRAPH NODES */}
            <div className="flow-graph-layout">
              {/* LEFT NODE */}
              <div className="node-box node-source-purple">
                <span className="node-chip">1x</span>
                <span className="node-sub">YOU MAKE</span>
                <h4 className="node-main-title">Long-form piece</h4>
                <p className="node-caption">Newsletter / Podcast / Video</p>
              </div>

              {/* ARROW */}
              <div className="flow-connector-arrow">
                <span className="arrow-head">➔</span>
              </div>

              {/* CENTER NODE */}
              <div className="node-box node-ai-green">
                <span className="node-chip chip-green">AI</span>
                <span className="node-sub">AI REPURPOSES</span>
                <h4 className="node-main-title">One idea ➔ many formats</h4>
                <p className="node-caption">Automated Multiplier Engine</p>
              </div>

              {/* ARROW */}
              <div className="flow-connector-arrow">
                <span className="arrow-head">➔</span>
              </div>

              {/* RIGHT: 13 DESTINATIONS GRID */}
              <div className="destinations-flow-grid">
                <div className="dest-node-card">
                  <div className="dest-icon-badge color-orange"><SubstackIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Newsletter</strong>
                    <span>1 complete guide</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-red"><YoutubeIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>YouTube</strong>
                    <span>1 edited long video</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-pink"><TikTokIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>TikTok</strong>
                    <span>Short video</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-red"><YoutubeIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>YouTube Shorts</strong>
                    <span>Short video</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-white"><ThreadsIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Threads video</strong>
                    <span>Short video</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-blue"><BlueskyIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Bluesky</strong>
                    <span>4 short tweets</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-linkedin"><LinkedInIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>LinkedIn</strong>
                    <span>1 written post • Sometimes links back</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-white"><XTwitterIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>X</strong>
                    <span>4 short tweets • Sometimes links back</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-white"><ThreadsIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Threads</strong>
                    <span>4 short tweets • Sometimes links back</span>
                  </div>
                </div>

                <div className="dest-node-card">
                  <div className="dest-icon-badge color-orange"><SubstackIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Substack</strong>
                    <span>4 written posts • Sometimes links back</span>
                  </div>
                </div>

                <div className="dest-node-card dest-card-dm">
                  <div className="dest-icon-badge color-pink"><InstagramIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Instagram Reels</strong>
                    <span>Short video • DM drives to original</span>
                  </div>
                </div>

                <div className="dest-node-card dest-card-dm">
                  <div className="dest-icon-badge color-blue"><FacebookIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Facebook Reels</strong>
                    <span>Short video • DM drives to original</span>
                  </div>
                </div>

                <div className="dest-node-card dest-card-dm dest-span-2">
                  <div className="dest-icon-badge color-gradient"><InstagramIcon size={14} /></div>
                  <div className="dest-node-info">
                    <strong>Instagram / Facebook Stories</strong>
                    <span>2 story posts • DM automation drives to original</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CLOSED LOOP BANNER */}
            <div className="closed-loop-traffic-banner">
              <div className="closed-loop-arrow-line">
                <span className="dot-pulse"></span>
                <span className="loop-text">
                  DM AUTOMATION + SELECTED LINKS DRIVE VIEWERS BACK TO THE ORIGINAL
                </span>
                <span className="arrow-left-head">◄</span>
              </div>
            </div>
          </div>

          {/* 3 PILLARS SUMMARY CARDS */}
          <div className="pillars-grid-row">
            <div className="glass-panel pillar-card">
              <span className="pillar-num">1. TEACH</span>
              <h4>Create 1 Valuable Guide</h4>
              <p>Create 1 valuable guide with unique insights, deep research, and actionable principles.</p>
            </div>
            <div className="glass-panel pillar-card">
              <span className="pillar-num">2. REPURPOSE</span>
              <h4>Rebuild for 13 Channels</h4>
              <p>Rebuild the idea as short videos, long videos, stories, carousels, and written feed posts.</p>
            </div>
            <div className="glass-panel pillar-card">
              <span className="pillar-num">3. SEND PEOPLE BACK</span>
              <h4>Closed-Loop Traffic</h4>
              <p>Instagram & Facebook reels and stories use DM automation to drive viewers back to original long-form piece.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL 26 FINISHED PIECES (REVIEW, EDIT, APPROVE & PUSH) */}
      {activeTab === 'all-26' && (
        <div className="all-26-studio-layout animate-fade">
          <div className="pieces-action-bar glass-panel">
            <div className="category-filter-chips">
              <button 
                className={`filter-chip ${filterCategory === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCategory('all')}
              >
                All 26 Pieces ({currentPieces.length})
              </button>
              <button 
                className={`filter-chip ${filterCategory === 'written' ? 'active' : ''}`}
                onClick={() => setFilterCategory('written')}
              >
                Written Posts (17)
              </button>
              <button 
                className={`filter-chip ${filterCategory === 'shorts' ? 'active' : ''}`}
                onClick={() => setFilterCategory('shorts')}
              >
                Short Videos (5)
              </button>
              <button 
                className={`filter-chip ${filterCategory === 'stories' ? 'active' : ''}`}
                onClick={() => setFilterCategory('stories')}
              >
                Stories (2)
              </button>
              <button 
                className={`filter-chip ${filterCategory === 'newsletter' || filterCategory === 'video-long' ? 'active' : ''}`}
                onClick={() => setFilterCategory('newsletter')}
              >
                Long-Form & Video (2)
              </button>
            </div>

            <div className="flex-align-center gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={copyAllPiecesAsMarkdown}
              >
                {copiedKey === 'copy-all-26' ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                Copy Markdown
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleApproveAndBlastAll}
                disabled={isPushingAll}
              >
                <Send size={14} />
                Approve & Blast All (26)
              </button>
            </div>
          </div>

          <div className="pieces-cards-grid">
            {filteredPieces.map((piece, idx) => (
              <div key={piece.id} className="glass-panel piece-item-card">
                <div className="piece-card-header">
                  <div className="flex-align-center gap-2">
                    <div className="piece-icon-circle">{piece.icon}</div>
                    <div>
                      <div className="flex-align-center gap-2">
                        <span className="piece-index">#{idx + 1}</span>
                        <h4 className="piece-dest-name">{piece.destination}</h4>
                      </div>
                      <span className="piece-count-badge">{piece.countLabel}</span>
                    </div>
                  </div>

                  <div className="flex-align-center gap-1.5">
                    <button
                      className={`btn btn-xs ${piece.status === 'published' ? 'btn-success' : 'btn-primary'}`}
                      onClick={() => handleApproveAndPushSingle(piece.id)}
                    >
                      {piece.status === 'published' ? (
                        <><CheckCircle2 size={12} /> Published</>
                      ) : (
                        <><Send size={12} /> Approve & Push</>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => copyToClipboard(piece.content, piece.id)}
                    >
                      {copiedKey === piece.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      Copy
                    </button>
                  </div>
                </div>

                <div className="piece-content-container">
                  <textarea
                    className="piece-textarea"
                    rows={6}
                    value={piece.content}
                    onChange={(e) => handlePieceTextChange(piece.id, e.target.value)}
                  />
                </div>

                {(piece.dmAutomationTrigger || piece.backlinkUrl) && (
                  <div className="piece-footer-meta">
                    {piece.dmAutomationTrigger && (
                      <span className="dm-trigger-badge">
                        <MessageCircle size={12} /> {piece.dmAutomationTrigger}
                      </span>
                    )}
                    {piece.backlinkUrl && (
                      <span className="backlink-badge">
                        <Globe size={12} /> Backlink Included
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATED CAMPAIGN VAULT ARCHIVE */}
      {activeTab === 'vault' && (
        <div className="vault-studio-layout animate-fade">
          <div className="vault-header-bar glass-panel">
            <div className="vault-search-box">
              <History size={16} className="text-secondary" />
              <input
                type="text"
                className="text-input"
                placeholder="Search past campaigns by date (e.g. 2026-09-27) or keyword..."
                value={vaultSearchQuery}
                onChange={(e) => setVaultSearchQuery(e.target.value)}
              />
            </div>
            <div className="vault-stats-badge">
              <span>{vaultRecords.length} Saved Campaigns Recorded</span>
            </div>
          </div>

          <div className="vault-records-list">
            {filteredVaultRecords.length === 0 ? (
              <div className="glass-panel empty-vault-card">
                <History size={32} className="text-muted" />
                <h4>No campaigns match your search</h4>
                <p>Generate and approve campaigns in the studio to archive them here with timestamped receipts.</p>
              </div>
            ) : (
              filteredVaultRecords.map((rec) => (
                <div key={rec.id} className="glass-panel vault-record-item">
                  <div className="vault-record-main">
                    <div className="vault-record-header">
                      <div className="flex-align-center gap-2">
                        <Clock size={14} className="text-accent" />
                        <span className="vault-date-badge">{rec.dateStr}</span>
                        <span className="vault-status-pill status-published">● {rec.status.toUpperCase()}</span>
                      </div>
                      <span className="vault-pieces-count">{rec.totalPieces} Finished Pieces</span>
                    </div>

                    <h3 className="vault-record-title">{rec.title}</h3>
                    <p className="vault-record-snippet">{rec.sourceText}</p>

                    <div className="vault-channels-row">
                      <span className="text-xs text-muted">Published to:</span>
                      {rec.channels.map(ch => (
                        <span key={ch} className="channel-chip">{ch}</span>
                      ))}
                    </div>
                  </div>

                  <div className="vault-record-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleLoadVaultRecord(rec)}
                    >
                      <Edit3 size={14} />
                      Load In Studio
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const md = rec.pieces.map((p, idx) => `### [${idx + 1}/26] ${p.destination}: ${p.title}\n\n${p.content}\n\n---\n`).join('\n');
                        copyToClipboard(md, `vault-copy-${rec.id}`);
                      }}
                    >
                      {copiedKey === `vault-copy-${rec.id}` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      Copy Pack
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteVaultRecord(rec.id)}
                      title="Delete Campaign Record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: 9:16 VERTICAL VIDEO & LTX ENGINE */}
      {activeTab === 'video-916' && (
        <div className="video-studio-layout animate-fade">
          <div className="glass-panel video-phone-card">
            <div className="phone-wrapper">
              <div className="phone-screen" ref={videoRef}>
                <div className="phone-bg-glow" />

                <div className="phone-top-badge">
                  <Flame size={14} className="text-amber animate-pulse" />
                  <span>VIRAL SHORTS • #100</span>
                </div>

                <div className="phone-center-hook">
                  <span className="hook-pill">EPISODE REVEAL</span>
                  <h2 className="hook-heading">
                    {sourceTitle.replace(/^Episode #\d+:\s*/i, '')}
                  </h2>
                  
                  <div className="karaoke-captions">
                    <span className="caption-word active">Autonomous</span>
                    <span className="caption-word">agent</span>
                    <span className="caption-word">swarms</span>
                    <span className="caption-word">with</span>
                    <span className="caption-word highlight">deterministic</span>
                    <span className="caption-word">brakes.</span>
                  </div>
                </div>

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

                <div className="phone-host-tag">
                  <Radio size={14} className="text-accent" />
                  <span>Gene Da Rocha • Voxstar AI</span>
                </div>
              </div>

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

            <div className="pipeline-step-card">
              <div className="step-header">
                <span className="step-badge">1. Open AI Video (LTX-Video / LTX-2.5)</span>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => copyToClipboard(`Cinematic 9:16 vertical video of futuristic AI command center, glowing holographic charts, smooth slow pan over glowing fiber-optic data streams, neon cyan and amber lighting, 8k 60fps.`, 'ltx-prompt')}
                >
                  {copiedKey === 'ltx-prompt' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  Copy LTX Prompt
                </button>
              </div>
              <p className="step-desc">
                Paste this into free Hugging Face Spaces (LTX-Video / CogVideoX) or run locally on your GPU:
              </p>
              <div className="code-snippet-box">
                <code>Cinematic 9:16 vertical video of futuristic AI command center, glowing holographic charts, smooth slow pan over glowing fiber-optic data streams, neon cyan and amber lighting, 8k 60fps.</code>
              </div>
            </div>

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

            <div className="pipeline-step-card">
              <div className="step-header">
                <span className="step-badge">3. 1-Line FFmpeg Automated Video Render</span>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => copyToClipboard(`ffmpeg -loop 1 -i ep100_social_image.jpg -i Episode_100_Master.mp3 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[bg]; [1:a]showwaves=s=900x240:mode=p2p:colors=0x60a5fa@0.9[wave]; [bg][wave]overlay=(W-w)/2:H-h-350[v]" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k -shortest ep100_vertical_short.mp4`, 'ffmpeg-cmd')}
                >
                  {copiedKey === 'ffmpeg-cmd' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  Copy Terminal Command
                </button>
              </div>
              <p className="step-desc">
                Combines your mastered podcast audio, background visual, moving waveform, and outputs a 1080x1920 MP4:
              </p>
              <div className="code-snippet-box">
                <code>ffmpeg -loop 1 -i ep100_social_image.jpg -i Episode_100_Master.mp3 -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[bg]; [1:a]showwaves=s=900x240:mode=p2p:colors=0x60a5fa@0.9[wave]; [bg][wave]overlay=(W-w)/2:H-h-350[v]" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k -shortest ep100_vertical_short.mp4</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RAW PROMPT TEMPLATES */}
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
