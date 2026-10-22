import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SearchSectionProps {
  popularTopics: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export default function SearchSection({
  popularTopics,
  isLoading,
  isAuthenticated,
}: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Mutation for web search
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/search", { query });
      return response.json();
    },
    onSuccess: (data) => {
      // Forward the search results to the video generation process
      generateVideoMutation.mutate({
        query: searchQuery,
        searchResults: data.results,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Search failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to search for information",
      });
    },
  });

  // Mutation for video generation
  const generateVideoMutation = useMutation({
    mutationFn: async (data: { query: string; searchResults: any[] }) => {
      const response = await apiRequest("POST", "/api/videos/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Dispatch an event to notify other components about the new video
      const event = new CustomEvent("videoGenerated", { detail: data });
      window.dispatchEvent(event);

      toast({
        title: "Video generated successfully",
        description: `Your explanation about "${searchQuery}" is ready to watch.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Video generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate video explanation",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description:
          "Create an account or sign in to generate and save your explanations.",
      });
      return;
    }

    // Start the search process
    searchMutation.mutate(searchQuery);
  };

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic);
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description:
          "Create an account or sign in to generate and save your explanations.",
      });
      return;
    }
    searchMutation.mutate(topic);
  };

  const isSearching = searchMutation.isPending;

  return (
    <section className="mb-10">
      <div className="bg-white rounded-xl shadow-md p-6">
        <form className="mb-4" onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="What would you like to learn about today?"
              className="w-full pl-5 pr-16 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-full flex items-center transition-colors sm:px-4 sm:rounded-lg"
              disabled={isSearching || !searchQuery.trim()}
            >
              <span className="material-icons text-sm mr-1">search</span>
              <p className="hidden sm:block">Search</p>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 mr-2">Popular topics:</span>
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading topics...</div>
            ) : (
              popularTopics.map((topic, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-700 transition-colors"
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic}
                </button>
              ))
            )}
          </div>
        </form>

        {/* Search Progress */}
        {isSearching && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 flex">
            <div className="w-full">
              <div className="flex items-center mb-2">
                <div className="animate-spin mr-3">
                  <span className="material-icons text-primary">sync</span>
                </div>
                <h3 className="font-medium text-gray-800">
                  Gathering information...
                </h3>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full w-2/3 animate-pulse"></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Searching web resources for "{searchQuery}"...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
