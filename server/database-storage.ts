import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  users,
  videos,
  references,
  type User,
  type InsertUser,
  type Video,
  type InsertVideo,
  type Reference,
  type InsertReference,
} from "@shared/schema";
import type { IStorage } from "./storage";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return (
      await db.select().from(users).where(eq(users.username, username)).limit(1)
    )[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return (await db.insert(users).values(insertUser).returning())[0];
  }

  async getLocalUserId(externalUserId: string): Promise<number> {
    const existing = (
      await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.externalId, externalUserId))
        .limit(1)
    )[0];
    if (existing) return existing.id;

    const username = `clerk_${externalUserId}`;
    try {
      const created = await this.createUser({
        externalId: externalUserId,
        username,
        password: "clerk-managed",
      });
      return created.id;
    } catch (error) {
      // Two requests can initialize the same account at the same time.
      // The unique external ID makes the second request safe to retry.
      const raced = (
        await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.externalId, externalUserId))
          .limit(1)
      )[0];
      if (raced) return raced.id;
      throw error;
    }
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return (await db.select().from(videos).where(eq(videos.id, id)).limit(1))[0];
  }

  async getVideosByUserId(userId: number): Promise<Video[]> {
    return db
      .select()
      .from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt));
  }

  async getRecentVideos(limit = 6): Promise<Video[]> {
    return db.select().from(videos).orderBy(desc(videos.createdAt)).limit(limit);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    return (await db.insert(videos).values(insertVideo).returning())[0];
  }

  async saveVideoLesson(id: number, lessonJson: string): Promise<void> {
    await db.update(videos).set({ lessonJson }).where(eq(videos.id, id));
  }

  async getReferencesForVideo(videoId: number): Promise<Reference[]> {
    return db
      .select()
      .from(references)
      .where(eq(references.videoId, videoId));
  }

  async createReference(insertReference: InsertReference): Promise<Reference> {
    return (await db.insert(references).values(insertReference).returning())[0];
  }
}