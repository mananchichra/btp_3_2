import { pgTable, text, serial, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// ADR schema
export const adrs = pgTable("adrs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Fields for tracking refinements
  originalAdrId: integer("original_adr_id"), // null for original ADRs, populated for refinements
  feedback: text("feedback"), // Feedback that led to this refinement (null for original ADRs)
});

export const insertAdrSchema = createInsertSchema(adrs).pick({
  title: true,
  content: true,
  model: true,
  prompt: true,
  originalAdrId: true,
  feedback: true,
});

// Generate ADR request schema
export const generateAdrSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().min(1, "Model is required"),
  templateId: z.string().default("standard").optional()
});

// Feedback request schema 
export const feedbackSchema = z.object({
  adrId: z.number(),
  feedback: z.string().min(1, "Feedback is required"),
  model: z.string().min(1, "Model is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAdr = z.infer<typeof insertAdrSchema>;
export type Adr = typeof adrs.$inferSelect;

export type GenerateAdrRequest = z.infer<typeof generateAdrSchema>;
export type GenerateAdrResponse = {
  title: string;
  content: string;
};

export type FeedbackRequest = z.infer<typeof feedbackSchema>;
export type FeedbackResponse = {
  id: number;
  title: string;
  content: string;
  originalAdrId: number;
};
