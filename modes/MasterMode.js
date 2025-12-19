
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Cell, Line } from 'recharts';
import * as MathUtils from '../utils/math.js';
import { SimpleConfetti } from '../components/UI.js';

const html = htm.bind(React.createElement);

export const MasterMode = ({ onExit }) => {
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
