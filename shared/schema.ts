import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema (keep from original file)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  externalId: true,
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Videos schema
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  searchQuery: text("search_query").notNull(),
  // The exact generated lesson (script + beats) as JSON, so reopening a video replays the same lines.
  lessonJson: text("lesson_json"),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Search references schema
export const references = pgTable("references", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
});

export const insertReferenceSchema = createInsertSchema(references).omit({
  id: true,
});

export type InsertReference = z.infer<typeof insertReferenceSchema>;
export type Reference = typeof references.$inferSelect;

// Popular topics
export const popularTopics = [
  "Quantum Physics",
  "Machine Learning",
  "Climate Change",
  "Ancient History",
  "Genetics",
  "Renewable Energy",
  "Human Biology",
  "Space Exploration",
  "Artificial Intelligence",
  "Philosophy"
];
