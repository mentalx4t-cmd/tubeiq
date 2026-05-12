import React from 'react';
import { User } from 'firebase/auth';
import { LayoutDashboard, Search, UploadCloud, PieChart, LogOut, Youtube, TrendingUp, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Layout({ children, user, activeTab, setActiveTab, onLogout }: LayoutProps) {
  const tabs = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily', label: 'Daily Ideas', icon: Lightbulb },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'audit', label: 'Audit', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E2E8F0] font-sans selection:bg-blue-500/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0A0B10]/80 backdrop-blur-xl border-bottom border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Tube<span className="text-blue-500">IQ</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    activeTab === tab.id 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user.displayName}</p>
                <button 
                  onClick={onLogout}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 ml-auto"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </div>
              <img 
                src={user.photoURL || ''} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-white/10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#15161D]/80 backdrop-blur-2xl border-t border-white/5 p-4 flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === tab.id ? "text-blue-500" : "text-gray-500"
            )}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
