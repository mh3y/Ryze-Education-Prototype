
import { GoogleGenAI, Type, Schema } from "@google/genai";

// Initialize Gemini Client
// Note: In a production environment, API calls should be proxied through a backend 
// to keep the API key secure. For this demo, we use the client-side key.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

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

export const RyzeAI = {
  /**
   * Tutor Bot: General chat interface for students
   */
  async chat(history: ChatMessage[], message: string): Promise<string> {
    if (!apiKey) return "API Key missing. Please configure GEMINI_API_KEY.";

    try {
      const model = 'gemini-2.5-flash';
      const response = await ai.models.generateContent({
        model,
        contents: [
          ...history.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "You are Ryze AI, an advanced mathematics tutor. Your goal is to guide students to the answer using Socratic questioning. Do not simply give the answer. Diagnose their misconception and provide a hint or a counter-example. Be encouraging, concise, and precise.",
          temperature: 0.7,
        }
      });

      return response.text || "I'm having trouble thinking right now.";
    } catch (error) {
      console.error("Ryze AI Error:", error);
      return "Error connecting to Ryze AI Engine.";
    }
  },

  /**
   * Question Generator Pipeline
   * Implements the 'Question Generation Pipeline' from Technical Design.
   * Uses Search Grounding to retrieve relevant curriculum context.
   */
  async generateQuestion(topic: string, difficulty: string): Promise<string> {
    if (!apiKey) return JSON.stringify({ stem: "API Key Missing", solution: "N/A" });

    try {
      const prompt = `
        Task: Search for Australian curriculum mathematics resources, exam papers, or textbook examples regarding '${topic}' at a '${difficulty}' level.
        Using the retrieved context to ensure relevance and standard, generate a new, high-quality, unique exam-style mathematics question.
        
        Output STRICT VALID JSON with the following structure:
        {
          "stem": "The question text",
          "solution_steps": "Step-by-step solution",
          "final_answer": "The final answer",
          "tags": ["tag1", "tag2"]
        }
        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }], // Enable Search Grounding
          temperature: 0.7,
        }
      });

      let text = response.text || "{}";
      // Clean potential markdown fences since responseMimeType cannot be set with tools
      text = text.replace(/```json\n?|```/g, '').trim();

      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error("JSON Parse Error", e);
        json = { stem: "Error parsing generated content. Please try again.", final_answer: "N/A", raw: text };
      }

      // Extract grounding sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map((c: any) => c.web?.uri)
        .filter((uri: string) => !!uri);

      if (sources.length > 0) {
        json.sources = sources;
      }

      return JSON.stringify(json);
    } catch (error) {
      console.error("Generator Error:", error);
      return JSON.stringify({ error: "Failed to generate content" });
    }
  },

  /**
   * Content Chunking
   * Breaks down the structured ingestion result into overlapping segments for vector embedding.
   */
  chunkContent(data: IngestionResult): string[] {
    const CHUNK_SIZE = 1000; // Characters
    const OVERLAP = 150;
    const chunks: string[] = [];

    // Helper to split text with overlap
    const splitText = (text: string, context: string = ""): string[] => {
      // Clean text
      const cleanText = text.replace(/\s+/g, ' ').trim();
      if (!cleanText) return [];

      if (cleanText.length <= CHUNK_SIZE) {
        return [`${context}\n${cleanText}`.trim()];
      }
      
      const parts: string[] = [];
      let start = 0;
      while (start < cleanText.length) {
        let end = start + CHUNK_SIZE;
        if (end < cleanText.length) {
            // Attempt to break at the last period to keep sentences intact
            const lastPeriod = cleanText.lastIndexOf('.', end);
            if (lastPeriod > start + (CHUNK_SIZE * 0.5)) {
                end = lastPeriod + 1;
            } else {
                // Fallback to space
                const lastSpace = cleanText.lastIndexOf(' ', end);
                if (lastSpace > start + (CHUNK_SIZE * 0.5)) {
                    end = lastSpace;
                }
            }
        }
        parts.push(`${context}\n${cleanText.slice(start, end)}`.trim());
        start = end - OVERLAP;
      }
      return parts;
    };

    // 1. High-level Summary Chunk
    if (data.summary) {
        chunks.push(`METADATA: DOCUMENT SUMMARY\n${data.summary}`);
    }

    // 2. Structural Chunks
    data.structure.forEach(section => {
      // Use header as context for every chunk derived from this section
      const sectionChunks = splitText(section.content, `SECTION: ${section.header}`);
      chunks.push(...sectionChunks);
    });

    // 3. Table Chunks (Preserve structure)
    data.tables.forEach(table => {
        const headerStr = table.headers.join(" | ");
        const rowsStr = table.rows.map(r => r.cells.join(" | ")).join("\n");
        chunks.push(`TABLE: ${table.caption}\nHEADERS: ${headerStr}\n${rowsStr}`);
    });

    // 4. Diagram Chunks
    data.diagrams.forEach(diag => {
        chunks.push(`DIAGRAM [${diag.type}]: ${diag.description}`);
    });

    return chunks;
  },

  /**
   * Ingestion Pipeline: Vision & OCR & Layout Analysis
   * Handles Step 2.1: PDF parsing, OCR, Vision model interpretation, Layout Extraction.
   * Enhanced for Complex Layouts (Multi-column, Embedded Tables).
   */
  async ingestDocument(fileBase64: string, mimeType: string): Promise<IngestionResult> {
    if (!apiKey) {
      console.error("[RyzeAI] API Key missing in environment variables.");
      throw new Error("System Configuration Error: Gemini API Key is missing.");
    }

    try {
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A brief summary of the document content." },
          extractedText: { type: Type.STRING, description: "The full raw text extracted from the document, maintaining logical reading order across columns." },
          structure: {
            type: Type.ARRAY,
            description: "The logical structure of the document. Handle multi-column layouts by merging associated content under the correct headers.",
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING, description: "Section header or title." },
                content: { type: Type.STRING, description: "Text content belonging to this section." }
              }
            }
          },
          tables: {
            type: Type.ARRAY,
            description: "Structured tables extracted from the document, including embedded and borderless tables.",
            items: {
              type: Type.OBJECT,
              properties: {
                caption: { type: Type.STRING, description: "Table title or description." },
                headers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of column headers."
                },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      cells: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of cell values for this row."
                      }
                    }
                  }
                }
              }
            }
          },
          diagrams: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Type of visual (e.g., Graph, Geometry, Handwritten Note, Table)." },
                description: { type: Type.STRING, description: "Detailed description of the visual element." }
              }
            }
          },
          topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of educational topics identified." },
          difficulty: { type: Type.STRING, description: "Estimated difficulty level (Easy, Medium, Hard, Extension)." }
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: fileBase64
                }
              },
              {
                text: `Analyze this document acting as an advanced parsing engine (simulating capabilities of tools like Grobid or pdfminer).
                
                1. **Layout Analysis**: Detect multi-column layouts. Ensure text is extracted in **logical reading order** (column by column), NOT strictly scan-line (line by line across columns).
                2. **Table Extraction**: Identify embedded tables, including those with invisible borders. Transcribe them faithfully into the 'tables' field.
                3. **Structure**: Break the content into logical sections.
                4. **Visuals**: Describe any diagrams.
                5. **Meta**: Assess difficulty.`
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.1 // Lower temperature for precision in layout analysis
        }
      });

      if (!response.text) {
        throw new Error("The AI model returned an empty response. This usually occurs if the document content violates safety policies or is unreadable.");
      }

      try {
        return JSON.parse(response.text) as IngestionResult;
      } catch (parseError) {
        console.error("[RyzeAI] JSON Parsing Error:", parseError, "Raw Text:", response.text);
        throw new Error("Failed to structure document data. The model output was not valid JSON.");
      }

    } catch (error) {
      // Enhanced error logging for debugging
      console.error("[RyzeAI] Ingestion Pipeline Failed:", error);
      
      // Propagate helpful error messages to the UI
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred during the Vision/OCR process.");
    }
  }
};
