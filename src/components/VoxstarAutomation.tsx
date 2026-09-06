import React, { useState, useEffect } from 'react';
import { 
  Zap, Calendar, Upload, Radio, Layers, Tv, Image, 
  Smartphone, Sparkles, Lock, Unlock, Settings, User, 
  Play, ChevronLeft, ChevronRight, RefreshCw, 
  Trash2, AlertCircle, CheckCircle2, Sliders, FileText
} from 'lucide-react';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';

interface PostQueueItem {
  id: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'tiktok';
  account: string;
  caption: string;
  mediaUrl?: string;
  scheduledTime: string;
  status: 'scheduled' | 'publishing' | 'published';
}

const DEFAULT_QUEUE: PostQueueItem[] = [
  {
    id: 'q-1',
    platform: 'linkedin',
    account: 'Gene da Rocha (Profile)',
    caption: 'I was wrong about Facebook, embarrassingly wrong.\n\nMost developers think Facebook is dead. But our latest Voxstar client pipeline just crossed 12M impressions in 28 days with zero ad spend. Here is the exact automation script we used to run it on autopilot.',
    scheduledTime: 'Mon, 9:00 AM (Next Free Slot)',
    status: 'scheduled'
  },
  {
    id: 'q-2',
    platform: 'twitter',
    account: 'Gene da Rocha (@genedarocha)',
    caption: 'Why an AI agent beats a standalone social scheduler in 2026:\n\nSchedulers wait for finished posts. Agents build the posts.\n\nBy wiring Voxstar Connect into Claude, I drop analytics screenshots in chat & let it ship to 7 platforms.',
    scheduledTime: 'Wed, 2:00 PM (Next Free Slot)',
    status: 'scheduled'
  },
  {
    id: 'q-3',
    platform: 'facebook',
    account: 'Voxstar AI (Page)',
    caption: 'Connect your local downloads folder directly to your social publisher. In our latest case study, we demonstrate how Gene da Rocha automates an entire content studio solo using custom MCP tools.',
    scheduledTime: 'Fri, 5:00 PM (Next Free Slot)',
    status: 'scheduled'
  }
];

