import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Search, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AuditProps {
  accessToken: string;
}

export function Audit({ accessToken }: AuditProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleAudit = async () => {
    if (!videoUrl) return;
    setLoading(true);
    try {
      // Logic to fetch video data from URL (mocking for now, in real it extracts ID)
      const prompt = `Perform a comprehensive SEO audit for a YouTube video with this URL: ${videoUrl}.
      Analyze based on industry standards and provide:
      1. Health score (0-100).
      2. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats).
      3. Critical fixes needed.
      4. Optimization checklist.
      Return as JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              swot: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              criticalFixes: { type: Type.ARRAY, items: { type: Type.STRING } },
              checklist: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    status: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      setAuditResult(JSON.parse(response.text));
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#15161D] p-10 rounded-[3rem] border border-white/5 text-center space-y-6">
        <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto" />
        <h2 className="text-3xl font-bold text-white">Full Video Audit</h2>
        <p className="text-gray-400 max-w-lg mx-auto">Paste any YouTube video link to receive a professional SEO performance audit and actionable growth insights.</p>
        
        <div className="max-w-xl mx-auto relative">
           <input 
             type="text" 
             placeholder="https://www.youtube.com/watch?v=..."
             value={videoUrl}
             onChange={(e) => setVideoUrl(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-32 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-white"
           />
           <button 
             onClick={handleAudit}
             disabled={loading}
             className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 rounded-xl font-bold transition-all flex items-center gap-2"
           >
             {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
             Audit
           </button>
        </div>
      </div>

      {auditResult && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Health Score */}
          <div className="md:col-span-1 bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
             <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                   <circle 
                     cx="64" cy="64" r="60" 
                     className="stroke-white/5 fill-transparent" 
                     strokeWidth="8"
                   />
                   <motion.circle 
                     initial={{ strokeDasharray: "0 377" }}
                     animate={{ strokeDasharray: `${(auditResult.score / 100) * 377} 377` }}
                     cx="64" cy="64" r="60" 
                     className={cn("fill-transparent ", 
                       auditResult.score > 70 ? "stroke-emerald-500" : auditResult.score > 40 ? "stroke-yellow-500" : "stroke-red-500"
                     )}
                     strokeWidth="8"
                     strokeLinecap="round"
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-bold text-white">{auditResult.score}</span>
                   <span className="text-[10px] text-gray-500 uppercase font-bold">SEO Score</span>
                </div>
             </div>
             <p className="text-gray-400 text-sm italic">"Your video has {auditResult.score > 70 ? 'excellent' : 'moderate'} optimization potential."</p>
          </div>

          {/* SWOT Analysis */}
          <div className="md:col-span-2 bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5">
             <div className="grid grid-cols-2 gap-4 h-full">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                   <p className="text-[10px] font-bold text-emerald-400 uppercase mb-2">Strengths</p>
                   <ul className="text-xs text-gray-400 space-y-1">
                      {auditResult.swot.strengths.slice(0, 3).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                   </ul>
                </div>
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                   <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Weaknesses</p>
                   <ul className="text-xs text-gray-400 space-y-1">
                      {auditResult.swot.weaknesses.slice(0, 3).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                   </ul>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                   <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Opportunities</p>
                   <ul className="text-xs text-gray-400 space-y-1">
                      {auditResult.swot.opportunities.slice(0, 3).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                   </ul>
                </div>
                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                   <p className="text-[10px] font-bold text-orange-400 uppercase mb-2">Threats</p>
                   <ul className="text-xs text-gray-400 space-y-1">
                      {auditResult.swot.threats.slice(0, 3).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                   </ul>
                </div>
             </div>
          </div>

          {/* Checklist */}
          <div className="md:col-span-3 bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-blue-500" />
                 Optimization Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {auditResult.checklist.map((item: any, i: number) => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                      {item.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="text-sm text-gray-300">{item.item}</span>
                   </div>
                 ))}
              </div>

              {auditResult.criticalFixes.length > 0 && (
                <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                   <p className="text-xs font-bold text-red-400 uppercase mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Critical Fixes Required
                   </p>
                   <div className="space-y-2">
                      {auditResult.criticalFixes.map((f: string, i: number) => (
                        <p key={i} className="text-sm text-gray-300">• {f}</p>
                      ))}
                   </div>
                </div>
              )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
