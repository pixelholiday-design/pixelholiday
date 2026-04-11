const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getInstagramAuthUrl(state: string): string {
  const redirectUri = `${APP_URL}/api/auth/instagram/callback`;
  return `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;
}

export async function exchangeCodeForToken(code: string): Promise<{ accessToken: string; userId: string }> {
  const redirectUri = `${APP_URL}/api/auth/instagram/callback`;

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      client_secret: INSTAGRAM_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  const data = await res.json();
  if (data.error_message) throw new Error(data.error_message);

  // Exchange short-lived for long-lived token
  const longRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${data.access_token}`,
  );
  const longData = await longRes.json();

  return {
    accessToken: longData.access_token || data.access_token,
    userId: String(data.user_id),
  };
}

export type InstagramPost = {
  id: string;
  caption?: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
  thumbnailUrl?: string;
};

export async function fetchUserMedia(accessToken: string, limit = 12): Promise<InstagramPost[]> {
  const res = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url&limit=${limit}&access_token=${accessToken}`,
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return (data.data || []).map((p: any) => ({
    id: p.id,
    caption: p.caption,
    mediaType: p.media_type,
    mediaUrl: p.media_url,
    permalink: p.permalink,
    timestamp: p.timestamp,
    thumbnailUrl: p.thumbnail_url,
  }));
}

export async function refreshToken(accessToken: string): Promise<string> {
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`,
  );
  const data = await res.json();
  return data.access_token || accessToken;
}
