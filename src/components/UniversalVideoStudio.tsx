import React, { useState } from 'react';
import { 
  Sparkles, Video, Play, Pause, Copy, Check, RefreshCw, 
  Plus, Layers, Cpu, Sliders, Smartphone
} from 'lucide-react';
import { ScreenHelpBanner } from './ScreenHelpBanner';

// Platform Brand SVG Icons
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

const LinkedinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.47 1.47 0 1 0 0 2.94 1.47 1.47 0 0 0 0-2.94z"/>
  </svg>
);

export interface CompanyItem {
  id: string;
  name: string;
  category: string;
  tagline: string;
  problem_solved: string;
  killer_feature: string;
  pricing: string;
  target_audience: string;
  cta_url: string;
  brand_hashtags: string;
}

export interface VideoScene {
  scene_number: number;
  time_range: string;
  duration_sec: number;
  label: string;
  onscreen_text: string;
  narration: string;
  visual_cue: string;
}

const PRESET_COMPANIES: CompanyItem[] = [
  {
    id: 'comp-1',
    name: 'AudioCaster AI',
    category: 'Audio & Podcasting',
    tagline: 'Convert written blogs and newsletters into studio podcasts in 30 seconds',
    problem_solved: 'Creators spend 10+ hours recording and editing voice content manually',
    killer_feature: 'Instant neural voice cloning with natural cadence and Spotify RSS syndication',
    pricing: 'Free Tier / $19 mo',
    target_audience: 'Bloggers, Substack Authors & Content Marketers',
    cta_url: 'https://audiocaster.ai',
    brand_hashtags: '#audiocaster #podcastautomation #contentmarketing #ai'
  },
  {
    id: 'comp-2',
    name: 'WiredVibe',
    category: 'Neuroscience & Deep Work',
    tagline: 'Personalized brainwave soundscapes that boost focus and eliminate ADHD distraction',
    problem_solved: 'White noise and lo-fi beats lose effectiveness after 20 minutes',
    killer_feature: 'Scientifically engineered 40Hz Gamma and Alpha frequencies with visual timers',
    pricing: 'Free Trial / $9 mo',
    target_audience: 'Coders, Founders, ADHD Professionals & Students',
    cta_url: 'https://wiredvibeapp.com',
    brand_hashtags: '#wiredvibe #wiredvibeapp #neuroscience #deepwork #focus'
  },
  {
    id: 'comp-3',
    name: 'AIToolboard',
    category: 'AI Directory & Ecosystem',
    tagline: 'Discover 1,000+ vetted AI tools and autonomous agents before they go viral',
    problem_solved: 'Founders waste hours testing substandard AI tools and overpriced APIs',
    killer_feature: 'Curated benchmark directory with live ROI rankings and real-world workflow guides',
    pricing: 'Free Access',
    target_audience: 'Entrepreneurs, Indie Hackers & Tech Enthusiasts',
    cta_url: 'https://aitoolboard.com',
    brand_hashtags: '#aitoolboard #aitools #futuretech #saas #artificialintelligence'
  },
  {
    id: 'comp-4',
    name: 'WriterPlus',
    category: 'Copywriting & SEO',
    tagline: 'AI copywriting engine that writes 2,500-word ranking articles with zero fluff',
    problem_solved: 'Generic ChatGPT articles get penalized by Google and lack brand voice',
    killer_feature: 'Live SERP analysis with automated internal linking and automated fact-checking',
    pricing: 'Free Trial / $29 mo',
    target_audience: 'SEO Agencies, Affiliate Marketers & Bloggers',
    cta_url: 'https://writerplus.com',
    brand_hashtags: '#writerplus #seo #contentwriting #aiwriting #digitalmarketing'
  },
  {
    id: 'comp-5',
    name: 'Voxstar AI',
    category: 'Enterprise Automation',
    tagline: 'Autonomous multi-agent loops that run marketing and social publishing on autopilot',
    problem_solved: 'Solo founders are trapped manually resizing and posting content across 6 social networks',
    killer_feature: 'Self-refining 5-step loop connecting ingestion, synthesis, rendering, and social broadcast',
    pricing: 'Custom Enterprise',
    target_audience: 'SaaS Founders, Agency Owners & Growth Leads',
    cta_url: 'https://voxstar.ai',
    brand_hashtags: '#voxstar #voxstarai #automation #marketingautomation #solopreneur'
  }
];

