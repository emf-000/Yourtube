import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SearchResult = ({ query }: any) => {
  if (!query.trim()) {
    return (
      <div className="text-center py-10 sm:py-12">
        <p className="text-sm sm:text-base text-gray-600">
          Enter a search term to find videos and channels.
        </p>
      </div>
    );
  }

  const [video, setvideos] = useState<any>(null);

  const videos = async () => {
    const allVideos = [
      {
        _id: "1",
        videotitle: "Amazing Nature Documentary",
        videochanel: "Nature Channel",
        views: 45000,
        uploader: "nature_lover",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        videotitle: "Cooking Tutorial: Perfect Pasta",
        videochanel: "Chef's Kitchen",
        views: 23000,
        uploader: "chef_master",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    let results = allVideos.filter(
      (vid) =>
        vid.videotitle.toLowerCase().includes(query.toLowerCase()) ||
        vid.videochanel.toLowerCase().includes(query.toLowerCase())
    );

    setvideos(results);
  };

  useEffect(() => {
    videos();
  }, [query]);

  if (!video || video.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          No results found
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }

  const vids = "/video/vdo.mp4";

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="space-y-4">
        {video.map((video: any) => (
          <div
            key={video._id}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 group"
          >
            <Link href={`/watch/${video._id}`} className="flex-shrink-0">
              <div className="relative w-full sm:w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video
                  src={vids}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] sm:text-xs px-1 rounded">
                  10:24
                </div>
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0 py-1">
              <Link href={`/watch/${video._id}`}>
                <h3 className="font-medium text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 mb-1 sm:mb-2">
                  {video.videotitle}
                </h3>
              </Link>

              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                <span>{video.views.toLocaleString()} views</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(video.createdAt))} ago
                </span>
              </div>

              <Link
                href={`/channel/${video.uploader}`}
                className="flex items-center gap-2 mb-2 hover:text-blue-600"
              >
                <Avatar className="w-5 h-5 sm:w-6 sm:h-6">
                  <AvatarFallback className="text-[10px] sm:text-xs">
                    {video.videochanel[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm text-gray-600">
                  {video.videochanel}
                </span>
              </Link>

              <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                Sample video description that would show search-relevant
                content and help users understand what the video is about
                before clicking.
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-6 sm:py-8">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing {video.length} results for "{query}"
        </p>
      </div>
    </div>
  );
};

export default SearchResult;
