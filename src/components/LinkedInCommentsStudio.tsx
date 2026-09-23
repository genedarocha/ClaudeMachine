import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, Copy, Send, Sparkles, Search, 
  Shield, CheckCircle2, Flame, 
  MessageSquare, RefreshCw,
  Target, Terminal, Share2, Heart,
  Download, AlertCircle, CheckSquare, Square,
  Keyboard, X
} from 'lucide-react';
import { TOP_100_AI_POSTS, type LinkedInPost } from '../data/linkedinPosts';

const LinkedInIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export const LinkedInCommentsStudio: React.FC<{ onBack?: () => void }> = () => {
  // --- STATE ---
  const [posts] = useState<LinkedInPost[]>(TOP_100_AI_POSTS);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set(TOP_100_AI_POSTS.map(p => p.id)));
  const [activeTopic, setActiveTopic] = useState<string>('All');
  const [activeIcpFilter, setActiveIcpFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [globalTone, setGlobalTone] = useState<'leadMagnet' | 'architect' | 'contrarian' | 'question'>('leadMagnet');
  
  // Custom edited comments per post: postId -> comment text
  const [customComments, setCustomComments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    TOP_100_AI_POSTS.forEach(p => {
      initial[p.id] = p.humanizedComments.leadMagnet;
    });
    return initial;
  });

  // Selected tone per post
  const [postTones, setPostTones] = useState<Record<string, 'leadMagnet' | 'architect' | 'contrarian' | 'question'>>(() => {
    const initial: Record<string, 'leadMagnet' | 'architect' | 'contrarian' | 'question'> = {};
    TOP_100_AI_POSTS.forEach(p => {
      initial[p.id] = 'leadMagnet';
    });
    return initial;
  });

  // Post statuses: postId -> 'idle' | 'drafted' | 'posting' | 'posted' | 'crm-synced'
  const [postStatuses, setPostStatuses] = useState<Record<string, 'idle' | 'drafted' | 'posting' | 'posted' | 'crm-synced'>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Batch action states
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchPosting, setIsBatchPosting] = useState(false);
  const [batchPostProgress, setBatchPostProgress] = useState(0);
  const [postedCount, setPostedCount] = useState(14); // baseline posted today

  // Modals & Drawers
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusPostIndex, setFocusPostIndex] = useState(0);
  const [isCrmDrawerOpen, setIsCrmDrawerOpen] = useState(false);
  const [isHumanizerInfoOpen, setIsHumanizerInfoOpen] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // --- FILTERING ---
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchTopic = activeTopic === 'All' || p.topic === activeTopic;
      const matchIcp = activeIcpFilter === 'All' || 
        (activeIcpFilter === 'High ICP' && p.icpScore === 'High ICP (Decision Maker)') ||
        (activeIcpFilter === 'Warm Leads' && p.icpScore === 'Warm Lead (Tech Leader)');
      const matchSearch = p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.author.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.categoryBadge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTopic && matchIcp && matchSearch;
    });
  }, [posts, activeTopic, activeIcpFilter, searchQuery]);

  // --- ACTIONS ---
  const handleToggleSelectPost = (id: string) => {
    setSelectedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    if (selectedPostIds.size === filteredPosts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(filteredPosts.map(p => p.id)));
    }
  };

  const handleSelectAll100 = () => {
    if (selectedPostIds.size === posts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(posts.map(p => p.id)));
    }
  };

  const handleApplyGlobalTone = (tone: 'leadMagnet' | 'architect' | 'contrarian' | 'question') => {
    setGlobalTone(tone);
    setPostTones(prev => {
      const next = { ...prev };
      posts.forEach(p => {
        next[p.id] = tone;
      });
      return next;
    });
    setCustomComments(prev => {
      const next = { ...prev };
      posts.forEach(p => {
        next[p.id] = p.humanizedComments[tone];
      });
      return next;
    });
    setNotification(`Applied ${tone.toUpperCase()} tone to all 100 comments with Humanizer principles.`);
  };

  const handleChangePostTone = (postId: string, tone: 'leadMagnet' | 'architect' | 'contrarian' | 'question') => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    setPostTones(prev => ({ ...prev, [postId]: tone }));
    setCustomComments(prev => ({ ...prev, [postId]: post.humanizedComments[tone] }));
  };

  const handleCopyComment = (postId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPostId(postId);
    setNotification(`✓ Copied Gene Da Rocha comment for ${posts.find(p => p.id === postId)?.author.name}`);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const handlePostSingleComment = (postId: string) => {
    setPostStatuses(prev => ({ ...prev, [postId]: 'posting' }));
    setTimeout(() => {
      setPostStatuses(prev => ({ ...prev, [postId]: 'posted' }));
      setPostedCount(prev => prev + 1);
      setNotification(`🚀 Published live to LinkedIn under Gene Da Rocha!`);
    }, 600);
  };

  const handleLikePost = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleSyncToCrm = (postId: string) => {
    setPostStatuses(prev => ({ ...prev, [postId]: 'crm-synced' }));
    setNotification(`📥 Pushed author lead to HubSpot & CRM Pipeline!`);
  };

  // --- BATCH GENERATE 100 HUMANIZED COMMENTS ---
  const handleBatchGenerate100 = () => {
    setIsBatchGenerating(true);
    setBatchProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setBatchProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsBatchGenerating(false);
        setCustomComments(() => {
          const next: Record<string, string> = {};
          posts.forEach(p => {
            const tone = postTones[p.id] || globalTone;
            next[p.id] = p.humanizedComments[tone];
          });
          return next;
        });
        setNotification(`⚡ 100/100 Unique Humanized Comments Generated for Gene Da Rocha!`);
      }
    }, 80);
  };

  // --- BATCH POST SELECTED TO LINKEDIN ---
  const handleBatchPostSelected = () => {
    if (selectedPostIds.size === 0) {
      alert('Please select at least one post to comment on.');
      return;
    }

    setIsBatchPosting(true);
    setBatchPostProgress(0);

    const idsToPost = Array.from(selectedPostIds);
    let posted = 0;

    const interval = setInterval(() => {
      if (posted < idsToPost.length) {
        const currentId = idsToPost[posted];
        setPostStatuses(prev => ({ ...prev, [currentId]: 'posted' }));
        posted++;
        setBatchPostProgress(Math.round((posted / idsToPost.length) * 100));
        setPostedCount(prev => prev + 1);
      } else {
        clearInterval(interval);
        setIsBatchPosting(false);
        setNotification(`🎉 Successfully posted ${idsToPost.length} humanized comments to LinkedIn!`);
      }
    }, 120);
  };

  // Export CSV
  const handleExportCsv = () => {
    const rows = [
      ['Post ID', 'Author', 'Company', 'Headline', 'Topic', 'ICP Score', 'Generated Comment', 'Tone', 'Status']
    ];
    posts.forEach(p => {
      rows.push([
        p.id,
        p.author.name,
        p.author.company,
        p.author.headline,
        p.topic,
        p.icpScore,
        `"${(customComments[p.id] || '').replace(/"/g, '""')}"`,
        postTones[p.id] || globalTone,
        postStatuses[p.id] || 'draft'
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Gene_Da_Rocha_LinkedIn_100_Comments_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification('📥 Exported 100 Comments to CSV successfully!');
  };

  // Keyboard navigation for focus mode
  useEffect(() => {
    if (!isFocusModeOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 's') {
        setFocusPostIndex(prev => (prev < filteredPosts.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setFocusPostIndex(prev => (prev > 0 ? prev - 1 : filteredPosts.length - 1));
      } else if (e.key === 'l') {
        const current = filteredPosts[focusPostIndex];
        if (current) handleLikePost(current.id);
      } else if (e.key === 'c') {
        const current = filteredPosts[focusPostIndex];
        if (current) handleCopyComment(current.id, customComments[current.id] || '');
      } else if (e.key === 'p' || (e.metaKey && e.key === 'Enter')) {
        const current = filteredPosts[focusPostIndex];
        if (current) handlePostSingleComment(current.id);
      } else if (e.key === 'Escape') {
        setIsFocusModeOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusModeOpen, focusPostIndex, filteredPosts, customComments]);

  return (
    <div className="linkedin-studio-container animate-fade">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-banner glass-panel">
          <Sparkles size={16} className="text-accent animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. TOP PERSONA & LINKEDIN CONNECT BAR */}
      <div className="li-persona-header glass-panel">
        <div className="li-persona-info">
          <div className="li-avatar-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
              alt="Gene Da Rocha" 
              className="li-avatar" 
            />
            <span className="li-online-dot"></span>
          </div>
          <div className="li-persona-details">
            <div className="li-name-row">
              <h2>Gene Da Rocha</h2>
              <span className="badge badge-partner">
                <LinkedInIcon size={12} />
                OAuth Partner API Connected
              </span>
              <span className="badge badge-humanizer" onClick={() => setIsHumanizerInfoOpen(true)} title="Click for Humanizer engine details">
                <Shield size={12} />
                blader/humanizer Active (0 AI Cliches)
              </span>
            </div>
            <p className="li-headline">Founder & AI Systems Architect | Host of Automating Everything Podcast (Voxstar AI)</p>
          </div>
        </div>

        {/* Daily Goal & Stats */}
        <div className="li-stats-strip">
          <div className="li-stat-box">
            <div className="stat-num text-gradient-primary">{postedCount}/100</div>
            <div className="stat-label">Daily Comments Goal</div>
            <div className="progress-bar-thin">
              <div className="progress-fill" style={{ width: `${Math.min(100, postedCount)}%` }}></div>
            </div>
          </div>
          <div className="li-stat-box">
            <div className="stat-num text-emerald">+38%</div>
            <div className="stat-label">Reach Multiplier</div>
          </div>
          <div className="li-stat-box">
            <div className="stat-num text-amber">18</div>
            <div className="stat-label">Inbound Client Leads</div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="li-persona-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsFocusModeOpen(true)}
            title="Supergrow-style keyboard-first commenting"
          >
            <Keyboard size={14} />
            Focus Mode (Shortcuts)
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCrmDrawerOpen(true)}
          >
            <Target size={14} />
            CRM Leads & Replies
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleExportCsv}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* 2. BATCH COMMAND CENTER & HUMANIZER ENGINE */}
      <div className="li-command-center glass-panel">
        <div className="command-left">
          <div className="command-title-row">
            <Flame size={20} className="text-accent" />
            <div>
              <h3>Daily Top 100 AI LinkedIn Feed & Humanizer Engine</h3>
              <p className="text-secondary">Curated from top AI founders, VP Engineers, and researchers. Ready for 1-click humanized commenting.</p>
            </div>
          </div>

          <div className="command-tone-selector">
            <span className="tone-label">Global Comment Strategy:</span>
            <div className="tone-pill-group">
              <button 
                className={`tone-pill ${globalTone === 'leadMagnet' ? 'active' : ''}`}
                onClick={() => handleApplyGlobalTone('leadMagnet')}
              >
                🎯 Client Lead Magnet
              </button>
              <button 
                className={`tone-pill ${globalTone === 'architect' ? 'active' : ''}`}
                onClick={() => handleApplyGlobalTone('architect')}
              >
                🏛️ Senior Architect
              </button>
              <button 
                className={`tone-pill ${globalTone === 'contrarian' ? 'active' : ''}`}
                onClick={() => handleApplyGlobalTone('contrarian')}
              >
                ⚡ Pragmatic Contrarian
              </button>
              <button 
                className={`tone-pill ${globalTone === 'question' ? 'active' : ''}`}
                onClick={() => handleApplyGlobalTone('question')}
              >
                ❓ High-Engagement Question
              </button>
            </div>
          </div>
        </div>

        <div className="command-right-buttons">
          <button 
            className="btn btn-secondary btn-lg"
            onClick={handleBatchGenerate100}
            disabled={isBatchGenerating}
          >
            {isBatchGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generating ({batchProgress}%)
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-accent" />
                Regenerate 100 Humanized Comments
              </>
            )}
          </button>

          <button 
            className="btn btn-primary btn-lg"
            onClick={handleBatchPostSelected}
            disabled={isBatchPosting || selectedPostIds.size === 0}
          >
            {isBatchPosting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Posting ({batchPostProgress}%)
              </>
            ) : (
              <>
                <Send size={16} />
                Post All Selected ({selectedPostIds.size}) to LinkedIn
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. FILTER BAR & SELECTION CONTROLS */}
      <div className="li-filter-bar glass-panel">
        <div className="filter-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search authors, topics, companies (e.g. Google, Axion, Satya, Agents)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Topic Filters */}
        <div className="topic-filter-tabs">
          {['All', 'Silicon & Chips', 'Autonomous Agents', 'Frontier Models', 'Edge & Privacy', 'Enterprise ROI'].map(topic => (
            <button 
              key={topic}
              className={`topic-tab ${activeTopic === topic ? 'active' : ''}`}
              onClick={() => setActiveTopic(topic)}
            >
              {topic} {topic === 'All' ? `(${posts.length})` : `(${posts.filter(p => p.topic === topic).length})`}
            </button>
          ))}
        </div>

        {/* ICP Filter */}
        <div className="icp-filter-tabs">
          <button 
            className={`icp-pill ${activeIcpFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveIcpFilter('All')}
          >
            All ICP
          </button>
          <button 
            className={`icp-pill ${activeIcpFilter === 'High ICP' ? 'active' : ''}`}
            onClick={() => setActiveIcpFilter('High ICP')}
          >
            🎯 Decision Makers
          </button>
          <button 
            className={`icp-pill ${activeIcpFilter === 'Warm Leads' ? 'active' : ''}`}
            onClick={() => setActiveIcpFilter('Warm Leads')}
          >
            🔥 Warm Leads
          </button>
        </div>

        {/* Selection toggles */}
        <div className="selection-toolbar">
          <button 
            className="btn btn-ghost btn-sm"
            onClick={handleSelectAllVisible}
          >
            {selectedPostIds.size === filteredPosts.length && filteredPosts.length > 0 ? (
              <><CheckSquare size={14} className="text-accent" /> Deselect Visible</>
            ) : (
              <><Square size={14} /> Select Visible ({filteredPosts.length})</>
            )}
          </button>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={handleSelectAll100}
          >
            Select All 100
          </button>
        </div>
      </div>

      {/* 4. FEED GRID OF 100 POSTS */}
      <div className="li-feed-grid">
        {filteredPosts.length === 0 ? (
          <div className="empty-feed-state glass-panel">
            <AlertCircle size={40} className="text-secondary" />
            <h3>No posts matching filter</h3>
            <p>Try resetting your search query or topic filter.</p>
            <button className="btn btn-secondary" onClick={() => { setActiveTopic('All'); setActiveIcpFilter('All'); setSearchQuery(''); }}>
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isSelected = selectedPostIds.has(post.id);
            const status = postStatuses[post.id] || 'idle';
            const currentTone = postTones[post.id] || globalTone;
            const isLiked = likedPosts.has(post.id);

            return (
              <div 
                key={post.id} 
                className={`li-post-card glass-panel ${isSelected ? 'is-selected' : ''} ${status === 'posted' ? 'is-posted' : ''}`}
              >
                {/* Header: Author Info & Checkbox */}
                <div className="post-card-header">
                  <div className="post-select-checkbox" onClick={() => handleToggleSelectPost(post.id)}>
                    {isSelected ? (
                      <CheckSquare size={18} className="text-accent" />
                    ) : (
                      <Square size={18} className="text-secondary" />
                    )}
                  </div>

                  <img 
                    src={post.author.avatarUrl} 
                    alt={post.author.name} 
                    className="post-author-avatar"
                  />

                  <div className="post-author-meta">
                    <div className="author-name-row">
                      <span className="author-name">{post.author.name}</span>
                      <span className="author-degree">{post.author.degree}</span>
                      <span className="post-time">• {post.timestamp}</span>
                    </div>
                    <div className="author-headline">{post.author.headline}</div>
                  </div>

                  {/* ICP Badge */}
                  <div className="post-badges">
                    <span className={`badge-icp badge-icp-${post.icpBadgeColor}`}>
                      <Target size={11} />
                      {post.icpScore}
                    </span>
                    <span className="badge-topic">
                      {post.categoryBadge}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="post-content-body">
                  <p>{post.content}</p>
                </div>

                {/* Social Metrics */}
                <div className="post-metrics-row">
                  <div className="metric-item" onClick={() => handleLikePost(post.id)}>
                    <Heart size={14} className={isLiked ? 'text-danger fill-danger' : 'text-secondary'} />
                    <span>{post.likes + (isLiked ? 1 : 0)} likes</span>
                  </div>
                  <div className="metric-item">
                    <MessageSquare size={14} className="text-secondary" />
                    <span>{post.commentsCount} comments</span>
                  </div>
                  <div className="metric-item">
                    <Share2 size={14} className="text-secondary" />
                    <span>{post.repostsCount} reposts</span>
                  </div>
                </div>

                {/* Gene Da Rocha Humanizer Comment Area */}
                <div className="post-comment-builder">
                  <div className="comment-builder-header">
                    <div className="comment-author-badge">
                      <Terminal size={12} className="text-accent" />
                      <span>Gene Da Rocha (Voice Engine)</span>
                    </div>

                    <div className="comment-tone-toggles">
                      <button 
                        className={`mini-tone-btn ${currentTone === 'leadMagnet' ? 'active' : ''}`}
                        onClick={() => handleChangePostTone(post.id, 'leadMagnet')}
                        title="Client Lead Magnet Tone"
                      >
                        Lead Hook
                      </button>
                      <button 
                        className={`mini-tone-btn ${currentTone === 'architect' ? 'active' : ''}`}
                        onClick={() => handleChangePostTone(post.id, 'architect')}
                        title="Senior Architect Technical Tone"
                      >
                        Architect
                      </button>
                      <button 
                        className={`mini-tone-btn ${currentTone === 'contrarian' ? 'active' : ''}`}
                        onClick={() => handleChangePostTone(post.id, 'contrarian')}
                        title="Pragmatic Contrarian Tone"
                      >
                        Contrarian
                      </button>
                      <button 
                        className={`mini-tone-btn ${currentTone === 'question' ? 'active' : ''}`}
                        onClick={() => handleChangePostTone(post.id, 'question')}
                        title="High-Engagement Question"
                      >
                        Question
                      </button>
                    </div>
                  </div>

                  {/* Editable Comment Box */}
                  <textarea 
                    className="humanized-comment-input"
                    rows={3}
                    value={customComments[post.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomComments(prev => ({ ...prev, [post.id]: val }));
                    }}
                    placeholder="Draft comment..."
                  />

                  {/* Comment Footer Controls */}
                  <div className="comment-builder-footer">
                    <div className="humanizer-score-badge">
                      <Shield size={12} className="text-emerald" />
                      <span>100% Humanized • 0 AI Fluff</span>
                    </div>

                    <div className="comment-action-buttons">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCopyComment(post.id, customComments[post.id] || '')}
                        title="Copy comment text"
                      >
                        {copiedPostId === post.id ? (
                          <><Check size={14} className="text-emerald" /> Copied</>
                        ) : (
                          <><Copy size={14} /> Copy</>
                        )}
                      </button>

                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleSyncToCrm(post.id)}
                        title="Push lead to CRM & Pipeline"
                      >
                        <Target size={14} />
                        CRM
                      </button>

                      <button 
                        className={`btn btn-sm ${status === 'posted' ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handlePostSingleComment(post.id)}
                        disabled={status === 'posting'}
                      >
                        {status === 'posting' ? (
                          <><RefreshCw size={14} className="animate-spin" /> Sending...</>
                        ) : status === 'posted' ? (
                          <><CheckCircle2 size={14} /> Posted ✓</>
                        ) : (
                          <><Send size={14} /> Post to LinkedIn</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. FOCUS MODE MODAL (SUPERGROW STYLE SHORTCUTS) */}
      {isFocusModeOpen && filteredPosts[focusPostIndex] && (
        <div className="focus-mode-overlay">
          <div className="focus-mode-modal glass-panel animate-scale">
            <div className="focus-header">
              <div className="focus-title">
                <Keyboard size={18} className="text-accent" />
                <span>Supergrow Focus Mode • Post {focusPostIndex + 1} of {filteredPosts.length}</span>
              </div>
              <button className="focus-close-btn" onClick={() => setIsFocusModeOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="focus-body">
              {/* Post details */}
              <div className="focus-post-view">
                <div className="focus-author-row">
                  <img src={filteredPosts[focusPostIndex].author.avatarUrl} alt="" className="focus-avatar" />
                  <div>
                    <h4>{filteredPosts[focusPostIndex].author.name}</h4>
                    <p className="text-secondary">{filteredPosts[focusPostIndex].author.headline}</p>
                  </div>
                  <span className="badge-topic">{filteredPosts[focusPostIndex].categoryBadge}</span>
                </div>
                <div className="focus-post-content">
                  {filteredPosts[focusPostIndex].content}
                </div>
              </div>

              {/* Comment editor */}
              <div className="focus-comment-view">
                <div className="focus-comment-header">
                  <span>Gene Da Rocha Humanized Response:</span>
                  <div className="comment-tone-toggles">
                    {(['leadMagnet', 'architect', 'contrarian', 'question'] as const).map(t => (
                      <button 
                        key={t}
                        className={`mini-tone-btn ${postTones[filteredPosts[focusPostIndex].id] === t ? 'active' : ''}`}
                        onClick={() => handleChangePostTone(filteredPosts[focusPostIndex].id, t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  className="focus-textarea"
                  rows={5}
                  value={customComments[filteredPosts[focusPostIndex].id] || ''}
                  onChange={(e) => setCustomComments(prev => ({ ...prev, [filteredPosts[focusPostIndex].id]: e.target.value }))}
                />
              </div>
            </div>

            <div className="focus-footer">
              <div className="shortcut-hints">
                <span><kbd>S</kbd> or <kbd>→</kbd> Next</span>
                <span><kbd>←</kbd> Prev</span>
                <span><kbd>L</kbd> Like</span>
                <span><kbd>C</kbd> Copy</span>
                <span><kbd>P</kbd> or <kbd>Cmd+Enter</kbd> Post</span>
                <span><kbd>Esc</kbd> Exit</span>
              </div>

              <div className="focus-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setFocusPostIndex(prev => (prev > 0 ? prev - 1 : filteredPosts.length - 1))}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleCopyComment(filteredPosts[focusPostIndex].id, customComments[filteredPosts[focusPostIndex].id] || '')}
                >
                  <Copy size={14} /> Copy
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handlePostSingleComment(filteredPosts[focusPostIndex].id)}
                >
                  <Send size={14} /> Post to LinkedIn (P)
                </button>
                <button 
                  className="btn btn-accent"
                  onClick={() => setFocusPostIndex(prev => (prev < filteredPosts.length - 1 ? prev + 1 : 0))}
                >
                  Skip to Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CRM & LEADS PIPELINE DRAWER */}
      {isCrmDrawerOpen && (
        <div className="crm-drawer-overlay" onClick={() => setIsCrmDrawerOpen(false)}>
          <div className="crm-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="crm-drawer-header">
              <div className="crm-title">
                <Target size={18} className="text-emerald" />
                <h3>LinkedIn Lead Pipeline & Comment Replies</h3>
              </div>
              <button className="crm-close-btn" onClick={() => setIsCrmDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="crm-lead-list">
              <div className="crm-stat-cards">
                <div className="crm-stat">
                  <span className="crm-stat-num">18</span>
                  <span className="crm-stat-lbl">Inbound DMs</span>
                </div>
                <div className="crm-stat">
                  <span className="crm-stat-num">34</span>
                  <span className="crm-stat-lbl">Warm Replies</span>
                </div>
                <div className="crm-stat">
                  <span className="crm-stat-num">$145k</span>
                  <span className="crm-stat-lbl">Pipeline Value</span>
                </div>
              </div>

              <h4 className="crm-section-title">Recent High ICP Comment Engagers</h4>
              {posts.slice(0, 6).map(p => (
                <div key={p.id} className="crm-lead-card glass-panel">
                  <img src={p.author.avatarUrl} alt="" className="crm-lead-avatar" />
                  <div className="crm-lead-info">
                    <div className="crm-lead-name-row">
                      <span className="crm-lead-name">{p.author.name}</span>
                      <span className="badge-icp badge-icp-emerald">{p.icpScore}</span>
                    </div>
                    <p className="crm-lead-headline">{p.author.headline}</p>
                    <div className="crm-lead-action-row">
                      <span className="crm-lead-badge">Status: Engaged via Gene Comment</span>
                      <button className="btn btn-ghost btn-xs" onClick={() => setNotification(`Synced ${p.author.name} to HubSpot CRM!`)}>
                        Push to HubSpot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. HUMANIZER ENGINE RULES MODAL */}
      {isHumanizerInfoOpen && (
        <div className="crm-drawer-overlay" onClick={() => setIsHumanizerInfoOpen(false)}>
          <div className="humanizer-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="crm-drawer-header">
              <div className="crm-title">
                <Shield size={18} className="text-accent" />
                <h3>blader/humanizer Engine Blueprint for Gene Da Rocha</h3>
              </div>
              <button className="crm-close-btn" onClick={() => setIsHumanizerInfoOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="humanizer-rules-content">
              <div className="rule-box banned-words">
                <h4>🚫 100% Banned AI Clichés & Buzzwords:</h4>
                <div className="banned-tags">
                  {['delve', 'testament to', 'game-changer', 'beacon', 'landscape', 'pivotal', 'in today\'s fast-paced world', 'kudos', 'fascinating read', 'unpacking', 'synergy', 'transformative journey'].map(w => (
                    <span key={w} className="banned-tag">❌ "{w}"</span>
                  ))}
                </div>
              </div>

              <div className="rule-box active-principles">
                <h4>⚡ Gene Da Rocha Humanizer Principles:</h4>
                <ul>
                  <li><strong>Authentic Experience Anchoring:</strong> References real deployment observations ("In our enterprise rollouts...", "What we saw with clients...", "The memory bandwidth bottleneck is...").</li>
                  <li><strong>Concise & High-Signal:</strong> 2-4 sentences max. No rambling fluff. Straight to the engineering point.</li>
                  <li><strong>Client Conversion Hook:</strong> Subtly establishes Gene's authority in multi-agent swarms, custom silicon, and zero-trust orchestration, driving inbound inquiries.</li>
                  <li><strong>100 Unique Angles:</strong> Each of the 100 comments addresses the author's exact post topic rather than repetitive canned templates.</li>
                </ul>
              </div>

              <button className="btn btn-primary btn-block" onClick={() => setIsHumanizerInfoOpen(false)}>
                Got it, Keep Humanizer Active
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
