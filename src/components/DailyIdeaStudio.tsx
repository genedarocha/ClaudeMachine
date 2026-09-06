import React, { useState } from 'react';
import { 
  Sparkles, Video, Play, Pause, RefreshCw, Send, CheckCircle2, 
  Share2, Tv, Copy, Check, Sliders, Volume2, Flame, Hash
} from 'lucide-react';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';

// Custom Brand Icons for Social Platforms
const YoutubeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TwitterXIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface GeneratedViralVideo {
  id: string;
  prompt: string;
  style: string;
  soundscape: string;
  videoUrl: string;
  thumbnailGradient: string;
  headline: string;
  description: string;
  cta: string;
  hashtags: string[];
  seoScore: number;
}

interface PlatformPublishStatus {
  youtube: 'idle' | 'publishing' | 'published';
  tiktok: 'idle' | 'publishing' | 'published';
  instagram: 'idle' | 'publishing' | 'published';
  twitter: 'idle' | 'publishing' | 'published';
}

interface DailyIdeaStudioProps {
  initialSoundscape?: string;
  onNavigateToWiredvibe?: () => void;
}

export const DailyIdeaStudio: React.FC<DailyIdeaStudioProps> = ({
  initialSoundscape = 'Gamma Retention Pulse',
  onNavigateToWiredvibe
}) => {
  // Input State
  const [prompt, setPrompt] = useState('');
  const [videoStyle, setVideoStyle] = useState('Cyberpunk AI Tech');
  const [soundscape, setSoundscape] = useState(initialSoundscape);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    youtube: true,
    tiktok: true,
    instagram: true,
    twitter: true
  });

  // Pipeline Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedViralVideo | null>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);

  // Publishing State
  const [publishStatus, setPublishStatus] = useState<PlatformPublishStatus>({
    youtube: 'idle',
    tiktok: 'idle',
    instagram: 'idle',
    twitter: 'idle'
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const PIPELINE_STEPS = [
    'Analyzing video concept & hook structure...',
    'Synthesizing AI video frames (Runway Gen-3 Engine)...',
    'Syncing Wiredvibe neuro soundscape audio track...',
    'Engineering viral SEO headline, description & CTA...',
    'Generating platform-specific hashtag lines...',
    'Packaging video bundle for multi-platform distribution...'
  ];

  const handleGenerateVideo = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedVideo(null);
    setPublishStatus({ youtube: 'idle', tiktok: 'idle', instagram: 'idle', twitter: 'idle' });

    // Step progression timer simulation
    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 800);

    setTimeout(() => {
      setIsGenerating(false);
      
      const newVideo: GeneratedViralVideo = {
        id: `vid-${Date.now()}`,
        prompt,
        style: videoStyle,
        soundscape,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailGradient: 'linear-gradient(135deg, #4f46e5, #ec4899, #f59e0b)',
        headline: `🚀 Stop Building Schedulers! This AI Video Agent Automated 12M Views in 28 Days`,
        description: `Most creators spend 4 hours editing and captioning short videos every day. But with AI prompt automation, you drop one raw video idea into the machine and it renders the video, crafts viral hooks, and posts across all platforms automatically!\n\nHere is the exact setup: Wiredvibe audio layer + Claude prompt engineering + 4-platform auto-posting.`,
        cta: `👉 Drop "DAILY" in the comments to get the 5 system prompts & automation script free!`,
        hashtags: [
          '#ViralVideo', '#AIVideoEngine', '#TikTokGrowth', 
          '#YouTubeShorts', '#ReelsViral', '#ContentAutomation', 
          '#TechTok', '#SEOShorts'
        ],
        seoScore: 98
      };
      
      setGeneratedVideo(newVideo);
      setIsPlaying(true);
    }, 4800);
  };

  const handlePublishAll = () => {
    if (!generatedVideo) return;

    setPublishStatus({
      youtube: 'publishing',
      tiktok: 'publishing',
      instagram: 'publishing',
      twitter: 'publishing'
    });

    setTimeout(() => {
      setPublishStatus({
        youtube: 'published',
        tiktok: 'published',
        instagram: 'published',
        twitter: 'published'
      });
    }, 2000);
  };

  const handleCopyText = (fieldKey: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePlatform = (key: keyof typeof selectedPlatforms) => {
    setSelectedPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="daily-idea-container animate-fade">
      {/* Page Header */}
      <div className="daily-idea-header">
        <div className="title-group">
          <div className="title-icon-badge text-glow-accent">
            <Video size={24} className="text-accent" />
          </div>
          <div>
            <h2>Daily Video Idea Studio</h2>
            <p className="subtitle">Transform video concepts into viral AI videos, SEO metadata, and multi-platform social posts.</p>
          </div>
        </div>
      </div>

      {/* Screen Guide */}
      <ScreenHelpBanner
        screenTitle="Viral Video Generator & Auto-Publisher"
        subtitle="Enter any video prompt to automatically synthesize a short video, viral headline, SEO description, CTA, and auto-post to YouTube, TikTok, X, and Instagram."
        steps={[
          {
            number: 1,
            title: "Enter Video Idea / Prompt",
            detail: "Type your topic or concept into the Prompt field. Choose visual style and soundscape track."
          },
          {
            number: 2,
            title: "Generate Viral Video & Metadata",
            detail: "Click 'Generate Viral Video'. The engine renders video frames, crafts high-converting copy, and compiles hashtags."
          },
          {
            number: 3,
            title: "Auto-Publish Across 4 Platforms",
            detail: "Review the platform preview cards and click 'Publish to All 4 Platforms' to post live to YouTube Shorts, TikTok, X, and Instagram."
          }
        ]}
        proTip="Linking a Wiredvibe Gamma retention soundscape increases video completion rates significantly."
        defaultExpanded={false}
      />

      <div className="daily-idea-grid">
        {/* Left Side: Idea Prompt Input Panel */}
        <div className="glass-panel studio-card">
          <div className="card-header">
            <Sparkles size={18} className="text-accent" />
            <h3>Video Concept & Prompt Studio</h3>
          </div>

          <div className="card-body">
            {/* Idea Prompt Field */}
            <div className="form-group">
              <div className="label-with-help">
                <label className="form-label">Video Idea / Prompt Concept</label>
                <FieldHelpTooltip
                  label="Video Idea / Prompt Concept"
                  description="Describe the core topic, hook, product feature, or story for your short video."
                  placeholder="e.g. How an AI agent creates 15 viral video hooks in 10 seconds..."
                  example="A dramatic high-tech breakdown showing how developers automate video editing using AI prompts and Wiredvibe audio."
                  tips={[
                    "Focus on a strong curiosity gap or contrarian statement.",
                    "Mention target audience (e.g. SaaS founders, developers, creators).",
                    "Keep prompt specific for exact visual generation."
                  ]}
                />
              </div>
              <textarea
                rows={5}
                className="input-field prompt-textarea"
                placeholder="e.g., Create a 30-second viral video explaining why standalone video editors are obsolete in 2026. Show code, futuristic AI interface, and high-converting results..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            {/* Video Style Selector */}
            <div className="form-group">
              <div className="label-with-help">
                <label className="form-label">AI Visual Style Engine</label>
                <FieldHelpTooltip
                  label="AI Visual Style Engine"
                  description="Choose the visual rendering aesthetics for the AI video output."
                  placeholder="Cyberpunk / Photorealistic / 3D Animation / Tech Explainer"
                  example="Cyberpunk AI Tech"
                  tips={["Cyberpunk and Tech Explainer styles perform best for software & business tools."]}
                />
              </div>
              <select
                className="input-field"
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value)}
                disabled={isGenerating}
              >
                <option value="Cyberpunk AI Tech">Cyberpunk AI Tech (Glow & Neon)</option>
                <option value="Photorealistic Cinematic">Photorealistic Cinematic Vlog</option>
                <option value="3D High-Gloss Animation">3D High-Gloss Product Render</option>
                <option value="Minimalist Tech Explainer">Minimalist Tech Explainer</option>
                <option value="Viral Meme Aesthetic">Viral High-Pace Meme Style</option>
              </select>
            </div>

            {/* Soundscape Selector */}
            <div className="form-group">
              <div className="label-with-help">
                <label className="form-label">Wiredvibe Soundscape Track</label>
                <FieldHelpTooltip
                  label="Wiredvibe Soundscape Track"
                  description="Neuroscience-tuned audio track applied to the video soundtrack."
                  placeholder="Gamma Retention Pulse / Alpha Flow / Cyberpunk Hype"
                  example="Gamma Retention Pulse"
                  tips={["Click 'Customize in Wiredvibe' to open the audio mixer studio."]}
                />
              </div>
              <div className="soundscape-select-row">
                <select
                  className="input-field"
                  value={soundscape}
                  onChange={(e) => setSoundscape(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="Gamma Retention Pulse">Gamma Retention Pulse (40 Hz - High Retention)</option>
                  <option value="Deep Tech Alpha Flow">Deep Tech Alpha Flow (10 Hz - Focus)</option>
                  <option value="Cyberpunk Hype Beat">Cyberpunk Hype Beat (140 BPM)</option>
                  <option value="Lofi Mind Chill">Lofi Mind Chill (85 BPM)</option>
                </select>
                {onNavigateToWiredvibe && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-tune-sound"
                    onClick={onNavigateToWiredvibe}
                    title="Customize soundscape in Wiredvibe Studio"
                  >
                    <Sliders size={14} />
                    <span>Mix Audio</span>
                  </button>
                )}
              </div>
            </div>

            {/* Platform Selection Checklist */}
            <div className="form-group">
              <div className="label-with-help">
                <label className="form-label">Target Distribution Platforms</label>
                <FieldHelpTooltip
                  label="Target Distribution Platforms"
                  description="Select which platforms this video will be formatted for and auto-published to."
                  placeholder="YouTube, TikTok, Instagram, X"
                  example="All 4 Platforms"
                  tips={["Posting across all 4 platforms maximizes cross-channel reach by 4x."]}
                />
              </div>
              <div className="platform-checkbox-grid">
                <button
                  type="button"
                  className={`platform-chip ${selectedPlatforms.youtube ? 'active' : ''}`}
                  onClick={() => togglePlatform('youtube')}
                >
                  <YoutubeIcon size={14} className="text-red-500" />
                  <span>YouTube Shorts</span>
                </button>

                <button
                  type="button"
                  className={`platform-chip ${selectedPlatforms.tiktok ? 'active' : ''}`}
                  onClick={() => togglePlatform('tiktok')}
                >
                  <Tv size={14} className="text-cyan-400" />
                  <span>TikTok FYP</span>
                </button>

                <button
                  type="button"
                  className={`platform-chip ${selectedPlatforms.instagram ? 'active' : ''}`}
                  onClick={() => togglePlatform('instagram')}
                >
                  <InstagramIcon size={14} className="text-pink-500" />
                  <span>Instagram Reels</span>
                </button>

                <button
                  type="button"
                  className={`platform-chip ${selectedPlatforms.twitter ? 'active' : ''}`}
                  onClick={() => togglePlatform('twitter')}
                >
                  <TwitterXIcon size={14} className="text-blue-400" />
                  <span>X (Twitter)</span>
                </button>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              className="btn btn-primary btn-generate-video"
              onClick={handleGenerateVideo}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Synthesizing Video & Viral SEO...
                </>
              ) : (
                <>
                  <Flame size={18} />
                  Generate Viral Video & Metadata
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Generated Output & Multi-Platform Publisher Workspace */}
        <div className="glass-panel studio-card">
          <div className="card-header">
            <Send size={18} className="text-primary" />
            <h3>Generated AI Video & Multi-Platform Studio</h3>
          </div>

          <div className="card-body">
            {isGenerating && (
              <div className="generation-progress-box animate-fade">
                <div className="loading-bar">
                  <div 
                    className="loading-bar-fill" 
                    style={{ width: `${((generationStep + 1) / PIPELINE_STEPS.length) * 100}%` }} 
                  />
                </div>
                <p className="progress-step-text">
                  <RefreshCw size={14} className="spin text-accent inline-block mr-2" />
                  {PIPELINE_STEPS[generationStep]}
                </p>
              </div>
            )}

            {!isGenerating && !generatedVideo && (
              <div className="empty-video-state">
                <Video size={48} className="text-muted mb-3" />
                <h4>No Video Generated Yet</h4>
                <p className="text-secondary">
                  Enter your video idea prompt on the left and click "Generate Viral Video & Metadata" to create video frames and cross-post automatically.
                </p>
              </div>
            )}

            {generatedVideo && !isGenerating && (
              <div className="generated-video-workspace animate-slide-up">
                {/* Simulated AI Video Player Card */}
                <div className="video-player-card" style={{ background: generatedVideo.thumbnailGradient }}>
                  <div className="video-player-overlay">
                    <div className="player-top-badges">
                      <span className="badge badge-purple">
                        <Flame size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        SEO Score: {generatedVideo.seoScore}/100
                      </span>
                      <span className="badge badge-blue">{generatedVideo.style}</span>
                    </div>

                    <div className="player-center-play">
                      <button 
                        className="player-play-circle" 
                        onClick={() => setIsPlaying(!isPlaying)}
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
                      </button>
                    </div>

                    <div className="player-bottom-bar">
                      <div className="soundtrack-tag">
                        <Volume2 size={12} />
                        <span>Audio: {generatedVideo.soundscape}</span>
                      </div>
                      <span className="video-time">0:30 / 0:30</span>
                    </div>
                  </div>
                </div>

                {/* Viral SEO Metadata Summary */}
                <div className="seo-metadata-box glass-panel">
                  <div className="meta-box-header">
                    <h4>
                      <Flame size={16} className="text-amber" />
                      Viral SEO Copy & Headline
                    </h4>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopyText('all', `${generatedVideo.headline}\n\n${generatedVideo.description}\n\n${generatedVideo.cta}\n\n${generatedVideo.hashtags.join(' ')}`)}
                    >
                      {copiedField === 'all' ? <><Check size={12} /> Copied All</> : <><Copy size={12} /> Copy Package</>}
                    </button>
                  </div>

                  <div className="meta-field-group">
                    <span className="meta-label">Viral Headline / Hook:</span>
                    <p className="meta-value-headline">{generatedVideo.headline}</p>
                  </div>

                  <div className="meta-field-group">
                    <span className="meta-label">Description & Story:</span>
                    <p className="meta-value-desc">{generatedVideo.description}</p>
                  </div>

                  <div className="meta-field-group">
                    <span className="meta-label">Call to Action (CTA):</span>
                    <p className="meta-value-cta">{generatedVideo.cta}</p>
                  </div>

                  <div className="meta-field-group">
                    <span className="meta-label">
                      <Hash size={12} className="inline text-accent mr-1" />
                      SEO Hash Lines (Tags):
                    </span>
                    <div className="hashtags-row">
                      {generatedVideo.hashtags.map((tag, i) => (
                        <span key={i} className="hashtag-chip">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4-Platform Multi-Posting Cards */}
                <div className="platform-publishing-section">
                  <div className="section-title-row">
                    <h4>
                      <Share2 size={16} className="text-primary" />
                      Multi-Platform Auto-Publisher
                    </h4>
                    <button className="btn btn-primary btn-publish-all" onClick={handlePublishAll}>
                      <Send size={16} />
                      Publish to All 4 Platforms
                    </button>
                  </div>

                  <div className="platform-preview-grid">
                    {/* YouTube Shorts */}
                    <div className="platform-card youtube-card">
                      <div className="platform-card-header">
                        <YoutubeIcon size={18} className="text-red-500" />
                        <span>YouTube Shorts</span>
                        <span className={`status-pill ${publishStatus.youtube}`}>
                          {publishStatus.youtube === 'published' ? 'Published' : publishStatus.youtube === 'publishing' ? 'Posting...' : 'Ready'}
                        </span>
                      </div>
                      <p className="platform-caption-preview">{generatedVideo.headline}</p>
                      <span className="platform-tag-count">Shorts Format • 9:16</span>
                    </div>

                    {/* TikTok FYP */}
                    <div className="platform-card tiktok-card">
                      <div className="platform-card-header">
                        <Tv size={18} className="text-cyan-400" />
                        <span>TikTok FYP</span>
                        <span className={`status-pill ${publishStatus.tiktok}`}>
                          {publishStatus.tiktok === 'published' ? 'Published' : publishStatus.tiktok === 'publishing' ? 'Posting...' : 'Ready'}
                        </span>
                      </div>
                      <p className="platform-caption-preview">{generatedVideo.description.slice(0, 100)}...</p>
                      <span className="platform-tag-count">Sound: {generatedVideo.soundscape}</span>
                    </div>

                    {/* Instagram Reels */}
                    <div className="platform-card instagram-card">
                      <div className="platform-card-header">
                        <InstagramIcon size={18} className="text-pink-500" />
                        <span>Instagram Reels</span>
                        <span className={`status-pill ${publishStatus.instagram}`}>
                          {publishStatus.instagram === 'published' ? 'Published' : publishStatus.instagram === 'publishing' ? 'Posting...' : 'Ready'}
                        </span>
                      </div>
                      <p className="platform-caption-preview">{generatedVideo.cta}</p>
                      <span className="platform-tag-count">Reels Audio Synced</span>
                    </div>

                    {/* X (Twitter) */}
                    <div className="platform-card twitter-card">
                      <div className="platform-card-header">
                        <TwitterXIcon size={18} className="text-blue-400" />
                        <span>X (Twitter) Video</span>
                        <span className={`status-pill ${publishStatus.twitter}`}>
                          {publishStatus.twitter === 'published' ? 'Published' : publishStatus.twitter === 'publishing' ? 'Posting...' : 'Ready'}
                        </span>
                      </div>
                      <p className="platform-caption-preview">{generatedVideo.headline.slice(0, 80)}... {generatedVideo.cta}</p>
                      <span className="platform-tag-count">Video Post Attached</span>
                    </div>
                  </div>

                  {publishStatus.youtube === 'published' && (
                    <div className="publish-success-alert animate-fade">
                      <CheckCircle2 size={18} className="text-success" />
                      <span>Successfully published viral video across YouTube Shorts, TikTok, Instagram Reels, and X!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
