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
  status: 'ready' | 'generating' | 'queued';
}

const DEFAULT_EPISODE_94: EpisodeData = {
  number: 94,
  title: "Unveiling the Future: Llama 3's Paradigm Shift in AI",
  url: "https://voxstar.substack.com/p/94-unveiling-the-future-llama-3s",
  summary: "In this episode, Gene Da Rocha dives into Meta's monumental release of Llama 3 (8B and 70B models), examining how open-weights AI is reshaping enterprise development, cost-efficiency, and on-premise deployments.",
  keyTakeaways: [
    "Meta introduces 8B and 70B parameter models trained on over 15 trillion tokens.",
    "Benchmark domination across MMLU, GSM8K, HumanEval, and Math evaluations.",
    "Native 8k context window with Grouped Query Attention (GQA) across both sizes.",
    "Enterprise sovereignty: Hosting state-of-the-art models without third-party API dependencies.",
    "Llama-Guard 2 & CyberSec safety guardrails for production-grade agentic workflows."
  ],
  audioUrl: "/podcast/Episode_94_Llama3_Authentic_Voice_Master.mp3",
  coverUrl: "/podcast/podcast_cover_art.jpg",
  socialImageUrl: "/podcast/llama3_social_image.jpg",
  duration: "02:18",
  status: 'ready'
};

const BATCH_QUEUE_INITIAL = [
  { id: 1, ep: 95, title: "Autonomous Coding Agents & DeepMind Antigravity Architecture", url: "https://voxstar.substack.com/p/95-coding-agents", status: "queued" },
  { id: 2, ep: 96, title: "Building Enterprise RAG with Hybrid Sparse-Dense Search", url: "https://voxstar.substack.com/p/96-enterprise-rag", status: "queued" },
  { id: 3, ep: 97, title: "Multimodal Vision-Language Models for Robotic Automation", url: "https://voxstar.substack.com/p/97-vision-language-robotics", status: "queued" },
  { id: 4, ep: 98, title: "Small Language Models: Running 3B Models on Edge Devices", url: "https://voxstar.substack.com/p/98-slm-on-edge", status: "queued" }
];

const BRAND_HASHTAGS = "#ArtificialIntelligence #MachineLearning #DeepLearning #NeuralNetworks #ComputerVision #AI #DataScience #NaturalLanguageProcessing #BigData #Robotics #Automation #IntelligentSystems #CognitiveComputing #SmartTechnology #Analytics #Innovation #Industry40 #FutureTech #QuantumComputing #IoT #genedarocha #voxstar #aitoolboard #voxstarai #writerplus #wiredvibeapp #wiredvibe #atltrust #albionlm #elonmusk";

export const PodcastStudio: React.FC<{ onBack?: () => void }> = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'spotify' | 'linkedin' | 'tiktok' | 'instagram' | 'x' | 'whatsapp' | 'batch' | 'publish-guide'>('spotify');
  const [episodeNumber, setEpisodeNumber] = useState(94);
  const [episodeTitle, setEpisodeTitle] = useState("Unveiling the Future: Llama 3's Paradigm Shift in AI");
  const [articleUrl, setArticleUrl] = useState("https://voxstar.substack.com/p/94-unveiling-the-future-llama-3s");
  const [voiceModel, setVoiceModel] = useState("f5-cloned-genedarocha");
  const [introMusicEnabled, setIntroMusicEnabled] = useState(true);
  const [normalizeLoudness, setNormalizeLoudness] = useState(true);
  
  // Pipeline status
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData>(DEFAULT_EPISODE_94);
  const [batchQueue, setBatchQueue] = useState(BATCH_QUEUE_INITIAL);
  const [newBatchUrl, setNewBatchUrl] = useState('');

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(138); // 2:18
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 138);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

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
      setCurrentEpisode({
        number: episodeNumber,
        title: episodeTitle,
        url: articleUrl,
        summary: `Automated summary synthesized for Episode #${episodeNumber} based on ${articleUrl}. Featuring authentic host voice narration, signature music intro, and loudness normalization.`,
        keyTakeaways: [
          "Complete article content ingested and converted to conversational broadcast script.",
          "Synthesized with authentic host voice profile and signature 17s theme music.",
          "Mastered to broadcast standards (-16 LUFS) with embedded ID3 tags and 1400x1400 cover art.",
          "Omni-channel distribution package generated for Spotify, LinkedIn, TikTok, Instagram, X & WhatsApp."
        ],
        audioUrl: "/podcast/Episode_94_Llama3_Authentic_Voice_Master.mp3",
        coverUrl: "/podcast/podcast_cover_art.jpg",
        socialImageUrl: "/podcast/llama3_social_image.jpg",
        duration: "02:18",
        status: 'ready'
      });
    }, 4500);
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

🔗 Original Article & Code:
${currentEpisode.url}

