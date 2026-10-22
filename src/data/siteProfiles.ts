// Default profiles for the Daily content sites. Editable in the app (saved in localStorage); the
// generator only states facts that are in a profile, so keep these accurate.
// Claims taken from the live sites but NOT included here because the sites give no evidence for them
// (and they'd be risky in public posts): AlbionLM being "the only LLM UK security-cleared organisations
// can legally deploy", and its 60% / 70% triage and response-time reductions.

export interface SiteProfile {
  id: string;
  name: string;
  url: string;
  description: string;
  audience: string;
  pillars: string; // comma-separated content themes to rotate through
  tone: string;
  cta: string;
  linkedinPageUrl: string;
  facebookPageUrl: string;
  substackUrl: string;
  siteAdminUrl: string;
  color: string;
}

export const SITE_PROFILES: SiteProfile[] = [
  {
    id: 'wiredvibe',
    name: 'Wiredvibe',
    url: 'https://wiredvibeapp.com',
    description: 'Wiredvibe is an app of calibrated audio soundscapes designed to help people focus, get into flow and do deep work, built by Voxstar. Currently being updated and tested.',
    audience: 'Founders, developers, students, creators and remote workers who struggle with distraction and want longer stretches of focused work.',
    pillars: 'focus tips, deep work routines, how sound affects concentration, behind the scenes of building the app, myths about productivity, study and work rituals, creator workflows, questions to the audience',
    tone: 'Calm, warm and practical. Plain words, no pseudo-science, no medical claims.',
    cta: 'Try Wiredvibe at wiredvibeapp.com',
    linkedinPageUrl: '',
    facebookPageUrl: '',
    substackUrl: '',
    siteAdminUrl: '',
    color: '#a855f7'
  },
  {
    id: 'aitoolboard',
    name: 'AIToolboard',
    url: 'https://aitoolboard.com',
    description: 'AIToolboard.com is a directory of AI tools that helps people find the right tool for a job, and lets makers list their AI products. Voxstar is adding 1,337 new tools to it.',
    audience: 'Business owners, marketers, developers and creators looking for AI tools, plus AI founders who want their product listed.',
    pillars: 'tool category roundups, how to choose an AI tool, use-case walkthroughs, free vs paid tools, tools for specific jobs, mistakes people make with AI tools, invitation to list your AI product, questions to the audience',
    tone: 'Helpful, curious and quick. Like a friend who has tried everything.',
    cta: 'Find your next AI tool at aitoolboard.com',
    linkedinPageUrl: '',
    facebookPageUrl: '',
    substackUrl: '',
    siteAdminUrl: '',
    color: '#22c55e'
  },
  {
    id: 'atl-trust',
    name: 'ATL-Trust',
    url: 'https://atl-trust.com',
    description: "ATL-Trust is Voxstar's zero-trust validation layer for AI. Every query to a model passes through it: it screens for prompt injection, personal data (PII) and excessive agency, scores risk (under 4 approved, 4 to 6 flagged, 7 or above blocked) and writes hash-chained audit logs. Recent work includes scrubbing SQL comments to prevent database prompt hijacking. US patent pending.",
    audience: 'CTOs, CISOs, security engineers, AI governance and compliance leads in regulated organisations.',
    pillars: 'prompt injection explained, AI agent risks, audit trails for AI, zero-trust for LLMs, real attack patterns (general, no invented incidents), governance and compliance, engineering deep dives, questions to the audience',
    tone: 'Authoritative, precise and calm. Explain risk without fearmongering.',
    cta: 'See how ATL-Trust works at atl-trust.com',
    linkedinPageUrl: '',
    facebookPageUrl: '',
    substackUrl: '',
    siteAdminUrl: '',
    color: '#f59e0b'
  },
  {
    id: 'albionlm',
    name: 'AlbionLM',
    url: 'https://albionlm.com',
    description: "AlbionLM is a UK-hosted, cybersecurity-specialist large language model built by Voxstar Ltd, in development with early access open (v1.0 not yet launched). Built on Mistral 7B, trained on 1.65 billion tokens including NCSC advisory intelligence, hosted on Civo UK. Five modules: SOC analyst co-pilot, classified document Q&A, incident response, GovAssure compliance assistant and red team assistant, plus UK cyber law reasoning. Every query is governed by ATL-Trust. Presented at Civo Navigate London.",
    audience: 'Security-cleared UK defence and intelligence organisations, police and Home Office bodies, FCA-regulated banks and critical national infrastructure operators.',
    pillars: 'sovereign AI and data residency, why security teams need specialist models, SOC and incident response with AI, UK cyber law and compliance (GovAssure), red teaming, building a UK LLM behind the scenes, early access invitation, questions to the audience',
    tone: 'Serious, credible and British. Confident without hype; no claims beyond the facts given.',
    cta: 'Request early access at albionlm.com',
    linkedinPageUrl: '',
    facebookPageUrl: '',
    substackUrl: '',
    siteAdminUrl: '',
    color: '#3b82f6'
  },
  {
    id: 'lantern-light',
    name: 'Lantern-Light',
    url: 'https://lantern-light.com',
    description: '',
    audience: '',
    pillars: '',
    tone: '',
    cta: '',
    linkedinPageUrl: '',
    facebookPageUrl: '',
    substackUrl: '',
    siteAdminUrl: '',
    color: '#eab308'
  },
  {
    id: 'voxskills',
    name: 'VoxSkills',
    url: 'https://voxskills.com',
    description: '',
    audience: '',
    pillars: '',
    tone: '',
    cta: '',
    linkedinPageUrl: '',
    facebookPageUrl: '',
    substackUrl: '',
    siteAdminUrl: '',
    color: '#ec4899'
  }
];

export const SITE_STORAGE_KEY = 'claude_machine_site_profiles';

export const loadSiteProfiles = (): SiteProfile[] => {
  try {
    const raw = localStorage.getItem(SITE_STORAGE_KEY);
    if (!raw) return SITE_PROFILES;
    const saved = JSON.parse(raw) as SiteProfile[];
    // Keep any new default sites that the saved list doesn't have yet.
    return SITE_PROFILES.map(d => ({ ...d, ...(saved.find(s => s.id === d.id) || {}) }));
  } catch {
    return SITE_PROFILES;
  }
};

export const saveSiteProfiles = (profiles: SiteProfile[]) => {
  try {
    localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Storage blocked: edits last for this session only.
  }
};

export const siteById = (id: string) => loadSiteProfiles().find(s => s.id === id);

export const NEWSLETTER_COLOR = '#0a66c2';
