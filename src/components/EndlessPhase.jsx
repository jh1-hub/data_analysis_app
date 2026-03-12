import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Trophy, Heart, Zap, Play, RotateCcw, Activity, Timer, Flame, Gift, Scale, Grip, Link as LinkIcon, AlignCenter, BarChart2, AlertCircle, MoveHorizontal, ArrowRight, Unlink, TrendingUp, Sparkles, Home, Search, Database, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CARDS } from '../data/cards';
import GachaOverlay from './GachaOverlay';

const IconMap = {
  Scale, Grip, Link: LinkIcon, AlignCenter, BarChart2, AlertCircle, MoveHorizontal, ArrowRight, Unlink, TrendingUp
};

// Box-Muller transform to generate correlated data
const generateCorrelatedData = (n, r) => {
  const data = [];
  for (let i = 0; i < n; i++) {
    let u1 = Math.random();
    let u2 = Math.random();
    if (u1 === 0) u1 = 0.0001;
    
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    const x = z1;
    const y = r * z1 + Math.sqrt(1 - r * r) * z2;
    
    // Scale to 0-100 (mean 50, stddev 15)
    const scaledX = Math.max(0, Math.min(100, x * 15 + 50));
    const scaledY = Math.max(0, Math.min(100, y * 15 + 50));
    
    data.push({ x: Math.round(scaledX), y: Math.round(scaledY) });
  }
  return data;
};

