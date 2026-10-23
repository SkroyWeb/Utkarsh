import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import SearchSection from "@/components/search-section";
import VideoSection from "@/components/video-section";
import HistorySection from "@/components/history-section";
import FeaturesSection from "@/components/features-section";
import Footer from "@/components/footer";
import { useAuth } from "@clerk/react";

interface PopularTopicsResponse {
  topics: string[];
}

interface RecentVideosResponse {
  videos: Array<{
    id: number;
    title: string;
    description: string | null;
    duration: number;
    createdAt: string;
    userId: number | null;
    videoUrl: string;
    thumbnailUrl: string | null;
    searchQuery: string;
  }>;
}

export default function Home() {
  const { isSignedIn } = useAuth();
  // Fetch recent videos on page load
  const recentVideosQuery = useQuery<RecentVideosResponse>({
    queryKey: ['/api/videos/recent'],
  });

  // Fetch popular topics on page load
  const popularTopicsQuery = useQuery<PopularTopicsResponse>({
    queryKey: ['/api/topics/popular'],
  });

  return (
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Header />
        <SearchSection 
          popularTopics={popularTopicsQuery.data?.topics || []} 
          isLoading={popularTopicsQuery.isLoading}
          isAuthenticated={isSignedIn === true}
        />
        <VideoSection />
        <HistorySection 
          recentVideos={recentVideosQuery.data?.videos || []} 
          isLoading={recentVideosQuery.isLoading}
        />
        <FeaturesSection />
      </div>
      <Footer />
    </div>
  );
}