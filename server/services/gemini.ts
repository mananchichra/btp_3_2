import { ADR_SYSTEM_PROMPT } from "../../client/src/lib/adr-template";
import { type GenerateAdrResponse } from "../../shared/schema";
import { marked } from "marked";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate an ADR using Google's Gemini models
 * @param prompt User input describing the architectural decision
 * @param model Gemini model to use (defaults to gemini-pro)
 * @returns Generated ADR with title and content
 */
export async function generateGeminiAdr(
  prompt: string,
  model: string = "gemini-pro"
): Promise<GenerateAdrResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    // Initialize the Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    // Get the model
    const geminiModel = genAI.getGenerativeModel({ model });
    
    // Generate content
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: ADR_SYSTEM_PROMPT + "\n\n" + prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    // Get the response
    const response = result.response;
    const content = response.text();
    
    // Extract title from the content (first header)
    const titleMatch = content.match(/^#\s+(.*?)$/m);
    const title = titleMatch ? titleMatch[1].replace(/^ADR\s+\d+:\s+/, '') : "Architectural Decision Record";
    
    // Convert markdown to HTML for rendering
    const htmlContent = marked.parse(content).toString();

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
