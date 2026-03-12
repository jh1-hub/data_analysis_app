import React from 'react';
import { BookOpen, Gamepad2, Search, Activity, Award, Lock, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { CARDS } from '../data/cards';

export default function HomePhase({ onNavigate, unlockedCards, highScore }) {
  const isComplete = unlockedCards.length === CARDS.length && CARDS.length > 0;

  const menuItems = [
    { id: 'learning', title: '1. 予備学習', desc: 'データ分析の基礎知識を学ぼう', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'game', title: '2. 特訓ドリル', desc: '依頼に答えて相関関係を見つけよう', icon: Gamepad2, color: 'bg-indigo-500' },
    { id: 'discovery', title: '3. データ発掘ゲーム', desc: '隠された法則を自力で探し出そう', icon: Search, color: 'bg-emerald-500' },
    { id: 'endless', title: '相関チャレンジ', desc: 'タイムアタック！5連鎖でガチャが引けるぞ', icon: Activity, color: 'bg-amber-500' },
  ];

  const getCountByRarity = (rarity) => {
    return unlockedCards.filter(id => CARDS.find(c => c.id === id)?.rarity === rarity).length;
  };
  const getTotalByRarity = (rarity) => {
    return CARDS.filter(c => c.rarity === rarity).length;
  };

  const rarities = [
    { id: 'SP', color: 'text-orange-500', bg: 'bg-orange-100' },
    { id: 'SSR', color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'SR', color: 'text-purple-500', bg: 'bg-purple-100' },
    { id: 'R', color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'N', color: 'text-slate-500', bg: 'bg-slate-100' },
  ];

  return (
    <div className={`max-w-5xl mx-auto space-y-12 transition-all duration-1000 p-8 rounded-[3rem] ${
      isComplete ? 'bg-gradient-to-br from-amber-100 via-rose-100 to-indigo-100 shadow-[0_0_50px_rgba(251,191,36,0.2)]' : ''
    }`}>
      {/* Complete Banner */}
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-1 rounded-3xl shadow-xl"
        >
          <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-[1.4rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent,rgba(251,191,36,0.5),transparent)] animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-center gap-2 mb-2">
                <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
                <Award className="w-8 h-8 text-rose-500 animate-bounce delay-75" />
                <Trophy className="w-8 h-8 text-amber-500 animate-bounce delay-150" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter">
                CONGRATULATIONS!
              </h2>
              <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">
                カードコレクション コンプリート達成！！
              </p>
              <p className="text-sm text-slate-500 font-bold mt-2">
                あなたは真のデータマスターです。この知識を武器に、世界を分析しましょう！
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          {isComplete ? '究極のデータ分析マスター' : 'データ分析の世界へようこそ！'}
        </h2>
        <p className="text-lg text-slate-600 font-bold max-w-2xl mx-auto">
          {isComplete 
            ? '全ての知識を手に入れたあなたに、もう迷いはありません。' 
            : '基礎から実践まで、ゲーム感覚でデータサイエンスの考え方を身につけよう。'}
        </p>
      </div>

      {/* Main Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isFirstTime = unlockedCards.length === 0 && item.id === 'learning';
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {isFirstTime && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-4 -right-2 z-10"
                >
                  <div className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 animate-bounce">
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    START HERE!
                  </div>
                </motion.div>
              )}
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full text-left bg-white p-6 rounded-3xl shadow-sm border-2 transition-all group flex items-center gap-6 relative overflow-hidden ${
                  isFirstTime 
                    ? 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)]' 
                    : 'border-slate-100 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {isFirstTime && (
                  <div className="absolute inset-0 bg-rose-50/30 animate-pulse pointer-events-none" />
                )}
                <div className={`${item.color} p-4 rounded-2xl text-white shadow-inner group-hover:scale-110 transition-transform relative z-10`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-slate-500 font-bold">{item.desc}</p>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collection Summary */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              カードコレクション
            </h3>
            <div className="text-lg font-black text-indigo-600">
              {unlockedCards.length} / {CARDS.length}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-6 flex-1">
            {rarities.map(r => (
              <div key={r.id} className="text-center">
                <div className={`text-xs font-black ${r.bg} ${r.color} rounded-t-lg py-1`}>{r.id}</div>
                <div className="bg-slate-50 border border-t-0 border-slate-100 rounded-b-lg py-2 font-bold text-slate-700">
                  {getCountByRarity(r.id)}<span className="text-xs text-slate-400">/{getTotalByRarity(r.id)}</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('collection')}
            className="w-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            コレクション一覧を見る
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* High Score */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-600 mb-2">相関チャレンジ ハイスコア</h3>
          <div className="text-5xl font-black text-slate-800 mb-2">
            {highScore} <span className="text-2xl text-slate-400">pt</span>
          </div>
          <p className="text-sm font-bold text-slate-500">
            スコアが高いほど、レアカードが出やすくなるぞ！
          </p>
        </div>
      </div>
    </div>
  );
}
