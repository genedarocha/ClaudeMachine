import React, { useState, useEffect, useRef } from 'react';
import {
  Clapperboard, Play, Loader2, Copy, Check, ChevronDown, ChevronUp, FileDown, Lock,
  ShieldCheck, AlertTriangle, Wand2, RefreshCw, Trash2
} from 'lucide-react';
import { type ApiKeys, type ModelSettings, runSpecialistStream, humanizeLongform } from '../utils/ai';
import { type Specialist } from '../data/specialists';
import { readVoiceSamples, tidyText } from '../utils/humanizer';
import { SafeMarkdown } from './SpecialistRunner';

// REAL: every step is a real LLM call through runSpecialistStream (humanizer prompt layout) followed by
// humanizeLongform(). Each step's output is fed into the next. The model cannot browse YouTube, so the
// research step asks for the user's own competitor findings and says when figures are estimates.
// Nothing here renders video or uploads to YouTube — step 4 is a written production plan.

interface ChannelInputs {
  interests: string;
  audience: string;
  region: string;
  format: string;
  hours: string;
  budget: string;
  goal: string;
  nicheOverride: string;
}

interface StepState {
  output: string;
  status: 'idle' | 'running' | 'humanizing' | 'done' | 'error';
  issues: string[] | null;
  error?: string;
}

type StepId = 'niche' | 'research' | 'script' | 'workflow' | 'plan';

const STORAGE_KEY = 'claude_machine_youtube_builder';
const MAX_CONTEXT = 6000; // characters of each earlier step passed forward

const DEFAULT_INPUTS: ChannelInputs = {
  interests: '',
  audience: '',
  region: 'UK, English-speaking',
  format: 'Faceless: voiceover + B-roll / stock footage',
  hours: '5-10 hours a week',
  budget: 'Under £50 a month',
  goal: 'Ad revenue + affiliate links',
  nicheOverride: ''
};

const FORMAT_OPTIONS = [
  'Faceless: voiceover + B-roll / stock footage',
  'Faceless: screen recordings and tutorials',
  'Faceless: animation / AI-generated visuals',
  'On camera'
];
const HOURS_OPTIONS = ['3-5 hours a week', '5-10 hours a week', '10-20 hours a week', '20+ hours a week'];
const BUDGET_OPTIONS = ['£0 (free tools only)', 'Under £50 a month', '£50-200 a month', '£200+ a month'];
const GOAL_OPTIONS = [
  'Ad revenue + affiliate links',
  'Ad revenue (YouTube Partner Programme)',
  'Affiliate links',
  'Leads for my own products / services',
  'Sponsorships',
  'All of the above'
];

const PROFILE = `<interests>{{interests}}</interests>
<audience>{{audience}}</audience>
<region>{{region}}</region>
<format>{{format}}</format>
<hours>{{hours}}</hours>
<budget>{{budget}}</budget>
<goal>{{goal}}</goal>`;

const ESTIMATE_RULE = '- You cannot browse YouTube or see live data. Never present search volumes, CPMs, view counts or subscriber numbers as facts. Give ranges, label them as estimates, and say which tool to check them in (YouTube search suggestions, YouTube Studio Research tab, vidIQ, TubeBuddy, Google Trends).';

