import Anthropic from '@anthropic-ai/sdk';
import { type Specialist } from '../data/specialists';
import { buildSpecialistPrompt, buildRewritePrompt, checkHumanizer, tidyText } from './humanizer';

export interface ApiKeys {
  gemini?: string;
  anthropic?: string;
  openai?: string;
  grok?: string;
}

export interface ModelSettings {
  provider: 'gemini' | 'anthropic' | 'openai' | 'grok' | 'mock';
  model: string;
}

// Default model per provider when a screen lets the user switch provider for a single run.
export const DEFAULT_MODELS: Record<ModelSettings['provider'], string> = {
  anthropic: 'claude-opus-5-5',
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o',
  grok: 'grok-4',
  mock: 'Demo Simulated Model'
};

export const PROVIDER_NAMES: Record<ModelSettings['provider'], string> = {
  anthropic: 'Claude',
  gemini: 'Gemini',
  openai: 'ChatGPT',
  grok: 'Grok',
  mock: 'Demo Mode'
};

const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const XAI_BASE_URL = 'https://api.x.ai/v1';

// Generate the prompt text by replacing placeholders
export function compilePrompt(template: string, inputs: Record<string, string>): string {
  let compiled = template;
  for (const [key, value] of Object.entries(inputs)) {
    // Replace all occurrences of {{key}} or {{ key }}
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    compiled = compiled.replace(regex, value);
  }
  return compiled;
}

// Streaming function
export async function runSpecialistStream(
  specialist: Specialist,
  inputs: Record<string, string>,
  keys: ApiKeys,
  settings: ModelSettings,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: string) => void,
  voiceSamples = '',
  // raw: promptTemplate is already a finished prompt (callers that build their own, e.g. agents)
  options: { raw?: boolean } = {}
) {
  // Every specialist run goes through the humanizer: structured sections, tagged user inputs, writing rules.
  const prompt = options.raw ? specialist.promptTemplate : buildSpecialistPrompt(specialist.promptTemplate, inputs, voiceSamples);
  
  if (settings.provider === 'mock') {
    runMockStream(specialist.name, prompt, onChunk, onComplete);
    return;
  }

  const provider = settings.provider;
  const model = settings.model;
  const apiKey = keys[provider];

  if (!apiKey) {
    onError(`API Key for ${provider.toUpperCase()} is missing. Please enter it in the Settings.`);
    return;
  }

  try {
    if (provider === 'gemini') {
      await streamGemini(model, apiKey, prompt, onChunk, onComplete);
    } else if (provider === 'openai') {
      await streamOpenAI(model, apiKey, prompt, onChunk, onComplete);
    } else if (provider === 'grok') {
      await streamOpenAI(model, apiKey, prompt, onChunk, onComplete, XAI_BASE_URL);
    } else if (provider === 'anthropic') {
      await streamAnthropic(model, apiKey, prompt, onChunk, onComplete);
    }
  } catch (err: any) {
    console.error('API Error:', err);
    onError(err.message || 'An error occurred during communication with the AI provider.');
  }
}

// Gemini Streaming Fetch
async function streamGemini(
  model: string,
  apiKey: string,
  prompt: string,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void
) {
  // Use generateContent for a simple POST. Gemini streaming is easiest with standard fetch and streamGenerateContent
  // alt=sse makes Gemini send one `data: {json}` line per chunk; without it the stream is a pretty-printed
  // JSON array spread over many lines, which the line-based parser below can't read.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Gemini streamGenerateContent returns a JSON array of parts.
    // In SSE, it comes back as chunks. Let's parse the buffer.
    // The format is usually a JSON array or multiple JSON objects.
    // A robust stream parser for Gemini:
    try {
      // Split by JSON object boundaries in the stream.
      // Often, the response is chunks of text containing:
      // [
      //   { "candidates": ... },
      //   { "candidates": ... }
      // ]
      // We can clean the commas and brackets, or parse the SSE lines.
      // To be extremely simple and robust:
      // Look for the "text" fields inside candidates.
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // Strip opening/closing brackets if they appear alone
        if (trimmed === '[' || trimmed === ']' || trimmed === ',') continue;
        
        // Let's try to parse as JSON. The line might have a trailing comma
        let jsonStr = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
        if (jsonStr.endsWith(',')) {
          jsonStr = jsonStr.slice(0, -1);
        }
        
        try {
          const parsed = JSON.parse(jsonStr);
          const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textChunk) {
            onChunk(textChunk);
            fullText += textChunk;
          }
        } catch {
          // If JSON parse fails, we continue gathering buffer
        }
      }
    } catch (e) {
      // Ignore intermediate parsing errors
    }
  }

  // Parse remaining buffer
  if (buffer) {
    try {
      let jsonStr = buffer.trim();
      if (jsonStr.startsWith('data:')) jsonStr = jsonStr.slice(5).trim();
      if (jsonStr.endsWith(']')) jsonStr = jsonStr.slice(0, -1);
      if (jsonStr.startsWith(',')) jsonStr = jsonStr.slice(1);
      const parsed = JSON.parse(jsonStr);
      const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textChunk) {
        onChunk(textChunk);
        fullText += textChunk;
      }
    } catch {}
  }

  onComplete(fullText);
}