const OPTIONS = [
  { id: 'strong_pos', label: '強い正の相関', color: 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200' },
  { id: 'weak_pos', label: '弱い正の相関', color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' },
  { id: 'none', label: '相関なし', color: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' },
  { id: 'weak_neg', label: '弱い負の相関', color: 'bg-teal-100 text-teal-700 border-teal-300 hover:bg-teal-200' },
  { id: 'strong_neg', label: '強い負の相関', color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' },
];

const generateQuestion = (currentStreak) => {
  const types = ['strong_pos', 'weak_pos', 'none', 'weak_neg', 'strong_neg'];
  const type = types[Math.floor(Math.random() * types.length)];

  const isHard = currentStreak >= 10;
  const isExtreme = currentStreak >= 20;

  // Adjust correlation coefficients based on difficulty
  // Extreme pushes values closer to the boundaries, making it harder to distinguish
  let baseR = 0;
  if (type === 'strong_pos') baseR = isExtreme ? 0.78 : isHard ? 0.85 : 0.95;
  if (type === 'weak_pos') baseR = isExtreme ? (Math.random() > 0.5 ? 0.62 : 0.38) : isHard ? 0.5 : 0.55;
  if (type === 'none') baseR = isExtreme ? (Math.random() > 0.5 ? 0.25 : -0.25) : isHard ? 0.15 : 0.0;
  if (type === 'weak_neg') baseR = isExtreme ? (Math.random() > 0.5 ? -0.62 : -0.38) : isHard ? -0.5 : -0.55;
  if (type === 'strong_neg') baseR = isExtreme ? -0.78 : isHard ? -0.85 : -0.95;

  // Add slight random variance
  const r = baseR + (Math.random() * 0.04 - 0.02);
  
  // Points count decreases as it gets harder, making it visually noisier
  const pointsCount = Math.max(20, 60 - Math.floor(currentStreak * 1.5));
  
  // Time limit decreases (starts at 10s, drops to 2.5s)
  const timeLimit = Math.max(2500, 10000 - currentStreak * 300);

  return { r, type, pointsCount, timeLimit };
};

export default function EndlessPhase({ onBack, onUnlockCard, unlockedCards = [], highScore, setHighScore }) {
  const [gameState, setGameState] = useState('intro'); // intro, playing, gameover
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [penaltyMultiplier, setPenaltyMultiplier] = useState(1);
  
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentData, setCurrentData] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(100);
  const [timeLimit, setTimeLimit] = useState(10000);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Gacha states
  const [showGacha, setShowGacha] = useState(false);
  const [gachaCard, setGachaCard] = useState(null);

  const handleTimeoutRef = useRef();

  const nextQuestion = (currentStreak) => {
    const q = generateQuestion(currentStreak);
    setCurrentLevel({ type: q.type, r: q.r });
    setCurrentData(generateCorrelatedData(q.pointsCount, q.r));
    setTimeLimit(q.timeLimit);
    setTimeLeft(100);
    setFeedback(null);
    setIsAnimating(false);
    setIsTimerRunning(true);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setTotalCorrect(0);
    setPenaltyMultiplier(1);
    setGameState('playing');
    nextQuestion(0);
  };

  handleTimeoutRef.current = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTimerRunning(false);
    setStreak(0);
    setPenaltyMultiplier(0.5);
    const rText = currentLevel ? `(r = ${currentLevel.r.toFixed(2)})` : '';
    setFeedback({ type: 'incorrect', text: `TIME OUT. ${rText}` });

    setTimeout(() => {
      setLives(l => {
        if (l <= 1) {
          setGameState('gameover');
          return 0;
        }
        nextQuestion(0);
        return l - 1;
      });
    }, 2000);
  };

  useEffect(() => {
    if (!isTimerRunning || gameState !== 'playing') return;

    const updateInterval = 50;
    const dropRate = 100 / (timeLimit / updateInterval);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev - dropRate <= 0) {
          clearInterval(timer);
          handleTimeoutRef.current();
          return 0;
        }
        return prev - dropRate;
      });
    }, updateInterval);

    return () => clearInterval(timer);
  }, [isTimerRunning, gameState, timeLimit]);

  const handleAnswer = (type) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTimerRunning(false);

    const isCorrect = type === currentLevel.type;
    
    if (isCorrect) {
      const timeBonus = Math.floor((timeLeft / 100) * 50);
      const basePoints = 100 + (streak * 20) + timeBonus;
      const points = Math.floor(basePoints * penaltyMultiplier);
      const newScore = score + points;
      
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      
      const newTotalCorrect = totalCorrect + 1;
      setTotalCorrect(newTotalCorrect);
      
      let feedbackText = `DATA MATCHED. +${points}pt`;
      if (penaltyMultiplier < 1) {
        feedbackText += ` (PENALTY APPLIED)`;
      }
      feedbackText += ` (r = ${currentLevel.r.toFixed(2)})`;
      setFeedback({ type: 'correct', text: feedbackText });
      setPenaltyMultiplier(1);
      
      setTimeout(() => {
        if (newTotalCorrect >= 5) {
          // Trigger gacha with score-based probability
          const pool = CARDS.filter(c => c.rarity !== 'SP');
          
          let weights = pool.map(card => {
            let weight = 0;
            switch(card.rarity) {
              case 'N': weight = 100; break;
              case 'R': weight = 50; break;
              case 'SR': weight = 15 + (newScore / 500); break;
              case 'SSR': weight = 3 + (newScore / 1000); break;
              default: weight = 10;
            }
            
            // Boost unowned cards
            if (!unlockedCards.includes(card.id)) {
              weight *= 5; // 5x chance to get unowned
            }
            
            return { card, weight };
          });
          
          const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
          let rand = Math.random() * totalWeight;
          
          let cardToUnlock = pool[0];
          for (let item of weights) {
            if (rand < item.weight) {
              cardToUnlock = item.card;
              break;
            }
            rand -= item.weight;
          }
          
          setGachaCard(cardToUnlock);
          setShowGacha(true);
          if (onUnlockCard) onUnlockCard(cardToUnlock.id);
        } else {
          nextQuestion(newStreak);
        }
      }, 1500);
    } else {
      setStreak(0);
      setPenaltyMultiplier(0.5);
      const correctLabel = OPTIONS.find(o => o.id === currentLevel.type).label;
      setFeedback({ type: 'incorrect', text: `DATA MISMATCH. 正解: ${correctLabel} (r = ${currentLevel.r.toFixed(2)})` });
      
      setTimeout(() => {
        setLives(l => {
          if (l <= 1) {
            setGameState('gameover');
            return 0;
          }
          nextQuestion(0);
          return l - 1;
        });
      }, 2000);
    }
  };

  const closeGacha = () => {
    setShowGacha(false);
    setGachaCard(null);
    onBack(); // Return to top
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-white p-10 rounded-3xl shadow-lg border-4 border-amber-100 text-center space-y-8">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flame className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-4xl font-black text-slate-800">相関チャレンジ<br/><span className="text-2xl text-amber-600">〜データサイエンティスト編〜</span></h2>
          <p className="text-lg text-slate-600 font-bold leading-relaxed">
            表示される<span className="text-indigo-600">「生の数値データ（表）」</span>から相関を素早く読み解こう！<br/>
            時間が経つと散布図に点が打たれて分かりやすくなるが、<br/>
            <span className="text-rose-600">早く答えるほど高得点！</span> 時間切れはミス扱いだ。<br/>
            <span className="text-amber-600">正解数5回でクリア！カードガチャが引けるぞ！</span><br/>
            <span className="text-rose-600">ERRORやTIMEOUTで次の獲得スコアにペナルティが発生する。</span>限界のスコアに挑め！
          </p>

          <div className="bg-slate-800 text-cyan-400 p-4 rounded-xl font-mono text-sm mt-4 border border-cyan-900 shadow-inner">
            <div className="text-center font-bold mb-3 text-cyan-300 flex items-center justify-center gap-2">
              <Cpu className="w-5 h-5" />
              【相関係数(r)の判定基準】
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center mb-2">
              <div className="bg-slate-900 py-2 rounded border border-slate-700">|r| ≧ 0.7 : <span className="text-emerald-400">強い相関</span></div>
              <div className="bg-slate-900 py-2 rounded border border-slate-700">0.2 ≦ |r| &lt; 0.7 : <span className="text-amber-400">弱い相関</span></div>
              <div className="bg-slate-900 py-2 rounded border border-slate-700 sm:col-span-2">|r| &lt; 0.2 : <span className="text-slate-400">ほぼ相関なし</span></div>
            </div>
            <div className="text-center text-xs text-cyan-600 mt-2">
              ※一般的な「中程度の相関(0.4〜0.7)」は、このゲームでは「弱い相関」として判定します。
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div>
              <div className="font-black text-rose-600 mb-1">強い相関</div>
              <div className="text-sm text-slate-500 font-bold">Aが増えるとBも確実に増える（または減る）状態。</div>
            </div>
            <div>
              <div className="font-black text-orange-500 mb-1">弱い相関</div>
              <div className="text-sm text-slate-500 font-bold">全体的な傾向はあるが、例外も混ざっている状態。</div>
            </div>
            <div>
              <div className="font-black text-slate-600 mb-1">相関なし</div>
              <div className="text-sm text-slate-500 font-bold">AとBの増減に全く規則性が見られない状態。</div>
            </div>
          </div>

          <button 
            onClick={startGame}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xl font-black py-4 px-12 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-3 mx-auto"
          >
            <Play className="w-6 h-6 fill-white" />
            限界に挑戦する！
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-3xl shadow-lg border-4 border-slate-200 text-center space-y-8"
        >
          <Trophy className="w-24 h-24 mx-auto text-amber-400 drop-shadow-md" />
          <h2 className="text-4xl font-black text-slate-800">ゲームオーバー</h2>
          
          <div className="bg-slate-50 p-6 rounded-2xl inline-block min-w-[300px]">
            <div className="text-slate-500 font-bold mb-2">最終スコア</div>
            <div className="text-5xl font-black text-indigo-600 mb-4">{score} <span className="text-2xl">pt</span></div>
            <div className="text-slate-500 font-bold">最大連続正解: <span className="text-amber-500">{maxStreak}回</span></div>
            <div className="text-slate-500 font-bold">総正解数: <span className="text-emerald-500">{totalCorrect}回</span></div>
          </div>

          <div className="flex justify-center gap-4">
            <button 
              onClick={onBack}
              className="bg-slate-800 hover:bg-slate-700 text-white text-lg font-black py-4 px-10 rounded-full shadow-md transition-all flex items-center gap-2 mx-auto"
            >
              <Home className="w-5 h-5" />
              トップへ戻る
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentLevelNum = Math.floor(streak / 5) + 1;
  const visibleDataCount = currentData.length > 0 
    ? Math.min(currentData.length, Math.floor(((100 - timeLeft) / 100) * currentData.length) + 1)
    : 0;

  if (showGacha && gachaCard) {
    return <GachaOverlay card={gachaCard} onClose={closeGacha} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className={`w-8 h-8 ${i < lives ? 'fill-rose-500 text-rose-500' : 'fill-slate-200 text-slate-200'}`} />
            ))}
          </div>
          <div className={`flex items-center gap-2 font-black text-xl transition-colors ${streak >= 10 ? 'text-rose-500' : streak >= 5 ? 'text-amber-500' : 'text-slate-400'}`}>
            <Flame className={`w-6 h-6 ${streak >= 5 ? 'fill-current' : ''}`} />
            {streak} 連鎖
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center hidden sm:block">
            <div className="text-xs text-slate-400 font-bold">LEVEL</div>
            <div className="text-xl font-black text-slate-700">Lv.{currentLevelNum}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 font-bold">SCORE</div>
            <div className="text-3xl font-black text-indigo-600 leading-none">{score}</div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        
        {/* Timer Bar */}
        <div className="flex items-center gap-3 mb-4">
          <Timer className={`w-5 h-5 ${timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                timeLeft > 50 ? 'bg-emerald-500' : timeLeft > 25 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
        </div>

        <div className="relative mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Table Area */}
            <div className="md:col-span-1 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-[400px] shadow-inner">
              <div className="bg-slate-900 px-4 py-2 text-xs font-bold text-slate-400 flex justify-between border-b border-slate-700">
                <span className="w-8">ID</span>
                <span className="flex-1 text-center">データA</span>
                <span className="flex-1 text-center">データB</span>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1 font-mono text-xs">
                {currentData.map((d, i) => {
                  const isPlotted = i < visibleDataCount;
                  return (
                    <div key={i} className={`flex justify-between px-2 py-1 rounded ${isPlotted ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500'}`}>
                      <span className="w-8 opacity-50">{i+1}</span>
                      <span className="flex-1 text-center">{d.x}</span>
                      <span className="flex-1 text-center">{d.y}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart Area */}
            <div className="md:col-span-2 h-[400px] bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="x" domain={[0, 100]} tick={false} axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }} />
                  <YAxis type="number" dataKey="y" domain={[0, 100]} tick={false} axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }} />
                  <Scatter data={currentData.slice(0, visibleDataCount)} fill="#6366f1" isAnimationActive={false} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl z-10`}
              >
                <div className={`text-3xl font-black px-8 py-4 rounded-2xl shadow-xl ${
                  feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {feedback.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt.id)}
              disabled={isAnimating}
              className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all ${opt.color} ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-md'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
