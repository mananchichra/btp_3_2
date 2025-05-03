// src/models/ollama.ts

import {
    GenerateAdrRequest,
    GenerateAdrResponse
  } from "../../shared/schema";
import { ADR_SYSTEM_PROMPTS, AVAILABLE_TEMPLATES } from "../../client/src/lib/adr-template";
  type OllamaRequest = {
    model: string;
    prompt: string;
    stream?: boolean;
  };
  
  const OLLAMA_API_URL = "http://localhost:11434/api/generate";
  
  async function callOllama(request: OllamaRequest): Promise<string> {
    const res = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, stream: false }),
    });
  
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama error (${res.status}): ${errText}`);
    }
  
    const data = await res.json();
    return data.response.trim();
  }
  
  // Main function to generate a formatted ADR using Ollama
  export async function generateAdrWithOllama({
    prompt,
    model,
    templateId = "standard",
  }: GenerateAdrRequest): Promise<GenerateAdrResponse> {
    const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId);
    const systemPrompt = template || ADR_SYSTEM_PROMPTS.standard;
  
    const combinedPrompt = `${systemPrompt}\n\nUser input:\n${prompt}`;
  
    const content = await callOllama({
      model: model.toLowerCase().replace(/\s+/g, ""), // e.g. "Gemma 2B" -> "gemma2b"
      prompt: combinedPrompt,
    });
  
    // Extract title from markdown
    const match = content.match(/^#+\s*(ADR\s*\d*:\s*)?(.+)/im);
    const title = match?.[2]?.trim() ?? "Untitled ADR";
  
    return {
      title,
      content,
    };
  }
  