// OpenAI Streaming Fetch
async function streamOpenAI(
  model: string,
  apiKey: string,
  prompt: string,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void,
  baseUrl = OPENAI_BASE_URL
) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: true,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const cleaned = line.trim();
      if (!cleaned.startsWith('data:')) continue;
      
      const dataStr = cleaned.slice(5).trim();
      if (dataStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(dataStr);
        const chunk = parsed.choices?.[0]?.delta?.content;
        if (chunk) {
          onChunk(chunk);
          fullText += chunk;
        }
      } catch {}
    }
  }
  
  onComplete(fullText);
}

// Anthropic Streaming Fetch (Requires proxy or CORS disabled. We warn the user, but provide implementation)
// Claude via the official SDK. dangerouslyAllowBrowser is required for this app's BYOK design: the
// key lives in the user's own browser (see DECISIONS.md); there is no server to hide it behind.
const anthropicClient = (apiKey: string) => new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

// Current-generation models take an explicit effort and (except Haiku) the server-side refusal
// fallback. Older or custom model IDs get neither, since they may reject the fields.
const CLAUDE_EFFORT_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-fable-5'];
const CLAUDE_FALLBACK_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-opus-5', 'claude-fable-5-1'];

const claudeRequest = (model: string, prompt: string, maxTokens: number) => ({
  model,
  max_tokens: maxTokens,
  messages: [{ role: 'user' as const, content: prompt }],
  ...(CLAUDE_EFFORT_MODELS.includes(model) ? { output_config: { effort: 'medium' as const } } : {}),
  ...(CLAUDE_FALLBACK_MODELS.includes(model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {})
});

// Streams text and resolves with the full text; throws on refusal or a cut-off response so a partial
// answer is never reported as complete.
async function claudeStream(apiKey: string, model: string, prompt: string, maxTokens: number, onChunk?: (t: string) => void): Promise<string> {
  const stream = anthropicClient(apiKey).beta.messages.stream(claudeRequest(model, prompt, maxTokens));
  if (onChunk) stream.on('text', delta => onChunk(delta));
  const message = await stream.finalMessage();
  if (message.stop_reason === 'refusal') {
    const category = message.stop_details && 'category' in message.stop_details ? message.stop_details.category : null;
    throw new Error(`Claude declined this request${category ? ` (${category})` : ''}. Rephrase it or try another provider.`);
  }
  const text = message.content.map(block => (block.type === 'text' ? block.text : '')).join('');
  if (message.stop_reason === 'max_tokens') {
    throw new Error('Claude hit its output limit before finishing. Try a shorter request.');
  }
  return text;
}

async function streamAnthropic(
  model: string,
  apiKey: string,
  prompt: string,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void
) {
  const text = await claudeStream(apiKey, model, prompt, 64000, onChunk);
  onComplete(text);
}

function runMockStream(
  name: string,
  prompt: string,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void
) {
  const responseText = `### 🌟 Specialist Report: ${name} (Executed in DEMO Mode)

Thank you for running the **${name}** specialist. Because no live API keys are currently configured, this is a simulated high-fidelity response demonstrating how the output is streamed and formatted.

---

#### 📋 Execution Details
* **Specialist Active**: ${name}
* **System Prompt compiled successfully** (length: ${prompt.length} characters)
* **Model State**: Demo Simulated Agent

---

#### 🚀 Expert Output & Key Takeaways

1. **Strategic Intent**:
   - Every response from the **Claude Machine** is engineered for maximum utility.
   - You can configure actual API keys (Gemini, OpenAI, or Anthropic) in the **Settings** panel at the top right to start receiving real output.
   
2. **Actionable Suggestions**:
   - **Step 1**: Open Settings (gear icon in header).
   - **Step 2**: Enter your key (Gemini is recommended for browser execution due to full CORS support).
   - **Step 3**: Change provider from 'Demo Mode' to your provider and select a model.
   - **Step 4**: Run the specialist again for instant, custom results!

3. **Sample Generated Template**:
   \`\`\`typescript
   // You can copy this code block using the Copy button above
   const config = {
     name: "Claude Machine",
     version: "1.0.0",
     status: "Fully functional",
     aesthetics: "Insane Glassmorphic Dark Mode"
   };
   console.log("Welcome to your private AI Business Suite!");
   \`\`\`

---

> [!NOTE]
> The **Dynamic Specialist Generator** is also available in the sidebar. You can describe any custom job role (e.g. "Legal Brief Summarizer") and the system will automatically design a complete, tailored dashboard card for it with custom inputs!`;

  // Stream the mock text in chunks to simulate typing
  let index = 0;
  const chunkSize = 25;
  const interval = setInterval(() => {
    if (index >= responseText.length) {
      clearInterval(interval);
      onComplete(responseText);
      return;
    }
    const end = Math.min(index + chunkSize, responseText.length);
    const chunk = responseText.substring(index, end);
    onChunk(chunk);
    index = end;
  }, 30);
}

// Specialist Generator call
export async function generateNewSpecialist(
  description: string,
  keys: ApiKeys,
  settings: ModelSettings
): Promise<Specialist> {
  const generatorPrompt = `You are a meta-prompt-engineer. Create a brand new custom specialist for "Claude Machine" based on this request: "${description}".
You must respond with a JSON object matching this exact TypeScript schema:
{
  "id": "string (unique random slug like 'spec-custom-xyz')",
  "name": "string (Title Case, e.g., 'Google Ads Specialist')",
  "category": "string (Must be exactly one of: 'Copywriting & Content', 'Social Media', 'Sales & Closing', 'Email Marketing', 'Strategy & Research', 'Customer Service', 'Operations', 'Personal Brand', 'Websites & Income', 'Ads & Paid Traffic')",
  "number": "string (e.g., '#CUSTOM')",
  "icon": "string (A single emoji related to the role)",
  "description": "string (1-sentence summary of what this agent does)",
  "promptTemplate": "string (A thorough, well-structured prompt. Use double-brace template variables like {{input1}} for every value the user fills in the form. Lay it out in these sections, each starting with a markdown heading on its own line: '# Task' (what to produce, with the {{variables}}), '# Audience' (who it is for), '# Rules' (every requirement as its own '- ' list item: length, structure, tone), '# Output format' (the exact sections or shape to return). Put each long user-supplied value on its own line inside a tag named after it, e.g. <notes>{{notes}}</notes>. Write tone rules for a real human voice: plain words, contractions, specific examples, no hype words like 'elite', 'game-changing' or 'unlock'. Writing-style rules against AI clichés are added automatically at run time, so don't repeat them.)",
  "inputs": [
    {
      "id": "string (matching a double-brace variable in the promptTemplate, camelCase)",
      "label": "string (Human readable field label)",
      "type": "text" | "textarea" | "select",
      "placeholder": "string (example input value)",
      "description": "string (small instruction under the field)",
      "options": ["string"] // only if type is 'select'
    }
  ]
}

Return ONLY the raw JSON object. Do not wrap it in markdown code blocks. Do not add any text before or after the JSON. Ensure it is valid JSON.`;

  if (settings.provider === 'mock') {
    // Return a mock specialist
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `spec-custom-${Math.random().toString(36).substr(2, 9)}`,
          name: `Custom ${description.trim().substring(0, 20)} Agent`,
          category: 'Strategy & Research',
          number: '#CUSTOM',
          icon: '🔮',
          description: `Custom designed specialist for: ${description}`,
          promptTemplate: `You are an elite custom specialist. Here is your instruction:
Help the user analyze: {{topic}}
Focus Area: {{focus}}
Tone: {{tone}}`,
          inputs: [
            { id: 'topic', label: 'Analysis Topic', type: 'text', placeholder: 'e.g., Q3 marketing campaigns', description: 'What topic do you want analyzed?' },
            { id: 'focus', label: 'Focus Area', type: 'textarea', placeholder: 'e.g., conversion rates and messaging', description: 'Specific areas to concentrate on.' },
            { id: 'tone', label: 'Output Tone', type: 'select', placeholder: 'Select tone', description: 'Voice style', options: ['Analytical & Deep', 'Concise Bullet Points', 'Casual & Direct'], defaultValue: 'Analytical & Deep' }
          ],
          isCustom: true
        });
      }, 1500);
    });
  }

  const jsonResult = await generateText(generatorPrompt, keys, settings, 2000, 0.2);

  // Clean the response from potential markdown wrapper
  let cleanedJson = jsonResult.trim();
  if (cleanedJson.startsWith('```json')) {
    cleanedJson = cleanedJson.slice(7);
  } else if (cleanedJson.startsWith('```')) {
    cleanedJson = cleanedJson.slice(3);
  }
  if (cleanedJson.endsWith('```')) {
    cleanedJson = cleanedJson.slice(0, -3);
  }
  cleanedJson = cleanedJson.trim();

  try {
    const specialist: Specialist = JSON.parse(cleanedJson);
    specialist.isCustom = true;
    return specialist;
  } catch (err) {
    console.error('Failed to parse generated specialist JSON. Raw output was:', jsonResult);
    throw new Error('AI generated an invalid format. Please try again with a different description.');
  }
}

