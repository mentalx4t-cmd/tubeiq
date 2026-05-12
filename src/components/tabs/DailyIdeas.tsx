import { useState } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Zap, Search } from 'lucide-react';
import { generateContentIdeas } from '../../services/aiService';
import { cn } from '../../lib/utils';

interface ContentIdeas {
  title: string;
  hashtags: string[];
  keywords: string[];
}

export function DailyIdeas() {
  const [phrase, setPhrase] = useState('');
  const [ideas, setIdeas] = useState<ContentIdeas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!phrase.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateContentIdeas(phrase);
      setIdeas(data);
    } catch (err) {
      setError("Failed to generate ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          Content Idea Generator
        </h2>
        <div className="flex gap-4">
          <input 
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Enter a topic or phrase (e.g. 'How to make pasta')..."
            className="flex-1 bg-white/5 text-white border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-yellow-500/30"
          />
          <button 
             onClick={handleGenerate}
             disabled={loading}
             className="px-6 py-4 bg-yellow-600 hover:bg-yellow-500 rounded-2xl text-white font-bold transition-all disabled:opacity-50"
          >
             {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem] text-center text-red-400">
          {error}
        </div>
      )}

      {ideas && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#15161D] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6"
        >
          <div className="space-y-2">
            <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Video Title</h3>
            <p className="text-white text-xl font-bold">{ideas.title}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider">Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {ideas.hashtags.map(ht => (
                <span key={ht} className="text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full text-sm font-medium">#{ht.replace('#', '')}</span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider">SEO Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {ideas.keywords.map(kw => (
                <span key={kw} className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full text-sm font-medium">{kw}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
