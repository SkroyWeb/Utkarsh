import React, { useState, useEffect } from 'react';
import TeacherAvatar from './teacher-avatar';
import VideoPlayer from './video-player';
import { useVideoGenerator } from '@/hooks/use-video-generator';

interface Reference {
  id: number;
  videoId: number;
  title: string;
  url: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  duration: number; // in seconds
  createdAt: string;
  userId: number;
  videoUrl: string;
  thumbnailUrl: string;
  searchQuery: string;
}

export default function VideoSection() {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  
  const { generateVideo, isGenerating, progress } = useVideoGenerator();

  useEffect(() => {
    // Listen for the videoGenerated event from the search section
    const handleVideoGenerated = (event: CustomEvent<{ video: Video, references: Reference[] }>) => {
      setVideoGenerating(true);
      
      // Start the client-side video generation process
      generateVideo(event.detail.video).then(() => {
        setCurrentVideo(event.detail.video);
        setReferences(event.detail.references);
        setVideoGenerating(false);
        setVideoGenerated(true);
      });
    };

    window.addEventListener('videoGenerated', handleVideoGenerated as EventListener);
    return () => {
      window.removeEventListener('videoGenerated', handleVideoGenerated as EventListener);
    };
  }, [generateVideo]);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="mb-10">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Video Display Area */}
        <div className="relative w-full" style={{ aspectRatio: '16/9', maxHeight: '85vh' }}>
          {videoGenerated ? (
            <VideoPlayer videoUrl={currentVideo?.videoUrl || ''} />
          ) : (
            <TeacherAvatar />
          )}
        </div>

        {/* Video Controls and Information */}
        <div className="p-4 border-t border-gray-200">
          {/* Video Generating State */}
          {videoGenerating && (
            <div>
              <div className="flex items-center mb-3">
                <div className="animate-spin mr-3">
                  <span className="material-icons text-primary">autorenew</span>
                </div>
                <h3 className="font-medium text-gray-800">Generating video explanation...</h3>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-primary h-2.5 rounded-full animate-pulse"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Creating visuals and narration</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
          
          {/* Video Controls (shown when video is generated) */}
          {videoGenerated && currentVideo && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg text-gray-800 mb-1">{currentVideo.title}</h3>
                  <p className="text-gray-600 text-sm">
                    Generated on {formatDate(currentVideo.createdAt)} • {formatDuration(currentVideo.duration)} mins
                  </p>
                </div>
                <div className="flex space-x-2 mt-3 md:mt-0">
                  <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 flex items-center text-sm transition-colors">
                    <span className="material-icons text-sm mr-1">share</span>
                    Share
                  </button>
                  <a 
                    href={currentVideo.videoUrl}
                    download={`${currentVideo.title.replace(/\s+/g, '_')}.mp4`}
                    className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white flex items-center text-sm transition-colors"
                  >
                    <span className="material-icons text-sm mr-1">download</span>
                    Download
                  </a>
                </div>
              </div>
              
              {references.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">References</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {references.map((ref) => (
                      <div key={ref.id}>
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {ref.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Default State */}
          {!videoGenerating && !videoGenerated && (
            <div>
              <p className="text-center text-gray-600">Enter a topic or question above to generate a video explanation</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
