import React, { useState, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ComposedChart, Line } from 'recharts';
import { generateCorrelatedData } from '../utils/dataGenerator';
import { AlertTriangle, ChevronRight, Target, Brain, Search, Activity, LineChart, RefreshCw, Play, Star, Clock, ShieldAlert, CheckCircle2, Zap, IceCream, ThermometerSun, Waves, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Step1Explanation, Step2Explanation, Step3Explanation, Step4Explanation, Step5Explanation } from './Explanations';
import GachaOverlay from './GachaOverlay';
import { CARDS } from '../data/cards';

// ==========================================
// Mini Games Components
// ==========================================

const Step1Game = ({ onClear }) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [status, setStatus] = useState('playing'); // playing, success

  const step1DataNormal = [{ x: 1, y: 30 }, { x: 2, y: 45 }, { x: 3, y: 50 }, { x: 5, y: 80 }];
  const targetX = 4;
  const targetY = 65;

  const distance = Math.sqrt(Math.pow((x - targetX)*10, 2) + Math.pow(y - targetY, 2));
  const isHit = distance < 10;

  const handleFire = () => {
    if (isHit) {
      setStatus('success');
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-800 text-white shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-cyan-400 flex items-center gap-2 text-xl">
          <Target className="w-6 h-6" />
          MISSION: ターゲット座標を狙撃せよ
        </h3>
        <div className="bg-slate-800 px-4 py-1 rounded-full text-sm font-mono text-cyan-300 border border-slate-700">
          TARGET: X=4.0, Y=65
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 h-72 bg-slate-950 rounded-xl p-4 border border-slate-800 relative overflow-hidden">
          {/* Radar scanning effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] pointer-events-none" />
          
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="x" domain={[0, 6]} ticks={[0,1,2,3,4,5,6]} stroke="#475569" tick={{fill: '#94a3b8'}} />
              <YAxis type="number" dataKey="y" domain={[0, 100]} stroke="#475569" tick={{fill: '#94a3b8'}} />
              <Scatter name="障害物" data={step1DataNormal} fill="#475569" />
              {/* Target Indicator (Ghost) */}
              <Scatter data={[{x: targetX, y: targetY}]} fill="rgba(239, 68, 68, 0.3)" shape="cross" size={100} />
              {/* Player Crosshair */}
              <Scatter data={[{x, y}]} fill={isHit ? "#22c55e" : "#06b6d4"} r={8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="flex justify-between text-sm font-bold text-slate-300 mb-2 font-mono">
              <span>X軸 (勉強時間)</span>
              <span className="text-cyan-400">{x.toFixed(1)}</span>
            </label>
            <input type="range" min="0" max="6" step="0.5" value={x} onChange={(e) => setX(parseFloat(e.target.value))} disabled={status === 'success'} className="w-full accent-cyan-500" />
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="flex justify-between text-sm font-bold text-slate-300 mb-2 font-mono">
              <span>Y軸 (点数)</span>
              <span className="text-cyan-400">{y}</span>
            </label>
            <input type="range" min="0" max="100" step="5" value={y} onChange={(e) => setY(parseFloat(e.target.value))} disabled={status === 'success'} className="w-full accent-cyan-500" />
          </div>
          
          {status === 'playing' ? (
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
              onClick={handleFire} 
              className={`w-full font-bold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2 ${isHit ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}
            >
              <Zap className="w-5 h-5" />
              {isHit ? 'ターゲット・ロックオン！撃て！' : '座標を設定せよ'}
            </motion.button>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/50 font-bold mb-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                ミッション・コンプリート！
              </div>
              <button onClick={onClear} className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 rounded-xl transition-colors">
                次へ進む
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step2Game = ({ onClear }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  
  const generateGraphs = () => {
    return [
      { data: generateCorrelatedData(30, 0.85), type: 'positive' },
      { data: generateCorrelatedData(30, -0.85), type: 'negative' },
      { data: generateCorrelatedData(30, 0), type: 'none' }
    ].sort(() => Math.random() - 0.5);
  };

  const [graphs, setGraphs] = useState(generateGraphs());
  const [targetType, setTargetType] = useState('negative');
  const targetLabels = { 'negative': '負の相関', 'positive': '正の相関', 'none': '相関なし' };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleSelect = (type) => {
    if (gameState !== 'playing') return;
    
    if (type === targetType) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 5) {
        setGameState('won');
      } else {
        setGraphs(generateGraphs());
        const types = ['positive', 'negative', 'none'];
        setTargetType(types[Math.floor(Math.random() * types.length)]);
      }
    } else {
      setTimeLeft(prev => Math.max(0, prev - 3)); // Penalty
    }
  };

  return (
    <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 shadow-sm relative overflow-hidden">
      {gameState === 'won' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-indigo-900 mb-6">スピード仕分け クリア！</h3>
          <button onClick={onClear} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-transform hover:scale-105">
            次へ進む
          </button>
        </motion.div>
      )}
      
      {gameState === 'lost' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="text-6xl mb-4">⏱️</div>
          <h3 className="text-2xl font-bold text-rose-400 mb-6">タイムアップ！</h3>
          <button onClick={() => { setScore(0); setTimeLeft(15); setGameState('playing'); }} className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-transform hover:scale-105">
            リトライ
          </button>
        </motion.div>
      )}

      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <Star className="w-6 h-6 fill-indigo-600" />
          SCORE: {score} / 5
        </div>
        <div className={`flex items-center gap-2 font-bold text-xl font-mono ${timeLeft <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
          <Clock className="w-6 h-6" />
          00:{timeLeft.toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="text-center mb-8">
        <p className="text-slate-500 font-bold mb-2">ターゲットを探せ！</p>
        <h3 className="text-2xl md:text-3xl font-black text-indigo-900 bg-indigo-100 inline-block px-6 py-2 rounded-xl">
          {targetLabels[targetType]}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {graphs.map((g, idx) => (
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            key={idx}
            onClick={() => handleSelect(g.type)}
            className="p-3 rounded-2xl border-4 border-white hover:border-indigo-400 bg-white shadow-md cursor-pointer transition-colors"
          >
            <div className="h-40 w-full pointer-events-none">
              <ResponsiveContainer>
                <ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis type="number" dataKey="x" hide domain={[0,100]}/><YAxis type="number" dataKey="y" hide domain={[0,100]}/><Scatter data={g.data} fill="#6366f1"/></ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const Step3Game = ({ onClear }) => {
  const [targetR, setTargetR] = useState(0);
  const [data, setData] = useState([]);
  const [guess, setGuess] = useState(0);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // null, 'perfect', 'good', 'bad'

  const initRound = () => {
    const r = (Math.random() * 1.8 - 0.9).toFixed(2);
    setTargetR(parseFloat(r));
    setData(generateCorrelatedData(50, parseFloat(r)));
    setGuess(0);
    setFeedback(null);
  };

  useEffect(() => { initRound(); }, []);

  const handleGuess = () => {
    const diff = Math.abs(guess - targetR);
    let points = 0;
    let result = 'bad';
    
    if (diff <= 0.1) { points = 100; result = 'perfect'; }
    else if (diff <= 0.3) { points = 50; result = 'good'; }
    
    setFeedback({ result, points, actual: targetR });
    setTotalScore(s => s + points);
  };

  const handleNextRound = () => {
    if (round >= 3) {
      // End of game handled by isGameOver
    } else {
      setRound(r => r + 1);
      initRound();
    }
  };

  const isGameOver = round >= 3 && feedback !== null;
  const isCleared = totalScore >= 150;

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-indigo-700 flex items-center gap-2 text-xl">
          <Brain className="w-6 h-6" />
          相関係数 鑑定士 (Round {round}/3)
        </h3>
        <div className="bg-white px-4 py-2 rounded-xl font-bold text-slate-700 shadow-sm border border-slate-100">
          TOTAL SCORE: <span className="text-indigo-600 text-xl">{totalScore}</span>
        </div>
      </div>
      
      {isGameOver ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-2xl text-center shadow-md border border-slate-100">
          <h3 className="text-2xl font-bold mb-4 text-slate-800">鑑定終了！</h3>
          <p className="text-slate-600 mb-6">最終スコア: <strong className="text-3xl text-indigo-600">{totalScore}</strong> / 300</p>
          {isCleared ? (
            <div className="space-y-6">
              <p className="text-emerald-600 font-bold text-xl">見事な鑑定眼です！合格！🎉</p>
              <button onClick={onClear} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-md transition-transform hover:scale-105">
                次へ進む
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-rose-500 font-bold text-xl">不合格... 150点以上が必要です。</p>
              <button onClick={() => { setRound(1); setTotalScore(0); initRound(); }} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-8 rounded-xl text-lg transition-colors">
                再挑戦する
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 h-64 bg-white rounded-xl p-2 border border-slate-200 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                <Scatter data={data} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
              <p className="text-sm text-slate-500 font-bold mb-2">あなたの鑑定値 (r)</p>
              <p className="text-5xl font-mono font-bold text-indigo-600 mb-6">
                {guess > 0 ? '+' : ''}{guess.toFixed(2)}
              </p>
              <input 
                type="range" min="-1" max="1" step="0.05" value={guess} 
                onChange={(e) => setGuess(parseFloat(e.target.value))} 
                disabled={feedback !== null}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
              />
              <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                <span>-1.0</span><span>0.0</span><span>1.0</span>
              </div>
            </div>
            
            {!feedback ? (
              <button onClick={handleGuess} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-lg shadow-md transition-transform hover:scale-105">
                鑑定する！
              </button>
            ) : (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-sm text-slate-500 mb-1">実際の相関係数: <strong className="text-slate-800">{feedback.actual}</strong></p>
                <p className={`text-2xl font-black mb-2 ${feedback.result === 'perfect' ? 'text-emerald-500' : feedback.result === 'good' ? 'text-amber-500' : 'text-rose-500'}`}>
                  {feedback.result === 'perfect' ? 'PERFECT!! (+100)' : feedback.result === 'good' ? 'GOOD! (+50)' : 'MISS... (+0)'}
                </p>
                <button onClick={handleNextRound} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors">
                  {round >= 3 ? '結果を見る' : '次のグラフへ'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Step4Game = ({ onClear }) => {
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(50);
  const [status, setStatus] = useState('playing');

  // Fixed dataset for predictable regression
  const regressionData = [
    { x: 1, y: 30 }, { x: 2, y: 40 }, { x: 3, y: 50 }, { x: 4, y: 60 }, { x: 5, y: 70 },
    { x: 1.5, y: 38 }, { x: 2.5, y: 42 }, { x: 3.5, y: 53 }, { x: 4.5, y: 58 }, { x: 5.5, y: 72 }
  ];
  
  // Ideal is slope=10, intercept=20
  const diffSlope = Math.abs(slope - 10);
  const diffIntercept = Math.abs(intercept - 20);
  // Calculate a "Sync Ratio" (0-100%)
  const syncRatio = Math.max(0, Math.round(100 - (diffSlope * 4 + diffIntercept * 1.5)));

  const handleCheck = () => {
    if (syncRatio >= 90) {
      setStatus('success');
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-800 text-white shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-rose-400 flex items-center gap-2 text-xl">
          <LineChart className="w-6 h-6" />
          レーザー・アライメント
        </h3>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-3">
          <span className="text-sm text-slate-400 font-bold">シンクロ率</span>
          <span className={`text-2xl font-mono font-black ${syncRatio >= 90 ? 'text-emerald-400' : syncRatio >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {syncRatio}%
          </span>
        </div>
      </div>
      
      <p className="text-slate-400 mb-6 text-sm">
        ミッション：スライダーを操作して赤いレーザー（回帰直線）を青いデータ群の中心に合わせろ！シンクロ率90%以上でクリアだ。
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 h-72 bg-slate-950 rounded-xl p-4 border border-slate-800 relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" dataKey="x" domain={[0, 7]} ticks={[0,1,2,3,4,5,6,7]} stroke="#475569" tick={{fill: '#94a3b8'}} />
              <YAxis type="number" dataKey="y" domain={[0, 100]} stroke="#475569" tick={{fill: '#94a3b8'}} />
              <Scatter data={regressionData} fill="#38bdf8" />
              {/* The Laser Line */}
              <Line 
                data={[{ x: 0, y: intercept }, { x: 7, y: slope * 7 + intercept }]} 
                type="linear"
                dataKey="y"
                stroke={syncRatio >= 90 ? "#10b981" : "#f43f5e"} 
                strokeWidth={4} 
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="flex justify-between text-sm font-bold text-slate-300 mb-2">
              <span>傾き (角度)</span>
              <span className="text-rose-400 font-mono">{slope}</span>
            </label>
            <input type="range" min="-10" max="30" step="1" value={slope} onChange={(e) => setSlope(parseFloat(e.target.value))} disabled={status === 'success'} className="w-full accent-rose-500" />
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="flex justify-between text-sm font-bold text-slate-300 mb-2">
              <span>切片 (高さ)</span>
              <span className="text-rose-400 font-mono">{intercept}</span>
            </label>
            <input type="range" min="0" max="100" step="5" value={intercept} onChange={(e) => setIntercept(parseFloat(e.target.value))} disabled={status === 'success'} className="w-full accent-rose-500" />
          </div>
          
          {status === 'playing' ? (
            <button 
              onClick={handleCheck} 
              disabled={syncRatio < 90}
              className={`w-full font-bold py-4 rounded-xl text-lg transition-all ${syncRatio >= 90 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            >
              {syncRatio >= 90 ? 'アライメント完了！' : 'シンクロ率が足りない...'}
            </button>
          ) : (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/50 font-bold mb-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                レーザー・フィット成功！
              </div>
              <button onClick={onClear} className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 rounded-xl transition-colors">
                次へ進む
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step5Game = ({ onClear }) => {
  const [status, setStatus] = useState('playing'); // playing, success, fail
  const [selectedOption, setSelectedOption] = useState(null);
  
  const options = [
    { id: 0, text: 'バニラの匂い', icon: IceCream, isCorrect: false, reason: 'サメはバニラの匂いには引き寄せられない。' },
    { id: 1, text: '気温の高さ', icon: ThermometerSun, isCorrect: true, reason: '気温が高いと、アイスが売れるし、海に入る人も増えるためサメの被害も増える。これが真犯人だ！' },
    { id: 2, text: '海の塩分濃度', icon: Waves, isCorrect: false, reason: '塩分濃度はアイスの売上には関係ないだろう。' },
    { id: 3, text: '日焼け止めの売上', icon: Sun, isCorrect: false, reason: 'これも気温の高さによる別の結果だ。根本原因ではない。' }
  ];

  const handleAnswer = (idx) => {
    setSelectedOption(idx);
    if (options[idx].isCorrect) {
      setStatus('success');
    } else {
      setStatus('fail');
    }
  };

  return (
    <div className="bg-amber-50 p-6 md:p-8 rounded-2xl border-2 border-amber-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b-2 border-amber-200 pb-4">
        <div className="bg-amber-600 p-3 rounded-xl text-white">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-amber-900 text-xl">名探偵の推理</h3>
          <p className="text-amber-700 text-sm font-bold">疑似相関のトリックを見破れ</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-amber-100 mb-8 shadow-sm relative">
        <div className="absolute -top-3 -left-3 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-lg transform -rotate-6 shadow-sm">TOP SECRET</div>
        <h4 className="font-black text-slate-800 mb-4 text-lg border-b border-slate-100 pb-2">事件ファイル #01：アイスとサメの謎</h4>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line mb-6 font-medium">
          海辺の町で奇妙なデータが発見された。「アイスクリームの売上」が伸びる日ほど、「サメによる被害件数」も増えているというのだ！<br/>
          町長は「アイスがサメを引き寄せている！」とアイスの販売禁止を訴えている。
        </p>

        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center w-32">
            <IceCream className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <span className="font-bold text-blue-800 text-sm">アイスの売上</span>
          </div>
          <div className="flex-1 border-t-4 border-dashed border-rose-300 relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded">相関あり？</div>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center w-32">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <span className="font-bold text-rose-800 text-sm">サメの被害</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-slate-800 font-bold flex items-start gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            探偵であるあなたには分かるはずだ。この2つに直接の因果関係はない。裏に隠された「真犯人（交絡因子）」はどれだ？
          </p>
        </div>
      </div>

      {status === 'playing' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {options.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="bg-white hover:bg-amber-100 border-2 border-amber-200 text-amber-900 font-bold p-4 rounded-xl transition-all shadow-sm flex flex-col items-center justify-center gap-3 group"
              >
                <div className="bg-amber-50 p-3 rounded-full group-hover:bg-amber-200 transition-colors">
                  <Icon className="w-8 h-8 text-amber-600" />
                </div>
                <span className="text-sm text-center">{opt.text}</span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-xl border-2 ${status === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <h4 className={`text-xl font-black mb-2 ${status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
            {status === 'success' ? '推理的中！事件解決！' : '推理ミス...'}
          </h4>
          <p className="text-slate-700 font-medium mb-6">
            {options[selectedOption].reason}
          </p>
          {status === 'success' ? (
            <button onClick={onClear} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors w-full sm:w-auto">
              予備学習を完了する
            </button>
          ) : (
            <button onClick={() => { setStatus('playing'); setSelectedOption(null); }} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors w-full sm:w-auto">
              もう一度推理する
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};


// ==========================================
// Learning Content Data
// ==========================================

const learningContents = {
  1: {
    title: "1. 散布図（さんぷず）とは？",
    content: <Step1Explanation />
  },
  2: {
    title: "2. 相関関係（そうかんかんけい）",
    content: <Step2Explanation />
  },
  3: {
    title: "3. 相関係数（そうかんけいすう）",
    content: <Step3Explanation />
  },
  4: {
    title: "4. 回帰分析（かいきぶんせき）",
    content: <Step4Explanation />
  },
  5: {
    title: "5. 因果関係と疑似相関",
    content: <Step5Explanation />
  }
};


// ==========================================
// Main Component
// ==========================================

export default function LearningPhase({ onComplete, onUnlockCard }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('learning'); // 'learning' | 'game'
  const [completedSteps, setCompletedSteps] = useState([]);
  const [readTimer, setReadTimer] = useState(5);
  const [showGacha, setShowGacha] = useState(false);
  const [gachaCard, setGachaCard] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mode === 'learning') {
      setReadTimer(5);
      const timer = setInterval(() => {
        setReadTimer(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, mode]);

  const handleNextStep = () => {
    const newCompleted = [...new Set([...completedSteps, step])];
    setCompletedSteps(newCompleted);
    
    if (newCompleted.length === 5) {
      const spCard = CARDS.find(c => c.id === 1);
      setGachaCard(spCard);
      setShowGacha(true);
      if (onUnlockCard) onUnlockCard(1); // Unlock SP Card 1
    } else {
      for (let i = 1; i <= 5; i++) {
        if (!newCompleted.includes(i)) {
          setStep(i);
          setMode('learning');
          return;
        }
      }
    }
  };

  const handleStepClick = (s) => {
    setStep(s);
    setMode('learning');
  };

  const renderGame = () => {
    switch(step) {
      case 1: return <Step1Game onClear={handleNextStep} />;
      case 2: return <Step2Game onClear={handleNextStep} />;
      case 3: return <Step3Game onClear={handleNextStep} />;
      case 4: return <Step4Game onClear={handleNextStep} />;
      case 5: return <Step5Game onClear={handleNextStep} />;
      default: return null;
    }
  };

  if (showGacha && gachaCard) {
    return <GachaOverlay card={gachaCard} onClose={() => {
      setShowGacha(false);
      onComplete();
    }} />;
  }

  return (
    <div className="w-full mx-auto pb-16 px-4 sm:px-6 lg:px-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
          <span>Step {step} of 5</span>
          <span>{mode === 'learning' ? '学習中' : 'ゲーム挑戦中'}</span>
        </div>
        <div className="flex gap-2 h-2">
          {[1,2,3,4,5].map(s => (
            <button 
              key={s} 
              onClick={() => handleStepClick(s)}
              className="flex-1 bg-slate-200 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all relative"
            >
              <div 
                className={`h-full transition-all duration-500 ${completedSteps.includes(s) ? 'bg-emerald-500' : s === step ? (mode === 'learning' ? 'bg-indigo-400' : 'bg-indigo-600') : 'bg-transparent'}`}
                style={{ width: completedSteps.includes(s) ? '100%' : (s === step ? (mode === 'learning' ? '50%' : '100%') : '0%') }}
              />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'learning' ? (
          <motion.div
            key={`learning-${step}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="border-l-4 border-indigo-500 pl-4">
              <h2 className="text-2xl font-bold text-slate-800">{learningContents[step].title}</h2>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="mb-10">
                {learningContents[step].content}
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-center">
                <h3 className="font-bold text-indigo-900 mb-2 text-lg">知識を試そう！</h3>
                <p className="text-indigo-700 mb-6 text-sm">学んだ内容を使って、ミニゲームに挑戦してください。</p>
                <motion.button
                  whileHover={readTimer === 0 ? { scale: 1.05 } : {}}
                  whileTap={readTimer === 0 ? { scale: 0.95 } : {}}
                  onClick={() => readTimer === 0 && setMode('game')}
                  disabled={readTimer > 0}
                  className={`font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto mx-auto text-lg ${readTimer === 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  {readTimer > 0 ? (
                    <><Clock className="w-5 h-5" /> あと {readTimer} 秒読んでね</>
                  ) : (
                    <><Play className="w-5 h-5 fill-current" /> ミニゲームに挑戦する</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`game-${step}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => setMode('learning')}
              className="mb-6 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> 学習ページに戻る
            </button>
            {renderGame()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
