import { useState, useEffect } from 'react';
import { 
  Plus, Search, Settings, History, LayoutDashboard, 
  Trash2, Copy, Check, ChevronRight, Terminal, Cpu, FileText, Zap, HelpCircle,
  Calendar, Headphones, Video, Globe, Sparkles
} from 'lucide-react';
import { PREBUILT_SPECIALISTS, CATEGORIES, type Specialist } from './data/specialists';
import { SpecialistCard } from './components/SpecialistCard';
import { SpecialistRunner } from './components/SpecialistRunner';
import { SpecialistGenerator } from './components/SpecialistGenerator';
import { SettingsModal } from './components/SettingsModal';
import { VoxstarAutomation } from './components/VoxstarAutomation';
import { FieldHelpTooltip } from './components/FieldHelpTooltip';
import { ScreenHelpBanner } from './components/ScreenHelpBanner';
import { SystemGuideModal } from './components/SystemGuideModal';
import { WiredvibeStudio } from './components/WiredvibeStudio';
import { DailyIdeaStudio } from './components/DailyIdeaStudio';
import { DailyAutopilotStudio } from './components/DailyAutopilotStudio';
import { type ApiKeys, type ModelSettings } from './utils/ai';

interface RunHistoryItem {
  id: string;
  specialistId: string;
  specialistName: string;
  specialistIcon: string;
  timestamp: number;
  inputs: Record<string, string>;
  output: string;
}

