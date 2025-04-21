import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAdrSchema, feedbackSchema } from "../shared/schema";
import { generateOpenAiAdr } from "./services/openai";
import { generateGeminiAdr } from "./services/gemini";
import { generateAnthropicAdr } from "./services/anthropic";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate ADR endpoint
  app.post("/api/adrs/generate", async (req, res) => {
    try {
      // Validate request body
      const { prompt, model, templateId } = generateAdrSchema.parse(req.body);
      
      let result;
      
      // Generate ADR based on model choice
      if (model.startsWith("gpt")) {
        result = await generateOpenAiAdr(prompt, model, templateId);
      } else if (model.startsWith("gemini")) {
        result = await generateGeminiAdr(prompt, model, templateId);
      } else if (model.startsWith("claude")) {
        result = await generateAnthropicAdr(prompt, model, templateId);
      } else {
        return res.status(400).json({ message: "Unsupported model" });
      }
      
      // Save the generated ADR
      const savedAdr = await storage.createAdr({
        title: result.title,
        content: result.content,
        prompt,
        model,
        originalAdrId: null,
        feedback: null
      });
      
      // Return the generated ADR with the ID
      return res.status(200).json({
        id: savedAdr.id,
        ...result
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error generating ADR:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate ADR" 
      });
    }
  });

  // Get a specific ADR
  app.get("/api/adrs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ADR ID" });
      }

      const adr = await storage.getAdr(id);
      if (!adr) {
        return res.status(404).json({ message: "ADR not found" });
      }

      return res.status(200).json(adr);
    } catch (error) {
      console.error("Error retrieving ADR:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to retrieve ADR"
      });
    }
  });

  // Get refinements for a specific ADR
  app.get("/api/adrs/:id/refinements", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ADR ID" });
      }

      const refinements = await storage.getRefinedAdrs(id);
      return res.status(200).json(refinements);
    } catch (error) {
      console.error("Error retrieving ADR refinements:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to retrieve ADR refinements"
      });
    }
  });

  // Provide feedback on an ADR and generate a refined version
  app.post("/api/adrs/:id/feedback", async (req, res) => {
    try {
      // Validate request body
      const { feedback, model } = feedbackSchema.parse({
        ...req.body,
        adrId: parseInt(req.params.id)
      });
      
      const adrId = parseInt(req.params.id);
      if (isNaN(adrId)) {
        return res.status(400).json({ message: "Invalid ADR ID" });
      }

      // Get the original ADR
      const originalAdr = await storage.getAdr(adrId);
      if (!originalAdr) {
        return res.status(404).json({ message: "ADR not found" });
      }

      // Construct a prompt that includes the original ADR and the feedback
      const refinementPrompt = `
I previously generated this Architectural Decision Record:

TITLE: ${originalAdr.title}

CONTENT:
${originalAdr.content}

USER FEEDBACK:
${feedback}

Please create an improved version of this ADR that addresses the feedback while maintaining the original structure and important information.
`;

      let result;
      
      // Generate refined ADR based on model choice
      if (model.startsWith("gpt")) {
        result = await generateOpenAiAdr(refinementPrompt, model);
      } else if (model.startsWith("gemini")) {
        result = await generateGeminiAdr(refinementPrompt, model);
      } else if (model.startsWith("claude")) {
        result = await generateAnthropicAdr(refinementPrompt, model);
      } else {
        return res.status(400).json({ message: "Unsupported model" });
      }
      
      // Save the refined ADR
      const refinedAdr = await storage.createRefinedAdr({
        title: result.title,
        content: result.content,
        prompt: refinementPrompt,
        model,
        originalAdrId: adrId,
        feedback
      }, adrId);
      
      // Return the refined ADR
      return res.status(200).json({
        id: refinedAdr.id,
        title: refinedAdr.title,
        content: refinedAdr.content,
        originalAdrId: adrId
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error generating refined ADR:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate refined ADR" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
