export interface SpecialistInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder: string;
  description: string;
  options?: string[];
  defaultValue?: string;
}

export interface Specialist {
  id: string;
  name: string;
  category: string;
  number: string;
  icon: string;
  description: string;
  promptTemplate: string;
  inputs: SpecialistInput[];
  isCustom?: boolean;
}

export const CATEGORIES = [
  { id: 'copywriting', name: 'Copywriting & Content', icon: '✍️', count: 10 },
  { id: 'social-media', name: 'Social Media', icon: '📱', count: 10 },
  { id: 'sales', name: 'Sales & Closing', icon: '💰', count: 10 },
  { id: 'email-marketing', name: 'Email Marketing', icon: '📧', count: 10 },
  { id: 'strategy', name: 'Strategy & Research', icon: '🧠', count: 10 },
  { id: 'customer-service', name: 'Customer Service', icon: '🤝', count: 10 },
  { id: 'operations', name: 'Operations', icon: '⚙️', count: 10 },
  { id: 'personal-brand', name: 'Personal Brand', icon: '🎯', count: 10 },
  { id: 'websites', name: 'Websites & Income', icon: '🌐', count: 10 },
  { id: 'ads', name: 'Ads & Paid Traffic', icon: '📈', count: 10 },
  { id: 'voxstar-connect', name: 'Voxstar Connect', icon: '✨', count: 5 }
];

