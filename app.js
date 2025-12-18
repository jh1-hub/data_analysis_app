
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

// Extra Mission Configuration
const EXTRA_MISSION_STAGES = [
    { datasetId: "extra_cleaning_1", xKey: "study_time", yKey: "score", targetR: 0.95 },
    { datasetId: "extra_cleaning_2", xKey: "temperature", yKey: "cold_drink_sales", targetR: 0.90 },
    { datasetId: "extra_cleaning_3", xKey: "level", yKey: "hp", targetR: 0.98 }
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

// --- Components ---

const Card = ({ title, children, className = "" }) => html`
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 ${className}">
        ${title && html`<div class="px-4 py-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">${title}</div>`}
        <div class="p-4 flex-1 overflow-auto flex flex-col">
            ${children}
        </div>
    </div>
`;

/**
 * 解説モードコンポーネント
 * 視認性を大幅に強化し、PC/黒板での表示に最適化
 */
const TutorialMode = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const demoData = [{ id: 1, temp: 25, sales: 150 }, { id: 2, temp: 30, sales: 280 }, { id: 3, temp: 35, sales: 400 }];
    const [plotStep, setPlotStep] = useState(0);

    const pages = [
        {
            title: "散布図（さんぷず）ってなに？",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-12 animate-fade-in-up py-8">
                    <div class="text-9xl animate-bounce-slow filter drop-shadow-xl">📊</div>
                    <div class="space-y-8 max-w-4xl">
                        <p class="text-2xl md:text-3xl lg:text-4xl text-gray-700 leading-relaxed">
                            「気温が上がると、アイスが売れる」<br/>
                            「勉強時間を増やすと、テストの点数が上がる」
                        </p>
                        <p class="text-3xl md:text-4xl lg:text-5xl text-gray-800 font-black">
                            <span class="text-indigo-600 border-b-8 border-indigo-200">2つのデータの関係</span>を<br/>
                            視覚的に調べるためのグラフです。
                        </p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ1：グラフの作り方",
            content: html`
                <div class="flex flex-col lg:flex-row gap-12 min-h-[60vh] items-center justify-center animate-fade-in-up py-6">
                    <div class="w-full lg:w-1/3 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                        <h4 class="font-black text-2xl text-center mb-6 text-indigo-600 uppercase tracking-widest">Data Table</h4>
                        <table class="w-full text-xl">
                            <thead class="bg-indigo-50">
                                <tr><th class="p-4">気温(℃)</th><th class="p-4">売上(個)</th></tr>
                            </thead>
                            <tbody class="divide-y">
                                ${demoData.map((d, i) => html`
                                    <tr class="transition-all duration-500 ${plotStep > i ? 'bg-indigo-100 scale-105' : ''}">
                                        <td class="p-5 text-center font-mono font-bold">${d.temp}℃</td>
                                        <td class="p-5 text-center font-mono font-bold text-green-600">${d.sales}個</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                        <div class="mt-8 flex flex-col gap-4">
                            <button onClick=${() => setPlotStep(prev => Math.min(prev + 1, 3))}
                                class="px-8 py-5 bg-indigo-600 text-white rounded-2xl text-xl font-black hover:bg-indigo-700 shadow-xl active:scale-95 transition-all">
                                点を1つずつ打つ ➡
                            </button>
                            <button onClick=${() => setPlotStep(0)} class="text-gray-400 font-bold hover:text-gray-600">やり直し</button>
                        </div>
                    </div>
                    <div class="w-full lg:w-3/5 aspect-video bg-white rounded-3xl shadow-2xl border-8 border-gray-50 relative p-10">
                        <svg viewBox="0 0 400 300" class="w-full h-full overflow-visible">
                            <line x1="50" y1="250" x2="380" y2="250" stroke="#333" stroke-width="3" marker-end="url(#arrow)" />
                            <line x1="50" y1="250" x2="50" y2="20" stroke="#333" stroke-width="3" marker-end="url(#arrow)" />
                            <text x="380" y="280" text-anchor="end" font-size="16" fill="#3b82f6" font-weight="black">気温 (X軸)</text>
                            <text x="35" y="20" text-anchor="end" font-size="16" fill="#10b981" font-weight="black">売上</text>
                            ${demoData.map((d, i) => {
                                const x = 50 + ((d.temp - 20) / 20) * 300;
                                const y = 250 - (d.sales / 500) * 230;
                                return plotStep > i && html`
                                    <g key=${i}>
                                        <line x1="${x}" y1="250" x2="${x}" y2="${y}" stroke="#3b82f6" stroke-dasharray="6" class="animate-grow-y" />
                                        <line x1="50" y1="${y}" x2="${x}" y2="${y}" stroke="#10b981" stroke-dasharray="6" class="animate-grow-x" />
                                        <circle cx="${x}" cy="${y}" r="8" fill="#6366f1" stroke="white" stroke-width="3" class="animate-pop-point" />
                                    </g>
                                `;
                            })}
                        </svg>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ2：相関の3つのパターン",
            content: html`
                <div class="grid grid-cols-1 md:grid-cols-3 gap-10 min-h-[50vh] items-stretch animate-fade-in-up py-8">
                    <div class="bg-red-50 p-10 rounded-3xl border-4 border-red-100 text-center flex flex-col justify-between hover:scale-105 transition-transform shadow-lg">
                        <div class="text-7xl mb-6">↗️</div>
                        <h4 class="font-black text-3xl text-red-700 mb-4">正の相関</h4>
                        <p class="text-xl text-gray-700 font-bold">右上がり</p>
                        <p class="text-lg text-gray-500 mt-4 leading-relaxed">一方が増えると、もう一方も増える傾向。</p>
                        <p class="mt-6 bg-white py-2 rounded-full font-black text-red-600 shadow-inner">例：勉強と成績</p>
                    </div>
                    <div class="bg-green-50 p-10 rounded-3xl border-4 border-green-100 text-center flex flex-col justify-between hover:scale-105 transition-transform shadow-lg">
                        <div class="text-7xl mb-6">↘️</div>
                        <h4 class="font-black text-3xl text-green-700 mb-4">負の相関</h4>
                        <p class="text-xl text-gray-700 font-bold">右下がり</p>
                        <p class="text-lg text-gray-500 mt-4 leading-relaxed">一方が増えると、もう一方は減る傾向。</p>
                        <p class="mt-6 bg-white py-2 rounded-full font-black text-green-600 shadow-inner">例：スマホと成績</p>
                    </div>
                    <div class="bg-gray-50 p-10 rounded-3xl border-4 border-gray-200 text-center flex flex-col justify-between hover:scale-105 transition-transform shadow-lg">
                        <div class="text-7xl mb-6">∴</div>
                        <h4 class="font-black text-3xl text-gray-700 mb-4">相関なし</h4>
                        <p class="text-xl text-gray-700 font-bold">バラバラ</p>
                        <p class="text-lg text-gray-500 mt-4 leading-relaxed">特に関連性が認められない状態。</p>
                        <p class="mt-6 bg-white py-2 rounded-full font-black text-gray-600 shadow-inner">例：身長と成績</p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ3：だまされないで！「疑似相関」",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-fade-in-up py-8">
                    <div class="bg-yellow-400 text-black p-10 rounded-3xl shadow-2xl max-w-5xl w-full text-center">
                        <h3 class="text-4xl lg:text-5xl font-black mb-6 flex items-center justify-center">
                            ⚠️ 相関 ≠ 因果
                        </h3>
                        <p class="text-2xl lg:text-3xl leading-relaxed font-bold">
                            関係があるからといって、<br/>
                            「一方が原因でもう一方が起きた」とは限らない！
                        </p>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-7xl">
                        <div class="bg-white p-10 rounded-3xl shadow-xl border-4 border-red-50 flex flex-col items-center">
                            <div class="text-xl font-black text-red-500 mb-8 tracking-tighter uppercase">誤った解釈</div>
                            <div class="flex items-center gap-10">
                                <div class="text-center"><div class="text-7xl mb-4">🍦</div><div class="font-black text-xl">アイス売上</div></div>
                                <div class="text-4xl text-red-500 font-black animate-pulse">➡ ?</div>
                                <div class="text-center"><div class="text-7xl mb-4">🏊</div><div class="font-black text-xl">水難事故</div></div>
                            </div>
                            <p class="mt-10 text-xl font-bold text-red-600 bg-red-50 p-6 rounded-2xl text-center">
                                「アイスを食べると事故が増える」<br/>…わけではありません！
                            </p>
                        </div>
                        <div class="bg-white p-10 rounded-3xl shadow-xl border-4 border-indigo-50 flex flex-col items-center relative">
                            <div class="text-xl font-black text-indigo-600 mb-8 tracking-tighter uppercase">正しい解釈</div>
                            <div class="flex flex-col items-center">
                                <div class="text-center mb-10"><div class="text-8xl mb-2 animate-bounce-slow">☀️</div><div class="text-2xl font-black bg-yellow-100 px-4 py-2 rounded-full">気温上昇</div></div>
                                <div class="flex gap-20">
                                    <div class="text-center"><div class="text-6xl mb-2">🍦</div><div class="font-black">アイス増</div></div>
                                    <div class="text-center"><div class="text-6xl mb-2">🏊</div><div class="font-black">水泳増</div></div>
                                </div>
                            </div>
                            <p class="mt-10 text-xl font-bold text-indigo-700 bg-indigo-50 p-6 rounded-2xl text-center">
                                「暑い」という共通の原因があるだけ。<br/>これを<span class="text-3xl font-black">疑似相関</span>と呼びます！
                            </p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "ミッションスタート！",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-16 animate-fade-in-up py-10">
                    <div class="text-[12rem] animate-bounce-slow drop-shadow-2xl">🔎</div>
                    <div class="space-y-6">
                        <h2 class="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">準備はいいですか？</h2>
                        <p class="text-2xl lg:text-3xl text-gray-500 font-medium">データの裏に隠された真実を暴く、<br/>データ探偵の出番です！</p>
                    </div>
                    <button onClick=${onFinish} class="px-16 py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-4xl font-black rounded-full shadow-2xl hover:scale-110 transform transition-all hover:shadow-indigo-500/50">
                        ドリルを開始する 🚀
                    </button>
                </div>
            `
        }
    ];

    const current = pages[step];

    return html`
        <div class="flex-1 flex flex-col min-h-0 p-4 lg:p-12 xl:max-w-[90vw] mx-auto w-full">
            <div class="bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col h-full overflow-hidden">
                <div class="bg-indigo-600 text-white px-10 py-8 flex justify-between items-center shrink-0">
                    <h2 class="text-3xl md:text-4xl lg:text-5xl font-black flex items-center">
                        <span class="bg-white text-indigo-600 rounded-2xl px-4 py-2 mr-6 text-2xl lg:text-3xl font-black">${step + 1}</span>
                        ${current.title}
                    </h2>
                    <div class="text-xl md:text-2xl font-bold opacity-70">${step + 1} / ${pages.length}</div>
                </div>
                <div class="flex-1 p-8 lg:p-16 overflow-y-auto bg-gray-50/30">
                    ${current.content}
                </div>
                <div class="bg-white border-t border-gray-100 p-8 flex justify-between items-center shrink-0 px-10">
                    <button onClick=${() => setStep(Math.max(0, step - 1))} disabled=${step === 0}
                        class="px-10 py-4 rounded-2xl font-black text-2xl text-gray-400 hover:text-gray-800 disabled:opacity-0 transition-all">
                        ← 前のスライド
                    </button>
                    <div class="flex space-x-4">
                        ${pages.map((_, i) => html`<div class="w-4 h-4 rounded-full transition-all ${i === step ? 'bg-indigo-600 scale-150' : 'bg-gray-200'}"></div>`)}
                    </div>
                    <button onClick=${() => setStep(Math.min(pages.length - 1, step + 1))} disabled=${step === pages.length - 1}
                        class="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-2xl hover:bg-indigo-700 shadow-xl disabled:opacity-0 transition-all">
                        次へ進む →
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * エクストラミッション用のウィンドウ (全3ステージ対応)
 */
const ExtraMissionWindow = ({ correlation, activeCount, stage, totalStages, targetR, onNext, onComplete }) => {
    const isMobile = window.innerWidth < 768;
    const initialPos = isMobile ? { x: 16, y: window.innerHeight - 300 } : { x: window.innerWidth - 380, y: 80 };
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const isSuccess = correlation >= targetR;
    const isFinalStage = stage === totalStages - 1;

    return html`
        <div class="fixed z-[90] bg-white shadow-2xl rounded-2xl overflow-hidden border-4 transition-all duration-500
                   ${isSuccess ? 'border-green-400 ring-8 ring-green-100' : 'border-red-500 ring-8 ring-red-100'}"
            style=${{ top: position.y, left: position.x, width: isMinimized ? '220px' : (isMobile ? 'calc(100vw - 32px)' : '380px'), touchAction: 'none' }}>
            <div class="px-5 py-3 bg-gradient-to-r from-gray-900 to-black text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none touch-none"
                onPointerDown=${onPointerDown} onPointerMove=${onPointerMove} onPointerUp=${onPointerUp}>
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">🛠️</span>
                    <span class="font-black text-sm tracking-widest uppercase">Stage ${stage + 1} / ${totalStages}</span>
                </div>
                <button onClick=${() => setIsMinimized(!isMinimized)} class="p-1 hover:bg-white/20 rounded">
                    ${isMinimized ? '□' : '－'}
                </button>
            </div>
            ${!isMinimized && html`
                <div class="p-6 flex flex-col gap-6">
                    ${isSuccess ? html`
                         <div class="text-center space-y-4">
                            <div class="text-6xl animate-bounce-slow">✨</div>
                            <h3 class="text-2xl font-black text-green-600 leading-tight">修正完了！</h3>
                            <div class="p-4 bg-green-50 rounded-2xl border-2 border-green-200 text-center font-mono text-2xl text-green-800 font-black">
                                r = ${correlation.toFixed(3)}
                            </div>
                            <p class="text-gray-500 font-bold">目標の ${targetR.toFixed(2)} を超えました！</p>
                            ${isFinalStage ? html`
                                <button onClick=${onComplete} class="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xl">
                                    探偵マスターへの認定 🎓
                                </button>
                            ` : html`
                                <button onClick=${onNext} class="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all text-xl">
                                    次の事件現場へ ➡
                                </button>
                            `}
                        </div>
                    ` : html`
                        <div class="space-y-4">
                            <h3 class="font-black text-red-700 text-xl border-b-2 border-red-100 pb-2">⚠ データ異常発生！</h3>
                            <p class="text-gray-800 font-bold leading-relaxed">
                                明らかに傾向から外れている<strong class="text-red-600 mx-1">「点」をクリックして除外</strong>し、正しい相関係数を取り戻してください。
                            </p>
                            <div class="space-y-3 bg-gray-50 p-4 rounded-xl">
                                <div class="flex justify-between font-black text-sm uppercase">
                                    <span>Current R</span>
                                    <span class="${correlation < 0.5 ? 'text-red-500' : 'text-orange-500'}">${correlation.toFixed(3)}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-5 relative overflow-hidden">
                                    <div class="bg-red-500 h-full transition-all duration-700 ease-out" style=${{ width: `${Math.max(0, correlation * 100)}%` }}></div>
                                    <div class="absolute top-0 bottom-0 border-r-4 border-dashed border-white" style=${{ left: `${targetR * 100}%` }}></div>
                                </div>
                                <div class="text-right text-xs font-black text-gray-400">Target: ${targetR.toFixed(3)} +</div>
                            </div>
                        </div>
                    `}
                </div>
            `}
        </div>
    `;
}

/**
 * 散布図コンポーネント (PC大画面でも視認性確保)
 */
const ScatterVis = ({ data, xConfig, yConfig, regression, excludedIds, onTogglePoint }) => {
    const domain = useMemo(() => {
        if (!data || data.length === 0) return { x: ['auto', 'auto'], y: ['auto', 'auto'] };
        const xValues = data.map(d => d[xConfig.key]);
        const yValues = data.map(d => d[yConfig.key]);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        const padX = (maxX - minX) * 0.1 || 1;
        const padY = (maxY - minY) * 0.1 || 1;
        return { x: [Math.floor(minX - padX), Math.ceil(maxX + padX)], y: [Math.floor(minY - padY), Math.ceil(maxY + padY)] };
    }, [data, xConfig, yConfig]);

    const lineData = useMemo(() => {
        const [minX, maxX] = domain.x;
        if (typeof minX !== 'number' || typeof maxX !== 'number') return [];
        return [
            { [xConfig.key]: minX, [yConfig.key]: MathUtils.predictY(minX, regression.slope, regression.intercept) },
            { [xConfig.key]: maxX, [yConfig.key]: MathUtils.predictY(maxX, regression.slope, regression.intercept) }
        ];
    }, [domain, xConfig, yConfig, regression]);

    return html`
        <${ResponsiveContainer} width="100%" height="100%">
            <${ComposedChart} margin=${{ top: 40, right: 60, bottom: 40, left: 40 }}>
                <${CartesianGrid} strokeDasharray="5 5" stroke="#f0f0f0" />
                <${XAxis} type="number" dataKey=${xConfig.key} name=${xConfig.label} domain=${domain.x}
                    label=${{ value: xConfig.label, position: 'bottom', offset: 0, fill: '#3b82f6', fontSize: 16, fontWeight: 'bold' }} />
                <${YAxis} type="number" dataKey=${yConfig.key} name=${yConfig.label} domain=${domain.y}
                    label=${{ value: yConfig.label, angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 16, fontWeight: 'bold' }} />
                <${Tooltip} cursor=${{ strokeDasharray: '3 3' }}
                    content=${({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            if (!d.id) return null;
                            const isExcluded = excludedIds.includes(d.id);
                            return html`
                                <div class="bg-white border-2 border-gray-200 p-4 rounded-xl shadow-2xl text-base">
                                    <div class="font-black mb-2 flex justify-between gap-6">
                                        <span>ID: ${d.id}</span>
                                        <span class="px-2 py-0.5 rounded-full text-xs ${isExcluded ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
                                            ${isExcluded ? '除外中' : '使用中'}
                                        </span>
                                    </div>
                                    <p class="text-blue-600 font-bold">${xConfig.label}: ${d[xConfig.key]}</p>
                                    <p class="text-green-600 font-bold">${yConfig.label}: ${d[yConfig.key]}</p>
                                    <div class="mt-3 text-xs text-gray-400 font-bold border-t pt-2">クリックで切替</div>
                                </div>
                            `;
                        }
                        return null;
                    }} />
                <${Scatter} name="Data" data=${data} onClick=${(d) => onTogglePoint(d.id)} cursor="pointer">
                    ${data.map((entry, index) => html`<${Cell} key=${`cell-${index}`} fill=${excludedIds.includes(entry.id) ? '#f3f4f6' : '#6366f1'} 
                        stroke=${excludedIds.includes(entry.id) ? '#d1d5db' : '#4f46e5'} strokeWidth=${2} />`)}
                </${Scatter}>
                <${Line} data=${lineData} dataKey=${yConfig.key} stroke="#f97316" strokeWidth=${4} dot=${false} activeDot=${false} isAnimationActive=${false} />
            </${ComposedChart}>
        </${ResponsiveContainer}>
    `;
};

// Analysis Panel
const AnalysisPanel = ({ xLabel, yLabel, correlation, regression, strength, activeCount, totalCount }) => html`
    <div class="space-y-8">
        <div>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Correlation</h3>
            <div class="bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-50">
                <div class="flex justify-between items-baseline mb-4">
                    <span class="text-gray-500 font-bold">相関係数 (r)</span>
                    <span class="text-4xl font-black text-blue-700">${correlation.toFixed(3)}</span>
                </div>
                <${CorrelationMeter} r=${correlation} />
                <div class="flex justify-between items-center mt-6">
                    <span class="text-xs font-black text-gray-400">n=${activeCount}/${totalCount}</span>
                    <span class="px-3 py-1 text-sm font-black rounded-lg 
                        ${strength.includes('かなり強い') ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 
                          strength.includes('正の') ? 'bg-red-500 text-white' :
                          strength.includes('負の') ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}">${strength}</span>
                </div>
            </div>
        </div>
        <div>
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Regression</h3>
            <div class="bg-green-50/50 p-6 rounded-3xl border-2 border-green-50">
                <div class="text-gray-500 font-bold mb-3">回帰式</div>
                <div class="text-xl font-mono font-black text-center bg-white py-4 rounded-2xl border-2 border-green-100 text-green-800 shadow-inner">
                    y = ${regression.slope.toFixed(2)}x ${regression.intercept >= 0 ? '+' : '-'} ${Math.abs(regression.intercept).toFixed(2)}
                </div>
            </div>
        </div>
    </div>
`;

const CorrelationMeter = ({ r }) => {
    const percentage = ((r + 1) / 2) * 100;
    return html`
        <div class="mt-4">
            <div class="relative h-6 w-full rounded-full bg-gradient-to-r from-green-400 via-gray-200 to-red-400 shadow-inner overflow-hidden">
                <div class="absolute top-0 bottom-0 w-2 bg-black border-2 border-white shadow-2xl transition-all duration-1000 ease-out" style=${{ left: `${percentage}%`, transform: 'translateX(-50%)' }}></div>
            </div>
            <div class="flex justify-between text-[10px] font-black text-gray-400 mt-2 px-1">
                <span>-1.0 (負)</span><span>0 (無)</span><span>1.0 (正)</span>
            </div>
        </div>
    `;
};

// Main App Component
const App = () => {
    const [mode, setMode] = useState('explanation');
    const [availableDatasets, setAvailableDatasets] = useState(DATASETS);
    const [datasetId, setDatasetId] = useState(DATASETS[0].id);
    const [xKey, setXKey] = useState(DATASETS[0].columns[0].key);
    const [yKey, setYKey] = useState(DATASETS[0].columns[1].key);
    const [excludedIds, setExcludedIds] = useState([]);
    const [showDataWindow, setShowDataWindow] = useState(false);
    const [showInputModal, setShowInputModal] = useState(false);
    const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
    const [drillFeedback, setDrillFeedback] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [hasCleared, setHasCleared] = useState(false);
    const [extraMissionLevel, setExtraMissionLevel] = useState(0);

    const dataset = useMemo(() => availableDatasets.find(d => d.id === datasetId) || availableDatasets[0], [datasetId, availableDatasets]);
    const xColumn = useMemo(() => dataset.columns.find(c => c.key === xKey) || dataset.columns[0], [dataset, xKey]);
    const yColumn = useMemo(() => dataset.columns.find(c => c.key === yKey) || dataset.columns[1], [dataset, yKey]);

    const stats = useMemo(() => {
        const activeData = dataset.data.filter(d => !excludedIds.includes(d.id));
        const xData = activeData.map(d => d[xColumn.key]);
        const yData = activeData.map(d => d[yColumn.key]);
        if (xData.length === 0) return { correlation: 0, regression: { slope: 0, intercept: 0 }, strength: "データなし", activeCount: 0, xStats: { min: 0, max: 0, mean: 0 }, yStats: { min: 0, max: 0, mean: 0 } };
        const r = MathUtils.calculateCorrelation(xData, yData);
        const reg = MathUtils.calculateRegression(xData, yData);
        const str = MathUtils.getCorrelationStrength(r);
        const calcStats = (arr) => ({ min: Math.min(...arr), max: Math.max(...arr), mean: MathUtils.calculateMean(arr) });
        return { correlation: r, regression: reg, strength: str, activeCount: xData.length, xStats: calcStats(xData), yStats: calcStats(yData) };
    }, [dataset, xColumn, yColumn, excludedIds]);

    useEffect(() => {
        if (mode === 'drill' && !hasCleared) {
            const quest = DRILL_QUESTS[currentQuestIndex];
            if (quest) { setDatasetId(quest.datasetId); setXKey(quest.initialX); setYKey(quest.initialY); }
            setDrillFeedback(null);
        }
    }, [currentQuestIndex, mode, hasCleared]);

    const togglePoint = (id) => setExcludedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const handleSwapAxes = () => { const oldX = xKey; setXKey(yKey); setYKey(oldX); };

    const handleDrillSubmit = () => {
        const quest = DRILL_QUESTS[currentQuestIndex];
        if (datasetId !== quest.datasetId) { setDrillFeedback('incorrect_dataset'); return; }
        if (xKey === yKey) { setDrillFeedback('same_variable'); return; }
        const isTargetX = xKey === quest.targetKey;
        const isTargetY = yKey === quest.targetKey;
        const selectedPair = isTargetX ? yKey : (isTargetY ? xKey : null);
        if (selectedPair && quest.validAnswers.includes(selectedPair)) { setDrillFeedback('correct'); }
        else { setDrillFeedback('incorrect'); }
    };

    const nextQuest = () => { setDrillFeedback(null); if (currentQuestIndex < DRILL_QUESTS.length - 1) { setCurrentQuestIndex(prev => prev + 1); } else { setHasCleared(true); setShowClearModal(true); } };
    const restartDrill = () => { setShowClearModal(false); setHasCleared(false); setCurrentQuestIndex(0); setDrillFeedback(null); setMode('drill'); };
    const loadExtraMissionLevel = (levelIndex) => { const config = EXTRA_MISSION_STAGES[levelIndex]; setDatasetId(config.datasetId); setXKey(config.xKey); setYKey(config.yKey); setExcludedIds([]); };
    const startExtraMission = () => { setShowClearModal(false); setMode('extra'); setExtraMissionLevel(0); loadExtraMissionLevel(0); };
    const nextExtraMission = () => { if (extraMissionLevel < EXTRA_MISSION_STAGES.length - 1) { const nextLevel = extraMissionLevel + 1; setExtraMissionLevel(nextLevel); loadExtraMissionLevel(nextLevel); } };
    const finishExtraMission = () => { setMode('explanation'); setDatasetId(DATASETS[0].id); setExcludedIds([]); };

    return html`
        <div class="h-full flex flex-col font-sans ${hasCleared ? 'bg-yellow-50/30' : 'bg-gray-50'} transition-all duration-1000 overflow-hidden">
            <header class="bg-white px-8 py-6 flex flex-col lg:flex-row justify-between items-center shadow-lg z-10 gap-6 border-b-4 border-gray-50">
                <div class="flex items-center space-x-6">
                    <div class="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div><h1 class="text-3xl font-black text-gray-900 tracking-tighter">Data Detective</h1><p class="text-xs font-black text-indigo-400 uppercase tracking-widest">Master of Correlation</p></div>
                </div>
                <div class="flex bg-gray-100 p-2 rounded-2xl shadow-inner gap-2">
                    <button class="px-8 py-3 rounded-xl text-lg font-black transition-all ${mode === 'explanation' ? 'bg-white text-indigo-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}" onClick=${() => setMode('explanation')}>📚 解説</button>
                    <button class="px-8 py-3 rounded-xl text-lg font-black transition-all ${mode === 'drill' ? 'bg-white text-orange-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}" onClick=${() => setMode('drill')}>🔎 ドリル</button>
                    <button class="px-8 py-3 rounded-xl text-lg font-black transition-all ${mode === 'exploration' ? 'bg-white text-green-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}" onClick=${() => setMode('exploration')}>📊 自由研究</button>
                </div>
            </header>

            ${mode === 'explanation' ? html`<${TutorialMode} onFinish=${() => setMode('drill')} />` : html`
                <main class="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6 max-w-[1920px] mx-auto w-full">
                    <aside class="w-full lg:w-96 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
                        <${Card} title="Settings" className="shadow-2xl">
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-xs font-black text-gray-400 uppercase mb-2">Data Source</label>
                                    <select class="block w-full border-2 border-gray-100 rounded-2xl p-4 bg-white font-bold disabled:opacity-50" value=${datasetId} onChange=${e => setDatasetId(e.target.value)} disabled=${mode === 'extra'}>
                                        ${availableDatasets.map(d => html`<option key=${d.id} value=${d.id}>${d.name}</option>`)}
                                    </select>
                                    <p class="mt-3 text-sm text-gray-500 font-medium leading-relaxed">${dataset.description}</p>
                                </div>
                                <button onClick=${() => setShowDataWindow(true)} class="w-full py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-700 hover:bg-gray-50 shadow-sm transition-all">データ詳細を表示</button>
                            </div>
                        </${Card}>
                        <${Card} title="Variables" className="flex-1 shadow-2xl">
                            <div class="space-y-6">
                                <div class="p-6 bg-blue-50/50 rounded-3xl border-2 border-blue-50 ${mode === 'extra' ? 'opacity-50' : ''}">
                                    <label class="block text-sm font-black text-blue-800 mb-3 uppercase tracking-wider">X-Axis (Horizontal)</label>
                                    <select class="w-full border-2 border-blue-100 rounded-2xl p-4 bg-white font-black text-lg disabled:cursor-not-allowed" value=${xKey} onChange=${e => setXKey(e.target.value)} disabled=${mode === 'extra'}>
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                </div>
                                <div class="flex justify-center"><button onClick=${handleSwapAxes} class="p-4 bg-white border-2 border-gray-100 rounded-full shadow-lg hover:rotate-180 transition-all duration-500 disabled:opacity-20" disabled=${mode === 'extra'}>🔄</button></div>
                                <div class="p-6 bg-green-50/50 rounded-3xl border-2 border-green-50 ${mode === 'extra' ? 'opacity-50' : ''}">
                                    <label class="block text-sm font-black text-green-800 mb-3 uppercase tracking-wider">Y-Axis (Vertical)</label>
                                    <select class="w-full border-2 border-green-100 rounded-2xl p-4 bg-white font-black text-lg disabled:cursor-not-allowed" value=${yKey} onChange=${e => setYKey(e.target.value)} disabled=${mode === 'extra'}>
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                </div>
                            </div>
                        </${Card}>
                    </aside>
                    <section class="flex-1 flex flex-col min-w-0 gap-6">
                        <${Card} className="h-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-4 border-white">
                            <div class="h-full flex flex-col">
                                <div class="flex justify-between items-center mb-8 px-4">
                                    <h2 class="text-3xl font-black text-gray-800 tracking-tighter">Visualizing <span class="text-blue-500 underline">${xColumn.label}</span> vs <span class="text-green-500 underline">${yColumn.label}</span></h2>
                                    <div class="flex gap-6 text-xs font-black text-gray-400 uppercase">
                                        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-indigo-500 rounded-lg"></div> Actual</div>
                                        <div class="flex items-center gap-2"><div class="w-4 h-4 bg-orange-500 rounded-full"></div> Model</div>
                                    </div>
                                </div>
                                <div class="flex-1"><${ScatterVis} data=${dataset.data} xConfig=${xColumn} yConfig=${yColumn} regression=${stats.regression} excludedIds=${excludedIds} onTogglePoint=${togglePoint} /></div>
                            </div>
                        </${Card}>
                    </section>
                    <aside class="w-full lg:w-96 flex-shrink-0">
                        <${Card} title="Analysis" className="h-full shadow-2xl">
                            <${AnalysisPanel} xLabel=${xColumn.label} yLabel=${yColumn.label} correlation=${stats.correlation} regression=${stats.regression} strength=${stats.strength} activeCount=${stats.activeCount} totalCount=${dataset.data.length} />
                        </${Card}>
                    </aside>
                </main>
            `}

            ${mode === 'drill' && !showClearModal && html`<${DrillQuestWindow} quest=${currentQuest} index=${displayQuestIndex} total=${DRILL_QUESTS.length} feedback=${drillFeedback} onSubmit=${handleDrillSubmit} onNext=${nextQuest} hasCleared=${hasCleared} onRestart=${restartDrill} />`}
            ${mode === 'extra' && html`<${ExtraMissionWindow} correlation=${stats.correlation} activeCount=${stats.activeCount} stage=${extraMissionLevel} totalStages=${EXTRA_MISSION_STAGES.length} targetR=${EXTRA_MISSION_STAGES[extraMissionLevel].targetR} onNext=${nextExtraMission} onComplete=${finishExtraMission} />`}
            ${showDataWindow && html`<${FloatingDataWindow} data=${dataset.data} columns=${dataset.columns} excludedIds=${excludedIds} onTogglePoint=${togglePoint} onClose=${() => setShowDataWindow(false)} />`}
            ${showClearModal && html`<${DrillClearModal} onRestart=${restartDrill} onExploration=${() => {setShowClearModal(false); setMode('exploration');}} onExtraMission=${startExtraMission} />`}
        </div>
    `;
};

const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
