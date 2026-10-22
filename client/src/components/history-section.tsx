import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface HistoryVideo {
  id: number;
  title: string;
  createdAt: string;
  duration: number;
  thumbnailUrl: string | null;
  videoUrl: string;
}

interface HistorySectionProps {
  recentVideos: HistoryVideo[];
  isLoading: boolean;
}

export default function HistorySection({
  recentVideos,
  isLoading,
}: HistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const allVideosQuery = useQuery<{ videos: HistoryVideo[] }>({
    queryKey: ['/api/videos'],
    enabled: false,
  });

  const displayedVideos = isExpanded
    ? allVideosQuery.data?.videos ?? []
    : recentVideos;
  const isDisplayingLoadingState =
    isExpanded ? allVideosQuery.isFetching : isLoading;

  const toggleExpanded = () => {
    if (!isExpanded) {
      void allVideosQuery.refetch();
    }
    setIsExpanded((expanded) => !expanded);
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isExpanded ? 'All Explanations' : 'Recent Explanations'}
        </h2>
        {(recentVideos.length > 0 || isExpanded) && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="text-primary hover:text-primary/80 text-sm flex items-center"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'View less' : 'View all'}
            <span className="material-icons text-sm ml-1">
              {isExpanded ? 'expand_less' : 'arrow_forward'}
            </span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isDisplayingLoadingState ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative" style={{ aspectRatio: '16/9' }}>
                <Skeleton className="w-full h-full" />
              </div>
              <CardContent className="p-3">
                <Skeleton className="h-5 w-4/5 mb-2" />
                <Skeleton className="h-4 w-2/5" />
              </CardContent>
            </Card>
          ))
        ) : isExpanded && allVideosQuery.isError ? (
          <div role="alert" className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
            Could not load your video history. Please try again.
          </div>
        ) : displayedVideos.length > 0 ? (
          // Actual video cards
          displayedVideos.map((video) => (
            <a 
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              key={video.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative" style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="material-icons text-gray-400 text-4xl">movie</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-all">
                    <span className="material-icons text-primary">play_arrow</span>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 mb-1">{video.title}</h3>
                <p className="text-gray-500 text-sm">Generated on {formatDate(video.createdAt)}</p>
              </div>
            </a>
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow-sm">
            <span className="material-icons text-gray-400 text-4xl mb-2">video_library</span>
            <p className="text-gray-600">No video explanations yet. Try asking a question!</p>
          </div>
        )}
      </div>
    </section>
  );
}