const STEPS: { id: StepId; title: string; blurb: string; template: string }[] = [
  {
    id: 'niche',
    title: '1. Find a profitable niche',
    blurb: 'Scores five niche options against your interests, audience, format and budget, then picks one.',
    template: `# Task
Find the most promising YouTube niche for this creator and pick one.

# Creator profile
${PROFILE}
Niche the creator is already leaning towards (may be empty): <nicheOverride>{{nicheOverride}}</nicheOverride>

# Rules
- Propose 5 specific sub-niches (not broad categories like "finance" or "tech").
- Score each 1-10 on: audience demand, competition (10 = least crowded), likely ad value (CPM band), fit with the format, fit with the creator's interests and time.
- For each, give 3 example video titles a new channel could rank with.
- Flag niches that are hard to monetise or risky under YouTube policies (e.g. medical or financial advice, reused content).
${ESTIMATE_RULE}
- If the creator named a niche, include it and assess it honestly, even if it scores badly.

# Output format
- A markdown table of the 5 niches with their scores and a total.
- A short paragraph per niche.
- A "Recommendation" section explaining the pick in plain terms.
- The very last line must be exactly: CHOSEN NICHE: [niche in under 12 words]`
  },
  {
    id: 'research',
    title: '2. Research competitors & find viral ideas',
    blurb: 'Shows how to find the channels to beat and gives 20 video ideas. Paste what you find on YouTube to make it sharper.',
    template: `# Task
Map the competition for the chosen niche and produce a bank of video ideas with real viral potential.

# Chosen niche
<chosenNiche>{{chosenNiche}}</chosenNiche>

# Creator profile
${PROFILE}

# Competitor findings pasted by the creator (may be empty)
<competitorNotes>{{competitorNotes}}</competitorNotes>

# Earlier step: niche research
<nicheReport>{{nicheReport}}</nicheReport>

# Rules
${ESTIMATE_RULE}
- If competitor findings are provided, analyse them: patterns in titles, thumbnails, length, topics, and what the biggest outlier videos have in common.
- If they are empty, give the exact YouTube searches and filters to run, and explain the outlier method (videos with views far above the channel's subscriber count).
- Describe the 3 types of channel to study and the gap a new channel can own.
- Give 20 video ideas. For each: working title (under 60 characters), the hook in one sentence, why it could spread, and search vs. browse intent.
- Mark the 5 strongest ideas with ★.

# Output format
Sections: "Who you're up against", "The gap", "How to research it yourself", "20 video ideas" (numbered list), "Top 5 to make first".`
  },
  {
    id: 'script',
    title: '3. Write a high-retention script',
    blurb: 'Writes a full script for the strongest idea (or one you pick), with B-roll cues and a reusable template.',
    template: `# Task
Write a complete, high-retention YouTube script for one video, plus a reusable script template for the channel.

# Chosen niche
<chosenNiche>{{chosenNiche}}</chosenNiche>

# Video to script (if empty, use the strongest ★ idea from the research)
<videoIdea>{{videoIdea}}</videoIdea>

# Creator profile
${PROFILE}

# Earlier step: competitor research and ideas
<research>{{researchReport}}</research>

# Rules
- Length: 8-10 minutes spoken (roughly 1,200-1,500 words of narration).
- The first 30 seconds must state the payoff, open a loop and give a reason to stay. No "Hey guys, welcome back".
- Re-hook about every 60-90 seconds with an open loop, a pattern interrupt or a mini-payoff.
- Write narration for the ear: short sentences, spoken rhythm, one idea per sentence.
- Mark visuals inline as [B-ROLL: ...], [ON-SCREEN TEXT: ...] and [SFX: ...] suited to the format.
- Put the call to action where it earns its place (after a payoff), not at the start.
- Don't invent statistics or quotes. Where a fact is needed, write [CHECK: what to verify].

# Output format
- Title options (3), thumbnail text options (3).
- The full script with timestamps every section.
- "Retention notes": why each re-hook is where it is.
- "Reusable template": the same structure with [placeholders] for future videos.`
  },
  {
    id: 'workflow',
    title: '4. Build the faceless production workflow',
    blurb: 'A step-by-step production plan and tool stack within your budget and weekly hours. This is a plan, not rendered video.',
    template: `# Task
Design a repeatable production workflow that takes one video from idea to upload, within the creator's budget and weekly hours.

# Chosen niche
<chosenNiche>{{chosenNiche}}</chosenNiche>

# Creator profile
${PROFILE}

# Earlier step: script
<script>{{scriptReport}}</script>

# Rules
- Recommend a tool stack for each stage: research, scripting, voiceover, visuals/B-roll, editing, thumbnails, captions, upload/scheduling. Prefer free tools when the budget is tight, and give one paid upgrade per stage.
- Only name tools you're confident exist. Don't quote prices as facts; say "check current pricing".
- Give an SOP per video: numbered steps with a time estimate each, so the total fits the weekly hours.
- Show a weekly batching schedule (which day does what).
- Cover YouTube's monetisation rules on reused and mass-produced content: explain what makes a faceless channel original enough to be monetised (own script, own voice or a clearly licensed voice, meaningful editing), and AI voice/visual disclosure.
- Cover music and footage licensing so videos don't get claims.
- Include a pre-upload checklist (title, thumbnail, description, chapters, tags, end screen, cards, captions).

# Output format
Sections: "Tool stack" (table), "Per-video SOP", "Weekly schedule", "Staying monetisable", "Licensing", "Upload checklist".`
  },
  {
    id: 'plan',
    title: '5. 90-day growth & monetisation plan',
    blurb: 'A week-by-week 90-day plan with milestones, metrics to watch and the route to income.',
    template: `# Task
Write a 90-day plan to launch and grow the channel and start earning, based on everything decided so far.

# Chosen niche
<chosenNiche>{{chosenNiche}}</chosenNiche>

# Creator profile
${PROFILE}

# Earlier steps (summaries)
<ideas>{{researchReport}}</ideas>
<workflow>{{workflowReport}}</workflow>

# Rules
- Week-by-week for 13 weeks: what to publish (long-form and Shorts), what to improve, one focus metric.
- Realistic upload cadence for the weekly hours. Consistency beats volume.
- Milestones for days 30, 60 and 90, with what "on track" looks like as ranges, not promises.
- Monetisation roadmap that matches the goal: YouTube Partner Programme eligibility (tell the creator to confirm current thresholds in YouTube Studio, as they change), affiliate links, own offers, sponsorships. Say when each makes sense to switch on.
- Metrics: click-through rate, average view duration, returning viewers, subscribers per video. What to do when each is weak.
- A "What to do if it isn't working by day 45" section: concrete pivots.
- No guaranteed results and no income claims.

# Output format
Sections: "The plan at a glance", "Week by week" (table: week, publish, improve, focus metric), "Milestones", "Monetisation roadmap", "Metrics and fixes", "If it isn't working by day 45".`
  }
];

