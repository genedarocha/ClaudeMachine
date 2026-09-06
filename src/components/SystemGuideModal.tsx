import React, { useState } from 'react';
import { HelpCircle, X, Terminal, Zap, Layers, BookOpen, Key, Video } from 'lucide-react';

interface SystemGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'runner' | 'generator' | 'daily' | 'voxstar' | 'keys'>('overview');

  if (!isOpen) return null;

  return (
    <div className="settings-overlay animate-fade" style={{ zIndex: 1000 }}>
      <div className="system-guide-container glass-panel animate-slide-up">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title-group">
            <HelpCircle className="settings-title-icon text-accent" size={22} />
            <div>
              <h2>Claude Machine Master System Guide</h2>
              <span className="text-xs text-muted">Complete user documentation & screen navigation reference</span>
            </div>
          </div>
          <button className="settings-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="guide-tab-row">
          <button
            className={`guide-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BookOpen size={14} />
            System Overview
          </button>
          <button
            className={`guide-tab-btn ${activeTab === 'runner' ? 'active' : ''}`}
            onClick={() => setActiveTab('runner')}
          >
            <Terminal size={14} />
            Running Specialists
          </button>
          <button
            className={`guide-tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <Zap size={14} />
            Designing Agents
          </button>
          <button
            className={`guide-tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <Video size={14} />
            Daily Video & Wiredvibe
          </button>
          <button
            className={`guide-tab-btn ${activeTab === 'voxstar' ? 'active' : ''}`}
            onClick={() => setActiveTab('voxstar')}
          >
            <Layers size={14} />
            Voxstar MCP Studio
          </button>
          <button
            className={`guide-tab-btn ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            <Key size={14} />
            API Keys & Provider Setup
          </button>
        </div>

        {/* Guide Content Body */}
        <div className="guide-body-content">
          {activeTab === 'overview' && (
            <div className="guide-section animate-fade">
              <h3>⚡ Welcome to Claude Machine</h3>
              <p>
                Claude Machine is a high-performance AI agent suite and automation studio. It turns standard business tasks into fine-tuned specialist agents with structured parameters.
              </p>

              <div className="guide-feature-grid">
                <div className="guide-card">
                  <h4>1. Agent Dashboard</h4>
                  <p>Browse over 100+ pre-built specialist prompt engines categorized by role (Copywriting, Sales, Social Media, Strategy, Customer Service, Operations, etc.).</p>
                </div>
                <div className="guide-card">
                  <h4>2. Field-Level Guidance</h4>
                  <p>Every single input parameter across every specialist form has a dedicated <strong>[Help]</strong> button next to its label explaining format, purpose, and concrete examples.</p>
                </div>
                <div className="guide-card">
                  <h4>3. AI Agent Generator</h4>
                  <p>Need a custom specialist? Simply describe the role in plain text, and the system synthesizes full prompt templates and input fields automatically.</p>
                </div>
                <div className="guide-card">
                  <h4>4. Voxstar MCP Connect</h4>
                  <p>Queue and publish automated social media posts to LinkedIn, Twitter, Facebook, and TikTok directly using Model Context Protocol (MCP) integrations.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'runner' && (
            <div className="guide-section animate-fade">
              <h3>🎯 How to Execute a Specialist</h3>
              <ol className="guide-ordered-list">
                <li>Select any specialist card from the <strong>Agent Dashboard</strong>.</li>
                <li>Review the parameter fields under <strong>Configure Specialist Inputs</strong>.</li>
                <li>If you are unsure what to enter for any parameter, click the purple <strong>[Help]</strong> badge next to the field label.</li>
                <li>Click <strong>Run Specialist</strong> to stream the output from your active AI model in real time.</li>
                <li>Use <strong>Copy</strong> to send output to your clipboard, or review past runs in <strong>Run History</strong>.</li>
              </ol>
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="guide-section animate-fade">
              <h3>🎨 Designing Custom Specialists</h3>
              <p>Click <strong>+ Design Specialist</strong> in the sidebar to open the AI Agent Synthesis Studio.</p>
              <ul className="guide-bullet-list">
                <li><strong>Role Description:</strong> Type a detailed task (e.g. <em>"A customer support agent that drafts empathetic responses to refund requests"</em>).</li>
                <li><strong>Automated Synthesis:</strong> The system formulates system prompts, category tags, icons, and dynamic parameters.</li>
                <li><strong>Instant Deployment:</strong> Once generated, the custom specialist is automatically deployed to your workspace.</li>
              </ul>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="guide-section animate-fade">
              <h3>📹 Daily Autopilot Content Engine (7-Step Pipeline)</h3>
              <p>The <strong>Daily</strong> autopilot suite runs 7 automated steps for <strong>Wiredvibe App</strong>, <strong>AIToolboard</strong>, <strong>ATL-Trust</strong>, and custom websites:</p>
              <ul className="guide-bullet-list">
                <li><strong>7-Step Automated Pipeline:</strong> Step 1 Idea ➔ Step 2 Fast AI Video Gen ➔ Step 3 YouTube Channel SEO ➔ Step 4 TikTok ➔ Step 5 X ➔ Step 6 Instagram ➔ Step 7 Blog Article &amp; Written Posts.</li>
                <li><strong>Written Content Channels:</strong> Step 7 generates an SEO Markdown blog article with backlinks and posts written content to <strong>LinkedIn</strong>, <strong>Facebook Groups</strong>, <strong>Reddit (r/voxstar)</strong>, and <strong>X</strong>.</li>
                <li><strong>Autopilot Scheduler:</strong> Morning, Noon &amp; Evening automated trigger slots to keep content updated hands-free.</li>
              </ul>
            </div>
          )}

          {activeTab === 'voxstar' && (
            <div className="guide-section animate-fade">
              <h3>📡 Voxstar Connect & Social Automation</h3>
              <p>Automate multi-channel distribution directly from Claude Machine.</p>
              <ul className="guide-bullet-list">
                <li><strong>MCP Connector URL:</strong> Enter your Voxstar Server Endpoint (default: <code>mcp.voxstar.ai/mcp</code>).</li>
                <li><strong>Queue & Schedule:</strong> Draft captions, pick platforms (LinkedIn, Twitter, Facebook, TikTok), and schedule post release times.</li>
                <li><strong>Local Folder Connect:</strong> Connect local media files to auto-attach assets to scheduled posts.</li>
              </ul>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="guide-section animate-fade">
              <h3>🔑 API Keys & Model Providers</h3>
              <p>Click <strong>Settings</strong> at the top right of the top bar to configure AI execution settings.</p>
              <div className="guide-key-providers">
                <div className="provider-info-box">
                  <strong>Demo Mode (Mock):</strong> Default simulation mode. Test all UI features, form inputs, and generation workflows without API keys.
                </div>
                <div className="provider-info-box">
                  <strong>Google Gemini API:</strong> Enter key from Google AI Studio (models: <code>gemini-2.5-flash</code>, <code>gemini-2.5-pro</code>).
                </div>
                <div className="provider-info-box">
                  <strong>Anthropic Claude API:</strong> Enter key from Anthropic Console (models: <code>claude-3-5-sonnet</code>, <code>claude-3-5-haiku</code>).
                </div>
                <div className="provider-info-box">
                  <strong>OpenAI API:</strong> Enter key from OpenAI Platform (models: <code>gpt-4o-mini</code>, <code>gpt-4o</code>).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="settings-footer" style={{ justifyContent: 'space-between' }}>
          <span className="text-xs text-muted">Press ESC or click close to return to workspace</span>
          <button className="btn btn-primary" onClick={onClose}>
            Got it! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
