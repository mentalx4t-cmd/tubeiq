import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Video, Eye, Calendar, Sparkles, TrendingUp, AlertCircle, MessageSquare, ThumbsUp } from 'lucide-react';
import { fetchChannelStats, fetchRecentVideos } from '../../services/youtubeService';
import { cn, formatCompactNumber } from '../../lib/utils';

interface HomeProps {
  accessToken: string;
}

export function Home({ accessToken }: HomeProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  useEffect(() => {
    async function loadData() {
      if (!accessToken) return;
      setLoading(true);
      setError(null);
      try {
        const channelData = await fetchChannelStats(accessToken);
        if (!channelData) {
          setError("No YouTube channel found for this account. Please create a channel first.");
          return;
        }
        setStats(channelData);
        const videos = await fetchRecentVideos(accessToken, channelData.id);
        setRecentVideos(videos);
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || "Failed to fetch YouTube data. Check your connection or permissions.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [accessToken]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-white/5 rounded-3xl" />
      ))}
    </div>
  );

  if (error) {
    const isApiDisabled = error.includes("SERVICE_DISABLED") || error.includes("accessNotConfigured");
    const isUnauthorized = error.includes("401");
    
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          {isApiDisabled 
            ? "YouTube API Disabled" 
            : isUnauthorized 
              ? "Session Expired" 
              : error.includes("quotaExceeded") 
                ? "API Quota Exceeded" 
                : "Data Fetch Error"}
        </h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          {isApiDisabled 
            ? "The YouTube Data API is not enabled for this project. Please click the button below to enable it in your Google Cloud Console, then refresh this page."
            : isUnauthorized
              ? "Your session has expired. Please re-connect your YouTube account."
              : error.includes("quotaExceeded")
                ? "You have reached the daily API quota limit for YouTube. Please wait until your quota resets, typically within 24 hours, or request a quota increase in the Google Cloud Console."
                : error}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isApiDisabled && (
            <a 
              href="https://console.developers.google.com/apis/api/youtube.googleapis.com/overview?project=458534704064"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-blue-900/20"
            >
              Enable YouTube API
            </a>
          )}
          {isUnauthorized && (
             <button 
              onClick={() => {
                localStorage.removeItem('yt_access_token');
                window.location.reload();
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-all"
            >
              Reconnect YouTube
            </button>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const channelStats = stats?.statistics;
  const snippet = stats?.snippet;

  const statCards = [
    { label: 'Subscribers', value: formatCompactNumber(Number(channelStats?.subscriberCount || 0)), icon: Users, color: 'text-purple-400' },
    { label: 'Total Videos', value: channelStats?.videoCount || '0', icon: Video, color: 'text-blue-400' },
    { label: 'Total Views', value: formatCompactNumber(Number(channelStats?.viewCount || 0)), icon: Eye, color: 'text-emerald-400' },
    { label: 'Channel Since', value: new Date(snippet?.publishedAt).getFullYear().toString() || 'N/A', icon: Calendar, color: 'text-orange-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Profile Header */}
      <div className="bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25" />
          <img 
            src={snippet?.thumbnails?.high?.url} 
            alt="Channel Avatar" 
            className="relative w-32 h-32 rounded-full border-4 border-[#15161D] object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-white mb-2">{snippet?.title}</h1>
          <p className="text-blue-400 font-medium mb-4">@{snippet?.customUrl || snippet?.title?.toLowerCase().replace(/\s+/g, '')}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              TOP 1% CHANNEL
            </span>
            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              GROWING FAST
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#15161D] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
              <div className={cn("p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Action Button */}
      <button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[1px] rounded-3xl group shadow-xl shadow-blue-900/20">
        <div className="bg-[#15161D] group-hover:bg-transparent transition-colors p-6 rounded-[calc(1.5rem-1px)] flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Upload & Optimize with AI
          </span>
        </div>
      </button>

      {/* Recent Uploads */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] px-4">Recent Uploads</h2>
        <div className="bg-[#15161D] rounded-3xl border border-white/5 overflow-hidden">
          {recentVideos.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recentVideos.map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => openVideo(video.id)}
                  className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-6 cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <img 
                      src={video.snippet.thumbnails.medium.url} 
                      alt={video.snippet.title} 
                      className="w-44 h-28 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                      {video.contentDetails?.duration?.replace('PT', '').replace('M', ':').replace('S', '') || '10:00'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">{video.snippet.title}</h3>
                    <p className="text-gray-500 text-sm">{new Date(video.snippet.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                       <span className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                         <Eye className="w-4 h-4 text-emerald-400" /> {formatCompactNumber(Number(video.statistics.viewCount))}
                       </span>
                       <span className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                         <ThumbsUp className="w-4 h-4 text-blue-400" /> {formatCompactNumber(Number(video.statistics.likeCount))}
                       </span>
                       <span className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                         <MessageSquare className="w-4 h-4 text-purple-400" /> {formatCompactNumber(Number(video.statistics.commentCount))}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 italic">No recent uploads found</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