export const PREBUILT_SPECIALISTS: Specialist[] = [
  // CATEGORY 1: COPYWRITING & CONTENT
  {
    id: 'spec-01',
    name: 'Sales Page Copywriter',
    category: 'Copywriting & Content',
    number: '#01',
    icon: '🔥',
    description: 'Generates high-converting AIDA sales pages for any product or service.',
    promptTemplate: `You are an elite, world-class copywriter who specializes in direct-response sales letters that convert readers into buyers.
Your task is to write a highly compelling, high-converting Sales Page Copy using the AIDA framework (Attention, Interest, Desire, Action) for:
Product Name: {{productName}}
Product Description: {{productDescription}}
Target Audience: {{targetAudience}}
Tone: {{tone}}

Format the output clearly with:
1. An Attention-grabbing Headline & Subheadline
2. The Problem/Pain Point (Agitate the problem)
3. The Solution & Product Introduction
4. Features & Benefits (Translate features into powerful emotional benefits)
5. Social Proof / Risk Reversal section
6. Offer Stack & Clear Call to Action (CTA)

Make the writing punchy, persuasive, and highly engaging.`,
    inputs: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., SaaSify CRM', description: 'The name of your product or service.' },
      { id: 'productDescription', label: 'Product Description', type: 'textarea', placeholder: 'e.g., A client manager tool for freelance designers...', description: 'Describe what the product does and its key features.' },
      { id: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Freelance website designers', description: 'Who is the ideal customer?' },
      { id: 'tone', label: 'Copywriting Tone', type: 'select', placeholder: 'Select tone', description: 'The voice of the sales page.', options: ['Bold & Persuasive', 'Professional & Authoritative', 'Friendly & Casual', 'Inspirational & Story-driven'], defaultValue: 'Bold & Persuasive' }
    ]
  },
  {
    id: 'spec-02',
    name: 'Blog Post Outline Architect',
    category: 'Copywriting & Content',
    number: '#02',
    icon: '📝',
    description: 'Creates SEO-optimized blog post outlines with headers, key points, and keywords.',
    promptTemplate: `You are an expert SEO Content Strategist. Create a comprehensive, search-optimized outline for a blog post on the topic:
Topic: {{topic}}
Primary Keyword: {{keyword}}
Target Audience: {{audience}}

Include:
- Suggested Blog Post Titles (3 options optimized for click-through rate)
- Recommended URL slug & Meta Description
- Complete Header Outline (H1, H2s, H3s) with brief bullet points detailing what to write in each section
- Suggested LSI/Secondary keywords to include
- A call-to-action (CTA) recommendation for the conclusion`,
    inputs: [
      { id: 'topic', label: 'Blog Post Topic', type: 'text', placeholder: 'e.g., The Future of Remote Engineering in 2026', description: 'The main subject of the article.' },
      { id: 'keyword', label: 'Primary Keyword', type: 'text', placeholder: 'e.g., remote engineering trends', description: 'The keyword you want to rank for.' },
      { id: 'audience', label: 'Target Reader', type: 'text', placeholder: 'e.g., CTOs and tech team leads', description: 'Who is reading this article?' }
    ]
  },
  {
    id: 'spec-03',
    name: 'Viral Hook Generator',
    category: 'Copywriting & Content',
    number: '#03',
    icon: '🪝',
    description: 'Generates 20+ scroll-stopping hooks for any topic using 10 proven psychological formulas.',
    promptTemplate: `You are a viral copywriting specialist. Generate 20 high-performing scroll-stopping hooks on the following topic using 10 proven hook formulas (e.g., The Negativity Bias, The Curiosity Gap, The Contrarian Take, The Secret/Insider):
Topic: {{topic}}
Platform Focus: {{platform}}

Provide 2 hooks for each of the 10 formulas, explain the psychology behind why it works, and score them on a scale of 1-10 for attention-grabbing power. Deliver the top 3 overall best hooks as a final recommendation.`,
    inputs: [
      { id: 'topic', label: 'Topic or Angle', type: 'text', placeholder: 'e.g., Why 99% of newsletters fail in the first 3 months', description: 'The main topic or statement you are hook-engineering.' },
      { id: 'platform', label: 'Target Platform', type: 'select', placeholder: 'Select platform', description: 'Where will this hook be posted?', options: ['LinkedIn', 'Twitter/X', 'Instagram/TikTok Reels', 'YouTube Shorts', 'Blog/Newsletter Headline'], defaultValue: 'LinkedIn' }
    ]
  },
  {
    id: 'spec-04',
    name: 'Storytelling Email Writer',
    category: 'Copywriting & Content',
    number: '#04',
    icon: '📖',
    description: 'Writes narrative-driven emails that build personal connection and sell seamlessly.',
    promptTemplate: `You are a master storyteller and email marketer. Write a narrative-driven email that transitions smoothly from a personal or business story into a soft pitch.
The Story/Anecdote: {{anecdote}}
The Lesson/Takeaway: {{lesson}}
The Offer/Action to Take: {{offer}}

Format the email with:
- 3 high-open-rate subject lines
- An engaging, immediate hook in the first sentence
- A storytelling body that keeps readers reading (use short paragraphs and active voice)
- A smooth transition to the lesson learned
- A compelling soft-pitch call to action (CTA) and a PS line`,
    inputs: [
      { id: 'anecdote', label: 'The Story / Anecdote', type: 'textarea', placeholder: 'e.g., How I deleted my entire client database on a Friday afternoon and learned a massive lesson about automated backups.', description: 'Describe the story or experience you want to use.' },
      { id: 'lesson', label: 'The Lesson Learned', type: 'text', placeholder: 'e.g., Automation isn\'t just a luxury, it\'s the foundation of business stability.', description: 'The main takeaway for the reader.' },
      { id: 'offer', label: 'The Call to Action', type: 'text', placeholder: 'e.g., Book an automation audit with our team', description: 'What should the reader do after reading?' }
    ]
  },
  {
    id: 'spec-05',
    name: 'Product Description Optimizer',
    category: 'Copywriting & Content',
    number: '#05',
    icon: '🛒',
    description: 'Converts boring technical features into emotional benefits that drive purchases.',
    promptTemplate: `You are an e-commerce copywriting expert. Translate this list of product features into benefit-driven, emotional descriptions that make customers buy.
Product: {{productName}}
Raw Features: {{rawFeatures}}
Target Audience: {{audience}}

Write:
1. An exciting 1-sentence product summary.
2. A benefit-focused description (using bullet points that connect the physical feature to a direct life improvement or problem solved).
3. A "Who This Is For" vs "Who This Is Not For" section.
4. A trust/guarantee micro-copy block.`,
    inputs: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., Ergonomic Obsidian Desk Chair', description: '' },
      { id: 'rawFeatures', label: 'Raw Features', type: 'textarea', placeholder: 'e.g., 4D armrests, mesh backing, aluminum frame, 120-degree tilt', description: 'List the technical specifications or raw features.' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Software engineers working 10+ hours a day', description: 'Who is the buyer?' }
    ]
  },
  {
    id: 'spec-06',
    name: 'Case Study Storyteller',
    category: 'Copywriting & Content',
    number: '#06',
    icon: '📈',
    description: 'Drafts case studies highlighting the client journey, challenge, and concrete results.',
    promptTemplate: `Write a compelling client success story/case study using the Hero's Journey framework.
Client/Business: {{clientName}}
The Challenge/Pain Point: {{challenge}}
The Solution Implemented: {{solution}}
The Tangible Results: {{results}}

Structure the case study as follows:
- Title: A results-driven title.
- Summary: A 2-sentence executive summary.
- The Challenge: Where the client started, the pain they felt, and why standard options failed.
- The Solution: The onboarding, the strategy change, and how the tool/service worked.
- The Breakthrough/Results: The specific metrics achieved, quote highlights, and where they are today.`,
    inputs: [
      { id: 'clientName', label: 'Client Name/Niche', type: 'text', placeholder: 'e.g., Peak Wellness Coaching', description: 'Name of the client or industry.' },
      { id: 'challenge', label: 'The Challenge', type: 'textarea', placeholder: 'e.g., High client churn, manual booking spreadsheet nightmares, spending 10 hrs a week on scheduling.', description: 'What was the initial problem?' },
      { id: 'solution', label: 'The Solution', type: 'textarea', placeholder: 'e.g., Implemented automated client onboarding and scheduling app with SMS reminders.', description: 'What did you implement for them?' },
      { id: 'results', label: 'The Results', type: 'text', placeholder: 'e.g., Reduced booking admin time to 0, increased client retention by 35% in 60 days.', description: 'Quantifiable metrics and positive feedback.' }
    ]
  },
  {
    id: 'spec-07',
    name: 'Headline Experimenter',
    category: 'Copywriting & Content',
    number: '#07',
    icon: '⚡',
    description: 'Generates 15 headline variations for sales pages, ads, or articles.',
    promptTemplate: `You are a direct response headline engineer. Generate 15 distinct headlines for the following topic:
Core Message: {{message}}
Audience: {{audience}}

Generate headlines in the following styles (3 of each):
1. Direct & Benefit-First
2. Question-Style / Curiosity Gap
3. Number/List-Based
4. Social Proof / Authority
5. Contrarian / Shocking Take`,
    inputs: [
      { id: 'message', label: 'Core Message', type: 'text', placeholder: 'e.g., A software that does bookkeeping in 5 minutes for creators', description: 'What is the main value proposition?' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Solo YouTuber and TikTok creators', description: 'Who is the headline trying to capture?' }
    ]
  },
  {
    id: 'spec-08',
    name: 'FAQ Builder',
    category: 'Copywriting & Content',
    number: '#08',
    icon: '❓',
    description: 'Generates objection-handling FAQs for landing pages and product sites.',
    promptTemplate: `You are a conversion optimization specialist. Build a detailed Frequently Asked Questions (FAQ) section that anticipates and defuses common buyer objections.
Product/Service: {{product}}
Objections to Overcome: {{objections}}

Generate 8 detailed FAQs. For each question, provide a strategic, reassuring, yet direct answer that clears the hurdle and positions the product as the obvious risk-free choice.`,
    inputs: [
      { id: 'product', label: 'Product / Service', type: 'text', placeholder: 'e.g., $99/mo Agency On-Demand Design', description: '' },
      { id: 'objections', label: 'Objections to Address', type: 'textarea', placeholder: 'e.g., Is it really unlimited? What is the turnaround time? What if I don\'t like the designs?', description: 'Core doubts the buyer might have.' }
    ]
  },
  {
    id: 'spec-09',
    name: 'Technical Simplifier',
    category: 'Copywriting & Content',
    number: '#09',
    icon: '💡',
    description: 'Translates complex technical content or whitepapers into clean, accessible text.',
    promptTemplate: `You are an expert technical writer and educator. Translate the following highly technical text into simple, easy-to-read prose for a non-technical reader, while maintaining factual accuracy.
Technical Text: {{technicalText}}
Target Reading Level: {{level}}

Provide a summarized analogy, followed by key takeaways, and then the simplified text block.`,
    inputs: [
      { id: 'technicalText', label: 'Technical Text', type: 'textarea', placeholder: 'Paste complex documentation, code explanations, or scientific text here...', description: '' },
      { id: 'level', label: 'Reading Level', type: 'select', placeholder: 'Select level', description: 'Who is the audience?', options: ['High School Student', 'Non-Technical Executive', 'General Public', 'Junior Developer'], defaultValue: 'Non-Technical Executive' }
    ]
  },
  {
    id: 'spec-10',
    name: 'Tone Translator',
    category: 'Copywriting & Content',
    number: '#10',
    icon: '🔄',
    description: 'Rewrites any text into a completely different voice or brand persona.',
    promptTemplate: `You are a brand voice architect. Rewrite the source text to match the requested target tone.
Source Text: {{sourceText}}
Target Tone: {{targetTone}}

Ensure the structure of the message is preserved, but vocabulary, sentence lengths, and stylistic flares match the target persona perfectly.`,
    inputs: [
      { id: 'sourceText', label: 'Source Text', type: 'textarea', placeholder: 'Paste the original text here...', description: '' },
      { id: 'targetTone', label: 'Target Tone', type: 'select', placeholder: 'Select tone', description: 'What style should it be rewritten in?', options: ['Steve Jobs (Minimalist & Inspiring)', 'Gary Vaynerchuk (High-energy & Direct)', 'Sleek & Tech-Luxurious', 'Friendly & Humorous'], defaultValue: 'Steve Jobs (Minimalist & Inspiring)' }
    ]
  },

  // CATEGORY 2: SOCIAL MEDIA
  {
    id: 'spec-11',
    name: '30-Day Content Calendar Builder',
    category: 'Social Media',
    number: '#11',
    icon: '📅',
    description: 'Builds a complete 30-day content calendar across platforms with daily prompts.',
    promptTemplate: `You are a social media director. Create a 30-day content calendar for:
Business Niche: {{niche}}
Primary Channels: {{channels}}
Core Content Pillars: {{pillars}}

Create a structured markdown table with:
- Day (1 to 30)
- Topic Category / Pillar
- Platform
- Headline/Hook Idea
- Post Description & Call to Action (CTA)
- Hashtag/SEO recommendations`,
    inputs: [
      { id: 'niche', label: 'Business Niche', type: 'text', placeholder: 'e.g., B2B Bootstrapped SaaS', description: 'What is the focus of your business?' },
      { id: 'channels', label: 'Primary Channels', type: 'text', placeholder: 'e.g., LinkedIn & Twitter', description: 'Where will you post?' },
      { id: 'pillars', label: 'Content Pillars', type: 'text', placeholder: 'e.g., Founder Journey, Product Features, Actionable Tips', description: 'What topics do you talk about?' }
    ]
  },
  {
    id: 'spec-12',
    name: 'LinkedIn Thought Leader',
    category: 'Social Media',
    number: '#12',
    icon: '💼',
    description: 'Writes authority-building LinkedIn posts with scroll-stopping headers.',
    promptTemplate: `Write a high-engaging LinkedIn post based on:
Core Concept: {{concept}}
Story/Context: {{story}}
Takeaway/Tip: {{takeaway}}

The post should follow the optimal LinkedIn structure:
- A single, powerful hook sentence (first line)
- Paragraphs no longer than 2 lines, separated by empty spaces
- An authentic, conversational tone (no corporate fluff or jargon)
- A clear lesson or takeaway that provides immediate value
- An engaging ending question to spark comments in the discussion`,
    inputs: [
      { id: 'concept', label: 'Core Concept', type: 'text', placeholder: 'e.g., Why hiring remote devs from Eastern Europe is a superpower', description: 'The main point of the post.' },
      { id: 'story', label: 'The Story / Context', type: 'textarea', placeholder: 'e.g., We hired two devs from Poland. In 3 weeks, they built what took our US agency 3 months, for 1/3 of the cost.', description: 'The narrative context.' },
      { id: 'takeaway', label: 'The Key Takeaway', type: 'text', placeholder: 'e.g., Skill is global. Focus on timezone overlap and clear async docs rather than office location.', description: 'The actionable lesson.' }
    ]
  },
  {
    id: 'spec-13',
    name: 'Twitter/X Thread Writer',
    category: 'Social Media',
    number: '#13',
    icon: '🐦',
    description: 'Generates high-engagement threads with hooks, body, and CTA tweets.',
    promptTemplate: `You are an expert X (Twitter) thread copywriter. Write a thread of 5-8 tweets on:
Thread Topic: {{topic}}
Actionable Steps: {{steps}}

Follow X formatting rules:
- Tweet 1: Must be a viral hook (under 280 chars) that creates curiosity or promises a specific outcome.
- Tweets 2 to 7: Each must contain a single, highly actionable, concise tip. Use emojis and bullet points. Keep each tweet under 260 characters.
- Final Tweet: A strong Call to Action (CTA) linking to a resource or asking for a retweet/follow.`,
    inputs: [
      { id: 'topic', label: 'Thread Topic', type: 'text', placeholder: 'e.g., 5 simple terminal shortcuts that save developers 2 hours a day', description: '' },
      { id: 'steps', label: 'Key Points/Steps', type: 'textarea', placeholder: '1. Ctrl+R search history, 2. Alt+f move cursor word, 3. pbcopy command, etc.', description: 'Provide the list of items to expand.' }
    ]
  },
  {
    id: 'spec-14',
    name: 'Instagram Carousel Designer',
    category: 'Social Media',
    number: '#14',
    icon: '🎠',
    description: 'Outlines content and visuals for a 7-slide Instagram educational carousel.',
    promptTemplate: `You are an Instagram content designer. Create a slide-by-slide plan for a 7-slide educational carousel.
Topic: {{topic}}
Primary Audience: {{audience}}

For each slide (1-7), provide:
- Visual description (background, elements, typography style)
- Main Title text (big, bold)
- Supporting text (short, under 15 words)
- Direct design notes (e.g., "Use high-contrast blue arrow here")`,
    inputs: [
      { id: 'topic', label: 'Carousel Topic', type: 'text', placeholder: 'e.g., How to read a financial sheet in 60 seconds', description: '' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Creative entrepreneurs and designers', description: '' }
    ]
  },
  {
    id: 'spec-15',
    name: 'TikTok Video Scriptwriter',
    category: 'Social Media',
    number: '#15',
    icon: '🎥',
    description: 'Writes highly engaging, fast-paced TikTok or Reels scripts with video directions.',
    promptTemplate: `Write a 60-second video script for TikTok/Reels on:
Video Concept: {{concept}}
Target Duration: {{duration}}

Format as a split table or list:
- [Visual / Camera Action]: The frame direction, camera cut, or gesture.
- [Audio / Speech]: The exact spoken word (written to sound casual, conversational, and energetic).
Include a strong 3-second hook and a fast CTA at the end.`,
    inputs: [
      { id: 'concept', label: 'Video Concept', type: 'textarea', placeholder: 'e.g., Showing the morning routine of a solo developer who runs three profitable micro-SaaS projects.', description: '' },
      { id: 'duration', label: 'Target Duration', type: 'select', placeholder: 'Select duration', description: '', options: ['15 seconds (Super Hook)', '30 seconds (Quick Tip)', '60 seconds (Story-based)', '90 seconds (Deep Dive)'], defaultValue: '60 seconds (Story-based)' }
    ]
  },
  {
    id: 'spec-16',
    name: 'YouTube SEO Architect',
    category: 'Social Media',
    number: '#16',
    icon: '📺',
    description: 'Generates SEO titles, optimized descriptions, and tag sets for YouTube videos.',
    promptTemplate: `You are a YouTube growth specialist. Optimize this video for search and click-through-rate.
Video Topic: {{topic}}
Keywords: {{keywords}}

Deliver:
1. 5 High-CTR Title ideas (using psychological curiosity, brackets, and keyword placement).
2. An optimized 300-word Video Description (including introduction, section timestamps placeholder, social links section, and keyword density).
3. 20 relevant Search Tags / Keywords.
4. Suggested Thumbnail concept description.`,
    inputs: [
      { id: 'topic', label: 'Video Topic', type: 'text', placeholder: 'e.g., Building a CRM with React and Firebase from scratch', description: '' },
      { id: 'keywords', label: 'Target Keywords', type: 'text', placeholder: 'e.g., react firebase crm, learn firestore react, web app tutorial', description: '' }
    ]
  },
  {
    id: 'spec-17',
    name: 'Social Media Bio Builder',
    category: 'Social Media',
    number: '#17',
    icon: '👤',
    description: 'Designs professional, high-converting bios for LinkedIn, X, and Instagram.',
    promptTemplate: `Create professional social media bios based on:
Name/Profession: {{nameAndProfession}}
Core Value Proposition: {{valueProp}}
Call to Action Link: {{ctaLink}}

Generate 3 variations for each platform:
- LinkedIn: Professional, credential-focused, character-rich banner tagline and About blurb.
- Twitter/X: Concise, punchy, authoritative, under 160 characters.
- Instagram: Visual, structured line-by-line with emojis, under 150 characters.`,
    inputs: [
      { id: 'nameAndProfession', label: 'Name & Role', type: 'text', placeholder: 'e.g., Jane Doe - UI/UX Designer', description: '' },
      { id: 'valueProp', label: 'Core Value Proposition', type: 'text', placeholder: 'e.g., Helping B2B SaaS apps double their trial signups through design systems', description: 'What result do you deliver?' },
      { id: 'ctaLink', label: 'Call to Action', type: 'text', placeholder: 'e.g., JaneDesigns.co/audit (Get a free landing audit)', description: '' }
    ]
  },
  {
    id: 'spec-18',
    name: 'Community Comment Responder',
    category: 'Social Media',
    number: '#18',
    icon: '💬',
    description: 'Crafts smart, positive responses to comments on social channels.',
    promptTemplate: `You are a brand community manager. Write high-quality, authentic responses to the following user comments:
Post Context: {{postContext}}
Comments: {{comments}}

Write professional, friendly, and engaging replies that drive further conversation and reinforce brand affinity.`,
    inputs: [
      { id: 'postContext', label: 'Post Context', type: 'text', placeholder: 'e.g., Announcing the launch of our new client portal design.', description: 'What was the original post about?' },
      { id: 'comments', label: 'User Comments', type: 'textarea', placeholder: 'User 1: Looks amazing! Does it sync with Slack?\nUser 2: Is this included in the basic tier?', description: 'Paste the comments you want responses for.' }
    ]
  },
  {
    id: 'spec-19',
    name: 'Facebook Group Engagement Booster',
    category: 'Social Media',
    number: '#19',
    icon: '👥',
    description: 'Generates interactive poll ideas and prompts to drive organic group activity.',
    promptTemplate: `You are a community builder. Generate 5 high-engagement prompts and 3 interactive polls designed to start conversations inside a Facebook Group / Community focused on:
Group Theme: {{groupTheme}}
Target Demographics: {{demographics}}

Deliver ready-to-paste posts that encourage members to comment, share their opinions, or vote.`,
    inputs: [
      { id: 'groupTheme', label: 'Group Topic / Theme', type: 'text', placeholder: 'e.g., Bootstrapping ecommerce stores to $10k/month', description: '' },
      { id: 'demographics', label: 'Target Demographic', type: 'text', placeholder: 'e.g., Side-hustle marketers and digital shop owners', description: '' }
    ]
  },
  {
    id: 'spec-20',
    name: 'Brand Voice Guidelines Builder',
    category: 'Social Media',
    number: '#20',
    icon: '📣',
    description: 'Establishes clear rules, tones, and vocabulary for writing on social channels.',
    promptTemplate: `You are a Brand Strategist. Build a comprehensive Social Media Brand Voice Guideline based on:
Company/Product: {{company}}
Desirable Traits: {{traits}}
Avoid at all costs: {{avoid}}

Include:
- 3 Core Tone Adjectives (with "Write Like This" vs. "Do NOT Write Like This" examples)
- A list of preferred phrases & vocabulary
- Grammar & formatting rules (capitalization, emojis, paragraph layout)
- A sample social post rewritten in this brand voice`,
    inputs: [
      { id: 'company', label: 'Company / Brand Name', type: 'text', placeholder: 'e.g., Neon Payments', description: '' },
      { id: 'traits', label: 'Tone Traits', type: 'text', placeholder: 'e.g., Bold, energetic, extremely transparent, slightly rebellious', description: 'How do you want to sound?' },
      { id: 'avoid', label: 'Things to Avoid', type: 'text', placeholder: 'e.g., Corporate buzzwords, looking dry or formal, passive voice', description: '' }
    ]
  },

  // CATEGORY 3: SALES & CLOSING
  {
    id: 'spec-21',
    name: 'Cold Outreach Email Writer',
    category: 'Sales & Closing',
    number: '#21',
    icon: '🎯',
    description: 'Drafts highly personalized B2B cold emails with high reply rates.',
    promptTemplate: `You are a cold outreach copywriter who regularly achieves 30%+ open and 15%+ reply rates.
Write a personalized B2B cold email based on:
Sender Service/Offer: {{senderOffer}}
Ideal Client Persona: {{clientPersona}}
Unique Value Proposition: {{uvp}}
Recipient Context/Trigger: {{context}}

Structure:
- Subject Line: Short, conversational, curiosity-inducing (under 5 words).
- Hook: A sentence showing you know their company or role (no generic fluff).
- Value Hook: A short explanation of the outcome you achieve, referencing a case study if possible.
- Low-friction Call to Action (CTA): Ask for a quick "yes/no" or "worth exploring?" rather than a 30-min calendar invite.`,
    inputs: [
      { id: 'senderOffer', label: 'Your Offer / Service', type: 'text', placeholder: 'e.g., UI redesign that increases checkout conversions', description: '' },
      { id: 'clientPersona', label: 'Ideal Client Role', type: 'text', placeholder: 'e.g., Head of Growth at mid-sized Shopify stores', description: '' },
      { id: 'uvp', label: 'Your UVP / Proof Point', type: 'text', placeholder: 'e.g., We helped SoleShoes add $45k in monthly sales with a simple cart redesign', description: 'What is the big hook or result?' },
      { id: 'context', label: 'Personalization Trigger', type: 'text', placeholder: 'e.g., Saw they just raised a Seed round and are hiring developers', description: 'Why are you emailing them right now?' }
    ]
  },
  {
    id: 'spec-22',
    name: 'Discovery Call Script Designer',
    category: 'Sales & Closing',
    number: '#22',
    icon: '📞',
    description: 'Designs structured discovery call flows to qualify prospects and uncover pain points.',
    promptTemplate: `You are an enterprise sales trainer. Design a 15-20 minute Discovery Call Script for:
Service/Product: {{service}}
Target Buyer: {{buyer}}

Structure the script into 5 phases:
1. The Intro & Agenda Setting (Establishing control and tone).
2. Context Gathering (Questions to ask to understand their current setup).
3. Pain Point Drill-Down (3-4 specific questions to uncover hidden problems).
4. Alignment (Confirming they want to solve it and explaining how you help).
5. Next Steps / Commitment (Low-pressure, definitive calendar invite hook).`,
    inputs: [
      { id: 'service', label: 'Your Service/Product', type: 'text', placeholder: 'e.g., Automated accounts payable software', description: '' },
      { id: 'buyer', label: 'Target Buyer Role', type: 'text', placeholder: 'e.g., Chief Financial Officers at logistics companies', description: '' }
    ]
  },
  {
    id: 'spec-23',
    name: 'Objection Handling Master',
    category: 'Sales & Closing',
    number: '#23',
    icon: '🛡️',
    description: 'Provides tactical scripts to defuse objections regarding price, timing, or authority.',
    promptTemplate: `You are an expert sales negotiator. Provide a tactical script and framing to handle the following sales objection:
Objection Received: "{{objection}}"
Your Offer/Service: {{offer}}

Provide:
1. The Psychological Breakdown (What they really mean when they say this).
2. The "Acknowledge & Validate" Response (How to lower their defenses).
3. The Pivot Question (A question that redirects their focus).
4. The exact script to say on a call.
5. The email follow-up response.`,
    inputs: [
      { id: 'objection', label: 'Objection Received', type: 'select', placeholder: 'Select objection', description: '', options: ['"It is too expensive / We do not have the budget"', '"We are using a competitor and are happy"', '"Send me an email with more info and we will review it next quarter"', '"I need to speak to my manager/partner first"', '"We do not have time to implement this right now"'], defaultValue: '"It is too expensive / We do not have the budget"' },
      { id: 'offer', label: 'Your Offer / Pricing', type: 'text', placeholder: 'e.g., $5,000 corporate team-building seminar', description: '' }
    ]
  },
  {
    id: 'spec-24',
    name: 'High-Ticket Closing Script',
    category: 'Sales & Closing',
    number: '#24',
    icon: '🔑',
    description: 'Guides the final closing conversation to handle commitments and secure signatures.',
    promptTemplate: `You are a high-ticket sales closer. Write a conversational script to transition from a successful demo/proposal call into closing the deal.
Offer Price: {{price}}
Target Client Niche: {{clientNiche}}

Provide the exact verbal transitions for:
- Confirming value alignment ("Does this solve the problem we discussed?")
- Presenting the pricing & terms smoothly
- Asking the transition-to-close questions
- Handling immediate post-pricing silence`,
    inputs: [
      { id: 'price', label: 'Offer Price / Investment', type: 'text', placeholder: 'e.g., $10,000 retainer + setup fee', description: '' },
      { id: 'clientNiche', label: 'Client Niche', type: 'text', placeholder: 'e.g., Premium Dental Practice chains', description: '' }
    ]
  },
  {
    id: 'spec-25',
    name: 'Follow-Up Sequence Writer',
    category: 'Sales & Closing',
    number: '#25',
    icon: '🔄',
    description: 'Writes a 4-part post-proposal follow-up email sequence that doesn\'t sound desperate.',
    promptTemplate: `Write a 4-part follow-up email sequence for prospects who have received a proposal but gone silent.
Service Proposed: {{proposedService}}
Initial Conversation Notes: {{notes}}

Design the sequence:
- Email 1 (Day 3): The Value/Reference follow-up (Provide a relevant resource or client result).
- Email 2 (Day 7): The Action/Question follow-up (Short, direct question).
- Email 3 (Day 14): The "Permission to close file" email (Reverse psychology).
- Email 4 (Day 30): The Re-engagement check-in (Lighthearted, fresh angle).`,
    inputs: [
      { id: 'proposedService', label: 'Proposed Service', type: 'text', placeholder: 'e.g., Custom Salesforce Integration and Staff Training', description: '' },
      { id: 'notes', label: 'Initial Conversation Notes', type: 'textarea', placeholder: 'e.g., They loved the dashboard demo, but were concerned about data migration downtime.', description: '' }
    ]
  },
  {
    id: 'spec-26',
    name: 'Client Proposal Architect',
    category: 'Sales & Closing',
    number: '#26',
    icon: '📋',
    description: 'Outlines client proposals with scope, phases, deliverables, and terms.',
    promptTemplate: `You are an elite business consultant. Draft a comprehensive proposal outline for:
Client Business: {{clientName}}
Project Scope/Goal: {{projectGoal}}
Deliverables: {{deliverables}}
Estimated Budget: {{budget}}

Generate:
1. Executive Summary (Highlighting their pain points, not your services).
2. Implementation Roadmap (Phases 1-3 with timelines).
3. The Deliverable Breakdown (Scope boundaries).
4. Investment Options (3 tier options: Essential, Preferred, Premium).
5. Terms, Next Steps & Agreement Sign-off.`,
    inputs: [
      { id: 'clientName', label: 'Client / Business Name', type: 'text', placeholder: 'e.g., Apex Legal Group', description: '' },
      { id: 'projectGoal', label: 'Project Goal', type: 'text', placeholder: 'e.g., Modernize legacy client intake and deploy custom AI intake agents', description: '' },
      { id: 'deliverables', label: 'Key Deliverables', type: 'textarea', placeholder: 'e.g., Tech stack assessment, custom Retool frontend, database integrations, 2 weeks post-launch support.', description: '' },
      { id: 'budget', label: 'Estimated Budget Range', type: 'text', placeholder: 'e.g., $15,000 - $25,000', description: '' }
    ]
  },
  {
    id: 'spec-27',
    name: 'Value Proposition Optimizer',
    category: 'Sales & Closing',
    number: '#27',
    icon: '💎',
    description: 'Refines brand value statements to be clear, compelling, and unique.',
    promptTemplate: `Analyze and optimize this value proposition:
Current Statement: "{{currentStatement}}"
Target Client: {{targetClient}}
Competitors: {{competitors}}

Provide:
1. Critique (Why the current statement is weak, vague, or looks like competitors).
2. The "Value Formula" translation (X delivers Y through Z).
3. 3 optimized alternative statements.
4. An elevator pitch script based on the best alternative.`,
    inputs: [
      { id: 'currentStatement', label: 'Current Value Proposition', type: 'text', placeholder: 'e.g., We provide high-quality coding services to businesses.', description: '' },
      { id: 'targetClient', label: 'Target Client', type: 'text', placeholder: 'e.g., Funded tech startups with less than 20 employees', description: '' },
      { id: 'competitors', label: 'Competitors', type: 'text', placeholder: 'e.g., Freelance platforms and offshore dev agencies', description: '' }
    ]
  },
  {
    id: 'spec-28',
    name: 'Sales Objection Anticipator',
    category: 'Sales & Closing',
    number: '#28',
    icon: '🔮',
    description: 'Prepares a sales team for negative arguments specific to a new product.',
    promptTemplate: `You are a strategic sales consultant. Anticipate the 5 most likely objections a prospect will raise for this new product and outline strategic responses:
Product Name: {{productName}}
Offer Details: {{details}}
Pricing: {{pricing}}

For each of the 5 objections, give the sales rep:
- The objection statement.
- The underlying concern.
- The perfect counter-argument with a micro-script.`,
    inputs: [
      { id: 'productName', label: 'New Product Name', type: 'text', placeholder: 'e.g., AutoCRM AI Copilot', description: '' },
      { id: 'details', label: 'Product Details / Mechanics', type: 'textarea', placeholder: 'e.g., An AI agent that reads incoming client emails and automatically drafts and queues replies inside HubSpot.', description: '' },
      { id: 'pricing', label: 'Pricing Model', type: 'text', placeholder: 'e.g., $299/month flat fee', description: '' }
    ]
  },
  {
    id: 'spec-29',
    name: 'Referral Request Template',
    category: 'Sales & Closing',
    number: '#29',
    icon: '🤝',
    description: 'Writes polite, high-conversion emails asking current clients for referrals.',
    promptTemplate: `Write a highly-effective referral request email to:
Happy Client: {{clientName}}
Delivered Value: {{deliveredValue}}

Ensure the email is warm, appreciative, does not sound desperate, and makes it incredibly easy for them to copy-paste an intro. Provide a sample copy-paste intro they can use to introduce you to their peers.`,
    inputs: [
      { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'e.g., Mark Robinson (CEO of FitFlow)', description: '' },
      { id: 'deliveredValue', label: 'Result Delivered', type: 'text', placeholder: 'e.g., Redesigned their onboarding funnel, adding 400 new users in 30 days', description: '' }
    ]
  },
  {
    id: 'spec-30',
    name: 'Negotiation Script Builder',
    category: 'Sales & Closing',
    number: '#30',
    icon: '⚖️',
    description: 'Prepares scripts for concessions, scope reductions, and payment options.',
    promptTemplate: `You are a professional business negotiator. Create a negotiation plan and verbal script for this scenario:
Initial Price Offered: {{initialPrice}}
Client Budget Constraint: {{clientBudget}}
Concessions You Can Make: {{concessions}}

Provide:
1. Negotiation strategy (Anchor points and value-adds).
2. The "Scope Trade-Off" script (How to offer lower price in exchange for lower scope).
3. Payment terms flexibilities script.
4. Close/Agreement statement.`,
    inputs: [
      { id: 'initialPrice', label: 'Original Project Price', type: 'text', placeholder: 'e.g., $25,000 lump sum', description: '' },
      { id: 'clientBudget', label: 'Client Budget Limit', type: 'text', placeholder: 'e.g., $18,000 maximum', description: '' },
      { id: 'concessions', label: 'Concessions Allowed', type: 'textarea', placeholder: 'e.g., Remove data migration support, extend timeline by 4 weeks, break payment into 4 installments.', description: '' }
    ]
  },

  // CATEGORY 4: EMAIL MARKETING
  {
    id: 'spec-31',
    name: 'Welcome Email Sequence',
    category: 'Email Marketing',
    number: '#31',
    icon: '👋',
    description: 'Drafts a 3-part automated welcome sequence that onboarding subscribers and sells.',
    promptTemplate: `Create a 3-part welcome email sequence for new subscribers of:
List Niche: {{listNiche}}
Lead Magnet Received: {{leadMagnet}}
Core Paid Offer: {{paidOffer}}

Write the full text of:
- Email 1 (Deliver & Connect): Deliver the lead magnet, set expectations, ask a simple reply-generating question.
- Email 2 (Valuable Lesson): Share a major shift or lesson, introduce the core pain point of the niche.
- Email 3 (The Offer Introduction): Connect the lesson to the Core Paid Offer. Include urgency or benefits.`,
    inputs: [
      { id: 'listNiche', label: 'List Niche/Topic', type: 'text', placeholder: 'e.g., Real Estate Marketing & Lead Generation', description: '' },
      { id: 'leadMagnet', label: 'Lead Magnet Given', type: 'text', placeholder: 'e.g., PDF: 15 High-converting Facebook Ad templates for Realtors', description: '' },
      { id: 'paidOffer', label: 'Paid Core Offer', type: 'text', placeholder: 'e.g., Real Estate Ad Lab monthly membership program ($97/mo)', description: '' }
    ]
  },
  {
    id: 'spec-32',
    name: 'Product Launch Sequence',
    category: 'Email Marketing',
    number: '#32',
    icon: '🚀',
    description: 'Writes a complete 5-email product launch sequence to drive sales and excitement.',
    promptTemplate: `Write a 5-email launch sequence for:
Product Name: {{productName}}
Core Value Proposition: {{valueProp}}
Price / Offer Details: {{priceDetails}}
Launch Period/Duration: {{duration}}

Structure:
- Email 1 (The Teaser/Hook): Build curiosity, outline the problem, announce the upcoming release.
- Email 2 (The Reveal): Announce doors open, lay out features/benefits, show testimonials/mock scenarios.
- Email 3 (The Case Study): Focus on a client story/transformation.
- Email 4 (FAQ & Objections): Answer common questions, deal with pricing objections.
- Email 5 (Last Chance/Urgency): 12 hours left before doors close, create a countdown and clear call to action.`,
    inputs: [
      { id: 'productName', label: 'Launch Product Name', type: 'text', placeholder: 'e.g., UI Masterclass 2026', description: '' },
      { id: 'valueProp', label: 'Core Value Proposition', type: 'text', placeholder: 'e.g., Go from junior coder to senior designer in 6 weeks with hands-on Figma projects', description: '' },
      { id: 'priceDetails', label: 'Pricing / Deal', type: 'text', placeholder: 'e.g., Launch price $199 (Regular $499)', description: '' },
      { id: 'duration', label: 'Launch Window', type: 'text', placeholder: 'e.g., 5 Days (Monday to Friday)', description: '' }
    ]
  },
  {
    id: 'spec-33',
    name: 'Abandoned Cart Sequence',
    category: 'Email Marketing',
    number: '#33',
    icon: '🛒',
    description: 'Writes recovery emails for shoppers who leave checkouts before buying.',
    promptTemplate: `Write a 3-part abandoned cart recovery sequence for:
Store Niche: {{storeNiche}}
Item Abandoned: {{itemName}}
Price: {{price}}
Incentive (Optional): {{incentive}}

Create:
- Email 1 (1 hour later - Friendly Reminder): Check if they had tech issues, highlight item benefits.
- Email 2 (24 hours later - Social Proof): Share client reviews of the specific item.
- Email 3 (48 hours later - Limited Incentive): Introduce a discount/bonus to buy now.`,
    inputs: [
      { id: 'storeNiche', label: 'Store Niche', type: 'text', placeholder: 'e.g., Eco-friendly Activewear', description: '' },
      { id: 'itemName', label: 'Item Name', type: 'text', placeholder: 'e.g., The EarthFit Recycled Leggings', description: '' },
      { id: 'price', label: 'Item Price', type: 'text', placeholder: 'e.g., $78.00', description: '' },
      { id: 'incentive', label: 'Discount/Incentive (Optional)', type: 'text', placeholder: 'e.g., 10% off code (LAST10)', description: '' }
    ]
  },
  {
    id: 'spec-34',
    name: 'Newsletter Planner',
    category: 'Email Marketing',
    number: '#34',
    icon: '🗞️',
    description: 'Builds outlines and content draft templates for weekly news updates.',
    promptTemplate: `You are an expert newsletter strategist. Design a template outline and draft content for a weekly newsletter:
Newsletter Name: {{newsletterName}}
Target Reader: {{reader}}
Topics/News: {{topics}}

Create a layout containing:
- Opening Editorial (Warm, narrative hook on a topic)
- Curated Links (Summarized with "Why it matters")
- Quick Actionable Hack/Tip of the week
- Sponsor or Self-Promotion block`,
    inputs: [
      { id: 'newsletterName', label: 'Newsletter Name', type: 'text', placeholder: 'e.g., The Async Founder', description: '' },
      { id: 'reader', label: 'Target Reader', type: 'text', placeholder: 'e.g., Solo startup founders and indie hackers', description: '' },
      { id: 'topics', label: 'Weekly News / Concepts', type: 'textarea', placeholder: 'e.g., 1. Stripe launches new billing features, 2. The rise of micro-consultancies, 3. How to write clean CSS in 2026', description: 'Briefly list the topics to cover.' }
    ]
  },
  {
    id: 'spec-35',
    name: 'Re-Engagement Campaign',
    category: 'Email Marketing',
    number: '#35',
    icon: '💤',
    description: 'Writes a sequence to wake up inactive subscribers or prune lists.',
    promptTemplate: `Write a 2-part re-engagement (win-back) email campaign to reactivate silent list subscribers:
Niche/Industry: {{niche}}
Previous Topics: {{previousTopics}}

- Email 1: "Are you okay?" or "Should I stop emailing you?" style email. Short, bold, asking for a reply.
- Email 2: The "Goodbye for now" email. Explains they will be removed in 3 days unless they click a link to stay.`,
    inputs: [
      { id: 'niche', label: 'Niche / Industry', type: 'text', placeholder: 'e.g., Personal Development & Productivity', description: '' },
      { id: 'previousTopics', label: 'Topics Discussed', type: 'text', placeholder: 'e.g., Time blocking, journaling prompts, morning routines', description: '' }
    ]
  },
  {
    id: 'spec-36',
    name: 'Subject Line A/B Tester',
    category: 'Email Marketing',
    number: '#36',
    icon: '🧪',
    description: 'Generates 20 high-open-rate subject lines and matching preview texts.',
    promptTemplate: `You are an email open-rate strategist. Generate 20 subject line ideas and matching preview texts for:
Email Topic: {{emailTopic}}
Audience: {{audience}}

Generate variations in the following categories:
- Short & Intriguing (under 4 words)
- Direct & Value-First
- Negative Hook / Warning
- Urgency/Time-sensitive
- Curiosity Gaps`,
    inputs: [
      { id: 'emailTopic', label: 'Email Topic', type: 'text', placeholder: 'e.g., A newsletter announcing a free audit checklist tool', description: '' },
      { id: 'audience', label: 'Audience Niche', type: 'text', placeholder: 'e.g., Small business consultants', description: '' }
    ]
  },
  {
    id: 'spec-37',
    name: 'Event Invitation Sequence',
    category: 'Email Marketing',
    number: '#37',
    icon: '🎫',
    description: 'Writes registration and reminder sequences for webinars or launches.',
    promptTemplate: `Write a 3-part promotional sequence inviting list subscribers to sign up for a digital event:
Event Name: {{eventName}}
Event Topic: {{topic}}
Guest Speakers / Authority: {{speakers}}
Date & Time: {{dateTime}}
Call to Action (Registration Link): {{link}}

- Email 1 (7 Days out - Announcement): Build context around the problem, announce the webinar, list speaker credentials.
- Email 2 (2 Days out - Agenda): Detail the 3 main takeaways they will learn live.
- Email 3 (Day of - Last Call): 2 hours before the broadcast, focus on urgency and live interaction opportunity.`,
    inputs: [
      { id: 'eventName', label: 'Event Name', type: 'text', placeholder: 'e.g., Scale SaaS to $50k MRR Live Workshop', description: '' },
      { id: 'topic', label: 'Event Topic', type: 'text', placeholder: 'e.g., Designing scalable outbound sales workflows without hiring SDRs', description: '' },
      { id: 'speakers', label: 'Speakers & Roles', type: 'text', placeholder: 'e.g., Alex Johnson (Founder of OutboundLabs)', description: '' },
      { id: 'dateTime', label: 'Date and Time', type: 'text', placeholder: 'e.g., Thursday, July 15 at 2:00 PM EST', description: '' },
      { id: 'link', label: 'Registration URL', type: 'text', placeholder: 'e.g., ScaleWorkshop.com/live', description: '' }
    ]
  },
  {
    id: 'spec-38',
    name: 'Feedback Solicitor',
    category: 'Email Marketing',
    number: '#38',
    icon: '📝',
    description: 'Writes emails asking clients for reviews, testimonials, or survey feedback.',
    promptTemplate: `Write a polite, engaging email requesting survey feedback or customer reviews:
Company/Product: {{company}}
Trigger Event: {{triggerEvent}}
Incentive (Optional): {{incentive}}

Ensure the email is concise, expresses genuine appreciation, and explains exactly how long the survey will take (e.g. "exactly 2 minutes").`,
    inputs: [
      { id: 'company', label: 'Company / Product', type: 'text', placeholder: 'e.g., TaskFlow Pro app', description: '' },
      { id: 'triggerEvent', label: 'Trigger Event', type: 'text', placeholder: 'e.g., Using the premium plan for 30 days', description: 'When are they receiving this?' },
      { id: 'incentive', label: 'Incentive for completing', type: 'text', placeholder: 'e.g., Entered into a draw for a $100 Amazon Gift card', description: 'What do they get?' }
    ]
  },
  {
    id: 'spec-39',
    name: 'Upsell / Cross-sell Email Builder',
    category: 'Email Marketing',
    number: '#39',
    icon: '📈',
    description: 'Creates post-purchase sequences to upgrade buyers to higher-tier products.',
    promptTemplate: `Write an upsell email targeting buyers of:
Recent Purchase: {{recentPurchase}}
Price: {{recentPrice}}
Upsell Product: {{upsellProduct}}
Upsell Price/Offer: {{upsellPrice}}

Write an email that congratulates them on their purchase, shows how the Upsell Product will accelerate or expand their results, and provides a limited-time bonus/discount to upgrade now.`,
    inputs: [
      { id: 'recentPurchase', label: 'Recent Purchase', type: 'text', placeholder: 'e.g., Standard Brand Assets Kit', description: '' },
      { id: 'recentPrice', label: 'Recent Price', type: 'text', placeholder: 'e.g., $49', description: '' },
      { id: 'upsellProduct', label: 'Upsell Offer', type: 'text', placeholder: 'e.g., Custom Brand Style Masterclass and 1-on-1 Consultation', description: '' },
      { id: 'upsellPrice', label: 'Upsell Price', type: 'text', placeholder: 'e.g., $199 upgrade flat-fee', description: '' }
    ]
  },
  {
    id: 'spec-40',
    name: 'Lead Magnet Delivery Email',
    category: 'Email Marketing',
    number: '#40',
    icon: '🎁',
    description: 'Delivers digital downloads while teasing upcoming content and selling value.',
    promptTemplate: `Write a short, engaging email delivering a digital download:
Lead Magnet Name: {{magnetName}}
Value Description: {{valueDescription}}
What is Next / Teaser: {{teaser}}

Provide the download button text and a brief explanation of how to use the resource for best results.`,
    inputs: [
      { id: 'magnetName', label: 'Lead Magnet Name', type: 'text', placeholder: 'e.g., The 2026 Developer Salary Blueprint', description: '' },
      { id: 'valueDescription', label: 'Key Value of File', type: 'text', placeholder: 'e.g., Shows the exact salary ranges, negotiation tactics, and tech stacks in demand', description: '' },
      { id: 'teaser', label: 'Teaser for Next Email', type: 'text', placeholder: 'e.g., Tomorrow, I will email you the exact resume structure that got me hired at Google', description: '' }
    ]
  },

  // CATEGORY 5: STRATEGY & RESEARCH
  {
    id: 'spec-41',
    name: 'Competitor SWOT Analyzer',
    category: 'Strategy & Research',
    number: '#41',
    icon: '🕵️',
    description: 'Generates competitive analyses with market opportunities and product weaknesses.',
    promptTemplate: `You are a corporate strategy consultant. Perform a deep-dive SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) on this business category or competitor:
Target Competitor/Market: {{targetMarket}}
Our Business Model: {{ourModel}}

Provide a detailed SWOT matrix, followed by 3 actionable tactical recommendations on how our business model can exploit the competitor's main weaknesses.`,
    inputs: [
      { id: 'targetMarket', label: 'Competitor/Niche Name', type: 'text', placeholder: 'e.g., Webflow (Low-code design platform)', description: '' },
      { id: 'ourModel', label: 'Our Business Model', type: 'text', placeholder: 'e.g., A developer-first UI toolkit with pure React/Tailwind code blocks', description: '' }
    ]
  },
  {
    id: 'spec-42',
    name: 'Customer Avatar Builder',
    category: 'Strategy & Research',
    number: '#42',
    icon: '🧠',
    description: 'Creates detailed buyer profiles detailing pain points, fears, and objections.',
    promptTemplate: `You are a consumer psychologist. Build a deeply detailed Customer Avatar profile across 8 core dimensions (Demographics, Psychographics, Core Pain Points, Key Hopes/Aspirations, Primary Objections, Media/Info Intake, Decision Criteria, Emotional Triggers).
Business/Niche: {{niche}}
Product: {{product}}

Include a "Day in the Life" narrative showing how their pain points manifest and the exact phrases they use when talking about these problems.`,
    inputs: [
      { id: 'niche', label: 'Business / Industry', type: 'text', placeholder: 'e.g., B2B Executive Coaching', description: '' },
      { id: 'product', label: 'Your Specific Product', type: 'text', placeholder: 'e.g., 6-month High-Performance Leadership Retainer', description: '' }
    ]
  },
  {
    id: 'spec-43',
    name: 'Niche Identification Advisor',
    category: 'Strategy & Research',
    number: '#43',
    icon: '🔍',
    description: 'Helps narrow down broad markets into highly profitable sub-niches.',
    promptTemplate: `Help sub-niche a broad business category to find high-margin, low-competition spaces.
Broad Category: {{broadCategory}}
Core Skills/Assets: {{skills}}

Generate 5 specific sub-niche options. For each, evaluate:
- Market size & ability to pay.
- Ease of customer acquisition.
- Suggested positioning hook.
- Recommended initial offer.`,
    inputs: [
      { id: 'broadCategory', label: 'Broad Category', type: 'text', placeholder: 'e.g., Web Design Agency', description: '' },
      { id: 'skills', label: 'Your Key Skills/Assets', type: 'text', placeholder: 'e.g., High-speed static web design, SEO optimization, booking systems integrations', description: '' }
    ]
  },
  {
    id: 'spec-44',
    name: 'Pricing Strategy Planner',
    category: 'Strategy & Research',
    number: '#44',
    icon: '💵',
    description: 'Models pricing tiers (Value-based, Retainer, Package) for optimal revenue.',
    promptTemplate: `You are a pricing strategist. Model the optimal pricing tiers for this service/product:
Service Offered: {{service}}
Target Buyer: {{buyer}}
Current Competitor Pricing: {{competitors}}

Outline 3 distinct options:
1. Hourly/T&M comparison (and why to avoid it).
2. The Value-based Retainer model.
3. The Productized Service Package model.
Recommend the optimal tier structure (e.g. Good, Better, Best) with exact price tags and scope inclusions.`,
    inputs: [
      { id: 'service', label: 'Service / Product', type: 'text', placeholder: 'e.g., SEO Optimization & Content Management', description: '' },
      { id: 'buyer', label: 'Target Client Profile', type: 'text', placeholder: 'e.g., Local Dental Clinics with 3+ locations', description: '' },
      { id: 'competitors', label: 'Competitor Rates', type: 'text', placeholder: 'e.g., $100/hr freelancers or $2k/mo agencies', description: '' }
    ]
  },
  {
    id: 'spec-45',
    name: 'Product Launch Checklist Creator',
    category: 'Strategy & Research',
    number: '#45',
    icon: '📋',
    description: 'Generates step-by-step launch checklists across tech, marketing, and ops.',
    promptTemplate: `Generate a comprehensive, step-by-step product launch checklist:
Product Launching: {{product}}
Target Launch Date: {{launchDate}}

Divide the checklist into 3 phases:
- Pre-launch (Tech, checkout flow validation, warm-up content, sequence setups).
- Launch Day (Social announcements, email campaigns, customer service readiness).
- Post-launch (Onboarding, metric tracking, fulfillment audits).`,
    inputs: [
      { id: 'product', label: 'Product Name/Niche', type: 'text', placeholder: 'e.g., Micro-SaaS for feedback collection', description: '' },
      { id: 'launchDate', label: 'Target Launch Date', type: 'text', placeholder: 'e.g., 30 Days from now', description: '' }
    ]
  },
  {
    id: 'spec-46',
    name: 'Market Gap Finder',
    category: 'Strategy & Research',
    number: '#46',
    icon: '🕳️',
    description: 'Analyzes public customer reviews to extract competitors\' customer complaints.',
    promptTemplate: `You are a product designer. Spot market opportunities by analyzing competitor weaknesses.
Competitor Name/Product: {{competitorName}}
Paste Typical Critical Reviews/Complaints: {{reviews}}

Provide:
1. Analysis of the core emotional pain points ignored by the competitor.
2. Feature/Value gaps identified.
3. Solution concepts to capitalize on these gaps.
4. Suggested positioning line targeting disgruntled competitor users.`,
    inputs: [
      { id: 'competitorName', label: 'Competitor', type: 'text', placeholder: 'e.g., Calendly', description: '' },
      { id: 'reviews', label: 'Typical Competitor Complaints', type: 'textarea', placeholder: 'Paste typical complaints or critical themes (e.g. "Too hard to brand, notifications fail, customer service is slow, pricing is weird for teams").', description: '' }
    ]
  },
  {
    id: 'spec-47',
    name: 'Blue Ocean Strategy Designer',
    category: 'Strategy & Research',
    number: '#47',
    icon: '🌊',
    description: 'Uses the ERRC framework to design high-value, low-competition business concepts.',
    promptTemplate: `Apply the Blue Ocean Strategy framework to redesign a standard business model.
Industry Niche: {{niche}}
Our Core Concept: {{concept}}

Fill out the ERRC Grid:
- Eliminate: What factors should the industry take for granted that we should eliminate?
- Reduce: What factors should be reduced well below the industry standard?
- Raise: What factors should be raised well above the industry standard?
- Create: What factors should be created that the industry has never offered?
Deliver a clean strategy statement based on this analysis.`,
    inputs: [
      { id: 'niche', label: 'Standard Industry Niche', type: 'text', placeholder: 'e.g., Luxury Gyms / Fitness clubs', description: '' },
      { id: 'concept', label: 'Our Concept', type: 'text', placeholder: 'e.g., A gym that is open 24/7 with zero staff, using app-key codes and automated coaching terminals.', description: '' }
    ]
  },
  {
    id: 'spec-48',
    name: 'Risk Assessment Matrix',
    category: 'Strategy & Research',
    number: '#48',
    icon: '⚠️',
    description: 'Lists potential operational/technical risks and designs mitigation plans.',
    promptTemplate: `Perform a detailed Risk Assessment for this project or business initiative:
Initiative: {{initiative}}
Key Elements: {{elements}}

Create a Risk Matrix detailing 5 major risks, scoring each on Likelihood (1-5) and Impact (1-5), and provide a detailed mitigation and recovery plan for each.`,
    inputs: [
      { id: 'initiative', label: 'Business Initiative', type: 'text', placeholder: 'e.g., Moving local client database to AWS Cloud', description: '' },
      { id: 'elements', label: 'Key Details / Specs', type: 'textarea', placeholder: 'e.g., 5,000 client history files, 15 TB media assets, active clients require access 24/7.', description: '' }
    ]
  },
  {
    id: 'spec-49',
    name: 'OKR Goal Setting Workshop',
    category: 'Strategy & Research',
    number: '#49',
    icon: '🎯',
    description: 'Sets up quarterly Objectives and Key Results with specific target metrics.',
    promptTemplate: `You are an operations strategist. Build a quarterly OKR (Objectives and Key Results) plan for:
Business focus/Goal: {{quarterlyFocus}}
Team Size: {{teamSize}}

Provide:
- 3 core Objectives (inspiring, action-oriented, qualitative).
- 3-4 Key Results for each Objective (measurable, time-bound, quantifiable).
- Suggested weekly tracking metrics (lead indicators).`,
    inputs: [
      { id: 'quarterlyFocus', label: 'Quarterly Focus/Goal', type: 'text', placeholder: 'e.g., Increase our monthly recurring revenue from $12k to $20k', description: '' },
      { id: 'teamSize', label: 'Team Size', type: 'select', placeholder: 'Select size', description: '', options: ['Solo Founder', 'Small Team (2-10)', 'Mid-size company (10-50)'], defaultValue: 'Solo Founder' }
    ]
  },
  {
    id: 'spec-50',
    name: 'Monetization Strategy Brainstormer',
    category: 'Strategy & Research',
    number: '#50',
    icon: '💡',
    description: 'Suggests 5 alternate revenue streams for any business or project.',
    promptTemplate: `You are a monetization consultant. Brainstorm 5 alternate revenue models for:
Current Business Model: {{currentModel}}
Target Audience: {{audience}}

Generate detailed strategies for:
1. Subscription/Recurring Tier
2. Productized Service Add-on
3. Info-Product / Course Integration
4. Sponsorship/Advertising Placement
5. Affiliate/Referral Revenue`,
    inputs: [
      { id: 'currentModel', label: 'Current Model', type: 'text', placeholder: 'e.g., We design landing pages for $500 flat fee.', description: '' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Small local fitness instructors and trainers', description: '' }
    ]
  },

  // CATEGORY 6: CUSTOMER SERVICE
  {
    id: 'spec-51',
    name: 'Angry Customer Resolver',
    category: 'Customer Service',
    number: '#51',
    icon: '😤',
    description: 'Resolves customer complaints with empathy while protecting business interests.',
    promptTemplate: `You are a Customer Experience Manager. Write an email to defuse this customer conflict:
Customer Message: "{{customerMessage}}"
Our Position/Policy: {{ourPolicy}}

Draft a reply that:
- De-escalates tension immediately through active listening and validation (no generic "apologize for inconvenience").
- Explains the solution or parameters under our policy clearly.
- Offers a goodwill gesture if appropriate.
- Finishes with a positive, trust-rebuilding closing.`,
    inputs: [
      { id: 'customerMessage', label: 'Customer Message', type: 'textarea', placeholder: 'Paste client\'s complaint email here...', description: '' },
      { id: 'ourPolicy', label: 'Our Policy / Solution', type: 'text', placeholder: 'e.g., No refunds after 14 days, but we can credit their account for a different course.', description: '' }
    ]
  },
  {
    id: 'spec-52',
    name: 'Refund Policy Standardizer',
    category: 'Customer Service',
    number: '#52',
    icon: '📄',
    description: 'Drafts clear, legally-conscious refund policies that protect business cash flow.',
    promptTemplate: `Write a standard, legally-conscious Refund Policy based on:
Business Type: {{businessType}}
Refund Window/Terms: {{terms}}

Provide a clear, reader-friendly policy document (written in plain English, avoiding jargon) and a template response for staff to handle refund requests that violate these policies.`,
    inputs: [
      { id: 'businessType', label: 'Business Type', type: 'text', placeholder: 'e.g., High-ticket software consulting agency', description: '' },
      { id: 'terms', label: 'Refund Terms', type: 'text', placeholder: 'e.g., No refunds after kick-off call. 50% deposit non-refundable under all circumstances.', description: '' }
    ]
  },
  {
    id: 'spec-53',
    name: 'Client Onboarding Workflow',
    category: 'Customer Service',
    number: '#53',
    icon: '🤝',
    description: 'Designs onboarding timelines, intake forms, and kick-off protocols.',
    promptTemplate: `Design a high-touch Client Onboarding Workflow for:
Service Offered: {{service}}
Client Niche: {{clientNiche}}

Provide:
1. Day 1: Welcome Package & Intake Form fields (Exactly what details to ask for).
2. Day 3: Kick-off Call agenda and milestone alignment.
3. Client Welcome Email template.
4. Internal prep checklist for the delivery team.`,
    inputs: [
      { id: 'service', label: 'Service Offered', type: 'text', placeholder: 'e.g., 3-Month SEO optimization engagement', description: '' },
      { id: 'clientNiche', label: 'Client Niche', type: 'text', placeholder: 'e.g., Boutique Shopify brands', description: '' }
    ]
  },
  {
    id: 'spec-54',
    name: 'Review Responder',
    category: 'Customer Service',
    number: '#54',
    icon: '⭐',
    description: 'Drafts answers to public reviews, turning critical stars into positive PR.',
    promptTemplate: `Write a public response to a client review:
Review Author: {{author}}
Star Rating: {{stars}}
Review Text: "{{reviewText}}"

Provide an optimized public reply:
- If 1-3 Stars: Validate, stay professional, pivot to private support, explain changes made.
- If 4-5 Stars: Express gratitude, reference a specific comment, invite them back.`,
    inputs: [
      { id: 'author', label: 'Reviewer Name', type: 'text', placeholder: 'e.g., Robert S.', description: '' },
      { id: 'stars', label: 'Star Rating', type: 'select', placeholder: 'Select stars', description: '', options: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'], defaultValue: '5 Stars' },
      { id: 'reviewText', label: 'Review Text', type: 'textarea', placeholder: 'e.g., Delivery was 2 days late and the layout didn\'t look like the mockup, but the support team fixed it fast.', description: '' }
    ]
  },
  {
    id: 'spec-55',
    name: 'Crisis Communication Statement',
    category: 'Customer Service',
    number: '#55',
    icon: '🚨',
    description: 'Drafts press and customer statements during tech outages or project delays.',
    promptTemplate: `You are a PR Crisis Consultant. Draft a statement to address:
The Incident: {{incident}}
Affected Customers: {{affected}}
Expected Resolution Time: {{resolution}}

Provide:
- An internal email to staff detailing speaking rules and support instructions.
- A public statement (for social / email lists) taking extreme ownership, explaining the technical cause simply, and detailing compensation or resolution.`,
    inputs: [
      { id: 'incident', label: 'The Incident', type: 'textarea', placeholder: 'e.g., A database migration script corrupted customer settings, taking the dashboard offline for 6 hours.', description: '' },
      { id: 'affected', label: 'Who is Affected', type: 'text', placeholder: 'e.g., All active premium subscribers', description: '' },
      { id: 'resolution', label: 'Resolution Timeline', type: 'text', placeholder: 'e.g., Fixed in 4 hours, systems fully restored now, database backups verified.', description: '' }
    ]
  },
  {
    id: 'spec-56',
    name: 'Support Ticket FAQ Generator',
    category: 'Customer Service',
    number: '#56',
    icon: '🎫',
    description: 'Converts support transcripts into reuseable internal macro answers.',
    promptTemplate: `Analyze this customer support conversation and generate an internal Support Macro template:
Support Chat Logs: {{logs}}

Create a reusable Macro template (with bracketed parameters like [Customer Name] or [Date]) so support agents can paste this in to resolve similar issues in under 10 seconds.`,
    inputs: [
      { id: 'logs', label: 'Support Chat Logs', type: 'textarea', placeholder: 'Paste transcript here...', description: '' }
    ]
  },
  {
    id: 'spec-57',
    name: 'VIP Client Care Letter',
    category: 'Customer Service',
    number: '#57',
    icon: '💎',
    description: 'Writes letters to key clients checking in, updating, or gifting.',
    promptTemplate: `Write a high-end personal letter to a high-value client:
Client Name: {{clientName}}
Project Status: {{projectStatus}}
Goodwill Gesture/Gift: {{gift}}

The letter should sound warm, highly customized, and show elite personal attention. Keep it concise yet premium.`,
    inputs: [
      { id: 'clientName', label: 'VIP Client Name', type: 'text', placeholder: 'e.g., Marcus Vance (CMO at TechCorp)', description: '' },
      { id: 'projectStatus', label: 'Project Status Update', type: 'text', placeholder: 'e.g., Phase 1 portal built, user tests showing 98% satisfaction', description: '' },
      { id: 'gift', label: 'Gift Details', type: 'text', placeholder: 'e.g., Bottle of vintage Cabernet sent to his office', description: '' }
    ]
  },
  {
    id: 'spec-58',
    name: 'Customer Feedback Summarizer',
    category: 'Customer Service',
    number: '#58',
    icon: '📊',
    description: 'Summarizes client survey entries into core requests and feature priorities.',
    promptTemplate: `You are a product manager. Synthesize this customer feedback data:
Raw Feedback Entries: {{rawFeedback}}

Provide:
- Top 3 recurring complaints/issues.
- Top 3 requested improvements/features.
- A prioritized roadmap recommendation based on impact-vs-effort.`,
    inputs: [
      { id: 'rawFeedback', label: 'Raw Feedback', type: 'textarea', placeholder: 'Paste list of support inputs, review notes, or survey answers here...', description: '' }
    ]
  },
  {
    id: 'spec-59',
    name: 'Help Center Article Writer',
    category: 'Customer Service',
    number: '#59',
    icon: '📖',
    description: 'Writes clear, step-by-step help center articles with images placeholders.',
    promptTemplate: `Write a Help Center Article detailing:
Task / Feature: {{task}}
Steps Required: {{steps}}

Ensure the article has:
- Clear title
- Summary sentence
- Numbered step-by-step guide (with bold text actions)
- "Pro Tip" highlight boxes
- Troubleshooting sub-section`,
    inputs: [
      { id: 'task', label: 'What the user wants to do', type: 'text', placeholder: 'e.g., How to export your transaction logs as CSV', description: '' },
      { id: 'steps', label: 'Raw Steps', type: 'textarea', placeholder: '1. Go to billing page, 2. Click History tab, 3. Select date range, 4. Click Download CSV.', description: '' }
    ]
  },
  {
    id: 'spec-60',
    name: 'Churn Prevention Agent',
    category: 'Customer Service',
    number: '#60',
    icon: '🛡️',
    description: 'Writes recovery emails for customers who submit cancellation requests.',
    promptTemplate: `Write a churn prevention email sequence for:
Product Type: {{productType}}
Reason for Cancelling: {{reason}}
Retention Offer: {{offer}}

Draft a warm email that validates their concern, presents the Retention Offer, and details how easy it is to accept, while keeping them active.`,
    inputs: [
      { id: 'productType', label: 'Product Type', type: 'text', placeholder: 'e.g., $49/mo SEO Analytics software', description: '' },
      { id: 'reason', label: 'Reason for Cancelling', type: 'select', placeholder: 'Select reason', description: '', options: ['"It is too expensive"', '"I do not use it enough / Too busy"', '"I am missing a key feature"', '"Going to a competitor"', '"Project ended"'], defaultValue: '"I do not use it enough / Too busy"' },
      { id: 'offer', label: 'Retention Offer', type: 'text', placeholder: 'e.g., 3 months at 50% discount or a free 1-on-1 strategy call with our expert', description: '' }
    ]
  },

  // CATEGORY 7: OPERATIONS
  {
    id: 'spec-61',
    name: 'Meeting Transcript Summarizer',
    category: 'Operations',
    number: '#61',
    icon: '📝',
    description: 'Extracts clear summaries, action items, and timelines from raw transcripts.',
    promptTemplate: `You are an executive chief of staff. Synthesize this raw meeting transcript:
Transcript: {{transcript}}

Deliver a clean summary containing:
1. Executive Summary (2 sentences).
2. Key Decisions Made.
3. Action Items (Structured: Who is doing it, What is the task, and When is the deadline).
4. Unresolved Issues for next meeting agenda.`,
    inputs: [
      { id: 'transcript', label: 'Meeting Transcript', type: 'textarea', placeholder: 'Paste raw meeting transcripts or Otter.ai/Zoom summaries here...', description: '' }
    ]
  },
  {
    id: 'spec-62',
    name: 'SOP Writer',
    category: 'Operations',
    number: '#62',
    icon: '⚙️',
    description: 'Creates Standard Operating Procedures detailing software, triggers, and steps.',
    promptTemplate: `Create a professional Standard Operating Procedure (SOP) based on:
SOP Title: {{sopTitle}}
Objective: {{objective}}
Trigger / When to do: {{trigger}}
Steps: {{steps}}
Tools Used: {{tools}}

Format the SOP with a professional title block, prerequisites, sequential numbered instructions, and quality checks.`,
    inputs: [
      { id: 'sopTitle', label: 'SOP Title', type: 'text', placeholder: 'e.g., Processing Monthly Client Invoices', description: '' },
      { id: 'objective', label: 'SOP Objective', type: 'text', placeholder: 'e.g., Ensure all invoices are generated, verified, and sent by the 1st of every month', description: '' },
      { id: 'trigger', label: 'Trigger Event', type: 'text', placeholder: 'e.g., The 28th of every month', description: '' },
      { id: 'tools', label: 'Tools Used', type: 'text', placeholder: 'e.g., Stripe, HubSpot, Google Sheets', description: '' },
      { id: 'steps', label: 'Raw Steps to Describe', type: 'textarea', placeholder: '1. Export time sheets from Clockify, 2. Match with client contracts, 3. Create invoice in Stripe, 4. Send draft to finance lead for approval.', description: '' }
    ]
  },
  {
    id: 'spec-63',
    name: 'Project Plan & Timeline Builder',
    category: 'Operations',
    number: '#63',
    icon: '📅',
    description: 'Outlines project milestones, task details, and weekly deliverables.',
    promptTemplate: `Build a complete Project Plan and milestone timeline for:
Project Name: {{projectName}}
Duration: {{duration}}
Key Goals: {{goals}}

Format as a detailed project plan divided into weeks/phases, mapping tasks, blockers, and responsible roles.`,
    inputs: [
      { id: 'projectName', label: 'Project Name', type: 'text', placeholder: 'e.g., Launching corporate podcast', description: '' },
      { id: 'duration', label: 'Total Duration', type: 'text', placeholder: 'e.g., 8 Weeks', description: '' },
      { id: 'goals', label: 'Project Goals', type: 'textarea', placeholder: 'e.g., Setup podcast platform hosting, record 3 launch episodes, create promotional audio-grams, launch on Apple & Spotify.', description: '' }
    ]
  },
  {
    id: 'spec-64',
    name: 'Job Description Writer',
    category: 'Operations',
    number: '#64',
    icon: '💼',
    description: 'Writes hiring descriptions detailing role, requirements, and culture.',
    promptTemplate: `Write a compelling job description for:
Job Title: {{jobTitle}}
Experience Level: {{experience}}
Core Responsibilities: {{responsibilities}}
Key Requirements/Tech: {{requirements}}
Company Culture Description: {{culture}}

Structure:
- About the Role (Exciting hook).
- Core Responsibilities (Bullet points).
- Minimum Requirements (Strict list).
- What We Offer (Salary placeholder, benefits).
- Application Process (Instructions).`,
    inputs: [
      { id: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'e.g., Senior React Developer', description: '' },
      { id: 'experience', label: 'Experience Level', type: 'text', placeholder: 'e.g., 5+ Years, Remote', description: '' },
      { id: 'responsibilities', label: 'Responsibilities', type: 'textarea', placeholder: 'Maintain component design system, refactor legacy code, work closely with design lead.', description: '' },
      { id: 'requirements', label: 'Requirements / Tech Stack', type: 'text', placeholder: 'e.g., TypeScript, Next.js, Tailwind CSS, Jest tests', description: '' },
      { id: 'culture', label: 'Company Culture', type: 'text', placeholder: 'e.g., High autonomy, async-first communication, no useless meetings.', description: '' }
    ]
  },
  {
    id: 'spec-65',
    name: 'Interview Question Architect',
    category: 'Operations',
    number: '#65',
    icon: '❓',
    description: 'Generates structured behavioral and situational questions for interviewers.',
    promptTemplate: `You are a recruitment specialist. Create an interview question guide for:
Target Candidate Role: {{jobRole}}
Key Skills to Validate: {{skills}}

Generate:
- 3 behavioral questions (STAR format verification).
- 3 situational/scenario questions.
- A rubric/rating guide explaining what a "Good" vs "Poor" answer looks like for each.`,
    inputs: [
      { id: 'jobRole', label: 'Hiring Role', type: 'text', placeholder: 'e.g., Customer Support Lead', description: '' },
      { id: 'skills', label: 'Key Skills to Verify', type: 'text', placeholder: 'e.g., Conflict resolution, managing support metrics, API basic troubleshooting', description: '' }
    ]
  },
  {
    id: 'spec-66',
    name: 'Contractor Agreement Brief',
    category: 'Operations',
    number: '#66',
    icon: '📄',
    description: 'Outlines scope of work, milestones, payment schedules, and clauses.',
    promptTemplate: `You are an operations attorney. Draft a Scope of Work (SOW) contractor agreement outline:
Contractor Name: {{contractorName}}
Services Offered: {{services}}
Milestones & Payments: {{milestones}}
Ownership & Clauses: {{clauses}}

Write a structured business agreement brief containing clear scope definitions, timelines, payment schedules, and basic confidentiality/IP transfer boilerplate terms.`,
    inputs: [
      { id: 'contractorName', label: 'Contractor Name / Business', type: 'text', placeholder: 'e.g., Studio-X design consultancy', description: '' },
      { id: 'services', label: 'Services Scope', type: 'textarea', placeholder: 'Redesigning agency brand guidelines, generating logo files, branding manual.', description: '' },
      { id: 'milestones', label: 'Milestones & Payments', type: 'text', placeholder: 'e.g., $2,000 upfront, $3,000 upon delivery of assets.', description: '' },
      { id: 'clauses', label: 'Special Clauses', type: 'text', placeholder: 'e.g., 100% intellectual property transfer, NDA required, no competing projects for 30 days', description: '' }
    ]
  },
  {
    id: 'spec-67',
    name: 'Daily Standup Workflow',
    category: 'Operations',
    number: '#67',
    icon: '🌅',
    description: 'Establishes structured templates for daily team project updates.',
    promptTemplate: `Create a structured daily stand-up reporting template and Slack automation guidelines for a team:
Team Role/Focus: {{teamFocus}}
Current Bottlenecks: {{bottlenecks}}

Include simple, fast templates for members to post their status (Yesterday, Today, Blockers) and instructions for the manager on how to audit updates.`,
    inputs: [
      { id: 'teamFocus', label: 'Team Focus', type: 'text', placeholder: 'e.g., Remote marketing and ad buying team', description: '' },
      { id: 'bottlenecks', label: 'Known Bottlenecks', type: 'text', placeholder: 'e.g., Waiting on client asset approvals, Facebook ad account reviews', description: '' }
    ]
  },
  {
    id: 'spec-68',
    name: 'Vendor Pitch Advisor',
    category: 'Operations',
    number: '#68',
    icon: '🤝',
    description: 'Drafts emails and scripts to negotiate discounts with SaaS/software vendors.',
    promptTemplate: `Write a negotiation email to a SaaS vendor requesting custom pricing or discounts:
Software Vendor: {{vendor}}
Our Account Details: {{accountDetails}}
Reason for Discount: {{reason}}

Provide 2 email templates:
- Template A: The "Competitor comparison" negotiation request.
- Template B: The "Annual prepayment discount" negotiation request.`,
    inputs: [
      { id: 'vendor', label: 'Software / Vendor Name', type: 'text', placeholder: 'e.g., HubSpot Enterprise', description: '' },
      { id: 'accountDetails', label: 'Our Current Setup', type: 'text', placeholder: 'e.g., 25 seats, spending $1,200/mo', description: '' },
      { id: 'reason', label: 'Negotiation Angle', type: 'text', placeholder: 'e.g., Competitor CRM is offering equivalent seats for $800/mo', description: '' }
    ]
  },
  {
    id: 'spec-69',
    name: 'Business Continuity Planner',
    category: 'Operations',
    number: '#69',
    icon: '🛡️',
    description: 'Outlines business actions in cases of key staff absences or data loss.',
    promptTemplate: `Develop a Business Continuity Plan (BCP) outline for a key failure event:
Critical System/Staff: {{criticalAsset}}
Failure Scenario: {{scenario}}
Backup Resources: {{backups}}

Include immediate response checklist, secondary delegate roles, client communication templates, and system restore guidelines.`,
    inputs: [
      { id: 'criticalAsset', label: 'Critical Asset/Person', type: 'text', placeholder: 'e.g., Lead developer / hosting server access keys', description: '' },
      { id: 'scenario', label: 'Failure Scenario', type: 'textarea', placeholder: 'Lead developer is hospitalized or server hosting account is suspended.', description: '' },
      { id: 'backups', label: 'Backup Assets / Backups', type: 'text', placeholder: 'e.g., Backup keys in 1Password vault, junior dev has secondary server write access', description: '' }
    ]
  },
  {
    id: 'spec-70',
    name: 'Software Stack Auditor',
    category: 'Operations',
    number: '#70',
    icon: '💻',
    description: 'Analyzes software integrations to spot duplication and save subscription costs.',
    promptTemplate: `Analyze this list of subscription softwares, identify redundancies, and propose a consolidated stack to save money:
Softwares & Costs: {{softwaresList}}
Business Workflows: {{workflows}}

Deliver a consolidation audit detailing:
- Estimated annual savings.
- Tool redundancies (e.g. using both Typeform and Jotform).
- Migration/Integration warnings.`,
    inputs: [
      { id: 'softwaresList', label: 'Software List & Costs', type: 'textarea', placeholder: 'HubSpot: $300/mo, ActiveCampaign: $150/mo, Zapier: $49/mo, Calendly: $15/mo, Zoom: $20/mo', description: '' },
      { id: 'workflows', label: 'Core Workflows', type: 'text', placeholder: 'e.g., Client scheduling, marketing newsletters, CRM pipelines', description: '' }
    ]
  },

  // CATEGORY 8: PERSONAL BRAND
  {
    id: 'spec-71',
    name: 'Personal Bio Architect',
    category: 'Personal Brand',
    number: '#71',
    icon: '🎯',
    description: 'Designs professional bios for speaking gigs, book backcovers, or sites.',
    promptTemplate: `Create professional personal bio variations:
Target Professional: {{bioSubject}}
Accomplishments/Awards: {{achievements}}
Mission / Focus: {{mission}}

Deliver:
1. 1-sentence bio (ideal for footers, social subtitles).
2. Short bio (100 words, ideal for podcast introductions/speaking cards).
3. Long bio (300 words, narrative-driven, ideal for "About Me" pages).`,
    inputs: [
      { id: 'bioSubject', label: 'Name & Profession', type: 'text', placeholder: 'e.g., Sarah Jenkins, AI consultant', description: '' },
      { id: 'achievements', label: 'Key Milestones', type: 'textarea', placeholder: 'e.g., Scaled 2 SaaS projects, spoke at TEDx 2024, published AI guidebook', description: '' },
      { id: 'mission', label: 'Mission / Values', type: 'text', placeholder: 'e.g., Helping local service companies implement automation so they save time.', description: '' }
    ]
  },
  {
    id: 'spec-72',
    name: 'Podcast Pitch Writer',
    category: 'Personal Brand',
    number: '#72',
    icon: '🎙️',
    description: 'Writes email pitches to show producers outlining podcast topics.',
    promptTemplate: `Write a compelling email pitch to a podcast host/producer requesting to be a guest:
Podcast Name: {{podcastName}}
Host Name: {{hostName}}
Your Expertise: {{expertise}}
Suggested Episode Angles: {{angles}}

Ensure the pitch is host-focused (shows you listen to their show), provides immediate value to their audience, and has a low-friction reply hook.`,
    inputs: [
      { id: 'podcastName', label: 'Podcast Name', type: 'text', placeholder: 'e.g., The Bootstrapped CEO', description: '' },
      { id: 'hostName', label: 'Host Name', type: 'text', placeholder: 'e.g., Dave Ramsey', description: '' },
      { id: 'expertise', label: 'Your Professional Angle', type: 'text', placeholder: 'e.g., How B2B companies automate client management with zero budget', description: '' },
      { id: 'angles', label: '3 Episode Topics', type: 'textarea', placeholder: '1. Why Zapier is costing you $10k/yr too much, 2. The 3 scripts every agency needs to run locally, 3. Case study: $0 to $30k MRR with simple automation.', description: '' }
    ]
  },
  {
    id: 'spec-73',
    name: 'Press Release Storyteller',
    category: 'Personal Brand',
    number: '#73',
    icon: '📰',
    description: 'Drafts standard press releases for distribution services.',
    promptTemplate: `Write a professional Press Release in standard AP format:
Subject Company/Person: {{subject}}
The Announcement: {{announcement}}
Quotes to Include: {{quotes}}
Date & Location: {{dateLocation}}

Include: Headline, Dateline, Opening Paragraph, Supporting Paragraphs, Boilerplate summary, and Media Contact details.`,
    inputs: [
      { id: 'subject', label: 'Company / Person', type: 'text', placeholder: 'e.g., Claude Machine Software Inc.', description: '' },
      { id: 'announcement', label: 'The News / Launch', type: 'textarea', placeholder: 'e.g., Launching a local-first, privacy-respecting AI specialist hub that doesn\'t require subscription fees.', description: '' },
      { id: 'quotes', label: 'Quotes', type: 'textarea', placeholder: 'e.g., "The industry has over-complicated AI dashboards. We wanted a simple terminal that runs local scripts for businesses." - CEO Sarah Jenkins', description: '' },
      { id: 'dateLocation', label: 'Date / Location', type: 'text', placeholder: 'e.g., July 1, 2026 - San Francisco, CA', description: '' }
    ]
  },
  {
    id: 'spec-74',
    name: 'Book Outline Architect',
    category: 'Personal Brand',
    number: '#74',
    icon: '📚',
    description: 'Turns a core theme or specialty into a structured 10-chapter book outline.',
    promptTemplate: `You are an acquisitions editor. Design a structured 10-chapter Book Outline for:
Book Topic: {{bookTopic}}
Target Reader: {{reader}}
Core Philosophy/Message: {{philosophy}}

Provide:
- A compelling title and subtitle suggestion (3 variations).
- Introduction synopsis.
- Chapter-by-chapter outline (Chapters 1 to 10) with chapter title, reader benefit, key lessons, and a story outline placeholder for each.`,
    inputs: [
      { id: 'bookTopic', label: 'Book Topic / Idea', type: 'text', placeholder: 'e.g., The Zero-Code Automation Playbook for Agencies', description: '' },
      { id: 'reader', label: 'Target Reader', type: 'text', placeholder: 'e.g., Boutique creative agency owners and project leads', description: '' },
      { id: 'philosophy', label: 'Core Philosophy', type: 'text', placeholder: 'e.g., Stop paying massive software premiums; build simple scripts that run on your local machine.', description: '' }
    ]
  },
  {
    id: 'spec-75',
    name: 'Media Kit Content Builder',
    category: 'Personal Brand',
    number: '#75',
    icon: '📊',
    description: 'Outlines statistics, topics, and sponsorships options for media kits.',
    promptTemplate: `Create copy and layout structure for a Personal Brand Media Kit:
Name/Creator Brand: {{creatorName}}
Key Audience Statistics: {{stats}}
Primary Content Topics: {{topics}}
Sponsorship Tiers/Offerings: {{tiers}}

Format the output for copy pasting into Canva or a website design tool.`,
    inputs: [
      { id: 'creatorName', label: 'Creator Brand Name', type: 'text', placeholder: 'e.g., The Tech Minimalist (Blog & Podcast)', description: '' },
      { id: 'stats', label: 'Audience Metrics', type: 'text', placeholder: 'e.g., 25k monthly readers, 4.8% CTR, 65% US audience, 85% Developers', description: '' },
      { id: 'topics', label: 'Core Topics Covered', type: 'text', placeholder: 'e.g., Async work, dev environments, privacy scripts, simple styling', description: '' },
      { id: 'tiers', label: 'Sponsorship Inclusions & Prices', type: 'textarea', placeholder: 'e.g., Newsletter text link: $200, Custom blog post: $600, Podcast episode sponsor: $400', description: '' }
    ]
  },
  {
    id: 'spec-76',
    name: 'Speaking Gig Pitch Template',
    category: 'Personal Brand',
    number: '#76',
    icon: '🎤',
    description: 'Writes email pitches to event organizers requesting speaker status.',
    promptTemplate: `Draft an email pitching yourself as a speaker for a conference or event:
Conference Name: {{eventName}}
Target Organizer Name: {{organizerName}}
Your Speaking Topics: {{topics}}
Key Credentials: {{credentials}}

Ensure the pitch details exactly what value the attendees will walk away with (not just your credentials).`,
    inputs: [
      { id: 'eventName', label: 'Event Name', type: 'text', placeholder: 'e.g., SaaS Summit 2026', description: '' },
      { id: 'organizerName', label: 'Organizer Name', type: 'text', placeholder: 'e.g., Allison Green', description: '' },
      { id: 'topics', label: 'Speaking Topics', type: 'text', placeholder: 'e.g., Bootstrap automation workflows, scaling developer teams with zero budget', description: '' },
      { id: 'credentials', label: 'Key Credentials', type: 'textarea', placeholder: 'e.g., 10 years lead architect, scaled agency to $5M, author of 2 automation ebooks.', description: '' }
    ]
  },
  {
    id: 'spec-77',
    name: 'Newsletter Intro Writer',
    category: 'Personal Brand',
    number: '#77',
    icon: '✍️',
    description: 'Writes personal story intros that connect with subscribers before the news.',
    promptTemplate: `Write a short, engaging story-style intro for a weekly newsletter:
Anecdote: {{anecdote}}
Topic Focus: {{topic}}

The intro must be written in a warm, friendly, conversational voice that builds a relationship of trust and authority with the readers.`,
    inputs: [
      { id: 'anecdote', label: 'Anecdote / Experience', type: 'textarea', placeholder: 'e.g., Spent 3 hours trying to configure an API endpoint, only to realize I had a typo in the URL parameter. Made me realize how much time we waste on trivial dev steps.', description: '' },
      { id: 'topic', label: 'Main Newsletter Topic', type: 'text', placeholder: 'e.g., Setting up error alerts in code', description: '' }
    ]
  },
  {
    id: 'spec-78',
    name: 'Personal Manifesto Designer',
    category: 'Personal Brand',
    number: '#78',
    icon: '📜',
    description: 'Writes a values-driven brand declaration to post on profiles.',
    promptTemplate: `Write a values-driven Personal Manifesto detailing:
Core Philosophy: {{philosophy}}
Target Audience: {{audience}}
Enemy/Status Quo to Fight: {{enemy}}

Write a structured, bold, inspiring manifesto (about 300 words, using short lines and parallel structures) that readers can rally behind and share.`,
    inputs: [
      { id: 'philosophy', label: 'Core Philosophy', type: 'text', placeholder: 'e.g., Software should be local, fast, client-centric, and cheap.', description: '' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Freelance developers and solo digital builders', description: '' },
      { id: 'enemy', label: 'The Status Quo', type: 'text', placeholder: 'e.g., Expensive subscription models, cloud lock-ins, bloated software stacks', description: 'What are we fighting against?' }
    ]
  },
  {
    id: 'spec-79',
    name: 'Guest Blog Pitch Planner',
    category: 'Personal Brand',
    number: '#79',
    icon: '📝',
    description: 'Writes pitch emails proposing guest posts to major site editors.',
    promptTemplate: `Write a guest blogging proposal email targeting:
Target Website/Blog: {{blogName}}
Suggested Post Titles: {{titles}}
Our Author Bio/Credentials: {{credentials}}

Make it concise, respect the editor's time, show you understand their guidelines, and offer a quick draft preview trigger.`,
    inputs: [
      { id: 'blogName', label: 'Blog / Website', type: 'text', placeholder: 'e.g., Dev.to / Medium Publication', description: '' },
      { id: 'titles', label: '3 Guest Post Title Ideas', type: 'textarea', placeholder: '1. The Death of CRM subscriptions, 2. Designing client-friendly local tools, 3. Vite configs for absolute speed.', description: '' },
      { id: 'credentials', label: 'Your Credentials', type: 'text', placeholder: 'e.g., Creator of the Claude Machine dashboard with 2,400+ users', description: '' }
    ]
  },
  {
    id: 'spec-80',
    name: 'Banner Tagline Creator',
    category: 'Personal Brand',
    number: '#80',
    icon: '🎨',
    description: 'Generates 10 short, punchy banner taglines for profiles.',
    promptTemplate: `Generate 10 short, high-impact banner taglines (under 10 words) for:
Profession/Mission: {{mission}}
Audience: {{audience}}

Include 2 variations of: Minimalist, Outcome-Focused, Question-Style, Contrarian, and Authoritative.`,
    inputs: [
      { id: 'mission', label: 'Core Mission', type: 'text', placeholder: 'e.g., Helping small consulting firms implement simple AI workflows', description: '' },
      { id: 'audience', label: 'Target Client', type: 'text', placeholder: 'e.g., Boutiques, agencies, and independent coaches', description: '' }
    ]
  },

  // CATEGORY 9: WEBSITES & INCOME
  {
    id: 'spec-81',
    name: 'Website Blueprint Architect',
    category: 'Websites & Income',
    number: '#81',
    icon: '🌐',
    description: 'Turns business ideas into structured website blueprints and page maps.',
    promptTemplate: `You are a digital strategist. Turn this business idea into a website blueprint structure:
Business Idea: {{businessIdea}}
Target Customer: {{customer}}

Deliver:
1. Recommended Domain Name suggestions (3 options).
2. Complete Sitemap / Page Structure (e.g., Homepage, Services, Pricing, Case Studies, Contact).
3. Section-by-section breakdown of the Homepage (e.g., Hero, Value Prop, Features, Social Proof, FAQ, Footer CTA).
4. Priority Order of Build (Explain what to build first to launch in 48 hours).`,
    inputs: [
      { id: 'businessIdea', label: 'Business Idea', type: 'textarea', placeholder: 'e.g., A private chef subscription service for busy families in Seattle', description: '' },
      { id: 'customer', label: 'Ideal Customer', type: 'text', placeholder: 'e.g., Double-income families with kids, household income $150k+', description: '' }
    ]
  },
  {
    id: 'spec-82',
    name: 'Landing Page Layout Designer',
    category: 'Websites & Income',
    number: '#82',
    icon: '🎨',
    description: 'Maps out copy and structural components for landing page conversions.',
    promptTemplate: `Write a section-by-section landing page layout and copywriting blueprint:
Offer Name: {{offerName}}
Target Action (e.g. download PDF, book call): {{targetAction}}

Provide the exact copy and layout directions for:
- Hero Section (Headline, Subheadline, Primary button text, Visual asset layout).
- Pain Point / Problem Section.
- Solution / Transformation Section.
- Inclusions / Feature list.
- Pricing table & Guarantee details.
- Footer Lead capture CTA.`,
    inputs: [
      { id: 'offerName', label: 'Offer Name', type: 'text', placeholder: 'e.g., Landing Page Conversion Audit', description: '' },
      { id: 'targetAction', label: 'Target Action', type: 'text', placeholder: 'e.g., Book a 15-minute Audit call ($49)', description: '' }
    ]
  },
  {
    id: 'spec-83',
    name: 'SEO Keyword Optimizer',
    category: 'Websites & Income',
    number: '#83',
    icon: '🔍',
    description: 'Finds secondary keywords, search intent, and suggests page optimizations.',
    promptTemplate: `You are an SEO Consultant. Perform a keyword optimization strategy:
Primary Keyword Target: {{primaryKeyword}}
Page Topic: {{topic}}

Provide:
1. Analysis of search intent (Transactional, Informational, Commercial).
2. 10 secondary/LSI keywords.
3. On-Page SEO Checklist (Title tags, Meta descriptions, Header rules, Alt attributes).
4. Outline of content sections targeting these keywords.`,
    inputs: [
      { id: 'primaryKeyword', label: 'Primary Keyword', type: 'text', placeholder: 'e.g., local private chef seattle', description: '' },
      { id: 'topic', label: 'Page Topic', type: 'text', placeholder: 'e.g., Weekly healthy family meal prep delivery', description: '' }
    ]
  },
  {
    id: 'spec-84',
    name: 'Lead Magnet Planner',
    category: 'Websites & Income',
    number: '#84',
    icon: '🎁',
    description: 'Brainstorms 3 lead magnet ideas (PDF, checklist, spreadsheet) for an audience.',
    promptTemplate: `Brainstorm 3 high-converting Lead Magnet concepts for:
Business Niche: {{niche}}
Target Audience: {{audience}}

For each concept, outline:
- Title / Hook.
- Delivery format (e.g., Google Sheet, 3-page PDF guide, 5-day email course).
- Outline of the contents.
- How it transitions the user into the paid offer.`,
    inputs: [
      { id: 'niche', label: 'Business Niche', type: 'text', placeholder: 'e.g., High-end Custom Woodworking', description: '' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Homeowners doing kitchen remodeling', description: '' }
    ]
  },
  {
    id: 'spec-85',
    name: 'Micro-SaaS Idea Generator',
    category: 'Websites & Income',
    number: '#85',
    icon: '💡',
    description: 'Brainstorms 3 micro-SaaS products targeting specific API wrappers or niches.',
    promptTemplate: `You are an indie hacker consultant. Brainstorm 3 profitable Micro-SaaS ideas:
Target Niche / API: {{nicheApi}}
Skills / Limitations: {{skills}}

For each idea, provide:
- Product concept name & value proposition.
- Tech stack recommendation.
- MVP features (must be buildable by 1 dev in 2 weeks).
- Marketing and distribution strategy.`,
    inputs: [
      { id: 'nicheApi', label: 'Niche / API focus', type: 'text', placeholder: 'e.g., Google Sheets API / Freelance accountants', description: '' },
      { id: 'skills', label: 'Developer Skills', type: 'text', placeholder: 'e.g., Simple React frontends, Node.js API routes', description: '' }
    ]
  },
  {
    id: 'spec-86',
    name: 'Affiliate Program Planner',
    category: 'Websites & Income',
    number: '#86',
    icon: '🔗',
    description: 'Designs commission structures, promotional materials, and rules.',
    promptTemplate: `Design a comprehensive Affiliate/Partner Program:
Product/Service: {{product}}
Price point: {{price}}
Target Partner Persona: {{partnerPersona}}

Provide:
- Commission structures (recurring vs flat rate).
- Affiliate rules & restrictions.
- Swipe materials (email templates, social banners copy).
- Onboarding protocol for new partners.`,
    inputs: [
      { id: 'product', label: 'Product Name', type: 'text', placeholder: 'e.g., ScaleForce CRM dashboard', description: '' },
      { id: 'price', label: 'Product Price', type: 'text', placeholder: 'e.g., $99/month recurring', description: '' },
      { id: 'partnerPersona', label: 'Target Partner', type: 'text', placeholder: 'e.g., Business consultants and agency coaches', description: '' }
    ]
  },
  {
    id: 'spec-87',
    name: 'Pricing Table Copywriter',
    category: 'Websites & Income',
    number: '#87',
    icon: '💲',
    description: 'Writes compelling feature names and pricing plan descriptors.',
    promptTemplate: `You are a conversion rate optimizer. Write copy for a 3-tier pricing table:
Service/Product: {{service}}
Tier Names: {{tierNames}}
Core Features: {{features}}

For each of the 3 tiers, write:
- A benefit-driven subtitle.
- Standardized, high-converting feature descriptions.
- Recommended visual highlight badges.`,
    inputs: [
      { id: 'service', label: 'Product / Service', type: 'text', placeholder: 'e.g., Productized Website Maintenance', description: '' },
      { id: 'tierNames', label: 'Tier Names (3)', type: 'text', placeholder: 'e.g., Core Support, Growth Pro, Enterprise Scale', description: '' },
      { id: 'features', label: 'Key Features List', type: 'textarea', placeholder: 'Plugin updates, daily backups, 2 hours content edits, custom coding support, Slack channel access.', description: '' }
    ]
  },
  {
    id: 'spec-88',
    name: 'Course Outline Builder',
    category: 'Websites & Income',
    number: '#88',
    icon: '🎓',
    description: 'Designs educational curriculum with modules, lessons, and assignments.',
    promptTemplate: `Design a complete 4-module educational Course Outline:
Course Topic: {{topic}}
Target Student: {{student}}
Key Learning Outcome: {{outcome}}

Provide:
- Course name & subtitle ideas.
- Module-by-module breakdown (Modules 1-4).
- For each module, list 3 lesson topics and a hands-on homework assignment.`,
    inputs: [
      { id: 'topic', label: 'Course Topic', type: 'text', placeholder: 'e.g., Building Local-First React SPAs', description: '' },
      { id: 'student', label: 'Target Student', type: 'text', placeholder: 'e.g., Junior frontend coders with basic JS skills', description: '' },
      { id: 'outcome', label: 'Core Outcome', type: 'text', placeholder: 'e.g., Build and deploy a complete glassmorphic utility app without backend requirements.', description: '' }
    ]
  },
  {
    id: 'spec-89',
    name: 'Call to Action Optimizer',
    category: 'Websites & Income',
    number: '#89',
    icon: '🎯',
    description: 'Generates 15 alternative button and banner copy texts to boost conversions.',
    promptTemplate: `Generate 15 high-converting Call to Action (CTA) button copy ideas:
Offer: {{offer}}
Action Trigger: {{action}}

Provide variations in:
- High Urgency (e.g. Get Started Today)
- Benefit-Oriented (e.g. Save 2 Hours Now)
- Low Commitment (e.g. See It In Action)
- Curiosity/Story-based`,
    inputs: [
      { id: 'offer', label: 'What is the offer?', type: 'text', placeholder: 'e.g., Free 15-minute SEO audit template', description: '' },
      { id: 'action', label: 'What do they do?', type: 'text', placeholder: 'e.g., Click a button to download the spreadsheet', description: '' }
    ]
  },
  {
    id: 'spec-90',
    name: 'Link-in-Bio Link Planner',
    category: 'Websites & Income',
    number: '#90',
    icon: '🔗',
    description: 'Designs link strategies for social bios, matching traffic to products.',
    promptTemplate: `Create a mobile-first Link-in-Bio content strategy:
Creator Profile/Niche: {{profileNiche}}
Paid Offers: {{paidOffers}}
Lead Magnets: {{leadMagnets}}

Provide:
- 5 categorized link button ideas with taglines.
- Mobile layout design notes.
- Suggested analytics goals.`,
    inputs: [
      { id: 'profileNiche', label: 'Niche / Creator Profile', type: 'text', placeholder: 'e.g., Async workflow coach for remote directors', description: '' },
      { id: 'paidOffers', label: 'Paid Offers', type: 'text', placeholder: 'e.g., 1-on-1 workflow sprint ($899), Workflow templates kit ($49)', description: '' },
      { id: 'leadMagnets', label: 'Free Lead Magnets', type: 'text', placeholder: 'e.g., Free Notion automation templates guide', description: '' }
    ]
  },

  // CATEGORY 10: ADS & PAID TRAFFIC
  {
    id: 'spec-91',
    name: 'Facebook Ad Copywriter',
    category: 'Ads & Paid Traffic',
    number: '#91',
    icon: '📈',
    description: 'Writes primary copy, headlines, and descriptions for Facebook & Instagram ads.',
    promptTemplate: `You are a direct response ad copywriter. Write a Facebook Ad campaign package for:
Product Name: {{productName}}
Offer Details: {{offerDetails}}
Target Audience: {{audience}}

Deliver 3 variations of the ad:
- Angle 1: The Story-Driven Ad (Focuses on a transformation or struggle).
- Angle 2: The Direct Benefit Ad (Focuses on features, benefits, and price).
- Angle 3: The Callout Ad (Directly speaks to the audience's role/pain points).
For each, provide: Primary text, Headline (under 40 chars), and Description.`,
    inputs: [
      { id: 'productName', label: 'Product / Service Name', type: 'text', placeholder: 'e.g., MealPrep Fit subscription', description: '' },
      { id: 'offerDetails', label: 'Offer Details / Deal', type: 'textarea', placeholder: 'e.g., Healthy, chef-cooked meals delivered weekly starting at $9/meal. Get 1st week 20% off.', description: '' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Busy fitness-conscious professionals in cities', description: '' }
    ]
  },
  {
    id: 'spec-92',
    name: 'Google Search Ad Builder',
    category: 'Ads & Paid Traffic',
    number: '#92',
    icon: '🔍',
    description: 'Generates structured Google Search Ads with headlines, descriptions, and extensions.',
    promptTemplate: `You are a search engine marketing (SEM) specialist. Build Google Search Ads for:
Company/Service: {{companyName}}
Target Keywords: {{keywords}}
Landing Page Angle: {{landingPage}}

Generate:
- 10 Headline variations (under 30 characters each).
- 4 Description variations (under 90 characters each).
- 3 Sitelink Extension copy ideas with descriptions.`,
    inputs: [
      { id: 'companyName', label: 'Company / Service', type: 'text', placeholder: 'e.g., Portland HVAC Repairs', description: '' },
      { id: 'keywords', label: 'Target Keywords', type: 'text', placeholder: 'e.g., emergency hvac portland, furnace repair portland, local ac repair', description: '' },
      { id: 'landingPage', label: 'Landing Page Focus', type: 'text', placeholder: 'e.g., Same-day HVAC repair scheduling, $50 off first service coupon.', description: '' }
    ]
  },
  {
    id: 'spec-93',
    name: 'Video Ad Scriptwriter',
    category: 'Ads & Paid Traffic',
    number: '#93',
    icon: '🎥',
    description: 'Writes video scripts for UGC ads, including hooks, body angles, and CTA visual notes.',
    promptTemplate: `Write a UGC (User Generated Content) video ad script for TikTok/Meta:
Product Name: {{productName}}
Core Benefit: {{benefit}}
Script Angle (e.g. problem solving, unboxing): {{angle}}

Include:
- 3 alternative 3-second hook script/visual suggestions.
- The main body script (conversational, energetic).
- Audio and Visual split directions.
- Clear CTA closing.`,
    inputs: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., HydroBottle Smart Flask', description: '' },
      { id: 'benefit', label: 'Core Benefit', type: 'text', placeholder: 'e.g., Automatically purifies tap water in 60s and tracks daily hydration', description: '' },
      { id: 'angle', label: 'UGC Script Angle', type: 'select', placeholder: 'Select angle', description: '', options: ['"Things TikTok made me buy" unboxing', 'The dramatic problem/pain point solver', 'The visual features walkthrough', 'The "Stop doing this" contrarian hook'], defaultValue: 'The dramatic problem/pain point solver' }
    ]
  },
  {
    id: 'spec-94',
    name: 'Retargeting Ad Angle Builder',
    category: 'Ads & Paid Traffic',
    number: '#94',
    icon: '🔄',
    description: 'Designs ad copy specifically targeting warm site visitors who didn\'t buy.',
    promptTemplate: `You are a retargeting copywriter. Write a Facebook/Instagram ad sequence targeting warm site visitors who viewed the checkout page but did not buy:
Product Name: {{productName}}
Price / Offer Details: {{priceDetails}}
Common Hesitations: {{hesitations}}

Generate 3 ad angles:
1. The Trust / Social Proof Angle (Testimonials and safety).
2. The Risk-Reversal Angle (Money-back guarantees and trials).
3. The Limited Offer Angle (Urgency/special bonus code).`,
    inputs: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., Digital Ad Academy annual tier', description: '' },
      { id: 'priceDetails', label: 'Offer Price', type: 'text', placeholder: 'e.g., $497 annual subscription', description: '' },
      { id: 'hesitations', label: 'Buyer Doubts', type: 'textarea', placeholder: 'Is it worth the money? What if I am a beginner? Can I get a refund?', description: '' }
    ]
  },
  {
    id: 'spec-95',
    name: 'Ad Creative Brief Creator',
    category: 'Ads & Paid Traffic',
    number: '#95',
    icon: '🎨',
    description: 'Outlines visual specs, text directions, and sizing for ad designers.',
    promptTemplate: `Write a detailed Ad Creative Brief for a designer/editor:
Product: {{productName}}
Visual Concept: {{concept}}
Dimensions/Formats Needed: {{formats}}

Deliver specs for: Graphic layout, Typography styles, Main ad copy placement, Background image parameters, and call to action graphic rules.`,
    inputs: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., SafeGuard Home Security Camera', description: '' },
      { id: 'concept', label: 'Visual Concept', type: 'textarea', placeholder: 'A split screen showing a phone screen alert on the left, and a sleek modern camera sitting on a living room shelf on the right.', description: '' },
      { id: 'formats', label: 'Dimensions/Formats', type: 'text', placeholder: 'e.g., 1:1 Square (Instagram) & 9:16 Vertical (Stories)', description: '' }
    ]
  },
  {
    id: 'spec-96',
    name: 'A/B Split Test Planner',
    category: 'Ads & Paid Traffic',
    number: '#96',
    icon: '🧪',
    description: 'Generates ad split test parameters, headlines, and variable sets.',
    promptTemplate: `Design a structured A/B Split Test Plan for an advertising campaign:
Campaign Goal: {{campaignGoal}}
Current Control Ad: {{controlAd}}

Provide:
- Testing variables (Headline vs Visual vs Angle).
- 3 distinct Headline variations for testing.
- Target audience split variables.
- Suggested metric triggers to declare a winner.`,
    inputs: [
      { id: 'campaignGoal', label: 'Campaign Goal', type: 'text', placeholder: 'e.g., Drive demo signups for B2B scheduling software', description: '' },
      { id: 'controlAd', label: 'Current Ad Angle (Control)', type: 'textarea', placeholder: 'e.g., "Tired of scheduling hassles? Try our automated CRM schedules today. Easy setup, click now."', description: '' }
    ]
  },
  {
    id: 'spec-97',
    name: 'Lead Gen Form Ad Copywriter',
    category: 'Ads & Paid Traffic',
    number: '#97',
    icon: '📄',
    description: 'Writes copy for native social lead generation form screens.',
    promptTemplate: `Write the copy for a Facebook/LinkedIn Lead Generation Form:
Lead Magnet/Offer: {{offerName}}
Form Questions Required: {{questions}}

Include:
- Form intro screen Headline & Paragraph (Sell the value of the download).
- Custom privacy policy text reference.
- Custom completion/Success screen copy (Teasing what is coming next in their inbox).`,
    inputs: [
      { id: 'offerName', label: 'Lead Magnet Offer', type: 'text', placeholder: 'e.g., The 2026 Home Valuation PDF Report', description: '' },
      { id: 'questions', label: 'Questions Asked', type: 'text', placeholder: 'e.g., Name, Email, Phone, Home Address, Plan to sell (select)', description: '' }
    ]
  },
  {
    id: 'spec-98',
    name: 'Local Business Offer Planner',
    category: 'Ads & Paid Traffic',
    number: '#98',
    icon: '📍',
    description: 'Designs ad offers and copy targeting localized radius coordinates.',
    promptTemplate: `Design a local ad campaign offer and ad copy:
Local Business Type: {{businessType}}
Core Service: {{service}}
Special Offer: {{offer}}

Provide localized ad copy targeting community neighborhoods, explaining special terms, booking actions, and maps indicators.`,
    inputs: [
      { id: 'businessType', label: 'Local Business Type', type: 'text', placeholder: 'e.g., Family Dental Practice', description: '' },
      { id: 'service', label: 'Core Service', type: 'text', placeholder: 'e.g., Dental cleanings and teeth whitening', description: '' },
      { id: 'offer', label: 'Special Local Offer', type: 'text', placeholder: 'e.g., New patient special: $99 cleaning, exam, and X-ray (Value $299)', description: '' }
    ]
  },
  {
    id: 'spec-99',
    name: 'Influencer Ad Brief Creator',
    category: 'Ads & Paid Traffic',
    number: '#99',
    icon: '📣',
    description: 'Drafts instructions and talking points for hired creator posts.',
    promptTemplate: `Write an Influencer Ad Brief detailing:
Product Name: {{productName}}
Key Messaging points: {{messaging}}
Allowed Dos & Don'ts: {{dosAndDonts}}

Provide talking points, camera angles guidelines, sample script script lines, and review protocols.`,
    inputs: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g., GlowSkin organic facial serum', description: '' },
      { id: 'messaging', label: 'Key Message points', type: 'text', placeholder: 'e.g., Vegan, organic ingredients, see results in 7 days, apply before bed', description: '' },
      { id: 'dosAndDonts', label: 'Dos and Don\'ts', type: 'textarea', placeholder: 'Do: Show the bottle close up, show it absorbing on skin. Don\'t: Make medical claims, don\'t reference competitor brands.', description: '' }
    ]
  },
  {
    id: 'spec-100',
    name: 'Ad Budget Optimizer',
    category: 'Ads & Paid Traffic',
    number: '#100',
    icon: '💵',
    description: 'Provides advice on daily budgets, bidding strategies, and cost-cap setups.',
    promptTemplate: `You are a paid media buyer. Optimize this ad account allocation:
Daily Budget: {{dailyBudget}}
Channels: {{channels}}
Target CPA (Cost Per Acquisition): {{targetCpa}}

Provide:
- Budget distribution suggestions across Top-of-Funnel (Cold), Middle, and Retargeting.
- Suggested bidding strategy (e.g. Highest Volume vs Cost Cap).
- Action checklist for handling budget scale triggers.`,
    inputs: [
      { id: 'dailyBudget', label: 'Daily Budget', type: 'text', placeholder: 'e.g., $100/day', description: '' },
      { id: 'channels', label: 'Ad Channels', type: 'text', placeholder: 'e.g., Meta Ads (Facebook & Instagram)', description: '' },
      { id: 'targetCpa', label: 'Target CPA', type: 'text', placeholder: 'e.g., $25 per sale', description: '' }
    ]
  },
  {
    id: 'spec-v1',
    name: 'Content Coach (Voxstar)',
    category: 'Voxstar Connect',
    number: '#V1',
    icon: '🧠',
    description: 'Finds high-engagement angles and hooks from your raw ideas or screenshots.',
    promptTemplate: `You are the Content Coach for Voxstar, an elite content strategist who has generated over 30 million views.
Your task is to analyze the user's raw concepts, screenshots, or analytics, and suggest 3 high-impact content angles.

Creator: Gene da Rocha
Platform Focus: Voxstar Connect Suite

Raw Input / Screenshots Context:
{{rawInput}}

Target Audience:
{{audience}}

Business Offer:
{{offer}}

Please output:
1. A summary of the core insight/truth from the raw material.
2. 3 different angles/themes to explore (e.g. The Contrarian Take, The Personal Story, The Hard Data).
3. A recommended choice with a suggested outline hook.`,
    inputs: [
      { id: 'rawInput', label: 'Raw Notes / Screenshot Data', type: 'textarea', placeholder: 'e.g., Voxstar analytics screenshot showing 12M impressions in 28 days on Facebook, I thought Facebook was dead', description: 'Describe your screenshots or raw notes.' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., AI developers, content creators, business owners', description: 'Who is the ideal reader?', defaultValue: 'AI Automation Creators' },
      { id: 'offer', label: 'Your Offer or Business Focus', type: 'text', placeholder: 'e.g., Voxstar Connect subscription, workflow templates', description: 'What are you promoting?', defaultValue: 'Voxstar Workflow Automation' }
    ]
  },
  {
    id: 'spec-v2',
    name: 'Brand Brief (Voxstar)',
    category: 'Voxstar Connect',
    number: '#V2',
    icon: '🎯',
    description: 'Captures and codifies your business profile, target offers, and brand voice.',
    promptTemplate: `You are the Brand Voice Architect for Voxstar. Your task is to compile a definitive Brand Brief for Gene da Rocha that Claude can reference for all future posts.

Business Name:
{{businessName}}

Core Niche & Offers:
{{nicheOffers}}

Brand Voice Style:
{{voiceStyle}}

Negative Constraints (What to avoid):
{{negativeConstraints}}

Compile this into a highly structured markdown Brand Brief. Future specialists will use this brief to align all content with your voice.`,
    inputs: [
      { id: 'businessName', label: 'Business / Creator Name', type: 'text', placeholder: 'e.g., Gene da Rocha / Voxstar', description: 'Name of the business or creator.', defaultValue: 'Gene da Rocha / Voxstar' },
      { id: 'nicheOffers', label: 'Core Niche & Offers', type: 'textarea', placeholder: 'e.g., AI automation, workflow scripts, SaaS templates', description: 'What services or products do you offer?', defaultValue: 'Voxstar custom MCP connectors and social media automation pipelines.' },
      { id: 'voiceStyle', label: 'Brand Voice Style', type: 'select', placeholder: 'Select voice style', description: 'Select the voice you want to write in.', options: ['Bold, conversational, no emojis, no em dashes', 'Casual, friendly, emojis welcome', 'Professional, authoritative, data-driven'], defaultValue: 'Bold, conversational, no emojis, no em dashes' },
      { id: 'negativeConstraints', label: 'Negative Constraints', type: 'textarea', placeholder: 'e.g., no em dashes, all numbers as digits, no filler words', description: 'Things the AI should never use.', defaultValue: 'no em dashes, all numbers as digits, no filler words, no emojis' }
    ]
  },
  {
    id: 'spec-v3',
    name: 'Post Writer (Voxstar)',
    category: 'Voxstar Connect',
    number: '#V3',
    icon: '✍️',
    description: 'Drafts high-converting scripts and social copy for any platform matching your voice.',
    promptTemplate: `You are the Post Writer for Voxstar. Your job is to draft a post for {{platform}} based on the chosen angle and brand brief.

Creator Name: Gene da Rocha
Platform focus: Voxstar social media ecosystem

Chosen Angle / Concept:
{{angle}}

Brand Brief Voice Context:
{{brandBrief}}

Platform Constraints:
- LinkedIn: Hook first, short paragraphs, strong takeaway, conversational.
- Twitter: Under 280 characters, highly punchy, zero filler.
- Instagram Story: Under 2 lines, high-impact CTA, vertical safe zone format.
- Cross-Post (All): Deliver the post customized for Twitter, LinkedIn, and Facebook.

Draft the post(s). Do not include filler words. Use digits for numbers.`,
    inputs: [
      { id: 'angle', label: 'Chosen Angle / Concept', type: 'textarea', placeholder: 'e.g., I was embarrassingly wrong about Facebook ads. Here is what 12M views taught me.', description: 'The topic or angle you want to write about.' },
      { id: 'brandBrief', label: 'Brand Brief / Voice Rules', type: 'textarea', placeholder: 'Paste your Brand Brief here (e.g., Bold, conversational, no em dashes)', description: 'Voice guidelines and constraints.' },
      { id: 'platform', label: 'Target Platform', type: 'select', placeholder: 'Select platform', description: 'Where will this post be published?', options: ['Twitter/X', 'LinkedIn', 'Facebook', 'Instagram Story', 'Cross-Post (Twitter + LinkedIn + Facebook)'], defaultValue: 'Cross-Post (Twitter + LinkedIn + Facebook)' }
    ]
  },
  {
    id: 'spec-v4',
    name: 'Post Grader (Voxstar)',
    category: 'Voxstar Connect',
    number: '#V4',
    icon: '📊',
    description: 'Scores your draft out of 10 for engagement and details direct rule edits.',
    promptTemplate: `You are the Post Grader for Voxstar content. Score this draft on a scale from 1.0 to 10.0 for engagement and virality.

Post Draft to Grade:
{{draft}}

Brand Brief Voice Rules:
{{voiceRules}}

Platform target:
{{platform}}

Format your output EXACTLY as follows:

### 📊 Post Grade: [Score]/10

#### 🔍 Rule Compliance Audit:
- Rule 1 (e.g., No em-dashes): [Pass/Fail] - [Reason]
- Rule 2 (e.g., Digits for numbers): [Pass/Fail] - [Reason]
- Rule 3 (e.g., No emojis): [Pass/Fail] - [Reason]

#### 💡 Top 3 Fixes to Improve Hook & Readability:
1. [Fix 1]
2. [Fix 2]
3. [Fix 3]

#### 🚀 Regraded Draft (Incorporating all fixes):
[Insert refined draft here]`,
    inputs: [
      { id: 'draft', label: 'Post Draft to Grade', type: 'textarea', placeholder: 'Paste your draft here.', description: 'The text you want graded.' },
      { id: 'voiceRules', label: 'Voice Rules / Brand Brief', type: 'textarea', placeholder: 'e.g., no em dashes, all numbers as digits, no emojis', description: 'Auditing criteria.' },
      { id: 'platform', label: 'Target Platform', type: 'text', placeholder: 'LinkedIn', description: 'Platform target.', defaultValue: 'LinkedIn' }
    ]
  },
  {
    id: 'spec-v5',
    name: 'Post Scheduler (Voxstar)',
    category: 'Voxstar Connect',
    number: '#V5',
    icon: '🚀',
    description: 'Coordinates post validation and queues the post to your channels via Voxstar.',
    promptTemplate: `You are the Post Scheduler for Voxstar Connect. You handle the final quality gate before queueing posts to Voxstar.

Final Draft:
{{finalDraft}}

Target Accounts:
{{accounts}}

Scheduling Method:
{{scheduleMethod}}

Confirm the scheduling details. Outline exactly which channels this will publish to and compile a confirmation summary block formatted for the Voxstar Connect API.`,
    inputs: [
      { id: 'finalDraft', label: 'Final Refined Draft', type: 'textarea', placeholder: 'Paste the approved copy here.', description: 'The text to publish.' },
      { id: 'accounts', label: 'Target Accounts/Channels', type: 'text', placeholder: 'e.g., LinkedIn Profile, Twitter @gene', description: 'Accounts to publish to.', defaultValue: 'LinkedIn Profile, Twitter @gene, Facebook Page' },
      { id: 'scheduleMethod', label: 'Scheduling Method', type: 'select', placeholder: 'Select scheduling method', description: 'Choose scheduling options.', options: ['Publish Now', 'Next Free Slot', 'Specific Date & Time'], defaultValue: 'Next Free Slot' }
    ]
  }
];
