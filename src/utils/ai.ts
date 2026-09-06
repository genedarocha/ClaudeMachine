import { type Specialist } from '../data/specialists';

export interface ApiKeys {
  gemini?: string;
  anthropic?: string;
  openai?: string;
}

export interface ModelSettings {
  provider: 'gemini' | 'anthropic' | 'openai' | 'mock';
  model: string;
}

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
  onError: (error: string) => void
) {
  const prompt = compilePrompt(specialist.promptTemplate, inputs);
  
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
  
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
        let jsonStr = trimmed;
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
  onComplete: (fullText: string) => void
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
async function streamAnthropic(
  model: string,
  apiKey: string,
  prompt: string,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void
) {
  // Direct fetch call. Note: Anthropic restricts CORS, so browser calls might trigger preflight failures.
  // Using standard HTTP stream.
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Note: Anthropic client library usually uses this header but browser fetch doesn't support it directly.
      // If CORS fails, we advise users in Settings to use Gemini or OpenAI which allow browser fetches more easily.
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4000,
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText || response.statusText}. Note: Direct browser calls to Anthropic may fail due to CORS. If so, please use Gemini or OpenAI.`);
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
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          const chunk = parsed.delta.text;
          onChunk(chunk);
          fullText += chunk;
        }
      } catch {}
    }
  }
  
  onComplete(fullText);
}

// Simulated Typist for Mock Mode
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
  "promptTemplate": "string (A detailed, deeply engineered system prompt instructions. It must contain double-brace template variables like {{input1}} or {{input2}} that will be filled out by the user in the form. Write a very thorough prompt with rules, tone, structure, and formatting guidelines. Make it feel elite.)",
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

  const provider = settings.provider;
  const model = settings.model;
  const apiKey = keys[provider];

  if (!apiKey) {
    throw new Error(`API Key for ${provider.toUpperCase()} is required to design new specialists.`);
  }

  let jsonResult = '';

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: generatorPrompt }] }]
      })
    });
    if (!response.ok) throw new Error(`Gemini Error: ${response.statusText}`);
    const data = await response.json();
    jsonResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else if (provider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: generatorPrompt }],
        temperature: 0.2
      })
    });
    if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
    const data = await response.json();
    jsonResult = data.choices?.[0]?.message?.content || '';
  } else if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        messages: [{ role: 'user', content: generatorPrompt }]
      })
    });
    if (!response.ok) throw new Error(`Anthropic Error: ${response.statusText}`);
    const data = await response.json();
    jsonResult = data.content?.[0]?.text || '';
  }

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