const emptySteps = (): Record<StepId, StepState> => ({
  niche: { output: '', status: 'idle', issues: null },
  research: { output: '', status: 'idle', issues: null },
  script: { output: '', status: 'idle', issues: null },
  workflow: { output: '', status: 'idle', issues: null },
  plan: { output: '', status: 'idle', issues: null }
});

interface SavedState {
  inputs: ChannelInputs;
  steps: Record<StepId, StepState>;
  chosenNiche: string;
  competitorNotes: string;
  videoIdea: string;
}

const loadSaved = (): SavedState => {
  const fallback: SavedState = { inputs: DEFAULT_INPUTS, steps: emptySteps(), chosenNiche: '', competitorNotes: '', videoIdea: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as SavedState;
    // A run interrupted by a page reload can't resume, so reset any in-flight step.
    const steps = { ...emptySteps(), ...parsed.steps };
    (Object.keys(steps) as StepId[]).forEach(id => {
      if (steps[id].status === 'running' || steps[id].status === 'humanizing') {
        steps[id] = { ...steps[id], status: steps[id].output ? 'done' : 'idle' };
      }
    });
    return { ...fallback, ...parsed, inputs: { ...DEFAULT_INPUTS, ...parsed.inputs }, steps };
  } catch {
    return fallback;
  }
};

const parseChosenNiche = (text: string) => {
  const match = text.match(/CHOSEN NICHE:\s*\**\s*(.+?)\s*\**\s*$/im);
  return match ? match[1].trim() : '';
};

const orNone = (value: string) => (value.trim() ? value.trim() : 'None provided');

interface YouTubeChannelBuilderProps {
  keys: ApiKeys;
  settings: ModelSettings;
  onOpenSettings: () => void;
}

