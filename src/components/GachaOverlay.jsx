import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Search, Database, Scale, Grip, Link as LinkIcon, AlignCenter, BarChart2, AlertCircle, MoveHorizontal, ArrowRight, Unlink, TrendingUp, Home, Users, Activity, BarChart, Layout, Percent } from 'lucide-react';

const IconMap = {
  Scale, Grip, Link: LinkIcon, AlignCenter, BarChart2, AlertCircle, MoveHorizontal, ArrowRight, Unlink, TrendingUp, Users, Activity, BarChart, Layout, Percent
};

export default function GachaOverlay({ card, onClose }) {
  const [gachaState, setGachaState] = useState('animating'); // 'animating', 'revealed'

  useEffect(() => {
    if (card) {
      setGachaState('animating');
      const timer = setTimeout(() => {
        setGachaState('revealed');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [card]);

  if (!card) return null;

  const CardIcon = IconMap[card.icon] || Database;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl mx-auto">
        {gachaState === 'animating' ? (
          <div className="flex flex-col items-center justify-center h-[500px] space-y-8 bg-slate-900 rounded-3xl border border-cyan-500/50 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(6,182,212,0.1)_50%,transparent_100%)] animate-[scan_2s_linear_infinite]" />
            <style>{`
              @keyframes scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
              }
            `}</style>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 border-4 border-dashed border-cyan-500 rounded-full absolute opacity-50"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-4 border-cyan-400 rounded-full absolute opacity-50"
            />
            <div className="z-10 text-cyan-400 flex flex-col items-center">
              <Search className="w-16 h-16 mb-4 animate-pulse" />
              <h2 className="text-2xl font-black font-mono tracking-widest">DATA ANALYZING...</h2>
              <div className="text-xs mt-2 opacity-70 font-mono">EXTRACTING CORRELATION PATTERNS</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border-[12px] z-10 mb-8 ${
                card.rarity === 'SP' ? 'border-emerald-300 shadow-emerald-500/50' :
                card.rarity === 'SSR' ? 'border-amber-300 shadow-amber-500/50' :
                card.rarity === 'SR' ? 'border-purple-300 shadow-purple-500/50' :
                card.rarity === 'R' ? 'border-blue-300 shadow-blue-500/50' :
                'border-slate-300 shadow-slate-500/50'
              }`}
            >
              <div className={`p-8 text-center relative border-b-4 ${
                card.rarity === 'SP' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-700' :
                card.rarity === 'SSR' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-600' :
                card.rarity === 'SR' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-700' :
                card.rarity === 'R' ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white border-blue-600' :
                'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border-slate-300'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-black text-xs shadow-sm border border-white/30">
                    CLASS: {card.rarity}
                  </div>
                  <div className="text-xs font-black opacity-70">
                    No.{card.id.toString().padStart(3, '0')}
                  </div>
                </div>
                
                <div className={`w-28 h-28 mx-auto bg-white rounded-full shadow-inner flex items-center justify-center mb-4 border-4 ${
                  card.rarity === 'SP' ? 'border-emerald-200' :
                  card.rarity === 'SSR' ? 'border-amber-200' :
                  card.rarity === 'SR' ? 'border-purple-200' :
                  card.rarity === 'R' ? 'border-blue-200' :
                  'border-slate-200'
                }`}>
                  <CardIcon className={`w-14 h-14 ${
                    card.rarity === 'SP' ? 'text-emerald-500' :
                    card.rarity === 'SSR' ? 'text-amber-500' :
                    card.rarity === 'SR' ? 'text-purple-500' :
                    card.rarity === 'R' ? 'text-blue-500' :
                    'text-slate-600'
                  }`} />
                </div>
                
                <h2 className="text-2xl font-black mb-1 drop-shadow-sm">{card.name}</h2>
                <div className="text-xs font-bold opacity-90 tracking-wider">{card.nameEn}</div>
              </div>
              
              <div className="p-6 bg-amber-50/50">
                <div className="mb-5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    DESCRIPTION
                  </h4>
                  <p className="text-slate-700 font-bold text-sm leading-relaxed">{card.desc}</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                  <div className="absolute -top-2 -left-2 text-2xl opacity-20">❝</div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FLAVOR TEXT</h4>
                  <p className="text-slate-600 italic font-medium text-sm leading-relaxed relative z-10">"{card.flavorText}"</p>
                </div>
              </div>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="bg-white hover:bg-slate-100 text-slate-800 text-lg font-black py-4 px-12 rounded-full shadow-lg transition-all flex items-center gap-2"
            >
              閉じる
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
