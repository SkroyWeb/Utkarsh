import { 
  users, type User, type InsertUser,
  videos, type Video, type InsertVideo,
  references, type Reference, type InsertReference
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage";

// Extend the interface with all CRUD methods needed
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getLocalUserId(externalUserId: string): Promise<number>;
  
  // Video methods
  getVideo(id: number): Promise<Video | undefined>;
  getVideosByUserId(userId: number): Promise<Video[]>;
  getRecentVideos(limit?: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  saveVideoLesson(id: number, lessonJson: string): Promise<void>;
  
  // Reference methods
  getReferencesForVideo(videoId: number): Promise<Reference[]>;
  createReference(reference: InsertReference): Promise<Reference>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private videoRefs: Map<number, Reference[]>;
  private userCurrentId: number;
  private videoCurrentId: number;
  private referenceCurrentId: number;
  private externalUserIds: Map<string, number>;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.videoRefs = new Map();
    this.userCurrentId = 1;
    this.videoCurrentId = 1;
    this.referenceCurrentId = 1;
    this.externalUserIds = new Map();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getLocalUserId(externalUserId: string): Promise<number> {
    const existingId = this.externalUserIds.get(externalUserId);
    if (existingId) return existingId;

    const localId = this.userCurrentId++;
    this.externalUserIds.set(externalUserId, localId);
    this.users.set(localId, {
      id: localId,
      externalId: externalUserId,
      username: `clerk_${externalUserId}`,
      password: "clerk-managed",
    });
    return localId;
  }

  // Video methods
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByUserId(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId
    );
  }

  async getRecentVideos(limit = 6): Promise<Video[]> {
    return Array.from(this.videos.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoCurrentId++;
    const video: Video = { 
      ...insertVideo, 
      description: insertVideo.description ?? null,
      userId: insertVideo.userId ?? null,
      thumbnailUrl: insertVideo.thumbnailUrl ?? null,
      lessonJson: insertVideo.lessonJson ?? null,
      id,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }

  async saveVideoLesson(id: number, lessonJson: string): Promise<void> {
    const video = this.videos.get(id);
    if (video) this.videos.set(id, { ...video, lessonJson });
  }

  // Reference methods
  async getReferencesForVideo(videoId: number): Promise<Reference[]> {
    return this.videoRefs.get(videoId) || [];
  }

  async createReference(insertReference: InsertReference): Promise<Reference> {
    const id = this.referenceCurrentId++;
    const reference: Reference = { ...insertReference, id };
    
    const videoRefs = this.videoRefs.get(insertReference.videoId) || [];
    videoRefs.push(reference);
    this.videoRefs.set(insertReference.videoId, videoRefs);
    
    return reference;
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
