import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { getAuth } from "@clerk/express";
import { storage } from "./storage";
import { insertVideoSchema, insertReferenceSchema, popularTopics } from "@shared/schema";
import { z } from "zod";
import { buildLesson, searchTopic, type Lesson, type TopicSearchResult } from "./topic-content";
import { whiteboardCss, whiteboardScript } from "./whiteboard";
import { characters, characterCss, characterScript } from "./characters";
import { avatarMotionCss, avatarMotionScript } from "./avatar-motion";
import { lessonStore } from "./lesson-store";

const generatedLessons = lessonStore; // memory + disk cache (see lesson-store.ts)

// Safe to embed inside an inline <script>: no "</script>" breakout.
function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// The saved lesson can be large; never send it to the browser in list/detail responses.
function publicVideo<T extends { lessonJson?: string | null }>(video: T): Omit<T, "lessonJson"> {
  const { lessonJson: _omit, ...rest } = video;
  return rest;
}

function parseSavedLesson(json: string | null | undefined): Lesson | undefined {
  if (!json) return undefined;
  try {
    const lesson = JSON.parse(json) as Lesson;
    return lesson && typeof lesson.script === "string" && Array.isArray(lesson.beats) ? lesson : undefined;
  } catch {
    return undefined;
  }
}

function getAuthenticatedUserId(req: Request): string | undefined {
  return getAuth(req).userId ?? undefined;
}

