import { useState } from 'react';
import { Gamepad2, Image as ImageIcon } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import AssetViewer from './components/AssetViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'assets'>('game');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-blue-200">
            🐼
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Apple's Bread Mountain Adventure</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Concept Demo</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'game' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Play Demo
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'assets' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Asset Viewer
          </button>
        </div>
      </header>

      <main className={`flex-1 flex flex-col w-full mx-auto ${activeTab === 'game' ? 'h-[calc(100vh-76px)]' : 'max-w-7xl p-6 h-[calc(100vh-76px)]'}`}>
        {activeTab === 'game' ? (
          <GameCanvas />
        ) : (
          <AssetViewer />
        )}
      </main>
    </div>
  );
}

