import React, { useState } from 'react';
import { 
  RefreshCw, Plus, Check, Copy, Download, Database, CheckCircle2,
  Sparkles, Shield, Cpu, Tag, Layers, BookOpen
} from 'lucide-react';
import { ScreenHelpBanner } from './ScreenHelpBanner';

// Social & Platform Brand SVG Icons
const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);



const TwitterXIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V5.81a6.33 6.33 0 0 0-4.64.44A6.34 6.34 0 0 0 2.25 12a6.34 6.34 0 0 0 10.83 4.47v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.74-.9z"/>
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.47 1.47 0 1 0 0 2.94 1.47 1.47 0 0 0 0-2.94z"/>
  </svg>
);

const FacebookIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.7 5.65c1.06 0 2.16.19 2.16.19v2.38h-1.22c-1.23 0-1.64.77-1.64 1.55V12h2.69l-.43 3h-2.26v6.8c4.56-.93 8-4.96 8-9.8z"/>
  </svg>
);

export interface VideoQueueItem {
  id: number;
  topic_idea: string;
  target_audience: string;
  soundscape: string;
  video_engine: 'LT25 (Free / Local)' | 'Sundance AI (Fee / Local)' | 'Google Gemini App / Veo';
  cta_type: string;
  scheduled_date: string;
  slot: '9:00 AM' | '12:00 PM' | '5:00 PM';
  status: 'pending' | 'rendering' | 'published';
  stages: {
    ideated: boolean;
    scripted: boolean;
    rendered: boolean;
    published: boolean;
  };
  published_channels?: string[];
}

