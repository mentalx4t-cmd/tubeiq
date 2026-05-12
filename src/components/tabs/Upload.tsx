import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileVideo, 
  Globe, 
  Lock, 
  Share2, 
  Wand2, 
  ListChecks, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Users,
  MapPin,
  PlaySquare,
  BadgeAlert,
  Hash,
  Image as ImageIcon,
  ChevronDown
} from 'lucide-react';
import { optimizeVideo } from '../../services/aiService';
import { uploadVideo, fetchPlaylists, fetchCategories } from '../../services/youtubeService';
import { cn } from '../../lib/utils';

const SEO_CHECKLIST = [
  { id: 'title-keywords', label: 'Primary keyword in the first 3 words of title', weight: 1 },
  { id: 'title-hook', label: 'Use a strong emotional hook or curiosity gap', weight: 1 },
  { id: 'desc-early', label: 'Summary of video in the first 2 lines of description', weight: 1 },
  { id: 'desc-cta', label: 'Include a clear Call to Action (Subscribe/Link)', weight: 1 },
  { id: 'tags-specific', label: 'At least 5 specific long-tail keywords in tags', weight: 1 },
  { id: 'thumbnail-text', label: 'High contrast text on thumbnail (if applicable)', weight: 1 },
];

interface UploadProps {
  accessToken: string;
}

