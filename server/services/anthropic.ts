import Anthropic from '@anthropic-ai/sdk';
import { ADR_SYSTEM_PROMPTS, AVAILABLE_TEMPLATES } from "../../client/src/lib/adr-template";
import { type GenerateAdrResponse } from "../../shared/schema";
import { marked } from "marked";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ""
});

/**
 * Generate an ADR using Anthropic Claude models
 * @param prompt User input describing the architectural decision
 * @param model Claude model to use (defaults to claude-3-7-sonnet-20250219)
 * @param templateId Template format to use (defaults to standard)
 * @returns Generated ADR with title and content
 */
export async function generateAnthropicAdr(
  prompt: string,
  model: string = "claude-3-7-sonnet-20250219",
  templateId: string = "standard"
): Promise<GenerateAdrResponse> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
    }

    // Get the appropriate system prompt based on the template
    const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId);
    const systemPrompt = template?.systemPrompt || ADR_SYSTEM_PROMPTS.standard;

    // Create a message with Claude
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extract the response content
    const content = response.content[0].text;
    
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
    console.error("Anthropic API error:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to generate ADR with Claude: ${error.message}` 
        : "Failed to generate ADR with Claude"
    );
  }
}