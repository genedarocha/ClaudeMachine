import React, { useState, useEffect } from 'react';
import { Sparkles, UserPlus, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';
import { type Specialist } from '../data/specialists';
import { type ApiKeys, type ModelSettings, generateNewSpecialist } from '../utils/ai';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';

interface SpecialistGeneratorProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onDeploy: (specialist: Specialist) => void;
  onCancel: () => void;
}

const GENERATION_STEPS = [
  'Analyzing role requirements...',
  'Determining appropriate specialist category...',
  'Designing optimized input fields...',
  'Formulating advanced system prompt...',
  'Compiling metadata and icons...',
  'Deploying final configuration...'
];

export const SpecialistGenerator: React.FC<SpecialistGeneratorProps> = ({
  keys,
  settings,
  onDeploy,
  onCancel
}) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [generatedSpecialist, setGeneratedSpecialist] = useState<Specialist | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading steps during generation
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < GENERATION_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe the specialist you want to create.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedSpecialist(null);

    try {
      const result = await generateNewSpecialist(description, keys, settings);
      setGeneratedSpecialist(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to design custom specialist. Please ensure your API Key is configured in settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = () => {
    if (generatedSpecialist) {
      onDeploy(generatedSpecialist);
    }
  };

  return (
    <div className="generator-container animate-fade">
      <div className="generator-header">
        <Sparkles size={24} className="header-glow-icon" />
        <div>
          <h2>Dynamic Specialist Generator</h2>
          <p className="subtitle">Instruct the machine to custom-engineer a new specialized business agent for your team.</p>
        </div>
      </div>

      <ScreenHelpBanner
        screenTitle="AI Agent Synthesis Studio"
        subtitle="Turn any plain text prompt or role description into a full custom agent complete with input fields and system prompts."
        steps={[
          {
            number: 1,
            title: "Describe the Role",
            detail: "Enter the agent persona, target audience, inputs required, and desired output format in the text area below."
          },
          {
            number: 2,
            title: "Generate Specialist",
            detail: "Click 'Generate Specialist'. The meta-prompt engine will synthesize input form schemas, prompt templates, and icons."
          },
          {
            number: 3,
            title: "Deploy to Dashboard",
            detail: "Review the engineered agent structure and click 'Deploy Specialist to Dashboard' to start using it immediately."
          }
        ]}
        proTip="Specify exact inputs you want the form to collect, e.g. 'Inputs: Target Product, Tone, Audience'."
        defaultExpanded={false}
      />

      {!generatedSpecialist ? (
        <div className="generator-workspace glass-panel">
          <div className="generator-form-panel">
            <div className="form-group">
              <div className="label-with-help">
                <label className="form-label">Describe the Specialist's Role & Output</label>
                <FieldHelpTooltip
                  label="Role & Output Description"
                  description="Specify what persona the agent should adopt, what data fields it needs from the user, and how it should format its response."
                  placeholder="e.g., A LinkedIn Ad Hook Writer that takes product details and creates 15 viral hook options..."
                  example="A customer support specialist that takes a refund request, customer complaint, and policy guidelines to draft an empathetic response."
                  tips={[
                    "Include the goal of the specialist.",
                    "Mention any specific input parameters you want (e.g. Tone, Target Market, Keywords).",
                    "Define output structure like bullet points, tables, or step-by-step frameworks."
                  ]}
                />
              </div>
              <textarea
                rows={5}
                className="input-field description-input"
                placeholder="e.g., A LinkedIn Ad Hook Writer that takes my product details and creates 15 viral options specifically targeted at SaaS CTOs with formatting and scores..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isGenerating}
              />
              <span className="form-description">
                Be specific about what context the specialist needs to gather, what role they play, and the exact style of output they should deliver.
              </span>
            </div>

            {error && (
              <div className="error-alert animate-fade">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="action-row">
              <button className="btn btn-secondary" onClick={onCancel} disabled={isGenerating}>
                Cancel
              </button>
              <button 
                className="btn btn-primary btn-generate" 
                onClick={handleGenerate} 
                disabled={isGenerating || !description.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="spin-loader" />
                    Engineering Agent...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Specialist
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="generator-info-panel">
            <h4>
              <HelpCircle size={16} style={{ color: 'var(--primary)' }} />
              How It Works
            </h4>
            <ul className="info-list">
              <li>
                <strong>Role Discovery</strong>: The LLM analyzes your request to identify the optimal business persona.
              </li>
              <li>
                <strong>Variable Design</strong>: It automatically structures the necessary input form fields (names, select options, placeholders) so you can run the agent dynamically.
              </li>
              <li>
                <strong>System Prompt Architecture</strong>: It crafts a deeply engineered system prompt utilizing rules, examples, and formatting parameters to ensure high-quality outputs.
              </li>
            </ul>
            
            {isGenerating && (
              <div className="generation-progress-box animate-fade">
                <div className="loading-bar">
                  <div className="loading-bar-fill" style={{ width: `${((stepIndex + 1) / GENERATION_STEPS.length) * 100}%` }} />
                </div>
                <p className="progress-step-text">{GENERATION_STEPS[stepIndex]}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="generator-preview-workspace glass-panel-glow animate-slide-up">
          <div className="preview-header">
            <div className="preview-icon-wrapper">
              <span className="preview-icon">{generatedSpecialist.icon}</span>
            </div>
            <div>
              <h3>Specialist Designed: {generatedSpecialist.name}</h3>
              <span className="badge badge-purple">{generatedSpecialist.category}</span>
            </div>
          </div>

          <div className="preview-body">
            <div className="preview-section">
              <h4>Role Description</h4>
              <p className="preview-desc-text">{generatedSpecialist.description}</p>
            </div>

            <div className="preview-section">
              <h4>Generated Input Variables</h4>
              <div className="preview-inputs-grid">
                {generatedSpecialist.inputs.map((input) => (
                  <div key={input.id} className="preview-input-card">
                    <span className="input-card-name">{input.label}</span>
                    <span className="input-card-type">{input.type.toUpperCase()}</span>
                    <span className="input-card-placeholder">Placeholder: "{input.placeholder}"</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="preview-section">
              <h4>Prompt Template Snippet</h4>
              <pre className="preview-prompt-pre">
                <code>
                  {generatedSpecialist.promptTemplate.length > 300 
                    ? `${generatedSpecialist.promptTemplate.substring(0, 300)}...` 
                    : generatedSpecialist.promptTemplate}
                </code>
              </pre>
            </div>
          </div>

          <div className="preview-footer">
            <button className="btn btn-secondary" onClick={() => setGeneratedSpecialist(null)}>
              Design Another / Adjust Description
            </button>
            <button className="btn btn-primary" onClick={handleDeploy}>
              <UserPlus size={16} />
              Deploy Specialist to Team
            </button>
          </div>
        </div>
      )}

      <style>{`
        .generator-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .generator-header {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 16px;
        }

        .header-glow-icon {
          color: var(--secondary);
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
        }

        .subtitle {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .generator-workspace {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          padding: 24px;
          background: rgba(10, 15, 28, 0.45);
        }

        @media (max-width: 1024px) {
          .generator-workspace {
            grid-template-columns: 1fr;
          }
        }

        .generator-form-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .description-input {
          font-size: 14.5px;
          line-height: 1.5;
        }

        .action-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
          margin-top: 12px;
        }

        .btn-generate {
          background: linear-gradient(135deg, var(--secondary), var(--accent)) !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .btn-generate:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5), 0 0 10px rgba(236, 72, 153, 0.3) !important;
          filter: brightness(1.1);
        }

        .generator-info-panel {
          border-left: 1px solid var(--border-glass);
          padding-left: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .generator-info-panel {
            border-left: none;
            border-top: 1px solid var(--border-glass);
            padding-left: 0;
            padding-top: 24px;
          }
        }

        .generator-info-panel h4 {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .info-list strong {
          color: #ffffff;
        }

        .generation-progress-box {
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loading-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          overflow: hidden;
        }

        .loading-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--secondary), var(--accent));
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        .progress-step-text {
          font-size: 12px;
          color: #ffffff;
          font-weight: 500;
        }

        /* Preview State Styles */
        .generator-preview-workspace {
          background: rgba(13, 19, 33, 0.7) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
          box-shadow: var(--shadow-glow-purple), var(--shadow-lg) !important;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border-glass);
          padding-bottom: 20px;
        }

        .preview-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-icon {
          font-size: 30px;
        }

        .preview-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .preview-section h4 {
          font-size: 13.5px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .preview-desc-text {
          font-size: 14.5px;
          color: #ffffff;
        }

        .preview-inputs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .preview-input-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-card-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #ffffff;
        }

        .input-card-type {
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--secondary);
          font-weight: 700;
        }

        .input-card-placeholder {
          font-size: 11px;
          color: var(--text-muted);
        }

        .preview-prompt-pre {
          background: #07090e;
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
        }

        .preview-prompt-pre code {
          font-family: var(--font-mono);
          font-size: 12.5px;
          color: var(--text-secondary);
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .preview-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
        }

        @keyframes spin-loader {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin-loader {
          animation: spin-loader 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