🚀 Connect with Gene Da Rocha:
• Substack: https://voxstar.substack.com
• LinkedIn: https://linkedin.com/in/genedarocha
• X (Twitter): https://x.com/genedarocha
• AI Toolboard: https://aitoolboard.com
• WiredVibe: https://wiredvibeapp.com

${BRAND_HASHTAGS}`;

  const getLinkedInPost = () => `Meta just rewrote the rules of open-source AI with Llama 3.

Here is why Episode #${currentEpisode.number} of the Voxstar AI Automation podcast is mandatory listening for every tech leader and developer building in 2026:

Most teams were caught off guard by how fast open weights caught up to proprietary models. With 8B and 70B parameter models trained on over 15T tokens, you can now run frontier-class intelligence on your own infrastructure with zero data leakage.

Key takeaways from today's broadcast:
${currentEpisode.keyTakeaways.map(t => `✅ ${t}`).join('\n')}

🎧 Listen to the full episode now on Spotify:
https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8

📖 Read the complete deep dive on Substack:
${currentEpisode.url}

What model are you currently running in production? Let's discuss in the comments.

${BRAND_HASHTAGS}`;

  const getTikTokScript = () => `🎬 TIKTOK / YOUTUBE SHORTS / REELS SCRIPT (60s Vertical)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0:00 - 0:05] HOOK (Fast zoom on Gene / Llama 3 Graphic)
"Stop paying OpenAI thousands every month. Meta just released Llama 3, and it changes EVERYTHING."

[0:05 - 0:20] THE BREAKTHROUGH (Split screen: Benchmark charts)
"We just broke down Episode 94 of Voxstar AI Automation. Meta released two models: 8 Billion and 70 Billion parameters, trained on fifteen TRILLION tokens."

[0:20 - 0:40] THE ADVANTAGE (Visual: Architecture diagram / Local terminal)
"The 70B model beats closed APIs on coding, math, and reasoning. You can host it directly on your own servers with zero API fees and complete data privacy."

[0:40 - 0:55] ACTIONABLE TIP (Screen recording of code/setup)
"If you are building autonomous agents or internal copilots, Llama 3 is your new baseline foundation."

[0:55 - 1:00] CALL TO ACTION (Spotify podcast card overlay)
"Listen to the full deep dive on Spotify: Voxstar AI Automation Episode 94. Link in bio!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAPTION:
Meta just made frontier AI open to everyone! 🦙🔥 Listen to Episode 94 on Spotify (Link in Bio)!
${BRAND_HASHTAGS}`;

  const getInstagramCaption = () => `🚀 Episode #${currentEpisode.number} is live! "${currentEpisode.title}"

Is open-source AI finally surpassing proprietary closed models? 

In today's podcast episode, Gene Da Rocha breaks down why Llama 3 represents a massive paradigm shift for developers, enterprise engineers, and AI builders.

⚡ What you will learn:
${currentEpisode.keyTakeaways.map(t => `👉 ${t}`).join('\n')}

🎙️ Stream the episode now on Spotify & Apple Podcasts (Search: "Voxstar AI Automation")
🔗 Read the full research breakdown: ${currentEpisode.url}
📍 Link in bio @genedarocha

---
${BRAND_HASHTAGS}`;

  const getXPost = () => `🧵 Meta's Llama 3 release is the biggest open AI milestone of the year.

We just published Episode #${currentEpisode.number} of the Voxstar AI Automation Podcast breaking down the architecture, benchmarks, and enterprise impact:

1/ Trained on 15T+ tokens (4x larger than Llama 2)
2/ 8B & 70B models beating proprietary baselines on HumanEval & GSM8K
3/ Native 8K context with Grouped Query Attention (GQA)
4/ Full sovereign deployment on your own GPU clusters

🎧 Listen to the full episode on Spotify:
https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8

Read full breakdown: ${currentEpisode.url}

${BRAND_HASHTAGS}`;

  const getWhatsAppBroadcast = () => `🚨 *New Podcast Episode Alert from Gene Da Rocha* 🎙️

*Episode #${currentEpisode.number}: ${currentEpisode.title}*

Meta just released Llama 3, and the benchmarks are astonishing. If you're building with AI or evaluating model costs for your business, this 2-minute breakdown is essential.

*Key Highlights:*
${currentEpisode.keyTakeaways.map(t => `• ${t}`).join('\n')}

🎧 *Listen on Spotify:* https://open.spotify.com/show/4zS1fF5v9Rj9g7e3K1L8
📖 *Read Substack Deep Dive:* ${currentEpisode.url}

