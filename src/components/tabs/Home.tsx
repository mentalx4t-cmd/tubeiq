import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Video, Eye, Calendar, AlertCircle, MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';
import { fetchChannelStats, fetchRecentVideos } from '../../services/youtubeService';
import { cn, formatCompactNumber } from '../../lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface HomeProps {
  accessToken: string;
}

async function fetchWeeklyAnalytics(accessToken: string, channelId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${fmt(startDate)}&endDate=${fmt(endDate)}&metrics=views,likes,estimatedMinutesWatched&dimensions=day&sort=day`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  const data = await response.json();

  return data.rows?.map((row: any[]) => {
    const date = new Date(row[0]);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day,
      views: row[1] || 0,
      likes: row[2] || 0,
      watchTime: Math.round((row[3] || 0) / 60),
    };
  }) || [];
}

export function Home({ accessToken }: HomeProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'views' | 'likes' | 'watchTime'>('views');

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

        try {
          const analytics = await fetchWeeklyAnalytics(accessToken, channelData.id);
          setWeeklyData(analytics);
        } catch (e) {
          console.error('Analytics fetch failed:', e);
          setAnalyticsError(true);
        }

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
              href="https://console.developers.google.com/apis/api/youtube.googleapis.com/overview"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-all"
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

  const metricLabels = {
    views: 'Views',
    likes: 'Likes',
    watchTime: 'Watch Time (hrs)',
  };

  const metricColors = {
    views: '#2563EB',
    likes: '#8B5CF6',
    watchTime: '#10B981',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Profile Header with Stats inside */}
      <div className="bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25" />
            <img
              src={snippet?.thumbnails?.high?.url}
              alt="Channel Avatar"
              className="relative w-24 h-24 rounded-full border-4 border-[#15161D] object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-white mb-1">{snippet?.title}</h1>
            <p className="text-blue-400 font-medium">
              @{snippet?.customUrl || snippet?.title?.toLowerCase().replace(/\s+/g, '').replace(/^@/, '')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Analytics Chart */}
      <div className="bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">This Week</h2>
              <p className="text-gray-500 text-xs">
                {analyticsError ? 'Analytics unavailable' : 'Real daily performance'}
              </p>
            </div>
          </div>
          {!analyticsError && (
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
              {(['views', 'likes', 'watchTime'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeMetric === metric
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {metricLabels[metric]}
                </button>
              ))}
            </div>
          )}
        </div>

        {analyticsError ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            Could not load analytics. Make sure YouTube Analytics API is enabled and you are signed in with the channel owner account.
          </div>
        ) : weeklyData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            No data available for this week yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricColors[activeMetric]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metricColors[activeMetric]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip
                contentStyle={{
                  background: '#15161D',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#E2E8F0',
                  fontSize: 13,
                }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                formatter={(value: any) => [value.toLocaleString(), metricLabels[activeMetric]]}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metricColors[activeMetric]}
                strokeWidth={2.5}
                fill="url(#colorMetric)"
                dot={{ fill: metricColors[activeMetric], r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

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
                    <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                      {video.snippet.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(video.snippet.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
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
