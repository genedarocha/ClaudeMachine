import React, { useState, useEffect } from 'react';
import { Play, Copy, Check, ChevronLeft, RefreshCw, Trash2, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { type Specialist } from '../data/specialists';
import { type ApiKeys, type ModelSettings, runSpecialistStream } from '../utils/ai';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';

interface SpecialistRunnerProps {
  specialist: Specialist;
  keys: ApiKeys;
  settings: ModelSettings;
  onBack: () => void;
  onSaveHistory: (run: {
    id: string;
    specialistId: string;
    specialistName: string;
    specialistIcon: string;
    timestamp: number;
    inputs: Record<string, string>;
    output: string;
  }) => void;
}

// Simple Custom Markdown Formatter for rendering streaming output beautifully
const SafeMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return <p className="text-muted">Waiting for execution...</p>;

  // Convert simple markdown elements to React elements
  const lines = text.split('\n');
  let insideCodeBlock = false;
  let codeContent: string[] = [];
  let formattedElements: React.ReactNode[] = [];
  let elementKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code Block detection
    if (line.trim().startsWith('```')) {
      if (insideCodeBlock) {
        // Closing code block
        const codeText = codeContent.join('\n');
        formattedElements.push(
          <div key={`code-${elementKey++}`} className="code-container">
            <div className="code-header">
              <span>Code Block</span>
              <button 
                onClick={() => navigator.clipboard.writeText(codeText)}
                className="code-copy-btn"
                title="Copy code"
              >
                <Copy size={12} />
                Copy
              </button>
            </div>
            <pre><code>{codeText}</code></pre>
          </div>
        );
        codeContent = [];
        insideCodeBlock = false;
      } else {
        // Opening code block
        insideCodeBlock = true;
      }
      continue;
    }

    if (insideCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      formattedElements.push(<h1 key={elementKey++}>{line.replace('# ', '')}</h1>);
    } else if (line.startsWith('## ')) {
      formattedElements.push(<h2 key={elementKey++}>{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      formattedElements.push(<h3 key={elementKey++}>{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('#### ')) {
      formattedElements.push(<h4 key={elementKey++}>{line.replace('#### ', '')}</h4>);
    }
    // Blockquote alerts (GitHub Style)
    else if (line.startsWith('> [!NOTE]')) {
      formattedElements.push(
        <div key={elementKey++} className="alert-box alert-note">
          <AlertCircle size={14} />
          <span>{lines[i+1]?.replace('> ', '') || ''}</span>
        </div>
      );
      i++; // Skip the next line as we consumed it
    }
    else if (line.startsWith('> [!TIP]')) {
      formattedElements.push(
        <div key={elementKey++} className="alert-box alert-tip">
          <CheckCircle2 size={14} />
          <span>{lines[i+1]?.replace('> ', '') || ''}</span>
        </div>
      );
      i++;
    }
    else if (line.startsWith('> [!IMPORTANT]')) {
      formattedElements.push(
        <div key={elementKey++} className="alert-box alert-important">
          <AlertCircle size={14} />
          <span>{lines[i+1]?.replace('> ', '') || ''}</span>
        </div>
      );
      i++;
    }
    // Lists
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletText = line.replace(/^[\s*-]+/, '').trim();
      formattedElements.push(<li key={elementKey++}>{parseInlineStyles(bulletText)}</li>);
    }
    // Number lists
    else if (/^\d+\.\s/.test(line.trim())) {
      const itemText = line.replace(/^\d+\.\s+/, '').trim();
      formattedElements.push(<li key={elementKey++} style={{ listStyleType: 'decimal' }}>{parseInlineStyles(itemText)}</li>);
    }
    // Paragraphs
    else if (line.trim() !== '') {
      formattedElements.push(<p key={elementKey++}>{parseInlineStyles(line)}</p>);
    } else {
      formattedElements.push(<br key={elementKey++} />);
    }
  }

  // Handle unclosed code blocks gracefully
  if (insideCodeBlock && codeContent.length > 0) {
    formattedElements.push(
      <pre key={elementKey++}><code>{codeContent.join('\n')}</code></pre>
    );
  }

  return <div className="prose">{formattedElements}</div>;
};

// Parse basic inline styles like **bold** and `code`
function parseInlineStyles(text: string): React.ReactNode[] {
  // Regex to match bold and inline code
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export const SpecialistRunner: React.FC<SpecialistRunnerProps> = ({
  specialist,
  keys,
  settings,
  onBack,
  onSaveHistory
}) => {
  const [formInputs, setFormInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load default input values when specialist changes
  useEffect(() => {
    const defaults: Record<string, string> = {};
    specialist.inputs.forEach((input) => {
      defaults[input.id] = input.defaultValue || '';
    });
    setFormInputs(defaults);
    setOutput('');
    setError(null);
    setIsSaved(false);
  }, [specialist]);

  const handleInputChange = (id: string, value: string) => {
    setFormInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleRun = async () => {
    // Validate inputs
    const emptyFields = specialist.inputs.filter(
      (input) => !formInputs[input.id] || formInputs[input.id].trim() === ''
    );
    
    if (emptyFields.length > 0) {
      setError(`Please fill in all fields: ${emptyFields.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput('');
    setIsSaved(false);

    try {
      await runSpecialistStream(
        specialist,
        formInputs,
        keys,
        settings,
        (chunk) => {
          setOutput((prev) => prev + chunk);
        },
        (fullText) => {
          setIsRunning(false);
          // Automatically save completed run to history
          const runId = `run-${Date.now()}`;
          onSaveHistory({
            id: runId,
            specialistId: specialist.id,
            specialistName: specialist.name,
            specialistIcon: specialist.icon,
            timestamp: Date.now(),
            inputs: formInputs,
            output: fullText
          });
          setIsSaved(true);
        },
        (errMessage) => {
          setIsRunning(false);
          setError(errMessage);
        }
      );
    } catch (err: any) {
      setIsRunning(false);
      setError(err.message || 'An unexpected error occurred during execution.');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    const defaults: Record<string, string> = {};
    specialist.inputs.forEach((input) => {
      defaults[input.id] = '';
    });
    setFormInputs(defaults);
    setOutput('');
    setError(null);
    setIsSaved(false);
  };

  return (
    <div className="runner-workspace animate-fade">
      {/* Top action row */}
      <div className="runner-header">
        <button className="back-btn btn-secondary" onClick={onBack}>
          <ChevronLeft size={16} />
          Back to Specialists
        </button>
        <div className="runner-meta">
          <span className="runner-number">{specialist.number}</span>
          <span className="runner-emoji">{specialist.icon}</span>
          <h2>{specialist.name}</h2>
        </div>
      </div>

      {/* Screen Usage Guide */}
      <ScreenHelpBanner
        screenTitle={specialist.name}
        subtitle={specialist.description || "Configure specialist parameters to generate fine-tuned, AI-streamed outputs."}
        steps={[
          {
            number: 1,
            title: "Fill in Input Parameters",
            detail: "Provide details for each parameter below. Click the purple [Help] button next to any field label for specific input formatting guidelines."
          },
          {
            number: 2,
            title: "Click Run Specialist",
            detail: "Hit 'Run Specialist' to submit your context. The AI model will process the structured prompt template."
          },
          {
            number: 3,
            title: "Stream & Copy Results",
            detail: "Watch real-time output stream into the Generated Output pane. Copy results directly to your clipboard or save to Run History."
          }
        ]}
        proTip="More detailed and concrete input parameters produce far higher quality AI results."
        defaultExpanded={false}
      />

      <div className="runner-grid">
        {/* Left Side: Input Panel */}
        <div className="runner-panel glass-panel">
          <div className="panel-header">
            <BookOpen size={16} className="panel-header-icon" />
            <h3>Configure Specialist Inputs</h3>
          </div>
          
          <div className="panel-body">
            <p className="panel-instructions">
              Fill in the parameters below. The specialist will compile these into an optimized context prompt. Click <strong>[Help]</strong> next to any parameter label for guidance.
            </p>

            {specialist.inputs.map((input) => (
              <div key={input.id} className="form-group">
                <div className="label-with-help">
                  <label className="form-label">{input.label}</label>
                  <FieldHelpTooltip
                    label={input.label}
                    description={input.description || `Enter the ${input.label.toLowerCase()} to customize the specialist prompt execution.`}
                    placeholder={input.placeholder}
                    example={input.placeholder || `Sample ${input.label}`}
                    tips={[
                      "Be specific and clear.",
                      "Avoid ambiguous terms for better model accuracy.",
                      "Click clear below if you wish to reset form inputs."
                    ]}
                  />
                </div>
                
                {input.type === 'text' && (
                  <input
                    type="text"
                    className="input-field"
                    placeholder={input.placeholder}
                    value={formInputs[input.id] || ''}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    disabled={isRunning}
                  />
                )}

                {input.type === 'textarea' && (
                  <textarea
                    rows={6}
                    className="input-field"
                    placeholder={input.placeholder}
                    value={formInputs[input.id] || ''}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    disabled={isRunning}
                    style={{ resize: 'vertical' }}
                  />
                )}

                {input.type === 'select' && (
                  <select
                    className="input-field"
                    value={formInputs[input.id] || ''}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    disabled={isRunning}
                  >
                    <option value="" disabled>{input.placeholder}</option>
                    {input.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            
            {error && (
              <div className="error-alert animate-fade">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="panel-footer">
            <button className="btn btn-secondary" onClick={handleClear} disabled={isRunning}>
              <Trash2 size={16} />
              Clear
            </button>
            <button className="btn btn-primary" onClick={handleRun} disabled={isRunning}>
              {isRunning ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Specialist
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Output Panel */}
        <div className={`runner-panel glass-panel ${isRunning ? 'running-active' : ''}`}>
          <div className="panel-header">
            <FileText size={16} className="panel-header-icon" />
            <h3>Generated Output</h3>
            <div className="header-actions">
              {isSaved && (
                <span className="saved-indicator animate-fade">
                  Saved to history
                </span>
              )}
              {output && (
                <button className="btn-icon" onClick={handleCopy} title="Copy output">
                  {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div className="panel-body output-area">
            <SafeMarkdown text={output} />
          </div>
        </div>
      </div>

      <style>{`
        .runner-workspace {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .runner-header {
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
        }

        .back-btn {
          font-size: 13.5px;
          padding: 8px 14px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .runner-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .runner-number {
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .runner-emoji {
          font-size: 26px;
        }

        .runner-grid {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 20px;
          align-items: stretch;
          flex-grow: 1;
          height: calc(100vh - 120px);
        }

        @media (max-width: 1024px) {
          .runner-grid {
            grid-template-columns: 1fr;
            height: auto;
          }
        }

        .runner-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(10, 15, 28, 0.45);
          overflow: hidden;
        }

        .runner-panel.running-active {
          border-color: rgba(59, 130, 246, 0.35);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-glass);
          background: rgba(10, 15, 28, 0.2);
        }

        .panel-header-icon {
          color: var(--primary);
        }

        .panel-header h3 {
          font-size: 14.5px;
          font-weight: 600;
          flex-grow: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .saved-indicator {
          font-size: 11px;
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .btn-icon {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .panel-body {
          padding: 20px;
          overflow-y: auto;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .panel-instructions {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
        }

        .panel-footer {
          display: flex;
          justify-content: space-between;
          padding: 16px 20px;
          border-top: 1px solid var(--border-glass);
          background: rgba(10, 15, 28, 0.2);
        }

        .output-area {
          font-family: var(--font-body);
          background: rgba(5, 7, 12, 0.3);
          border-radius: 0 0 16px 16px;
        }

        .code-container {
          background: #090c12;
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          margin: 14px 0;
          overflow: hidden;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-glass);
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-secondary);
        }

        .code-copy-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition-smooth);
        }

        .code-copy-btn:hover {
          color: var(--primary-hover);
        }

        .prose pre {
          margin: 0;
          padding: 16px;
          background: transparent;
          border: none;
        }

        .prose pre code {
          font-family: var(--font-mono);
          font-size: 13px;
          color: #e5e7eb;
        }

        .alert-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 10px;
          margin: 14px 0;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .alert-note {
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        }

        .alert-tip {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
        }

        .alert-important {
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: #c7d2fe;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};
