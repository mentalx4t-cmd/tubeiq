import { reauthorizeWithYouTube } from './authService';

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function authenticatedFetch(url: string, accessToken: string, options: RequestInit = {}): Promise<Response> {
  let token = accessToken;
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("401 AUTH_REQUIRED");
  }

  return response;
}

export async function fetchChannelStats(accessToken: string) {
  const cacheKey = `channelStats_${accessToken}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await authenticatedFetch(`${YOUTUBE_API_BASE}/channels?part=snippet,statistics,contentDetails&mine=true`, accessToken);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch channel stats: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const data = await response.json();
  const result = data.items[0];
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function fetchRecentVideos(accessToken: string, channelId: string) {
  const cacheKey = `recentVideos_${channelId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const searchResponse = await authenticatedFetch(`${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=5`, accessToken);
  if (!searchResponse.ok) {
    const errorBody = await searchResponse.json().catch(() => ({}));
    throw new Error(`Failed to fetch recent videos: ${searchResponse.status} ${JSON.stringify(errorBody)}`);
  }
  const searchData = await searchResponse.json();
  const videoIds = searchData.items.map((v: any) => v.id.videoId).join(',');
  
  if (!videoIds) return [];

  const statsResponse = await authenticatedFetch(`${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoIds}`, accessToken);
  const statsData = await statsResponse.json();
  const result = statsData.items;
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function searchKeywords(accessToken: string, query: string) {
  const response = await authenticatedFetch(`${YOUTUBE_API_BASE}/search?part=snippet&q=${query}&type=video&maxResults=10`, accessToken);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch search results: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const data = await response.json();
  
  // For each video, get more stats
  const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
  const statsResponse = await authenticatedFetch(`${YOUTUBE_API_BASE}/videos?part=statistics,snippet&id=${videoIds}`, accessToken);
  const statsData = await statsResponse.json();
  return statsData.items;
}

export async function fetchTrendingVideos(accessToken: string, regionCode: string = "US", videoCategoryId: string = "0") {
  const url = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}${videoCategoryId !== '0' ? `&videoCategoryId=${videoCategoryId}` : ''}&maxResults=20`;
  
  const response = await authenticatedFetch(url, accessToken);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch trending videos: ${response.status} ${JSON.stringify(errorBody)}`);
  }
  const data = await response.json();
  return data.items;
}

export async function fetchVideoDetails(accessToken: string, videoId: string) {
  const response = await authenticatedFetch(`${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoId}`, accessToken);
  if (!response.ok) throw new Error("Failed to fetch video details");
  const data = await response.json();
  return data.items[0];
}

export async function fetchPlaylists(accessToken: string) {
  const response = await authenticatedFetch(`${YOUTUBE_API_BASE}/playlists?part=snippet&mine=true&maxResults=50`, accessToken);
  if (!response.ok) return [];
  const data = await response.json();
  return data.items;
}

export async function fetchCategories(accessToken: string, regionCode: string = "US") {
  const response = await authenticatedFetch(`${YOUTUBE_API_BASE}/videoCategories?part=snippet&regionCode=${regionCode}`, accessToken);
  if (!response.ok) return [];
  const data = await response.json();
  return data.items;
}

export async function uploadVideo(accessToken: string, file: File, metadata: any) {
  // This is a resumable upload implementation
  const snippet: any = {
    title: metadata.title,
    description: metadata.description,
    tags: metadata.tags,
    categoryId: metadata.categoryId || "22", // Default to People & Blogs
  };
  
  if (metadata.locationDescription) {
    // Note: location requires more than just string in a real production app (lat/long)
    // For this scope, we stick to snippet basics
  }

  const status = {
    privacyStatus: metadata.privacyStatus || "private",
    selfDeclaredMadeForKids: metadata.madeForKids || false,
  };

  const uploadMetadata = {
    snippet,
    status
  };

  const url = `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`;
  
  const res = await authenticatedFetch(url, accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Upload-Content-Length': file.size.toString(),
      'X-Upload-Content-Type': file.type,
    },
    body: JSON.stringify(uploadMetadata)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to initiate upload: ${JSON.stringify(err)}`);
  }
  
  const uploadUrl = res.headers.get('Location');
  if (!uploadUrl) throw new Error("No upload URL returned");

  // Step 2: Push the file
  const pushRes = await authenticatedFetch(uploadUrl, accessToken, {
    method: 'PUT',
    body: file
  });

  if (!pushRes.ok) {
    const err = await pushRes.json().catch(() => ({}));
    throw new Error(`Failed to upload file content: ${JSON.stringify(err)}`);
  }

  const videoResource = await pushRes.json();

  // Step 3: Add to playlist if specified
  if (metadata.playlistId && videoResource.id) {
    await authenticatedFetch(`${YOUTUBE_API_BASE}/playlistItems?part=snippet`, accessToken, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          playlistId: metadata.playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoResource.id
          }
        }
      })
    });
  }

  return videoResource;
}
