import React, { useState, useEffect } from 'react';
import { Award, Lock, ArrowLeft, Scale, Grip, Link as LinkIcon, AlignCenter, BarChart2, AlertCircle, MoveHorizontal, ArrowRight, Unlink, TrendingUp, X, Users, Activity, BarChart, Layout, Percent, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CARDS } from '../data/cards';

const IconMap = {
  Scale, Grip, Link: LinkIcon, AlignCenter, BarChart2, AlertCircle, MoveHorizontal, ArrowRight, Unlink, TrendingUp, Users, Activity, BarChart, Layout, Percent
};

export default function CollectionPhase({ onBack, unlockedCards }) {
  const [selectedCard, setSelectedCard] = useState(null);
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          ホームに戻る
        </button>
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-500" />
          カードコレクション
        </h2>
        <div className="text-slate-500 font-bold">
          収集率: {unlockedCards.length} / {CARDS.length}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CARDS.map((card, idx) => {
          const isUnlocked = unlockedCards.includes(card.id);
          const CardIcon = IconMap[card.icon] || Award;
          return (
            <motion.div 
              key={card.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-2xl border-2 p-5 flex flex-col h-full transition-all cursor-pointer ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-white to-slate-50 border-indigo-200 shadow-sm hover:shadow-md hover:-translate-y-1' 
                  : 'bg-slate-100 border-slate-200 justify-center items-center'
              }`}
              onClick={() => isUnlocked && setSelectedCard(card)}
            >
              {isUnlocked ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`text-xs font-black px-3 py-1 rounded-full ${
                      card.rarity === 'SP' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-sm' :
                      card.rarity === 'SSR' ? 'bg-amber-100 text-amber-700' :
                      card.rarity === 'SR' ? 'bg-purple-100 text-purple-700' :
                      card.rarity === 'R' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {card.rarity}
                    </div>
                    <div className="text-xs text-slate-400 font-bold">No.{card.id.toString().padStart(3, '0')}</div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 py-4">
                    <div className={`p-4 rounded-2xl border ${
                      card.rarity === 'SP' ? 'bg-emerald-50 border-emerald-200' :
                      card.rarity === 'SSR' ? 'bg-amber-50 border-amber-200' :
                      card.rarity === 'SR' ? 'bg-purple-50 border-purple-200' :
                      card.rarity === 'R' ? 'bg-blue-50 border-blue-200' :
                      'bg-slate-50 border-slate-200'
                    }`}>
                      <CardIcon className={`w-12 h-12 ${
                        card.rarity === 'SP' ? 'text-emerald-600' :
                        card.rarity === 'SSR' ? 'text-amber-600' :
                        card.rarity === 'SR' ? 'text-purple-600' :
                        card.rarity === 'R' ? 'text-blue-600' :
                        'text-slate-600'
                      }`} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-black text-slate-800 text-lg">{card.name}</h3>
                      <div className="text-xs text-slate-400 font-bold">{card.nameEn}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <div className="text-sm font-bold text-slate-400 mb-1">未解放</div>
                  {card.rarity === 'SP' && (
                    <div className="text-xs text-amber-500/70 font-bold mt-2">
                      ヒント: {card.source}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, rotateY: 90 }}
              animate={{ scale: 1, y: 0, rotateY: 0 }}
              exit={{ scale: 0.9, y: 20, rotateY: 90 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border-[12px] z-10 ${
                selectedCard.rarity === 'SP' ? 'border-emerald-300 shadow-emerald-500/50' :
                selectedCard.rarity === 'SSR' ? 'border-amber-300 shadow-amber-500/50' :
                selectedCard.rarity === 'SR' ? 'border-purple-300 shadow-purple-500/50' :
                selectedCard.rarity === 'R' ? 'border-blue-300 shadow-blue-500/50' :
                'border-slate-300 shadow-slate-500/50'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`p-8 text-center relative border-b-4 ${
                selectedCard.rarity === 'SP' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-700' :
                selectedCard.rarity === 'SSR' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-600' :
                selectedCard.rarity === 'SR' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-700' :
                selectedCard.rarity === 'R' ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white border-blue-600' :
                'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border-slate-300'
              }`}>
                <button 
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-black text-xs shadow-sm border border-white/30">
                    CLASS: {selectedCard.rarity}
                  </div>
                  <div className="text-xs font-black opacity-70">
                    No.{selectedCard.id.toString().padStart(3, '0')}
                  </div>
                </div>
                
                <div className={`w-28 h-28 mx-auto bg-white rounded-full shadow-inner flex items-center justify-center mb-4 border-4 ${
                  selectedCard.rarity === 'SP' ? 'border-emerald-200' :
                  selectedCard.rarity === 'SSR' ? 'border-amber-200' :
                  selectedCard.rarity === 'SR' ? 'border-purple-200' :
                  selectedCard.rarity === 'R' ? 'border-blue-200' :
                  'border-slate-200'
                }`}>
                  {React.createElement(IconMap[selectedCard.icon] || Award, {
                    className: `w-14 h-14 ${
                      selectedCard.rarity === 'SP' ? 'text-emerald-500' :
                      selectedCard.rarity === 'SSR' ? 'text-amber-500' :
                      selectedCard.rarity === 'SR' ? 'text-purple-500' :
                      selectedCard.rarity === 'R' ? 'text-blue-500' :
                      'text-slate-600'
                    }`
                  })}
                </div>
                
                <h2 className="text-2xl font-black mb-1 drop-shadow-sm">{selectedCard.name}</h2>
                <div className="text-xs font-bold opacity-90 tracking-wider">{selectedCard.nameEn}</div>
              </div>
              
              <div className="p-6 bg-amber-50/50">
                <div className="mb-5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> DESCRIPTION
                  </h4>
                  <p className="text-slate-700 font-bold text-sm leading-relaxed">{selectedCard.desc}</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                  <div className="absolute -top-2 -left-2 text-2xl opacity-20">❝</div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FLAVOR TEXT</h4>
                  <p className="text-slate-600 italic font-medium text-sm leading-relaxed relative z-10">"{selectedCard.flavorText}"</p>
                </div>
                
                {selectedCard.rarity === 'SP' && (
                  <div className="mt-5 text-center text-xs font-black text-emerald-700 bg-emerald-100 py-2.5 rounded-lg border border-emerald-200 shadow-sm">
                    獲得条件: {selectedCard.source}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
