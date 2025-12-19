
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';
import { 
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Line, ComposedChart, Label, Cell 
} from 'recharts';
import { DATASETS, DRILL_QUESTS } from './utils/data.js';
import * as MathUtils from './utils/math.js';

const html = htm.bind(React.createElement);

// Extra Mission Configuration with Stories
const EXTRA_MISSION_STAGES = [
    { 
        type: "cleaning",
        datasetId: "extra_cleaning_1", 
        xKey: "study_time", 
        yKey: "score", 
        targetR: 0.95,
        title: "居眠り先生の入力ミス",
        intro: "「やってしまった…」徹夜明けの先生が、テスト結果の入力中に居眠りをしてしまったようです。「勉強時間がすごいのに点数が低すぎる」などの、ありえないデータを探して修正（除外）してください！",
        explanation: "【解説】入力ミス（外れ値）は、データ全体の分析結果を大きく歪めてしまいます。たった1つのミスデータを取り除くだけで、相関係数が劇的に改善し、正しい傾向が見えるようになったはずです。"
    },
    {
        type: "selection",
        datasetId: "extra_selection_1",
        xKey: "study_time",
        yKey: "score",
        targetIds: [21, 22, 23],
        title: "天才肌の生徒を探せ",
        intro: "「勉強時間は短いのに、なぜか高得点を取る生徒が3人いるらしい…」そんな噂の真相を確かめます。散布図上で『勉強時間が短い（左側）＆点数が高い（上側）』エリアにいる3人のデータを特定（クリックして選択）してください！ ※紛らわしい生徒もいるので注意！",
        explanation: "【解説】散布図を使うと、集団の中で「特異な存在」を一目で見つけることができます。彼らは効率的な勉強法を知っているのかもしれません。平均的な傾向（回帰直線）から大きく外れたデータには、新しい発見が隠れていることがあります。"
    },
    { 
        type: "selection",
        datasetId: "extra_selection_2", 
        xKey: "equip_weight", 
        yKey: "attack", 
        targetIds: [33],
        title: "伝説の武器を発掘せよ",
        intro: "「軽くて強い武器はいくつかあるが、常識外れの性能を持つ\"伝説の1本\"があるらしい」鍛冶屋の親父からの依頼です。『非常に軽いのに、攻撃力が飛び抜けて高い』究極のデータを1つだけ特定してください！",
        explanation: "【解説】データ分析は「トレードオフ（あちらを立てればこちらが立たず）」を超える価値を見つけるのにも役立ちます。良いデータの中でも、群を抜いて優れた外れ値（アウトライヤー）を見つけることが、最強への近道です。"
    }
];

// --- Custom Hooks ---

const useDraggableWindow = (initialX, initialY) => {
    const getSafePosition = (x, y) => {
        const maxX = window.innerWidth - 50;
        const maxY = window.innerHeight - 50;
        return {
            x: Math.min(Math.max(0, x), maxX),
            y: Math.min(Math.max(0, y), maxY)
        };
    };
    const [position, setPosition] = useState(getSafePosition(initialX, initialY));
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const onPointerDown = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'INPUT') return;
        e.preventDefault();
        isDragging.current = true;
        dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onPointerUp = (e) => {
        if (isDragging.current) {
            isDragging.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };
    return { position, setPosition, onPointerDown, onPointerMove, onPointerUp };
};

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

// --- Components ---

const Card = ({ title, children, className = "" }) => html`
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 dark:border-slate-700 ${className}">
        ${title && html`<div class="px-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 font-bold text-gray-700 dark:text-slate-200 text-xs md:text-sm shrink-0">${title}</div>`}
        <div class="p-2 md:p-3 flex-1 overflow-auto flex flex-col text-gray-800 dark:text-slate-300 text-sm md:text-base">
            ${children}
        </div>
    </div>
`;

/**
 * 紙吹雪コンポーネント (Simple CSS Confetti)
 */
