import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, Lightbulb, CheckCircle, X } from 'lucide-react';

interface FieldHelpTooltipProps {
  label: string;
  description?: string;
  placeholder?: string;
  example?: string;
  tips?: string[];
}

export const FieldHelpTooltip: React.FC<FieldHelpTooltipProps> = ({
  label,
  description,
  placeholder,
  example,
  tips
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="field-help-wrapper inline-block relative ml-2">
      <button
        ref={buttonRef}
        type="button"
        className={`field-help-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Help for ${label}`}
        aria-label={`Help guide for ${label}`}
      >
        <HelpCircle size={14} className="help-icon" />
        <span className="help-badge-text">Help</span>
      </button>

      {isOpen && (
        <div ref={popoverRef} className="field-help-popover glass-panel animate-scale-in">
          <div className="popover-header">
            <div className="popover-title">
              <Info size={14} className="text-accent" />
              <span>Input Guide: <strong>{label}</strong></span>
            </div>
            <button 
              type="button" 
              className="popover-close-btn"
              onClick={() => setIsOpen(false)}
            >
              <X size={12} />
            </button>
          </div>

          <div className="popover-body">
            {description && (
              <div className="popover-section">
                <h5 className="section-label">What to enter:</h5>
                <p className="popover-text">{description}</p>
              </div>
            )}

            {placeholder && (
              <div className="popover-section">
                <h5 className="section-label">Format / Placeholder:</h5>
                <code className="popover-code">{placeholder}</code>
              </div>
            )}

            {example && (
              <div className="popover-section">
                <h5 className="section-label">
                  <Lightbulb size={12} className="text-amber" /> Best Example Input:
                </h5>
                <div className="popover-example-box">
                  "{example}"
                </div>
              </div>
            )}

            {tips && tips.length > 0 && (
              <div className="popover-section">
                <h5 className="section-label">
                  <CheckCircle size={12} className="text-emerald" /> Optimization Tips:
                </h5>
                <ul className="popover-tips-list">
                  {tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
