
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';
import { 
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Line, ComposedChart, Label, Cell 
} from 'recharts';
import { DATASETS, DRILL_QUESTS } from './utils/data.js';
import * as MathUtils from './utils/math.js';
import { LectureMode } from './LectureMode.js';

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
 * 紙吹雪コンポーネント
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
 * 相関マスターモード
 */
const MasterMode = ({ onExit }) => {
    const [phase, setPhase] = useState('intro');
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [currentData, setCurrentData] = useState(null);
    const [userGuess, setUserGuess] = useState(0);
    const [history, setHistory] = useState([]);
    const TOTAL_ROUNDS = 5;

    const generateData = () => {
        const count = 30;
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
        
        const n = data.length;
        const meanX = data.reduce((a, b) => a + b.x, 0) / n;
        const meanY = data.reduce((a, b) => a + b.y, 0) / n;
        let sumXY = 0, sumXX = 0, sumYY = 0;
        data.forEach(p => {
            sumXY += (p.x - meanX) * (p.y - meanY);
            sumXX += (p.x - meanX) ** 2;
            sumYY += (p.y - meanY) ** 2;
        });
        
        const denominator = (val) => val === 0 ? 1 : val;
        const covariance = sumXY / n;
        const stdDevX = Math.sqrt(sumXX / n);
        const stdDevY = Math.sqrt(sumYY / n);
        const r = denominator(stdDevX * stdDevY) === 0 ? 0 : covariance / (stdDevX * stdDevY);

        return { data, r, stats: { meanX, meanY, covariance, stdDevX, stdDevY } };
    };

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

    const renderGameScreen = (isPractice) => {
        const points = (phase === 'result' || phase === 'practice_result') ? calculatePoints(currentData.r, userGuess) : 0;
        const isPerfect = points >= 90;
        const isGreat = points >= 70 && points < 90;

        return html`
        <div class="h-full flex flex-col p-2 md:p-4 max-w-4xl mx-auto w-full animate-fade-in-up">
            <div class="flex justify-between items-center mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div class="font-black text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    ${isPractice ? html`<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm">PRACTICE</span>` : html`<span class="text-indigo-500 mr-2">ROUND</span>${round} <span class="text-sm text-gray-400">/ ${TOTAL_ROUNDS}</span>`}
                </div>
                ${!isPractice && html`<div class="font-black text-xl text-gray-800 dark:text-white">SCORE: <span class="text-indigo-600 dark:text-indigo-400">${score}</span></div>`}
            </div>
            <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 p-2 md:p-6 mb-4 relative overflow-hidden flex flex-col justify-center">
                 ${currentData && html`
                    <${ResponsiveContainer} width="100%" height="100%">
                        <${ScatterChart} margin=${{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <${CartesianGrid} strokeDasharray="3 3" opacity=${0.3} />
                            <${XAxis} type="number" dataKey="x" hide domain=${['auto', 'auto']} />
                            <${YAxis} type="number" dataKey="y" hide domain=${['auto', 'auto']} />
                            <${Scatter} data=${currentData.data} fill="#8884d8">
                                ${currentData.data.map((entry, index) => html`<${Cell} key=${index} fill="#6366f1" />`)}
                            </${Scatter}>
                            ${(phase === 'result' || phase === 'practice_result') && html`
                                <${Line} 
                                    data=${[{ x: 0, y: MathUtils.predictY(0, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).slope, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).intercept) }, { x: 100, y: MathUtils.predictY(100, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).slope, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).intercept) }]} 
                                    dataKey="y" stroke="#f97316" strokeWidth=${3} dot=${false} isAnimationActive=${true}
                                />
                            `}
                        </${ScatterChart}>
                    </${ResponsiveContainer}>
                 `}
                 ${(phase === 'result' || phase === 'practice_result') && html`
                    <div class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in-up z-10 p-4 overflow-y-auto">
                        ${isPerfect && html`<${SimpleConfetti} />`}
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border-4 ${isPerfect ? 'border-yellow-400' : 'border-indigo-500'} w-full max-w-lg text-center relative overflow-hidden">
                            ${isPerfect && html`<div class="absolute -top-10 -right-10 bg-yellow-400 text-white font-black py-10 px-10 rotate-12 shadow-lg animate-pulse">PERFECT!!</div>`}
                            <div class="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">正解 (r)</div>
                            <div class="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2 font-mono">${currentData.r.toFixed(2)}</div>
                            <div class="flex justify-between gap-4 text-sm border-b dark:border-slate-700 pb-4 mb-4">
                                <div class="flex-1"><div class="font-bold text-gray-400 text-xs">予想</div><div class="font-mono font-bold text-xl text-gray-800 dark:text-white">${userGuess.toFixed(2)}</div></div>
                                <div class="flex-1"><div class="font-bold text-gray-400 text-xs">誤差</div><div class="font-mono font-bold text-xl ${points > 0 ? 'text-gray-800 dark:text-white' : 'text-red-500'}">${Math.abs(currentData.r - userGuess).toFixed(2)}</div></div>
                                ${!isPractice && html`<div class="flex-1"><div class="font-bold text-gray-400 text-xs">Pts</div><div class="font-bold text-xl ${isPerfect ? 'text-yellow-500 scale-125' : 'text-orange-500'} transition-transform">+${points}</div></div>`}
                            </div>
                            <button onClick=${handleNext} class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">${isPractice ? '本番スタート！ 🔥' : (round >= TOTAL_ROUNDS ? '最終結果を見る 🏆' : '次の問題へ ➡')}</button>
                        </div>
                    </div>
                 `}
            </div>
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div class="flex flex-col gap-4">
                    <div class="flex justify-between items-center px-2">
                        <span class="font-mono text-gray-400 font-bold block text-xs">-1.00</span>
                        <span class="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider w-32 text-center bg-gray-50 dark:bg-slate-900 rounded-lg py-1 border dark:border-slate-700 shadow-inner">${userGuess.toFixed(2)}</span>
                        <span class="font-mono text-gray-500 font-bold">1.00</span>
                    </div>
                    <input type="range" min="-1" max="1" step="0.01" value=${userGuess} onInput=${(e) => setUserGuess(parseFloat(e.target.value))} disabled=${phase === 'result' || phase === 'practice_result'} class="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    <button onClick=${handleSubmit} disabled=${phase === 'result' || phase === 'practice_result'} class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">決定</button>
                </div>
            </div>
        </div>`;
    };

    if (phase === 'intro') {
        return html`
            <div class="h-full flex flex-col items-center justify-center p-4 animate-fade-in-up bg-indigo-50 dark:bg-slate-900">
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border-2 border-indigo-200">
                    <div class="text-6xl mb-4 animate-bounce-slow">👑</div>
                    <h2 class="text-3xl font-black text-indigo-800 dark:text-indigo-300 mb-2">相関マスターモード</h2>
                    <p class="text-gray-600 dark:text-slate-400 mb-6 font-bold text-sm">ランダムな散布図を見て、<span class="text-indigo-600 dark:text-indigo-400 font-black text-lg">相関係数（r）</span>を当ててください！</p>
                    <button onClick=${() => setPhase('practice')} class="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-all">練習問題へ進む ➡</button>
                    <button onClick=${onExit} class="mt-4 text-gray-400 hover:text-gray-600 text-sm font-bold underline">メニューに戻る</button>
                </div>
            </div>
        `;
    }

    if (phase === 'finished') {
        const getRank = (s) => s >= 450 ? "S (神の目)" : s >= 400 ? "A (データマスター)" : s >= 300 ? "B (一人前)" : "C (修行中)";
        return html`
            <div class="h-full flex flex-col items-center justify-center p-4 animate-fade-in-up">
                ${score >= 450 && html`<${SimpleConfetti} />`}
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border-2 border-indigo-500 relative">
                    <h2 class="text-2xl font-black text-gray-800 dark:text-white mb-2">RESULT</h2>
                    <div class="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-2">${score} <span class="text-xl">pts</span></div>
                    <div class="text-xl font-bold text-gray-600 dark:text-slate-300 mb-6">Rank: ${getRank(score)}</div>
                    <div class="flex gap-3">
                        <button onClick=${onExit} class="flex-1 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-300">終了</button>
                        <button onClick=${handleRetry} class="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all">もう一度挑戦</button>
                    </div>
                </div>
            </div>
        `;
    }

    return renderGameScreen(phase === 'practice' || phase === 'practice_result');
};

/**
 * Drill Mode Component
 */
const DrillMode = ({ onExit }) => {
    const [questIndex, setQuestIndex] = useState(0);
    const [selectedVar, setSelectedVar] = useState("");
    const [showResult, setShowResult] = useState(false);
    
    const quest = DRILL_QUESTS[questIndex];
    const dataset = DATASETS.find(d => d.id === quest.datasetId);
    
    const xKey = quest.initialX;
    const yKey = quest.initialY; 
    const isTargetX = quest.targetKey === xKey;
    
    const currentX = isTargetX ? quest.targetKey : selectedVar || xKey;
    const currentY = isTargetX ? selectedVar || yKey : quest.targetKey;

    const isCorrect = quest.validAnswers.includes(selectedVar);
    const r = MathUtils.calculateCorrelation(
        dataset.data.map(d => d[currentX]),
        dataset.data.map(d => d[currentY])
    );

    const handleCheck = () => {
        setShowResult(true);
    };

    const handleNext = () => {
        if (questIndex < DRILL_QUESTS.length - 1) {
            setQuestIndex(prev => prev + 1);
            setSelectedVar("");
            setShowResult(false);
        } else {
            onExit();
        }
    };

    const options = dataset.columns.filter(c => c.key !== quest.targetKey);

    return html`
        <div class="h-full flex flex-col bg-gray-50 dark:bg-slate-900">
            <!-- Header -->
            <div class="bg-white dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shadow-sm z-10">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow">QUEST ${quest.id}</div>
                    <div class="text-sm font-bold text-gray-700 dark:text-slate-300">データ探偵</div>
                </div>
                <button onClick=${onExit} class="text-gray-400 hover:text-gray-600 text-sm font-bold">終了</button>
            </div>

            <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                <!-- Left Panel: Instruction & Chart -->
                <div class="flex-1 p-4 overflow-y-auto relative flex flex-col bg-slate-100 dark:bg-slate-900">
                    <!-- Instruction Card -->
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 dark:border-blue-400 mb-6 shrink-0">
                        <div class="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2 text-lg">
                            <span class="text-2xl">📩</span> 依頼内容
                        </div>
                        <div class="text-sm md:text-base leading-relaxed text-gray-800 dark:text-slate-200 whitespace-pre-wrap mb-4 font-medium">
                            ${quest.text}
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start">
                            <span class="text-2xl">🔎</span>
                            <div>
                                <div class="text-xs font-bold text-blue-600 dark:text-blue-300 mb-1">捜査目標</div>
                                <div class="font-bold text-gray-800 dark:text-white">${quest.explicitObjective}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Chart Area -->
                    <div class="flex-1 min-h-[300px] bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 p-4 relative">
                        <${ResponsiveContainer} width="100%" height="100%">
                            <${ScatterChart} margin=${{ top: 20, right: 20, bottom: 40, left: 40 }}>
                                <${CartesianGrid} strokeDasharray="3 3" opacity=${0.5} />
                                <${XAxis} 
                                    type="number" 
                                    dataKey=${currentX} 
                                    name=${dataset.columns.find(c=>c.key===currentX)?.label} 
                                    unit="" 
                                    label=${{ value: dataset.columns.find(c=>c.key===currentX)?.label, position: 'bottom', offset: 0 }} 
                                />
                                <${YAxis} 
                                    type="number" 
                                    dataKey=${currentY} 
                                    name=${dataset.columns.find(c=>c.key===currentY)?.label} 
                                    unit="" 
                                    label=${{ value: dataset.columns.find(c=>c.key===currentY)?.label, angle: -90, position: 'left' }} 
                                />
                                <${Tooltip} cursor=${{ strokeDasharray: '3 3' }} />
                                <${Scatter} data=${dataset.data} fill="#3b82f6">
                                    ${dataset.data.map((entry, index) => html`<${Cell} key=${index} fill="#3b82f6" />`)}
                                </${Scatter}>
                                ${showResult && isCorrect && html`
                                    <${Line} 
                                        data=${[{ x: 0, y: MathUtils.predictY(0, MathUtils.calculateRegression(dataset.data.map(d=>d[currentX]), dataset.data.map(d=>d[currentY])).slope, MathUtils.calculateRegression(dataset.data.map(d=>d[currentX]), dataset.data.map(d=>d[currentY])).intercept) }, { x: 3000, y: MathUtils.predictY(3000, MathUtils.calculateRegression(dataset.data.map(d=>d[currentX]), dataset.data.map(d=>d[currentY])).slope, MathUtils.calculateRegression(dataset.data.map(d=>d[currentX]), dataset.data.map(d=>d[currentY])).intercept) }]} 
                                        dataKey="y" stroke="#10b981" strokeWidth=${3} dot=${false} 
                                    />
                                `}
                            </${ScatterChart}>
                        </${ResponsiveContainer}>
                    </div>
                </div>

                <!-- Right Panel: Controls & Feedback -->
                <div class="w-full md:w-80 bg-white dark:bg-slate-800 p-6 border-l border-gray-200 dark:border-slate-700 flex flex-col shadow-xl z-20">
                    
                    <div class="mb-6">
                        <label class="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2">
                            ${isTargetX ? '比較対象 (Y軸)' : '比較対象 (X軸)'} を変更
                        </label>
                        <select 
                            class="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-lg font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white"
                            value=${selectedVar}
                            onChange=${e => { setSelectedVar(e.target.value); setShowResult(false); }}
                            disabled=${showResult && isCorrect}
                        >
                            <option value="" disabled>項目を選択...</option>
                            ${options.map(opt => html`<option key=${opt.key} value=${opt.key}>${opt.label}</option>`)}
                        </select>
                        <div class="mt-2 text-xs text-gray-500 dark:text-slate-400 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/20">
                            <span class="font-bold">💡 ヒント:</span> ${quest.hint}
                        </div>
                    </div>

                    ${!showResult ? html`
                        <button 
                            onClick=${handleCheck} 
                            disabled=${!selectedVar}
                            class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 mt-auto"
                        >
                            これで報告する 📝
                        </button>
                    ` : html`
                        <div class="flex-1 flex flex-col animate-fade-in-up">
                            <div class="text-center mb-6">
                                ${isCorrect ? html`
                                    <div class="text-7xl mb-2 animate-scale-up-bounce">⭕</div>
                                    <div class="text-2xl font-black text-green-500">正解！</div>
                                    ${questIndex === DRILL_QUESTS.length - 1 && html`<${SimpleConfetti} />`}
                                ` : html`
                                    <div class="text-7xl mb-2 animate-shake">❌</div>
                                    <div class="text-xl font-bold text-gray-500">惜しい...</div>
                                `}
                            </div>
                            
                            <div class="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl mb-4 text-sm border border-gray-200 dark:border-slate-600">
                                <div class="flex justify-between border-b border-gray-300 dark:border-slate-500 pb-2 mb-2">
                                    <span class="text-gray-500 dark:text-slate-400 font-bold">相関係数 (r)</span>
                                    <span class="font-mono font-black text-xl ${r > 0.7 ? 'text-red-500' : r < -0.7 ? 'text-blue-500' : 'text-gray-500'}">${r.toFixed(2)}</span>
                                </div>
                                <div class="font-bold text-center text-gray-700 dark:text-slate-200 text-base">${MathUtils.getCorrelationStrength(r)}</div>
                            </div>

                            ${isCorrect && html`
                                <div class="text-sm text-gray-700 dark:text-slate-200 mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 leading-relaxed font-medium">
                                    ${quest.causationNote}
                                </div>
                                <button onClick=${handleNext} class="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-xl shadow-lg hover:bg-green-600 transition-all animate-pulse-fast mt-auto">
                                    ${questIndex < DRILL_QUESTS.length - 1 ? '次の依頼へ ➡' : '全クエスト達成！ 🏆'}
                                </button>
                            `}
                            ${!isCorrect && html`
                                <button onClick=${() => setShowResult(false)} class="w-full py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all mt-auto">
                                    やり直す
                                </button>
                            `}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
};

/**
 * Sandbox Mode (Free Exploration)
 */
const SandboxMode = ({ onExit }) => {
    const [datasetId, setDatasetId] = useState(DATASETS[0].id);
    const [xKey, setXKey] = useState(DATASETS[0].columns[0].key);
    const [yKey, setYKey] = useState(DATASETS[0].columns[1].key);

    const dataset = DATASETS.find(d => d.id === datasetId);
    const columns = dataset.columns;

    // Reset axis when dataset changes
    useEffect(() => {
        const newDataset = DATASETS.find(d => d.id === datasetId);
        setXKey(newDataset.columns[0].key);
        setYKey(newDataset.columns[1].key);
    }, [datasetId]);

    const r = MathUtils.calculateCorrelation(
        dataset.data.map(d => d[xKey]),
        dataset.data.map(d => d[yKey])
    );
    const { slope, intercept } = MathUtils.calculateRegression(
        dataset.data.map(d => d[xKey]),
        dataset.data.map(d => d[yKey])
    );

    return html`
        <div class="h-full flex flex-col bg-gray-50 dark:bg-slate-900">
            <div class="bg-white dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shadow-sm z-10">
                <div class="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <span class="text-2xl">🧪</span> 自由研究ラボ
                </div>
                <button onClick=${onExit} class="text-gray-400 hover:text-gray-600 text-sm font-bold">終了</button>
            </div>
            
            <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
                <!-- Controls -->
                <div class="w-full lg:w-80 bg-white dark:bg-slate-800 p-6 border-r border-gray-200 dark:border-slate-700 overflow-y-auto">
                    <div class="space-y-6">
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">データセット</label>
                            <select class="w-full p-2 bg-gray-100 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600 font-bold" value=${datasetId} onChange=${e => setDatasetId(e.target.value)}>
                                ${DATASETS.filter(d => !d.id.startsWith('extra')).map(d => html`<option key=${d.id} value=${d.id}>${d.name}</option>`)}
                            </select>
                            <div class="text-xs text-gray-500 mt-1 dark:text-slate-400">${dataset.description}</div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-blue-500 uppercase mb-1">横軸 (X)</label>
                                <select class="w-full p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800" value=${xKey} onChange=${e => setXKey(e.target.value)}>
                                    ${columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-green-500 uppercase mb-1">縦軸 (Y)</label>
                                <select class="w-full p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800" value=${yKey} onChange=${e => setYKey(e.target.value)}>
                                    ${columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                </select>
                            </div>
                        </div>

                        <div class="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
                            <div class="text-xs font-bold text-gray-400 uppercase mb-2">分析結果</div>
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-sm font-bold text-gray-600 dark:text-slate-300">相関係数 r</span>
                                <span class="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">${r.toFixed(3)}</span>
                            </div>
                            <div class="text-xs text-center bg-white dark:bg-slate-800 py-1 rounded border border-gray-200 dark:border-slate-600 font-bold text-gray-500 dark:text-slate-400">
                                ${MathUtils.getCorrelationStrength(r)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chart -->
                <div class="flex-1 p-4 bg-gray-50 dark:bg-slate-900 relative flex flex-col">
                    <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
                        <${ResponsiveContainer} width="100%" height="100%">
                            <${ScatterChart} margin=${{ top: 20, right: 20, bottom: 40, left: 40 }}>
                                <${CartesianGrid} strokeDasharray="3 3" />
                                <${XAxis} type="number" dataKey=${xKey} name=${columns.find(c=>c.key===xKey)?.label} unit="" label=${{ value: columns.find(c=>c.key===xKey)?.label, position: 'bottom', offset: 0 }} />
                                <${YAxis} type="number" dataKey=${yKey} name=${columns.find(c=>c.key===yKey)?.label} unit="" label=${{ value: columns.find(c=>c.key===yKey)?.label, angle: -90, position: 'left' }} />
                                <${Tooltip} cursor=${{ strokeDasharray: '3 3' }} />
                                <${Scatter} data=${dataset.data} fill="#8884d8">
                                    ${dataset.data.map((entry, index) => html`<${Cell} key=${index} fill="#6366f1" />`)}
                                </${Scatter}>
                                <${Line} 
                                    data=${[{ x: 0, y: MathUtils.predictY(0, slope, intercept) }, { x: 5000, y: MathUtils.predictY(5000, slope, intercept) }]} 
                                    dataKey="y" stroke="#ff7300" strokeWidth=${2} dot=${false} 
                                />
                            </${ScatterChart}>
                        </${ResponsiveContainer}>
                    </div>
                </div>
            </div>
        </div>
    `;
};