export const YouTubeChannelBuilder: React.FC<YouTubeChannelBuilderProps> = ({ keys, settings, onOpenSettings }) => {
  const initial = useRef(loadSaved()).current;
  const [inputs, setInputs] = useState<ChannelInputs>(initial.inputs);
  const [steps, setSteps] = useState<Record<StepId, StepState>>(initial.steps);
  const [chosenNiche, setChosenNiche] = useState(initial.chosenNiche);
  const [competitorNotes, setCompetitorNotes] = useState(initial.competitorNotes);
  const [videoIdea, setVideoIdea] = useState(initial.videoIdea);
  const [expanded, setExpanded] = useState<StepId | null>('niche');
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [copied, setCopied] = useState<StepId | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Latest values for the async "run all" chain, which outlives individual renders.
  const stepsRef = useRef(steps);
  const nicheRef = useRef(chosenNiche);
  useEffect(() => { nicheRef.current = chosenNiche; }, [chosenNiche]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, steps, chosenNiche, competitorNotes, videoIdea }));
    } catch {
      // Storage full or blocked: the builder still works for this session.
    }
  }, [inputs, steps, chosenNiche, competitorNotes, videoIdea]);

  const isDemo = settings.provider === 'mock';
  const busy = isRunningAll || (Object.values(steps) as StepState[]).some(s => s.status === 'running' || s.status === 'humanizing');

  // All step updates go through stepsRef first, so the next step in a "run all" chain reads the
  // previous step's final output immediately rather than waiting for React to re-render.
  const commitSteps = (next: Record<StepId, StepState>) => {
    stepsRef.current = next;
    setSteps(next);
  };

  const patchStep = (id: StepId, patch: Partial<StepState>) =>
    commitSteps({ ...stepsRef.current, [id]: { ...stepsRef.current[id], ...patch } });

  const isUnlocked = (index: number) => index === 0 || stepsRef.current[STEPS[index - 1].id].status === 'done';

  const buildValues = (): Record<string, string> => {
    const out = (id: StepId) => stepsRef.current[id].output.slice(0, MAX_CONTEXT);
    return {
      interests: inputs.interests.trim(),
      audience: inputs.audience.trim(),
      region: inputs.region,
      format: inputs.format,
      hours: inputs.hours,
      budget: inputs.budget,
      goal: inputs.goal,
      nicheOverride: orNone(inputs.nicheOverride),
      chosenNiche: orNone(nicheRef.current),
      competitorNotes: orNone(competitorNotes),
      videoIdea: orNone(videoIdea),
      nicheReport: out('niche'),
      researchReport: out('research'),
      scriptReport: out('script'),
      workflowReport: out('workflow')
    };
  };

  // Runs one step to completion (stream + humanizer). Resolves true on success.
  const runStep = (index: number): Promise<boolean> => new Promise(resolve => {
    const step = STEPS[index];
    if (!inputs.interests.trim() || !inputs.audience.trim()) {
      setFormError('Fill in your interests and target audience first.');
      resolve(false);
      return;
    }
    setFormError(null);
    setExpanded(step.id);
    patchStep(step.id, { output: '', status: 'running', issues: null, error: undefined });

    const specialist: Specialist = {
      id: `yt-${step.id}`,
      name: `YouTube Channel Builder: ${step.title}`,
      category: 'Strategy & Research',
      number: '#YT',
      icon: '🎬',
      description: step.blurb,
      promptTemplate: step.template,
      inputs: []
    };
    const voice = readVoiceSamples();

    runSpecialistStream(
      specialist,
      buildValues(),
      keys,
      settings,
      chunk => patchStep(step.id, { output: stepsRef.current[step.id].output + chunk }),
      async fullText => {
        let finalText = fullText;
        let issues: string[] | null = null;
        let error: string | undefined;
        if (!isDemo) {
          patchStep(step.id, { output: tidyText(fullText, 'longform'), status: 'humanizing' });
          const result = await humanizeLongform(fullText, keys, settings, voice);
          finalText = result.text;
          issues = result.issues;
          if (result.rewriteError) error = `Humanizer rewrite failed, showing the original draft: ${result.rewriteError}`;
        }
        // The rewrite pass may drop the marker line, so read the niche from the raw draft too.
        if (step.id === 'niche') {
          const niche = parseChosenNiche(finalText) || parseChosenNiche(fullText);
          if (niche) {
            setChosenNiche(niche);
            nicheRef.current = niche;
          }
        }
        patchStep(step.id, { output: finalText, status: 'done', issues, error });
        resolve(true);
      },
      err => {
        patchStep(step.id, { status: 'error', error: err });
        resolve(false);
      },
      voice
    ).catch(err => {
      patchStep(step.id, { status: 'error', error: err instanceof Error ? err.message : String(err) });
      resolve(false);
    });
  });

  const runAllRemaining = async () => {
    setIsRunningAll(true);
    for (let i = 0; i < STEPS.length; i++) {
      if (stepsRef.current[STEPS[i].id].status === 'done') continue;
      const ok = await runStep(i);
      if (!ok) break;
    }
    setIsRunningAll(false);
  };

  const humanizeAgain = async (id: StepId) => {
    const current = stepsRef.current[id].output;
    if (!current) return;
    patchStep(id, { status: 'humanizing', error: undefined });
    const result = await humanizeLongform(current, keys, settings, readVoiceSamples(), true);
    patchStep(id, { output: result.text, status: 'done', issues: result.issues, error: result.rewriteError });
  };

  const copyStep = async (id: StepId) => {
    try {
      await navigator.clipboard.writeText(steps[id].output);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setFormError('Clipboard access was blocked by the browser.');
    }
  };

  const downloadAll = () => {
    const md = [
      `# YouTube Channel Plan${chosenNiche ? `: ${chosenNiche}` : ''}`,
      `_Generated ${new Date().toLocaleDateString('en-GB')} with Claude Machine_`,
      ...STEPS.filter(s => steps[s.id].output).map(s => `\n\n---\n\n## ${s.title}\n\n${steps[s.id].output}`)
    ].join('\n');
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-channel-plan${chosenNiche ? `-${chosenNiche.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}` : ''}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    if (!window.confirm('Clear all five steps? Your profile answers are kept.')) return;
    commitSteps(emptySteps());
    setChosenNiche('');
    nicheRef.current = '';
    setVideoIdea('');
    setExpanded('niche');
  };

  const setField = (key: keyof ChannelInputs) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setInputs(prev => ({ ...prev, [key]: e.target.value }));

  const doneCount = STEPS.filter(s => steps[s.id].status === 'done').length;

  return (
    <div className="ytb-container animate-fade">
      <header className="ytb-header">
        <div>
          <h2><Clapperboard size={22} /> YouTube Channel Builder</h2>
          <p className="ytb-sub">
            Five linked steps: niche, competitor research, script, faceless production workflow and a 90-day plan.
            Each step builds on the last, and every output goes through the humanizer.
          </p>
        </div>
        <span className={`ytb-model-pill ${isDemo ? 'warn' : ''}`} onClick={onOpenSettings} title="Change model in Settings">
          {isDemo ? 'Demo Mode: sample text only. Set a real model in Settings' : `${settings.provider} · ${settings.model}`}
        </span>
      </header>

      {/* PROFILE */}
      <section className="ytb-card glass-panel">
        <h3>Your channel profile</h3>
        <div className="ytb-grid">
          <label className="ytb-field ytb-span">
            <span>Your interests, skills and experience *</span>
            <textarea rows={3} value={inputs.interests} onChange={setField('interests')}
              placeholder="e.g. 20 years in software, AI automation for small businesses, podcasting, home studio audio, drones" />
          </label>
          <label className="ytb-field">
            <span>Who you want to reach *</span>
            <input value={inputs.audience} onChange={setField('audience')} placeholder="e.g. UK small-business owners curious about AI" />
          </label>
          <label className="ytb-field">
            <span>Region and language</span>
            <input value={inputs.region} onChange={setField('region')} />
          </label>
          <label className="ytb-field">
            <span>Format</span>
            <select value={inputs.format} onChange={setField('format')}>{FORMAT_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
          </label>
          <label className="ytb-field">
            <span>Time available</span>
            <select value={inputs.hours} onChange={setField('hours')}>{HOURS_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
          </label>
          <label className="ytb-field">
            <span>Tool budget</span>
            <select value={inputs.budget} onChange={setField('budget')}>{BUDGET_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
          </label>
          <label className="ytb-field">
            <span>How you want to earn</span>
            <select value={inputs.goal} onChange={setField('goal')}>{GOAL_OPTIONS.map(o => <option key={o}>{o}</option>)}</select>
          </label>
          <label className="ytb-field ytb-span">
            <span>Niche you're already considering (optional)</span>
            <input value={inputs.nicheOverride} onChange={setField('nicheOverride')} placeholder="Leave blank to let step 1 suggest options" />
          </label>
        </div>
        {formError && <div className="ytb-error"><AlertTriangle size={14} /> {formError}</div>}
        <div className="ytb-row">
          <button className="btn btn-primary ytb-btn" disabled={busy || doneCount === STEPS.length} onClick={runAllRemaining}>
            {isRunningAll ? <Loader2 size={14} className="ytb-spin" /> : <Play size={14} />}
            {doneCount === 0 ? 'Build my channel (run all 5 steps)' : doneCount === STEPS.length ? 'All steps done' : `Run remaining ${STEPS.length - doneCount} steps`}
          </button>
          <button className="btn btn-secondary ytb-btn" disabled={doneCount === 0} onClick={downloadAll}>
            <FileDown size={14} /> Download full plan (.md)
          </button>
          <button className="ytb-link-btn" disabled={busy || doneCount === 0} onClick={resetAll}>
            <Trash2 size={12} /> Start over
          </button>
          <span className="ytb-progress">{doneCount}/5 steps done</span>
        </div>
      </section>

      {/* STEPS */}
      {STEPS.map((step, index) => {
        const st = steps[step.id];
        const unlocked = isUnlocked(index);
        const open = expanded === step.id;
        return (
          <section key={step.id} className={`ytb-card glass-panel ytb-step status-${st.status}`}>
            <div className="ytb-step-head" onClick={() => setExpanded(open ? null : step.id)}>
              <div className="ytb-step-title">
                <h3>{step.title}</h3>
                <p>{step.blurb}</p>
              </div>
              <div className="ytb-step-status">
                {st.status === 'running' && <span className="ytb-tag run"><Loader2 size={12} className="ytb-spin" /> Writing…</span>}
                {st.status === 'humanizing' && <span className="ytb-tag run"><Loader2 size={12} className="ytb-spin" /> Humanizing…</span>}
                {st.status === 'done' && st.issues && st.issues.length === 0 && <span className="ytb-tag ok"><ShieldCheck size={12} /> Humanizer passed</span>}
                {st.status === 'done' && st.issues && st.issues.length > 0 && <span className="ytb-tag warn" title={st.issues.join('\n')}><AlertTriangle size={12} /> {st.issues.length} humanizer flag{st.issues.length > 1 ? 's' : ''}</span>}
                {st.status === 'done' && !st.issues && <span className="ytb-tag">Done (demo)</span>}
                {st.status === 'error' && <span className="ytb-tag warn"><AlertTriangle size={12} /> Failed</span>}
                {!unlocked && st.status === 'idle' && <span className="ytb-tag"><Lock size={12} /> Needs step {index}</span>}
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {open && (
              <div className="ytb-step-body">
                {step.id === 'research' && (
                  <label className="ytb-field">
                    <span>Chosen niche (from step 1, edit if you prefer another)</span>
                    <input value={chosenNiche} onChange={e => setChosenNiche(e.target.value)} placeholder="Run step 1 or type a niche" />
                    <span className="ytb-hint" style={{ marginTop: 8 }}>
                      Optional: search YouTube for your niche and paste the top channels and videos you find (names, titles, views, subscribers). The AI can't browse, so real data here makes this step much sharper.
                    </span>
                    <textarea rows={4} value={competitorNotes} onChange={e => setCompetitorNotes(e.target.value)}
                      placeholder={'e.g. "AI Explained" – 400K subs – "I tested 10 AI agents for a week" 1.2M views'} />
                  </label>
                )}
                {step.id === 'script' && (
                  <label className="ytb-field">
                    <span>Video to script (optional: leave blank to use the strongest ★ idea from step 2)</span>
                    <input value={videoIdea} onChange={e => setVideoIdea(e.target.value)} placeholder="Paste an idea title from step 2" />
                  </label>
                )}

                {st.error && <div className="ytb-error"><AlertTriangle size={14} /> {st.error}</div>}
                {st.status === 'done' && st.issues && st.issues.length > 0 && (
                  <div className="ytb-flags"><AlertTriangle size={13} /> {st.issues.join(' · ')}</div>
                )}

                {st.output
                  ? <div className="ytb-output"><SafeMarkdown text={st.output} /></div>
                  : <div className="ytb-empty">{unlocked ? 'Not run yet.' : `Finish step ${index} first. This step builds on it.`}</div>}

                <div className="ytb-row">
                  <button className="btn btn-primary ytb-btn" disabled={busy || !unlocked} onClick={() => runStep(index)}>
                    {st.output ? <RefreshCw size={14} /> : <Play size={14} />} {st.output ? 'Re-run this step' : 'Run this step'}
                  </button>
                  {st.output && !isDemo && (
                    <button className="btn btn-secondary ytb-btn" disabled={busy} onClick={() => humanizeAgain(step.id)}>
                      <Wand2 size={14} /> Humanize again
                    </button>
                  )}
                  {st.output && (
                    <button className="btn btn-secondary ytb-btn" onClick={() => copyStep(step.id)}>
                      {copied === step.id ? <Check size={14} /> : <Copy size={14} />} {copied === step.id ? 'Copied' : 'Copy'}
                    </button>
                  )}
                  {st.output && index < STEPS.length - 1 && (
                    <span className="ytb-hint">Re-running this step won't update later steps. Re-run those too.</span>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}

      <style>{`
        .ytb-container { display: flex; flex-direction: column; gap: 16px; padding: 8px 4px 40px; }
        .ytb-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .ytb-header h2 { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); margin: 0 0 6px; color: var(--text-primary); }
        .ytb-sub { color: var(--text-secondary); max-width: 760px; margin: 0; line-height: 1.5; font-size: 0.92rem; }
        .ytb-model-pill { font-size: 0.78rem; font-family: var(--font-mono); padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-glass); color: var(--text-secondary); cursor: pointer; }
        .ytb-model-pill.warn { border-color: var(--warning); color: var(--warning); }
        .ytb-card { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
        .ytb-card h3 { margin: 0; font-size: 1rem; color: var(--text-primary); }
        .ytb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
        .ytb-span { grid-column: 1 / -1; }
        .ytb-field { display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
        .ytb-field input, .ytb-field textarea, .ytb-field select {
          background: var(--bg-dark); border: 1px solid var(--border-glass); color: var(--text-primary);
          border-radius: 8px; padding: 8px 10px; font-family: var(--font-body); font-size: 0.86rem; resize: vertical;
        }
        .ytb-hint { color: var(--text-muted); font-size: 0.78rem; line-height: 1.45; }
        .ytb-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .ytb-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; padding: 7px 12px; }
        .ytb-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .ytb-link-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; }
        .ytb-link-btn:hover:not(:disabled) { color: var(--danger); }
        .ytb-link-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ytb-progress { margin-left: auto; color: var(--text-muted); font-size: 0.8rem; font-family: var(--font-mono); }
        .ytb-error { display: flex; align-items: center; gap: 8px; color: var(--danger); font-size: 0.85rem; }
        .ytb-flags { display: flex; align-items: center; gap: 6px; color: var(--warning); font-size: 0.8rem; }
        .ytb-step { border-left: 3px solid var(--border-glass); }
        .ytb-step.status-done { border-left-color: var(--success); }
        .ytb-step.status-running, .ytb-step.status-humanizing { border-left-color: var(--primary); }
        .ytb-step.status-error { border-left-color: var(--danger); }
        .ytb-step-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; cursor: pointer; }
        .ytb-step-title p { margin: 4px 0 0; color: var(--text-muted); font-size: 0.82rem; }
        .ytb-step-status { display: flex; align-items: center; gap: 8px; color: var(--text-muted); flex-shrink: 0; }
        .ytb-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); }
        .ytb-tag.ok { color: var(--success); }
        .ytb-tag.warn { color: var(--warning); }
        .ytb-tag.run { color: var(--primary); }
        .ytb-step-body { display: flex; flex-direction: column; gap: 12px; }
        .ytb-output { max-height: 560px; overflow-y: auto; padding: 12px 14px; border: 1px solid var(--border-glass); border-radius: 8px; background: var(--bg-dark); }
        .ytb-empty { color: var(--text-muted); font-size: 0.85rem; padding: 12px 0; }
        .ytb-spin { animation: ytb-spin 1s linear infinite; }
        @keyframes ytb-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