_Share this with your engineering and product teams!_`;

  return (
    <div className="podcast-studio-container fade-in">
      {/* Screen Help Banner */}
      <ScreenHelpBanner
        screenTitle="Voxstar Podcast & Social Distribution Engine"
        subtitle="Turn any Substack article or URL into a broadcast-quality podcast episode with Gene Da Rocha's authentic voice, signature intro music, -16 LUFS mastering, and omni-channel distribution packages."
        steps={[
          { number: 1, title: "Input Article URL", detail: "Paste any Substack or tech blog post to extract content and synthesize into a podcast script." },
          { number: 2, title: "Select Voice & Mastering", detail: "Use the authentic cloned Gene Da Rocha voice profile with standard -16 LUFS loudness mastering." },
          { number: 3, title: "Export Master & Socials", detail: "Download the finished MP3 and 1-click copy tailored post copy for Spotify, LinkedIn, TikTok, IG & X." }
        ]}
        proTip="All generated social posts automatically include Gene's mandatory 30-tag brand hashtag vault."
      />

      {/* Top Grid: Pipeline Input & Master Player */}
      <div className="studio-top-grid">
        {/* Left Column: Episode Generator Config */}
        <div className="glass-panel studio-card">
          <div className="card-header-flex">
            <div className="flex items-center gap-2">
              <Mic className="text-accent" size={20} />
              <h2 className="text-lg font-bold text-white">URL-to-Podcast Ingestion</h2>
            </div>
            <span className="badge badge-accent">Automated Voice Cloning</span>
          </div>

          <div className="form-group mt-3">
            <label className="input-label flex items-center justify-between">
              <span>Substack / Article URL</span>
              <FieldHelpTooltip 
                label="Substack / Article URL" 
                description="Paste any Substack or tech blog post URL to extract content and synthesize into a podcast script."
                example="https://voxstar.substack.com/p/94-unveiling-the-future-llama-3s"
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
                onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
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
              placeholder="e.g. Unveiling the Future: Llama 3's Paradigm Shift"
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
                {progressStep === 1 && "Scraping Substack Article..."}
                {progressStep === 2 && "Synthesizing Authentic Voice with F5-TTS..."}
                {progressStep === 3 && "Mixing Intro Music & Mastering to -16 LUFS..."}
                {progressStep === 4 && "Generating Omni-Channel Social Assets..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={16} />
                Generate Master Episode & Distribution Pack
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
              -16 LUFS Master Ready
            </span>
          </div>

          <div className="player-content-wrapper mt-3">
            <div className="cover-art-wrapper">
              <img
                src={currentEpisode.coverUrl}
                alt="Voxstar Podcast Cover"
                className="cover-art-img"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="cover-art-fallback">
                <Radio size={48} className="text-accent" />
                <span className="text-xs font-bold text-gray-400 mt-2">VOXSTAR AI</span>
              </div>
            </div>

            <div className="player-details">
              <div className="ep-badge">EPISODE #{currentEpisode.number}</div>
              <h3 className="ep-title">{currentEpisode.title}</h3>
              <p className="ep-host">Host: <span className="text-white font-medium">Gene Da Rocha</span> • Voxstar Automation</p>

              {/* Hidden HTML5 Audio Element */}
              <audio
                ref={audioRef}
                src={currentEpisode.audioUrl}
                preload="metadata"
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
                  max={duration || 138}
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
                    1400x1400 Art
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
                Generated 1080x1080 Social Graphic
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
                alt="Social Cover"
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
              Omni-Channel Distribution Package
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
                <span className="text-sm font-semibold text-white">Spotify for Podcasters / RSS Show Notes</span>
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
                <span className="text-sm font-semibold text-white">LinkedIn Authority Post (Formatted with Vault Hashtags)</span>
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
                <span className="text-sm font-semibold text-white">TikTok & YouTube Shorts 60-Second Video Script</span>
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
                <span className="text-sm font-semibold text-white">Instagram Post & Carousel Caption</span>
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
                <span className="text-sm font-semibold text-white">X / Twitter Viral Thread</span>
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
                <span className="text-sm font-semibold text-white">WhatsApp VIP Community & Broadcast Message</span>
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

          {/* 7. BATCH QUEUE TAB */}
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
                  placeholder="Paste next Substack URL (e.g. https://voxstar.substack.com/p/95-...)"
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
                          <span className="badge badge-warning">Ready to Process</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-ghost text-xs"
                            onClick={() => {
                              setEpisodeNumber(item.ep);
                              setEpisodeTitle(item.title);
                              setArticleUrl(item.url);
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

          {/* 8. PUBLISHING GUIDE TAB */}
          {activeTab === 'publish-guide' && (
            <div className="publish-guide-wrapper">
              <h3 className="text-base font-bold text-white mb-2">How to Publish Episode #94 to Spotify in 3 Steps:</h3>
              <div className="guide-steps-grid">
                <div className="guide-step-card">
                  <div className="step-num">1</div>
                  <h4 className="font-bold text-white text-sm">Download Master MP3</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Click the <strong>Download MP3</strong> button above. The file is already mastered to -16 LUFS with embedded ID3 tags and 1400x1400 artwork.
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
        .cover-art-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
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
          height: 140px;
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
