import React, { useState, useEffect } from 'react';
import HomePhase from './components/HomePhase';
import LearningPhase from './components/LearningPhase';
import GamePhase from './components/GamePhase';
import DiscoveryPhase from './components/DiscoveryPhase';
import EndlessPhase from './components/EndlessPhase';
import CollectionPhase from './components/CollectionPhase';
import { BookOpen, Gamepad2, Search, Activity, Home, Award } from 'lucide-react';

export default function App() {
  const [phase, setPhase] = useState('home'); // home, learning, game, discovery, endless, collection
  const [unlockedCards, setUnlockedCards] = useState(() => {
    const saved = localStorage.getItem('unlockedCards');
    return saved ? JSON.parse(saved) : [];
  });
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('unlockedCards', JSON.stringify(unlockedCards));
  }, [unlockedCards]);

  useEffect(() => {
    localStorage.setItem('highScore', highScore.toString());
  }, [highScore]);

  const handleUnlockCard = (cardId) => {
    if (!unlockedCards.includes(cardId)) {
      setUnlockedCards(prev => [...prev, cardId]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-sm cursor-pointer" onClick={() => setPhase('home')}>
                {phase === 'home' ? <Home className="w-5 h-5 text-white" /> :
                 phase === 'learning' ? <BookOpen className="w-5 h-5 text-white" /> : 
                 phase === 'game' ? <Gamepad2 className="w-5 h-5 text-white" /> :
                 phase === 'discovery' ? <Search className="w-5 h-5 text-white" /> :
                 phase === 'collection' ? <Award className="w-5 h-5 text-white" /> :
                 <Activity className="w-5 h-5 text-white" />}
              </div>
              <h1 className="text-xl font-bold text-slate-900 cursor-pointer" onClick={() => setPhase('home')}>
                データ分析学習アプリ
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPhase('home')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  phase === 'home' 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                ホーム
              </button>
              <button
                onClick={() => setPhase('learning')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  phase === 'learning' 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                1. 予備学習
              </button>
              <button
                onClick={() => setPhase('game')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  phase === 'game' 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                2. 特訓ドリル
              </button>
              <button
                onClick={() => setPhase('discovery')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  phase === 'discovery' 
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                3. データ発掘ゲーム
              </button>
              <button
                onClick={() => setPhase('endless')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1 ${
                  phase === 'endless' 
                    ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' 
                    : 'text-amber-600 hover:bg-amber-50 border border-transparent'
                }`}
              >
                <Activity className="w-4 h-4" />
                相関チャレンジ
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={phase} className="animate-fade-in">
          {phase === 'home' ? (
            <HomePhase onNavigate={setPhase} unlockedCards={unlockedCards} highScore={highScore} />
          ) : phase === 'learning' ? (
            <LearningPhase onComplete={() => setPhase('game')} onUnlockCard={handleUnlockCard} />
          ) : phase === 'game' ? (
            <GamePhase onBack={() => setPhase('home')} onNext={() => setPhase('discovery')} onUnlockCard={handleUnlockCard} />
          ) : phase === 'discovery' ? (
            <DiscoveryPhase onBack={() => setPhase('home')} onNext={() => setPhase('endless')} onUnlockCard={handleUnlockCard} />
          ) : phase === 'collection' ? (
            <CollectionPhase onBack={() => setPhase('home')} unlockedCards={unlockedCards} />
          ) : (
            <EndlessPhase onBack={() => setPhase('home')} onUnlockCard={handleUnlockCard} unlockedCards={unlockedCards} highScore={highScore} setHighScore={setHighScore} />
          )}
        </div>
      </main>
    </div>
  );
}
