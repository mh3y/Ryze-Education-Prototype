
// Services/ai.ts
// Replaced Google GenAI with standard HTTP fetch to support generic OpenAI-compatible APIs 
// (e.g. DeepSeek, Moonshot/Kimi, or Local LLMs)

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface IngestionResult {
  summary: string;
  extractedText: string;
  structure: Array<{ header: string; content: string }>;
  tables: Array<{ caption: string; headers: string[]; rows: Array<{ cells: string[] }> }>;
  diagrams: Array<{ description: string; type: string }>;
  topics: string[];
  difficulty: string;
}

// Environment variables for API keys (Vite uses import.meta.env)
const DEEPSEEK_API_KEY = (import.meta as any).env?.VITE_DEEPSEEK_API_KEY || '';
const MOONSHOT_API_KEY = (import.meta as any).env?.VITE_MOONSHOT_API_KEY || '';

/**
 * Generic helper to call OpenAI-compatible endpoints
 */
async function callLLM(
  messages: Array<{ role: string; content: string }>,
  model: string = 'deepseek-chat',
  apiKey: string,
  baseUrl: string = 'https://api.deepseek.com/v1'
): Promise<string> {
  if (!apiKey) {
    console.warn("API Key missing for model:", model);
    throw new Error("Missing API Key");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("LLM Call Failed:", err);
    throw new Error(`LLM Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export const RyzeAI = {
  /**
   * Tutor Bot: Uses DeepSeek-V3 for reasoning
   */
  async chat(history: ChatMessage[], message: string): Promise<string> {
    // If no API key, return a simulation message
    if (!DEEPSEEK_API_KEY && !MOONSHOT_API_KEY) {
      return "I'm currently running in offline simulation mode. To chat with me effectively, please configure the DeepSeek or Moonshot API keys in your environment variables. For now: That's an interesting question about mathematics!";
    }

    try {
      const messages = [
        { 
          role: "system", 
          content: "You are Ryze AI, an advanced mathematics tutor using the DeepSeek-V3 engine. Your goal is to guide students to the answer using Socratic questioning. Do not simply give the answer. Diagnose their misconception and provide a hint or a counter-example. Be encouraging, concise, and precise." 
        },
        ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: "user", content: message }
      ];

      // Prefer DeepSeek for logic, fallback to Moonshot if available
      const key = DEEPSEEK_API_KEY || MOONSHOT_API_KEY;
      const url = DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : 'https://api.moonshot.cn/v1';
      const model = DEEPSEEK_API_KEY ? 'deepseek-chat' : 'moonshot-v1-8k';

      return await callLLM(messages, model, key, url);

    } catch (error) {
      console.error("Ryze AI Error:", error);
      return "I'm having trouble connecting to my neural engine right now. Please try again in a moment.";
    }
  },

  /**
   * Question Generator Pipeline
   * Uses DeepSeek to generate structured math problems
   */
  async generateQuestion(topic: string, difficulty: string): Promise<string> {
    // Simulation fallback if no keys
    if (!DEEPSEEK_API_KEY && !MOONSHOT_API_KEY) {
      return JSON.stringify({
        stem: `(Simulation) Calculate the derivative of f(x) = x² * e^x. [Topic: ${topic}, Level: ${difficulty}]`,
        solution_steps: "1. Apply product rule: d/dx(uv) = u'v + uv'\n2. u=x², v=e^x\n3. u'=2x, v'=e^x\n4. f'(x) = 2x*e^x + x²*e^x\n5. Factorise: e^x(2x + x²)",
        final_answer: "e^x(x² + 2x)",
        tags: [topic, difficulty, "Calculus"],
        sources: ["https://education.nsw.gov.au", "https://khanacademy.org"]
      });
    }

    try {
      const prompt = `
        Task: Generate a high-quality, exam-style mathematics question on the topic '${topic}' at '${difficulty}' difficulty.
        Output STRICT VALID JSON with the following structure:
        {
          "stem": "The question text",
          "solution_steps": "Step-by-step solution",
          "final_answer": "The final answer",
          "tags": ["tag1", "tag2"],
          "sources": ["List 2-3 credible URL sources for this topic concept"]
        }
        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
      `;

      const key = DEEPSEEK_API_KEY || MOONSHOT_API_KEY;
      const url = DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : 'https://api.moonshot.cn/v1';
      const model = DEEPSEEK_API_KEY ? 'deepseek-chat' : 'moonshot-v1-8k';

      const responseText = await callLLM([{ role: "user", content: prompt }], model, key, url);
      
      // Clean clean text
      const cleaned = responseText.replace(/```json\n?|```/g, '').trim();
      return cleaned;

    } catch (error) {
      console.error("Generator Error:", error);
      return JSON.stringify({ stem: "Error generating content.", final_answer: "N/A" });
    }
  },

  /**
   * Content Chunking Helper
   */
  chunkContent(data: IngestionResult): string[] {
    const CHUNK_SIZE = 1000;
    const chunks: string[] = [];

    const splitText = (text: string, context: string = ""): string[] => {
      const cleanText = text.replace(/\s+/g, ' ').trim();
      if (!cleanText) return [];
      if (cleanText.length <= CHUNK_SIZE) return [`${context}\n${cleanText}`.trim()];
      
      const parts: string[] = [];
      let start = 0;
      while (start < cleanText.length) {
        let end = start + CHUNK_SIZE;
        parts.push(`${context}\n${cleanText.slice(start, end)}`.trim());
        start = end - 100; // Overlap
      }
      return parts;
    };

    if (data.summary) chunks.push(`METADATA: SUMMARY\n${data.summary}`);
    data.structure.forEach(s => chunks.push(...splitText(s.content, `SECTION: ${s.header}`)));
    data.tables.forEach(t => chunks.push(`TABLE: ${t.caption}\nHEADERS: ${t.headers.join("|")}`));
    
    return chunks;
  },

  /**
   * Ingestion Pipeline (Simulation)
   * Real PDF parsing + OCR usually requires a backend (Python/Node) or heavy WASM libraries.
   * To ensure this runs flawlessly in the browser demo without dependency issues, we simulate
   * a successful AI analysis of a document.
   */
  async ingestDocument(fileBase64: string, mimeType: string): Promise<IngestionResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return a high-quality mock result that demonstrates the UI capabilities
    // In a real implementation, you would POST 'fileBase64' to your backend 
    // which wraps 'pdfplumber' or 'Tesseract'.
    return {
      summary: "This document covers advanced calculus concepts, specifically focusing on integration by parts and differential equations. It includes practice problems and theoretical definitions suitable for Year 12 Extension 1 Mathematics.",
      extractedText: "Chapter 4: Integration Techniques.\n\n4.1 Integration by Parts.\nRecall the product rule for differentiation...",
      structure: [
        { header: "1. Introduction to Integration", content: "Integration is the inverse process of differentiation. It is used to find areas under curves." },
        { header: "2. The Method of Integration by Parts", content: "The formula is given by: ∫u dv = uv - ∫v du. This is derived from the product rule." },
        { header: "3. Practice Problems", content: "Calculate the integral of x*e^x dx. Solution: Let u=x, dv=e^x dx..." }
      ],
      tables: [
        {
          caption: "Standard Integrals",
          headers: ["Function f(x)", "Integral F(x)"],
          rows: [
            { cells: ["x^n", "(x^(n+1))/(n+1)"] },
            { cells: ["e^x", "e^x"] },
            { cells: ["cos(x)", "sin(x)"] }
          ]
        }
      ],
      diagrams: [
        { type: "Graph", description: "A plot showing the area under the curve y=x^2 from x=0 to x=3." },
        { type: "Equation", description: "Handwritten notation of the Fundamental Theorem of Calculus." }
      ],
      topics: ["Calculus", "Integration", "Maths Ext 1"],
      difficulty: "Hard"
    };
  }
};
