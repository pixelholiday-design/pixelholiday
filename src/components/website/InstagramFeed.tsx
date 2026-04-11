"use client";

import { useEffect, useState } from "react";
import { Camera, ExternalLink } from "lucide-react";

type Post = {
  id: string;
  caption?: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  thumbnailUrl?: string;
};

interface Props {
  username?: string;
}

export default function InstagramFeed({ username }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/integrations/instagram")
      .then((r) => r.json())
      .then((d) => {
        if (d.connected && d.posts) setPosts(d.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-cream-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Camera className="h-5 w-5 text-pink-500" />
        <h3 className="font-semibold text-navy-800">
          {username ? `@${username}` : "Instagram"}
        </h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-lg overflow-hidden"
          >
            <img
              src={post.mediaType === "VIDEO" ? post.thumbnailUrl || post.mediaUrl : post.mediaUrl}
              alt={post.caption?.slice(0, 60) || "Instagram post"}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
