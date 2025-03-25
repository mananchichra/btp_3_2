import OpenAI from "openai";
import { ADR_SYSTEM_PROMPT } from "../../client/src/lib/adr-template";
import { type GenerateAdrResponse } from "../../shared/schema";
import { marked } from "marked";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

/**
 * Generate an ADR using OpenAI models
 * @param prompt User input describing the architectural decision
 * @param model OpenAI model to use (defaults to gpt-4o)
 * @returns Generated ADR with title and content
 */
export async function generateOpenAiAdr(
  prompt: string,
  model: string = "gpt-4o"
): Promise<GenerateAdrResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: ADR_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "";
    
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
    console.error("OpenAI API error:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate ADR with OpenAI: ${error.message}` 
        : "Failed to generate ADR with OpenAI"
    );
  }
}
