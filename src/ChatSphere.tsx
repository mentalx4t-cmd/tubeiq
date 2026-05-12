import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, User, MessageCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function ChatSphere() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "Hello! I'm your TubeIQ SEO assistant. How can I help you grow your channel today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        history: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
      });
      
      const result = await chat.sendMessage({ message: input });
      setMessages(prev => [...prev, { role: 'model', content: result.text || 'Sorry, I couldn\'t process that.' }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      drag
      dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[350px] sm:w-[400px] h-[500px] bg-[#15161D] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                   <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-white tracking-wide">AI SEO Expert</h3>
                   <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-blue-100 font-medium">Online</span>
                   </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    m.role === 'model' ? "bg-blue-600/20" : "bg-white/10"
                  )}>
                    {m.role === 'model' ? <Bot className="w-3.5 h-3.5 text-blue-400" /> : <User className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'model' ? "bg-white/5 text-gray-200" : "bg-blue-600 text-white"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500 text-xs italic p-2">
                   <Sparkles className="w-3 h-3 animate-pulse" /> AI is thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask anything about SEO..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-[#0A0B10] border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all pointer-events-auto",
          isOpen ? "bg-[#15161D] text-white" : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </motion.button>
    </motion.div>
  );
}
