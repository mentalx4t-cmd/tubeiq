import { useEffect, useState } from 'react';
import { auth, googleProvider } from './lib/firebase';
import { signInWithRedirect, signInWithPopup, getRedirectResult, onAuthStateChanged, User, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Layout } from './components/Layout';
import { Home } from './components/tabs/Home';
import { Trending } from './components/tabs/Trending';
import { Upload } from './components/tabs/Upload';
import { Audit } from './components/tabs/Audit';
import { DailyIdeas } from './components/tabs/DailyIdeas';
import { ChatSphere } from './components/ChatSphere';
import { LogIn, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('yt_access_token'));
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [authStep, setAuthStep] = useState<'login' | 'youtube'>('login');

  useEffect(() => {
    const handleTokenUpdate = (event: any) => {
      setAccessToken(event.detail);
    };
    window.addEventListener('yt_token_updated', handleTokenUpdate);
    return () => window.removeEventListener('yt_token_updated', handleTokenUpdate);
  }, []);

  useEffect(() => {
    // Handle redirect result when user comes back
    getRedirectResult(auth).then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setAccessToken(credential.accessToken);
          localStorage.setItem('yt_access_token', credential.accessToken);
        }
      }
    }).catch((error) => {
      console.error('Redirect result error:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setAuthStep('youtube');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      // Try popup first, fall back to redirect on mobile
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setAccessToken(credential.accessToken);
          localStorage.setItem('yt_access_token', credential.accessToken);
        }
      } catch (popupError: any) {
        // If popup blocked or failed, use redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    localStorage.removeItem('yt_access_token');
    setAccessToken(null);
    setAuthStep('login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0B10] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/20"></div>
    </div>
  );

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
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Enterprise Creator Suite</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">Tube<span className="text-blue-600">IQ</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Neural Optimization & Competitive Intelligence</p>
          </div>

          <div className="bg-[#15161D] p-10 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tight">
                {user ? 'Authorization Required' : 'Secure Entrance'}
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                {user
                  ? 'Connect your YouTube permissions to initiate content deployment.'
                  : 'Sign in with your Google account to continue.'}
              </p>
            </div>

            <div className="space-y-4 pt-2">
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

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors py-2"
                >
                  Terminate Current Session
                </button>
              )}
            </div>
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
