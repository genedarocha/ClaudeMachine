import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Eye, EyeOff, Check, RefreshCw } from 'lucide-react';
import { type ApiKeys, type ModelSettings, listModels } from '../utils/ai';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ApiKeys;
  settings: ModelSettings;
  onSave: (keys: ApiKeys, settings: ModelSettings) => void;
}

// Starting suggestions only. "Load my models" asks the provider which models this key can use, and
// any model ID can be typed in, so the app doesn't go stale when providers ship new models.
const PROVIDER_MODELS: Record<ModelSettings['provider'], string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  anthropic: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-fable-5-1'],
  grok: ['grok-4', 'grok-4-1-fast-reasoning'],
  mock: ['Demo Simulated Model']
};

const PROVIDER_LABELS: Record<ModelSettings['provider'], string> = {
  mock: 'Demo Mode',
  gemini: 'Gemini',
  openai: 'ChatGPT',
  anthropic: 'Claude',
  grok: 'Grok'
};

const MODEL_LIST_KEY = 'claude_machine_model_lists';

const loadModelLists = (): Partial<Record<ModelSettings['provider'], string[]>> => {
  try {
    return JSON.parse(localStorage.getItem(MODEL_LIST_KEY) || '{}');
  } catch {
    return {};
  }
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  keys,
  settings,
  onSave
}) => {
  const [localKeys, setLocalKeys] = useState<ApiKeys>({ ...keys });
  const [localSettings, setLocalSettings] = useState<ModelSettings>({ ...settings });

  // The modal is mounted before App has loaded saved keys from storage, so re-sync every time it
  // opens. Without this, Settings showed empty boxes after a reload and Save wiped the saved keys.
  useEffect(() => {
    if (!isOpen) return;
    setLocalKeys({ ...keys });
    setLocalSettings({ ...settings });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    gemini: false,
    openai: false,
    anthropic: false,
    grok: false
  });
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [modelLists, setModelLists] = useState(loadModelLists);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [customModel, setCustomModel] = useState(false);

  if (!isOpen) return null;

  const modelOptions = (provider: ModelSettings['provider']) =>
    Array.from(new Set([...(modelLists[provider] || []), ...PROVIDER_MODELS[provider]]));

  const handleLoadModels = async () => {
    const provider = localSettings.provider;
    if (provider === 'mock') return;
    setLoadingModels(true);
    setModelError(null);
    try {
      const ids = (await listModels(provider, localKeys[provider] || '')).sort();
      if (!ids.length) throw new Error('No models came back for this key.');
      const next = { ...modelLists, [provider]: ids };
      setModelLists(next);
      try { localStorage.setItem(MODEL_LIST_KEY, JSON.stringify(next)); } catch { /* storage blocked */ }
    } catch (err) {
      setModelError(err instanceof Error ? err.message : 'Could not load models.');
    } finally {
      setLoadingModels(false);
    }
  };

  const handleProviderChange = (provider: ModelSettings['provider']) => {
    setCustomModel(false);
    setModelError(null);
    const defaultModel = PROVIDER_MODELS[provider][0];
    setLocalSettings({
      provider,
      model: defaultModel
    });
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSave = () => {
    onSave(localKeys, localSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="settings-overlay animate-fade">
      <div className="settings-container glass-panel animate-slide-up">
        <div className="settings-header">
          <div className="settings-title-group">
            <Key className="settings-title-icon" size={20} />
            <h2>System Settings</h2>
          </div>
          <button className="settings-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* Screen Usage Guide inside Settings */}
          <ScreenHelpBanner
            screenTitle="System & Model Credentials Settings"
            subtitle="Configure active AI provider credentials and pick underlying model architecture."
            steps={[
              {
                number: 1,
                title: "Choose Provider Mode",
                detail: "Select Demo Mode to test without API keys, or pick Gemini, OpenAI, or Anthropic for live AI streaming."
              },
              {
                number: 2,
                title: "Enter API Key",
                detail: "Paste your API key into the corresponding vault input. Keys are encrypted in your local browser storage."
              },
              {
                number: 3,
                title: "Save & Apply Settings",
                detail: "Click 'Save Configuration' at the bottom to lock in settings across all specialist runs."
              }
            ]}
            proTip="Google Gemini has native browser CORS support and offers extremely fast streaming performance."
            defaultExpanded={false}
          />

          {/* Active Model / Provider Section */}
          <div className="settings-section">
            <h3 className="section-subtitle">
              <Cpu size={15} style={{ marginRight: '6px' }} />
              Active AI Configuration
            </h3>
            
            <div className="form-group">
              <div className="label-with-help">
                <label className="form-label">API Provider</label>
                <FieldHelpTooltip
                  label="API Provider"
                  description="Choose which model engine provider executes specialist prompts."
                  placeholder="Demo / Gemini / OpenAI / Anthropic"
                  example="Demo Mode (Simulation)"
                  tips={[
                    "Demo Mode allows full testing without consuming API quota.",
                    "Live providers require valid API keys entered below."
                  ]}
                />
              </div>
              <div className="provider-grid">
                {(['mock', 'anthropic', 'gemini', 'openai', 'grok'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    className={`provider-btn ${localSettings.provider === prov ? 'active' : ''}`}
                    onClick={() => handleProviderChange(prov)}
                  >
                    <span className="provider-dot" />
                    {PROVIDER_LABELS[prov]}
                  </button>
                ))}
              </div>
            </div>

            {localSettings.provider !== 'mock' && (
              <div className="form-group">
                <div className="label-with-help">
                  <label className="form-label">Model Selection</label>
                  <FieldHelpTooltip
                    label="Model Selection"
                    description="Select the specific LLM model variant for your chosen provider."
                    placeholder="claude-opus-5-5 / gemini-2.5-flash / gpt-4o / grok-4"
                    example="gemini-2.5-flash"
                    tips={[
                      "Flash/Haiku models are faster and lower latency.",
                      "Pro/Sonnet models provide maximum reasoning depth for complex prompts."
                    ]}
                  />
                </div>
                {customModel ? (
                  <input
                    className="input-field"
                    value={localSettings.model}
                    placeholder="Type the exact model ID"
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, model: e.target.value.trim() }))}
                  />
                ) : (
                  <select
                    className="input-field"
                    value={localSettings.model}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, model: e.target.value }))}
                  >
                    {Array.from(new Set([localSettings.model, ...modelOptions(localSettings.provider)])).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                )}
                <div className="model-tools">
                  <button type="button" className="model-tool-btn" onClick={handleLoadModels} disabled={loadingModels}>
                    <RefreshCw size={12} /> {loadingModels ? 'Loading…' : 'Load my models'}
                  </button>
                  <button type="button" className="model-tool-btn" onClick={() => setCustomModel(!customModel)}>
                    {customModel ? 'Pick from list' : 'Type a model ID'}
                  </button>
                  {modelLists[localSettings.provider] && <span className="model-count">{modelLists[localSettings.provider]!.length} models available to your key</span>}
                </div>
                {modelError && <div className="form-description"><span className="warning-text">{modelError}</span></div>}
              </div>
            )}
          </div>

          {/* API Keys Configuration */}
          <div className="settings-section">
            <h3 className="section-subtitle">
              <Key size={15} style={{ marginRight: '6px' }} />
              API Key Vault (Stored Locally)
            </h3>

            {/* Gemini Key */}
            <div className="form-group">
              <div className="form-label-row">
                <div className="label-with-help">
                  <label className="form-label">Gemini API Key</label>
                  <FieldHelpTooltip
                    label="Gemini API Key"
                    description="Your private Google AI Studio API key starting with AIzaSy..."
                    placeholder="AIzaSy..."
                    example="AIzaSyA1b2C3d4E5f6G7h8..."
                    tips={[
                      "Get a free key from Google AI Studio (aistudio.google.com).",
                      "Keys are saved securely in local browser storage only."
                    ]}
                  />
                </div>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="settings-link"
                >
                  Get Key
                </a>
              </div>
              <div className="key-input-wrapper">
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  className="input-field key-input"
                  placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
                  value={localKeys.gemini || ''}
                  onChange={(e) => setLocalKeys(prev => ({ ...prev, gemini: e.target.value }))}
                />
                <button 
                  type="button" 
                  className="key-toggle" 
                  onClick={() => toggleShowKey('gemini')}
                >
                  {showKeys.gemini ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="form-description">Gemini has native CORS support and runs flawlessly inside browser apps.</div>
            </div>

            {/* OpenAI Key */}
            <div className="form-group">
              <div className="form-label-row">
                <div className="label-with-help">
                  <label className="form-label">OpenAI API Key</label>
                  <FieldHelpTooltip
                    label="OpenAI API Key"
                    description="Your OpenAI API Key starting with sk-..."
                    placeholder="sk-proj-..."
                    example="sk-proj-1234567890abcdef..."
                    tips={[
                      "Get your key from platform.openai.com/api-keys.",
                      "Required if selecting OpenAI as active provider."
                    ]}
                  />
                </div>
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="settings-link"
                >
                  Get Key
                </a>
              </div>
              <div className="key-input-wrapper">
                <input
                  type={showKeys.openai ? 'text' : 'password'}
                  className="input-field key-input"
                  placeholder="Paste OpenAI API Key (e.g. sk-proj-...)"
                  value={localKeys.openai || ''}
                  onChange={(e) => setLocalKeys(prev => ({ ...prev, openai: e.target.value }))}
                />
                <button 
                  type="button" 
                  className="key-toggle" 
                  onClick={() => toggleShowKey('openai')}
                >
                  {showKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="form-description">Required for GPT-4o models.</div>
            </div>

            {/* Anthropic Key */}
            <div className="form-group">
              <div className="form-label-row">
                <div className="label-with-help">
                  <label className="form-label">Anthropic Claude Key</label>
                  <FieldHelpTooltip
                    label="Anthropic Claude Key"
                    description="Your private key from console.anthropic.com starting with sk-ant-..."
                    placeholder="sk-ant-..."
                    example="sk-ant-api03-12345..."
                    tips={[
                      "Required if selecting Claude as the active provider.",
                      "Stored strictly on client browser."
                    ]}
                  />
                </div>
                <a 
                  href="https://console.anthropic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="settings-link"
                >
                  Get Key
                </a>
              </div>
              <div className="key-input-wrapper">
                <input
                  type={showKeys.anthropic ? 'text' : 'password'}
                  className="input-field key-input"
                  placeholder="Paste Claude API Key (e.g. sk-ant-...)"
                  value={localKeys.anthropic || ''}
                  onChange={(e) => setLocalKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                />
                <button 
                  type="button" 
                  className="key-toggle" 
                  onClick={() => toggleShowKey('anthropic')}
                >
                  {showKeys.anthropic ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="form-description">
                Claude runs through Anthropic's official SDK in browser mode, with your key kept in this browser only.
              </div>
            </div>

            {/* Grok Key */}
            <div className="form-group">
              <div className="key-label-row">
                <div className="label-with-help">
                  <label className="form-label">Grok (xAI) API Key</label>
                  <FieldHelpTooltip
                    label="Grok API Key"
                    description="Your key from console.x.ai, starting with xai-..."
                    placeholder="xai-..."
                    example="xai-1234..."
                    tips={[
                      "Required if selecting Grok as the active provider.",
                      "Stored strictly on client browser."
                    ]}
                  />
                </div>
                <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer" className="settings-link">
                  Get Key
                </a>
              </div>
              <div className="key-input-wrapper">
                <input
                  type={showKeys.grok ? 'text' : 'password'}
                  className="input-field key-input"
                  placeholder="Paste Grok API Key (e.g. xai-...)"
                  value={localKeys.grok || ''}
                  onChange={(e) => setLocalKeys(prev => ({ ...prev, grok: e.target.value }))}
                />
                <button type="button" className="key-toggle" onClick={() => toggleShowKey('grok')}>
                  {showKeys.grok ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={savedSuccess}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={savedSuccess}>
            {savedSuccess ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              'Save Config'
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        .settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 6, 11, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .settings-container {
          width: 520px;
          max-width: 100%;
          border-radius: 20px;
          background: rgba(13, 19, 33, 0.85) !important;
          border: 1px solid rgba(59, 130, 246, 0.2) !important;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-glass);
        }

        .settings-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .settings-title-icon {
          color: var(--primary);
        }

        .settings-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .settings-close:hover {
          color: #ffffff;
        }

        .settings-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 8px;
          display: flex;
          align-items: center;
        }

        .model-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 8px; }
        .model-tool-btn { background: none; border: 1px solid var(--border-glass); border-radius: 6px; color: var(--text-secondary); font-size: 12px; padding: 4px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
        .model-tool-btn:hover:not(:disabled) { color: var(--primary); border-color: var(--primary); }
        .model-count { color: var(--text-muted); font-size: 12px; }
        .provider-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 4px;
        }

        .provider-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: var(--transition-smooth);
        }

        .provider-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .provider-btn.active {
          background: rgba(59, 130, 246, 0.1);
          border-color: var(--primary);
          color: #ffffff;
        }

        .provider-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: var(--transition-smooth);
        }

        .provider-btn.active .provider-dot {
          background: var(--primary);
          box-shadow: 0 0 8px var(--primary);
        }

        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .settings-link {
          font-size: 12px;
          color: var(--primary);
        }

        .key-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .key-input {
          padding-right: 44px;
        }

        .key-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .key-toggle:hover {
          color: #ffffff;
        }

        .warning-text {
          color: var(--warning);
          font-size: 11px;
        }

        .settings-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--border-glass);
          background: rgba(10, 15, 28, 0.4);
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
        }
      `}</style>
    </div>
  );
};
