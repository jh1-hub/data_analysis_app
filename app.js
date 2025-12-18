
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
 * 解説モードコンポーネント (TutorialMode)
 */
const TutorialMode = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const demoData = [{ id: 1, temp: 25, sales: 150 }, { id: 2, temp: 30, sales: 280 }, { id: 3, temp: 35, sales: 400 }];
    const [plotStep, setPlotStep] = useState(0);

    const pages = [
        {
            title: "散布図（さんぷず）とは？",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-fade-in-up py-8">
                    <div class="text-9xl animate-bounce-slow drop-shadow-sm">📊</div>
                    <div class="space-y-6 max-w-4xl">
                        <p class="text-xl md:text-2xl text-gray-700 leading-relaxed">
                            「勉強を頑張るほど、テストの点数は上がるのかな？」<br/>
                            「気温が上がると、アイスの売上は増えるのかな？」
                        </p>
                        <p class="text-2xl md:text-3xl text-gray-800 font-bold">
                            このように、<span class="text-indigo-600 border-b-2 border-indigo-200">2つのデータにどのような関係があるか</span>を<br/>
                            「点」を使って視覚的に表したグラフが<span class="text-indigo-600 font-black">散布図（さんぷず）</span>です。
                        </p>
                        <p class="text-gray-500 text-lg">
                            データをグラフにすることで、数字の列だけでは気づけない<br/>「傾向」や「つながり」が見えてきます。
                        </p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ1：表から点を打ってみよう",
            content: html`
                <div class="flex flex-col lg:flex-row gap-10 min-h-[60vh] items-center justify-center animate-fade-in-up py-6">
                    <div class="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h4 class="font-bold text-xl text-center mb-4 text-indigo-600">アイス売上のデータ表</h4>
                        <table class="w-full text-lg">
                            <thead class="bg-indigo-50">
                                <tr><th class="p-3">気温(℃)</th><th class="p-3">売上(個)</th></tr>
                            </thead>
                            <tbody class="divide-y">
                                ${demoData.map((d, i) => html`
                                    <tr class="transition-all duration-300 ${plotStep > i ? 'bg-indigo-50' : ''}">
                                        <td class="p-4 text-center font-mono font-bold">${d.temp}℃</td>
                                        <td class="p-4 text-center font-mono font-bold text-green-600">${d.sales}個</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                        <div class="mt-6 flex flex-col gap-3">
                            <button onClick=${() => setPlotStep(prev => Math.min(prev + 1, 3))}
                                class="px-6 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold hover:bg-indigo-700 shadow-md active:scale-95 transition-all">
                                1つずつプロットする ➡
                            </button>
                            <button onClick=${() => setPlotStep(0)} class="text-gray-400 font-bold hover:text-gray-600 text-sm">リセット</button>
                        </div>
                    </div>
                    <div class="w-full lg:w-3/5 aspect-video bg-white rounded-xl shadow-lg border border-gray-200 relative p-8">
                        <svg viewBox="0 0 400 300" class="w-full h-full overflow-visible">
                            <line x1="50" y1="250" x2="380" y2="250" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
                            <line x1="50" y1="250" x2="50" y2="20" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
                            <text x="380" y="275" text-anchor="end" font-size="14" fill="#3b82f6" font-weight="bold">気温 (X軸)</text>
                            <text x="40" y="20" text-anchor="end" font-size="14" fill="#10b981" font-weight="bold">売上 (Y軸)</text>
                            ${demoData.map((d, i) => {
                                const x = 50 + ((d.temp - 20) / 20) * 300;
                                const y = 250 - (d.sales / 500) * 230;
                                return plotStep > i && html`
                                    <g key=${i}>
                                        <line x1="${x}" y1="250" x2="${x}" y2="${y}" stroke="#3b82f6" stroke-dasharray="4" class="animate-grow-y" />
                                        <line x1="50" y1="${y}" x2="${x}" y2="${y}" stroke="#10b981" stroke-dasharray="4" class="animate-grow-x" />
                                        <circle cx="${x}" cy="${y}" r="7" fill="#6366f1" stroke="white" stroke-width="2" class="animate-pop-point" />
                                        <text x="${x}" y="265" text-anchor="middle" font-size="10" fill="#3b82f6" class="animate-show-text">${d.temp}</text>
                                        <text x="35" y="${y+4}" text-anchor="end" font-size="10" fill="#10b981" class="animate-show-text">${d.sales}</text>
                                    </g>
                                `;
                            })}
                        </svg>
                        <p class="absolute bottom-4 right-4 text-xs text-gray-400">横軸(X)と縦軸(Y)が交わる場所に点を打ちます</p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ2：点の並び方（相関の種類）",
            content: html`
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[50vh] items-stretch animate-fade-in-up py-8">
                    <!-- Positive -->
                    <div class="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center text-center shadow-sm">
                        <div class="h-32 w-full flex items-center justify-center mb-4">
                            <svg viewBox="0 0 100 80" class="w-3/4 overflow-visible">
                                <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
                                <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
                                <path d="M15 65 L 85 15" stroke="#ef4444" stroke-width="1" stroke-dasharray="2" opacity="0.3"/>
                                ${[{x:20,y:62},{x:35,y:52},{x:45,y:40},{x:58,y:35},{x:70,y:25},{x:82,y:18}].map(p => html`<circle cx=${p.x} cy=${p.y} r="2" fill="#ef4444" />`)}
                            </svg>
                        </div>
                        <h4 class="font-black text-2xl text-red-700 mb-2">正の相関</h4>
                        <p class="text-sm text-gray-700 font-bold mb-4">「右上がり」の並び</p>
                        <p class="text-sm text-gray-500 leading-relaxed">
                            一方が増えると、もう一方も<span class="text-red-600 font-bold">増える</span>傾向です。<br/>
                            （例：勉強時間と成績）
                        </p>
                    </div>
                    <!-- Negative -->
                    <div class="bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col items-center text-center shadow-sm">
                        <div class="h-32 w-full flex items-center justify-center mb-4">
                            <svg viewBox="0 0 100 80" class="w-3/4 overflow-visible">
                                <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
                                <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
                                <path d="M15 15 L 85 65" stroke="#10b981" stroke-width="1" stroke-dasharray="2" opacity="0.3"/>
                                ${[{x:20,y:18},{x:35,y:25},{x:45,y:40},{x:58,y:45},{x:70,y:55},{x:82,y:62}].map(p => html`<circle cx=${p.x} cy=${p.y} r="2" fill="#10b981" />`)}
                            </svg>
                        </div>
                        <h4 class="font-black text-2xl text-green-700 mb-2">負の相関</h4>
                        <p class="text-sm text-gray-700 font-bold mb-4">「右下がり」の並び</p>
                        <p class="text-sm text-gray-500 leading-relaxed">
                            一方が増えると、もう一方は<span class="text-green-600 font-bold">減る</span>傾向です。<br/>
                            （例：スマホ使用時間と成績）
                        </p>
                    </div>
                    <!-- None -->
                    <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center text-center shadow-sm">
                        <div class="h-32 w-full flex items-center justify-center mb-4">
                            <svg viewBox="0 0 100 80" class="w-3/4 overflow-visible">
                                <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
                                <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
                                ${[{x:25,y:20},{x:40,y:60},{x:55,y:30},{x:70,y:55},{x:30,y:45},{x:75,y:25}].map(p => html`<circle cx=${p.x} cy=${p.y} r="2" fill="#666" />`)}
                            </svg>
                        </div>
                        <h4 class="font-black text-2xl text-gray-700 mb-2">相関なし</h4>
                        <p class="text-sm text-gray-700 font-bold mb-4">「バラバラ」な状態</p>
                        <p class="text-sm text-gray-500 leading-relaxed">
                            一方が増えても、もう一方は<span class="text-gray-600 font-bold">関係なく</span>増減します。<br/>
                            （例：身長と成績）
                        </p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ3：相関係数（r）について",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-fade-in-up py-8 max-w-4xl mx-auto">
                    <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 w-full">
                        <h3 class="text-2xl font-black text-indigo-800 mb-4 text-center">相関の「強さ」を数値化する</h3>
                        <p class="text-gray-700 text-lg leading-relaxed mb-6">
                            散布図の「点の集まり具合」を数字にしたものを<span class="font-bold text-indigo-600">相関係数（r）</span>と呼びます。<br/>
                            この数字は必ず<span class="bg-white px-2 rounded shadow-sm font-mono">-1.0 から 1.0</span> の間に収まります。
                        </p>
                        
                        <div class="relative py-4">
                            <div class="h-6 w-full rounded-full bg-gradient-to-r from-green-400 via-gray-200 to-red-400 shadow-inner"></div>
                            <div class="flex justify-between text-xs font-bold text-gray-500 mt-2 px-1">
                                <div class="text-center w-1/5">強い負の相関<br/>(-1.0)</div>
                                <div class="text-center w-1/5">負の相関</div>
                                <div class="text-center w-1/5">相関なし<br/>(0.0)</div>
                                <div class="text-center w-1/5">正の相関</div>
                                <div class="text-center w-1/5">強い正の相関<br/>(1.0)</div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div class="p-4 bg-white border rounded-xl shadow-sm">
                            <h4 class="font-bold text-red-600 mb-2">1.0 に近いとき</h4>
                            <p class="text-sm text-gray-600">点が「きれいな右上がりの直線」に近づくほど、1.0に近づきます。</p>
                        </div>
                        <div class="p-4 bg-white border rounded-xl shadow-sm">
                            <h4 class="font-bold text-green-600 mb-2"> -1.0 に近いとき</h4>
                            <p class="text-sm text-gray-600">点が「きれいな右下がりの直線」に近づくほど、-1.0に近づきます。</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ4：要注意！「疑似相関（ぎじそうかん）」",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-10 animate-fade-in-up py-8 max-w-5xl mx-auto">
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl shadow-sm w-full">
                        <h3 class="text-2xl font-black text-yellow-800 mb-2 flex items-center">
                            ⚠️ 「相関がある」ことと「原因である」ことは違う！
                        </h3>
                        <p class="text-lg text-gray-700 leading-relaxed">
                            データ分析で最も間違えやすいのが、<span class="font-bold text-red-600">相関と因果（いんが）を混同すること</span>です。<br/>
                            これを理解するために、「アイスの売上と水難事故」の例を見てみましょう。
                        </p>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                        <!-- Left: Wrong interpretation -->
                        <div class="bg-white p-6 rounded-2xl shadow-md border border-red-50 flex flex-col items-center">
                            <span class="text-xs font-bold text-red-500 mb-6 tracking-widest uppercase">間違った解釈</span>
                            <div class="flex items-center gap-6 mb-6">
                                <div class="text-center"><div class="text-5xl mb-2">🍦</div><div class="text-xs font-bold">アイス売上増</div></div>
                                <div class="text-3xl text-red-500 font-black animate-pulse">➡</div>
                                <div class="text-center"><div class="text-5xl mb-2">🏊</div><div class="text-xs font-bold">水難事故増</div></div>
                            </div>
                            <p class="text-sm text-gray-600 text-center leading-relaxed">
                                「アイスを食べる人が増えたことが原因で、事故が増えたんだ！」<br/>
                                <span class="text-red-500 font-bold">➡ そんなわけないですよね？</span>
                            </p>
                        </div>

                        <!-- Right: Truth -->
                        <div class="bg-white p-6 rounded-2xl shadow-md border-2 border-indigo-50 flex flex-col items-center relative w-full">
                            <span class="text-xs font-bold text-indigo-500 mb-4 tracking-widest uppercase">本当の理由</span>
                            <div class="relative w-full h-40 mb-2">
                                <!-- Common Cause -->
                                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 text-center z-10">
                                    <div class="text-5xl animate-bounce-slow">☀️</div>
                                    <div class="text-xs font-bold bg-yellow-100 px-3 py-1 rounded-full">気温が高い</div>
                                </div>
                                <!-- Arrows -->
                                <svg class="absolute inset-0 w-full h-full text-indigo-300" viewBox="0 0 400 160" preserveAspectRatio="none" overflow="visible">
                                    <defs>
                                        <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                            <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
                                        </marker>
                                    </defs>
                                    <!-- Source (Temp): around (200, 60) -> Target Left (Ice): around (80, 110) -->
                                    <path d="M180 60 L 100 110" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arrow-blue)" stroke-dasharray="4"/>
                                    <!-- Source (Temp): around (200, 60) -> Target Right (Swim): around (320, 110) -->
                                    <path d="M220 60 L 300 110" fill="none" stroke="currentColor" stroke-width="2" marker-end="url(#arrow-blue)" stroke-dasharray="4"/>
                                </svg>
                                <!-- Effects -->
                                <div class="absolute bottom-0 left-8 text-center z-10">
                                    <div class="text-4xl">🍦</div>
                                    <div class="text-[10px] font-bold">アイス売上増</div>
                                </div>
                                <div class="absolute bottom-0 right-8 text-center z-10">
                                    <div class="text-4xl">🏊</div>
                                    <div class="text-[10px] font-bold">プール利用増</div>
                                </div>
                            </div>
                            <p class="text-sm text-gray-700 text-center leading-relaxed mt-4">
                                「暑い」という共通の原因によって、どちらも増えただけです。<br/>
                                これを<span class="text-indigo-600 font-bold text-lg">疑似相関（ぎじそうかん）</span>といいます。
                            </p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: "ミッション開始！",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-12 animate-fade-in-up py-10">
                    <div class="text-[10rem] animate-bounce-slow drop-shadow-md">🔎</div>
                    <div class="space-y-4">
                        <h2 class="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">データ探偵の出番です！</h2>
                        <p class="text-xl text-gray-500 font-medium">
                            解説で学んだことを活かして、<br/>
                            散布図から正しい関係を見つけ出しましょう！
                        </p>
                    </div>
                    <button onClick=${onFinish} class="px-12 py-6 bg-indigo-600 text-white text-2xl font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
                        ドリルを開始する 🚀
                    </button>
                </div>
            `
        }
    ];

    const current = pages[step];

    return html`
        <div class="flex-1 flex flex-col min-h-0 p-4 md:p-8 xl:max-w-6xl mx-auto w-full">
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden">
                <div class="bg-indigo-600 text-white px-8 py-5 flex justify-between items-center shrink-0">
                    <h2 class="text-2xl md:text-3xl font-bold flex items-center">
                        <span class="bg-white text-indigo-600 rounded-lg px-3 py-1 mr-4 text-xl font-black">${step + 1}</span>
                        ${current.title}
                    </h2>
                    <div class="text-lg font-bold opacity-70">${step + 1} / ${pages.length}</div>
                </div>
                <div class="flex-1 p-6 md:p-10 overflow-y-auto bg-gray-50/50">
                    ${current.content}
                </div>
                <div class="bg-white border-t border-gray-100 p-6 flex justify-between items-center shrink-0 px-8">
                    <button onClick=${() => setStep(Math.max(0, step - 1))} disabled=${step === 0}
                        class="px-6 py-2 rounded-lg font-bold text-lg text-gray-400 hover:text-gray-800 disabled:opacity-0 transition-all">
                        ← 戻る
                    </button>
                    <div class="flex space-x-2">
                        ${pages.map((_, i) => html`<div class="w-3 h-3 rounded-full transition-all ${i === step ? 'bg-indigo-600' : 'bg-gray-200'}"></div>`)}
                    </div>
                    <button onClick=${() => setStep(Math.min(pages.length - 1, step + 1))} disabled=${step === pages.length - 1}
                        class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-md disabled:opacity-0 transition-all">
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
    const initialPos = isMobile ? { x: 16, y: window.innerHeight - 250 } : { x: window.innerWidth - 380, y: 80 };
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    const [isMinimized, setIsMinimized] = useState(false);
    
    useEffect(() => {
        setIsMinimized(false);
    }, [quest.id, feedback, hasCleared]);

    if (hasCleared) return null;

    const isCorrect = feedback === 'correct';
    let feedbackContent = null;
    let icon = "🧐";
    let statusClass = "bg-gray-100 border-l-4 border-gray-400";
    
    if (isCorrect) {
        icon = "🎉";
        statusClass = "bg-green-50 border-l-4 border-green-500";
        feedbackContent = html`
            <div class="space-y-3">
                <div class="font-bold text-green-700 text-lg">正解です！</div>
                <div class="bg-white p-3 rounded border border-green-200 text-sm text-gray-700 leading-relaxed shadow-sm">
                    <div class="font-bold text-green-800 mb-1 flex items-center"><span class="mr-1">💡</span>探偵メモ</div>
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

        statusClass = `bg-${color}-50 border-l-4 border-${color}-400`;
        feedbackContent = html`
            <div class="space-y-2">
                <div class="text-${color}-800 font-bold flex items-start">
                    <span class="mr-2 text-xl">⚠</span>
                    <span class="text-sm mt-0.5">${message}</span>
                </div>
                <button onClick=${onSubmit} class="w-full py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 transition-colors">
                    再調査する
                </button>
            </div>
        `;
    } else {
        feedbackContent = html`
            <button onClick=${onSubmit} class="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded shadow-md hover:from-orange-600 hover:to-red-600 transition-transform active:scale-95 flex items-center justify-center">
                <span>調査報告をする</span>
            </button>
        `;
    }

    return html`
        <div class="fixed z-[90] bg-white shadow-xl rounded-xl overflow-hidden border-2 transition-all duration-300
                   ${isCorrect ? 'border-green-400 ring-4 ring-green-100' : 'border-indigo-100'}"
            style=${{ top: position.y, left: position.x, width: isMinimized ? '200px' : (isMobile ? 'calc(100vw - 32px)' : '350px'), maxHeight: '80vh', touchAction: 'none' }}>
            <div class="px-4 py-2 bg-gray-900 text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none touch-none"
                onPointerDown=${onPointerDown} onPointerMove=${onPointerMove} onPointerUp=${onPointerUp}>
                <div class="flex items-center space-x-2">
                    <span class="text-xl">${icon}</span>
                    <span class="font-bold text-xs uppercase tracking-widest">Mission ${index + 1} / ${total}</span>
                </div>
                <button onClick=${() => setIsMinimized(!isMinimized)} class="p-1 hover:bg-white/20 rounded">
                    ${isMinimized ? '□' : '－'}
                </button>
            </div>
            ${!isMinimized && html`
                <div class="p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
                    <div class="text-gray-800 font-bold text-base leading-snug">${quest.text}</div>
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
const ExtraMissionWindow = ({ correlation, activeCount, stage, totalStages, targetR, onNext, onComplete }) => {
    const isMobile = window.innerWidth < 768;
    const initialPos = isMobile ? { x: 16, y: window.innerHeight - 300 } : { x: window.innerWidth - 380, y: 80 };
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const isSuccess = correlation >= targetR;
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
                    ${isSuccess ? html`
                         <div class="text-center space-y-3">
                            <div class="text-5xl animate-bounce-slow">✨</div>
                            <h3 class="text-xl font-bold text-green-600">修正完了！</h3>
                            <div class="p-3 bg-green-50 rounded-xl border border-green-200 text-center font-mono text-2xl text-green-800 font-black">
                                r = ${correlation.toFixed(3)}
                            </div>
                            <p class="text-xs text-gray-500 font-bold">目標の ${targetR.toFixed(2)} をクリアしました</p>
                            ${isFinalStage ? html`
                                <button onClick=${onComplete} class="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all text-lg">
                                    探偵マスター！トップへ 🎓
                                </button>
                            ` : html`
                                <button onClick=${onNext} class="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all text-lg">
                                    次の事件へ ➡
                                </button>
                            `}
                        </div>
                    ` : html`
                        <div class="space-y-3">
                            <h3 class="font-bold text-red-700 text-lg border-b border-red-50 pb-1">⚠ データ異常発生！</h3>
                            <p class="text-sm text-gray-800 font-bold">
                                傾向から外れた<strong class="text-red-600">「点」をクリックして除外</strong>し、正しい相関を取り戻せ！
                            </p>
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
            <${ComposedChart} margin=${{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <${CartesianGrid} strokeDasharray="3 3" stroke="#eee" />
                <${XAxis} type="number" dataKey=${xConfig.key} name=${xConfig.label} domain=${domain.x}
                    label=${{ value: xConfig.label, position: 'bottom', offset: 0, fill: '#3b82f6', fontSize: 12 }} />
                <${YAxis} type="number" dataKey=${yConfig.key} name=${yConfig.label} domain=${domain.y}
                    label=${{ value: yConfig.label, angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 12 }} />
                <${Tooltip} cursor=${{ strokeDasharray: '3 3' }}
                    content=${({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            if (!d.id) return null;
                            const isExcluded = excludedIds.includes(d.id);
                            return html`
                                <div class="bg-white border border-gray-200 p-2 rounded shadow text-xs">
                                    <div class="font-bold mb-1 flex justify-between gap-4">
                                        <span>ID: ${d.id}</span>
                                        <span class="${isExcluded ? 'text-red-500' : 'text-green-600'}">
                                            ${isExcluded ? '除外中' : '使用中'}
                                        </span>
                                    </div>
                                    <p class="text-blue-600">${xConfig.label}: ${d[xConfig.key]}</p>
                                    <p class="text-green-600">${yConfig.label}: ${d[yConfig.key]}</p>
                                </div>
                            `;
                        }
                        return null;
                    }} />
                <${Scatter} name="Data" data=${data} onClick=${(d) => onTogglePoint(d.id)} cursor="pointer">
                    ${data.map((entry, index) => html`<${Cell} key=${`cell-${index}`} fill=${excludedIds.includes(entry.id) ? '#eee' : '#6366f1'} 
                        stroke=${excludedIds.includes(entry.id) ? '#ccc' : 'none'} />`)}
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
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Correlation</h3>
            <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                <div class="flex justify-between items-baseline mb-2">
                    <span class="text-gray-500 font-bold text-sm">相関係数 (r)</span>
                    <span class="text-2xl font-black text-blue-700">${correlation.toFixed(3)}</span>
                </div>
                <${CorrelationMeter} r=${correlation} />
                <div class="mt-4 text-center">
                    <span class="block w-full px-3 py-2 text-lg md:text-xl font-black rounded-lg shadow-sm 
                        ${strength.includes('かなり強い') ? 'bg-purple-100 text-purple-800' : 
                          strength.includes('正の') ? 'bg-red-100 text-red-800' :
                          strength.includes('負の') ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}">
                        ${strength}
                    </span>
                    <div class="text-right text-[10px] text-gray-400 mt-1">n=${activeCount}/${totalCount}</div>
                </div>
            </div>
        </div>
        <div>
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Regression</h3>
            <div class="bg-green-50/50 p-4 rounded-xl border border-green-50">
                <div class="text-gray-500 font-bold text-sm mb-2">回帰式</div>
                <div class="text-sm font-mono font-bold text-center bg-white py-3 rounded-lg border border-green-100 text-green-800 shadow-inner">
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
            <div class="relative h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-gray-200 to-red-400 shadow-inner overflow-hidden">
                <div class="absolute top-0 bottom-0 w-1 bg-black border border-white shadow transition-all duration-700 ease-out" style=${{ left: `${percentage}%`, transform: 'translateX(-50%)' }}></div>
            </div>
            <div class="flex justify-between text-[8px] font-bold text-gray-400 mt-1">
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
        const isTargetX = xKey === quest.targetKey;
        const isTargetY = yKey === quest.targetKey;
        const selectedPair = isTargetX ? yKey : (isTargetY ? xKey : null);
        if (selectedPair && quest.validAnswers.includes(selectedPair)) { setDrillFeedback('correct'); }
        else { setDrillFeedback('incorrect'); }
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
    const loadExtraMissionLevel = (levelIndex) => { const config = EXTRA_MISSION_STAGES[levelIndex]; setDatasetId(config.datasetId); setXKey(config.xKey); setYKey(config.yKey); setExcludedIds([]); };
    const startExtraMission = () => { setShowClearModal(false); setMode('extra'); setExtraMissionLevel(0); loadExtraMissionLevel(0); };
    const nextExtraMission = () => { if (extraMissionLevel < EXTRA_MISSION_STAGES.length - 1) { const nextLevel = extraMissionLevel + 1; setExtraMissionLevel(nextLevel); loadExtraMissionLevel(nextLevel); } };
    const finishExtraMission = () => { setMode('explanation'); setDatasetId(DATASETS[0].id); setExcludedIds([]); };

    return html`
        <div class="h-full flex flex-col font-sans bg-gray-50 transition-all duration-500 overflow-hidden">
            <header class="bg-white px-6 py-4 flex flex-col lg:flex-row justify-between items-center shadow-md z-10 gap-4 border-b">
                <div class="flex items-center space-x-4">
                    <div class="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div><h1 class="text-xl font-black text-gray-900 tracking-tight">Data Detective Challenge</h1></div>
                </div>
                <div class="flex bg-gray-100 p-1 rounded-lg gap-1">
                    <button class="px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === 'explanation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}" onClick=${() => setMode('explanation')}>📚 解説</button>
                    <button class="px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === 'drill' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}" onClick=${() => setMode('drill')}>🔎 ドリル</button>
                    <button class="px-6 py-2 rounded-md text-sm font-bold transition-all ${mode === 'exploration' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}" onClick=${() => setMode('exploration')}>📊 自由研究</button>
                </div>
            </header>

            ${mode === 'explanation' ? html`<${TutorialMode} onFinish=${() => setMode('drill')} />` : html`
                <main class="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 md:p-6 gap-4 md:gap-6 w-full relative">
                    <aside class="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
                        <${Card} title="データソース設定">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Data Source</label>
                                    <select class="block w-full border border-gray-200 rounded-lg p-2 bg-white text-sm font-bold" value=${datasetId} onChange=${e => setDatasetId(e.target.value)} disabled=${mode === 'extra'}>
                                        ${availableDatasets.map(d => html`<option key=${d.id} value=${d.id}>${d.name}</option>`)}
                                    </select>
                                    <p class="mt-2 text-xs text-gray-500 font-medium leading-relaxed">${dataset.description}</p>
                                </div>
                                <button onClick=${() => setShowDataWindow(true)} class="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">データ一覧を表示</button>
                            </div>
                        </${Card}>
                        
                        <${Card} title="分析項目の選択" className=${`flex-1 transition-all duration-300 ${mode === 'drill' ? 'ring-4 ring-orange-300 shadow-orange-100 relative overflow-visible' : ''}`}>
                            ${mode === 'drill' && html`
                                <div class="absolute -top-4 right-4 bg-orange-500 text-white font-bold text-sm px-4 py-1 rounded-full animate-bounce shadow-lg z-20 pointer-events-none">
                                    👇 ここを切り替えて調査！
                                </div>
                            `}
                            <div class="space-y-4">
                                <div class="p-4 bg-blue-50/50 rounded-xl border border-blue-50 ${mode === 'extra' ? 'opacity-50' : ''}">
                                    <label class="block text-[10px] font-black text-blue-800 mb-2 uppercase">X軸（横軸）</label>
                                    <select class="w-full border border-blue-100 rounded-lg p-2 bg-white text-sm font-bold" value=${xKey} onChange=${e => setXKey(e.target.value)} disabled=${mode === 'extra'}>
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                </div>
                                <div class="flex justify-center"><button onClick=${handleSwapAxes} class="p-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all" disabled=${mode === 'extra'}>🔄 軸入替</button></div>
                                <div class="p-4 bg-green-50/50 rounded-xl border border-green-50 ${mode === 'extra' ? 'opacity-50' : ''}">
                                    <label class="block text-[10px] font-black text-green-800 mb-2 uppercase">Y軸（縦軸）</label>
                                    <select class="w-full border border-green-100 rounded-lg p-2 bg-white text-sm font-bold" value=${yKey} onChange=${e => setYKey(e.target.value)} disabled=${mode === 'extra'}>
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                </div>
                            </div>
                        </${Card}>
                    </aside>
                    <section class="flex-1 flex flex-col min-w-0">
                        <${Card} className="h-full shadow-md border-gray-200">
                            <div class="h-full flex flex-col">
                                <div class="flex justify-between items-center mb-4 px-2">
                                    <h2 class="text-lg font-black text-gray-800"><span class="text-blue-500">${xColumn.label}</span> と <span class="text-green-500">${yColumn.label}</span> の散布図</h2>
                                    <div class="flex gap-4 text-[10px] font-black text-gray-400 uppercase">
                                        <div class="flex items-center gap-1"><div class="w-2 h-2 bg-indigo-500 rounded"></div> データ点</div>
                                        <div class="flex items-center gap-1"><div class="w-2 h-2 bg-orange-500 rounded-full"></div> 回帰直線</div>
                                    </div>
                                </div>
                                <div class="flex-1"><${ScatterVis} data=${dataset.data} xConfig=${xColumn} yConfig=${yColumn} regression=${stats.regression} excludedIds=${excludedIds} onTogglePoint=${togglePoint} /></div>
                            </div>
                        </${Card}>
                    </section>
                    <aside class="w-full lg:w-80 flex-shrink-0">
                        <${Card} title="分析結果統計" className="h-full">
                            <${AnalysisPanel} xLabel=${xColumn.label} yLabel=${yColumn.label} correlation=${stats.correlation} regression=${stats.regression} strength=${stats.strength} activeCount=${stats.activeCount} totalCount=${dataset.data.length} />
                        </${Card}>
                    </aside>
                    
                    <!-- Drill Window Layer inside Main for correct context -->
                    ${mode === 'drill' && !showClearModal && html`<${DrillQuestWindow} quest=${DRILL_QUESTS[currentQuestIndex]} index=${currentQuestIndex} total=${DRILL_QUESTS.length} feedback=${drillFeedback} onSubmit=${handleDrillSubmit} onNext=${nextQuest} hasCleared=${hasCleared} onRestart=${restartDrill} />`}
                    ${mode === 'extra' && html`<${ExtraMissionWindow} correlation=${stats.correlation} activeCount=${stats.activeCount} stage=${extraMissionLevel} totalStages=${EXTRA_MISSION_STAGES.length} targetR=${EXTRA_MISSION_STAGES[extraMissionLevel].targetR} onNext=${nextExtraMission} onComplete=${finishExtraMission} />`}
                </main>
            `}

            ${showDataWindow && html`<${FloatingDataWindow} data=${dataset.data} columns=${dataset.columns} excludedIds=${excludedIds} onTogglePoint=${togglePoint} onClose=${() => setShowDataWindow(false)} />`}
            ${showClearModal && html`<${DrillClearModal} onRestart=${restartDrill} onExploration=${() => {setShowClearModal(false); setMode('exploration');}} onExtraMission=${startExtraMission} />`}
        </div>
    `;
};

const DrillClearModal = ({ onRestart, onExploration, onExtraMission }) => html`
    <div class="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden">
            <div class="text-7xl mb-4 animate-bounce-slow">🎊</div>
            <h2 class="text-3xl font-black text-indigo-600 mb-2">CONGRATULATIONS!</h2>
            <p class="text-gray-700 mb-6 font-bold">全ミッション達成おめでとう！<br/>君は立派なデータマスターだ！</p>
            <div class="space-y-3">
                <button onClick=${onExtraMission} class="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-xl hover:scale-105 transition-all animate-pulse">
                    🛠️ エクストラミッション：データ修正
                </button>
                <button onClick=${onExploration} class="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                    📊 自由研究モードへ
                </button>
                <button onClick=${onRestart} class="w-full py-3 text-gray-400 font-bold hover:text-gray-600">最初からやり直す</button>
            </div>
        </div>
    </div>
`;

const FloatingDataWindow = ({ data, columns, excludedIds, onTogglePoint, onClose }) => {
    const isMobile = window.innerWidth < 768;
    const initialPos = isMobile ? { x: 10, y: 100 } : { x: 20, y: 150 };
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    return html`
        <div class="fixed bg-white shadow-2xl rounded-lg border border-gray-200 z-[100] flex flex-col overflow-hidden"
            style=${{ top: position.y, left: position.x, width: isMobile ? '90vw' : '500px', height: '400px', touchAction: 'none' }}>
            <div class="bg-gray-800 text-white px-3 py-2 cursor-grab active:cursor-grabbing flex justify-between items-center"
                onPointerDown=${onPointerDown} onPointerMove=${onPointerMove} onPointerUp=${onPointerUp}>
                <span class="text-xs font-bold">データ一覧 (n=${data.length})</span>
                <button onClick=${onClose} class="hover:text-red-400 font-bold">×</button>
            </div>
            <div class="flex-1 overflow-auto">
                <table class="w-full text-[10px] text-left">
                    <thead class="bg-gray-50 sticky top-0">
                        <tr>
                            <th class="p-2 border-b">使用</th>
                            <th class="p-2 border-b">ID</th>
                            ${columns.map(c => html`<th class="p-2 border-b">${c.label}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => html`
                            <tr class="border-b ${excludedIds.includes(row.id) ? 'bg-gray-100 text-gray-400' : ''}">
                                <td class="p-2 text-center"><input type="checkbox" checked=${!excludedIds.includes(row.id)} onChange=${() => onTogglePoint(row.id)} /></td>
                                <td class="p-2">${row.id}</td>
                                ${columns.map(c => html`<td class="p-2">${row[c.key]}</td>`)}
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
