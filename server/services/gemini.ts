import { ADR_SYSTEM_PROMPT } from "../../client/src/lib/adr-template";
import { type GenerateAdrResponse } from "../../shared/schema";
import { marked } from "marked";

/**
 * Generate an ADR using Google's Gemini models
 * @param prompt User input describing the architectural decision
 * @param model Gemini model to use (defaults to gemini-pro)
 * @returns Generated ADR with title and content
 */
export async function generateGeminiAdr(
  prompt: string,
  model: string = "gemini-1.5-pro"
): Promise<GenerateAdrResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: ADR_SYSTEM_PROMPT },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Extract title from the content (first header)
    const titleMatch = content.match(/^#\s+(.*?)$/m);
    const title = titleMatch ? titleMatch[1].replace(/^ADR\s+\d+:\s+/, '') : "Architectural Decision Record";
    
    // Convert markdown to HTML for rendering
    const htmlContent = marked(content);

    return {
      title,
      content: htmlContent
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate ADR with Gemini: ${error.message}` 
        : "Failed to generate ADR with Gemini"
    );
  }
}