// Generate a topic-specific video record and narration.
async function generateVideoContent(query: string, searchResults: TopicSearchResult[]) {
  const streamId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const lesson = await buildLesson(query, searchResults);
  const script = lesson.script;
  generatedLessons.set(streamId, lesson);

  return {
    title: `${query} Explained`,
    description: `An explanation of ${query}, covering its core idea, mechanism, example, evidence, and limitations.`,
    duration: Math.max(120, Math.ceil(script.split(/\s+/).length / 2.5)),
    videoUrl: `/api/videos/stream/${streamId}`,
    thumbnailUrl: `/api/videos/thumbnail/${streamId}`,
    script,
    lessonJson: JSON.stringify(lesson),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes with '/api' prefix
  
  // Get popular topics
  app.get('/api/topics/popular', (req: Request, res: Response) => {
    res.json({ topics: popularTopics });
  });

  // Search web for information
  app.post('/api/search', async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Query is required' });
      }
      
       const searchResults = await searchTopic(query);
      
      res.json({ results: searchResults });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: 'Error searching for information' });
    }
  });

  // Generate video content based on search query
  app.post('/api/videos/generate', async (req: Request, res: Response) => {
    try {
      const externalUserId = getAuthenticatedUserId(req);
      if (!externalUserId) {
        return res.status(401).json({ message: 'Sign in to create and save explanations' });
      }

       const { query, searchResults } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Query is required' });
      }
      
      if (!searchResults || !Array.isArray(searchResults)) {
        return res.status(400).json({ message: 'Search results are required' });
      }
      
       const videoContent = await generateVideoContent(query, searchResults);
      const userId = await storage.getLocalUserId(externalUserId);
      
      // Create video in storage
      const videoData = {
        title: videoContent.title,
        description: videoContent.description,
        duration: videoContent.duration,
        videoUrl: videoContent.videoUrl,
        thumbnailUrl: videoContent.thumbnailUrl,
        searchQuery: query,
        lessonJson: videoContent.lessonJson,
        userId,
      };
      
      const validatedData = insertVideoSchema.parse(videoData);
      const video = await storage.createVideo(validatedData);
      
      // Create references in storage
      for (const result of searchResults) {
        const refData = {
          videoId: video.id,
          title: result.title,
          url: result.url,
        };
        
        const validatedRef = insertReferenceSchema.parse(refData);
        await storage.createReference(validatedRef);
      }
      
      const references = await storage.getReferencesForVideo(video.id);
      
      res.json({ video: publicVideo(video), references });
    } catch (error) {
      console.error('Video generation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid video data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error generating video content' });
    }
  });

  // Get recent videos
  app.get('/api/videos', async (req: Request, res: Response) => {
    try {
      const externalUserId = getAuthenticatedUserId(req);
      if (!externalUserId) {
        return res.status(401).json({ message: 'Sign in to view your explanations' });
      }

      const userId = await storage.getLocalUserId(externalUserId);
      const videos = (await storage.getVideosByUserId(userId)).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      res.json({ videos: videos.map(publicVideo) });
    } catch (error) {
      console.error('Error fetching video history:', error);
      res.status(500).json({ message: 'Error fetching video history' });
    }
  });

  app.get('/api/videos/recent', async (req: Request, res: Response) => {
    try {
      const externalUserId = getAuthenticatedUserId(req);
      if (!externalUserId) {
        return res.json({ videos: [] });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const userId = await storage.getLocalUserId(externalUserId);
      const videos = (await storage.getVideosByUserId(userId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
      res.json({ videos: videos.map(publicVideo) });
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      res.status(500).json({ message: 'Error fetching recent videos' });
    }
  });

  // Stream video content with high-quality animation and guaranteed voice
  app.get('/api/videos/stream/:id', async (req: Request, res: Response) => {
    try {
      const externalUserId = getAuthenticatedUserId(req);
      if (!externalUserId) {
        return res.status(401).send('Sign in to view this explanation');
      }

      // Get video details
      const videoId = req.params.id;
      
      // Get video data if available
      let videoTitle = "Educational Explanation";
      let searchQuery = "";
      let savedVideo: Awaited<ReturnType<typeof storage.getVideo>>;
      try {
        const userId = await storage.getLocalUserId(externalUserId);
        const videoData = await storage.getVideosByUserId(userId);
        const video = videoData.find((v) => v.videoUrl && v.videoUrl.includes(videoId));
        savedVideo = video;
        if (video) {
          videoTitle = video.title;
          searchQuery = video.searchQuery;
        }
        if (!video) {
          return res.status(404).send('Explanation not found');
        }
      } catch (e) {
        console.log('Could not get video data:', e);
      }
      
       // Use the exact narration created for this request. If the app restarted,
       // rebuild it from the saved query rather than returning a generic script.
       // 1) the lesson saved with the history record, 2) the local cache, 3) rebuild once and then
       // save it, so this video never changes again.
       let lesson = parseSavedLesson(savedVideo?.lessonJson) || generatedLessons.get(videoId);
       if (!lesson) {
         lesson = await buildLesson(searchQuery);
         generatedLessons.set(videoId, lesson);
       }
       if (savedVideo && !savedVideo.lessonJson) {
         try {
           await storage.saveVideoLesson(savedVideo.id, JSON.stringify(lesson));
         } catch (e) {
           console.warn('Could not save lesson with video:', e instanceof Error ? e.message : e);
         }
       }
       const script = lesson.script;
       const timelineDuration = Math.max(
         20,
         Math.ceil(script.split(/\s+/).filter(Boolean).length / 2.5),
       );
      
      // Create Enhanced HTML with high-quality teacher animation and audio
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${videoTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            body, html { 
              margin: 0; 
              padding: 0; 
              width: 100%; 
              height: 100%;
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%);
              color: #333;
            }
            
            .video-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
              position: relative;
            }
            
            .classroom-scene {
              width: 860px;
              height: 520px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
              margin: 0 auto;
            }
            
            .classroom-background {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%);
              z-index: 1;
            }
            
            .classroom-decor {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 2;
            }
            
            .teacher-area {
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 300px;
              height: 400px;
              z-index: 10;
            }
            
            .content-board {
              position: absolute;
              top: 60px;
              right: 40px;
              width: 320px;
              height: 240px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              z-index: 5;
              padding: 15px;
              overflow: hidden;
            }
            
            .board-title {
              font-size: 18px;
              font-weight: 600;
              color: #1E40AF;
              margin-bottom: 10px;
            }
            
            .board-content {
              font-size: 14px;
              line-height: 1.5;
            }
            
            .progress-bars {
              margin-top: 15px;
            }
            
            .progress-bar {
              height: 8px;
              border-radius: 4px;
              background: #E5E7EB;
              margin-bottom: 10px;
              overflow: hidden;
            }
            
            .progress-value {
              height: 100%;
              background: #3B82F6;
              border-radius: 4px;
              width: 0%;
            }
            
            .video-controls {
              position: absolute;
              bottom: 30px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 15px;
              z-index: 50;
              background: rgba(255,255,255,0.9);
              padding: 10px 20px;
              border-radius: 30px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .timeline-controls {
              display: none;
            }

            .timeline-controls input {
              flex: 1;
              accent-color: #2563EB;
              cursor: pointer;
            }
            
            .control-btn {
              background: #3B82F6;
              color: white;
              border: none;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .control-btn:hover {
              background: #2563EB;
              transform: scale(1.05);
            }
            
            .control-btn:active {
              transform: scale(0.95);
            }
            
            .control-btn svg {
              width: 18px;
              height: 18px;
            }
            
            .control-btn.primary {
              width: auto;
              padding: 0 20px;
              border-radius: 20px;
              font-weight: 600;
              display: flex;
              gap: 8px;
            }
            
            .subtitles {
              position: absolute;
              bottom: 82px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0,0,0,0.7);
              color: white;
              padding: 10px 20px;
              border-radius: 8px;
              z-index: 40;
              font-size: 16px;
              max-width: 80%;
              text-align: center;
              opacity: 0;
              transition: opacity 0.3s;
            }
            
            .subtitles.show {
              opacity: 1;
            }
            
            .video-title {
              position: absolute;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 24px;
              font-weight: 700;
              color: #1E3A8A;
              text-align: center;
              z-index: 30;
              width: 80%;
            }
            
            .video-settings {
              position: absolute;
              top: 20px;
              right: 20px;
              z-index: 30;
            }
            
            .settings-dropdown {
              position: absolute;
              top: 50px;
              right: 0;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              padding: 10px;
              width: 250px;
              display: none;
            }
            
            .settings-dropdown.show {
              display: block;
            }
            
            .settings-item {
              padding: 8px 10px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #f0f0f0;
            }
            
            .settings-item:last-child {
              border-bottom: none;
            }
            
            .settings-label {
              font-weight: 500;
              font-size: 14px;
            }
            
            select.settings-value {
              padding: 5px;
              border-radius: 4px;
              border: 1px solid #ddd;
              font-size: 13px;
            }
            
            .hidden {
              display: none;
            }
            
            /* High-quality teacher animation styling */
            #teacher-container {
              width: 100%;
              height: 100%;
              position: relative;
            }
            
            /* Responsive design */
            @media (max-width: 900px) {
              .classroom-scene {
                width: 95%;
                height: 90vh;
                max-height: 520px;
              }
              
              .content-board {
                width: 280px;
                right: 20px;
              }
            }
            
            @media (max-width: 600px) {
              .classroom-scene {
                height: 80vh;
              }
              
              .content-board {
                top: auto;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                right: auto;
                width: 90%;
                height: auto;
                max-height: 180px;
              }
              
              .teacher-area {
                width: 200px;
                height: 300px;
              }
              
              .video-title {
                font-size: 18px;
                top: 10px;
              }
            }
            ${whiteboardCss}
            ${characterCss}
            ${avatarMotionCss}
            /* One consistent control surface: the themed pill plus a seekable
               timeline, both inside the lesson, so it looks and works the same
               in the app, in fullscreen and in a downloaded copy. */
            .timeline-controls {
              display: flex !important;
              position: absolute;
              left: 20px; right: 20px; bottom: 0; height: 14px;
              align-items: center; gap: 10px; z-index: 50;
              font: 700 11px/1 'Nunito','Segoe UI',sans-serif; color: #10205C;
            }
            .timeline-controls input { height: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="video-container">
            <div class="classroom-scene">
              <!-- Classroom background -->
              <div class="classroom-background"></div>
              
              <!-- Classroom decorative elements -->
              <div class="classroom-decor">
                <!-- Decorative elements for the classroom -->
                <svg width="100%" height="100%" viewBox="0 0 860 520" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background decorative elements -->
                  <circle cx="120" cy="100" r="50" fill="#3B82F6" opacity="0.1" />
                  <circle cx="740" cy="420" r="80" fill="#3B82F6" opacity="0.1" />
                  <circle cx="200" cy="450" r="30" fill="#3B82F6" opacity="0.1" />
                  <circle cx="700" cy="80" r="40" fill="#3B82F6" opacity="0.1" />
                  
                  <!-- Vector decorations - abstract shapes -->
                  <path d="M50,100 Q120,50 180,120 T300,150" stroke="#3B82F6" stroke-width="2" fill="none" opacity="0.2" />
                  <path d="M700,80 Q620,120 680,180 T600,240" stroke="#3B82F6" stroke-width="2" fill="none" opacity="0.2" />
                </svg>
              </div>
              
              <!-- Whiteboard: filled by showBeatAt() as the teacher speaks -->
              <div class="content-board" aria-label="Whiteboard">
                <div id="whiteboard" aria-live="polite"></div>
              </div>
              
              <!-- Teacher avatar area - Fun cartoon style with more animation -->
              <div class="teacher-area">
                <div id="teacher-container">
                  <!-- Stylized Cartoon Teacher Animation -->
                  <svg width="100%" height="100%" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Fun background elements with animation -->
                    <g id="background-fx">
                      <circle cx="150" cy="180" r="140" fill="url(#radial-glow)">
                        <animate attributeName="r" values="140;150;140" dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.5;0.8" dur="6s" repeatCount="indefinite" />
                      </circle>
                      
                      <!-- Animated particles -->
                      <g>
                        <circle cx="100" cy="100" r="4" fill="#5EEAD4">
                          <animate attributeName="cx" values="100;80;110;90;100" dur="12s" repeatCount="indefinite" />
                          <animate attributeName="cy" values="100;120;90;110;100" dur="10s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="200" cy="90" r="5" fill="#A5B4FC">
                          <animate attributeName="cx" values="200;220;195;215;200" dur="10s" repeatCount="indefinite" />
                          <animate attributeName="cy" values="90;70;100;80;90" dur="11s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="130" cy="250" r="6" fill="#BFDBFE">
                          <animate attributeName="cx" values="130;145;120;140;130" dur="13s" repeatCount="indefinite" />
                          <animate attributeName="cy" values="250;230;260;240;250" dur="9s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="7s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="230" cy="230" r="4" fill="#93C5FD">
                          <animate attributeName="cx" values="230;210;240;220;230" dur="11s" repeatCount="indefinite" />
                          <animate attributeName="cy" values="230;250;220;240;230" dur="14s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="6s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    </g>
                    
                    <!-- Fun Cartoon Teacher Character -->
                    <g id="cartoon-teacher" transform="translate(150, 200)">
                      <!-- Animated Body -->
                      <g>
                        <!-- Bouncing/wiggling animation for entire character -->
                        <animateTransform attributeName="transform" type="translate" 
                          values="0,0; 0,-5; 0,0" dur="1.5s" repeatCount="indefinite" />
                        
                        <!-- Character Body - Simplified Cute Style -->
                        <ellipse cx="0" cy="30" rx="70" ry="60" fill="#60A5FA">
                          <animate attributeName="ry" values="60;63;60" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="rx" values="70;73;70" dur="1.5s" repeatCount="indefinite" />
                        </ellipse>
                        
                        <!-- Arms that move more dramatically -->
                        <g id="left-arm">
                          <path d="M-50,20 C-80,40 -85,80 -70,100" stroke="#60A5FA" stroke-width="20" stroke-linecap="round">
                            <animate attributeName="d" 
                              values="M-50,20 C-80,40 -85,80 -70,100; 
                                      M-50,20 C-90,30 -100,60 -80,90; 
                                      M-50,20 C-70,50 -75,90 -60,110;
                                      M-50,20 C-80,40 -85,80 -70,100" 
                              dur="5s" repeatCount="indefinite" />
                          </path>
                          <!-- Hand -->
                          <circle cx="-70" cy="100" r="12" fill="#DDD6FE">
                            <animate attributeName="cx" 
                              values="-70;-80;-60;-70" 
                              dur="5s" repeatCount="indefinite" />
                            <animate attributeName="cy" 
                              values="100;90;110;100" 
                              dur="5s" repeatCount="indefinite" />
                            <animate attributeName="r" values="12;14;13;12" dur="2s" repeatCount="indefinite" />
                          </circle>
                        </g>
                        
                        <g id="right-arm">
                          <path d="M50,20 C80,40 85,80 70,100" stroke="#60A5FA" stroke-width="20" stroke-linecap="round">
                            <animate attributeName="d" 
                              values="M50,20 C80,40 85,80 70,100; 
                                      M50,20 C90,30 100,60 80,90; 
                                      M50,20 C70,50 75,90 60,110;
                                      M50,20 C80,40 85,80 70,100" 
                              dur="5s" repeatCount="indefinite" />
                          </path>
                          <!-- Hand -->
                          <circle cx="70" cy="100" r="12" fill="#DDD6FE">
                            <animate attributeName="cx" 
                              values="70;80;60;70" 
                              dur="5s" repeatCount="indefinite" />
                            <animate attributeName="cy" 
                              values="100;90;110;100" 
                              dur="5s" repeatCount="indefinite" />
                            <animate attributeName="r" values="12;14;13;12" dur="2s" repeatCount="indefinite" />
                          </circle>
                        </g>
                      </g>
                      
                      <!-- Head group with funky cartoon style -->
                      <g id="head" transform="translate(0, -60)">
                        <!-- Head base with bouncy animation -->
                        <circle cx="0" cy="0" r="60" fill="#DDD6FE">
                          <animate attributeName="r" values="60;62;59;60" dur="2s" repeatCount="indefinite" />
                          <!-- Slight tilting animation -->
                          <animateTransform attributeName="transform" type="rotate" 
                            values="0 0 0; 5 0 0; 0 0 0; -5 0 0; 0 0 0" 
                            dur="6s" repeatCount="indefinite" />
                        </circle>
                        
                        <!-- Hair - fun cartoon style -->
                        <path d="M-50,-20 Q-20,-80 0,-80 Q20,-80 50,-20" fill="#818CF8" stroke="#818CF8" stroke-width="2">
                          <animate attributeName="d" 
                            values="M-50,-20 Q-20,-80 0,-80 Q20,-80 50,-20;
                                    M-48,-18 Q-18,-83 0,-83 Q18,-83 48,-18;
                                    M-50,-20 Q-20,-80 0,-80 Q20,-80 50,-20;" 
                            dur="3s" repeatCount="indefinite" />
                        </path>
                        
                        <!-- Fun spiky hair -->
                        <path d="M-30,-40 L-25,-70 L-20,-40 L-10,-75 L-5,-40 L5,-40 L10,-75 L15,-40 L25,-70 L30,-40" 
                          stroke="#818CF8" stroke-width="6" stroke-linecap="round" fill="none">
                          <animate attributeName="d" 
                            values="M-30,-40 L-25,-70 L-20,-40 L-10,-75 L-5,-40 L5,-40 L10,-75 L15,-40 L25,-70 L30,-40;
                                    M-30,-40 L-25,-65 L-20,-40 L-10,-70 L-5,-40 L5,-40 L10,-70 L15,-40 L25,-65 L30,-40;
                                    M-30,-40 L-25,-70 L-20,-40 L-10,-75 L-5,-40 L5,-40 L10,-75 L15,-40 L25,-70 L30,-40;" 
                            dur="2s" repeatCount="indefinite" />
                        </path>
                        
                        <!-- Exaggerated facial features -->
                        <g id="face">
                          <!-- Large cartoon eyes -->
                          <g id="eyes">
                            <!-- Eye backgrounds -->
                            <ellipse cx="-20" cy="-15" rx="15" ry="15" fill="white">
                              <animate attributeName="ry" values="15;5;15" dur="3s" repeatCount="indefinite" />
                            </ellipse>
                            <ellipse cx="20" cy="-15" rx="15" ry="15" fill="white">
                              <animate attributeName="ry" values="15;5;15" dur="3s" repeatCount="indefinite" />
                            </ellipse>
                            
                            <!-- Pupils that move around expressively -->
                            <circle cx="-20" cy="-15" r="8" fill="#2563EB">
                              <animate attributeName="cx" 
                                values="-20;-15;-25;-18;-20" 
                                dur="4s" repeatCount="indefinite" />
                              <animate attributeName="cy" 
                                values="-15;-18;-12;-16;-15" 
                                dur="4s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="20" cy="-15" r="8" fill="#2563EB">
                              <animate attributeName="cx" 
                                values="20;15;25;18;20" 
                                dur="4s" repeatCount="indefinite" />
                              <animate attributeName="cy" 
                                values="-15;-18;-12;-16;-15" 
                                dur="4s" repeatCount="indefinite" />
                            </circle>
                            
                            <!-- Sparkles in eyes -->
                            <circle cx="-17" cy="-18" r="3" fill="white" />
                            <circle cx="23" cy="-18" r="3" fill="white" />
                          </g>
                          
                          <!-- Fun expressive eyebrows -->
                          <path d="M-35,-30 Q-20,-40 -5,-30" stroke="#818CF8" stroke-width="5" stroke-linecap="round" fill="none">
                            <animate attributeName="d" 
                              values="M-35,-30 Q-20,-40 -5,-30;
                                      M-35,-35 Q-20,-45 -5,-35;
                                      M-35,-30 Q-20,-40 -5,-30;" 
                              dur="3s" repeatCount="indefinite" />
                          </path>
                          <path d="M5,-30 Q20,-40 35,-30" stroke="#818CF8" stroke-width="5" stroke-linecap="round" fill="none">
                            <animate attributeName="d" 
                              values="M5,-30 Q20,-40 35,-30;
                                      M5,-35 Q20,-45 35,-35;
                                      M5,-30 Q20,-40 35,-30;" 
                              dur="3s" repeatCount="indefinite" />
                          </path>
                          
                          <!-- Simplified cartoon nose -->
                          <path d="M0,-15 L5,0 L-5,0 Z" fill="#C4B5FD" />
                          
                          <!-- Mouth with more accurate lip syncing animation -->
                          <g id="mouth">
                            <path id="mouth-shape" d="M-20,15 Q0,25 20,15" fill="#FCA5A5" stroke="#C4B5FD" stroke-width="2">
                              <!-- Precisely timed lip sync expressions during speech -->
                              <animate id="talking-animation" attributeName="d" 
                                values="M-20,15 Q0,18 20,15;
                                        M-20,15 Q0,30 20,15;
                                        M-20,15 Q0,15 20,15;
                                        M-20,12 Q0,25 20,12;
                                        M-15,15 Q0,35 15,15;
                                        M-20,15 Q0,18 20,15;" 
                                dur="0.4s" repeatCount="indefinite" begin="speechStart.begin" />
                              <!-- Very subtle movement when not talking -->
                              <animate attributeName="d" 
                                values="M-20,15 Q0,18 20,15;
                                        M-20,16 Q0,19 20,16;
                                        M-20,15 Q0,18 20,15;" 
                                dur="4s" repeatCount="indefinite" begin="0s" />
                            </path>
                          </g>
                          
                          <!-- Fun glasses - unusual shape -->
                          <g id="glasses">
                            <path d="M-40,-15 C-35,-30 -5,-30 -5,-15 C-5,0 -35,0 -40,-15 Z" fill="none" stroke="#A78BFA" stroke-width="3">
                              <animate attributeName="d" 
                                values="M-40,-15 C-35,-30 -5,-30 -5,-15 C-5,0 -35,0 -40,-15 Z;
                                        M-40,-14 C-35,-29 -5,-29 -5,-14 C-5,1 -35,1 -40,-14 Z;
                                        M-40,-15 C-35,-30 -5,-30 -5,-15 C-5,0 -35,0 -40,-15 Z;" 
                                dur="3s" repeatCount="indefinite" />
                            </path>
                            <path d="M5,-15 C5,-30 35,-30 40,-15 C35,0 5,0 5,-15 Z" fill="none" stroke="#A78BFA" stroke-width="3">
                              <animate attributeName="d" 
                                values="M5,-15 C5,-30 35,-30 40,-15 C35,0 5,0 5,-15 Z;
                                        M5,-14 C5,-29 35,-29 40,-14 C35,1 5,1 5,-14 Z;
                                        M5,-15 C5,-30 35,-30 40,-15 C35,0 5,0 5,-15 Z;" 
                                dur="3s" repeatCount="indefinite" />
                            </path>
                            <line x1="-5" y1="-15" x2="5" y2="-15" stroke="#A78BFA" stroke-width="3">
                              <animate attributeName="y1" values="-15;-14;-15" dur="3s" repeatCount="indefinite" />
                              <animate attributeName="y2" values="-15;-14;-15" dur="3s" repeatCount="indefinite" />
                            </line>
                          </g>
                        </g>
                      </g>
                    </g>
                    
                    <!-- Dynamic Elements -->
                    <g id="teaching-effects">
                      <!-- Animated thought bubbles -->
                      <g transform="translate(220, 80)">
                        <circle cx="0" cy="0" r="15" fill="#DDD6FE">
                          <animate attributeName="r" values="15;18;15" dur="3s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="-25" cy="-10" r="10" fill="#DDD6FE">
                          <animate attributeName="r" values="10;12;10" dur="2.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="-40" cy="-25" r="6" fill="#DDD6FE">
                          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    </g>
                    
                    <!-- Special effects elements -->
                    <defs>
                      <radialGradient id="radial-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stop-color="#A5B4FC" stop-opacity="0.6" />
                        <stop offset="100%" stop-color="#818CF8" stop-opacity="0" />
                      </radialGradient>
                    </defs>
                    
                    <!-- Animation markers for coordinating audio with visuals -->
                    <animate id="speechStart" begin="indefinite" dur="0.1s" attributeName="opacity" from="1" to="1" />
                  </svg>
                </div>
              </div>
              
              <!-- Video title -->
              <div class="video-title">${videoTitle}</div>
              
              <!-- Subtitles -->
              <div class="subtitles" id="subtitles"></div>

              <!-- Seekable timeline -->
              <div class="timeline-controls">
                <input
                  id="timeline"
                  type="range"
                  min="0"
                  max="${timelineDuration}"
                  step="0.1"
                  value="0"
                  aria-label="Video timeline"
                />
                <span id="timeline-time">0:00 / ${Math.floor(timelineDuration / 60)}:${String(timelineDuration % 60).padStart(2, "0")}</span>
              </div>
              
              <!-- Video controls -->
              <div class="video-controls">
                <button class="control-btn" id="restart-btn" title="Restart">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                </button>
                <button class="control-btn primary" id="play-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21"></polygon>
                  </svg>
                  Play
                </button>
                <button class="control-btn primary hidden" id="pause-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  Pause
                </button>
                <button class="control-btn" id="settings-btn" title="Settings">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
                <button class="control-btn cc-btn" id="cc-btn" title="Captions on/off" aria-pressed="true">CC</button>
                <button class="control-btn" id="fs-btn" title="Fullscreen" aria-label="Fullscreen">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                </button>
              </div>
              
              <!-- Settings panel -->
              <div class="video-settings">
                <div class="settings-dropdown" id="settings-dropdown">
                  <div class="settings-item col">
                    <span class="settings-label">Teacher:</span>
                    <div class="ie-chips" id="teacher-picker"></div>
                    <div class="ie-teacher-name" id="teacher-name"></div>
                  </div>
                  <div class="settings-item">
                    <span class="settings-label">Captions:</span>
                    <select id="cc-select" class="settings-value">
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                  <div class="settings-item">
                    <span class="settings-label">Voice:</span>
                    <select id="voice-select" class="settings-value">
                      <option value="auto">Auto (matches teacher)</option>
                    </select>
                  </div>
                  <div class="settings-item">
                    <span class="settings-label">Speed:</span>
                    <select id="speed-select" class="settings-value">
                      <option value="0.75">Slow (0.75x)</option>
                      <option value="1" selected>Normal (1x)</option>
                      <option value="1.25">Fast (1.25x)</option>
                      <option value="1.5">Faster (1.5x)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Audio element for consistent audio playback -->
          <audio id="audio-player" src="" controls style="display:none;"></audio>
          
          <script>
            // Main control elements
            const playBtn = document.getElementById('play-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const restartBtn = document.getElementById('restart-btn');
            const settingsBtn = document.getElementById('settings-btn');
            const settingsDropdown = document.getElementById('settings-dropdown');
            const voiceSelect = document.getElementById('voice-select');
            const speedSelect = document.getElementById('speed-select');
            const subtitles = document.getElementById('subtitles');
            const audioPlayer = document.getElementById('audio-player');
            
            // Animation elements
            const teacherContainer = document.getElementById('teacher-container');
                        
            // Educational script content
             const script = ${safeJson(script)};
             const beats = ${safeJson(lesson.beats)};
             ${whiteboardScript}
             const CHARACTERS = ${safeJson(characters)};
             ${characterScript}
             ${avatarMotionScript}
            
            // Store animation references for pause/resume/stop
            let progressAnimations = [];
            let animationTimeouts = [];
            
             // Keep the visual progress bars aligned with the seekable timeline.
             function animateProgress(startTime = 0) {
               stopAllAnimations();
               updateVisualProgress(startTime);
               if (teacherContainer) {
                 teacherContainer.style.animationPlayState = 'running';
               }
             }
            
            // Stop all animations
            function stopAllAnimations() {
              // Clear timeouts
              animationTimeouts.forEach(t => clearTimeout(t));
              animationTimeouts = [];
              
              // Cancel progress animations
              progressAnimations.forEach(anim => {
                if (anim) anim.cancel();
              });
              progressAnimations = [];
              
              // Pause character animations
              if (teacherContainer) {
                teacherContainer.style.animationPlayState = 'paused';
              }
              const cartoonTeacher = document.getElementById('cartoon-teacher');
              if (cartoonTeacher) {
                cartoonTeacher.querySelectorAll('animate, animateTransform').forEach(anim => {
                  anim.endElement();
                });
              }
            }
            
            // Pause all animations
            function pauseAllAnimations() {
              progressAnimations.forEach(anim => {
                if (anim && anim.playState === 'running') anim.pause();
              });
              if (teacherContainer) {
                teacherContainer.style.animationPlayState = 'paused';
              }
            }
            
            // Resume all animations
            function resumeAllAnimations() {
              progressAnimations.forEach(anim => {
                if (anim && anim.playState === 'paused') anim.play();
              });
              if (teacherContainer) {
                teacherContainer.style.animationPlayState = 'running';
              }
            }
            
            // Build caption ranges from the original script. Numbered items are
            // kept as separate ranges without treating "1." as a sentence end.
            const captionSegments = [];
            const paragraphBreak = /\\n\\n+|\\s+(?=\\d+\\.\\s+)/g;
            let paragraphStart = 0;
            let paragraphMatch;
            
            function addCaptionRange(rangeStart, rangeEnd) {
              const rawText = script.slice(rangeStart, rangeEnd);
              const leadingWhitespace = rawText.search(/\\S/);
              if (leadingWhitespace === -1) return;
              
              const text = rawText.trim();
              const start = rangeStart + leadingWhitespace;
              captionSegments.push({
                start,
                end: start + text.length,
                text
              });
            }
            
            function addCaptionBlock(blockStart, blockEnd) {
              const sentenceBreak = /(?<!\\d)(?<=[.!?])\\s+(?=[A-Z0-9"'“])/g;
              let sentenceStart = blockStart;
              let sentenceMatch;
              const blockText = script.slice(blockStart, blockEnd);
              
              while ((sentenceMatch = sentenceBreak.exec(blockText)) !== null) {
                addCaptionRange(sentenceStart, blockStart + sentenceMatch.index);
                sentenceStart = blockStart + sentenceMatch.index + sentenceMatch[0].length;
              }
              
              addCaptionRange(sentenceStart, blockEnd);
            }
            
            while ((paragraphMatch = paragraphBreak.exec(script)) !== null) {
              addCaptionBlock(paragraphStart, paragraphMatch.index);
              paragraphStart = paragraphMatch.index + paragraphMatch[0].length;
            }
            addCaptionBlock(paragraphStart, script.length);

            let currentSentence = 0;
            let playing = false;
            let activeCaption = -1;
            let playbackToken = 0;
            let timelineTimer = null;
            let muted = false;
            let pendingResume = false;
            let scrubTimer = null;
            let activeUtterance = null; // hold a reference so browsers do not garbage-collect it mid-speech
            const SCRIPT_LEN = Math.max(1, script.length);
            const BASE_DURATION = ${timelineDuration};
            const EMBEDDED = window.parent !== window;
            if (EMBEDDED) document.body.classList.add('embedded');

            // Playback state is character based: posChar is how much of the script
            // has been spoken. The timeline, pause/resume and seeking all derive
            // from it, so they stay correct at every speech rate.
            let posChar = 0;        // last position confirmed by the speech engine
            let posStamp = 0;       // performance.now() when posChar was confirmed
            let chunkEndChar = 0;   // end of the chunk currently being spoken
            let voiceRate = 1;      // per-teacher multiplier on the user's speed
            // Characters spoken per second at rate 1.0. Starts as an estimate and
            // self-calibrates from the real voice after each spoken chunk.
            let cpsBase = Math.min(40, Math.max(5, SCRIPT_LEN / BASE_DURATION));

            const timeline = document.getElementById('timeline');
            const timelineTime = document.getElementById('timeline-time');

            // Speak sentence-sized chunks instead of one huge utterance. Long
            // utterances are cut off by Chrome after ~15s and cannot be paused
            // reliably, which is what broke play/pause.
            const speechChunks = [];
            (function buildChunks() {
              const MAX = 200;
              const base = captionSegments.length ? captionSegments : [{ start: 0, end: script.length }];
              base.forEach(function (seg) {
                let s = seg.start;
                while (seg.end - s > MAX) {
                  let cut = script.lastIndexOf(' ', s + MAX);
                  const comma = Math.max(script.lastIndexOf(',', s + MAX), script.lastIndexOf(';', s + MAX));
                  if (comma > s + 80) cut = comma + 1;
                  if (cut <= s + 40) cut = s + MAX;
                  speechChunks.push({ start: s, end: cut });
                  s = cut;
                }
                if (seg.end > s) speechChunks.push({ start: s, end: seg.end });
              });
            })();

            function chunkIndexAt(c) {
              for (let i = 0; i < speechChunks.length; i++) {
                if (c < speechChunks[i].end) return i;
              }
              return speechChunks.length;
            }

            function userSpeed() {
              const v = parseFloat(speedSelect.value);
              return isFinite(v) && v > 0 ? v : 1;
            }
            function refreshVoiceRate() {
              try {
                if (window.pickSpeechVoice) voiceRate = window.pickSpeechVoice().rate || 1;
              } catch (e) { /* keep the previous value */ }
            }
            function totalRate() {
              return Math.min(2.5, Math.max(0.4, userSpeed() * voiceRate));
            }
            function getDuration() {
              return SCRIPT_LEN / (cpsBase * totalRate());
            }
            function clampChar(c) {
              return Math.max(0, Math.min(SCRIPT_LEN, Number(c) || 0));
            }
            function getPosChar() {
              if (!playing) return posChar;
              const est = posChar + ((performance.now() - posStamp) / 1000) * cpsBase * totalRate();
              // never run ahead of the sentence currently being spoken
              return Math.min(est, Math.max(posChar, chunkEndChar - 1));
            }
            function charToTime(c) { return (clampChar(c) / SCRIPT_LEN) * getDuration(); }
            function timeToChar(t) {
              const d = getDuration();
              return Math.round(Math.max(0, Math.min(1, (Number(t) || 0) / d)) * SCRIPT_LEN);
            }
            function getTimelineTime() { return charToTime(getPosChar()); }

            function formatTimelineTime(time) {
              const rounded = Math.max(0, Math.floor(time));
              return Math.floor(rounded / 60) + ':' + String(rounded % 60).padStart(2, '0');
            }
            function captionsOn() { return !document.body.classList.contains('cc-off'); }

            function postState(type, t, dur) {
              if (!EMBEDDED) return;
              window.parent.postMessage({
                source: 'ai-teacher-video',
                type: type || 'timeupdate',
                currentTime: t,
                duration: dur,
                playing: playing || pendingResume,
                speed: userSpeed(),
                muted: muted,
                captions: captionsOn(),
              }, '*');
            }

            function updateTimeline(type) {
              if (!playing) refreshVoiceRate();
              const dur = getDuration();
              const pc = getPosChar();
              const t = (pc / SCRIPT_LEN) * dur;
              timeline.max = String(dur);
              timeline.value = String(t);
              timelineTime.textContent = formatTimelineTime(t) + ' / ' + formatTimelineTime(dur);
              updateVisualProgress(pc);
              postState(type, t, dur);
            }

            function stopTimelineClock() {
              if (timelineTimer !== null) {
                clearInterval(timelineTimer);
                timelineTimer = null;
              }
            }
            function startTimelineClock() {
              stopTimelineClock();
              timelineTimer = setInterval(function () { updateTimeline(); }, 200);
              updateTimeline();
            }

            function updateVisualProgress() {
              // Fallback for voices that never fire boundary events: keep the
              // whiteboard moving from the estimated position.
              if (playing && performance.now() - window.__lastBoardSyncAt > 2500) {
                showBeatAt(Math.floor(getPosChar()));
              }
            }

            function markPos(abs) {
              posChar = abs;
              posStamp = performance.now();
            }

            function calibrate(charCount, seconds) {
              if (charCount < 25 || seconds < 0.5 || seconds > 60) return;
              const measured = charCount / seconds / totalRate();
              cpsBase = Math.min(40, Math.max(5, cpsBase * 0.6 + measured * 0.4));
            }

            // Speak one chunk. Resolves true when it finished, false when it was
            // cancelled. Never hangs: a watchdog and an error fallback keep the
            // lesson moving even when a voice misbehaves.
            function speakChunk(text, absStart, token, estSeconds) {
              return new Promise(function (resolve) {
                let done = false;
                let watchdog = null;
                function finish(ok) {
                  if (done) return;
                  done = true;
                  clearTimeout(watchdog);
                  resolve(ok);
                }
                const mouth = function () {
                  const el = document.getElementById('speechStart');
                  if (el && el.beginElement) el.beginElement();
                };
                const ss = window.speechSynthesis;
                if (!ss) {
                  // No speech support: keep captions and the board moving silently.
                  showSubtitleAt(absStart);
                  mouth();
                  setTimeout(function () { finish(true); }, estSeconds * 1000);
                  return;
                }

                const choice = window.pickSpeechVoice ? window.pickSpeechVoice() : { voice: null, pitch: 1, rate: 1 };
                voiceRate = choice.rate || 1;
                const u = new SpeechSynthesisUtterance(text);
                u.rate = Math.min(2, Math.max(0.5, userSpeed() * voiceRate));
                u.pitch = choice.pitch || 1;
                u.volume = muted ? 0 : 1;
                if (choice.voice) {
                  try {
                    u.voice = choice.voice;
                    if (choice.voice.lang) u.lang = choice.voice.lang;
                  } catch (e) { /* keep the default voice */ }
                }

                u.onstart = function () {
                  if (token !== playbackToken) return;
                  markPos(absStart);
                  mouth();
                  showSubtitleAt(absStart);
                };
                u.onboundary = function (event) {
                  if (token !== playbackToken || typeof event.charIndex !== 'number') return;
                  const abs = absStart + event.charIndex;
                  markPos(abs);
                  mouth();
                  if (window.avatarSpeak) window.avatarSpeak(script, abs);
                  showSubtitleAt(abs);
                };
                u.onend = function () { finish(true); };
                u.onerror = function (event) {
                  const reason = event && event.error;
                  if (reason === 'canceled' || reason === 'interrupted') {
                    finish(false);
                  } else {
                    // The voice failed: carry on silently for this chunk.
                    setTimeout(function () { finish(true); }, estSeconds * 1000);
                  }
                };
                watchdog = setTimeout(function () {
                  // Some engines never fire "end". Only touch the engine if this
                  // chunk is still the current one.
                  if (token === playbackToken) {
                    try { ss.cancel(); } catch (e) { /* ignore */ }
                  }
                  finish(true);
                }, (estSeconds * 2 + 5) * 1000);

                activeUtterance = u;
                ss.speak(u);
              });
            }

// Display a caption segment by its position in the narration.
            function showSubtitle(index) {
              if (index < captionSegments.length) {
                subtitles.textContent = captionSegments[index].text;
                subtitles.classList.add('show');
              } else {
                subtitles.classList.remove('show');
              }
            }

            function showSubtitleAt(charIndex) {
              // Speech told us where we are: move the whiteboard with it.
              window.__lastBoardSyncAt = performance.now();
              showBeatAt(charIndex);
              if (!captionSegments.length) return;
              
              let captionIndex = captionSegments.findIndex((segment) =>
                charIndex >= segment.start && charIndex < segment.end
              );
              
              // Some browsers report a boundary at the final character.
              if (captionIndex === -1 && charIndex >= captionSegments[captionSegments.length - 1].start) {
                captionIndex = captionSegments.length - 1;
              }
              
              if (captionIndex !== -1 && captionIndex !== activeCaption) {
                activeCaption = captionIndex;
                showSubtitle(captionIndex);
              }
            }
            
            // ---- playback control ---------------------------------------------------
            function setButtons(isPlaying) {
              playBtn.classList.toggle('hidden', isPlaying);
              pauseBtn.classList.toggle('hidden', !isPlaying);
            }

            function cancelSpeech() {
              try {
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  // clear a stuck "paused" state left behind by some browsers
                  window.speechSynthesis.resume();
                }
              } catch (e) { /* ignore */ }
            }

            // Begin (or continue) narration from a character position.
            function startNarration(fromChar) {
              clearTimeout(scrubTimer);
              pendingResume = false;
              playbackToken += 1;
              const token = playbackToken;
              cancelSpeech();
              refreshVoiceRate();
              markPos(clampChar(fromChar));
              chunkEndChar = posChar;
              playing = true;
              setButtons(true);
              animateProgress();
              startTimelineClock();
              // Chrome drops a speak() issued immediately after cancel(), so wait a beat.
              setTimeout(function () {
                if (token === playbackToken) runNarration(token);
              }, 80);
            }

            async function runNarration(token) {
              let i = chunkIndexAt(posChar);
              let retries = 0;
              while (i < speechChunks.length) {
                if (token !== playbackToken) return;
                const chunk = speechChunks[i];
                const from = Math.max(chunk.start, posChar);
                if (from >= chunk.end) { i += 1; continue; }

                chunkEndChar = chunk.end;
                const text = script.slice(from, chunk.end);
                const estSeconds = Math.max(1.2, text.length / (cpsBase * totalRate()));
                const startedAt = performance.now();
                const ok = await speakChunk(text, from, token, estSeconds);
                if (token !== playbackToken) return;

                if (!ok) {
                  // Unexpected cancel (not ours): retry this chunk, then move on.
                  retries += 1;
                  if (retries > 2) { markPos(chunk.end); i += 1; retries = 0; }
                  continue;
                }
                retries = 0;
                calibrate(text.length, (performance.now() - startedAt) / 1000);
                markPos(chunk.end);
                i += 1;
              }
              if (token === playbackToken) endPresentation();
            }

            function playFromCurrent() {
              if (playing) return;
              startNarration(posChar >= SCRIPT_LEN - 1 ? 0 : posChar);
            }

            // Pause = stop speaking and remember the position. (speechSynthesis.pause()
            // is unreliable: it is ignored on Android and sticks on desktop Chrome.)
            function pauseVideo() {
              if (!playing) return;
              clearTimeout(scrubTimer);
              pendingResume = false;
              playbackToken += 1;
              playing = false;
              stopTimelineClock();
              cancelSpeech();
              pauseAllAnimations();
              setButtons(false);
              updateTimeline();
            }

            function resumeVideo() {
              playFromCurrent();
            }

            function endPresentation() {
              clearTimeout(scrubTimer);
              pendingResume = false;
              playbackToken += 1;
              playing = false;
              stopTimelineClock();
              posChar = SCRIPT_LEN;
              setButtons(false);
              subtitles.classList.remove('show');
              stopAllAnimations();
              showBeatAt(script.length);
              cancelSpeech();
              updateTimeline();
            }

            function restartVideo() {
              startNarration(0);
            }

            // Jump to a point on the timeline. While dragging, the voice restarts
            // only once the slider settles so it does not stutter.
            function seekVideo(time, resumeAfterSeek) {
              const shouldResume = (resumeAfterSeek === undefined ? (playing || pendingResume) : Boolean(resumeAfterSeek));
              const target = timeToChar(time);
              clearTimeout(scrubTimer);
              playbackToken += 1;
              cancelSpeech();
              stopTimelineClock();
              stopAllAnimations();
              playing = false;
              markPos(target);
              activeCaption = -1;
              showSubtitleAt(target);

              if (shouldResume && target < SCRIPT_LEN - 1) {
                pendingResume = true;
                updateTimeline();
                scrubTimer = setTimeout(function () { startNarration(posChar); }, 250);
              } else {
                pendingResume = false;
                setButtons(false);
                updateTimeline();
              }
            }

            // Speed / volume changes take effect right away, from the current word.
            function applySpeed(value) {
              const v = Number(value);
              const exists = Array.prototype.some.call(speedSelect.options, function (o) { return Number(o.value) === v; });
              if (exists) speedSelect.value = String(v);
              refreshVoiceRate();
              if (playing) startNarration(posChar); else updateTimeline();
            }
            function setMuted(value) {
              muted = Boolean(value);
              if (playing) startNarration(posChar); else updateTimeline();
            }

            // ---- UI wiring --------------------------------------------------------
            settingsBtn.addEventListener('click', () => {
              settingsDropdown.classList.toggle('show');
            });

            // Close settings when clicking elsewhere
            document.addEventListener('click', (e) => {
              if (!settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
                settingsDropdown.classList.remove('show');
              }
            });

            voiceSelect.addEventListener('change', () => {
              refreshVoiceRate();
              if (playing) startNarration(posChar); else updateTimeline();
            });
            speedSelect.addEventListener('change', () => applySpeed(userSpeed()));

            playBtn.addEventListener('click', playFromCurrent);
            pauseBtn.addEventListener('click', pauseVideo);
            restartBtn.addEventListener('click', restartVideo);
            timeline.addEventListener('input', () => seekVideo(Number(timeline.value)));

            // Fullscreen button for the standalone (downloaded) copy. When embedded,
            // the host page owns fullscreen so its controls stay visible.
            const fsBtn = document.getElementById('fs-btn');
            if (fsBtn) {
              fsBtn.addEventListener('click', () => {
                if (EMBEDDED) {
                  // Ask the host page to fullscreen the whole player; the lesson
                  // (and these controls) fill it, so nothing disappears.
                  window.parent.postMessage({ source: 'ai-teacher-video', type: 'toggle-fullscreen' }, '*');
                } else if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              });
            }

            window.addEventListener('message', (event) => {
              if (event.source !== window.parent || event.data?.source !== 'ai-teacher-player') {
                return;
              }
              const msg = event.data;
              if (msg.type === 'play') {
                playFromCurrent();
              } else if (msg.type === 'pause') {
                pauseVideo();
              } else if (msg.type === 'restart') {
                restartVideo();
              } else if (msg.type === 'seek') {
                seekVideo(msg.time, Boolean(msg.resume));
              } else if (msg.type === 'set-speed') {
                applySpeed(msg.speed);
              } else if (msg.type === 'set-muted') {
                setMuted(msg.muted);
              } else if (msg.type === 'toggle-captions') {
                const cc = document.getElementById('cc-btn');
                if (cc) cc.click();
                updateTimeline('state');
              } else if (msg.type === 'toggle-settings') {
                settingsDropdown.classList.toggle('show');
              } else if (msg.type === 'get-state') {
                updateTimeline('state');
              }
            });

            // Load voice options when they are available
            if (window.speechSynthesis) {
              if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = () => {
                  populateVoiceList();
                  refreshVoiceRate();
                  updateTimeline('state');
                };
              }
              // Initial population
              setTimeout(() => {
                populateVoiceList();
                refreshVoiceRate();
                updateTimeline('state');
              }, 100);
            }

            refreshVoiceRate();
            updateTimeline('ready');

            
// Auto-start with a slight delay (can be disabled for better user control)
            /* setTimeout(() => {
              playEducationalVideo();
            }, 1000); */
          </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      if (req.query.download) {
        // Offer the lesson as a self-contained, playable .html file.
        const fileName = (videoTitle || 'lesson').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'lesson';
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}.html"`);
      }
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving video stream:', error);
      res.status(500).send('Error generating video content');
    }
  });
  
  // Video thumbnail endpoint
  app.get('/api/videos/thumbnail/:id', async (req: Request, res: Response) => {
    try {
      const externalUserId = getAuthenticatedUserId(req);
      if (!externalUserId) {
        return res.status(401).send('Sign in to view this explanation');
      }

      // Get video data if available
      const videoId = req.params.id;
      let videoTitle = "Educational Explanation";
      let searchQuery = "";
      
      try {
        const userId = await storage.getLocalUserId(externalUserId);
        const videoData = await storage.getVideosByUserId(userId);
        const video = videoData.find((v) => 
          (v.videoUrl && v.videoUrl.includes(videoId)) || 
          (v.thumbnailUrl && v.thumbnailUrl.includes(videoId))
        );
        if (video) {
          videoTitle = video.title;
          searchQuery = video.searchQuery;
        }
      } catch (e) {
        console.log('Could not get video data for thumbnail:', e);
      }
      
      // Generate a more detailed static thumbnail SVG matching the teacher design
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
          <defs>
            <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#e0eafc" />
              <stop offset="100%" stop-color="#cfdef3" />
            </linearGradient>
            <radialGradient id="teacher-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.1" />
            </radialGradient>
          </defs>
          
          <!-- Background -->
          <rect width="320" height="180" fill="url(#bg-grad)"/>
          
          <!-- Teacher background glow -->
          <circle cx="100" cy="90" r="60" fill="url(#teacher-glow)"/>
          
          <!-- Teacher character (simplified) -->
          <g transform="translate(100, 90) scale(0.6)">
            <!-- Head -->
            <circle cx="0" cy="-40" r="50" fill="#FFD8B4"/>
            
            <!-- Hair -->
            <path d="M-45,-50 Q-20,-90 0,-90 Q20,-90 45,-50 Z" fill="#654321" />
            
            <!-- Glasses -->
            <circle cx="-20" cy="-40" r="15" stroke="#333" stroke-width="2" fill="transparent" />
            <circle cx="20" cy="-40" r="15" stroke="#333" stroke-width="2" fill="transparent" />
            <line x1="-5" y1="-40" x2="5" y2="-40" stroke="#333" stroke-width="2" />
            
            <!-- Eyes -->
            <circle cx="-20" cy="-40" r="5" fill="#000" />
            <circle cx="20" cy="-40" r="5" fill="#000" />
            
            <!-- Smile -->
            <path d="M-20,-15 Q0,5 20,-15" fill="transparent" stroke="#333" stroke-width="2" />
            
            <!-- Body/Shirt -->
            <path d="M-60,100 L-40,0 Q-20,-10 0,-10 Q20,-10 40,0 L60,100 Z" fill="#3B82F6" />
            <rect x="-40" y="0" width="80" height="20" fill="#3B82F6" />
          </g>
          
          <!-- Content preview -->
          <g transform="translate(210, 90)">
            <!-- Topic title -->
            <rect x="-80" y="-40" width="160" height="80" rx="5" fill="white" stroke="#ddd" stroke-width="1" />
            <text x="0" y="-20" font-family="Arial" font-size="10" text-anchor="middle" fill="#555">
              Learning about:
            </text>
            <text x="0" y="0" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="#333">
              ${searchQuery || "Educational Topics"}
            </text>
            
            <!-- Play button indicator -->
            <circle cx="0" cy="25" r="15" fill="#3B82F6" />
            <path d="M-5,18 L8,25 L-5,32 Z" fill="white" />
          </g>
          
          <!-- Title overlay at bottom -->
          <rect x="0" y="145" width="320" height="35" fill="rgba(0,0,0,0.5)" />
          <text x="160" y="165" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="white">
            ${videoTitle}
          </text>
        </svg>
      `;
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgContent);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      res.status(500).json({ message: 'Error generating thumbnail' });
    }
  });
  
  // Get video by ID with references - This must come AFTER the more specific /stream/ route
  app.get('/api/videos/:id', async (req: Request, res: Response) => {
    try {
      const externalUserId = getAuthenticatedUserId(req);
      if (!externalUserId) {
        return res.status(401).json({ message: 'Sign in to view this explanation' });
      }

      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const userId = await storage.getLocalUserId(externalUserId);
      if (video.userId !== userId) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      const references = await storage.getReferencesForVideo(id);
      
      res.json({ video: publicVideo(video), references });
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ message: 'Error fetching video' });
    }
  });

  return httpServer;
}