function App() {
  // --- STATE ---
  const [keys, setKeys] = useState<ApiKeys>({
    gemini: '',
    openai: '',
    anthropic: ''
  });
  const [settings, setSettings] = useState<ModelSettings>({
    provider: 'mock',
    model: 'Demo Simulated Model'
  });
  
  const [specialists, setSpecialists] = useState<Specialist[]>(PREBUILT_SPECIALISTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [activeSpecialist, setActiveSpecialist] = useState<Specialist | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'runner' | 'generator' | 'history' | 'voxstar' | 'creation-wiredvibe' | 'creation-idea' | 'daily-autopilot'>('dashboard');
  const [activeSoundscape, setActiveSoundscape] = useState<string>('Gamma Retention Pulse');
  const [activeAutopilotServiceId, setActiveAutopilotServiceId] = useState<string>('srv-1');
  
  const [history, setHistory] = useState<RunHistoryItem[]>([]);
  const [activeHistoryItem, setActiveHistoryItem] = useState<RunHistoryItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
    // Load API Keys
    const storedKeys = localStorage.getItem('claude_machine_api_keys');
    if (storedKeys) {
      try { setKeys(JSON.parse(storedKeys)); } catch (e) { console.error(e); }
    }

    // Load Settings
    const storedSettings = localStorage.getItem('claude_machine_settings');
    if (storedSettings) {
      try { setSettings(JSON.parse(storedSettings)); } catch (e) { console.error(e); }
    }

    // Load Custom Specialists
    const storedCustomSpecs = localStorage.getItem('claude_machine_custom_specialists');
    if (storedCustomSpecs) {
      try {
        const parsed: Specialist[] = JSON.parse(storedCustomSpecs);
        setSpecialists([...PREBUILT_SPECIALISTS, ...parsed]);
      } catch (e) { console.error(e); }
    }

    // Load Run History
    const storedHistory = localStorage.getItem('claude_machine_history');
    if (storedHistory) {
      try { setHistory(JSON.parse(storedHistory)); } catch (e) { console.error(e); }
    }
  }, []);

  // --- ACTIONS ---
  const handleSaveSettings = (newKeys: ApiKeys, newSettings: ModelSettings) => {
    setKeys(newKeys);
    setSettings(newSettings);
    localStorage.setItem('claude_machine_api_keys', JSON.stringify(newKeys));
    localStorage.setItem('claude_machine_settings', JSON.stringify(newSettings));
  };

  const handleDeploySpecialist = (newSpec: Specialist) => {
    const storedCustomSpecs = localStorage.getItem('claude_machine_custom_specialists');
    let customList: Specialist[] = [];
    if (storedCustomSpecs) {
      try { customList = JSON.parse(storedCustomSpecs); } catch (e) { console.error(e); }
    }
    
    // Add number prefix for custom ones
    newSpec.number = `#C${String(customList.length + 1).padStart(2, '0')}`;
    
    const updatedCustomList = [...customList, newSpec];
    localStorage.setItem('claude_machine_custom_specialists', JSON.stringify(updatedCustomList));
    setSpecialists([...PREBUILT_SPECIALISTS, ...updatedCustomList]);
    
    // Select and navigate to the new specialist
    setActiveSpecialist(newSpec);
    setCurrentView('runner');
  };

  const handleSaveHistory = (newRun: RunHistoryItem) => {
    const updatedHistory = [newRun, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('claude_machine_history', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your run history?')) {
      setHistory([]);
      setActiveHistoryItem(null);
      localStorage.removeItem('claude_machine_history');
    }
  };

  const handleCopyHistoryText = (item: RunHistoryItem) => {
    navigator.clipboard.writeText(item.output);
    setCopiedHistoryId(item.id);
    setTimeout(() => setCopiedHistoryId(null), 2000);
  };

  // --- FILTERED SPECIALISTS ---
  const filteredSpecialists = specialists.filter((spec) => {
    const matchesCategory = selectedCategory === 'All' || spec.category === selectedCategory;
    const matchesSearch = spec.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          spec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          spec.number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate counts per category dynamically
  const getCategoryCount = (categoryName: string) => {
    return specialists.filter(spec => spec.category === categoryName).length;
  };

  return (
    <div className="app-shell">
      {/* 1. SIDEBAR PANEL */}
      <aside className="sidebar glass-panel">
        <div className="brand" onClick={() => { setCurrentView('dashboard'); setActiveSpecialist(null); }}>
          <Terminal className="brand-logo" size={24} />
          <h1 className="brand-name">
            CLAUDE<span className="gradient-text-accent">MACHINE</span>
          </h1>
        </div>

        {/* Action Button: Dynamic Specialist Generator */}
        <button 
          className="btn btn-primary design-spec-btn"
          onClick={() => { setCurrentView('generator'); setActiveSpecialist(null); }}
        >
          <Plus size={16} />
          Design Specialist
        </button>

        {/* Global Navigation Items */}
        <nav className="nav-menu">
          <button 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setCurrentView('dashboard'); setActiveSpecialist(null); }}
          >
            <LayoutDashboard size={16} />
            <span>Agent Dashboard</span>
          </button>

          {/* 1. CREATION SECTION GROUP (Renamed) */}
          <div className="nav-group-section">
            <div className="nav-group-header">
              <Sparkles size={14} className="text-accent" />
              <span>Creation</span>
            </div>
            <div className="nav-sub-items">
              <button 
                className={`nav-sub-item ${currentView === 'creation-wiredvibe' ? 'active' : ''}`}
                onClick={() => { setCurrentView('creation-wiredvibe'); setActiveSpecialist(null); }}
              >
                <Headphones size={14} />
                <span>Wiredvibe app</span>
              </button>

              <button 
                className={`nav-sub-item ${currentView === 'creation-idea' ? 'active' : ''}`}
                onClick={() => { setCurrentView('creation-idea'); setActiveSpecialist(null); }}
              >
                <Video size={14} />
                <span>Idea</span>
                <span className="nav-badge-hot">Viral</span>
              </button>
            </div>
          </div>

          {/* 2. NEW DAILY AUTOPILOT SECTION GROUP */}
          <div className="nav-group-section">
            <div className="nav-group-header">
              <Calendar size={14} className="text-amber" />
              <span>Daily</span>
            </div>
            <div className="nav-sub-items">
              <button 
                className={`nav-sub-item ${currentView === 'daily-autopilot' && activeAutopilotServiceId === 'srv-1' ? 'active' : ''}`}
                onClick={() => { setActiveAutopilotServiceId('srv-1'); setCurrentView('daily-autopilot'); setActiveSpecialist(null); }}
              >
                <Globe size={14} />
                <span>Wiredvibe App</span>
              </button>

              <button 
                className={`nav-sub-item ${currentView === 'daily-autopilot' && activeAutopilotServiceId === 'srv-2' ? 'active' : ''}`}
                onClick={() => { setActiveAutopilotServiceId('srv-2'); setCurrentView('daily-autopilot'); setActiveSpecialist(null); }}
              >
                <Globe size={14} />
                <span>AIToolboard</span>
              </button>

              <button 
                className={`nav-sub-item ${currentView === 'daily-autopilot' && activeAutopilotServiceId === 'srv-3' ? 'active' : ''}`}
                onClick={() => { setActiveAutopilotServiceId('srv-3'); setCurrentView('daily-autopilot'); setActiveSpecialist(null); }}
              >
                <Globe size={14} />
                <span>ATL-Trust</span>
              </button>
            </div>
          </div>

          <button 
            className={`nav-item ${currentView === 'voxstar' ? 'active' : ''}`}
            onClick={() => { setCurrentView('voxstar'); setActiveSpecialist(null); }}
          >
            <Zap size={16} />
            <span>Voxstar Connect</span>
          </button>
          
          <button 
            className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => { setCurrentView('history'); setActiveSpecialist(null); }}
          >
            <History size={16} />
            <span>Run History</span>
            {history.length > 0 && <span className="history-badge">{history.length}</span>}
          </button>
        </nav>

        {/* Categories Filtering Group */}
        <div className="sidebar-section">
          <h3 className="section-title">Categories</h3>
          <div className="category-list">
            <button
              className={`category-item ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => { setSelectedCategory('All'); if (currentView !== 'dashboard') setCurrentView('dashboard'); }}
            >
              <span className="cat-icon">📁</span>
              <span className="cat-name">All Specialists</span>
              <span className="cat-count">{specialists.length}</span>
            </button>
            
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(cat.name); if (currentView !== 'dashboard') setCurrentView('dashboard'); }}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{getCategoryCount(cat.name)}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <main className="content-container">
        {/* Main Header bar */}
        <header className="main-header glass-panel">
          {/* Settings model active description indicator */}
          <div className="header-status">
            <Cpu size={16} className="status-icon" />
            <span className="status-text">
              Active: {settings.provider === 'mock' ? (
                <span className="text-secondary">Demo Mode (Simulated Response)</span>
              ) : (
                <span className="text-primary">{settings.provider.toUpperCase()} • {settings.model}</span>
              )}
            </span>
          </div>

          {/* Search bar inside header */}
          {currentView === 'dashboard' && (
            <div className="search-bar">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search specialists (e.g. #05, hook, newsletter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FieldHelpTooltip
                label="Search Specialists"
                description="Filter all prebuilt and custom specialists instantly by number (#01, #C01), role name, or keywords."
                placeholder="e.g. #05, sales, copywriter"
                example="#01"
                tips={[
                  "Type specialist number (e.g. #01) for direct jump.",
                  "Filter by keyword like 'email' or 'sales'."
                ]}
              />
            </div>
          )}

          <div style={{ flexGrow: 1 }} />

          {/* Quick Guide Trigger */}
          <button 
            className="btn btn-secondary guide-toggle-btn"
            onClick={() => setIsGuideOpen(true)}
            title="Open Master System Guide"
            style={{ marginRight: '8px', color: 'var(--accent-purple)' }}
          >
            <HelpCircle size={16} />
            <span>Help Guide</span>
          </button>

          {/* Actions panel */}
          <button 
            className="btn btn-secondary settings-toggle-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure API Settings"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </header>

        {/* 3. DYNAMIC BODY VIEWS */}
        <div className="workspace-body">
          {/* A. DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <div className="dashboard-view animate-fade">
              <ScreenHelpBanner
                screenTitle="Claude Agent Dashboard"
                subtitle="Select from 100+ fine-tuned AI specialists or generate custom agents tailored to your business."
                steps={[
                  {
                    number: 1,
                    title: "Pick a Category or Search",
                    detail: "Use the left sidebar categories or top search bar to filter specialists by domain."
                  },
                  {
                    number: 2,
                    title: "Select a Specialist Card",
                    detail: "Click any card to open its custom execution workspace."
                  },
                  {
                    number: 3,
                    title: "Run or Design Custom Agents",
                    detail: "Click '+ Design Specialist' in the sidebar to build brand new AI agents for unique workflows."
                  }
                ]}
                proTip="Click the [Help] badge next to any field inside specialist forms for exact parameter guidance."
                defaultExpanded={false}
              />

              <div className="dashboard-summary">
                <div className="summary-left">
                  <h2>{selectedCategory === 'All' ? 'All Claude Specialists' : selectedCategory}</h2>
                  <p className="text-secondary">Select an AI agent to execute tailored business operations.</p>
                </div>
                <div className="summary-stats">
                  <div className="stat-card">
                    <span className="stat-value">{filteredSpecialists.length}</span>
                    <span className="stat-label">Available</span>
                  </div>
                </div>
              </div>

              {filteredSpecialists.length === 0 ? (
                <div className="empty-state glass-panel">
                  <Search size={40} style={{ color: 'var(--text-muted)' }} />
                  <h3>No specialists found</h3>
                  <p className="text-secondary">Try adjusting your search filters or generate a new custom specialist.</p>
                </div>
              ) : (
                <div className="specialists-grid">
                  {filteredSpecialists.map((spec) => (
                    <SpecialistCard
                      key={spec.id}
                      specialist={spec}
                      onClick={() => {
                        setActiveSpecialist(spec);
                        setCurrentView('runner');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* B. RUNNER VIEW */}
          {currentView === 'runner' && activeSpecialist && (
            <SpecialistRunner
              specialist={activeSpecialist}
              keys={keys}
              settings={settings}
              onBack={() => {
                setCurrentView('dashboard');
                setActiveSpecialist(null);
              }}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {/* C. GENERATOR VIEW */}
          {currentView === 'generator' && (
            <SpecialistGenerator
              keys={keys}
              settings={settings}
              onDeploy={handleDeploySpecialist}
              onCancel={() => setCurrentView('dashboard')}
            />
          )}

          {/* D. RUN HISTORY VIEW */}
          {currentView === 'history' && (
            <div className="history-view animate-fade">
              <ScreenHelpBanner
                screenTitle="Execution Logs & History"
                subtitle="Review past specialist executions, copy generated outputs, or reload prompts."
                steps={[
                  {
                    number: 1,
                    title: "Select an Execution Log",
                    detail: "Click any run item on the left panel to display its parameters and generated response."
                  },
                  {
                    number: 2,
                    title: "Copy Output",
                    detail: "Click 'Copy Output' to copy formatted markdown output directly to your clipboard."
                  },
                  {
                    number: 3,
                    title: "Load in Workspace",
                    detail: "Click 'Load In Workspace' to re-open the specialist runner with pre-filled inputs."
                  }
                ]}
                proTip="Execution logs are saved locally in your browser storage."
                defaultExpanded={false}
              />

              <div className="history-header-row">
                <div>
                  <h2>Execution Logs & Run History</h2>
                  <p className="text-secondary">View and copy outputs generated by your specialists.</p>
                </div>
                {history.length > 0 && (
                  <button className="btn btn-danger" onClick={handleClearHistory}>
                    <Trash2 size={16} />
                    Clear Log Vault
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="empty-state glass-panel">
                  <History size={40} style={{ color: 'var(--text-muted)' }} />
                  <h3>No execution runs logged yet</h3>
                  <p className="text-secondary">Run any specialist in your dashboard to log results here.</p>
                </div>
              ) : (
                <div className="history-workspace-layout">
                  {/* Left Side: Runs List */}
                  <div className="history-list glass-panel">
                    {history.map((item) => (
                      <div 
                        key={item.id} 
                        className={`history-item ${activeHistoryItem?.id === item.id ? 'active' : ''}`}
                        onClick={() => setActiveHistoryItem(item)}
                      >
                        <span className="history-item-icon">{item.specialistIcon}</span>
                        <div className="history-item-details">
                          <h4>{item.specialistName}</h4>
                          <span className="history-time">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <ChevronRight size={14} className="history-arrow" />
                      </div>
                    ))}
                  </div>

                  {/* Right Side: Active Log Viewer */}
                  <div className="history-detail glass-panel">
                    {activeHistoryItem ? (
                      <div className="history-detail-scroll">
                        <div className="detail-header">
                          <span className="detail-emoji">{activeHistoryItem.specialistIcon}</span>
                          <div>
                            <h3>{activeHistoryItem.specialistName}</h3>
                            <span className="detail-time">Executed {new Date(activeHistoryItem.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="detail-actions">
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleCopyHistoryText(activeHistoryItem)}
                            >
                              {copiedHistoryId === activeHistoryItem.id ? (
                                <><Check size={14} style={{ color: 'var(--success)' }} /> Copied</>
                              ) : (
                                <><Copy size={14} /> Copy Output</>
                              )}
                            </button>
                            <button 
                              className="btn btn-primary"
                              onClick={() => {
                                const spec = specialists.find(s => s.id === activeHistoryItem.specialistId);
                                if (spec) {
                                  setActiveSpecialist(spec);
                                  setCurrentView('runner');
                                } else {
                                  alert('The specialist template for this run could not be found.');
                                }
                              }}
                            >
                              Load In Workspace
                            </button>
                          </div>
                        </div>

                        {/* Config Inputs Summary */}
                        <div className="detail-inputs-summary">
                          <h4>Parameters Submitted</h4>
                          <div className="inputs-summary-grid">
                            {Object.entries(activeHistoryItem.inputs).map(([k, v]) => (
                              <div key={k} className="summary-field">
                                <span className="field-key">{k}</span>
                                <span className="field-value">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Code output */}
                        <div className="detail-output">
                          <h4>Generated Report Output</h4>
                          <pre className="history-output-pre">
                            <code>{activeHistoryItem.output}</code>
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="detail-empty">
                        <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <p>Select an execution log from the list to view outputs and configurations.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* E. VOXSTAR CONNECT VIEW */}
          {currentView === 'voxstar' && (
            <VoxstarAutomation onBack={() => setCurrentView('dashboard')} />
          )}

          {/* F. CREATION > WIREDVIBE APP VIEW */}
          {currentView === 'creation-wiredvibe' && (
            <WiredvibeStudio
              onSelectTrackForVideo={(trackName) => {
                setActiveSoundscape(trackName);
                setCurrentView('creation-idea');
              }}
            />
          )}

          {/* G. CREATION > IDEA VIRAL VIDEO STUDIO VIEW */}
          {currentView === 'creation-idea' && (
            <DailyIdeaStudio
              initialSoundscape={activeSoundscape}
              onNavigateToWiredvibe={() => setCurrentView('creation-wiredvibe')}
            />
          )}

          {/* H. NEW DAILY > AUTOPILOT 6-STEP CONTENT ENGINE VIEW */}
          {currentView === 'daily-autopilot' && (
            <DailyAutopilotStudio
              initialServiceId={activeAutopilotServiceId}
            />
          )}
        </div>
      </main>

      {/* 4. SETTINGS CONFIG Vault MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        keys={keys}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* 5. SYSTEM MASTER GUIDE MODAL */}
      <SystemGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* 6. FLOATING QUICK HELP BUTTON */}
      <button
        className="floating-help-fab glass-panel animate-scale-in"
        onClick={() => setIsGuideOpen(true)}
        title="Open System Master Guide & Instructions"
        aria-label="Open System Master Guide"
      >
        <HelpCircle size={18} className="fab-icon" />
        <span>System Guide</span>
      </button>

      <style>{`
        .app-shell {
          display: grid;
          grid-template-columns: 280px 1fr;
          height: 100vh;
          overflow: hidden;
          background-color: var(--bg-dark);
        }

        @media (max-width: 768px) {
          .app-shell {
            grid-template-columns: 1fr;
          }
          .sidebar {
            display: none; /* simple toggle or responsive sidebar if needed */
          }
        }

        /* 1. SIDEBAR STYLING */
        .sidebar {
          height: 100%;
          border-radius: 0 !important;
          border-left: none !important;
          border-top: none !important;
          border-bottom: none !important;
          background: rgba(10, 15, 28, 0.7);
          display: flex;
          flex-direction: column;
          padding: 24px 20px;
          gap: 24px;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .brand-logo {
          color: var(--primary);
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
        }

        .brand-name {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #ffffff;
        }

        .design-spec-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--secondary), var(--accent)) !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }

        .design-spec-btn:hover {
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4), 0 0 10px rgba(236, 72, 153, 0.3) !important;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          width: 100%;
          text-align: left;
          transition: var(--transition-smooth);
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary-hover);
          font-weight: 600;
        }

        .history-badge {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.07);
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          flex-grow: 1;
        }

        .section-title {
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-weight: 700;
          margin-left: 10px;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 13px;
          width: 100%;
          text-align: left;
          transition: var(--transition-smooth);
        }

        .category-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
        }

        .category-item.active {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          font-weight: 600;
        }

        .cat-icon {
          font-size: 15px;
        }

        .cat-name {
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-count {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
        }

        /* 2. MAIN WORKSPACE STYLING */
        .content-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          padding: 20px;
          gap: 20px;
        }

        .main-header {
          display: flex;
          align-items: center;
          padding: 14px 20px;
          background: rgba(10, 15, 28, 0.45);
          height: 64px;
          border-radius: 14px;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-icon {
          color: var(--primary);
        }

        .status-text {
          font-size: 12.5px;
          font-weight: 500;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: rgba(5, 7, 12, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 6px 12px;
          gap: 8px;
          width: 320px;
          margin-left: 24px;
          transition: var(--transition-smooth);
        }

        .search-bar:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          color: var(--text-secondary);
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: #ffffff;
          outline: none;
          width: 100%;
          font-size: 13px;
        }

        .settings-toggle-btn {
          font-size: 13px;
          padding: 8px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .workspace-body {
          flex-grow: 1;
          overflow-y: auto;
          height: calc(100vh - 124px);
        }

        /* 3. DASHBOARD VIEW STYLING */
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 24px;
        }

        .dashboard-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
        }

        .summary-left h2 {
          font-size: 20px;
          font-weight: 700;
        }

        .summary-stats {
          display: flex;
          gap: 12px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 8px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-family: var(--font-heading);
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-hover);
        }

        .stat-label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .specialists-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 20px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
          gap: 12px;
          background: rgba(10, 15, 28, 0.2);
        }

        .empty-state h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .empty-state p {
          font-size: 13.5px;
          max-width: 320px;
        }

        /* 4. HISTORY VIEW STYLING */
        .history-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .history-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
        }

        .history-header-row h2 {
          font-size: 20px;
        }

        .history-workspace-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          height: calc(100vh - 220px);
          align-items: stretch;
        }

        .history-list {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: rgba(10, 15, 28, 0.45);
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border-glass);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .history-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .history-item.active {
          background: rgba(59, 130, 246, 0.08);
          border-left: 3px solid var(--primary);
          padding-left: 13px;
        }

        .history-item-icon {
          font-size: 24px;
        }

        .history-item-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .history-item-details h4 {
          font-size: 13.5px;
          color: #ffffff;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .history-arrow {
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .history-item:hover .history-arrow {
          color: #ffffff;
          transform: translateX(2px);
        }

        .history-detail {
          background: rgba(10, 15, 28, 0.45);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .history-detail-scroll {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
        }

        .detail-emoji {
          font-size: 32px;
        }

        .detail-header h3 {
          font-size: 18px;
          font-weight: 700;
        }

        .detail-time {
          font-size: 12px;
          color: var(--text-muted);
        }

        .detail-actions {
          margin-left: auto;
          display: flex;
          gap: 10px;
        }

        .detail-inputs-summary {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 16px;
        }

        .detail-inputs-summary h4, .detail-output h4 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .inputs-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }

        .summary-field {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .field-key {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .field-value {
          font-size: 13px;
          color: #ffffff;
          font-weight: 500;
        }

        .detail-output {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-grow: 1;
        }

        .history-output-pre {
          background: #090c12;
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 16px;
          overflow-x: auto;
          flex-grow: 1;
          min-height: 200px;
        }

        .history-output-pre code {
          font-family: var(--font-mono);
          font-size: 13px;
          color: #e5e7eb;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .detail-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
          color: var(--text-muted);
          font-size: 13.5px;
          padding: 40px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default App;