const INITIAL_QUEUE: VideoQueueItem[] = [
  // DAY 1 (TODAY)
  {
    id: 1,
    topic_idea: "How 40Hz Gamma sound waves boost deep coding focus by 300% without coffee",
    target_audience: "Software Developers & Engineers",
    soundscape: "Gamma Retention Pulse (40Hz)",
    video_engine: "LT25 (Free / Local)",
    cta_type: "Drop DAILY for free setup script",
    scheduled_date: "Today (9:00 AM)",
    slot: "9:00 AM",
    status: "published",
    stages: { ideated: true, scripted: true, rendered: true, published: true },
    published_channels: ["X.com", "YouTube", "LinkedIn Personal", "LinkedIn Company", "Facebook", "TikTok"]
  },
  {
    id: 2,
    topic_idea: "Why traditional white noise fails for ADHD brains and what neuroscience replaces it with",
    target_audience: "ADHD Professionals & Students",
    soundscape: "Alpha Flow Focus (10Hz)",
    video_engine: "Sundance AI (Fee / Local)",
    cta_type: "Visit wiredvibe.ai/adhd for 7-day boost",
    scheduled_date: "Today (12:00 PM)",
    slot: "12:00 PM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  },
  {
    id: 3,
    topic_idea: "The 10-Minute Deep Work Protocol: Binaural soundscapes meet Loop Engineering",
    target_audience: "Founders & Remote Workers",
    soundscape: "Theta Creative Wave (6Hz)",
    video_engine: "Google Gemini App / Veo",
    cta_type: "Comment FOCUS to get prompt bundle",
    scheduled_date: "Today (5:00 PM)",
    slot: "5:00 PM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  },
  // DAY 2 (TOMORROW)
  {
    id: 4,
    topic_idea: "Stop listening to high-tempo Spotify tracks while coding: Neural frequency science",
    target_audience: "Tech Founders & Coders",
    soundscape: "Gamma Retention Pulse (40Hz)",
    video_engine: "LT25 (Free / Local)",
    cta_type: "Get free audio preview at wiredvibe.ai",
    scheduled_date: "Tomorrow (9:00 AM)",
    slot: "9:00 AM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  },
  {
    id: 5,
    topic_idea: "Pomodoro 2.0: Syncing 25-minute sprint cycles with dynamic brainwave entrainment",
    target_audience: "Students & Knowledge Workers",
    soundscape: "Alpha Flow Focus (10Hz)",
    video_engine: "LT25 (Free / Local)",
    cta_type: "Try Wiredvibe timer at wiredvibe.ai",
    scheduled_date: "Tomorrow (12:00 PM)",
    slot: "12:00 PM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  },
  {
    id: 6,
    topic_idea: "Auditory Decoupling for Sleep: How Delta frequencies shut down racing cortisol",
    target_audience: "High-Stress Executives & Creators",
    soundscape: "Delta Deep Recovery (3Hz)",
    video_engine: "Sundance AI (Fee / Local)",
    cta_type: "Stream evening sleep track free",
    scheduled_date: "Tomorrow (5:00 PM)",
    slot: "5:00 PM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  },
  // DAY 3
  {
    id: 7,
    topic_idea: "Exam & Study Memorization: Boosting recall with 10Hz Alpha harmonic acoustic layers",
    target_audience: "University Students & Researchers",
    soundscape: "Alpha Flow Focus (10Hz)",
    video_engine: "LT25 (Free / Local)",
    cta_type: "Download study soundscape pack",
    scheduled_date: "In 2 Days (9:00 AM)",
    slot: "9:00 AM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  },
  {
    id: 8,
    topic_idea: "Vagus Nerve Acoustic Calming: Lowering heart rate before high-stakes pitch meetings",
    target_audience: "Startup Founders & Sales Leads",
    soundscape: "Theta Creative Wave (6Hz)",
    video_engine: "Google Gemini App / Veo",
    cta_type: "Get 3-minute executive reset track",
    scheduled_date: "In 2 Days (12:00 PM)",
    slot: "12:00 PM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  },
  {
    id: 9,
    topic_idea: "Autonomous AI Video Creation: How this video was written, rendered & posted by an AI agent",
    target_audience: "AI Creators & SaaS Builders",
    soundscape: "Cyberpunk Hype Beat",
    video_engine: "Google Gemini App / Veo",
    cta_type: "Grab Automation 1 GitHub repo in bio",
    scheduled_date: "In 2 Days (5:00 PM)",
    slot: "5:00 PM",
    status: "pending",
    stages: { ideated: true, scripted: false, rendered: false, published: false }
  }
];

export interface GeneratedDailyBundle {
  todayIdea: string;
  videoEngine: string;
  aiModel: string;
  videoUrl: string;
  headline: string;
  description: string;
  cta: string;
  hashtags: string[];
  channelsPublished: string[];
}

export interface DailyAutopilotStudioProps {
  initialServiceId?: string;
}

export const DailyAutopilotStudio: React.FC<DailyAutopilotStudioProps> = () => {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'loop-pipeline' | 'database-queue' | 'sales-package'>('loop-pipeline');

  // AI & Engine Selection State
  const [selectedAiModel, setSelectedAiModel] = useState<'Google Gemini 2.5' | 'Anthropic Claude 3.7' | 'OpenAI ChatGPT-4o' | 'xAI Grok 2/3'>('Google Gemini 2.5');
  const [selectedVideoEngine, setSelectedVideoEngine] = useState<'LT25 (Free / Local)' | 'Sundance AI (Fee / Local)' | 'Google Gemini App / Veo'>('LT25 (Free / Local)');

  // Queue State
  const [queueItems, setQueueItems] = useState<VideoQueueItem[]>(INITIAL_QUEUE);
  const [newIdeaTopic, setNewIdeaTopic] = useState('');
  const [newIdeaAudience, setNewIdeaAudience] = useState('Founders & Engineers');
  const [newIdeaCta, setNewIdeaCta] = useState('Visit wiredvibe.ai');

  // Execution State
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [activeBundle, setActiveBundle] = useState<GeneratedDailyBundle | null>({
    todayIdea: "How 40Hz Gamma sound waves boost deep coding focus by 300% without coffee",
    videoEngine: "LT25 (Free / Local)",
    aiModel: "Google Gemini 2.5",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    headline: "⚡ Why ADHD & Deep Coders Use 40Hz Sound Waves to Lock In Flow",
    description: "Most creators lose focus after 20 minutes because background noise scatters cognitive bandwidth. Wiredvibe (wiredvibe.ai) uses calibrated neuroscience soundscapes to lock your brain into alpha and gamma flow states instantly.\n\nCombined with our autonomous Daily Video engine, you get non-stop organic reach without spending hours editing.",
    cta: "👉 Drop 'DAILY' below to get the 5 system prompts & automation script free!",
    hashtags: ["#voxstar", "#voxstar.ai", "#wiredvibeapp", "#atltrust", "#aitoolboard", "#neuroscience", "#deepwork"],
    channelsPublished: ["X.com", "YouTube", "LinkedIn (Gene Da Rocha)", "LinkedIn (Wiredvibeapp)", "Facebook (Wiredvibeapp)", "TikTok"]
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const MANDATORY_TAGS = "#voxstar #voxstar.ai #wiredvibeapp #atltrust #aitoolboard";

  const handleRunNextLoopCycle = () => {
    const pendingItem = queueItems.find(q => q.status === 'pending') || queueItems[0];
    setIsLoopRunning(true);
    setLoopStep(1);

    // Step 1: Ingest (400ms)
    setTimeout(() => {
      setLoopStep(2); // AI Synthesis & Hook Critique
    }, 800);

    // Step 2: Render Video (1600ms)
    setTimeout(() => {
      setLoopStep(3); // Video Render (LT25 / Sundance / Gemini)
    }, 1600);

    // Step 3: Package Metadata & CTA (2400ms)
    setTimeout(() => {
      setLoopStep(4); // Package Metadata & Mandatory Hashtags
    }, 2400);

    // Step 4: 6-Channel Distribution (3200ms)
    setTimeout(() => {
      setLoopStep(5); // Multi-Platform Upload
    }, 3200);

    setTimeout(() => {
      setIsLoopRunning(false);
      setLoopStep(0);

      // Update Queue Status
      setQueueItems(prev => prev.map(item => item.id === pendingItem.id ? {
        ...item,
        status: 'published',
        stages: { ideated: true, scripted: true, rendered: true, published: true },
        published_channels: ["X.com", "YouTube", "LinkedIn Personal", "LinkedIn Company", "Facebook", "TikTok"]
      } : item));

      setActiveBundle({
        todayIdea: pendingItem.topic_idea,
        videoEngine: pendingItem.video_engine,
        aiModel: selectedAiModel,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        headline: `🚀 ${pendingItem.topic_idea.slice(0, 60)}...`,
        description: `Experience the future of auditory focus. Wiredvibe (wiredvibe.ai) uses neuroscience soundscapes engineered to eliminate cognitive resistance.\n\nTargeting ${pendingItem.target_audience} with our autonomous daily loop engine.`,
        cta: `👉 ${pendingItem.cta_type} - claim your 7-day boost!`,
        hashtags: ["#voxstar", "#voxstar.ai", "#wiredvibeapp", "#atltrust", "#aitoolboard", "#aiagent", "#viralvideo"],
        channelsPublished: ["X.com", "YouTube", "LinkedIn (Gene Da Rocha)", "LinkedIn (Wiredvibeapp)", "Facebook (Wiredvibeapp)", "TikTok"]
      });
    }, 4000);
  };

  const handleAddNewIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTopic.trim()) return;

    const newItem: VideoQueueItem = {
      id: Date.now(),
      topic_idea: newIdeaTopic,
      target_audience: newIdeaAudience || "SaaS Creators",
      soundscape: "Gamma Retention Pulse (40Hz)",
      video_engine: selectedVideoEngine,
      cta_type: newIdeaCta || "Visit wiredvibe.ai",
      scheduled_date: "Pending in Queue",
      slot: "9:00 AM",
      status: "pending",
      stages: { ideated: true, scripted: false, rendered: false, published: false }
    };

    setQueueItems(prev => [...prev, newItem]);
    setNewIdeaTopic('');
  };

  const handleRunSpecificItem = (targetItem: VideoQueueItem) => {
    setIsLoopRunning(true);
    setLoopStep(1);

    setTimeout(() => setLoopStep(2), 800);
    setTimeout(() => setLoopStep(3), 1600);
    setTimeout(() => setLoopStep(4), 2400);
    setTimeout(() => setLoopStep(5), 3200);

    setTimeout(() => {
      setIsLoopRunning(false);
      setLoopStep(0);

      setQueueItems(prev => prev.map(item => item.id === targetItem.id ? {
        ...item,
        status: 'published',
        stages: { ideated: true, scripted: true, rendered: true, published: true },
        published_channels: ["X.com", "YouTube", "LinkedIn Personal", "LinkedIn Company", "Facebook", "TikTok"]
      } : item));

      setActiveBundle({
        todayIdea: targetItem.topic_idea,
        videoEngine: targetItem.video_engine,
        aiModel: selectedAiModel,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        headline: `🚀 ${targetItem.topic_idea.slice(0, 60)}...`,
        description: `Experience the future of auditory focus. Wiredvibe (wiredvibe.ai) uses neuroscience soundscapes engineered to eliminate cognitive resistance.\n\nTargeting ${targetItem.target_audience} with our autonomous daily loop engine.`,
        cta: `👉 ${targetItem.cta_type} - claim your 7-day boost!`,
        hashtags: ["#voxstar", "#voxstar.ai", "#wiredvibeapp", "#atltrust", "#aitoolboard", "#aiagent", "#viralvideo"],
        channelsPublished: ["X.com", "YouTube", "LinkedIn (Gene Da Rocha)", "LinkedIn (Wiredvibeapp)", "Facebook (Wiredvibeapp)", "TikTok"]
      });
      setActiveSubTab('loop-pipeline');
    }, 4000);
  };

  const handleExportCsv = () => {
    const headers = "id,slot,topic_idea,target_audience,soundscape,video_engine,cta_type,scheduled_date,status\n";
    const rows = queueItems.map(q => 
      `${q.id},"${q.slot}","${q.topic_idea}","${q.target_audience}","${q.soundscape}","${q.video_engine}","${q.cta_type}","${q.scheduled_date}","${q.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "video_ideas_queue.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="daily-autopilot-container animate-fade">
      {/* Top Header */}
      <div className="daily-autopilot-header">
        <div className="title-group">
          <div className="title-icon-badge text-glow-primary">
            <RefreshCw size={24} className="text-primary" />
          </div>
          <div>
            <h2>Daily Video Content Engine: Wiredvibeapp Autopilot</h2>
            <p className="subtitle">
              Autonomous Loop Engineering reading from CSV/Database, rendering with LT25/Sundance/Gemini, and syndicating to 6 social platforms with mandatory brand hashtags.
            </p>
          </div>
        </div>

        {/* Action Buttons for Package Downloads */}
        <div className="header-actions flex-center gap-2">
          <a 
            href="/automation1-Video-Content.zip" 
            download="automation1-Video-Content.zip"
            className="btn btn-secondary flex-center gap-2"
            title="Download complete python scripts & database package"
          >
            <Download size={15} />
            <span>automation1-Video-Content.zip</span>
          </a>
          <a 
            href="/Automation1-Daily-Video-Content-FieldGuide.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary flex-center gap-2 text-glow-primary"
            title="Open high-design PDF Field Guide"
          >
            <BookOpen size={15} />
            <span>View PDF Field Guide</span>
          </a>
        </div>
      </div>

      {/* Screen Guide */}
      <ScreenHelpBanner
        screenTitle="Automation 1: Daily Video Content Engine"
        subtitle="This engine executes autonomous daily loop engineering: reading video ideas from a CSV or database queue, synthesizing viral hooks across 4 AI models, rendering via LT25 (free) or Sundance/Gemini, and posting to 6 channels."
        steps={[
          {
            number: 1,
            title: "CSV & Database Queue Ingestion",
            detail: "Manage daily video ideas in the Database Queue table or upload/export CSV lists."
          },
          {
            number: 2,
            title: "Autonomous Loop Engineering",
            detail: "Executes iterative prompt generation, hook curiosity validation, and rendering (LT25 / Sundance / Gemini Veo)."
          },
          {
            number: 3,
            title: "6-Channel Distribution & Mandatory Hashtags",
            detail: "Uploads to X.com, YouTube Shorts, LinkedIn Personal, LinkedIn Company, FB Page & TikTok with #voxstar #voxstar.ai #wiredvibeapp #atltrust #aitoolboard."
          }
        ]}
        proTip="Using LT25 Fast-Render lets you produce 100% free daily video assets locally on your workstation."
        defaultExpanded={false}
      />

      {/* Sub-Navigation Tabs */}
      <div className="autopilot-tabs-nav flex gap-2 mb-4">
        <button 
          className={`tab-btn ${activeSubTab === 'loop-pipeline' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('loop-pipeline')}
        >
          <Sparkles size={16} /> Loop Engineering Pipeline
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'database-queue' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('database-queue')}
        >
          <Database size={16} /> CSV & Database Queue ({queueItems.length} Ideas)
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'sales-package' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('sales-package')}
        >
          <Shield size={16} /> Private GitHub Repo & Pricing Matrix
        </button>
      </div>

      {/* TAB 1: PIPELINE RUNNER */}
      {activeSubTab === 'loop-pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Engine Config & Trigger */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="glass-panel studio-card">
              <div className="card-header">
                <Cpu size={18} className="text-primary" />
                <h3>Engine & Model Configuration</h3>
              </div>
              <div className="card-body flex flex-col gap-4">
                {/* AI Model Selector */}
                <div className="form-group">
                  <label className="form-label">AI Synthesis Model</label>
                  <select 
                    className="input-field"
                    value={selectedAiModel}
                    onChange={(e: any) => setSelectedAiModel(e.target.value)}
                    disabled={isLoopRunning}
                  >
                    <option value="Google Gemini 2.5">Google Gemini 2.5 Flash / Pro (Veo Native)</option>
                    <option value="Anthropic Claude 3.7">Anthropic Claude 3.7 Sonnet (High Retention Copy)</option>
                    <option value="OpenAI ChatGPT-4o">OpenAI ChatGPT-4o (Structured JSON Mode)</option>
                    <option value="xAI Grok 2/3">xAI Grok 2 / 3 (Viral Contrarian Hooks)</option>
                  </select>
                </div>

                {/* Video Render Engine Selector */}
                <div className="form-group">
                  <label className="form-label">Video Rendering Engine</label>
                  <select 
                    className="input-field"
                    value={selectedVideoEngine}
                    onChange={(e: any) => setSelectedVideoEngine(e.target.value)}
                    disabled={isLoopRunning}
                  >
                    <option value="LT25 (Free / Local)">LT25 Fast-Render (100% Free / Local GPU)</option>
                    <option value="Sundance AI (Fee / Local)">Sundance AI (Cinematic 4K • Fee / Local)</option>
                    <option value="Google Gemini App / Veo">Google Gemini App & Veo 2 (Cloud Generative)</option>
                  </select>
                </div>

                {/* Next Pending Idea Preview */}
                <div className="card-box bg-slate-900/60 border border-slate-700/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                    <span>NEXT IDEA IN QUEUE (CSV/DB)</span>
                    <span className="badge badge-warning">Pending</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    {queueItems.find(q => q.status === 'pending')?.topic_idea || "All queued ideas published! Add more in Database tab."}
                  </p>
                </div>

                {/* Mandatory Hashtags Notice */}
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs">
                  <div className="flex items-center gap-1 font-bold text-indigo-300 mb-1">
                    <Tag size={13} /> Mandatory Brand Hashtags:
                  </div>
                  <code className="text-primary text-[11px] block break-words">
                    {MANDATORY_TAGS}
                  </code>
                </div>

                {/* Run Loop Button */}
                <button 
                  className={`btn btn-primary w-full py-3 text-base flex-center gap-2 ${isLoopRunning ? 'loading' : ''}`}
                  onClick={handleRunNextLoopCycle}
                  disabled={isLoopRunning}
                >
                  <RefreshCw size={18} className={isLoopRunning ? 'animate-spin' : ''} />
                  <span>{isLoopRunning ? 'Executing 5-Step Loop Cycle...' : 'Run Next Video Loop Cycle Now'}</span>
                </button>
              </div>
            </div>

            {/* Loop Steps Progress Visualizer */}
            <div className="glass-panel studio-card">
              <div className="card-header">
                <Layers size={18} className="text-accent" />
                <h3>Loop Engineering State Machine</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-col gap-2">
                  <div className={`p-2 rounded border flex items-center justify-between text-xs ${loopStep >= 1 ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200' : 'bg-slate-900/20 border-slate-800 text-slate-500'}`}>
                    <span>1. Ingest Pending Idea from CSV / DB Queue</span>
                    {loopStep > 1 ? <Check size={14} className="text-emerald-400" /> : loopStep === 1 ? <RefreshCw size={14} className="animate-spin text-accent" /> : <span>Waiting</span>}
                  </div>
                  <div className={`p-2 rounded border flex items-center justify-between text-xs ${loopStep >= 2 ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200' : 'bg-slate-900/20 border-slate-800 text-slate-500'}`}>
                    <span>2. AI 3-Pass Prompt Synthesis & Critique ({selectedAiModel})</span>
                    {loopStep > 2 ? <Check size={14} className="text-emerald-400" /> : loopStep === 2 ? <RefreshCw size={14} className="animate-spin text-accent" /> : <span>Waiting</span>}
                  </div>
                  <div className={`p-2 rounded border flex items-center justify-between text-xs ${loopStep >= 3 ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200' : 'bg-slate-900/20 border-slate-800 text-slate-500'}`}>
                    <span>3. Video Frame Rendering ({selectedVideoEngine})</span>
                    {loopStep > 3 ? <Check size={14} className="text-emerald-400" /> : loopStep === 3 ? <RefreshCw size={14} className="animate-spin text-accent" /> : <span>Waiting</span>}
                  </div>
                  <div className={`p-2 rounded border flex items-center justify-between text-xs ${loopStep >= 4 ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200' : 'bg-slate-900/20 border-slate-800 text-slate-500'}`}>
                    <span>4. Package Viral Headline, CTA & Brand Tags</span>
                    {loopStep > 4 ? <Check size={14} className="text-emerald-400" /> : loopStep === 4 ? <RefreshCw size={14} className="animate-spin text-accent" /> : <span>Waiting</span>}
                  </div>
                  <div className={`p-2 rounded border flex items-center justify-between text-xs ${loopStep >= 5 ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200' : 'bg-slate-900/20 border-slate-800 text-slate-500'}`}>
                    <span>5. Broadcast to 6 Social Channels</span>
                    {loopStep === 5 ? <RefreshCw size={14} className="animate-spin text-accent" /> : loopStep > 5 ? <Check size={14} className="text-emerald-400" /> : <span>Waiting</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Channel Post Preview */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {activeBundle && (
              <div className="glass-panel studio-card border-primary/40">
                <div className="card-header flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <h3>Daily Video Bundle Output (Published Live)</h3>
                  </div>
                  <span className="badge badge-success text-xs">Loop Completed</span>
                </div>

                <div className="card-body flex flex-col gap-4">
                  {/* Video & Hook Headline */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-primary font-mono mb-1">VIRAL HOOK HEADLINE</div>
                        <h4 className="text-base font-bold text-white leading-snug">{activeBundle.headline}</h4>
                      </div>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopy('headline', activeBundle.headline)}
                      >
                        {copiedField === 'headline' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                      {activeBundle.description}
                    </div>

                    <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-xs font-semibold text-emerald-300">
                      CTA: {activeBundle.cta}
                    </div>

                    <div className="mt-2 text-[11px] text-primary break-words">
                      {activeBundle.hashtags.join(' ')}
                    </div>
                  </div>

                  {/* 6-Channel Distribution Matrix */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      6-Channel Syndication Endpoints
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* X.com */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TwitterXIcon size={16} className="text-blue-400" />
                          <div>
                            <div className="text-xs font-bold text-white">X.com (Twitter)</div>
                            <div className="text-[10px] text-slate-400">@wiredvibeapp & @genedarocha</div>
                          </div>
                        </div>
                        <span className="badge badge-success text-[10px]">Posted</span>
                      </div>

                      {/* YouTube Shorts */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <YoutubeIcon size={16} className="text-red-500" />
                          <div>
                            <div className="text-xs font-bold text-white">YouTube Shorts</div>
                            <div className="text-[10px] text-slate-400">Wiredvibe Official Channel</div>
                          </div>
                        </div>
                        <span className="badge badge-success text-[10px]">Uploaded</span>
                      </div>

                      {/* LinkedIn Personal */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LinkedinIcon size={16} className="text-sky-400" />
                          <div>
                            <div className="text-xs font-bold text-white">LinkedIn (Personal)</div>
                            <div className="text-[10px] text-slate-400">Gene Da Rocha Home Profile</div>
                          </div>
                        </div>
                        <span className="badge badge-success text-[10px]">Published</span>
                      </div>

                      {/* LinkedIn Company */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LinkedinIcon size={16} className="text-sky-500" />
                          <div>
                            <div className="text-xs font-bold text-white">LinkedIn (Company)</div>
                            <div className="text-[10px] text-slate-400">Wiredvibeapp Organization</div>
                          </div>
                        </div>
                        <span className="badge badge-success text-[10px]">Published</span>
                      </div>

                      {/* Facebook Company */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FacebookIcon size={16} className="text-blue-500" />
                          <div>
                            <div className="text-xs font-bold text-white">Facebook Page</div>
                            <div className="text-[10px] text-slate-400">Wiredvibeapp Official Page</div>
                          </div>
                        </div>
                        <span className="badge badge-success text-[10px]">Live Reel</span>
                      </div>

                      {/* TikTok */}
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TikTokIcon size={16} className="text-cyan-400" />
                          <div>
                            <div className="text-xs font-bold text-white">TikTok</div>
                            <div className="text-[10px] text-slate-400">@wiredvibeapp Creator Login</div>
                          </div>
                        </div>
                        <span className="badge badge-success text-[10px]">FYP Queue</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE & CSV QUEUE TABLE */}
      {activeSubTab === 'database-queue' && (
        <div className="flex flex-col gap-4">
          <div className="glass-panel studio-card">
            <div className="card-header flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-primary" />
                <h3>SQLite & CSV Video Ideas Queue (<code>video_ideas_queue.csv</code>)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary btn-sm flex-center gap-1" onClick={handleExportCsv}>
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Add New Idea Row Form */}
              <form onSubmit={handleAddNewIdea} className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="text-xs text-slate-400 block mb-1">New Video Topic / Concept</label>
                  <input 
                    type="text"
                    className="input-field w-full text-xs"
                    placeholder="e.g. How auditory brain stimulation cuts context-switching..."
                    value={newIdeaTopic}
                    onChange={(e) => setNewIdeaTopic(e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-slate-400 block mb-1">Target Audience</label>
                  <input 
                    type="text"
                    className="input-field w-full text-xs"
                    placeholder="e.g. Developers / ADHD Founders"
                    value={newIdeaAudience}
                    onChange={(e) => setNewIdeaAudience(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">CTA Type</label>
                  <input 
                    type="text"
                    className="input-field w-full text-xs"
                    placeholder="e.g. Visit wiredvibe.ai"
                    value={newIdeaCta}
                    onChange={(e) => setNewIdeaCta(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="btn btn-primary w-full text-xs py-2">
                    <Plus size={14} /> Add to Queue
                  </button>
                </div>
              </form>

              {/* Table of Queue Items */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="p-3">#</th>
                      <th className="p-3">Daily Slot</th>
                      <th className="p-3">Video Topic Idea & Capability</th>
                      <th className="p-3">Target Audience & Audio</th>
                      <th className="p-3">Engine</th>
                      <th className="p-3">Stage Checklist</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                        <td className="p-3 font-mono text-slate-500">#{item.id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                            item.slot === '9:00 AM' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : item.slot === '12:00 PM' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {item.slot === '9:00 AM' ? '☀️ 9:00 AM' : item.slot === '12:00 PM' ? '🌤️ 12:00 PM' : '🌙 5:00 PM'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-200 max-w-xs">
                          <div>{item.topic_idea}</div>
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">CTA: {item.cta_type}</div>
                        </td>
                        <td className="p-3 text-slate-400">
                          <div className="text-slate-300 font-medium">{item.target_audience}</div>
                          <div className="text-[10px] text-accent mt-0.5">🎵 {item.soundscape}</div>
                        </td>
                        <td className="p-3">
                          <span className="badge badge-info text-[10px]">{item.video_engine}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 text-[11px]">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <CheckCircle2 size={12} /> 💡 Ingested
                            </span>
                            <span className={`flex items-center gap-1.5 ${item.stages.scripted ? 'text-emerald-400' : 'text-slate-600'}`}>
                              <CheckCircle2 size={12} /> 🤖 AI Scripted
                            </span>
                            <span className={`flex items-center gap-1.5 ${item.stages.rendered ? 'text-emerald-400' : 'text-slate-600'}`}>
                              <CheckCircle2 size={12} /> 🎬 Video Rendered
                            </span>
                            <span className={`flex items-center gap-1.5 ${item.stages.published ? 'text-emerald-400' : 'text-slate-600'}`}>
                              <CheckCircle2 size={12} /> 📡 6-Channel Live
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`badge ${item.status === 'published' ? 'badge-success' : 'badge-warning'} text-[10px]`}>
                            {item.status === 'published' ? 'Published' : 'Pending Loop'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRunSpecificItem(item)}
                            disabled={isLoopRunning}
                            className="btn btn-secondary btn-sm text-[11px] py-1 px-2.5"
                            title="Run 5-step loop on this topic"
                          >
                            <Sparkles size={11} className="text-accent" />
                            {item.status === 'published' ? 'Re-run Loop' : 'Run Loop'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVATE GITHUB REPO & PRICING MATRIX */}
      {activeSubTab === 'sales-package' && (
        <div className="flex flex-col gap-6">
          <div className="glass-panel studio-card">
            <div className="card-header">
              <Shield size={18} className="text-primary" />
              <h3>Commercial Package: Automation 1 (Video Content Engine)</h3>
            </div>
            <div className="card-body flex flex-col gap-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Packaged ready to push to your private GitHub repository and license directly to creators, agencies, and SaaS founders. Includes complete source code for all 4 LLMs, 3 video engines, 6-channel publishers, and the 12-page Voxstar Field Guide PDF.
              </p>

              {/* Recommended Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Single Creator License</div>
                    <div className="text-2xl font-extrabold text-white my-2">$47 <span className="text-xs text-slate-500 font-normal">one-time</span></div>
                    <ul className="text-xs text-slate-300 flex flex-col gap-1.5 mb-4">
                      <li>✓ Single brand deployment</li>
                      <li>✓ Gemini & Claude scripts</li>
                      <li>✓ LT25 local free video rendering</li>
                      <li>✓ 6-Channel publisher scripts</li>
                    </ul>
                  </div>
                  <span className="badge badge-info text-center py-1">Best for Solo Creators</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border-2 border-primary flex flex-col justify-between shadow-glow">
                  <div>
                    <div className="text-xs font-bold text-primary uppercase">Agency & Commercial License</div>
                    <div className="text-2xl font-extrabold text-white my-2">$149 <span className="text-xs text-slate-500 font-normal">one-time</span></div>
                    <ul className="text-xs text-slate-300 flex flex-col gap-1.5 mb-4">
                      <li>✓ Unlimited client brands</li>
                      <li>✓ All 4 models (Gemini, Claude, GPT, Grok)</li>
                      <li>✓ LT25 + Sundance + Gemini Veo</li>
                      <li>✓ 12-Page Field Guide PDF included</li>
                      <li>✓ Private GitHub repo access</li>
                    </ul>
                  </div>
                  <span className="badge badge-success text-center py-1 font-bold">RECOMMENDED TIER</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-purple-400 uppercase">Enterprise & Lifetime MRR</div>
                    <div className="text-2xl font-extrabold text-white my-2">$397 <span className="text-xs text-slate-500 font-normal">lifetime</span></div>
                    <ul className="text-xs text-slate-300 flex flex-col gap-1.5 mb-4">
                      <li>✓ Full white-label rights</li>
                      <li>✓ All future automation releases (1-10)</li>
                      <li>✓ Dedicated Docker container template</li>
                      <li>✓ 1-on-1 architecture onboarding</li>
                    </ul>
                  </div>
                  <span className="badge badge-warning text-center py-1">Enterprise / High-Ticket</span>
                </div>
              </div>

              {/* High-Converting Sales Copy */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-bold text-primary font-mono">PRODUCT SALES COPY (COPY & PASTE TO GUMROAD / LEMONSQUEEZY)</div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy('sales-copy', `🚀 Stop Spending 4 Hours Every Day Making Video Content.\n\nAutomation 1 is the complete autonomous Daily Video Content Engine built with Loop Engineering.\n\nIt reads video ideas from a CSV or database, renders vertical video assets for $0 locally with LT25 or Sundance, writes viral hooks with Gemini / Claude / ChatGPT / Grok, and automatically uploads to 6 channels (X, YouTube Shorts, LinkedIn Personal & Company, Facebook, TikTok).\n\n📦 What's included:\n- Full Python source code for Gemini, Claude, ChatGPT, Grok\n- SQLite database queue & CSV synchronization\n- 6-Platform auto-publishers\n- 12-Page High-Design Field Guide PDF\n\nGet instant access now and turn on your 24/7 video autopilot!`)}
                  >
                    {copiedField === 'sales-copy' ? <Check size={14} /> : <Copy size={14} />} Copy Sales Copy
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-900/80 p-3 rounded-lg border border-slate-800">
{`🚀 Stop Spending 4 Hours Every Day Making Video Content.

Automation 1 is the complete autonomous Daily Video Content Engine built with Loop Engineering.

It reads video ideas from a CSV or database, renders vertical video assets for $0 locally with LT25 or Sundance, writes viral hooks with Gemini / Claude / ChatGPT / Grok, and automatically uploads to 6 channels (X, YouTube Shorts, LinkedIn Personal & Company, Facebook, TikTok).

📦 What's included:
- Full Python source code for Gemini, Claude, ChatGPT, Grok
- SQLite database queue & CSV synchronization
- 6-Platform auto-publishers
- 12-Page High-Design Field Guide PDF

Get instant access now and turn on your 24/7 video autopilot!`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
