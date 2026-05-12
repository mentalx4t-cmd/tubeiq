import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, BookOpen, BarChart3, Video, Eye, ThumbsUp, MessageSquare, Target, Zap, Rocket, Info, ArrowUpRight, TrendingUp, Filter, Activity, Cpu, Brain, Gauge, Users, Lightbulb } from 'lucide-react';
import { generateContentIdeas, getTopicIdeas, getNicheInsights } from '../../services/aiService';
import { searchKeywords } from '../../services/youtubeService';
import { cn, formatCompactNumber } from '../../lib/utils';

interface ResearchProps {
  accessToken: string;
}

export function Research({ accessToken }: ResearchProps) {
  const [query, setQuery] = useState('');
  const [subTab, setSubTab] = useState<'keywords' | 'topics'>('keywords');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [videoStats, setVideoStats] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResults(null);
    setInsights(null);
    try {
      if (subTab === 'keywords') {
        const [aiResults, ytResults, aiInsights] = await Promise.all([
          generateContentIdeas(query),
          searchKeywords(accessToken, query),
          getNicheInsights(query)
        ]);
        setResults(aiResults);
        setVideoStats(ytResults);
        setInsights(aiInsights);
      } else if (subTab === 'topics') {
        const topics = await getTopicIdeas(query);
        setResults(topics);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      {/* Search Command Center */}
      <div className="relative">
        <div className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 bg-[#0F1016]/80 backdrop-blur-3xl p-1 w-full rounded-[4rem] border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="bg-[#15161D] rounded-[3.8rem] p-10 md:p-14 space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Live Intelligence Engine</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
                  Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Niche Economy</span>
                </h1>
                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg">
                  Deep-dive into keyword competitive scores and AI-generated content frameworks to scale your channel.
                </p>
              </div>
              
              <div className="flex p-1.5 bg-black/40 rounded-3xl border border-white/5 backdrop-blur-md">
                <button 
                  onClick={() => { setSubTab('keywords'); setResults(null); }}
                  className={cn(
                    "px-8 py-4 rounded-2xl text-[11px] font-black tracking-[0.15em] transition-all flex items-center gap-2", 
                    subTab === 'keywords' ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-white"
                  )}
                >
                  <Filter className="w-4 h-4" /> KEYWORDS
                </button>
                <button 
                  onClick={() => { setSubTab('topics'); setResults(null); }}
                  className={cn(
                    "px-8 py-4 rounded-2xl text-[11px] font-black tracking-[0.15em] transition-all flex items-center gap-2", 
                    subTab === 'topics' ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-white"
                  )}
                >
                  <Cpu className="w-4 h-4" /> TOPIC IDEAS
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              <div className="relative flex items-center bg-[#0C0D12] border-2 border-white/5 rounded-[3rem] overflow-hidden focus-within:border-blue-500/50 transition-all duration-300">
                <div className="pl-10 text-gray-500">
                  <Search className="w-7 h-7" />
                </div>
                <input 
                  type="text" 
                  placeholder={subTab === 'keywords' ? "Input seed keyword (e.g. 'SaaS Marketing')..." : "What is your channel's unique angle?"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-transparent py-10 px-6 outline-none text-2xl font-bold text-white placeholder:text-gray-700"
                />
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="mr-4 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 text-white px-12 py-6 rounded-[2.2rem] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5 fill-white" />
                  )}
                  Launch Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-8"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-blue-500/5 rounded-full" />
              <div className="absolute inset-0 border-8 border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-transparent rounded-full animate-spin" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-4 bg-blue-500/20 rounded-full flex items-center justify-center"
              >
                <Cpu className="w-8 h-8 text-blue-400" />
              </motion.div>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-xl font-black text-white tracking-widest uppercase">Aggregating Intel</p>
              <p className="text-blue-400 font-bold tracking-[0.3em] uppercase text-[10px] animate-pulse">Scanning Market Clusters...</p>
            </div>
          </motion.div>
        ) : subTab === 'keywords' && results?.relatedKeywords ? (
          <motion.div 
            key="keywords-results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-12"
          >
            {/* Niche Intelligence Dashboard */}
            {insights && (
              <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-[#15161D] p-6 rounded-3xl border border-white/5 space-y-4">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sentiment Index</p>
                    <div className="flex items-center gap-4">
                       <p className="text-4xl font-black text-white">{insights.sentimentScore}%</p>
                       <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">{insights.sentimentLabel}</span>
                    </div>
                 </div>
                 <div className="bg-[#15161D] p-6 rounded-3xl border border-white/5 space-y-4">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Growth Velocity</p>
                    <p className="text-4xl font-black text-white">+{insights.predictedGrowth}%</p>
                 </div>
                 <div className="md:col-span-2 bg-[#15161D] p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Untapped Opportunities</p>
                    <div className="flex flex-wrap gap-2">
                       {insights.gaps.map((gap: string, i: number) => (
                         <span key={i} className="px-3 py-1.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-lg border border-purple-500/20 italic">
                            "{gap}"
                         </span>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {/* Keyword Matrix */}
            <div className="xl:col-span-4 space-y-6">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] px-2">Keyword Matrix</h3>
               <div className="space-y-3">
                  {results.relatedKeywords.map((kw: any, i: number) => (
                    <div key={i} className="bg-[#15161D] p-5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                       <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-black group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">{kw.keyword}</p>
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-md",
                            kw.competition < 40 ? "bg-emerald-500/10 text-emerald-500" : kw.competition < 70 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                          )}>
                             COMP: {kw.competition}
                          </span>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Search Volume</p>
                          <p className="text-[10px] text-gray-400 font-black">{kw.volume}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Competitive Intelligence */}
            <div className="xl:col-span-8 space-y-6">
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] px-2">Market Volatility Analysis</h3>
               <div className="grid grid-cols-1 gap-4">
                  {videoStats.slice(0, 5).map((v: any, i: number) => (
                    <div 
                      key={v.id} 
                      onClick={() => openVideo(v.id)}
                      className="bg-[#15161D] rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row hover:border-blue-500/40 transition-all cursor-pointer group"
                    >
                       <div className="w-full md:w-56 aspect-video shrink-0 bg-black relative">
                          <img src={v.snippet.thumbnails.high.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded-md text-[9px] font-black text-white border border-white/10 uppercase italic">
                             RANK #{i+1}
                          </div>
                       </div>
                       <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                             <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">{v.snippet.channelTitle}</p>
                             <h4 className="text-lg font-black text-white leading-tight line-clamp-2 uppercase italic tracking-tighter">{v.snippet.title}</h4>
                          </div>
                          <div className="flex gap-6 pt-4 border-t border-white/5 mt-4">
                             <div className="space-y-1">
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5"><Eye className="w-3 h-3"/> Views</p>
                                <p className="text-white font-bold text-xs">{formatCompactNumber(Number(v.statistics.viewCount))}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5"><ThumbsUp className="w-3 h-3"/> Likes</p>
                                <p className="text-white font-bold text-xs">{formatCompactNumber(Number(v.statistics.likeCount))}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        ) : subTab === 'topics' && results?.map ? (
          <motion.div 
            key="topics-results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-blue-500" /> Content Opportunity Canvas
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-6">Deep learning derived ideation</p>
              </div>
              <div className="flex items-center gap-3 bg-blue-600/10 px-5 py-2.5 rounded-2xl border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">6 High-Value Vectors Detected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((topic: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-[#15161D] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl hover:border-blue-500/40 transition-all duration-500 h-full flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] group-hover:bg-blue-600/30 transition-all" />
                  
                  <div className="space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                       <div className="bg-white/5 p-3 rounded-2xl border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500">
                          <Zap className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:fill-white" />
                       </div>
                       <span className="text-[10px] font-black text-gray-600 tracking-widest group-hover:text-blue-400 transition-colors uppercase">PROPOSAL #{i+1}</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter italic group-hover:text-blue-400 transition-all duration-300">
                        {topic.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/5 space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                         <Target className="w-3.5 h-3.5 text-blue-500" />
                       </div>
                       <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em]">Strategy Angle</p>
                    </div>
                    <p className="text-xs text-gray-500 italic leading-relaxed font-medium line-clamp-3">
                      "{topic.reason}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-48 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-[150px] pointer-events-none" />
            
            <div className="relative z-10 space-y-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-600/30 rounded-full blur-[40px] animate-pulse" />
                <div className="w-40 h-40 bg-[#15161D] rounded-full flex items-center justify-center mx-auto border-2 border-white/10 relative shadow-2xl">
                   <div className="absolute inset-0 border-2 border-dashed border-blue-500/40 rounded-full animate-[spin_20s_linear_infinite]" />
                   <BookOpen className="w-16 h-16 text-white" />
                </div>
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                  Niche <span className="text-blue-500">Cartography</span>
                </h3>
                <p className="text-gray-500 text-xl font-medium leading-relaxed px-10">
                  Select a research vector and input your seed concept to generate high-performance content blueprints.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                 {[
                   { label: 'Market Depth', color: 'bg-emerald-500' },
                   { label: 'CTR Vectors', color: 'bg-blue-500' },
                   { label: 'Retention Hooks', color: 'bg-purple-500' }
                 ].map((pill, idx) => (
                   <div key={idx} className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                      <span className={cn("w-2 h-2 rounded-full", pill.color)} />
                      <span className="text-[11px] text-gray-400 font-black tracking-widest uppercase">{pill.label}</span>
                   </div>
                 ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
