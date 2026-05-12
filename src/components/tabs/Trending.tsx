import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Globe, ListFilter, Eye, ThumbsUp, MessageSquare, ExternalLink, Play } from 'lucide-react';
import { fetchTrendingVideos } from '../../services/youtubeService';
import { formatCompactNumber, cn } from '../../lib/utils';

interface TrendingProps {
  accessToken: string;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'BR', name: 'Brazil' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'AU', name: 'Australia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'RU', name: 'Russia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'UAE' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'PH', name: 'Philippines' },
];

const CATEGORIES = [
  { id: '0', name: 'All Categories' },
  { id: '20', name: 'Gaming' },
  { id: '10', name: 'Music' },
  { id: '17', name: 'Sports' },
  { id: '28', name: 'Tech' },
  { id: '1', name: 'Film & Animation' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
];

export function Trending({ accessToken }: TrendingProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('US');
  const [category, setCategory] = useState('0');
  const [error, setError] = useState<string | null>(null);

  const loadTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrendingVideos(accessToken, country, category);
      setVideos(data);
    } catch (err: any) {
      setError("Failed to load trending videos. The API might be restricted or disabled.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrending();
  }, [country, category]);

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Filters */}
      <div className="bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              Global Trending
            </h2>
            <p className="text-gray-400 text-sm">Discover what the world is watching right now.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all">
              <Globe className="w-5 h-5 text-gray-400" />
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="bg-transparent text-white outline-none font-bold text-sm cursor-pointer"
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-[#15161D]">{c.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all">
              <ListFilter className="w-5 h-5 text-gray-400" />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-white outline-none font-bold text-sm cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-[#15161D]">{c.name}</option>)}
              </select>
            </div>
            
            <button 
              onClick={loadTrending}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-lg shadow-blue-900/20"
            >
              <motion.div whileTap={{ rotate: 180 }}>
                <TrendingUp className="w-5 h-5 text-white" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-[3rem] text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button onClick={loadTrending} className="mt-4 text-white underline underline-offset-4">Try again</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-[#15161D] aspect-video rounded-[2.5rem] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, i) => (
            <motion.div 
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openVideo(video.id)}
              className="bg-[#15161D] rounded-[2.5rem] border border-white/5 overflow-hidden group cursor-pointer hover:border-blue-500/30 hover:scale-[1.02] transition-all shadow-xl"
            >
              <div className="relative aspect-video">
                <img 
                  src={video.snippet.thumbnails.high.url} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={video.snippet.title} 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-blue-600 font-black text-xs text-white w-8 h-8 flex items-center justify-center rounded-2xl shadow-xl">
                  #{i + 1}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-white font-bold leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">
                    {video.snippet.title}
                  </h3>
                  <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em]">
                    {video.snippet.channelTitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Views</span>
                        <span className="text-xs text-white font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          {formatCompactNumber(Number(video.statistics.viewCount))}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Likes</span>
                        <span className="text-xs text-white font-bold flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                          {formatCompactNumber(Number(video.statistics.likeCount))}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Comments</span>
                        <span className="text-xs text-white font-bold flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                          {formatCompactNumber(Number(video.statistics.commentCount))}
                        </span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
