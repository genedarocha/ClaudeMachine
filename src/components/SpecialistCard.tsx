import React from 'react';
import { ArrowRight, User } from 'lucide-react';
import { type Specialist } from '../data/specialists';

interface SpecialistCardProps {
  specialist: Specialist;
  onClick: () => void;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({ specialist, onClick }) => {
  // Select badge styling based on category or custom status
  const getBadgeClass = () => {
    if (specialist.isCustom) return 'badge-accent';
    const cat = specialist.category.toLowerCase();
    if (cat.includes('copywriting') || cat.includes('content')) return 'badge-blue';
    if (cat.includes('sales') || cat.includes('closing')) return 'badge-purple';
    if (cat.includes('social')) return 'badge-blue';
    if (cat.includes('email')) return 'badge-purple';
    if (cat.includes('strategy') || cat.includes('research')) return 'badge-accent';
    if (cat.includes('customer')) return 'badge-success';
    return 'badge-blue';
  };

  return (
    <div className="specialist-card glass-panel animate-fade" onClick={onClick}>
      <div className="card-header-row">
        <span className="card-number">{specialist.number}</span>
        <span className={`badge ${getBadgeClass()}`}>
          {specialist.category}
        </span>
      </div>
      
      <div className="card-title-group">
        <div className="card-icon-container">
          <span className="card-emoji">{specialist.icon}</span>
        </div>
        <h3 className="card-name">{specialist.name}</h3>
      </div>

      <p className="card-description">{specialist.description}</p>
      
      <div className="card-footer-row">
        {specialist.isCustom ? (
          <span className="custom-tag">
            <User size={11} style={{ marginRight: '3px' }} />
            Custom Created
          </span>
        ) : (
          <span />
        )}
        <button className="card-action-btn">
          Run Specialist
          <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        .specialist-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          cursor: pointer;
          min-height: 200px;
          position: relative;
          overflow: hidden;
          background: rgba(17, 24, 39, 0.45);
        }

        .specialist-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent);
          opacity: 0;
          transition: var(--transition-smooth);
        }

        .specialist-card:hover {
          background: rgba(26, 36, 57, 0.6);
          transform: translateY(-3px);
          border-color: rgba(59, 130, 246, 0.25);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(59, 130, 246, 0.1);
        }

        .specialist-card:hover::before {
          opacity: 1;
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-number {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .card-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-icon-container {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-glass);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .specialist-card:hover .card-icon-container {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .card-emoji {
          font-size: 20px;
        }

        .card-name {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.3;
        }

        .card-description {
          font-size: 13px;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-grow: 1;
          line-height: 1.5;
        }

        .card-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .custom-tag {
          font-size: 11px;
          color: var(--accent);
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .card-action-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 0;
          transition: var(--transition-smooth);
        }

        .specialist-card:hover .card-action-btn {
          color: var(--primary-hover);
        }

        .card-action-btn svg {
          transition: var(--transition-smooth);
        }

        .specialist-card:hover .card-action-btn svg {
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
};
