import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface StepGuide {
  number: number;
  title: string;
  detail: string;
}

interface ScreenHelpBannerProps {
  screenTitle: string;
  subtitle: string;
  steps: StepGuide[];
  proTip?: string;
  defaultExpanded?: boolean;
}

export const ScreenHelpBanner: React.FC<ScreenHelpBannerProps> = ({
  screenTitle,
  subtitle,
  steps,
  proTip,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="screen-help-banner glass-panel animate-fade">
      <div 
        className="help-banner-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
      >
        <div className="banner-title-group">
          <div className="banner-badge">
            <BookOpen size={16} />
            <span>Screen Guide</span>
          </div>
          <h3>How to use: <strong>{screenTitle}</strong></h3>
          <span className="banner-subtitle-preview">{subtitle}</span>
        </div>

        <button 
          className="banner-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-label={isExpanded ? "Collapse Help" : "Expand Help"}
        >
          {isExpanded ? (
            <>
              <span>Hide Guide</span>
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <span>View Guide</span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="help-banner-body animate-slide-down">
          <p className="banner-description">{subtitle}</p>

          <div className="banner-steps-grid">
            {steps.map((step) => (
              <div key={step.number} className="banner-step-card">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-detail">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {proTip && (
            <div className="banner-protip">
              <Sparkles size={16} className="protip-icon" />
              <div className="protip-text">
                <strong>Pro Tip:</strong> {proTip}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
