import React, { useState } from 'react';
import { Headphones, Play, Pause, Volume2, Sparkles, Radio, Sliders, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FieldHelpTooltip } from './FieldHelpTooltip';
import { ScreenHelpBanner } from './ScreenHelpBanner';

interface SoundscapeTrack {
  id: string;
  name: string;
  category: 'Focus' | 'Viral Energy' | 'Chill Lofi' | 'Cinematic Pulse' | 'Neuro-Alpha';
  bpm: number;
  frequency: string;
  description: string;
  gradient: string;
  previewAudioUrl?: string;
}

const SOUNDSCAPES: SoundscapeTrack[] = [
  {
    id: 'track-1',
    name: 'Gamma Retention Pulse',
    category: 'Viral Energy',
    bpm: 128,
    frequency: '40 Hz Gamma',
    description: 'High-energy neuro-stimulating pulse designed to maximize 3-second viewer retention on TikTok & Reels.',
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
  },
  {
    id: 'track-2',
    name: 'Deep Tech Alpha Flow',
    category: 'Focus',
    bpm: 100,
    frequency: '10 Hz Alpha',
    description: 'Calm, focused ambient wave frequency for tech explainers and coding tutorials.',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
  },
  {
    id: 'track-3',
    name: 'Cyberpunk Hype Beat',
    category: 'Cinematic Pulse',
    bpm: 140,
    frequency: 'Full Spectrum',
    description: 'Futuristic synth bassline engineered for high-tempo viral product announcements.',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)'
  },
  {
    id: 'track-4',
    name: 'Lofi Mind Chill',
    category: 'Chill Lofi',
    bpm: 85,
    frequency: '8 Hz Theta',
    description: 'Relaxed lofi beat with subtle binaural rhythms perfect for storytelling shorts.',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)'
  }
];

interface WiredvibeStudioProps {
  onSelectTrackForVideo?: (trackName: string) => void;
}

export const WiredvibeStudio: React.FC<WiredvibeStudioProps> = ({ onSelectTrackForVideo }) => {
  const [activeTrack, setActiveTrack] = useState<SoundscapeTrack>(SOUNDSCAPES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [intensity, setIntensity] = useState('Medium');
  const [appliedNotification, setAppliedNotification] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleApplyToIdea = () => {
    if (onSelectTrackForVideo) {
      onSelectTrackForVideo(activeTrack.name);
    }
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2500);
  };

  return (
    <div className="wiredvibe-container animate-fade">
      {/* Header */}
      <div className="wiredvibe-header">
        <div className="title-group">
          <div className="title-icon-badge">
            <Headphones size={24} className="text-accent" />
          </div>
          <div>
            <h2>Wiredvibe Soundscape Studio</h2>
            <p className="subtitle">Neuroscience-engineered soundtracks and ambient audio tuned for viral retention.</p>
          </div>
        </div>
      </div>

      {/* Screen Guide */}
      <ScreenHelpBanner
        screenTitle="Wiredvibe Audio Studio"
        subtitle="Generate and fine-tune neuro-acoustically optimized audio tracks to attach to your AI video ideas."
        steps={[
          {
            number: 1,
            title: "Select Soundscape Preset",
            detail: "Choose a neuro-frequency track based on your video category (Viral Energy, Deep Focus, Cinematic Pulse)."
          },
          {
            number: 2,
            title: "Preview & Tune Parameters",
            detail: "Use the interactive player to listen, adjust volume, and select audio intensity."
          },
          {
            number: 3,
            title: "Apply to Video Generator",
            detail: "Click 'Apply to Video Generator' to link this soundscape directly into your Daily > Idea video rendering pipeline."
          }
        ]}
        proTip="40 Hz Gamma pulse tracks boost short-form video retention by up to 34%."
        defaultExpanded={false}
      />

      <div className="wiredvibe-grid">
        {/* Left Side: Soundscape Tracks Library */}
        <div className="glass-panel studio-card">
          <div className="card-header">
            <Radio size={18} className="text-primary" />
            <h3>Neuro Soundscape Presets</h3>
          </div>

          <div className="track-list">
            {SOUNDSCAPES.map((track) => (
              <div
                key={track.id}
                className={`track-item ${activeTrack.id === track.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTrack(track);
                  setIsPlaying(true);
                }}
              >
                <div className="track-badge" style={{ background: track.gradient }}>
                  <Headphones size={16} color="#ffffff" />
                </div>
                <div className="track-info">
                  <h4>{track.name}</h4>
                  <div className="track-meta">
                    <span className="badge badge-purple">{track.category}</span>
                    <span className="text-xs text-muted">{track.frequency} • {track.bpm} BPM</span>
                  </div>
                </div>
                <button className="track-play-btn" aria-label="Play track">
                  {activeTrack.id === track.id && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Player & Controls */}
        <div className="glass-panel studio-card">
          <div className="card-header">
            <Sliders size={18} className="text-accent" />
            <h3>Active Audio Visualizer & Mixer</h3>
          </div>

          <div className="player-workspace">
            {/* Visualizer Art Card */}
            <div className="visualizer-card" style={{ background: activeTrack.gradient }}>
              <div className="visualizer-content">
                <span className="visualizer-category">{activeTrack.category}</span>
                <h2 className="visualizer-track-title">{activeTrack.name}</h2>
                <span className="visualizer-freq">{activeTrack.frequency}</span>
              </div>

              {/* Animated Equalizer Waveform */}
              <div className={`waveform-container ${isPlaying ? 'playing' : ''}`}>
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
                <span className="bar bar-4"></span>
                <span className="bar bar-5"></span>
                <span className="bar bar-6"></span>
                <span className="bar bar-7"></span>
                <span className="bar bar-8"></span>
              </div>
            </div>

            <p className="track-description-box">
              {activeTrack.description}
            </p>

            {/* Mixer Controls */}
            <div className="mixer-controls">
              <div className="form-group">
                <div className="label-with-help">
                  <label className="form-label">Sound Volume ({volume}%)</label>
                  <FieldHelpTooltip
                    label="Sound Volume"
                    description="Adjust the background soundtrack level relative to AI voiceover."
                    placeholder="0 - 100%"
                    example="80%"
                    tips={["Keep soundtrack at 70-80% so AI voiceover remains clear."]}
                  />
                </div>
                <div className="volume-slider-row">
                  <Volume2 size={16} className="text-muted" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="slider-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-help">
                  <label className="form-label">Neural Intensity</label>
                  <FieldHelpTooltip
                    label="Neural Intensity"
                    description="Controls the depth of brainwave entrainment frequencies embedded in the soundtrack."
                    placeholder="Subtle / Medium / High"
                    example="Medium"
                    tips={["High intensity is best for ultra-fast paced viral hooks."]}
                  />
                </div>
                <div className="intensity-buttons">
                  {['Subtle', 'Medium', 'High'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`intensity-btn ${intensity === lvl ? 'active' : ''}`}
                      onClick={() => setIntensity(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="player-actions-row">
              <button className="btn btn-secondary btn-play-main" onClick={togglePlay}>
                {isPlaying ? <><Pause size={16} /> Pause Track</> : <><Play size={16} /> Play Preview</>}
              </button>

              <button className="btn btn-primary btn-apply-track" onClick={handleApplyToIdea}>
                {appliedNotification ? (
                  <><CheckCircle2 size={16} className="text-success" /> Linked to Idea Studio!</>
                ) : (
                  <><Sparkles size={16} /> Apply to Video Generator <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