const SimpleConfetti = () => {
    const pieces = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100 + '%';
            const animationDelay = Math.random() * 0.5 + 's';
            const bgColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
            const color = bgColors[Math.floor(Math.random() * bgColors.length)];
            return { id: i, left, animationDelay, color };
        });
    }, []);

    return html`
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-50">
            ${pieces.map(p => html`
                <div key=${p.id} class="confetti-piece" style=${{ left: p.left, animationDelay: p.animationDelay, backgroundColor: p.color }}></div>
            `)}
        </div>
    `;
};

/**
 * 相関マスターモード (MasterMode)
 * ランダムに生成された散布図の相関係数を当てるゲーム
 * チュートリアル -> 練習 -> 本番 のフロー
 */
const MasterMode = ({ onExit }) => {
    // phase: 'intro' (説明), 'practice' (練習問題), 'practice_result' (練習結果), 'game_start' (本番開始), 'playing' (回答中), 'result' (結果), 'finished' (最終スコア)
    const [phase, setPhase] = useState('intro');
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [currentData, setCurrentData] = useState(null);
    const [userGuess, setUserGuess] = useState(0);
    const [history, setHistory] = useState([]);
    const TOTAL_ROUNDS = 5; // 10 -> 5 に変更

    // データ生成ロジック（詳細な統計量も計算して返す）
    const generateData = () => {
        const count = 30;
        // ランダムな相関パターンを生成
        const types = ['strong_pos', 'mod_pos', 'weak_pos', 'none', 'weak_neg', 'mod_neg', 'strong_neg'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let slope = 0;
        let noiseLevel = 0;
        
        switch(type) {
            case 'strong_pos': slope = 1 + Math.random(); noiseLevel = 15; break;
            case 'mod_pos': slope = 0.5 + Math.random(); noiseLevel = 40; break;
            case 'weak_pos': slope = 0.2 + Math.random() * 0.3; noiseLevel = 80; break;
            case 'none': slope = (Math.random() - 0.5) * 0.2; noiseLevel = 100; break;
            case 'weak_neg': slope = -0.2 - Math.random() * 0.3; noiseLevel = 80; break;
            case 'mod_neg': slope = -0.5 - Math.random(); noiseLevel = 40; break;
            case 'strong_neg': slope = -1 - Math.random(); noiseLevel = 15; break;
        }

        const data = [];
        for(let i=0; i<count; i++) {
            const x = Math.random() * 100;
            const y = (x * slope) + 50 + ((Math.random() - 0.5) * 2 * noiseLevel);
            data.push({ id: i, x, y });
        }
        
        // 統計量の計算
        const n = data.length;
        const meanX = data.reduce((a, b) => a + b.x, 0) / n;
        const meanY = data.reduce((a, b) => a + b.y, 0) / n;
        let sumXY = 0, sumXX = 0, sumYY = 0;
        data.forEach(p => {
            sumXY += (p.x - meanX) * (p.y - meanY);
            sumXX += (p.x - meanX) ** 2;
            sumYY += (p.y - meanY) ** 2;
        });
        
        const covariance = sumXY / n; // 共分散
        const stdDevX = Math.sqrt(sumXX / n); // Xの標準偏差
        const stdDevY = Math.sqrt(sumYY / n); // Yの標準偏差
        const r = denominator(stdDevX * stdDevY) === 0 ? 0 : covariance / (stdDevX * stdDevY);

        return { 
            data, 
            r, 
            stats: { meanX, meanY, covariance, stdDevX, stdDevY } 
        };
    };

    const denominator = (val) => val === 0 ? 1 : val; // ゼロ除算防止

    useEffect(() => {
        if (phase === 'practice' || phase === 'game_start') {
            setCurrentData(generateData());
            setUserGuess(0);
            if (phase === 'game_start') setPhase('playing');
        }
    }, [phase]);

    const calculatePoints = (correctR, guessR) => {
        const diff = Math.abs(correctR - guessR);
        return Math.max(0, Math.round((1 - (diff * 2)) * 100));
    };

    const handleSubmit = () => {
        const points = calculatePoints(currentData.r, userGuess);
        
        if (phase === 'practice') {
            setPhase('practice_result');
        } else {
            setScore(prev => prev + points);
            setHistory(prev => [...prev, { round, r: currentData.r, guess: userGuess, points }]);
            setPhase('result');
        }
    };

    const handleNext = () => {
        if (phase === 'practice_result') {
            setRound(1);
            setScore(0);
            setHistory([]);
            setPhase('game_start');
        } else if (phase === 'result') {
            if (round >= TOTAL_ROUNDS) {
                setPhase('finished');
            } else {
                setRound(prev => prev + 1);
                setCurrentData(generateData());
                setUserGuess(0);
                setPhase('playing');
            }
        }
    };

    const handleRetry = () => {
        setRound(1);
        setScore(0);
        setHistory([]);
        setPhase('game_start');
    };

    // 共通のゲーム画面レンダリング
    const renderGameScreen = (isPractice) => {
        const points = (phase === 'result' || phase === 'practice_result') ? calculatePoints(currentData.r, userGuess) : 0;
        const isPerfect = points >= 90;
        const isGreat = points >= 70 && points < 90;

        return html`
        <div class="h-full flex flex-col p-2 md:p-4 max-w-4xl mx-auto w-full animate-fade-in-up">
            <!-- Header -->
            <div class="flex justify-between items-center mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div class="font-black text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    ${isPractice ? html`
                        <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm">PRACTICE</span>
                        <span>練習問題</span>
                    ` : html`
                        <span class="text-indigo-500 mr-2">ROUND</span>
                        ${round} <span class="text-sm text-gray-400">/ ${TOTAL_ROUNDS}</span>
                    `}
                </div>
                ${!isPractice && html`
                    <div class="font-black text-xl text-gray-800 dark:text-white">
                        SCORE: <span class="text-indigo-600 dark:text-indigo-400">${score}</span>
                    </div>
                `}
            </div>

            <!-- Scatter Plot Area -->
            <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 p-2 md:p-6 mb-4 relative overflow-hidden flex flex-col justify-center">
                 <div class="absolute top-2 left-2 text-xs font-bold text-gray-300 dark:text-slate-600">X: Variable A</div>
                 <div class="absolute bottom-2 right-2 text-xs font-bold text-gray-300 dark:text-slate-600">Y: Variable B</div>
                 ${currentData && html`
                    <${ResponsiveContainer} width="100%" height="100%">
                        <${ScatterChart} margin=${{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <${CartesianGrid} strokeDasharray="3 3" opacity=${0.3} />
                            <${XAxis} type="number" dataKey="x" hide domain=${['auto', 'auto']} />
                            <${YAxis} type="number" dataKey="y" hide domain=${['auto', 'auto']} />
                            <${Scatter} data=${currentData.data} fill="#8884d8">
                                ${currentData.data.map((entry, index) => html`
                                    <${Cell} key=${index} fill="#6366f1" />
                                `)}
                            </${Scatter}>
                            ${(phase === 'result' || phase === 'practice_result') && html`
                                <!-- 回帰直線の表示 -->
                                <${Line} 
                                    data=${[
                                        { x: 0, y: MathUtils.predictY(0, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).slope, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).intercept) },
                                        { x: 100, y: MathUtils.predictY(100, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).slope, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).intercept) }
                                    ]} 
                                    dataKey="y" stroke="#f97316" strokeWidth=${3} dot=${false} 
                                    isAnimationActive=${true}
                                />
                            `}
                        </${ScatterChart}>
                    </${ResponsiveContainer}>
                 `}
                 
                 ${(phase === 'result' || phase === 'practice_result') && html`
                    <div class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in-up z-10 p-4 overflow-y-auto">
                        <!-- Effect: Confetti for high scores -->
                        ${isPerfect && html`<${SimpleConfetti} />`}

                        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border-4 ${isPerfect ? 'border-yellow-400' : 'border-indigo-500'} w-full max-w-lg text-center relative overflow-hidden">
                            <!-- Excitement Badge -->
                            ${isPerfect && html`
                                <div class="absolute -top-10 -right-10 bg-yellow-400 text-white font-black py-10 px-10 rotate-12 shadow-lg animate-pulse">
                                    PERFECT!!
                                </div>
                            `}
                            
                            <div class="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">正解 (r)</div>
                            <div class="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2 font-mono">${currentData.r.toFixed(2)}</div>
                            
                            <!-- Score Feedback -->
                            ${isPerfect ? html`
                                <div class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-rainbow mb-4 animate-scale-up-bounce">
                                    PERFECT MATCH!
                                </div>
                            ` : isGreat ? html`
                                <div class="text-2xl font-black text-green-500 mb-4 animate-bounce">
                                    GREAT GUESS!
                                </div>
                            ` : html`<div class="h-8 mb-4"></div>`}

                            <div class="flex justify-between gap-4 text-sm border-b dark:border-slate-700 pb-4 mb-4">
                                <div class="flex-1">
                                    <div class="font-bold text-gray-400 text-xs">あなたの予想</div>
                                    <div class="font-mono font-bold text-xl text-gray-800 dark:text-white">${userGuess.toFixed(2)}</div>
                                </div>
                                <div class="flex-1">
                                    <div class="font-bold text-gray-400 text-xs">誤差</div>
                                    <div class="font-mono font-bold text-xl ${points > 0 ? 'text-gray-800 dark:text-white' : 'text-red-500'}">${Math.abs(currentData.r - userGuess).toFixed(2)}</div>
                                </div>
                                ${!isPractice && html`
                                    <div class="flex-1">
                                        <div class="font-bold text-gray-400 text-xs">獲得ポイント</div>
                                        <div class="font-bold text-xl ${isPerfect ? 'text-yellow-500 scale-125' : 'text-orange-500'} transition-transform">+${points}</div>
                                    </div>
                                `}
                            </div>

                            <!-- 計算式の提示 -->
                            <div class="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-left mb-6">
                                <div class="text-xs font-bold text-gray-500 dark:text-slate-400 mb-2 border-b dark:border-slate-600 pb-1">🧮 相関係数の計算式</div>
                                <div class="flex items-center justify-center gap-3 text-sm md:text-base font-mono text-gray-800 dark:text-slate-200 py-2 overflow-x-auto">
                                    <span class="font-bold italic">r</span>
                                    <span>=</span>
                                    <div class="flex flex-col items-center text-center">
                                        <div class="border-b border-gray-400 dark:border-slate-500 px-2 pb-0.5 mb-0.5 text-xs text-gray-500 dark:text-slate-400">共分散 (S<sub>xy</sub>)</div>
                                        <div class="font-bold">${currentData.stats.covariance.toFixed(1)}</div>
                                    </div>
                                    <span>÷</span>
                                    <div class="flex flex-col items-center">
                                        <div class="border-b border-gray-400 dark:border-slate-500 px-2 pb-0.5 mb-0.5 text-xs text-gray-500 dark:text-slate-400">標準偏差の積 (S<sub>x</sub> × S<sub>y</sub>)</div>
                                        <div class="flex gap-1 items-center font-bold">
                                            <span>${currentData.stats.stdDevX.toFixed(1)}</span>
                                            <span class="text-xs">×</span>
                                            <span>${currentData.stats.stdDevY.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="text-[10px] text-gray-400 mt-2 text-center">※実際のデータに基づいた計算結果です</p>
                            </div>

                            <button onClick=${handleNext} class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                                ${isPractice ? '本番スタート！ 🔥' : (round >= TOTAL_ROUNDS ? '最終結果を見る 🏆' : '次の問題へ ➡')}
                            </button>
                        </div>
                    </div>
                 `}
            </div>

            <!-- Input Area -->
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div class="flex flex-col gap-4">
                    <div class="flex justify-between items-center px-2">
                        <div class="text-center">
                            <span class="font-mono text-gray-400 font-bold block text-xs">完全な負</span>
                            <span class="font-mono text-gray-500 font-bold">-1.00</span>
                        </div>
                        <span class="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider w-32 text-center bg-gray-50 dark:bg-slate-900 rounded-lg py-1 border dark:border-slate-700 shadow-inner">
                            ${userGuess.toFixed(2)}
                        </span>
                        <div class="text-center">
                            <span class="font-mono text-gray-400 font-bold block text-xs">完全な正</span>
                            <span class="font-mono text-gray-500 font-bold">1.00</span>
                        </div>
                    </div>
                    <input type="range" min="-1" max="1" step="0.01" value=${userGuess} 
                        onInput=${(e) => setUserGuess(parseFloat(e.target.value))}
                        disabled=${phase === 'result' || phase === 'practice_result'}
                        class="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    
                    <button onClick=${handleSubmit} disabled=${phase === 'result' || phase === 'practice_result'}
                        class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        決定
                    </button>
                </div>
            </div>
        </div>
        `;
    };

    // チュートリアル画面
    if (phase === 'intro') {
        return html`
            <div class="h-full flex flex-col items-center justify-center p-4 animate-fade-in-up bg-indigo-50 dark:bg-slate-900">
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border-2 border-indigo-200">
                    <div class="text-6xl mb-4 animate-bounce-slow">👑</div>
                    <h2 class="text-3xl font-black text-indigo-800 dark:text-indigo-300 mb-2">相関マスターモード</h2>
                    <p class="text-gray-600 dark:text-slate-400 mb-6 font-bold text-sm">
                        これは「データ探偵」の最終試験です。<br/>
                        ランダムに表示される散布図を見て、<br/>
                        その<span class="text-indigo-600 dark:text-indigo-400 font-black text-lg">相関係数（r）</span>を目視で当ててください！
                    </p>
                    
                    <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6 text-left space-y-2 text-sm border border-gray-200 dark:border-slate-600">
                        <div class="flex items-start gap-2">
                            <span class="text-xl">🎯</span>
                            <div><span class="font-bold">ルール：</span>全${TOTAL_ROUNDS}問のスコアアタック形式</div>
                        </div>
                        <div class="flex items-start gap-2">
                            <span class="text-xl">📏</span>
                            <div><span class="font-bold">操作：</span>スライダーを動かして数値を予想</div>
                        </div>
                        <div class="flex items-start gap-2">
                            <span class="text-xl">💯</span>
                            <div><span class="font-bold">得点：</span>正解に近いほど高得点（誤差0.5以上は0点）</div>
                        </div>
                    </div>

                    <button onClick=${() => setPhase('practice')} class="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-all">
                        練習問題へ進む ➡
                    </button>
                </div>
            </div>
        `;
    }

    if (phase === 'finished') {
        const getRank = (s) => {
            // 500点満点ベース
            if (s >= 450) return "S (神の目)"; // 9割
            if (s >= 400) return "A (データマスター)"; // 8割
            if (s >= 300) return "B (一人前)"; // 6割
            return "C (修行中)";
        };
        const isSRank = score >= 450;

        return html`
            <div class="h-full flex flex-col items-center justify-center p-4 animate-fade-in-up">
                ${isSRank && html`<${SimpleConfetti} />`}
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border-2 border-indigo-500 relative">
                    ${isSRank && html`
                        <div class="absolute -top-6 -right-6 text-6xl animate-bounce-slow z-20">🏆</div>
                    `}
                    <h2 class="text-2xl font-black text-gray-800 dark:text-white mb-2">RESULT</h2>
                    <div class="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-2">${score} <span class="text-xl">pts</span></div>
                    <div class="text-xl font-bold text-gray-600 dark:text-slate-300 mb-6">Rank: ${getRank(score)}</div>
                    
                    <div class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto text-sm">
                        <table class="w-full text-left">
                            <thead class="text-gray-500 dark:text-slate-400 border-b dark:border-slate-600">
                                <tr><th>Round</th><th>正解</th><th>予想</th><th>Pts</th></tr>
                            </thead>
                            <tbody class="text-gray-700 dark:text-slate-200">
                                ${history.map((h, i) => html`
                                    <tr key=${i} class="border-b dark:border-slate-700/50">
                                        <td class="py-1">${h.round}</td>
                                        <td class="font-mono font-bold">${h.r.toFixed(2)}</td>
                                        <td class="font-mono">${h.guess.toFixed(2)}</td>
                                        <td class="font-bold text-indigo-600 dark:text-indigo-400">+${h.points}</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>

                    <div class="flex gap-3">
                        <button onClick=${onExit} class="flex-1 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-600">
                            終了
                        </button>
                        <button onClick=${handleRetry} class="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all">
                            もう一度挑戦
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    return renderGameScreen(phase === 'practice' || phase === 'practice_result');
};
