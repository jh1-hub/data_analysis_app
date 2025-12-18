
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
 * 解説モードコンポーネント (TutorialMode)
 */
const TutorialMode = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const [fontScale, setFontScale] = useState(1); // 0: Small, 1: Normal, 2: Large
    const [plotStep, setPlotStep] = useState(0);
    const isMobile = useIsMobile();
    
    // State for Step 1 Demo Switching
    const [demoType, setDemoType] = useState('positive'); // 'positive' | 'negative'

    // State for Step 3 Interactive Task
    const [step3R, setStep3R] = useState(0);
    const [step3Cleared, setStep3Cleared] = useState(false);
    // Generate static random points for Step 3 interaction to avoid flickering
    const step3Points = useMemo(() => {
        return Array.from({ length: 40 }, () => ({
            x: Math.random() * 2 - 1, // -1 to 1
            noiseY: Math.random() * 2 - 1,
        }));
    }, []);
    
    // State for Step 5 Mobile Toggle
    const [step5ShowTruth, setStep5ShowTruth] = useState(false);

    // Font Scaling Helper
    const tc = (base) => {
        const sizes = ['text-[10px]', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl'];
        const idx = sizes.indexOf(base);
        if (idx === -1) return base;
        // Shift index by (fontScale - 1) -> -1, 0, +1
        const newIdx = Math.max(0, Math.min(sizes.length - 1, idx + (fontScale - 1)));
        return sizes[newIdx];
    };

    // Step 1 Data
    const demoDataPositive = [
        { id: 1, x: 25, y: 150, xLabel: '25℃', yLabel: '150個' },
        { id: 2, x: 30, y: 280, xLabel: '30℃', yLabel: '280個' },
        { id: 3, x: 35, y: 400, xLabel: '35℃', yLabel: '400個' }
    ];
    const demoDataNegative = [
        { id: 1, x: 1, y: 90, xLabel: '1時間', yLabel: '90点' },
        { id: 2, x: 3, y: 60, xLabel: '3時間', yLabel: '60点' },
        { id: 3, x: 5, y: 30, xLabel: '5時間', yLabel: '30点' }
    ];

    const currentDemoData = demoType === 'positive' ? demoDataPositive : demoDataNegative;
    
    // Step 1 Config
    const demoConfig = demoType === 'positive' ? {
        title: "例1：気温とアイス売上",
        xLabel: "気温(℃)",
        yLabel: "売上(個)",
        xMin: 20, xMax: 40,
        yMin: 0, yMax: 500,
        yColor: "text-green-600 dark:text-green-400",
        yFill: "#10b981", // green
        desc: "気温が上がると、売上はどうなる？"
    } : {
        title: "例2：スマホ時間とテスト点数",
        xLabel: "スマホ(時間)",
        yLabel: "点数(点)",
        xMin: 0, xMax: 6,
        yMin: 0, yMax: 100,
        yColor: "text-red-600 dark:text-red-400",
        yFill: "#ef4444", // red
        desc: "スマホを長時間使うと、点数はどうなる？"
    };

    const getPlotX = (val) => 50 + ((val - demoConfig.xMin) / (demoConfig.xMax - demoConfig.xMin)) * 300;
    const getPlotY = (val) => 250 - ((val - demoConfig.yMin) / (demoConfig.yMax - demoConfig.yMin)) * 230;

    // SVG Diagrams for reuse
    const PositiveCorrelationSVG = html`
        <svg viewBox="0 0 100 80" class="w-full h-full overflow-visible">
            <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
            <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
            <path d="M15 65 L 85 15" stroke="#ef4444" stroke-width="1" stroke-dasharray="2" opacity="0.3"/>
            ${[{x:20,y:62},{x:35,y:52},{x:45,y:40},{x:58,y:35},{x:70,y:25},{x:82,y:18}].map((p, i) => html`<circle key=${i} cx=${p.x} cy=${p.y} r="2" fill="#ef4444" />`)}
        </svg>
    `;

    const NegativeCorrelationSVG = html`
        <svg viewBox="0 0 100 80" class="w-full h-full overflow-visible">
            <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
            <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
            <path d="M15 15 L 85 65" stroke="#10b981" stroke-width="1" stroke-dasharray="2" opacity="0.3"/>
            ${[{x:20,y:18},{x:35,y:25},{x:45,y:40},{x:58,y:45},{x:70,y:55},{x:82,y:62}].map((p, i) => html`<circle key=${i} cx=${p.x} cy=${p.y} r="2" fill="#10b981" />`)}
        </svg>
    `;

    // Step 3 Dynamic Plot
    const renderDynamicScatter = () => {
        return html`
            <svg viewBox="0 0 200 120" class="w-full h-full overflow-visible bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600 shadow-inner">
                <line x1="10" y1="110" x2="190" y2="110" stroke="#cbd5e1" stroke-width="1"/>
                <line x1="10" y1="10" x2="10" y2="110" stroke="#cbd5e1" stroke-width="1"/>
                ${step3Points.map((p, i) => {
                    const r = step3R;
                    // Visualize correlation: mix linear relation with noise
                    const simY = r * p.x + (1 - Math.abs(r)) * p.noiseY * 0.7; 
                    
                    const plotX = 100 + p.x * 80;
                    const plotY = 60 - simY * 45; // Invert Y and Scale
                    
                    return html`<circle key=${i} cx=${plotX} cy=${plotY} r="3" fill="#6366f1" opacity="0.6" />`;
                })}
                <text x="190" y="20" font-size="16" fill="#6366f1" font-weight="bold" opacity="0.8" text-anchor="end">r = ${step3R.toFixed(1)}</text>
            </svg>
        `;
    };

    const pages = [
        {
            title: "散布図とは？",
            content: html`
                <div class="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in-up py-4">
                    <div class="${tc('text-6xl')} md:${tc('text-8xl')} animate-bounce-slow drop-shadow-sm">📊</div>
                    <div class="space-y-4 max-w-4xl">
                        <p class="${tc('text-base')} md:${tc('text-xl')} text-gray-700 dark:text-slate-300 leading-relaxed">
                            「勉強を頑張るほど、テストの点数は上がるのかな？」<br/>
                            「気温が上がると、アイスの売上は増えるのかな？」
                        </p>
                        <p class="${tc('text-lg')} md:${tc('text-2xl')} text-gray-800 dark:text-white font-bold">
                            このように、<span class="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-200 dark:border-indigo-700">2つのデータにどのような関係があるか</span>を<br/>
                            「点」を使って視覚的に表したグラフが<span class="text-indigo-600 dark:text-indigo-400 font-black">散布図（さんぷず）</span>です。
                        </p>
                        <p class="${tc('text-sm')} md:${tc('text-base')} text-gray-500 dark:text-slate-400">
                            データをグラフにすることで、数字の列だけでは気づけない<br/>「傾向」や「つながり」が見えてきます。
                        </p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ1：点打ち体験",
            content: html`
                <div class="flex flex-col lg:flex-row gap-4 h-full items-center justify-center animate-fade-in-up py-2">
                    <div class="w-full lg:w-1/3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex flex-col justify-center relative overflow-hidden transition-all">
                        <div class="absolute top-0 left-0 w-full h-1 ${demoType === 'positive' ? 'bg-green-500' : 'bg-red-500'}"></div>
                        <h4 class="font-bold ${tc('text-lg')} text-center mb-1 text-gray-800 dark:text-white transition-all">${demoConfig.title}</h4>
                        <p class="text-center ${tc('text-xs')} text-gray-500 dark:text-slate-400 mb-2">${demoConfig.desc}</p>
                        
                        <table class="w-full ${tc('text-sm')} md:${tc('text-base')} dark:text-slate-200 mb-4">
                            <thead class="bg-gray-100 dark:bg-slate-700">
                                <tr><th class="p-2">${demoConfig.xLabel}</th><th class="p-2">${demoConfig.yLabel}</th></tr>
                            </thead>
                            <tbody class="divide-y dark:divide-slate-600">
                                ${currentDemoData.map((d, i) => html`
                                    <tr key=${d.id} class="transition-all duration-300 ${plotStep > i ? 'bg-indigo-50 dark:bg-slate-700/50' : ''}">
                                        <td class="p-2 text-center font-mono font-bold">${d.xLabel}</td>
                                        <td class="p-2 text-center font-mono font-bold ${demoConfig.yColor}">${d.yLabel}</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                        
                        <div class="flex flex-col gap-2 min-h-[100px] justify-end">
                            ${plotStep < 3 ? html`
                                <button onClick=${() => setPlotStep(prev => prev + 1)}
                                    class="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl ${tc('text-base')} font-bold hover:bg-indigo-700 shadow-md active:scale-95 transition-all">
                                    1つずつプロット ➡
                                </button>
                            ` : demoType === 'positive' ? html`
                                <div class="text-center animate-fade-in-up">
                                    <p class="text-green-600 font-bold mb-2 ${tc('text-sm')}">右上がりの傾向が見えました！</p>
                                    <button onClick=${() => { setDemoType('negative'); setPlotStep(0); }}
                                        class="w-full px-4 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl ${tc('text-base')} font-black hover:bg-indigo-50 shadow-md active:scale-95 transition-all">
                                        次は「逆のパターン」へ ➡
                                    </button>
                                </div>
                            ` : html`
                                <div class="text-center animate-fade-in-up">
                                    <p class="text-red-500 font-bold mb-2 ${tc('text-sm')}">今度は右下がりになりました！</p>
                                    <div class="p-2 bg-indigo-50 dark:bg-slate-700 rounded-lg text-indigo-800 dark:text-indigo-200 font-bold ${tc('text-xs')}">
                                        これで体験完了です。<br/>右下の「次へ」ボタンを押してください。
                                    </div>
                                </div>
                            `}
                            <button onClick=${() => setPlotStep(0)} class="text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-300 ${tc('text-xs')} mt-1">リセット</button>
                        </div>
                    </div>
                    
                    <div class="w-full lg:w-3/5 h-64 md:h-auto md:aspect-video bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 relative p-4 md:p-8 transition-colors duration-500">
                        <svg viewBox="0 0 400 300" class="w-full h-full overflow-visible">
                            <line x1="50" y1="250" x2="380" y2="250" stroke="#333" stroke-width="2" marker-end="url(#arrow)" class="dark:stroke-slate-400" />
                            <line x1="50" y1="250" x2="50" y2="20" stroke="#333" stroke-width="2" marker-end="url(#arrow)" class="dark:stroke-slate-400" />
                            <text x="380" y="275" text-anchor="end" font-size="14" fill="#3b82f6" font-weight="bold" class="dark:fill-blue-400">${demoConfig.xLabel}</text>
                            <text x="40" y="20" text-anchor="end" font-size="14" fill="${demoConfig.yFill}" font-weight="bold" class="dark:fill-green-400">${demoConfig.yLabel}</text>
                            
                            ${currentDemoData.map((d, i) => {
                                const x = getPlotX(d.x);
                                const y = getPlotY(d.y);
                                return plotStep > i && html`
                                    <g key=${i}>
                                        <line x1="${x}" y1="250" x2="${x}" y2="${y}" stroke="#3b82f6" stroke-dasharray="4" class="animate-grow-y" />
                                        <line x1="50" y1="${y}" x2="${x}" y2="${y}" stroke="${demoConfig.yFill}" stroke-dasharray="4" class="animate-grow-x" />
                                        <circle cx="${x}" cy="${y}" r="7" fill="#6366f1" stroke="white" stroke-width="2" class="animate-pop-point" />
                                        <text x="${x}" y="265" text-anchor="middle" font-size="10" fill="#3b82f6" class="animate-show-text dark:fill-blue-300">${d.xLabel}</text>
                                        <text x="35" y="${y+4}" text-anchor="end" font-size="10" fill="${demoConfig.yFill}" class="animate-show-text dark:fill-green-300">${d.yLabel}</text>
                                    </g>
                                `;
                            })}
                        </svg>
                        <p class="absolute bottom-2 right-2 ${tc('text-[10px]')} text-gray-400">横軸(X)と縦軸(Y)が交わる場所に点を打ちます</p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ2：相関の種類",
            content: html`
                <div class="flex flex-col gap-4 h-full animate-fade-in-up py-2">
                     <!-- Definition of Correlation -->
                    <div class="bg-indigo-50 dark:bg-slate-700/50 p-3 rounded-2xl border-l-4 border-indigo-500 shadow-sm w-full shrink-0">
                        <h3 class="${tc('text-base')} md:${tc('text-lg')} font-black text-indigo-900 dark:text-indigo-200 mb-1">
                            💡 「相関関係（そうかんかんけい）」とは？
                        </h3>
                        <p class="${tc('text-sm')} md:${tc('text-base')} text-gray-700 dark:text-slate-300 leading-relaxed">
                            「一方のデータが変わると、もう一方のデータもそれにつれて変わる」という関係のことです。
                            散布図における「点の並び方」を見ることで、この関係を読み取ることができます。
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-stretch flex-1 min-h-0 overflow-y-auto">
                        <!-- Positive -->
                        <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50 flex flex-col items-center text-center shadow-sm">
                            <div class="h-24 md:h-32 w-full flex items-center justify-center mb-2">
                                ${PositiveCorrelationSVG}
                            </div>
                            <h4 class="font-black ${tc('text-lg')} text-red-700 dark:text-red-400 mb-1">正の相関</h4>
                            <p class="${tc('text-xs')} md:${tc('text-sm')} text-gray-700 dark:text-slate-300 font-bold mb-1">「右上がり」の並び</p>
                            <p class="${tc('text-xs')} text-gray-500 dark:text-slate-400 leading-relaxed">
                                一方が増えると、もう一方も<span class="text-red-600 dark:text-red-400 font-bold">増える</span>。<br/>（勉強時間と成績など）
                            </p>
                        </div>
                        <!-- Negative -->
                        <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/50 flex flex-col items-center text-center shadow-sm">
                            <div class="h-24 md:h-32 w-full flex items-center justify-center mb-2">
                                ${NegativeCorrelationSVG}
                            </div>
                            <h4 class="font-black ${tc('text-lg')} text-green-700 dark:text-green-400 mb-1">負の相関</h4>
                            <p class="${tc('text-xs')} md:${tc('text-sm')} text-gray-700 dark:text-slate-300 font-bold mb-1">「右下がり」の並び</p>
                            <p class="${tc('text-xs')} text-gray-500 dark:text-slate-400 leading-relaxed">
                                一方が増えると、もう一方は<span class="text-green-600 dark:text-green-400 font-bold">減る</span>。<br/>（スマホ時間と成績など）
                            </p>
                        </div>
                        <!-- None -->
                        <div class="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-200 dark:border-slate-600 flex flex-col items-center text-center shadow-sm">
                            <div class="h-24 md:h-32 w-full flex items-center justify-center mb-2">
                                <svg viewBox="0 0 100 80" class="w-full h-full overflow-visible">
                                    <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
                                    <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
                                    ${[{x:25,y:20},{x:40,y:60},{x:55,y:30},{x:70,y:55},{x:30,y:45},{x:75,y:25}].map((p, i) => html`<circle key=${i} cx=${p.x} cy=${p.y} r="2" fill="#666" class="dark:fill-slate-400" />`)}
                                </svg>
                            </div>
                            <h4 class="font-black ${tc('text-lg')} text-gray-700 dark:text-slate-300 mb-1">相関なし</h4>
                            <p class="${tc('text-xs')} md:${tc('text-sm')} text-gray-700 dark:text-slate-300 font-bold mb-1">「バラバラ」</p>
                            <p class="${tc('text-xs')} text-gray-500 dark:text-slate-400 leading-relaxed">
                                お互いに関係なく増減します。<br/>（身長と成績など）
                            </p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ3：相関係数（r）",
            content: html`
                <div class="flex flex-col items-center justify-center h-full space-y-2 animate-fade-in-up py-4 max-w-4xl mx-auto w-full">
                    <div class="bg-indigo-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-indigo-100 dark:border-slate-600 w-full shrink-0">
                        <h3 class="${tc('text-lg')} md:${tc('text-2xl')} font-black text-indigo-800 dark:text-indigo-300 mb-2 md:mb-4 text-center">相関の「強さ」を数値化する</h3>
                        <p class="${tc('text-sm')} md:${tc('text-lg')} text-gray-700 dark:text-slate-300 leading-relaxed mb-4 md:mb-6">
                            散布図の「点の集まり具合」を数字にしたものを<span class="font-bold text-indigo-600 dark:text-indigo-400">相関係数（r）</span>と呼びます。<br/>
                            この数字は必ず<span class="bg-white dark:bg-slate-800 px-2 rounded shadow-sm font-mono">-1.0 から 1.0</span> の間に収まります。
                        </p>
                        
                        <div class="relative py-4">
                            <div class="h-6 w-full rounded-full bg-gradient-to-r from-green-400 via-gray-200 to-red-400 shadow-inner"></div>
                            <div class="flex justify-between ${tc('text-[10px]')} md:${tc('text-xs')} font-bold text-gray-500 dark:text-slate-400 mt-2 px-1">
                                <div class="text-center w-1/5">強い負<br/>(-1.0)</div>
                                <div class="text-center w-1/5">負</div>
                                <div class="text-center w-1/5">なし<br/>(0.0)</div>
                                <div class="text-center w-1/5">正</div>
                                <div class="text-center w-1/5">強い正<br/>(1.0)</div>
                            </div>
                        </div>
                    </div>

                    <!-- Interactive Slider Task -->
                    <div class="w-full bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700 flex flex-col md:flex-row items-center gap-6">
                        <div class="w-full md:w-1/2 aspect-video bg-white dark:bg-slate-800 rounded-lg">
                            ${renderDynamicScatter()}
                        </div>
                        <div class="w-full md:w-1/2 flex flex-col gap-4 text-center">
                            <div>
                                <h4 class="font-bold text-gray-800 dark:text-white mb-2 ${tc('text-sm')} md:${tc('text-base')}">
                                    <span class="text-xl mr-2">🎚️</span>
                                    スライダーを動かして形を確認しよう
                                </h4>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-mono">-1.0</span>
                                    <input type="range" min="-1" max="1" step="0.1" value=${step3R} 
                                        onChange=${(e) => {
                                            const val = parseFloat(e.target.value);
                                            setStep3R(val);
                                            if (Math.abs(val - 0.8) < 0.15) {
                                                setStep3Cleared(true);
                                            }
                                        }}
                                        class="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    <span class="text-xs font-mono">1.0</span>
                                </div>
                                <div class="mt-2 font-mono font-bold text-xl text-indigo-600 dark:text-indigo-400">r = ${step3R.toFixed(1)}</div>
                            </div>

                            <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border-2 ${step3Cleared ? 'border-green-400 bg-green-50 dark:bg-green-900/30' : 'border-indigo-100'} transition-all">
                                <p class="${tc('text-xs')} font-bold text-gray-500 dark:text-slate-400 mb-1">【ミッション】</p>
                                ${step3Cleared ? html`
                                    <div class="animate-bounce-slow">
                                        <p class="${tc('text-base')} font-black text-green-600 dark:text-green-400">正解！🎉</p>
                                        <p class="${tc('text-xs')} text-green-700 dark:text-green-300">「強い正の相関」が作れました。<br/>下にスクロールして次へ進めます。</p>
                                    </div>
                                ` : html`
                                    <p class="${tc('text-sm')} font-bold text-gray-800 dark:text-slate-200">
                                        スライダーを動かして<br/>
                                        <span class="text-red-500 text-lg">r = 0.8</span> に合わせてください！
                                    </p>
                                `}
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full opacity-80 hover:opacity-100 transition-opacity">
                        <div class="p-3 md:p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm flex items-center gap-4">
                             <div class="w-16 md:w-24 shrink-0 opacity-80">${NegativeCorrelationSVG}</div>
                            <div>
                                <h4 class="font-bold text-green-600 dark:text-green-400 mb-1 ${tc('text-sm')} md:${tc('text-base')}"> -1.0 に近いとき</h4>
                                <p class="${tc('text-xs')} md:${tc('text-sm')} text-gray-600 dark:text-slate-400">「負の相関」が強くなり、きれいな右下がりの直線に近づきます。</p>
                            </div>
                        </div>
                        <div class="p-3 md:p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm flex items-center gap-4">
                            <div class="w-16 md:w-24 shrink-0 opacity-80">${PositiveCorrelationSVG}</div>
                            <div>
                                <h4 class="font-bold text-red-600 dark:text-red-400 mb-1 ${tc('text-sm')} md:${tc('text-base')}">1.0 に近いとき</h4>
                                <p class="${tc('text-xs')} md:${tc('text-sm')} text-gray-600 dark:text-slate-400">「正の相関」が強くなり、きれいな右上がりの直線に近づきます。</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ4：回帰分析",
            content: html`
                <div class="flex flex-col items-center h-full space-y-4 animate-fade-in-up py-4 max-w-5xl mx-auto justify-center">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center w-full">
                        <!-- Left: Visual -->
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 aspect-video relative overflow-hidden">
                            <svg viewBox="0 0 200 150" class="w-full h-full">
                                <!-- Scatter Points -->
                                ${[...Array(15)].map((_,i) => {
                                    const x = 20 + i * 10 + (Math.random()*10-5);
                                    const y = 130 - (i * 8) + (Math.random()*15-7.5);
                                    return html`<circle key=${i} cx=${x} cy=${y} r="3" fill="#6366f1" opacity="0.5" />`;
                                })}
                                <!-- Regression Line -->
                                <line x1="20" y1="130" x2="160" y2="20" stroke="#f97316" stroke-width="3" stroke-linecap="round" class="animate-grow-x" />
                                <text x="165" y="25" fill="#f97316" font-size="10" font-weight="bold">y = ax + b</text>
                            </svg>
                            <div class="absolute bottom-2 left-0 right-0 text-center ${tc('text-xs')} text-orange-500 font-bold">
                                データの中心を通る線（回帰直線）
                            </div>
                        </div>

                        <!-- Right: Explanation -->
                        <div class="space-y-3">
                            <div class="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 rounded-r-xl">
                                <h3 class="${tc('text-lg')} md:${tc('text-xl')} font-black text-orange-800 dark:text-orange-300 mb-1">回帰分析（かいきぶんせき）</h3>
                                <p class="${tc('text-sm')} md:${tc('text-base')} text-gray-700 dark:text-slate-300 leading-relaxed">
                                    データ1（x）とデータ2（y）に相関があるとき、その関係を<span class="font-bold underline decoration-orange-300">「式」で表す</span>ことができます。これを<span class="font-bold text-orange-700 dark:text-orange-400">回帰（かいき）</span>といいます。
                                </p>
                            </div>
                            
                            <div class="space-y-2 ${tc('text-sm')} md:${tc('text-base')} text-gray-600 dark:text-slate-400">
                                <p>
                                    この式を使うことで、データがない部分（未来の数値など）を<span class="font-bold">予測</span>できるようになります。
                                    アプリ上の<span class="text-orange-500 font-bold">オレンジ色の線</span>が、その式を表しています。
                                </p>
                            </div>

                             <div class="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-200 dark:border-slate-600">
                                <h4 class="font-bold text-gray-800 dark:text-slate-200 mb-1 ${tc('text-sm')} md:${tc('text-base')}">単回帰分析（たんかいきぶんせき）</h4>
                                <p class="${tc('text-xs')} md:${tc('text-sm')} text-gray-600 dark:text-slate-400">
                                    今回のアプリのように、「勉強時間（1つのデータ）」を使って「成績（もう1つのデータ）」を予測するシンプルな分析のことを特にこう呼びます。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ5：要注意！「疑似相関」",
            content: html`
                <div class="flex flex-col items-center h-full animate-fade-in-up py-2 max-w-5xl mx-auto w-full overflow-hidden">
                    
                    <!-- Intro Cards -->
                    <div class="w-full mb-3 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                         <div class="bg-blue-50 dark:bg-slate-700/50 p-3 rounded-xl border-l-4 border-blue-500 shadow-sm">
                            <h3 class="font-black text-blue-900 dark:text-blue-200 mb-1 ${tc('text-base')} md:${tc('text-lg')}">💡 因果関係（いんがかんけい）</h3>
                            <p class="${tc('text-sm')} text-gray-700 dark:text-slate-300 leading-snug">
                                「Aが原因でBが起きた」という直接的な関係。<br/>
                                <span class="font-bold text-red-600 dark:text-red-400">重要：相関があっても因果があるとは限らない！</span>
                            </p>
                        </div>
                         <div class="bg-yellow-50 dark:bg-slate-700/50 p-3 rounded-xl border-l-4 border-yellow-500 shadow-sm">
                            <h3 class="font-black text-yellow-900 dark:text-yellow-200 mb-1 ${tc('text-base')} md:${tc('text-lg')}">⚠️ 疑似相関（ぎじそうかん）</h3>
                            <p class="${tc('text-sm')} text-gray-700 dark:text-slate-300 leading-snug">
                                本当は無関係なのに、別の隠れた要因（潜伏変数）の影響で、<span class="font-bold text-yellow-700 dark:text-yellow-400">あたかも関係があるように見えてしまう</span>現象。
                            </p>
                        </div>
                    </div>

                    <!-- Mobile Toggle Control -->
                    <div class="flex md:hidden w-full bg-gray-100 dark:bg-slate-800 p-1 rounded-lg mb-2 shrink-0">
                        <button onClick=${() => setStep5ShowTruth(false)} class="flex-1 py-1.5 ${tc('text-xs')} font-bold rounded-md transition-all ${!step5ShowTruth ? 'bg-white dark:bg-slate-600 shadow text-red-500' : 'text-gray-400'}">
                            ❌ 間違った解釈
                        </button>
                        <button onClick=${() => setStep5ShowTruth(true)} class="flex-1 py-1.5 ${tc('text-xs')} font-bold rounded-md transition-all ${step5ShowTruth ? 'bg-white dark:bg-slate-600 shadow text-indigo-500' : 'text-gray-400'}">
                            ⭕ 本当の理由
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full flex-1 min-h-0 overflow-y-auto pb-4">
                        <!-- Left: Wrong -->
                        <div class="${(isMobile && step5ShowTruth) ? 'hidden' : 'flex'} bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md border border-red-50 dark:border-red-900/50 flex-col items-center">
                            <span class="${tc('text-xs')} font-bold text-red-500 mb-4 tracking-widest uppercase bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded shrink-0">間違った解釈</span>
                            <div class="flex items-center gap-6 mb-6">
                                <div class="text-center"><div class="${tc('text-4xl')} md:${tc('text-6xl')} mb-2">🍦</div><div class="${tc('text-xs')} font-bold dark:text-slate-300">売上増</div></div>
                                <div class="${tc('text-3xl')} text-red-500 font-black animate-pulse">➡</div>
                                <div class="text-center"><div class="${tc('text-4xl')} md:${tc('text-6xl')} mb-2">🏊</div><div class="${tc('text-xs')} font-bold dark:text-slate-300">事故増</div></div>
                            </div>
                            <p class="${tc('text-base')} text-gray-700 dark:text-slate-300 text-center leading-relaxed">
                                「アイスを食べると事故が増える」…？<br/>
                                <span class="text-red-500 font-bold ${tc('text-lg')}">そんなわけないですよね。</span>
                            </p>
                        </div>

                        <!-- Right: Truth -->
                        <div class="${(isMobile && !step5ShowTruth) ? 'hidden' : 'flex'} bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-md border-2 border-indigo-50 dark:border-indigo-900/50 flex-col items-center relative">
                            <span class="${tc('text-xs')} font-bold text-indigo-500 mb-4 tracking-widest uppercase bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded shrink-0">本当の理由：疑似相関</span>
                            
                            <!-- Diagram Container -->
                            <div class="relative w-full h-48 mb-4">
                                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 text-center z-10 w-full">
                                    <div class="${tc('text-5xl')} md:${tc('text-6xl')} animate-bounce-slow">☀️</div>
                                    <div class="${tc('text-xs')} font-bold bg-yellow-100 dark:bg-yellow-800 dark:text-white px-2 py-0.5 rounded-full inline-block mt-1">
                                        共通の原因：気温（交絡因子）
                                    </div>
                                </div>
                                <!-- Arrows (SVG) -->
                                 <svg class="absolute inset-0 w-full h-full text-indigo-300" viewBox="0 0 300 150" preserveAspectRatio="none" overflow="visible">
                                    <defs>
                                        <marker id="arrow-blue-sm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L6,3 z" fill="currentColor" />
                                        </marker>
                                    </defs>
                                    <path d="M150 60 L 70 120" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arrow-blue-sm)" stroke-dasharray="4"/>
                                    <path d="M150 60 L 230 120" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arrow-blue-sm)" stroke-dasharray="4"/>
                                </svg>
                                <div class="absolute bottom-0 left-8 text-center z-10">
                                    <div class="${tc('text-4xl')}">🍦</div>
                                    <div class="${tc('text-xs')} font-bold dark:text-slate-300">売上増</div>
                                </div>
                                <div class="absolute bottom-0 right-8 text-center z-10">
                                    <div class="${tc('text-4xl')}">🏊</div>
                                    <div class="${tc('text-xs')} font-bold dark:text-slate-300">事故増</div>
                                </div>
                            </div>
                            <p class="${tc('text-base')} text-gray-800 dark:text-slate-200 text-center leading-relaxed">
                                <span class="font-bold border-b-2 border-yellow-300">「暑い」</span>から両方増えただけ。<br/>
                                直接の関係はありません。
                            </p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "ミッション開始！",
            content: html`
                <div class="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in-up py-4">
                    <div class="${tc('text-8xl')} md:${tc('text-[10rem]')} animate-bounce-slow drop-shadow-md">🔎</div>
                    <div class="space-y-4">
                        <h2 class="${tc('text-3xl')} md:${tc('text-5xl')} font-black text-gray-900 dark:text-white tracking-tighter">データ探偵の出番です！</h2>
                        <p class="${tc('text-base')} md:${tc('text-xl')} text-gray-500 dark:text-slate-400 font-medium">
                            解説で学んだことを活かして、<br/>
                            散布図から正しい関係を見つけ出しましょう！
                        </p>
                    </div>
                    <button onClick=${onFinish} class="px-8 py-4 md:px-12 md:py-6 bg-indigo-600 text-white ${tc('text-xl')} md:${tc('text-2xl')} font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
                        ドリルを開始する 🚀
                    </button>
                </div>
            `
        }
    ];

    const current = pages[step];
    
    // Step Check Logic
    const canProceed = useMemo(() => {
        if (step === 1) {
            // ステップ1は、negativeのプロットも終わらないと進めない
            return demoType === 'negative' && plotStep >= 3;
        }
        if (step === 3) {
            // ステップ3は、スライダータスクをクリアしないと進めない
            return step3Cleared;
        }
        return true;
    }, [step, plotStep, demoType, step3Cleared]);

    return html`
        <div class="flex-1 flex flex-col min-h-0 p-2 md:p-3 xl:max-w-6xl mx-auto w-full">
            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                <div class="bg-indigo-600 dark:bg-indigo-800 text-white px-3 py-2 flex justify-between items-center shrink-0">
                    <h2 class="text-sm md:text-lg font-bold flex items-center">
                        <span class="bg-white text-indigo-600 dark:text-indigo-800 rounded px-1.5 py-0.5 mr-2 text-xs md:text-sm font-black">${step + 1}</span>
                        ${current.title}
                    </h2>
                    
                    <div class="flex items-center gap-4">
                         <div class="flex items-center gap-1 bg-indigo-700/50 dark:bg-indigo-900/50 rounded p-0.5">
                            <button onClick=${() => setFontScale(Math.max(0, fontScale - 1))} class="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-xs font-bold" title="文字を小さく">A-</button>
                            <button onClick=${() => setFontScale(Math.min(2, fontScale + 1))} class="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-xs font-bold" title="文字を大きく">A+</button>
                        </div>
                        <div class="text-xs md:text-sm font-bold opacity-70">${step + 1} / ${pages.length}</div>
                    </div>
                </div>
                <div class="flex-1 p-3 overflow-y-auto bg-gray-50/50 dark:bg-slate-900">
                    ${current.content}
                </div>
                <div class="bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 p-2 md:p-4 flex justify-between items-center shrink-0 px-3">
                    <button onClick=${() => setStep(Math.max(0, step - 1))} disabled=${step === 0}
                        class="px-3 py-1.5 rounded-lg font-bold text-xs md:text-base text-gray-400 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 disabled:opacity-0 transition-all">
                        ← 戻る
                    </button>
                    <div class="flex space-x-1">
                        ${pages.map((_, i) => html`<div key=${i} class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${i === step ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-slate-700'}"></div>`)}
                    </div>
                    <button onClick=${() => setStep(Math.min(pages.length - 1, step + 1))} disabled=${step === pages.length - 1 || !canProceed}
                        class="px-4 py-1.5 md:px-6 md:py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-bold text-xs md:text-base hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        次へ →
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * ドリルクエストウィンドウ (DrillQuestWindow)
 */
const DrillQuestWindow = ({ quest, index, total, feedback, onSubmit, onNext, hasCleared, onRestart }) => {
    const isMobile = window.innerWidth < 768;
    const [fontScale, setFontScale] = useState(1); // 0: Small, 1: Normal, 2: Large
    
    // PCの場合は画面中央、モバイルの場合は下部
    const baseWidth = 350;
    const scaledWidth = baseWidth + (fontScale - 1) * 50;
    
    const initialPos = useMemo(() => {
        if (isMobile) {
            return { x: 16, y: window.innerHeight - 300 };
        }
        return { 
            x: (window.innerWidth / 2) - (scaledWidth / 2), 
            y: (window.innerHeight / 2) - 200 
        };
    }, [isMobile, scaledWidth]);

    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    const [isMinimized, setIsMinimized] = useState(false);
    
    // New Quest Loaded
    useEffect(() => {
        setIsMinimized(false);
    }, [quest.id, hasCleared]);

    if (hasCleared) return null;

    // Font size classes based on scale
    const getTextClass = (baseClass) => {
        const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
        // Map abstract scale 0,1,2 to index in sizes array relative to base
        const baseIndex = sizes.indexOf(baseClass);
        if (baseIndex === -1) return baseClass;
        const newIndex = Math.min(Math.max(0, baseIndex + (fontScale - 1)), sizes.length - 1);
        return sizes[newIndex];
    };

    const isCorrect = feedback === 'correct';
    let feedbackContent = null;
    let icon = "🧐";
    let statusClass = "bg-gray-100 border-l-4 border-gray-400";
    
    if (isCorrect) {
        icon = "🎉";
        statusClass = "bg-green-50 border-l-4 border-green-500";
        feedbackContent = html`
            <div class="space-y-3">
                <div class="font-bold text-green-700 ${getTextClass('text-lg')}">正解です！</div>
                <div class="bg-white p-3 rounded border border-green-200 ${getTextClass('text-sm')} text-gray-700 leading-relaxed shadow-sm">
                    ${quest.causationNote}
                </div>
                <button onClick=${onNext} class="w-full py-3 bg-green-500 text-white font-bold rounded shadow hover:bg-green-600 transition-transform active:scale-95 flex justify-center items-center">
                    <span>次のミッションへ</span> <span class="ml-2">➡</span>
                </button>
            </div>
        `;
    } else if (feedback) {
        icon = "🤔";
        let message = "";
        let color = "orange";
        if (feedback === 'incorrect') { message = `ヒント: ${quest.hint}`; color="orange"; }
        else if (feedback === 'incorrect_dataset') { message = "まずはデータソース設定で、対象のデータセットに切り替えよう！"; color="red"; }
        else if (feedback === 'same_variable') { message = "同じ項目同士だと相関が1.0になってしまうよ。別の項目を選ぼう。"; color="yellow"; }
        else if (feedback === 'stronger_correlation_available') { message = "相関はあるけれど…もっと強い相関があるステータスはありませんか？"; color="blue"; }

        statusClass = `bg-${color}-50 border-l-4 border-${color}-400`;
        feedbackContent = html`
            <div class="space-y-2">
                <div class="text-${color}-800 font-bold flex items-start">
                    <span class="mr-2 text-xl">⚠</span>
                    <span class="${getTextClass('text-sm')} mt-0.5">${message}</span>
                </div>
                <button onClick=${onSubmit} class="w-full py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 transition-colors">
                    再調査する
                </button>
            </div>
        `;
    } else {
        feedbackContent = html`
            <div class="space-y-3">
                <div class="text-gray-400 text-xs text-center py-1">
                     （データソースと軸を選んで調査しよう）
                </div>
                <button onClick=${onSubmit} class="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded shadow-md hover:from-orange-600 hover:to-red-600 transition-transform active:scale-95 flex items-center justify-center">
                    <span>調査報告をする</span>
                </button>
            </div>
        `;
    }

    return html`
        <div class="fixed z-[90] bg-white shadow-xl rounded-xl overflow-hidden border-2 transition-all duration-300
                   ${isCorrect ? 'border-green-400 ring-4 ring-green-100' : 'border-indigo-100'}
                   ${(isMinimized && !feedback) ? 'animate-flash' : ''}"
            style=${{ top: position.y, left: position.x, width: isMinimized ? '220px' : (isMobile ? 'calc(100vw - 32px)' : `${scaledWidth}px`), maxHeight: '80vh', touchAction: 'none' }}>
            <div class="px-3 py-2 bg-gray-900 text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none touch-none"
                onPointerDown=${onPointerDown} onPointerMove=${onPointerMove} onPointerUp=${onPointerUp}>
                <div class="flex items-center space-x-2">
                    <span class="text-xl">${icon}</span>
                    <span class="font-bold text-xs uppercase tracking-widest">Mission ${index + 1} / ${total}</span>
                </div>
                <div class="flex items-center gap-1">
                    ${!isMinimized && html`
                        <button onClick=${(e) => { e.stopPropagation(); setFontScale(Math.max(0, fontScale - 1)); }} class="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-xs font-bold" title="文字を小さく">A-</button>
                        <button onClick=${(e) => { e.stopPropagation(); setFontScale(Math.min(2, fontScale + 1)); }} class="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-xs font-bold" title="文字を大きく">A+</button>
                        <div class="w-px h-4 bg-gray-600 mx-1"></div>
                    `}
                    <button onClick=${() => setIsMinimized(!isMinimized)} class="p-1 hover:bg-white/20 rounded font-bold w-6 h-6 flex items-center justify-center">
                        ${isMinimized ? '□' : '－'}
                    </button>
                </div>
            </div>
            ${!isMinimized && html`
                <div class="p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
                    <div class="text-gray-800 font-bold leading-snug ${getTextClass('text-base')}">${quest.text}</div>
                    
                    <!-- 常時表示する目的 -->
                    <div class="bg-blue-50 text-blue-800 p-3 rounded-lg ${getTextClass('text-sm')} font-bold border border-blue-200 shadow-sm animate-fade-in-up">
                        <div class="flex items-start gap-2">
                            <span class="text-lg">💡</span>
                            <span class="mt-0.5">${quest.explicitObjective}</span>
                        </div>
                    </div>

                    <div class="rounded-lg p-3 ${statusClass} transition-colors duration-300">
                        ${feedbackContent}
                    </div>
                </div>
            `}
        </div>
    `;
}

/**
 * エクストラミッション用のウィンドウ (ExtraMissionWindow)
 */
const ExtraMissionWindow = ({ correlation, activeCount, stage, totalStages, targetR, onNext, onComplete, excludedIds, targetIds, missionType }) => {
    const isMobile = window.innerWidth < 768;
    const initialPos = isMobile ? { x: 16, y: window.innerHeight - 300 } : { x: window.innerWidth - 380, y: 80 };
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const missionInfo = EXTRA_MISSION_STAGES[stage];
    
    // Check Success Condition based on Type
    let isSuccess = false;
    let progress = 0;
    
    if (missionType === 'selection') {
        // In selection mode, excludedIds act as "selectedIds"
        // Check if excludedIds exactly matches targetIds
        const sortedExcluded = [...excludedIds].sort().toString();
        const sortedTarget = [...targetIds].sort().toString();
        isSuccess = sortedExcluded === sortedTarget;
        
        // Progress for selection: how many correct IDs are selected
        const correctCount = excludedIds.filter(id => targetIds.includes(id)).length;
        progress = correctCount / targetIds.length;
    } else {
        // Cleaning mode
        isSuccess = correlation >= targetR;
        progress = Math.max(0, correlation); // Simplified progress
    }

    const isFinalStage = stage === totalStages - 1;

    return html`
        <div class="fixed z-[90] bg-white shadow-2xl rounded-xl overflow-hidden border-2 transition-all duration-300
                   ${isSuccess ? 'border-green-400 ring-4 ring-green-100' : 'border-red-500 ring-4 ring-red-100'}"
            style=${{ top: position.y, left: position.x, width: isMinimized ? '200px' : (isMobile ? 'calc(100vw - 32px)' : '350px'), touchAction: 'none' }}>
            <div class="px-4 py-2 bg-gray-900 text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none touch-none"
                onPointerDown=${onPointerDown} onPointerMove=${onPointerMove} onPointerUp=${onPointerUp}>
                <div class="flex items-center space-x-2">
                    <span class="text-xl">🛠️</span>
                    <span class="font-bold text-xs tracking-widest uppercase">Stage ${stage + 1} / ${totalStages}</span>
                </div>
                <button onClick=${() => setIsMinimized(!isMinimized)} class="p-1 hover:bg-white/20 rounded">
                    ${isMinimized ? '□' : '－'}
                </button>
            </div>
            ${!isMinimized && html`
                <div class="p-5 flex flex-col gap-4">
                    ${!isSuccess && html`
                        <div class="border-b pb-2 mb-1">
                            <h4 class="font-black text-gray-800 text-lg mb-1">${missionInfo.title}</h4>
                            <p class="text-sm text-gray-600 leading-relaxed">${missionInfo.intro}</p>
                        </div>
                    `}

                    ${isSuccess ? html`
                         <div class="text-center space-y-3">
                            <div class="text-5xl animate-bounce-slow">✨</div>
                            <h3 class="text-xl font-bold text-green-600">達成完了！</h3>
                            <div class="bg-green-50 p-3 rounded-lg text-left">
                                <p class="text-sm text-green-900 leading-relaxed font-medium">${missionInfo.explanation}</p>
                            </div>
                            ${missionType === 'cleaning' && html`
                                <div class="p-3 rounded-xl border border-green-200 text-center font-mono text-xl text-green-800 font-black">
                                    r = ${correlation.toFixed(3)}
                                </div>
                            `}
                            ${isFinalStage ? html`
                                <button onClick=${onComplete} class="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all text-lg animate-pulse">
                                    探偵マスターの称号を受け取る 🎓
                                </button>
                            ` : html`
                                <button onClick=${onNext} class="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all text-lg">
                                    次の事件へ ➡
                                </button>
                            `}
                        </div>
                    ` : html`
                        <div class="space-y-3">
                            <h3 class="font-bold text-red-700 text-sm border-b border-red-50 pb-1">
                                ${missionType === 'selection' ? '指令：対象のデータを特定（クリック）せよ' : '指令：異常データを除外せよ'}
                            </h3>
                            
                            ${missionType === 'selection' ? html`
                                <div class="bg-gray-50 p-3 rounded-lg text-center">
                                     <div class="text-sm font-bold text-gray-700 mb-2">発見数: <span class="text-xl text-indigo-600">${excludedIds.filter(id => targetIds.includes(id)).length}</span> / ${targetIds.length}</div>
                                     <p class="text-xs text-gray-500">条件に合う点をクリックして選択してください</p>
                                </div>
                            ` : html`
                                <div class="space-y-2 bg-gray-50 p-3 rounded-lg">
                                    <div class="flex justify-between font-bold text-xs">
                                        <span>現在の r</span>
                                        <span class="${correlation < 0.5 ? 'text-red-500' : 'text-orange-500'}">${correlation.toFixed(3)}</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                        <div class="bg-red-500 h-full transition-all duration-500 ease-out" style=${{ width: `${Math.max(0, correlation * 100)}%` }}></div>
                                        <div class="absolute top-0 bottom-0 border-r-2 border-dashed border-white" style=${{ left: `${targetR * 100}%` }}></div>
                                    </div>
                                    <div class="text-right text-[10px] font-bold text-gray-400">Target: ${targetR.toFixed(3)} 以上</div>
                                </div>
                            `}
                        </div>
                    `}
                </div>
            `}
        </div>
    `;
}

/**
 * 散布図コンポーネント
 */
const ScatterVis = ({ data, xConfig, yConfig, regression, excludedIds, onTogglePoint, visualMode = 'normal', isDark }) => {
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

    // Determine cell color based on mode
    const getCellColor = (id) => {
        const isExcluded = excludedIds.includes(id);
        if (visualMode === 'selection') {
            return isExcluded ? '#f59e0b' : (isDark ? '#475569' : '#cbd5e1');
        } else {
            return isExcluded ? (isDark ? '#1e293b' : '#eee') : '#6366f1';
        }
    };
    
    const getCellStroke = (id) => {
        const isExcluded = excludedIds.includes(id);
        if (visualMode === 'selection') {
            return isExcluded ? '#b45309' : (isDark ? '#334155' : '#94a3b8');
        } else {
             return isExcluded ? (isDark ? '#334155' : '#ccc') : 'none';
        }
    }

    const gridColor = isDark ? "#334155" : "#eee";
    const axisColor = isDark ? "#94a3b8" : "#666";
    const labelXColor = isDark ? "#60a5fa" : "#3b82f6";
    const labelYColor = isDark ? "#34d399" : "#10b981";

    return html`
        <${ResponsiveContainer} width="100%" height="100%">
            <${ComposedChart} margin=${{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <${CartesianGrid} strokeDasharray="3 3" stroke=${gridColor} />
                <${XAxis} type="number" dataKey=${xConfig.key} name=${xConfig.label} domain=${domain.x}
                    tick=${{fill: axisColor, fontSize: 12}}
                    label=${{ value: xConfig.label, position: 'bottom', offset: 0, fill: labelXColor, fontSize: 12 }} />
                <${YAxis} type="number" dataKey=${yConfig.key} name=${yConfig.label} domain=${domain.y}
                    tick=${{fill: axisColor, fontSize: 12}}
                    label=${{ value: yConfig.label, angle: -90, position: 'insideLeft', fill: labelYColor, fontSize: 12 }} />
                <${Tooltip} cursor=${{ strokeDasharray: '3 3', stroke: axisColor }}
                    content=${({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            if (!d.id) return null;
                            const isExcluded = excludedIds.includes(d.id);
                            
                            let statusText = "";
                            let statusClass = "";
                            if (visualMode === 'selection') {
                                statusText = isExcluded ? '選択中' : '未選択';
                                statusClass = isExcluded ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400';
                            } else {
                                statusText = isExcluded ? '除外中' : '使用中';
                                statusClass = isExcluded ? 'text-red-500' : 'text-green-600 dark:text-green-400';
                            }

                            return html`
                                <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-2 rounded shadow text-xs">
                                    <div class="font-bold mb-1 flex justify-between gap-4 text-gray-800 dark:text-slate-200">
                                        <span>ID: ${d.id}</span>
                                        <span class="${statusClass}">
                                            ${statusText}
                                        </span>
                                    </div>
                                    <p class="text-blue-600 dark:text-blue-400">${xConfig.label}: ${d[xConfig.key]}</p>
                                    <p class="text-green-600 dark:text-green-400">${yConfig.label}: ${d[yConfig.key]}</p>
                                </div>
                            `;
                        }
                        return null;
                    }} />
                <${Scatter} name="Data" data=${data} onClick=${(d) => onTogglePoint(d.id)} cursor="pointer">
                    ${data.map((entry, index) => html`<${Cell} key=${`cell-${index}`} fill=${getCellColor(entry.id)} stroke=${getCellStroke(entry.id)} />`)}
                </${Scatter}>
                <${Line} data=${lineData} dataKey=${yConfig.key} stroke="#f97316" strokeWidth=${2} dot=${false} activeDot=${false} isAnimationActive=${false} />
            </${ComposedChart}>
        </${ResponsiveContainer}>
    `;
};

// Analysis Panel
const AnalysisPanel = ({ xLabel, yLabel, correlation, regression, strength, activeCount, totalCount }) => html`
    <div class="space-y-6">
        <div>
            <h3 class="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Correlation</h3>
            <div class="bg-blue-50/50 dark:bg-slate-700/50 p-4 rounded-xl border border-blue-50 dark:border-slate-700">
                <div class="flex justify-between items-baseline mb-2">
                    <span class="text-gray-500 dark:text-slate-400 font-bold text-sm">相関係数 (r)</span>
                    <span class="text-2xl font-black text-blue-700 dark:text-blue-400">${correlation.toFixed(3)}</span>
                </div>
                <${CorrelationMeter} r=${correlation} />
                <div class="mt-4 text-center">
                    <span class="block w-full px-3 py-2 text-lg md:text-xl font-black rounded-lg shadow-sm 
                        ${strength.includes('かなり強い') ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 
                          strength.includes('正の') ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          strength.includes('負の') ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-300'}">
                        ${strength}
                    </span>
                    <div class="text-right text-[10px] text-gray-400 dark:text-slate-500 mt-1">n=${activeCount}/${totalCount}</div>
                </div>
            </div>
        </div>
        <div>
            <h3 class="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Regression</h3>
            <div class="bg-green-50/50 dark:bg-slate-700/50 p-4 rounded-xl border border-green-50 dark:border-slate-700">
                <div class="text-gray-500 dark:text-slate-400 font-bold text-sm mb-2">回帰式</div>
                <div class="text-sm font-mono font-bold text-center bg-white dark:bg-slate-800 py-3 rounded-lg border border-green-100 dark:border-slate-600 text-green-800 dark:text-green-400 shadow-inner">
                    y = ${regression.slope.toFixed(2)}x ${regression.intercept >= 0 ? '+' : '-'} ${Math.abs(regression.intercept).toFixed(2)}
                </div>
            </div>
        </div>
    </div>
`;

const CorrelationMeter = ({ r }) => {
    const percentage = ((r + 1) / 2) * 100;
    return html`
        <div class="mt-2">
            <div class="relative h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-gray-200 to-red-400 shadow-inner overflow-hidden dark:opacity-80">
                <div class="absolute top-0 bottom-0 w-1 bg-black border border-white shadow transition-all duration-700 ease-out" style=${{ left: `${percentage}%`, transform: 'translateX(-50%)' }}></div>
            </div>
            <div class="flex justify-between text-[8px] font-bold text-gray-400 dark:text-slate-500 mt-1">
                <span>-1.0</span><span>0</span><span>1.0</span>
            </div>
        </div>
    `;
};

// Main App Component (React 19)
const App = () => {
    const [mode, setMode] = useState('explanation');
    const [availableDatasets, setAvailableDatasets] = useState(DATASETS);
    const [datasetId, setDatasetId] = useState(DATASETS[0].id);
    const [xKey, setXKey] = useState(DATASETS[0].columns[0].key);
    const [yKey, setYKey] = useState(DATASETS[0].columns[1].key);
    const [excludedIds, setExcludedIds] = useState([]);
    const [showDataWindow, setShowDataWindow] = useState(false);
    const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
    const [drillFeedback, setDrillFeedback] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const [hasCleared, setHasCleared] = useState(false);
    const [extraMissionLevel, setExtraMissionLevel] = useState(0);
    
    // Game Completion State
    const [isGameComplete, setIsGameComplete] = useState(false);
    
    // Check Dark Mode
    const isDark = isGameComplete;

    const dataset = useMemo(() => availableDatasets.find(d => d.id === datasetId) || availableDatasets[0], [datasetId, availableDatasets]);
    const xColumn = useMemo(() => dataset.columns.find(c => c.key === xKey) || dataset.columns[0], [dataset, xKey]);
    const yColumn = useMemo(() => dataset.columns.find(c => c.key === yKey) || dataset.columns[1], [dataset, yKey]);

    const stats = useMemo(() => {
        const activeData = dataset.data.filter(d => !excludedIds.includes(d.id));
        const xData = activeData.map(d => d[xColumn.key]);
        const yData = activeData.map(d => d[yColumn.key]);
        if (xData.length === 0) return { correlation: 0, regression: { slope: 0, intercept: 0 }, strength: "データなし", activeCount: 0, xStats: { min: 0, max: 0, mean: 0 }, yStats: { min: 0, max: 0, mean: 0 }, yStats: { min: 0, max: 0, mean: 0 } };
        const r = MathUtils.calculateCorrelation(xData, yData);
        const reg = MathUtils.calculateRegression(xData, yData);
        const str = MathUtils.getCorrelationStrength(r);
        const calcStats = (arr) => ({ min: Math.min(...arr), max: Math.max(...arr), mean: MathUtils.calculateMean(arr) });
        return { correlation: r, regression: reg, strength: str, activeCount: xData.length, xStats: calcStats(xData), yStats: calcStats(yData) };
    }, [dataset, xColumn, yColumn, excludedIds]);

    useEffect(() => {
        if (mode === 'drill' && !hasCleared) {
            const quest = DRILL_QUESTS[currentQuestIndex];
            if (quest) { 
                setDatasetId(quest.datasetId); 
                setXKey(quest.initialX); 
                setYKey(quest.initialY); 
            }
            setDrillFeedback(null);
        }
    }, [currentQuestIndex, mode, hasCleared]);

    const togglePoint = (id) => setExcludedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const handleSwapAxes = () => { const oldX = xKey; setXKey(yKey); setYKey(oldX); };

    const handleDrillSubmit = () => {
        const quest = DRILL_QUESTS[currentQuestIndex];
        if (datasetId !== quest.datasetId) { setDrillFeedback('incorrect_dataset'); return; }
        if (xKey === yKey) { setDrillFeedback('same_variable'); return; }
        
        // Special Logic for HP in Q6
        const isTargetX = xKey === quest.targetKey;
        const isTargetY = yKey === quest.targetKey;
        const selectedPair = isTargetX ? yKey : (isTargetY ? xKey : null);
        
        if (quest.id === 6 && selectedPair === 'hp') {
            setDrillFeedback('stronger_correlation_available');
            return;
        }

        if (selectedPair && quest.validAnswers.includes(selectedPair)) { 
            setDrillFeedback('correct'); 
        } else { 
            setDrillFeedback('incorrect');
        }
    };

    const nextQuest = () => { 
        setDrillFeedback(null); 
        if (currentQuestIndex < DRILL_QUESTS.length - 1) { 
            setCurrentQuestIndex(prev => prev + 1); 
        } else { 
            setHasCleared(true); 
            setShowClearModal(true); 
        } 
    };
    const restartDrill = () => { setShowClearModal(false); setHasCleared(false); setCurrentQuestIndex(0); setDrillFeedback(null); setMode('drill'); };
    
    const loadExtraMissionLevel = (levelIndex) => { 
        const config = EXTRA_MISSION_STAGES[levelIndex]; 
        setDatasetId(config.datasetId); 
        setXKey(config.xKey); 
        setYKey(config.yKey); 
        setExcludedIds([]); 
    };
    const startExtraMission = () => { setShowClearModal(false); setMode('extra'); setExtraMissionLevel(0); loadExtraMissionLevel(0); };
    const nextExtraMission = () => { if (extraMissionLevel < EXTRA_MISSION_STAGES.length - 1) { const nextLevel = extraMissionLevel + 1; setExtraMissionLevel(nextLevel); loadExtraMissionLevel(nextLevel); } };
    const finishExtraMission = () => { 
        setIsGameComplete(true);
        setMode('exploration'); 
        setDatasetId(DATASETS[0].id); 
        setExcludedIds([]); 
    };

    // Visual Mode for ScatterVis
    const visualMode = useMemo(() => {
        if (mode === 'extra' && EXTRA_MISSION_STAGES[extraMissionLevel]?.type === 'selection') {
            return 'selection';
        }
        return 'normal';
    }, [mode, extraMissionLevel]);

    const bgClass = useMemo(() => {
        // Parent class controls dark mode via 'dark' class
        if (isGameComplete) return 'dark bg-slate-900';
        return 'bg-gray-50';
    }, [isGameComplete]);

    return html`
        <div class="h-full flex flex-col font-sans transition-all duration-1000 overflow-hidden ${bgClass}">
            <header class="bg-white dark:bg-slate-900 px-3 py-1 md:py-3 flex items-center justify-between shadow-md z-10 border-b dark:border-slate-800 shrink-0 h-12 md:h-auto">
                <div class="flex items-center space-x-2">
                    <div class="bg-indigo-600 dark:bg-indigo-500 text-white p-1 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <h1 class="text-sm font-black text-gray-900 dark:text-white tracking-tight hidden md:block">
                        Data Detective
                    </h1>
                </div>
                <div class="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg gap-0.5">
                    <button class="px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${mode === 'explanation' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300' : 'text-gray-400 dark:text-slate-500'}" onClick=${() => setMode('explanation')}>📚 解説</button>
                    <button class="px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${mode === 'drill' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-300' : 'text-gray-400 dark:text-slate-500'}" onClick=${() => setMode('drill')}>🔎 ドリル</button>
                    <button class="px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${mode === 'exploration' ? 'bg-white text-green-600 shadow-sm dark:bg-slate-700 dark:text-green-300' : 'text-gray-400 dark:text-slate-500'}" onClick=${() => setMode('exploration')}>📊 自由</button>
                </div>
            </header>

            ${mode === 'explanation' ? html`<${TutorialMode} onFinish=${() => setMode('drill')} />` : html`
                <main class="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 md:p-4 gap-2 md:gap-4 w-full relative">
                    <aside class="w-full lg:w-72 flex flex-col gap-2 shrink-0 overflow-y-auto pr-1">
                        <${Card} title="データソース設定">
                            <div class="space-y-3">
                                <div>
                                    <select class="block w-full border border-gray-200 dark:border-slate-600 rounded-lg p-1.5 bg-white dark:bg-slate-700 dark:text-white text-sm font-bold" value=${datasetId} onChange=${e => setDatasetId(e.target.value)} disabled=${mode === 'extra'}>
                                        ${availableDatasets.map(d => html`<option key=${d.id} value=${d.id}>${d.name}</option>`)}
                                    </select>
                                    <p class="mt-1 text-xs text-gray-500 dark:text-slate-400 font-medium leading-relaxed">${dataset.description}</p>
                                </div>
                                <button onClick=${() => setShowDataWindow(true)} class="w-full py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all">データ一覧</button>
                            </div>
                        </${Card}>
                        
                        <${Card} title="分析項目の選択" className=${`flex-1 transition-all duration-300 ${mode === 'drill' ? 'ring-4 ring-orange-300 shadow-orange-100 relative overflow-visible' : ''}`}>
                            ${mode === 'drill' && html`
                                <div class="absolute -top-4 right-4 bg-orange-500 text-white font-bold text-xs px-3 py-0.5 rounded-full animate-bounce shadow-lg z-20 pointer-events-none">
                                    👇 ここを調査！
                                </div>
                            `}
                            <div class="space-y-3">
                                <div class="p-2 bg-blue-50/50 dark:bg-slate-700/50 rounded-lg border border-blue-50 dark:border-slate-600 ${mode === 'extra' ? 'opacity-50' : ''}">
                                    <label class="block text-[10px] font-black text-blue-800 dark:text-blue-300 mb-1 uppercase">X軸（横軸）</label>
                                    <select class="w-full border border-blue-100 dark:border-slate-500 rounded-lg p-1.5 bg-white dark:bg-slate-800 dark:text-white text-sm font-bold" value=${xKey} onChange=${e => setXKey(e.target.value)} disabled=${mode === 'extra'}>
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                </div>
                                <div class="flex justify-center"><button onClick=${handleSwapAxes} class="p-1.5 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 transition-all text-xs" disabled=${mode === 'extra'}>🔄 軸入替</button></div>
                                <div class="p-2 bg-green-50/50 dark:bg-slate-700/50 rounded-lg border border-green-50 dark:border-slate-600 ${mode === 'extra' ? 'opacity-50' : ''}">
                                    <label class="block text-[10px] font-black text-green-800 dark:text-green-300 mb-1 uppercase">Y軸（縦軸）</label>
                                    <select class="w-full border border-green-100 dark:border-slate-500 rounded-lg p-1.5 bg-white dark:bg-slate-800 dark:text-white text-sm font-bold" value=${yKey} onChange=${e => setYKey(e.target.value)} disabled=${mode === 'extra'}>
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                </div>
                            </div>
                        </${Card}>
                    </aside>
                    <section class="flex-1 flex flex-col min-w-0">
                        <${Card} className="h-full shadow-md border-gray-200">
                            <div class="h-full flex flex-col">
                                <div class="flex justify-between items-center mb-2 px-1">
                                    <h2 class="text-sm font-black text-gray-800 dark:text-slate-100"><span class="text-blue-500 dark:text-blue-400">${xColumn.label}</span> vs <span class="text-green-500 dark:text-green-400">${yColumn.label}</span></h2>
                                    <div class="flex gap-2 text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase">
                                        <div class="flex items-center gap-1"><div class="w-2 h-2 bg-indigo-500 rounded"></div> データ</div>
                                        <div class="flex items-center gap-1"><div class="w-2 h-2 bg-orange-500 rounded-full"></div> 回帰</div>
                                    </div>
                                </div>
                                <div class="flex-1"><${ScatterVis} data=${dataset.data} xConfig=${xColumn} yConfig=${yColumn} regression=${stats.regression} excludedIds=${excludedIds} onTogglePoint=${togglePoint} visualMode=${visualMode} isDark=${isDark} /></div>
                            </div>
                        </${Card}>
                    </section>
                    <aside class="w-full lg:w-64 flex-shrink-0">
                        <${Card} title="統計結果" className="h-full">
                            <${AnalysisPanel} xLabel=${xColumn.label} yLabel=${yColumn.label} correlation=${stats.correlation} regression=${stats.regression} strength=${stats.strength} activeCount=${stats.activeCount} totalCount=${dataset.data.length} />
                        </${Card}>
                    </aside>
                    
                    ${mode === 'drill' && !showClearModal && html`<${DrillQuestWindow} quest=${DRILL_QUESTS[currentQuestIndex]} index=${currentQuestIndex} total=${DRILL_QUESTS.length} feedback=${drillFeedback} onSubmit=${handleDrillSubmit} onNext=${nextQuest} hasCleared=${hasCleared} onRestart=${restartDrill} />`}
                    ${mode === 'extra' && html`<${ExtraMissionWindow} correlation=${stats.correlation} activeCount=${stats.activeCount} stage=${extraMissionLevel} totalStages=${EXTRA_MISSION_STAGES.length} targetR=${EXTRA_MISSION_STAGES[extraMissionLevel].targetR} targetIds=${EXTRA_MISSION_STAGES[extraMissionLevel].targetIds} missionType=${EXTRA_MISSION_STAGES[extraMissionLevel].type} excludedIds=${excludedIds} onNext=${nextExtraMission} onComplete=${finishExtraMission} />`}
                </main>
            `}

            ${showDataWindow && html`<${FloatingDataWindow} data=${dataset.data} columns=${dataset.columns} excludedIds=${excludedIds} onTogglePoint=${togglePoint} onClose=${() => setShowDataWindow(false)} visualMode=${visualMode} isDark=${isDark} />`}
            ${showClearModal && html`<${DrillClearModal} onRestart=${restartDrill} onExploration=${() => {setShowClearModal(false); setMode('exploration');}} onExtraMission=${startExtraMission} />`}
        </div>
    `;
};

const DrillClearModal = ({ onRestart, onExploration, onExtraMission }) => html`
    <div class="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden">
            <div class="text-7xl mb-4 animate-bounce-slow">🎊</div>
            <h2 class="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">CONGRATULATIONS!</h2>
            <p class="text-gray-700 dark:text-slate-300 mb-6 font-bold">全ミッション達成おめでとう！<br/>君は立派なデータマスターだ！</p>
            <div class="space-y-3">
                <button onClick=${onExtraMission} class="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-xl hover:scale-105 transition-all animate-pulse">
                    🛠️ エクストラミッション：データ修正
                </button>
                <button onClick=${onExploration} class="w-full py-3 bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors">
                    📊 自由研究モードへ
                </button>
                <button onClick=${onRestart} class="w-full py-3 text-gray-400 dark:text-slate-500 font-bold hover:text-gray-600 dark:hover:text-slate-400">最初からやり直す</button>
            </div>
        </div>
    </div>
`;

const FloatingDataWindow = ({ data, columns, excludedIds, onTogglePoint, onClose, visualMode, isDark }) => {
    const isMobile = window.innerWidth < 768;
    const initialPos = isMobile ? { x: 10, y: 100 } : { x: 20, y: 150 };
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    return html`
        <div class="fixed bg-white dark:bg-slate-800 shadow-2xl rounded-lg border border-gray-200 dark:border-slate-700 z-[100] flex flex-col overflow-hidden"
            style=${{ top: position.y, left: position.x, width: isMobile ? '90vw' : '500px', height: '400px', touchAction: 'none' }}>
            <div class="bg-gray-800 dark:bg-slate-900 text-white px-3 py-2 cursor-grab active:cursor-grabbing flex justify-between items-center"
                onPointerDown=${onPointerDown} onPointerMove=${onPointerMove} onPointerUp=${onPointerUp}>
                <span class="text-xs font-bold">データ一覧 (n=${data.length})</span>
                <button onClick=${onClose} class="hover:text-red-400 font-bold">×</button>
            </div>
            <div class="flex-1 overflow-auto text-gray-800 dark:text-slate-200">
                <table class="w-full text-[10px] text-left">
                    <thead class="bg-gray-50 dark:bg-slate-700 sticky top-0">
                        <tr>
                            <th class="p-2 border-b dark:border-slate-600">使用</th>
                            <th class="p-2 border-b dark:border-slate-600">ID</th>
                            ${columns.map(c => html`<th key=${c.key} class="p-2 border-b dark:border-slate-600">${c.label}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => html`
                            <tr key=${row.id} class="border-b dark:border-slate-700 ${excludedIds.includes(row.id) ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600' : 'even:bg-gray-50 dark:even:bg-slate-800/50'}">
                                <td class="p-2 text-center"><input type="checkbox" checked=${!excludedIds.includes(row.id)} onChange=${() => onTogglePoint(row.id)} /></td>
                                <td class="p-2">${row.id}</td>
                                ${columns.map(c => html`<td key=${c.key} class="p-2">${row[c.key]}</td>`)}
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