const MANDATORY_TAGS = "#voxstar #voxstarai #wiredvibeapp #atltrust #aitoolboard #aitools #futuretech";

export const UniversalVideoStudio: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>(PRESET_COMPANIES);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('comp-3');
  const [videoEngine, setVideoEngine] = useState<'LT25 (Free / Local)' | 'FFmpeg Kinetic (Local)' | 'Sundance AI' | 'Google Gemini App / Veo'>('LT25 (Free / Local)');
  const [voiceActor, setVoiceActor] = useState<string>('Guy Neural (US Male)');
  const [visualTheme, setVisualTheme] = useState<'Cyberpunk Neon' | 'Clean Minimal SaaS' | 'High-Contrast Kinetic' | 'Terminal Matrix'>('Cyberpunk Neon');
  const [activeSocialTab, setActiveSocialTab] = useState<'tiktok' | 'instagram' | 'youtube' | 'linkedin' | 'x'>('tiktok');
  
  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(100);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  // Generate 5-scene 30-second breakdown dynamically
  const scenes: VideoScene[] = [
    {
      scene_number: 1,
      time_range: '0:00 - 0:03',
      duration_sec: 3,
      label: 'Viral Pattern Interrupt',
      onscreen_text: `🚨 STOP WASTING HOURS!\nMeet ${activeCompany.name}`,
      narration: `Stop doing this manually in 2026. This secret AI tool called ${activeCompany.name} changes everything.`,
      visual_cue: 'Fast neon flash, bold kinetic typography, sound wave glitch'
    },
    {
      scene_number: 2,
      time_range: '0:03 - 0:09',
      duration_sec: 6,
      label: 'Pain Point / Problem',
      onscreen_text: `THE PROBLEM:\n${activeCompany.problem_solved.slice(0, 60)}...`,
      narration: `Most creators and founders waste countless hours ${activeCompany.problem_solved.toLowerCase()}.`,
      visual_cue: 'Red warning border, animated countdown timer, frustration graphic'
    },
    {
      scene_number: 3,
      time_range: '0:09 - 0:18',
      duration_sec: 9,
      label: 'Solution & Tool Demo',
      onscreen_text: `MEET ${activeCompany.name.toUpperCase()}:\n${activeCompany.tagline.slice(0, 65)}`,
      narration: `Here is how ${activeCompany.name} fixes it. ${activeCompany.tagline}.`,
      visual_cue: 'Smooth UI pan, glowing feature spotlight, green checkmark accents'
    },
    {
      scene_number: 4,
      time_range: '0:18 - 0:24',
      duration_sec: 6,
      label: 'Killer Superpower',
      onscreen_text: `KILLER FEATURE:\n⚡ ${activeCompany.killer_feature.slice(0, 60)}`,
      narration: `Its killer superpower? ${activeCompany.killer_feature}. Plus it starts with ${activeCompany.pricing}.`,
      visual_cue: 'Purple electric glow, 3D badge flip, high-impact subtitle zoom'
    },
    {
      scene_number: 5,
      time_range: '0:24 - 0:30',
      duration_sec: 6,
      label: 'Call to Action & Link',
      onscreen_text: `TRY IT TODAY:\n👉 ${activeCompany.cta_url.replace('https://', '')}`,
      narration: `Try it today at ${activeCompany.cta_url.replace('https://', '')} or tap the link in bio right now.`,
      visual_cue: 'Pulsing cyan CTA arrow, floating brand logo, website banner'
    }
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateRender = () => {
    setIsGenerating(true);
    setRenderProgress(10);
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const handlePlayPreview = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    setActiveSceneIdx(0);
    
    // Step through 5 scenes over 6 seconds for preview simulation
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < scenes.length) {
        setActiveSceneIdx(current);
      } else {
        clearInterval(interval);
        setIsPlaying(false);
        setActiveSceneIdx(0);
      }
    }, 1500);
  };

  const allHashtags = `${MANDATORY_TAGS} ${activeCompany.brand_hashtags}`.trim();

  // Social Packages Copy
  const tiktokCopy = `🚨 Stop wasting hours doing this manually!\n\nMeet ${activeCompany.name} — ${activeCompany.tagline}\n\n⚡ Superpower: ${activeCompany.killer_feature}\n💰 Pricing: ${activeCompany.pricing}\n\n👉 Link in bio to test it or visit ${activeCompany.cta_url}\n\n${allHashtags}`;
  
  const instagramCopy = `Is this the best AI tool of 2026? 🤔\n\nWe tested ${activeCompany.name} and it completely eliminates ${activeCompany.problem_solved.toLowerCase()}.\n\n🔥 Standout Feature: ${activeCompany.killer_feature}\n\n🔗 Bookmark this reel & tap the link in bio to try it: ${activeCompany.cta_url}\n\n.\n.\n.\n${allHashtags}`;
  
  const youtubeTitle = `${activeCompany.name}: The AI Tool That Automates Your Workflow in 30 Seconds #Shorts`;
  const youtubeDesc = `⚡ Spotlight on ${activeCompany.name} | Curated by AIToolboard & Voxstar AI\n\nSummary: ${activeCompany.tagline}\nProblem Solved: ${activeCompany.problem_solved}\nSuperpower: ${activeCompany.killer_feature}\n\n🔗 Explore ${activeCompany.name} & 1,000+ top AI agents:\n👉 ${activeCompany.cta_url}\n\n🌐 Ecosystem:\n• AIToolboard: https://aitoolboard.com\n• Voxstar: https://voxstar.ai\n• WiredVibe: https://wiredvibeapp.com\n\n${allHashtags} #Shorts #TechReview #AIApps`;

  const linkedinCopy = `🚀 AI Tool Spotlight: ${activeCompany.name}\n\nIf your team is spending hours ${activeCompany.problem_solved.toLowerCase()}, you need to look at ${activeCompany.name}.\n\nWhat it does: ${activeCompany.tagline}\nStandout Capability: ${activeCompany.killer_feature}\n\nCheck out the live directory listing: ${activeCompany.cta_url}\n\n${allHashtags}`;

  return (
    <div className="uv-studio-container">
      <ScreenHelpBanner
        screenTitle="Universal 30-Second Video Factory"
        subtitle="Turn any product, SaaS company, or tool from AIToolboard.com into a viral 30-second vertical video for TikTok, Instagram Reels, and YouTube Shorts with £0 local rendering."
        steps={[
          {
            number: 1,
            title: "Select or Ingest Products",
            detail: "Pick from AIToolboard presets, Voxstar suite, or add any custom SaaS company."
          },
          {
            number: 2,
            title: "Review 5-Scene 30s Structure",
            detail: "Inspect the timed viral hook (0-3s), problem (3-9s), demo (9-18s), feature (18-24s), and CTA (24-30s)."
          },
          {
            number: 3,
            title: "1-Click Multi-Platform Export",
            detail: "Copy tailored copy and hashtags for TikTok, Instagram Reels, and YouTube Shorts."
          }
        ]}
        proTip="Run 'python3 automation1-Video-Content/universal_video_factory.py' for autonomous batch rendering directly from CSV."
      />

      {/* TOP INGESTION & COMPANY SELECTOR BAR */}
      <div className="uv-top-bar">
        <div className="uv-bar-left">
          <div className="uv-bar-icon-wrap">
            <Video size={22} className="uv-accent-icon" />
          </div>
          <div>
            <h2 className="uv-bar-title">30s Video Factory & Social Syndication</h2>
            <p className="uv-bar-subtitle">Universal Product Ingestor • LT25 / Local Engine • £0 API Costs</p>
          </div>
        </div>

        <div className="uv-bar-actions">
          <button 
            className="uv-btn-secondary"
            onClick={() => {
              const newName = prompt("Enter Company / Product Name:");
              if (!newName) return;
              const newComp: CompanyItem = {
                id: `comp-${Date.now()}`,
                name: newName,
                category: "AI SaaS",
                tagline: "Autonomous workflow automation in 30 seconds",
                problem_solved: "Wasting hours on repetitive manual tasks",
                killer_feature: "One-click AI processing with real-time output",
                pricing: "Free Trial",
                target_audience: "Creators & Founders",
                cta_url: `https://${newName.toLowerCase().replace(/\s+/g, '')}.com`,
                brand_hashtags: `#${newName.toLowerCase().replace(/\s+/g, '')} #aitools #saas`
              };
              setCompanies([newComp, ...companies]);
              setActiveCompanyId(newComp.id);
            }}
          >
            <Plus size={15} /> Add Custom Company
          </button>
          <button 
            className="uv-btn-primary"
            onClick={handleSimulateRender}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={15} className="uv-spin" /> Rendering {renderProgress}%
              </>
            ) : (
              <>
                <Sparkles size={15} /> Batch Render (30s MP4)
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPANY DIRECTORY CHIPS */}
      <div className="uv-company-strip">
        <span className="uv-strip-label">Select Company / Tool:</span>
        <div className="uv-chips-scroll">
          {companies.map(comp => (
            <button
              key={comp.id}
              className={`uv-company-chip ${comp.id === activeCompanyId ? 'active' : ''}`}
              onClick={() => setActiveCompanyId(comp.id)}
            >
              <span className="uv-chip-name">{comp.name}</span>
              <span className="uv-chip-cat">{comp.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN 3-COLUMN STUDIO LAYOUT */}
      <div className="uv-main-grid">
        
        {/* COLUMN 1: COMPANY DATA & ENGINE SETTINGS */}
        <div className="uv-card uv-col-config">
          <div className="uv-card-header">
            <Sliders size={18} className="uv-accent-text" />
            <h3>Tool Metadata & Engine</h3>
          </div>

          <div className="uv-form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              value={activeCompany.name}
              onChange={e => {
                const val = e.target.value;
                setCompanies(companies.map(c => c.id === activeCompany.id ? { ...c, name: val } : c));
              }}
            />
          </div>

          <div className="uv-form-group">
            <label>Category & Niche</label>
            <input 
              type="text" 
              value={activeCompany.category}
              onChange={e => {
                const val = e.target.value;
                setCompanies(companies.map(c => c.id === activeCompany.id ? { ...c, category: val } : c));
              }}
            />
          </div>

          <div className="uv-form-group">
            <label>Tagline (One-sentence Value)</label>
            <textarea 
              rows={2}
              value={activeCompany.tagline}
              onChange={e => {
                const val = e.target.value;
                setCompanies(companies.map(c => c.id === activeCompany.id ? { ...c, tagline: val } : c));
              }}
            />
          </div>

          <div className="uv-form-group">
            <label>Problem Solved (Pain Point)</label>
            <textarea 
              rows={2}
              value={activeCompany.problem_solved}
              onChange={e => {
                const val = e.target.value;
                setCompanies(companies.map(c => c.id === activeCompany.id ? { ...c, problem_solved: val } : c));
              }}
            />
          </div>

          <div className="uv-form-group">
            <label>Killer Feature (Superpower)</label>
            <input 
              type="text" 
              value={activeCompany.killer_feature}
              onChange={e => {
                const val = e.target.value;
                setCompanies(companies.map(c => c.id === activeCompany.id ? { ...c, killer_feature: val } : c));
              }}
            />
          </div>

          <div className="uv-form-row">
            <div className="uv-form-group half">
              <label>Pricing Model</label>
              <input 
                type="text" 
                value={activeCompany.pricing}
                onChange={e => {
                  const val = e.target.value;
                  setCompanies(companies.map(c => c.id === activeCompany.id ? { ...c, pricing: val } : c));
                }}
              />
            </div>
            <div className="uv-form-group half">
              <label>CTA URL</label>
              <input 
                type="text" 
                value={activeCompany.cta_url}
                onChange={e => {
                  const val = e.target.value;
                  setCompanies(companies.map(c => c.id === activeCompany.id ? { ...c, cta_url: val } : c));
                }}
              />
            </div>
          </div>

          <div className="uv-divider" />

          {/* ENGINE CONTROLS */}
          <div className="uv-engine-box">
            <div className="uv-engine-title">
              <Cpu size={15} /> Video & Voice Engine
            </div>
            <div className="uv-select-grid">
              <div>
                <span className="uv-sublabel">Render Engine</span>
                <select 
                  value={videoEngine} 
                  onChange={e => setVideoEngine(e.target.value as any)}
                >
                  <option value="LT25 (Free / Local)">LT25 Fast-Render (Free / Local)</option>
                  <option value="FFmpeg Kinetic (Local)">FFmpeg Kinetic Typography (Local)</option>
                  <option value="Sundance AI">Sundance AI (Fee / 4K)</option>
                  <option value="Google Gemini App / Veo">Google Gemini App / Veo</option>
                </select>
              </div>

              <div>
                <span className="uv-sublabel">Voiceover Actor</span>
                <select 
                  value={voiceActor} 
                  onChange={e => setVoiceActor(e.target.value)}
                >
                  <option value="Guy Neural (US Male)">Guy Neural (US Male - High Retention)</option>
                  <option value="Jenny Neural (US Female)">Jenny Neural (US Female - Tech Explainer)</option>
                  <option value="Sonia Neural (UK Female)">Sonia Neural (UK Female - Prestige)</option>
                  <option value="Brian Neural (UK Male)">Brian Neural (UK Male - Authoritative)</option>
                </select>
              </div>

              <div>
                <span className="uv-sublabel">Visual Theme & Aesthetic</span>
                <select 
                  value={visualTheme} 
                  onChange={e => setVisualTheme(e.target.value as any)}
                >
                  <option value="Cyberpunk Neon">Cyberpunk Neon</option>
                  <option value="Clean Minimal SaaS">Clean Minimal SaaS</option>
                  <option value="High-Contrast Kinetic">High-Contrast Kinetic</option>
                  <option value="Terminal Matrix">Terminal Matrix</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: 5-SCENE 30-SECOND STORYBOARD & TIMELINE */}
        <div className="uv-card uv-col-storyboard">
          <div className="uv-card-header">
            <Layers size={18} className="uv-accent-text" />
            <div className="uv-header-flex">
              <h3>30-Second 5-Scene Viral Structure</h3>
              <span className="uv-badge-pill">Strict 30.0s Pacing</span>
            </div>
          </div>

          <div className="uv-scenes-list">
            {scenes.map((scene, idx) => (
              <div 
                key={scene.scene_number}
                className={`uv-scene-card ${idx === activeSceneIdx ? 'active-scene' : ''}`}
                onClick={() => setActiveSceneIdx(idx)}
              >
                <div className="uv-scene-header">
                  <div className="uv-scene-num">
                    Scene {scene.scene_number} • <span className="uv-time-tag">{scene.time_range}</span>
                  </div>
                  <div className="uv-scene-role">{scene.label}</div>
                </div>

                <div className="uv-scene-body">
                  <div className="uv-scene-text-block">
                    <span className="uv-micro-label">On-Screen Overlay Text:</span>
                    <p className="uv-scene-screen-text">{scene.onscreen_text}</p>
                  </div>

                  <div className="uv-scene-text-block">
                    <span className="uv-micro-label">Spoken Voiceover Script:</span>
                    <p className="uv-scene-narration">"{scene.narration}"</p>
                  </div>
                </div>

                <div className="uv-scene-footer">
                  <span className="uv-visual-cue">🎬 Visual: {scene.visual_cue}</span>
                  <span className="uv-duration-tag">{scene.duration_sec}s</span>
                </div>
              </div>
            ))}
          </div>

          <div className="uv-cli-hint">
            <span>💡 Run autonomously via CLI:</span>
            <code>python3 automation1-Video-Content/universal_video_factory.py</code>
          </div>
        </div>

        {/* COLUMN 3: 9:16 VERTICAL SIMULATOR & PLATFORM EXPORT */}
        <div className="uv-card uv-col-preview">
          <div className="uv-card-header">
            <Smartphone size={18} className="uv-accent-text" />
            <h3>9:16 Vertical Preview & Export</h3>
          </div>

          {/* PHONE MOCKUP */}
          <div className="uv-phone-frame">
            <div className="uv-phone-screen">
              {/* Header Badge */}
              <div className="uv-phone-top-badge">
                <span className="uv-brand-glow">⚡ AITOOLBOARD SPOTLIGHT</span>
              </div>

              {/* Center Dynamic Content */}
              <div className="uv-phone-center-card">
                <div className="uv-phone-product-pill">{activeCompany.category}</div>
                <h4 className="uv-phone-product-name">{activeCompany.name}</h4>
                <div className="uv-phone-scene-overlay">
                  <div className="uv-phone-scene-label">
                    {scenes[activeSceneIdx]?.label}
                  </div>
                  <div className="uv-phone-scene-text">
                    {scenes[activeSceneIdx]?.onscreen_text}
                  </div>
                </div>
              </div>

              {/* Subtitle Caption */}
              <div className="uv-phone-subtitles">
                <p>"{scenes[activeSceneIdx]?.narration}"</p>
              </div>

              {/* Bottom CTA Bar */}
              <div className="uv-phone-footer">
                <span className="uv-phone-cta-url">{activeCompany.cta_url.replace('https://', '')}</span>
                <span className="uv-phone-hashtags">#aitoolboard #voxstar</span>
              </div>

              {/* Progress Bar (30s) */}
              <div className="uv-phone-progress-track">
                <div 
                  className="uv-phone-progress-fill" 
                  style={{ width: `${((activeSceneIdx + 1) / scenes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* PREVIEW CONTROLS */}
            <div className="uv-preview-controls">
              <button 
                className="uv-btn-play"
                onClick={handlePlayPreview}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause Preview' : 'Play 30s Simulation'}
              </button>
              <span className="uv-scene-counter">
                Scene {activeSceneIdx + 1} of 5 ({scenes[activeSceneIdx]?.time_range})
              </span>
            </div>
          </div>

          {/* SOCIAL SYNDICATION TABS */}
          <div className="uv-social-hub">
            <div className="uv-social-tab-headers">
              <button 
                className={`uv-tab-btn ${activeSocialTab === 'tiktok' ? 'active' : ''}`}
                onClick={() => setActiveSocialTab('tiktok')}
              >
                <TikTokIcon size={14} /> TikTok
              </button>
              <button 
                className={`uv-tab-btn ${activeSocialTab === 'instagram' ? 'active' : ''}`}
                onClick={() => setActiveSocialTab('instagram')}
              >
                <InstagramIcon size={14} /> Reels
              </button>
              <button 
                className={`uv-tab-btn ${activeSocialTab === 'youtube' ? 'active' : ''}`}
                onClick={() => setActiveSocialTab('youtube')}
              >
                <YoutubeIcon size={14} /> Shorts
              </button>
              <button 
                className={`uv-tab-btn ${activeSocialTab === 'linkedin' ? 'active' : ''}`}
                onClick={() => setActiveSocialTab('linkedin')}
              >
                <LinkedinIcon size={14} /> LinkedIn
              </button>
            </div>

            <div className="uv-social-tab-content">
              {activeSocialTab === 'tiktok' && (
                <div className="uv-social-body">
                  <div className="uv-social-meta">
                    <span className="uv-meta-tag">Optimized TikTok Caption</span>
                    <button 
                      className="uv-btn-copy-mini"
                      onClick={() => handleCopy(tiktokCopy, 'tiktok')}
                    >
                      {copiedKey === 'tiktok' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'tiktok' ? 'Copied!' : 'Copy Caption'}
                    </button>
                  </div>
                  <textarea readOnly rows={5} value={tiktokCopy} />
                </div>
              )}

              {activeSocialTab === 'instagram' && (
                <div className="uv-social-body">
                  <div className="uv-social-meta">
                    <span className="uv-meta-tag">Instagram Reels Copy & Tags</span>
                    <button 
                      className="uv-btn-copy-mini"
                      onClick={() => handleCopy(instagramCopy, 'instagram')}
                    >
                      {copiedKey === 'instagram' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'instagram' ? 'Copied!' : 'Copy Reels'}
                    </button>
                  </div>
                  <textarea readOnly rows={5} value={instagramCopy} />
                </div>
              )}

              {activeSocialTab === 'youtube' && (
                <div className="uv-social-body">
                  <div className="uv-social-meta">
                    <span className="uv-meta-tag">YouTube Shorts Title & Description</span>
                    <button 
                      className="uv-btn-copy-mini"
                      onClick={() => handleCopy(`${youtubeTitle}\n\n${youtubeDesc}`, 'youtube')}
                    >
                      {copiedKey === 'youtube' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'youtube' ? 'Copied!' : 'Copy Shorts'}
                    </button>
                  </div>
                  <div className="uv-yt-title"><strong>Title:</strong> {youtubeTitle}</div>
                  <textarea readOnly rows={4} value={youtubeDesc} />
                </div>
              )}

              {activeSocialTab === 'linkedin' && (
                <div className="uv-social-body">
                  <div className="uv-social-meta">
                    <span className="uv-meta-tag">Thought Leadership Post</span>
                    <button 
                      className="uv-btn-copy-mini"
                      onClick={() => handleCopy(linkedinCopy, 'linkedin')}
                    >
                      {copiedKey === 'linkedin' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'linkedin' ? 'Copied!' : 'Copy Post'}
                    </button>
                  </div>
                  <textarea readOnly rows={5} value={linkedinCopy} />
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .uv-studio-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          color: var(--text-primary, #f8fafc);
          animation: fadeIn 0.3s ease-out;
        }

        .uv-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-bg, #111827);
          border: 1px solid var(--border, #1f2937);
          border-radius: 14px;
          padding: 16px 20px;
        }

        .uv-bar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .uv-bar-icon-wrap {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 10px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .uv-accent-icon {
          color: #818cf8;
        }

        .uv-bar-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .uv-bar-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary, #94a3b8);
          margin: 2px 0 0 0;
        }

        .uv-bar-actions {
          display: flex;
          gap: 10px;
        }

        .uv-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border: none;
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s ease;
        }

        .uv-btn-primary:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .uv-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .uv-btn-secondary {
          background: var(--bg-secondary, #1f2937);
          color: var(--text-primary, #f8fafc);
          border: 1px solid var(--border, #374151);
          padding: 9px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .uv-btn-secondary:hover {
          background: #374151;
        }

        .uv-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* COMPANY CHIPS STRIP */
        .uv-company-strip {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid var(--border, #1f2937);
          border-radius: 12px;
          padding: 10px 16px;
          overflow-x: auto;
        }

        .uv-strip-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
          white-space: nowrap;
        }

        .uv-chips-scroll {
          display: flex;
          gap: 8px;
        }

        .uv-company-chip {
          background: var(--bg-secondary, #1f2937);
          border: 1px solid var(--border, #374151);
          border-radius: 20px;
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .uv-company-chip:hover {
          border-color: #6366f1;
        }

        .uv-company-chip.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: #818cf8;
        }

        .uv-chip-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #ffffff;
        }

        .uv-chip-cat {
          font-size: 0.7rem;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 10px;
        }

        /* MAIN GRID */
        .uv-main-grid {
          display: grid;
          grid-template-columns: 320px 1fr 340px;
          gap: 20px;
        }

        .uv-card {
          background: var(--card-bg, #111827);
          border: 1px solid var(--border, #1f2937);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .uv-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border, #1f2937);
          padding-bottom: 12px;
        }

        .uv-card-header h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .uv-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .uv-accent-text {
          color: #818cf8;
        }

        .uv-badge-pill {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
        }

        /* FORMS */
        .uv-form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .uv-form-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .uv-form-group input,
        .uv-form-group textarea,
        .uv-engine-box select {
          background: var(--bg-primary, #0b0f19);
          border: 1px solid var(--border, #1f2937);
          border-radius: 8px;
          color: #ffffff;
          padding: 8px 10px;
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .uv-form-group input:focus,
        .uv-form-group textarea:focus,
        .uv-engine-box select:focus {
          border-color: #6366f1;
        }

        .uv-form-row {
          display: flex;
          gap: 10px;
        }

        .uv-form-group.half {
          flex: 1;
        }

        .uv-divider {
          height: 1px;
          background: var(--border, #1f2937);
          margin: 4px 0;
        }

        .uv-engine-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .uv-engine-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #818cf8;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .uv-select-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .uv-sublabel {
          display: block;
          font-size: 0.7rem;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        /* SCENES LIST */
        .uv-scenes-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          max-height: 520px;
          padding-right: 4px;
        }

        .uv-scene-card {
          background: var(--bg-primary, #0b0f19);
          border: 1px solid var(--border, #1f2937);
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .uv-scene-card:hover {
          border-color: #4b5563;
        }

        .uv-scene-card.active-scene {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.06);
        }

        .uv-scene-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .uv-scene-num {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
        }

        .uv-time-tag {
          color: #38bdf8;
          font-family: monospace;
        }

        .uv-scene-role {
          font-size: 0.72rem;
          font-weight: 600;
          color: #a855f7;
          background: rgba(168, 85, 247, 0.15);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .uv-scene-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .uv-micro-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .uv-scene-screen-text {
          font-size: 0.82rem;
          color: #e2e8f0;
          font-weight: 600;
          margin: 0;
          white-space: pre-line;
        }

        .uv-scene-narration {
          font-size: 0.8rem;
          color: #94a3b8;
          font-style: italic;
          margin: 0;
        }

        .uv-scene-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 6px;
          margin-top: 2px;
        }

        .uv-visual-cue {
          color: #64748b;
        }

        .uv-duration-tag {
          color: #38bdf8;
          font-weight: 700;
        }

        .uv-cli-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border, #1f2937);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .uv-cli-hint code {
          color: #38bdf8;
          background: #0b0f19;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.72rem;
        }

        /* 9:16 PHONE MOCKUP */
        .uv-phone-frame {
          background: #000000;
          border: 3px solid #334155;
          border-radius: 24px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }

        .uv-phone-screen {
          background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%);
          border-radius: 16px;
          height: 280px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 14px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .uv-phone-top-badge {
          text-align: center;
        }

        .uv-brand-glow {
          font-size: 0.65rem;
          font-weight: 800;
          color: #818cf8;
          letter-spacing: 0.08em;
          background: rgba(99, 102, 241, 0.2);
          padding: 3px 8px;
          border-radius: 8px;
          border: 1px solid rgba(99, 102, 241, 0.4);
        }

        .uv-phone-center-card {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .uv-phone-product-pill {
          font-size: 0.62rem;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 6px;
          border-radius: 6px;
        }

        .uv-phone-product-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .uv-phone-scene-overlay {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 6px 10px;
          margin-top: 4px;
          max-width: 90%;
        }

        .uv-phone-scene-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: #f43f5e;
          text-transform: uppercase;
        }

        .uv-phone-scene-text {
          font-size: 0.75rem;
          color: #ffffff;
          font-weight: 700;
          white-space: pre-line;
        }

        .uv-phone-subtitles {
          text-align: center;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 6px;
          padding: 4px 8px;
        }

        .uv-phone-subtitles p {
          font-size: 0.68rem;
          color: #fef08a;
          margin: 0;
          font-weight: 600;
        }

        .uv-phone-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.6rem;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 4px;
        }

        .uv-phone-cta-url {
          color: #38bdf8;
          font-weight: 700;
        }

        .uv-phone-progress-track {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.15);
        }

        .uv-phone-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #38bdf8);
          transition: width 0.3s ease;
        }

        .uv-preview-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .uv-btn-play {
          background: #1e293b;
          color: #ffffff;
          border: 1px solid #334155;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .uv-btn-play:hover {
          background: #334155;
        }

        .uv-scene-counter {
          font-size: 0.72rem;
          color: #94a3b8;
          font-family: monospace;
        }

        /* SOCIAL HUB */
        .uv-social-hub {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .uv-social-tab-headers {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          background: #0b0f19;
          border: 1px solid var(--border, #1f2937);
          border-radius: 8px;
          padding: 3px;
        }

        .uv-tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 6px 4px;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.15s ease;
        }

        .uv-tab-btn.active {
          background: #1f2937;
          color: #ffffff;
        }

        .uv-social-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .uv-social-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .uv-meta-tag {
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
        }

        .uv-btn-copy-mini {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .uv-btn-copy-mini:hover {
          background: rgba(99, 102, 241, 0.25);
        }

        .uv-social-body textarea {
          background: #0b0f19;
          border: 1px solid var(--border, #1f2937);
          border-radius: 8px;
          color: #e2e8f0;
          padding: 8px;
          font-size: 0.76rem;
          line-height: 1.4;
          resize: none;
          font-family: inherit;
        }

        .uv-yt-title {
          font-size: 0.75rem;
          color: #38bdf8;
          background: #0b0f19;
          border: 1px solid var(--border, #1f2937);
          border-radius: 6px;
          padding: 6px 8px;
        }

        @media (max-width: 1200px) {
          .uv-main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
