import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAdrSchema } from "../shared/schema";
import { generateOpenAiAdr } from "./services/openai";
import { generateGeminiAdr } from "./services/gemini";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate ADR endpoint
  app.post("/api/adrs/generate", async (req, res) => {
    try {
      // Validate request body
      const { prompt, model } = generateAdrSchema.parse(req.body);
      
      let result;
      
      // Generate ADR based on model choice
      if (model.startsWith("gpt")) {
        result = await generateOpenAiAdr(prompt, model);
      } else if (model.startsWith("gemini")) {
        result = await generateGeminiAdr(prompt, model);
      } else {
        return res.status(400).json({ message: "Unsupported model" });
      }
      
      // Save the generated ADR
      const savedAdr = await storage.createAdr({
        title: result.title,
        content: result.content,
        prompt,
        model
      });
      
      // Return the generated ADR
      return res.status(200).json(result);
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

  const httpServer = createServer(app);
  return httpServer;
}