// Single-shot (non-streaming) completion against the user's configured provider.
// Throws on a missing key, the demo provider, or any non-2xx response — never returns canned text.
export async function generateText(
  prompt: string,
  keys: ApiKeys,
  settings: ModelSettings,
  maxTokens = 4000,
  temperature = 0.7,
  // json: ask the provider for strict JSON output (Gemini responseMimeType / OpenAI json_object).
  // The prompt must ask for a JSON object; Anthropic has no equivalent switch, so it relies on the prompt.
  options: { json?: boolean } = {}
): Promise<string> {
  const provider = settings.provider;
  if (provider === 'mock') {
    throw new Error('Demo Mode has no real model. Pick Claude, Gemini, ChatGPT or Grok in Settings and add a key.');
  }
  const model = settings.model;
  const apiKey = keys[provider];
  if (!apiKey) {
    throw new Error(`API Key for ${provider.toUpperCase()} is missing. Please enter it in the Settings.`);
  }

  const fail = async (label: string, response: Response) => {
    const body = await response.text().catch(() => '');
    return new Error(`${label} Error ${response.status}: ${body.slice(0, 300) || response.statusText}`);
  };

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(options.json ? { responseMimeType: 'application/json' } : {})
        }
      })
    });
    if (!response.ok) throw await fail('Gemini', response);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'openai' || provider === 'grok') {
    const response = await fetch(`${provider === 'grok' ? XAI_BASE_URL : OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        ...(options.json ? { response_format: { type: 'json_object' } } : {})
      })
    });
    if (!response.ok) throw await fail(provider === 'grok' ? 'Grok' : 'OpenAI', response);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Claude: streamed through the SDK (long outputs), no temperature (current models reject it), at least
  // 16k tokens because adaptive thinking shares the output budget.
  return claudeStream(apiKey, model, prompt, Math.max(maxTokens, 16000));
}

export interface HumanizedResult {
  text: string;
  issues: string[];
  rewriteError?: string;
}

// Humanizer post-pass for long-form output: deterministic cleanup, local check, and one automatic
// rewrite when AI tells remain. A failed rewrite keeps the original text and reports why — never hidden.
export async function humanizeLongform(
  text: string,
  keys: ApiKeys,
  settings: ModelSettings,
  voiceSamples = '',
  force = false
): Promise<HumanizedResult> {
  let finalText = tidyText(text, 'longform');
  let issues = checkHumanizer(finalText, 'longform');
  if (!issues.length && !force) return { text: finalText, issues };
  try {
    // Gemini 2.5 counts thinking tokens against the output limit, so leave plenty of room for long pieces.
    const maxTokens = settings.provider === 'anthropic' ? 8000 : 16000;
    const rewritten = tidyText(await generateText(buildRewritePrompt(finalText, issues, voiceSamples), keys, settings, maxTokens, 0.8), 'longform');
    // A rewrite that comes back far shorter was almost certainly cut off: keep the original rather than lose content.
    if (rewritten && rewritten.length < finalText.length * 0.6) {
      return { text: finalText, issues, rewriteError: 'The humanizer rewrite came back much shorter than the original (likely cut off), so the original was kept.' };
    }
    if (rewritten) {
      finalText = rewritten;
      issues = checkHumanizer(finalText, 'longform');
    }
    return { text: finalText, issues };
  } catch (err) {
    return { text: finalText, issues, rewriteError: err instanceof Error ? err.message : String(err) };
  }
}

export interface GroundedSource {
  title: string;
  url: string;
}

export interface GroundedResult {
  text: string;
  // Pages the provider's search tool actually returned — used to check the model's own citations.
  sources: GroundedSource[];
}

// Completion with live web search (Gemini: Google Search grounding; OpenAI: Responses API web search).
// Used where the model must not rely on its training data, e.g. "this week's news". Throws on any failure,
// and refuses providers without a search tool rather than silently answering from memory.
export async function generateGroundedText(prompt: string, keys: ApiKeys, settings: ModelSettings): Promise<GroundedResult> {
  const provider = settings.provider;
  if (provider === 'mock') {
    throw new Error('Demo Mode has no web search. Pick Gemini or OpenAI in Settings and add a key.');
  }
  if (provider === 'anthropic' || provider === 'grok') {
    throw new Error('Live news research is wired for Gemini or OpenAI. Switch provider in Settings for this step.');
  }
  const apiKey = keys[provider];
  if (!apiKey) throw new Error(`API Key for ${provider.toUpperCase()} is missing. Please enter it in the Settings.`);
  const model = settings.model;

  if (provider === 'gemini') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 16000 }
      })
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Gemini search Error ${response.status}: ${body.slice(0, 300) || response.statusText}`);
    }
    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = (candidate?.content?.parts || []).map((p: { text?: string }) => p.text || '').join('');
    const chunks: Array<{ web?: { uri?: string; title?: string } }> = candidate?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter(c => c.web?.uri)
      .map(c => ({ title: c.web?.title || '', url: c.web?.uri || '' }));
    if (!sources.length) {
      throw new Error('Gemini answered without running a web search, so the results could be from memory. Try again, or use a model that supports Google Search grounding (e.g. gemini-2.5-flash).');
    }
    return { text, sources };
  }

  // OpenAI Responses API. The tool was called "web_search_preview" before it went GA as "web_search".
  const callOpenAI = (toolType: string) => fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, tools: [{ type: toolType }], input: prompt })
  });
  let response = await callOpenAI('web_search');
  if (response.status === 400) response = await callOpenAI('web_search_preview');
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenAI search Error ${response.status}: ${body.slice(0, 300) || response.statusText}`);
  }
  const data = await response.json();
  let text = '';
  const sources: GroundedSource[] = [];
  for (const item of data.output || []) {
    if (item.type !== 'message') continue;
    for (const part of item.content || []) {
      if (part.type !== 'output_text') continue;
      text += part.text || '';
      for (const ann of part.annotations || []) {
        if (ann.type === 'url_citation' && ann.url) sources.push({ title: ann.title || '', url: ann.url });
      }
    }
  }
  if (!sources.length) {
    throw new Error('OpenAI answered without citing any web pages, so the results could be from memory. Try again or use a model with web search (e.g. gpt-4o).');
  }
  return { text, sources };
}

// Lists the models this key can use, straight from the provider, so the Settings dropdown never goes
// stale as providers ship new models.
export async function listModels(provider: Exclude<ModelSettings['provider'], 'mock'>, apiKey: string): Promise<string[]> {
  if (!apiKey) throw new Error('Enter the API key first.');
  if (provider === 'anthropic') {
    const ids: string[] = [];
    for await (const model of anthropicClient(apiKey).models.list()) ids.push(model.id);
    return ids;
  }
  if (provider === 'gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=200`);
    if (!res.ok) throw new Error(`Gemini Error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    return (data.models || [])
      .filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: { name: string }) => m.name.replace(/^models\//, ''));
  }
  const res = await fetch(`${provider === 'grok' ? XAI_BASE_URL : OPENAI_BASE_URL}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`${provider === 'grok' ? 'Grok' : 'OpenAI'} Error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const ids: string[] = (data.data || []).map((m: { id: string }) => m.id);
  return provider === 'openai' ? ids.filter(id => /^(gpt|o\d|chatgpt)/.test(id)) : ids;
}