export const VoxstarAutomation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // --- STATE ---
  const [apiKey, setApiKey] = useState('');
  const [connectorUrl, setConnectorUrl] = useState('mcp.voxstar.ai/mcp');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'ideate' | 'grade' | 'story' | 'carousel' | 'calendar'>('ideate');
  
  // File upload simulator
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: 'screenshot' | 'photo' | 'text'; data: string }[]>([]);
  const [hoveredDropzone, setHoveredDropzone] = useState(false);

  // Connection setup
  useEffect(() => {
    const savedKey = localStorage.getItem('voxstar_secret_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsConnected(true);
    }
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('voxstar_secret_key', apiKey);
      setIsConnected(true);
    } else {
      alert('Please enter a valid Voxstar API Key');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('voxstar_secret_key');
    setApiKey('');
    setIsConnected(false);
  };

  // Pre-packaged assets for dropzone
  const prepackagedAssets = [
    {
      id: 'asset-1',
      name: 'voxstar_metrics.png',
      label: 'Growth Analytics Screenshot',
      type: 'screenshot' as const,
      summary: 'Facebook growth analytics: 12.4M impressions, +240% reach, last 28 days.',
      data: 'Facebook Analytics: 12,482,921 impressions in last 28 days. Reach: +240% growth. Engagement: +180%. Audience: Developer & tech creators.',
      color: 'from-blue-600 to-indigo-800'
    },
    {
      id: 'asset-2',
      name: 'gene_portrait.jpg',
      label: 'Gene Portrait (Selfie)',
      type: 'photo' as const,
      summary: 'High-quality vertical portrait of Gene da Rocha for Instagram Stories.',
      data: 'Vertical portrait photo of Gene da Rocha in modern coding studio context.',
      color: 'from-purple-600 to-pink-700'
    },
    {
      id: 'asset-3',
      name: 'testimonial_scrap.txt',
      label: 'Client Feedback Note',
      type: 'text' as const,
      summary: '"Voxstar Connect cut scheduling time from 4 hours to 10 minutes."',
      data: 'Client slack feedback: "Gene, the automation suite you built for Voxstar literally cut my scheduling time from 4 hours to 10 minutes. Absolute game changer!"',
      color: 'from-emerald-600 to-teal-800'
    }
  ];

  const handleLoadAsset = (asset: typeof prepackagedAssets[0]) => {
    const alreadyLoaded = uploadedFiles.some(f => f.name === asset.name);
    if (alreadyLoaded) return;
    setUploadedFiles(prev => [...prev, { name: asset.name, type: asset.type, data: asset.data }]);
    
    // Automatically fill inputs in tabs depending on which asset was clicked
    if (asset.type === 'screenshot') {
      setIdeationConcept('Based on ' + asset.name + ': ' + asset.summary);
      setActiveTab('ideate');
    } else if (asset.type === 'photo') {
      setActiveTab('story');
    } else if (asset.type === 'text') {
      setIdeationConcept('Reviewing testimonial scrap: ' + asset.data);
      setActiveTab('ideate');
    }
  };

  // Ideation Coach State
  const [ideationConcept, setIdeationConcept] = useState('');
  const [ideationAudience, setIdeationAudience] = useState('AI Automation Creators');
  const [ideationOffer, setIdeationOffer] = useState('Voxstar Connect Toolset');
  const [ideationOutput, setIdeationOutput] = useState<string | null>(null);
  const [isIdeating, setIsIdeating] = useState(false);
  const [ideationStep, setIdeationStep] = useState('');

  const runIdeationCoach = () => {
    if (!ideationConcept.trim()) return;
    setIsIdeating(true);
    setIdeationOutput(null);
    const steps = [
      'Ingesting raw asset data...',
      'Mapping to Gene da Rocha\'s creator profile...',
      'Structuring angles & hooks for target audience...',
      'Refining outputs...'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index >= steps.length) {
        clearInterval(interval);
        setIsIdeating(false);
        setIdeationStep('');
        setIdeationOutput(`### 🧠 Voxstar Content Coach Recommendations

Here are 3 custom angles formulated from your raw assets, structured for Gene da Rocha's personal brand:

---

#### 📐 Angle 1: The Contrarian Developer Take (Recommended)
* **Hook Idea**: "I was wrong about Facebook, embarrassingly wrong."
* **Context**: Most developers claim Facebook is a dead platform. Use the screenshot showing **12.4M views** to prove that with simple python automation, it is actually the highest yield organic loop.
* **Suggested Structure**: Pain points -> The Data -> The Automated Solution -> Call to Action.

#### 📈 Angle 2: The Workflow Speed Case Study
* **Hook Idea**: "From 4 hours to 10 minutes: how we killed social media busywork."
* **Context**: Focus on the testimonial scrap. Explain how the Voxstar MCP connector lets Claude write, grade, and publish without leaving the command line.
* **Suggested Structure**: Frustration -> Solution -> Proof -> Voxstar Pitch.

#### 💡 Angle 3: The AI Agent Blueprint (Educational)
* **Hook Idea**: "Schedulers wait for posts. AI Agents BUILD them."
* **Context**: Teach readers the difference between Buffer/Hootsuite and a native MCP-driven agent (like Claude). Explain the 5-skill pipeline.

---

> [!TIP]
> **Action Step**: Copy Angle 1's hook idea and paste it into the **Post Grader** tab to refine your copy!`);
        return;
      }
      setIdeationStep(steps[index]);
      index++;
    }, 1000);
  };

  // Post Grader State
  const [graderDraft, setGraderDraft] = useState(
    'I was wrong about Facebook, embarrassingly wrong. People say it is dead, but I got 12.4M views there in 28 days. Schedulers wait for posts, but AI Agents BUILD them - I automate my social media with Voxstar Connect.'
  );
  const [graderRules, setGraderRules] = useState('no em dashes, all numbers as digits, no filler words, no emojis');
  const [graderScore, setGraderScore] = useState<number | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [graderReport, setGraderReport] = useState<string | null>(null);

  const runGrader = () => {
    setIsGrading(true);
    setGraderScore(null);
    setGraderReport(null);

    setTimeout(() => {
      setIsGrading(false);
      setGraderScore(6.3);
      setGraderReport(`### 🔍 Voxstar Rule Compliance Audit:
* **Rule: No Em-Dashes**: ❌ **FAILED** (Found "BUILD them - I automate")
* **Rule: Digits for numbers**:  **PASSED** (Found 12.4M, 28)
* **Rule: No emojis**:  **PASSED** (Zero emojis used)
* **Rule: No filler words**: ❌ **FAILED** (Found filler phrases like "People say it is")

#### 💡 Suggested Fixes:
1. Replace em-dash with a clean paragraph break or period.
2. Remove filler words to tighten the hook hook strength.
3. Optimize formatting for LinkedIn readability (more line breaks).`);
    }, 1500);
  };

  const applyGraderFixes = () => {
    const fixedDraft = `I was wrong about Facebook, embarrassingly wrong.

Most developers claim it is dead. But I got 12.4M views in 28 days.

The secret? Standalone schedulers wait for finished posts. AI agents build them.

I automate the entire flow solo with Voxstar Connect. No agency, no VA. Just code and chat.`;
    setGraderDraft(fixedDraft);
    setGraderScore(8.9);
    setGraderReport(`### 🔍 Voxstar Rule Compliance Audit:
* **Rule: No Em-Dashes**:  **PASSED** (Removed em-dash)
* **Rule: Digits for numbers**:  **PASSED** (Retained 12.4M, 28)
* **Rule: No emojis**:  **PASSED** (Zero emojis used)
* **Rule: No filler words**:  **PASSED** (Draft tightened)

#### 🚀 Virality Score Upgraded: 8.9/10
* **Readability**: Excellent layout for mobile.
* **Hook Strength**: Strong contrarian opening hook.
* **Engaging CTA**: Ready to queue!`);
  };

  // Storysafe Editor State
  const [storyText, setStoryText] = useState('DM me "VOX" to get access');
  const [storyVerticalOffset, setStoryVerticalOffset] = useState(50); // percentage from top (0-100)
  const [isStoryPublished, setIsStoryPublished] = useState(false);
  const [isPublishingStory, setIsPublishingStory] = useState(false);

  // Safe zone evaluation: Top 15% and bottom 20% are danger zones
  const isSafeZoneBreach = storyVerticalOffset < 15 || storyVerticalOffset > 80;

  const publishStory = () => {
    setIsPublishingStory(true);
    setTimeout(() => {
      setIsPublishingStory(false);
      setIsStoryPublished(true);
      setTimeout(() => setIsStoryPublished(false), 3000);
    }, 2000);
  };

  // Nano Banana 2 Carousel State
  const [carouselTopic, setCarouselTopic] = useState('How I automate social media with AI agents');
  const [carouselTemplate, setCarouselTemplate] = useState('Instagram Slideshow');
  const [carouselSlides, setCarouselSlides] = useState<{ title: string; body: string; gradient: string }[]>([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);

  const generateCarousel = () => {
    setIsGeneratingCarousel(true);
    setCarouselSlides([]);
    
    setTimeout(() => {
      setIsGeneratingCarousel(false);
      const generated = [
        { 
          title: "How I Run Social Media Solo", 
          body: "Over 30M organic views. No agency. No virtual assistant. Just one developer running a custom AI workflow.", 
          gradient: "linear-gradient(135deg, #1e3a8a, #5b21b6)" 
        },
        { 
          title: "The Tool Stack Architecture", 
          body: "1. Claude Cowork as the agent\n2. Voxstar Connect as the publishing layer\n3. Local downloads folder of screenshot assets.", 
          gradient: "linear-gradient(135deg, #5b21b6, #9d174d)" 
        },
        { 
          title: "Standalone Scheduler vs Agent", 
          body: "Schedulers wait for posts. Agents make them. An agent reads an image, writes caption, grades it, and publishes it in one conversation.", 
          gradient: "linear-gradient(135deg, #9d174d, #b91c1c)" 
        },
        { 
          title: "The Post Grader Quality Gate", 
          body: "Every draft is automatically graded by AI rules: no em-dashes, all digits for numbers, and hook score audit before queueing.", 
          gradient: "linear-gradient(135deg, #0f172a, #1e3a8a)" 
        },
        { 
          title: "Want My Automation Script?", 
          body: "Comment 'VOX' below and I will DM you the custom MCP connector files + the 5 system prompts immediately.", 
          gradient: "linear-gradient(135deg, #065f46, #064e3b)" 
        }
      ];
      setCarouselSlides(generated);
      setActiveSlideIdx(0);
    }, 2500);
  };

  // Calendar Queue State
  const [queue, setQueue] = useState<PostQueueItem[]>(DEFAULT_QUEUE);
  const [bulkPrefix, setBulkPrefix] = useState('');
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);

  const handleBulkEdit = () => {
    if (!bulkPrefix.trim()) return;
    setIsBulkEditing(true);
    setBulkSuccess(false);

    setTimeout(() => {
      setIsBulkEditing(false);
      setQueue(prev => prev.map(item => ({
        ...item,
        caption: `${bulkPrefix}\n\n${item.caption}`
      })));
      setBulkSuccess(true);
      setBulkPrefix('');
      setTimeout(() => setBulkSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="voxstar-container animate-fade">
      {/* HEADER SECTION */}
      <div className="voxstar-header">
        <button className="back-btn btn-secondary" onClick={onBack}>
          <ChevronLeft size={16} />
          Back to Specialists
        </button>
        <div className="voxstar-title-group">
          <Zap className="voxstar-logo-icon animate-pulse" size={28} />
          <div>
            <h2>Voxstar Connect Hub</h2>
            <p className="text-secondary">Custom Social Media Automation Portal developed for **Gene da Rocha**</p>
          </div>
        </div>
      </div>

      {/* Screen Usage Guide */}
      <ScreenHelpBanner
        screenTitle="Voxstar Connect Social Automation"
        subtitle="Schedule, audit, and auto-publish content across LinkedIn, Twitter, Facebook, and TikTok via MCP."
        steps={[
          {
            number: 1,
            title: "Configure MCP Connector",
            detail: "Enter your Voxstar MCP Server URL and secret key to establish a live publishing channel."
          },
          {
            number: 2,
            title: "Draft & Audit Content",
            detail: "Use the Ideate, Quality Grader, StorySafe, or Carousel Studio tabs to generate and format posts."
          },
          {
            number: 3,
            title: "Schedule & Publish",
            detail: "Add posts to the automated posting queue for multi-account publishing."
          }
        ]}
        proTip="Use the AI Quality Grader tab before queueing posts to audit formatting compliance."
        defaultExpanded={false}
      />

      <div className="voxstar-grid">
        {/* LEFT COLUMN: SETUP & ASSETS */}
        <div className="left-panel">
          {/* Connector config panel */}
          <div className="setup-card glass-panel">
            <div className="card-header">
              <Settings size={16} className="text-primary" />
              <h3>MCP Connector Settings</h3>
            </div>
            
            <form onSubmit={handleConnect} className="card-body">
              <div className="form-group">
                <div className="label-with-help">
                  <label className="form-label">MCP Server URL</label>
                  <FieldHelpTooltip
                    label="MCP Server URL"
                    description="The web address of your Voxstar Model Context Protocol (MCP) server."
                    placeholder="mcp.voxstar.ai/mcp"
                    example="mcp.voxstar.ai/mcp"
                    tips={[
                      "Uses WebSocket / SSE protocol for real-time tool calls.",
                      "Ensure server endpoint allows cross-origin requests."
                    ]}
                  />
                </div>
                <div className="connector-url-row">
                  <Radio size={14} className="text-muted" />
                  <input
                    type="text"
                    className="input-field minimal-input"
                    value={connectorUrl}
                    onChange={(e) => setConnectorUrl(e.target.value)}
                    placeholder="mcp.voxstar.ai/mcp"
                    disabled={isConnected}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-help">
                  <label className="form-label">Voxstar Secret Key</label>
                  <FieldHelpTooltip
                    label="Voxstar Secret Key"
                    description="Your private secret authentication key for Voxstar API."
                    placeholder="vox_sec_..."
                    example="vox_sec_991823ab..."
                    tips={[
                      "Authenticates your client session with the Voxstar queue.",
                      "Saved securely in local browser storage."
                    ]}
                  />
                </div>
                <div className="key-input-row">
                  {isConnected ? <Lock size={14} className="text-success" /> : <Unlock size={14} className="text-muted" />}
                  <input
                    type="password"
                    className="input-field minimal-input"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Voxstar secret API key..."
                    disabled={isConnected}
                  />
                </div>
              </div>

              <div className="connector-footer">
                {isConnected ? (
                  <div className="connected-status">
                    <span className="badge badge-success animate-fade">CONNECTED via MCP</span>
                    <button type="button" className="btn btn-secondary btn-small" onClick={handleDisconnect}>
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="connected-status">
                    <span className="badge badge-amber">PENDING CONNECTION</span>
                    <button type="submit" className="btn btn-primary btn-small">
                      Connect MCP
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Connected accounts */}
          <div className="accounts-card glass-panel">
            <div className="card-header">
              <User size={16} className="text-secondary" />
              <h3>Connected Channels</h3>
            </div>
            <div className="card-body accounts-grid">
              <div className="account-pill active">
                <span className="platform-icon">💼</span>
                <div>
                  <div className="account-name">LinkedIn Profile</div>
                  <div className="account-handle">Gene da Rocha</div>
                </div>
              </div>
              <div className="account-pill active">
                <span className="platform-icon">🐦</span>
                <div>
                  <div className="account-name">Twitter/X Profile</div>
                  <div className="account-handle">@genedarocha</div>
                </div>
              </div>
              <div className="account-pill active">
                <span className="platform-icon">📘</span>
                <div>
                  <div className="account-name">Facebook Page</div>
                  <div className="account-handle">Voxstar AI</div>
                </div>
              </div>
              <div className="account-pill active">
                <span className="platform-icon">📸</span>
                <div>
                  <div className="account-name">Instagram Stories</div>
                  <div className="account-handle">@voxstar</div>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots dropzone drawer */}
          <div className="dropzone-card glass-panel">
            <div className="card-header">
              <Upload size={16} className="text-accent" />
              <h3>Raw Assets & Screenshot Folder</h3>
            </div>
            
            <div className="card-body">
              <div 
                className={`upload-zone ${hoveredDropzone ? 'dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setHoveredDropzone(true); }}
                onDragLeave={() => setHoveredDropzone(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setHoveredDropzone(false);
                  alert('Vite File API triggered. For the simulator, click one of the pre-loaded assets below to load instantly.');
                }}
              >
                <div className="upload-placeholder">
                  <Upload size={24} className="upload-icon" />
                  <p>Drop screenshot folder or files here</p>
                  <span>Accepts .png, .jpg, .txt</span>
                </div>
              </div>

              <div className="asset-drawer-title">Pre-packaged Assets (Click to Load)</div>
              <div className="prepackaged-grid">
                {prepackagedAssets.map((asset) => (
                  <button 
                    key={asset.id} 
                    className="asset-pill-btn"
                    onClick={() => handleLoadAsset(asset)}
                    title={asset.summary}
                  >
                    <span className="bullet-indicator bg-primary" />
                    <div className="asset-details">
                      <div className="asset-name">{asset.name}</div>
                      <div className="asset-type">{asset.label}</div>
                    </div>
                  </button>
                ))}
              </div>

              {uploadedFiles.length > 0 && (
                <div className="uploaded-list animate-fade">
                  <div className="uploaded-list-header">
                    <span>Loaded Assets ({uploadedFiles.length})</span>
                    <button className="clear-assets-btn" onClick={() => setUploadedFiles([])}><Trash2 size={12} /></button>
                  </div>
                  <div className="files-scroll">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="loaded-file-row">
                        <FileText size={12} className="text-primary" />
                        <span className="loaded-file-name">{file.name}</span>
                        <span className="badge badge-blue file-badge">{file.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE TAB PANELS */}
        <div className="right-panel glass-panel">
          {/* Navigation Tabs */}
          <div className="panel-tabs">
            <button className={`tab-btn ${activeTab === 'ideate' ? 'active' : ''}`} onClick={() => setActiveTab('ideate')}>
              <Sparkles size={14} />
              <span>Step 1: Content Coach</span>
            </button>
            <button className={`tab-btn ${activeTab === 'grade' ? 'active' : ''}`} onClick={() => setActiveTab('grade')}>
              <Sliders size={14} />
              <span>Step 2: Post Grader</span>
            </button>
            <button className={`tab-btn ${activeTab === 'story' ? 'active' : ''}`} onClick={() => setActiveTab('story')}>
              <Smartphone size={14} />
              <span>Step 3: Story safe zones</span>
            </button>
            <button className={`tab-btn ${activeTab === 'carousel' ? 'active' : ''}`} onClick={() => setActiveTab('carousel')}>
              <Layers size={14} />
              <span>Step 4: Nano Banana 2</span>
            </button>
            <button className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
              <Calendar size={14} />
              <span>Step 5: Calendar Hub</span>
            </button>
          </div>

          <div className="panel-tab-body">
            {/* TAB 1: CONTENT COACH */}
            {activeTab === 'ideate' && (
              <div className="tab-pane animate-fade">
                <div className="pane-header">
                  <h4>🧠 Voxstar Ideation & Content Coach</h4>
                  <p>Analyzes metrics, loose ideas, and screenshot transcripts to formulate high-engagement hooks and structures.</p>
                </div>

                <div className="ideate-form-grid">
                  <div className="form-group">
                    <label className="form-label">Concept / Context Input</label>
                    <textarea 
                      className="input-field" 
                      rows={4}
                      value={ideationConcept}
                      onChange={(e) => setIdeationConcept(e.target.value)}
                      placeholder="Paste details or click on 'voxstar_metrics.png' in the left panel to load analytics..."
                    />
                  </div>

                  <div className="ideate-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Target Audience</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={ideationAudience}
                        onChange={(e) => setIdeationAudience(e.target.value)}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Business Offer</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={ideationOffer}
                        onChange={(e) => setIdeationOffer(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="action-row">
                    <button 
                      className="btn btn-primary"
                      disabled={isIdeating || !ideationConcept.trim()}
                      onClick={runIdeationCoach}
                    >
                      {isIdeating ? (
                        <>
                          <RefreshCw size={16} className="spin" />
                          <span>{ideationStep || 'Analyzing...'}</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          <span>Analyze with Coach</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {ideationOutput && (
                  <div className="ideate-results-area animate-fade">
                    <SafeMarkdownContent text={ideationOutput} />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: POST GRADER */}
            {activeTab === 'grade' && (
              <div className="tab-pane animate-fade">
                <div className="pane-header">
                  <h4>📊 Voxstar Virality Post Grader</h4>
                  <p>Validates posts against custom voice rules. Scores drafts for virality and suggests instant optimizations.</p>
                </div>

                <div className="grader-layout">
                  <div className="grader-inputs">
                    <div className="form-group">
                      <label className="form-label">Post Copy Draft</label>
                      <textarea 
                        className="input-field code-font" 
                        rows={7}
                        value={graderDraft}
                        onChange={(e) => setGraderDraft(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Active Audit Rules (Negative Constraints)</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={graderRules}
                        onChange={(e) => setGraderRules(e.target.value)}
                      />
                    </div>

                    <div className="action-row">
                      <button 
                        className="btn btn-primary"
                        disabled={isGrading || !graderDraft.trim()}
                        onClick={runGrader}
                      >
                        {isGrading ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
                        <span>Audit & Grade Post</span>
                      </button>

                      {graderScore !== null && graderScore < 8.0 && (
                        <button className="btn btn-secondary" onClick={applyGraderFixes}>
                          <Sparkles size={16} className="text-accent" />
                          <span>Auto-Apply Suggestion Fixes</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grader-results">
                    {isGrading && (
                      <div className="grader-loader">
                        <RefreshCw size={24} className="spin text-primary" />
                        <p>Auditing hook compliance...</p>
                      </div>
                    )}

                    {!isGrading && graderScore !== null && (
                      <div className="grader-report-card animate-slide-up">
                        <div className="score-header-row">
                          <div className="score-gauge-container">
                            <svg className="score-circle-svg" viewBox="0 0 36 36">
                              <path
                                className="circle-bg"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={`circle-progress ${graderScore > 8 ? 'success' : 'warning'}`}
                                strokeDasharray={`${graderScore * 10}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <text x="18" y="20.35" className="circle-percentage">{graderScore}</text>
                            </svg>
                          </div>
                          <div>
                            <h5>Engagement Grade</h5>
                            <p className="text-secondary">{graderScore > 8 ? 'Ready to Publish' : 'Needs Optimization'}</p>
                          </div>
                        </div>

                        {graderReport && (
                          <div className="grader-report-markdown">
                            <SafeMarkdownContent text={graderReport} />
                          </div>
                        )}
                      </div>
                    )}

                    {graderScore === null && !isGrading && (
                      <div className="empty-grader-results">
                        <FileText size={32} className="text-muted" />
                        <p>Submit your copy to review detailed compliance report.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INSTAGRAM STORY SAFE ZONES */}
            {activeTab === 'story' && (
              <div className="tab-pane animate-fade">
                <div className="pane-header">
                  <h4>📸 Story Safe-Zone Editor</h4>
                  <p>Layers call-to-actions onto visual assets while verifying that boundaries respect Instagram Stories' native UI bounds.</p>
                </div>

                <div className="story-editor-layout">
                  <div className="story-controls">
                    <div className="form-group">
                      <label className="form-label">Overlay Caption Text</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={storyText}
                        onChange={(e) => setStoryText(e.target.value)}
                        placeholder="Type story overlay caption..."
                      />
                    </div>

                    <div className="form-group">
                      <div className="slider-label-row">
                        <label className="form-label">Vertical Position (Y-Axis)</label>
                        <span className={`badge ${isSafeZoneBreach ? 'badge-danger' : 'badge-success'}`}>
                          {isSafeZoneBreach ? 'Safe Zone Breach' : 'Safe Zone OK'}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className="vertical-slider"
                        value={storyVerticalOffset}
                        onChange={(e) => setStoryVerticalOffset(Number(e.target.value))}
                      />
                    </div>

                    <div className="story-alert-box-container">
                      {isSafeZoneBreach ? (
                        <div className="alert-box alert-important animate-fade">
                          <AlertCircle size={16} />
                          <div>
                            <strong>UI Safe Zone Warning</strong>
                            <p>Moving text too high (&lt; 15%) or too low (&gt; 80%) overlaps with Instagram's account headers or reply bars. Position in center bounds to guarantee visibility.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="alert-box alert-tip animate-fade">
                          <CheckCircle2 size={16} />
                          <div>
                            <strong>Position Optimal</strong>
                            <p>Caption text is located within clear margins. No overlaps detected.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      className="btn btn-primary w-full"
                      disabled={isPublishingStory || !storyText}
                      onClick={publishStory}
                    >
                      {isPublishingStory ? <RefreshCw size={16} className="spin" /> : <Tv size={16} />}
                      <span>{isPublishingStory ? 'Queueing to Voxstar...' : 'Publish Instagram Story'}</span>
                    </button>

                    {isStoryPublished && (
                      <div className="success-publish-alert animate-fade">
                        <CheckCircle2 size={16} />
                        <span>Story successfully compiled & published to Instagram!</span>
                      </div>
                    )}
                  </div>

                  <div className="story-mockup">
                    <div className="phone-container">
                      <div className="phone-screen">
                        {/* Status bar */}
                        <div className="phone-status-bar">
                          <span className="time">15:06</span>
                          <div className="notch" />
                          <span className="icons">🔋</span>
                        </div>

                        {/* Instagram Header Overlay */}
                        <div className="ig-header-overlay">
                          <div className="ig-avatar-mock" />
                          <div className="ig-user-details">
                            <span className="name">genedarocha</span>
                            <span className="time">2h</span>
                          </div>
                        </div>

                        {/* Top Safe Zone indicator (only visible on edit) */}
                        <div className={`safe-zone-guide top-zone ${isSafeZoneBreach && storyVerticalOffset < 15 ? 'active' : ''}`}>
                          <span>IG UI Header Bounds (15%)</span>
                        </div>

                        {/* Background media */}
                        <div className="story-bg-mock">
                          <div className="gradient-studio-mock">
                            <div className="code-editor-mock">
                              <span className="comment">// Voxstar Connect pipeline</span>
                              <span>const agent = new ClaudeAgent();</span>
                              <span>agent.publish();</span>
                            </div>
                          </div>
                        </div>

                        {/* Story text overlay */}
                        <div 
                          className={`story-caption-overlay ${isSafeZoneBreach ? 'breach' : ''}`}
                          style={{ top: `${storyVerticalOffset}%` }}
                        >
                          <span className="caption-bubble">{storyText}</span>
                        </div>

                        {/* Bottom Safe Zone indicator */}
                        <div className={`safe-zone-guide bottom-zone ${isSafeZoneBreach && storyVerticalOffset > 80 ? 'active' : ''}`}>
                          <span>IG Story Keyboard bounds (20%)</span>
                        </div>

                        {/* Instagram Reply Footer Overlay */}
                        <div className="ig-footer-overlay">
                          <div className="reply-bar">Send message...</div>
                          <span className="paper-airplane">⚡</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NANO BANANA 2 CAROUSEL */}
            {activeTab === 'carousel' && (
              <div className="tab-pane animate-fade">
                <div className="pane-header">
                  <h4>🍌 Nano Banana 2 Slide Generator</h4>
                  <p>Exposes visual layout grids to Claude and renders swipable slideshow carousels using localized canvas engines.</p>
                </div>

                <div className="carousel-layout-container">
                  <div className="carousel-controls">
                    <div className="form-group">
                      <label className="form-label">Slideshow Core Topic</label>
                      <input 
                        type="text" 
                        className="input-field"
                        value={carouselTopic}
                        onChange={(e) => setCarouselTopic(e.target.value)}
                        placeholder="e.g. 5 steps to automate code deployment"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Slideshow Theme Template</label>
                      <select 
                        className="input-field"
                        value={carouselTemplate}
                        onChange={(e) => setCarouselTemplate(e.target.value)}
                      >
                        <option value="Instagram Slideshow">Instagram Carousel Slideshow (Faceless dark theme)</option>
                        <option value="Whiteboard Infographic">Whiteboard Infographic (LinkedIn corporate blue)</option>
                      </select>
                    </div>

                    <button 
                      className="btn btn-primary w-full"
                      disabled={isGeneratingCarousel || !carouselTopic.trim()}
                      onClick={generateCarousel}
                    >
                      {isGeneratingCarousel ? <LoaderSpinner /> : <Sparkles size={16} />}
                      <span>{isGeneratingCarousel ? 'Generating slides...' : 'Generate Carousel with Nano Banana 2'}</span>
                    </button>
                  </div>

                  <div className="carousel-display">
                    {isGeneratingCarousel && (
                      <div className="carousel-loader-container">
                        <RefreshCw size={32} className="spin text-accent" />
                        <p>Nano Banana 2 is rendering SVG nodes...</p>
                        <span>Drawing background matrices & fonts</span>
                      </div>
                    )}

                    {!isGeneratingCarousel && carouselSlides.length > 0 && (
                      <div className="slides-preview-container">
                        <div className="slide-viewer" style={{ background: carouselSlides[activeSlideIdx].gradient }}>
                          <div className="slide-card-header">
                            <span className="brand-watermark">Voxstar.ai</span>
                            <span className="slide-counter">Slide {activeSlideIdx + 1}/{carouselSlides.length}</span>
                          </div>
                          
                          <div className="slide-content">
                            <h3>{carouselSlides[activeSlideIdx].title}</h3>
                            <p className="slide-body-copy">{carouselSlides[activeSlideIdx].body}</p>
                          </div>

                          <div className="slide-card-footer">
                            <span className="creator-watermark">by Gene da Rocha</span>
                            <span className="action-indicator">Swipe/Next &gt;&gt;</span>
                          </div>
                        </div>

                        <div className="slide-nav-controls">
                          <button 
                            className="btn btn-secondary btn-icon-only" 
                            disabled={activeSlideIdx === 0}
                            onClick={() => setActiveSlideIdx(prev => Math.max(0, prev - 1))}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="nav-dots">
                            {carouselSlides.map((_, idx) => (
                              <span 
                                key={idx} 
                                className={`dot ${idx === activeSlideIdx ? 'active' : ''}`}
                                onClick={() => setActiveSlideIdx(idx)}
                              />
                            ))}
                          </span>
                          <button 
                            className="btn btn-secondary btn-icon-only" 
                            disabled={activeSlideIdx === carouselSlides.length - 1}
                            onClick={() => setActiveSlideIdx(prev => Math.min(carouselSlides.length - 1, prev + 1))}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {carouselSlides.length === 0 && !isGeneratingCarousel && (
                      <div className="empty-carousel">
                        <Image size={40} className="text-muted" />
                        <p>Configure a topic and click generate to render visual slides.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CALENDAR HUB */}
            {activeTab === 'calendar' && (
              <div className="tab-pane animate-fade">
                <div className="pane-header">
                  <h4>📅 Content Calendar Queue & Bulk Actions</h4>
                  <p>Review posts scheduled via Voxstar Connect and execute bulk updates across your whole posting calendar in one conversation.</p>
                </div>

                <div className="calendar-layout">
                  <div className="queue-list-section">
                    <div className="section-subtitle-row">
                      <h5>Upcoming Queue ({queue.length} posts)</h5>
                      <span className="badge badge-blue">Next Slots Active</span>
                    </div>

                    <div className="queue-items-container">
                      {queue.map((item) => (
                        <div key={item.id} className="queue-item-card glass-panel">
                          <div className="queue-card-meta">
                            <div className="platform-tag">
                              <span className="platform-symbol">
                                {item.platform === 'linkedin' ? '💼' : item.platform === 'twitter' ? '🐦' : '📘'}
                              </span>
                              <span>{item.account}</span>
                            </div>
                            <span className="scheduled-badge">{item.scheduledTime}</span>
                          </div>
                          
                          <p className="queue-caption-preview">{item.caption}</p>
                          
                          <div className="queue-card-footer">
                            <span className="status-indicator">
                              <span className="pulse-dot green" />
                              Scheduled
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bulk-actions-section">
                    <div className="bulk-card glass-panel-glow">
                      <div className="bulk-card-header">
                        <Sparkles size={16} className="text-accent" />
                        <h5>Bulk Action Command</h5>
                      </div>
                      
                      <div className="bulk-card-body">
                        <p className="bulk-instructions">
                          Add a header, discount code, or promotional suffix to all upcoming scheduled captions at once. Saves hours of copy-pasting.
                        </p>

                        <div className="form-group">
                          <label className="form-label">Text to Prepend/Prepend</label>
                          <textarea 
                            className="input-field" 
                            rows={3}
                            value={bulkPrefix}
                            onChange={(e) => setBulkPrefix(e.target.value)}
                            placeholder="e.g. 🎁 Promo Code: VOXSTAR50 (Save 50% on all custom automation templates this week!)"
                          />
                        </div>

                        <button 
                          className="btn btn-primary w-full"
                          disabled={isBulkEditing || !bulkPrefix.trim()}
                          onClick={handleBulkEdit}
                        >
                          {isBulkEditing ? (
                            <>
                              <RefreshCw size={16} className="spin" />
                              <span>Applying batch changes...</span>
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              <span>Apply to Queue</span>
                            </>
                          )}
                        </button>

                        {bulkSuccess && (
                          <div className="success-publish-alert animate-fade">
                            <CheckCircle2 size={16} />
                            <span>Successfully updated captions for all scheduled queue posts!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPONENT STYLES */}
      <style>{`
        .voxstar-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .voxstar-header {
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
        }

        .back-btn {
          font-size: 13px;
          padding: 8px 14px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .voxstar-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .voxstar-logo-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
        }

        .voxstar-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 20px;
          align-items: stretch;
          flex-grow: 1;
        }

        @media (max-width: 1024px) {
          .voxstar-grid {
            grid-template-columns: 1fr;
          }
        }

        .left-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .glass-panel {
          background: rgba(10, 15, 28, 0.45);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-glass);
        }

        .card-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .connector-url-row, .key-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(10, 15, 28, 0.6);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 0 16px;
          height: 44px;
        }

        .minimal-input {
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          height: 100%;
          font-size: 13.5px;
          box-shadow: none !important;
        }

        .connector-footer {
          margin-top: 8px;
        }

        .connected-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .badge-amber {
          background: rgba(245, 158, 11, 0.12);
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.25);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 6px;
        }

        .accounts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .account-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 10px;
        }

        .account-pill.active {
          border-color: rgba(59, 130, 246, 0.15);
          background: rgba(59, 130, 246, 0.03);
        }

        .platform-icon {
          font-size: 18px;
        }

        .account-name {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .account-handle {
          font-size: 10px;
          color: var(--text-secondary);
        }

        .upload-zone {
          border: 2px dashed var(--border-glass);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: var(--transition-smooth);
          cursor: pointer;
          background: rgba(255, 255, 255, 0.01);
        }

        .upload-zone.dragover, .upload-zone:hover {
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.05);
        }

        .upload-icon {
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .upload-placeholder p {
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .upload-placeholder span {
          font-size: 11px;
          color: var(--text-muted);
        }

        .asset-drawer-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 14px;
          margin-bottom: 10px;
        }

        .prepackaged-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .asset-pill-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 8px 12px;
          text-align: left;
          cursor: pointer;
          width: 100%;
          transition: var(--transition-smooth);
        }

        .asset-pill-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateX(2px);
        }

        .bullet-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .asset-name {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .asset-type {
          font-size: 10px;
          color: var(--text-secondary);
        }

        .uploaded-list {
          margin-top: 14px;
          border-top: 1px solid var(--border-glass);
          padding-top: 14px;
        }

        .uploaded-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .clear-assets-btn {
          background: transparent;
          border: none;
          color: var(--danger);
          cursor: pointer;
        }

        .files-scroll {
          max-height: 100px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .loaded-file-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          background: rgba(255, 255, 255, 0.02);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .loaded-file-name {
          font-family: var(--font-mono);
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-badge {
          font-size: 9px;
          padding: 1px 4px;
        }

        /* RIGHT PANEL TABS */
        .right-panel {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
          overflow: hidden;
        }

        .panel-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(10, 15, 28, 0.2);
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.02);
        }

        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          background: rgba(59, 130, 246, 0.02);
        }

        .panel-tab-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .pane-header h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .pane-header p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }
        .w-full { width: 100%; }

        .ideate-form-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ideate-row {
          display: flex;
          gap: 16px;
        }

        .action-row {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .ideate-results-area {
          background: rgba(5, 7, 12, 0.25);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 20px;
          overflow-y: auto;
          max-height: 380px;
        }

        /* GRADER TAB */
        .grader-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: stretch;
        }

        @media (max-width: 768px) {
          .grader-layout {
            grid-template-columns: 1fr;
          }
        }

        .grader-inputs {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .code-font {
          font-family: var(--font-mono);
          font-size: 13.5px;
          line-height: 1.5;
        }

        .grader-results {
          background: rgba(5, 7, 12, 0.2);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          min-height: 250px;
        }

        .grader-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          gap: 12px;
        }

        .grader-loader p {
          font-size: 13.5px;
          color: var(--text-secondary);
        }

        .empty-grader-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          color: var(--text-muted);
          text-align: center;
          gap: 12px;
        }

        .empty-grader-results p {
          font-size: 13px;
          max-width: 240px;
        }

        .score-header-row {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .score-header-row h5 {
          font-size: 15px;
          font-weight: 600;
        }

        .score-gauge-container {
          width: 52px;
          height: 52px;
        }

        .score-circle-svg {
          width: 100%;
          height: 100%;
        }

        .circle-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 3.5;
        }

        .circle-progress {
          fill: none;
          stroke-width: 3.5;
          stroke-linecap: round;
          transition: stroke-dasharray 0.3s ease;
        }

        .circle-progress.warning {
          stroke: var(--warning);
        }

        .circle-progress.success {
          stroke: var(--success);
        }

        .circle-percentage {
          font-family: var(--font-heading);
          fill: #ffffff;
          font-size: 10.5px;
          font-weight: 700;
          text-anchor: middle;
        }

        .grader-report-markdown {
          font-size: 13.5px;
          overflow-y: auto;
          max-height: 320px;
        }

        /* STORYSAFE EDITOR */
        .story-editor-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .story-editor-layout {
            grid-template-columns: 1fr;
          }
        }

        .story-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .vertical-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
        }

        .vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: var(--transition-smooth);
        }

        .vertical-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .story-alert-box-container {
          min-height: 80px;
        }

        .badge-danger {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.25);
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .success-publish-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #a7f3d0;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12.5px;
          margin-top: 10px;
        }

        .story-mockup {
          display: flex;
          justify-content: center;
        }

        .phone-container {
          width: 260px;
          height: 480px;
          background: #1e293b;
          border: 8px solid #0f172a;
          border-radius: 36px;
          box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.6);
          position: relative;
          overflow: hidden;
        }

        .phone-screen {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          background: #000000;
        }

        .phone-status-bar {
          height: 30px;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          font-weight: 600;
          color: #ffffff;
          z-index: 100;
          background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);
        }

        .notch {
          width: 80px;
          height: 15px;
          background: #0f172a;
          border-radius: 0 0 10px 10px;
          margin-top: -4px;
        }

        .ig-header-overlay {
          position: absolute;
          top: 30px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 90;
        }

        .ig-avatar-mock {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
        }

        .ig-user-details {
          display: flex;
          flex-direction: column;
          color: #ffffff;
          font-size: 9px;
          font-weight: 500;
          line-height: 1;
        }

        .ig-user-details .time {
          color: rgba(255, 255, 255, 0.6);
          font-size: 8px;
        }

        .story-bg-mock {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10;
        }

        .gradient-studio-mock {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #4c1d95 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .code-editor-mock {
          font-family: var(--font-mono);
          font-size: 9px;
          color: #e2e8f0;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .code-editor-mock .comment {
          color: var(--text-muted);
        }

        .story-caption-overlay {
          position: absolute;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 80;
          width: 85%;
          text-align: center;
          transition: top 0.1s ease;
          pointer-events: none;
        }

        .caption-bubble {
          background: #ffffff;
          color: #000000;
          padding: 8px 14px;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: 800;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
          word-break: break-word;
          display: inline-block;
        }

        .story-caption-overlay.breach .caption-bubble {
          border: 2px solid var(--danger);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }

        .safe-zone-guide {
          position: absolute;
          left: 0;
          right: 0;
          height: 15%;
          background: rgba(239, 68, 68, 0.05);
          border: 1px dashed rgba(239, 68, 68, 0.2);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.1;
          transition: var(--transition-smooth);
        }

        .safe-zone-guide.top-zone {
          top: 0;
          height: 15%;
        }

        .safe-zone-guide.bottom-zone {
          bottom: 0;
          height: 20%;
        }

        .safe-zone-guide.active {
          opacity: 1;
          background: rgba(239, 68, 68, 0.2);
          border-color: var(--danger);
        }

        .safe-zone-guide span {
          color: #fca5a5;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .ig-footer-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 90;
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
        }

        .reply-bar {
          flex-grow: 1;
          height: 32px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 16px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          font-size: 9px;
          color: rgba(255, 255, 255, 0.7);
        }

        .paper-airplane {
          color: #ffffff;
          font-size: 14px;
        }

        /* NANO BANANA CAROUSEL */
        .carousel-layout-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .carousel-layout-container {
            grid-template-columns: 1fr;
          }
        }

        .carousel-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .carousel-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(5, 7, 12, 0.2);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 24px;
          min-height: 320px;
          justify-content: center;
        }

        .carousel-loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }

        .carousel-loader-container p {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .carousel-loader-container span {
          font-size: 11px;
          color: var(--text-muted);
        }

        .empty-carousel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
          text-align: center;
        }

        .slides-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .slide-viewer {
          width: 320px;
          height: 320px;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: var(--shadow-lg), 0 10px 30px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
        }

        .slide-card-header, .slide-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
        }

        .brand-watermark {
          letter-spacing: 0.05em;
        }

        .slide-content h3 {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.3;
          margin-bottom: 12px;
        }

        .slide-body-copy {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.5;
          white-space: pre-line;
        }

        .slide-nav-controls {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-icon-only {
          padding: 8px;
          border-radius: 8px;
        }

        .nav-dots {
          display: flex;
          gap: 6px;
        }

        .nav-dots .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .nav-dots .dot.active {
          background: var(--primary);
          transform: scale(1.2);
        }

        /* CALENDAR TAB */
        .calendar-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          align-items: stretch;
        }

        @media (max-width: 768px) {
          .calendar-layout {
            grid-template-columns: 1fr;
          }
        }

        .section-subtitle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .section-subtitle-row h5 {
          font-size: 14.5px;
          font-weight: 600;
        }

        .queue-items-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .queue-item-card {
          padding: 16px;
          border-color: rgba(255, 255, 255, 0.05);
          background: rgba(10, 15, 28, 0.25);
        }

        .queue-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          margin-bottom: 8px;
        }

        .platform-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .platform-symbol {
          font-size: 14px;
        }

        .scheduled-badge {
          font-family: var(--font-mono);
          color: var(--primary);
        }

        .queue-caption-preview {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.4;
          white-space: pre-line;
          margin-bottom: 10px;
        }

        .queue-card-footer {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 500;
          color: var(--success);
          text-transform: uppercase;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .pulse-dot.green {
          background: var(--success);
          box-shadow: 0 0 6px var(--success);
        }

        .bulk-card {
          padding: 20px;
        }

        .bulk-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .bulk-card-header h5 {
          font-size: 14px;
          font-weight: 600;
        }

        .bulk-instructions {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

// Simulated Loading Indicator
const LoaderSpinner: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <RefreshCw size={14} className="spin" />
    <span>Compiling canvas nodes...</span>
  </div>
);

// Safe Markdown component tailored for Voxstar Automation tab output
const SafeMarkdownContent: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const rendered: React.ReactNode[] = [];
  let elementKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      rendered.push(<h4 key={elementKey++} style={{ marginTop: '16px', marginBottom: '8px', color: '#ffffff' }}>{line.replace('### ', '')}</h4>);
    } else if (line.startsWith('#### ')) {
      rendered.push(<h5 key={elementKey++} style={{ marginTop: '12px', marginBottom: '4px', color: 'var(--primary)' }}>{line.replace('#### ', '')}</h5>);
    } else if (line.trim().startsWith('* ')) {
      rendered.push(<li key={elementKey++} style={{ fontSize: '13px', marginLeft: '12px', marginBottom: '4px', color: 'var(--text-primary)' }}>{line.replace('* ', '')}</li>);
    } else if (line.startsWith('> ')) {
      rendered.push(
        <div key={elementKey++} className="alert-box alert-tip" style={{ marginTop: '10px', padding: '10px' }}>
          <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px' }}>{line.replace('> ', '').replace('[!TIP]', '')}</span>
        </div>
      );
    } else if (line.trim() !== '') {
      rendered.push(<p key={elementKey++} style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>{line}</p>);
    }
  }

  return <div className="prose">{rendered}</div>;
};
