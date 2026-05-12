import { useEffect, useState } from 'react';
import { auth, googleProvider } from './lib/firebase';
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { Layout } from './components/Layout';
import { Home } from './components/tabs/Home';
import { Trending } from './components/tabs/Trending';
import { Upload } from './components/tabs/Upload';
import { Audit } from './components/tabs/Audit';
import { DailyIdeas } from './components/tabs/DailyIdeas';
import { ChatSphere } from './components/ChatSphere';
import { Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // First check stored token
      const stored = localStorage.getItem('yt_access_token');
      if (stored) setAccessToken(stored);

      // Then check if we just came back from a redirect
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            localStorage.setItem('yt_access_token', credential.accessToken);
            setAccessToken(credential.accessToken);
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }

      // Then listen for auth state
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    }

    init();
  }, []);

  const handleLogin = async () => {
    await signInWithRedirect(auth, googleProvider);
  };

  const handleLogout = () => {
    signOut(auth);
    localStorage.removeItem('yt_access_token');
    setAccessToken(null);
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0B10] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // User logged in but no access token yet
  if (user && !accessToken) {
    return (
      <div className="min-h-screen bg-[#0A0B10] flex flex-col items-center justify-center p-6 text-white">
        <div className="bg-[#15161D] p-10 rounded-[3rem] border border-white/5 max-w-md w-full text-center space-y-6">
          <Youtube className="w-12 h-12 text-blue-400 mx-auto" />
          <h2 className="text-2xl font-black italic uppercase">YouTube Access Required</h2>
          <p className="text-gray-500 text-sm">We need permission to access your YouTube channel.</p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            <Youtube className="w-5 h-5" />
            Grant YouTube Access
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-600 text-xs hover:text-white transition-colors"
          >
            Sign out and try different account
          </button>
        </div>
      </div>
    );
  }

  if (!user || !accessToken) {
    return (
      <div className="min-h-screen bg-[#0A0B10] flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 mb-4">
              <Youtube className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                Enterprise Creator Suite
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
              Tube<span className="text-blue-600">IQ</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              Neural Optimization & Competitive Intelligence
            </p>
          </div>

          <div className="bg-[#15161D] p-10 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tight">
                Secure Entrance
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                Sign in with your Google account to continue.
              </p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full relative group overflow-hidden bg-white text-black font-black py-5 px-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase italic tracking-tighter"
            >
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-3 group-hover:text-white">
                <Youtube className="w-5 h-5 fill-current" />
                Connect with YouTube
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Home accessToken={accessToken!} />}
          {activeTab === 'daily' && <DailyIdeas accessToken={accessToken!} />}
          {activeTab === 'trending' && <Trending accessToken={accessToken!} />}
          {activeTab === 'upload' && <Upload accessToken={accessToken!} />}
          {activeTab === 'audit' && <Audit accessToken={accessToken!} />}
        </AnimatePresence>
      </div>
      <ChatSphere />
    </Layout>
  );
}