export function Upload({ accessToken }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  
  // Optimization Context
  const [contentContext, setContentContext] = useState('');
  
  // Advanced Metadata
  const [privacyStatus, setPrivacyStatus] = useState<'public' | 'private' | 'unlisted'>('private');
  const [madeForKids, setMadeForKids] = useState(false);
  const [categoryId, setCategoryId] = useState('22');
  const [playlistId, setPlaylistId] = useState('');
  const [location, setLocation] = useState('');
  const [isAlteredContent, setIsAlteredContent] = useState(false);
  
  // Resources
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadResources = async () => {
      if (accessToken && step === 3) {
        try {
          const [pl, cat] = await Promise.all([
            fetchPlaylists(accessToken),
            fetchCategories(accessToken)
          ]);
          setPlaylists(pl);
          setCategories(cat);
        } catch (e) {
          console.error("Failed to load Youtube resources", e);
        }
      }
    };
    loadResources();
  }, [accessToken, step]);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const seoScore = Math.round((checkedItems.length / SEO_CHECKLIST.length) * 100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data:video/mp4;base64, part
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoPreview(url);
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const calculatedVertical = video.videoHeight > video.videoWidth;
        setIsVertical(calculatedVertical);
        setStep(2);
        // Start optimization immediately as requested
        void triggerOptimization(selectedFile, calculatedVertical);
      };
      video.src = url;
    }
  };

  const triggerOptimization = async (targetFile: File, vertical: boolean) => {
    setLoading(true);
    setError(null);
    try {
      let videoBase64 = undefined;
      
      // Convert to base64 for AI processing
      videoBase64 = await fileToBase64(targetFile);

      const result = await optimizeVideo({
        title: targetFile.name.split('.')[0],
        description: contentContext || "Professional upload via TubeIQ",
        niche: (vertical ? "YouTube Shorts" : "YouTube Content"),
        videoBase64,
        mimeType: targetFile.type
      });
      setOptimization(result);
      setStep(3);
    } catch (err: any) {
      console.error("Optimization failed:", err);
      setError(err?.message || "AI Analysis failed. Please try a smaller video or check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = () => {
    if (!file) return;
    triggerOptimization(file, isVertical);
  };

  const handleFinalUpload = async () => {
    if (!file || !optimization) return;
    setStatus('uploading');
    try {
      await uploadVideo(accessToken, file, {
        title: optimization.optimizedTitle,
        description: optimization.optimizedDescription,
        tags: optimization.tags,
        privacyStatus,
        madeForKids,
        categoryId,
        playlistId,
        locationDescription: location
      });
      setStatus('success');
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Dynamic Progress Indicator */}
      <div className="flex items-center justify-between px-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center group">
             <div className={cn(
               "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all",
               step === s ? "bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] ring-4 ring-blue-600/20" : 
               step > s ? "bg-emerald-500 text-white" : "bg-white/5 text-gray-500 border border-white/5"
             )}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
             </div>
             <div className="ml-4">
                <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", step >= s ? "text-white" : "text-gray-600")}>
                   STEP 0{s}
                </p>
                <p className={cn("text-xs font-bold mt-1", step >= s ? "text-gray-400" : "text-gray-700")}>
                   {s === 1 ? 'Import Source' : s === 2 ? 'AI Processor' : 'Ready to Publish'}
                </p>
             </div>
             {s < 3 && <div className={cn("flex-1 h-px bg-white/5 mx-8", step > s && "bg-emerald-500/20")} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative bg-[#15161D] p-20 rounded-[4rem] border border-white/5 overflow-hidden group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-10">
              <div className="relative">
                 <div className="absolute inset-0 bg-blue-500/20 blur-[50px] group-hover:bg-blue-500/40 transition-all rounded-full" />
                 <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center relative shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <UploadCloud className="w-16 h-16 text-white" />
                 </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Deploy New Content</h2>
                <p className="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed font-medium">
                  Select high-fidelity source files. Supports 4K, 8K and high frame-rate exports.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-blue-500/10 border border-white/10 flex items-center justify-center">
                         <FileVideo className="w-4 h-4 text-blue-400" />
                      </div>
                    ))}
                 </div>
                 <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Direct Pipeline to YouTube Cloud</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-12 xl:col-span-5 space-y-8">
               <div className="bg-[#15161D] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                  <div className="aspect-video bg-black rounded-[2rem] overflow-hidden mb-8 relative border border-white/5 shadow-2xl">
                     {videoPreview && <video src={videoPreview} className="w-full h-full object-contain" controls />}
                     <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-xl flex items-center gap-2">
                           <FileVideo className="w-3.5 h-3.5" /> 
                           {isVertical ? '9:16 SHORTS' : '16:9 4K'}
                        </span>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-colors">
                        <div className="min-w-0">
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Source Identifier</p>
                           <p className="text-white font-black text-lg truncate uppercase italic tracking-tighter">{file?.name}</p>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 ml-4" />
                     </div>
                     <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Payload Size</p>
                        <p className="text-white font-black text-lg">{(file!.size / (1024 * 1024)).toFixed(2)} MB</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-center space-y-8">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20">
                     <Sparkles className="w-4 h-4 text-blue-400" />
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Quantum SEO Engine Ready</span>
                  </div>
                  <h3 className="text-5xl font-black text-white leading-none tracking-tighter uppercase italic">Neural <span className="text-blue-500">Optimization</span></h3>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Analysis Error</p>
                        <p className="text-xs text-red-200/60 font-medium leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Primary Content Focus (Optional)</label>
                        <textarea 
                           placeholder="Tell the AI what this video is about for better matching..."
                           value={contentContext}
                           onChange={(e) => setContentContext(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white outline-none focus:border-blue-500/40 transition-all resize-none h-24 placeholder:text-gray-700"
                        />
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleOptimize}
                    disabled={loading}
                    className="group relative bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-8 rounded-[2.5rem] font-black transition-all flex flex-col items-center justify-center gap-4 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {loading ? (
                       <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                       <Wand2 className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                    )}
                    <div className="text-center">
                       <p className="text-lg uppercase italic leading-none">Execute Optimization</p>
                       <p className="text-[10px] font-bold mt-1 opacity-60 tracking-widest">FULL AI METADATA GENERATION</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setStep(1)}
                    className="p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                     <ChevronLeft className="w-10 h-10 text-gray-600 group-hover:text-white transition-colors" />
                     <div className="text-center">
                       <p className="text-lg text-white uppercase italic leading-none">Abort & Replace</p>
                       <p className="text-[10px] text-gray-600 font-bold mt-1 tracking-widest uppercase">SELECT ALTERNATE SOURCE</p>
                    </div>
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="grid grid-cols-1 xl:grid-cols-12 gap-10 pb-20"
          >
             {/* LEFT COLUMN: Main Video Details */}
             <div className="xl:col-span-8 space-y-8">
                <div className="bg-[#15161D] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                            <Wand2 className="w-6 h-6 text-blue-400" />
                         </div>
                         <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Content Intelligence</h3>
                      </div>
                      <button onClick={() => setStep(2)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Re-optimize</button>
                   </div>

                   {optimization?.contentSummary && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-3xl space-y-2"
                     >
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                           <Sparkles className="w-3 h-3" /> AI Visual Interpretation
                        </p>
                        <p className="text-sm text-gray-300 font-medium italic leading-relaxed">
                           "{optimization.contentSummary}"
                        </p>
                     </motion.div>
                   )}

                   <div className="space-y-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                            Optimized Title <span className="text-blue-500 opacity-50">• High Engagement Score</span>
                         </label>
                         <input 
                            type="text" 
                            placeholder="Loading optimization..."
                            value={optimization?.optimizedTitle || ''}
                            onChange={(e) => setOptimization({...optimization, optimizedTitle: e.target.value})}
                            className="w-full bg-[#0C0D12] border-2 border-white/5 rounded-3xl py-6 px-8 text-xl font-black text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-800 italic"
                         />
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-2">Semantic Description</label>
                         <textarea 
                            rows={8}
                            placeholder="Generating description..."
                            value={optimization?.optimizedDescription || ''}
                            onChange={(e) => setOptimization({...optimization, optimizedDescription: e.target.value})}
                            className="w-full bg-[#0C0D12] border-2 border-white/5 rounded-[2.5rem] p-8 text-white text-base font-medium outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-800 resize-none leading-relaxed"
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                               <Hash className="w-3.5 h-3.5 text-blue-400" /> Strategic Hashtags
                            </label>
                            <div className="bg-[#0C0D12] border border-white/5 p-6 rounded-3xl flex flex-wrap gap-3">
                               {optimization?.hashtags?.map((h: string, i: number) => (
                                 <span key={i} className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-black italic border border-blue-500/20">
                                    {h}
                                 </span>
                               )) || <p className="text-gray-700 italic text-xs">Awaiting hashtags...</p>}
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                               <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Thumbnail Concepts
                            </label>
                            <div className="bg-[#0C0D12] border border-white/5 p-6 rounded-3xl space-y-3">
                               {optimization?.thumbnailIdeas?.map((idea: string, i: number) => (
                                 <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Sparkles className="w-3 h-3 text-yellow-400 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-gray-400 font-medium leading-tight italic">{idea}</p>
                                 </div>
                               )) || <p className="text-gray-700 italic text-xs">Generating concepts...</p>}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                            <ListChecks className="w-3.5 h-3.5 text-blue-400" /> High-Performance Tags
                         </label>
                         <div className="bg-[#0C0D12] border border-white/5 p-6 rounded-3xl flex flex-wrap gap-2">
                            {optimization?.tags?.map((tag: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-bold border border-white/5">
                                 {tag}
                              </span>
                            )) || <p className="text-gray-700 italic text-xs">Generating tags...</p>}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Additional Settings */}
                <div className="bg-[#15161D] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] italic">Distribution & Compliance</h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                               <Users className="w-3.5 h-3.5 text-blue-400" /> Audience Target
                            </label>
                            <div className="flex p-1.5 bg-[#0C0D12] border border-white/5 rounded-2xl">
                               <button 
                                 onClick={() => setMadeForKids(true)}
                                 className={cn(
                                   "flex-1 py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                   madeForKids ? "bg-white text-black shadow-lg" : "text-gray-600 hover:text-white"
                                 )}
                               >
                                  MADE FOR KIDS
                               </button>
                               <button 
                                 onClick={() => setMadeForKids(false)}
                                 className={cn(
                                   "flex-1 py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                   !madeForKids ? "bg-white text-black shadow-lg" : "text-gray-600 hover:text-white"
                                 )}
                               >
                                  STANDARD ADULT
                               </button>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                               <MapPin className="w-3.5 h-3.5 text-blue-400" /> Stream Location (Optional)
                            </label>
                            <div className="relative">
                               <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                               <input 
                                  type="text" 
                                  placeholder="e.g. San Francisco, CA"
                                  value={location}
                                  onChange={(e) => setLocation(e.target.value)}
                                  className="w-full bg-[#0C0D12] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-blue-500/30 transition-all placeholder:text-gray-800"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                               <PlaySquare className="w-3.5 h-3.5 text-blue-400" /> Destination Category
                            </label>
                            <div className="relative group">
                               <select 
                                  value={categoryId}
                                  onChange={(e) => setCategoryId(e.target.value)}
                                  className="w-full bg-[#0C0D12] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none appearance-none group-hover:border-white/10 transition-all pr-12"
                               >
                                  {categories.length > 0 ? categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.snippet.title}</option>
                                  )) : <option value="22">People & Blogs</option>}
                               </select>
                               <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                            </div>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                               <PlaylistIcon className="w-3.5 h-3.5 text-blue-400" /> Add to Playlist
                            </label>
                            <div className="relative group">
                               <select 
                                  value={playlistId}
                                  onChange={(e) => setPlaylistId(e.target.value)}
                                  className="w-full bg-[#0C0D12] border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none appearance-none group-hover:border-white/10 transition-all pr-12"
                               >
                                  <option value="">None (Stand-alone)</option>
                                  {playlists.map(pl => (
                                    <option key={pl.id} value={pl.id}>{pl.snippet.title}</option>
                                  ))}
                               </select>
                               <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div 
                      onClick={() => setIsAlteredContent(!isAlteredContent)}
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between group",
                        isAlteredContent ? "bg-yellow-500/5 border-yellow-500/20" : "bg-black/40 border-white/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                      )}
                   >
                      <div className="flex items-center gap-6">
                         <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                           isAlteredContent ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : "bg-white/5 border-white/10 text-gray-600"
                         )}>
                            <BadgeAlert className="w-6 h-6" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-white font-black text-lg uppercase italic tracking-tighter">AI Altered Content Disclaimer</p>
                            <p className="text-gray-500 text-xs font-medium">This video uses synthetic media or AI-generated elements.</p>
                         </div>
                      </div>
                      <div className={cn(
                        "w-14 h-8 rounded-full p-1 transition-all",
                        isAlteredContent ? "bg-yellow-500" : "bg-white/10"
                      )}>
                         <div className={cn(
                           "w-6 h-6 rounded-full bg-white transition-all shadow-md",
                           isAlteredContent ? "translate-x-6" : "translate-x-0"
                         )} />
                      </div>
                   </div>
                </div>
             </div>

             {/* RIGHT COLUMN: Action & Verification */}
             <div className="xl:col-span-4 space-y-8">
                <div className="bg-[#15161D] p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
                   <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/10 relative group">
                         {videoPreview && <video src={videoPreview} className="w-full h-full object-contain grayscale-[0.5] group-hover:grayscale-0 transition-all" />}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                         <div className="absolute bottom-6 left-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center">
                               <PlaySquare className="w-5 h-5 text-black" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Preview Mode</p>
                               <p className="text-xs text-white font-bold truncate max-w-[150px] italic">Source: {file?.name}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                         <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ListChecks className="w-4 h-4" /> Integrity Audit
                         </h4>
                         <span className={cn(
                           "text-[10px] font-black px-3 py-1 rounded-full",
                           seoScore < 50 ? "bg-red-500/10 text-red-500" : seoScore < 80 ? "bg-yellow-500/10 text-yellow-500" : "bg-emerald-500/10 text-emerald-500"
                         )}>
                            {seoScore}% OPTIMIZED
                         </span>
                      </div>
                      
                      <div className="space-y-3">
                         {SEO_CHECKLIST.map((item) => (
                           <button 
                             key={item.id}
                             onClick={() => toggleCheck(item.id)}
                             className={cn(
                               "w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 group",
                               checkedItems.includes(item.id) 
                                 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                 : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:text-white"
                             )}
                           >
                              <div className={cn(
                                "mt-0.5 shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                checkedItems.includes(item.id) ? "bg-emerald-500 border-emerald-500" : "border-white/20 group-hover:border-white/40"
                              )}>
                                 {checkedItems.includes(item.id) && <CheckCircle className="w-4 h-4 text-[#0F1016] stroke-[3]" />}
                              </div>
                              <span className="text-xs font-bold leading-tight">{item.label}</span>
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pl-2">Access Control</label>
                      <div className="flex flex-col gap-2">
                         {[
                           { id: 'private', label: 'Private', icon: Lock, desc: 'Only you can view' },
                           { id: 'unlisted', label: 'Unlisted', icon: Share2, desc: 'Anyone with the link' },
                           { id: 'public', label: 'Public', icon: Globe, desc: 'Entire YouTube platform' },
                         ].map((p) => (
                           <button 
                             key={p.id}
                             onClick={() => setPrivacyStatus(p.id as any)}
                             className={cn(
                               "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group",
                               privacyStatus === p.id 
                                 ? "bg-blue-600/20 border-blue-500/40" 
                                 : "bg-white/5 border-white/5 opacity-50 hover:opacity-100"
                             )}
                           >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                privacyStatus === p.id ? "bg-blue-600 text-white" : "bg-white/5 text-gray-600"
                              )}>
                                 <p.icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                 <p className={cn("text-xs font-black uppercase tracking-widest italic leading-none", privacyStatus === p.id ? "text-white" : "text-gray-500")}>
                                    {p.label}
                                 </p>
                                 <p className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-tighter truncate">{p.desc}</p>
                              </div>
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   {status === 'success' ? (
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500 p-8 rounded-[3rem] text-[#0F1016] text-center space-y-6 shadow-2xl shadow-emerald-500/40 border-4 border-white/20"
                     >
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                           <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-3xl font-black italic uppercase italic tracking-tighter leading-none">Campaign Loaded</h4>
                           <p className="text-sm font-black opacity-80 uppercase tracking-widest">VIDEO DEPLOYED TO YouTube INFRASTRUCTURE</p>
                        </div>
                        <button 
                          onClick={() => { setStep(1); setStatus('idle'); setFile(null); }}
                          className="w-full bg-white text-emerald-600 font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-xl"
                        >
                           Upload Next Sequence
                        </button>
                     </motion.div>
                   ) : status === 'error' ? (
                     <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[3rem] text-center space-y-4">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                        <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Handshake Error</h4>
                        <p className="text-xs text-red-400 font-bold tracking-widest uppercase">CONNECTION INTERRUPTED OR REJECTED</p>
                        <button onClick={() => setStatus('idle')} className="text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Retry Connection</button>
                     </div>
                   ) : (
                     <button 
                       onClick={handleFinalUpload}
                       disabled={status === 'uploading' || !optimization}
                       className="group relative w-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-900/40 transition-all border-y border-white/20"
                     >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        <div className="relative z-10 flex flex-col items-center gap-6">
                           {status === 'uploading' ? (
                              <div className="w-14 h-14 border-8 border-white/30 border-t-white rounded-full animate-spin" />
                           ) : (
                              <div className="relative">
                                 <div className="absolute inset-0 bg-white/20 blur-[30px] rounded-full animate-pulse" />
                                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <Globe className="w-8 h-8" />
                                 </div>
                              </div>
                           )}
                           <div className="text-center">
                              <p className="text-3xl font-black italic uppercase italic tracking-tighter leading-none">Initiate Launch</p>
                              <p className="text-[10px] font-bold mt-2 opacity-60 tracking-[0.3em] uppercase">Secure Pipeline to YouTube Cloud</p>
                           </div>
                        </div>
                     </button>
                   )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Icons
function PlaylistIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
    </svg>
  );
}
