
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

// --- Custom Hooks ---

/**
 * ドラッグ操作のためのカスタムフック (Pointer Events API使用)
 * setPointerCaptureを使用することで、高速なドラッグや画面外への移動でも追従可能にします。
 */
const useDraggableWindow = (initialX, initialY) => {
    // 画面サイズに応じて初期位置を調整（画面外に出ないように）
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
        // ボタンや入力フォームでの操作はドラッグとみなさない
        if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'INPUT') return;
        
        e.preventDefault(); // タッチ操作でのスクロール等を防ぐ
        
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        
        // Pointer Captureを設定して、ポインタが要素外に出てもイベントを補足
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y
        });
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

/**
 * 汎用カードコンポーネント
 */
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
 * 散布図の作り方から相関の見方までをステップバイステップで解説
 */
const TutorialMode = ({ onFinish }) => {
    const [step, setStep] = useState(0);

    // Step 1用のデモデータ
    const demoData = [
        { id: 1, temp: 25, sales: 150 },
        { id: 2, temp: 30, sales: 280 },
        { id: 3, temp: 35, sales: 400 },
    ];
    const [plotStep, setPlotStep] = useState(0); // 0:None, 1:Row1, 2:Row2...

    // ページの定義
    const pages = [
        {
            title: "はじめに：散布図（さんぷず）ってなに？",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-full text-center space-y-6 animate-fade-in-up py-4">
                    <div class="text-6xl">📊</div>
                    <p class="text-xl text-gray-700 leading-relaxed max-w-2xl">
                        「気温が上がると、アイスが売れる」<br/>
                        「勉強時間を増やすと、テストの点数が上がる」<br/><br/>
                        こんな風に、<strong>「2つのデータに関係があるかな？」</strong>を調べるためのグラフが<br/>
                        <span class="text-indigo-600 font-bold text-2xl">散布図（さんぷず）</span>です。
                    </p>
                </div>
            `
        },
        {
            title: "ステップ1：表からグラフを作ってみよう",
            content: html`
                <div class="flex flex-col lg:flex-row gap-8 min-h-full items-center justify-center animate-fade-in-up py-4">
                    <!-- Table -->
                    <div class="w-full lg:w-1/3 bg-white p-4 rounded-lg shadow border border-gray-200">
                        <h4 class="font-bold text-center mb-2 text-gray-600">あるお店のアイス売上</h4>
                        <table class="w-full text-sm">
                            <thead class="bg-gray-100">
                                <tr><th>気温(℃)</th><th>売上(個)</th></tr>
                            </thead>
                            <tbody>
                                ${demoData.map((d, i) => html`
                                    <tr class="border-b transition-colors duration-300 ${plotStep > i ? 'bg-indigo-100' : ''}">
                                        <td class="p-2 text-center font-mono ${plotStep > i ? 'text-indigo-700 font-bold' : ''}">${d.temp}℃</td>
                                        <td class="p-2 text-center font-mono ${plotStep > i ? 'text-green-700 font-bold' : ''}">${d.sales}個</td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                        <div class="mt-4 text-center">
                            <button 
                                onClick=${() => setPlotStep(prev => Math.min(prev + 1, 3))}
                                disabled=${plotStep >= 3}
                                class="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 disabled:bg-gray-300 transition-all shadow-md active:scale-95"
                            >
                                ${plotStep >= 3 ? 'プロット完了！' : '1つずつ点を打つ ➡'}
                            </button>
                            <button 
                                onClick=${() => setPlotStep(0)}
                                class="ml-2 px-3 py-2 text-gray-500 hover:text-gray-700 text-sm underline"
                            >
                                リセット
                            </button>
                        </div>
                    </div>

                    <!-- Graph Area (Custom SVG for clearer animation) -->
                    <div class="w-full lg:w-1/2 aspect-video bg-white rounded-lg shadow border border-gray-200 relative p-6">
                        <svg viewBox="0 0 400 300" class="w-full h-full overflow-visible">
                            <!-- Axes -->
                            <line x1="50" y1="250" x2="380" y2="250" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
                            <line x1="50" y1="250" x2="50" y2="20" stroke="#333" stroke-width="2" marker-end="url(#arrow)" />
                            <text x="380" y="270" text-anchor="end" font-size="12" fill="#3b82f6" font-weight="bold">気温 (X)</text>
                            <text x="40" y="20" text-anchor="end" font-size="12" fill="#10b981" font-weight="bold" writing-mode="tb">売上 (Y)</text>

                            <!-- Points & Guides -->
                            ${demoData.map((d, i) => {
                                // Simple mapping for demo: Temp 20-40 -> x, Sales 0-500 -> y
                                const x = 50 + ((d.temp - 20) / 20) * 300;
                                const y = 250 - (d.sales / 500) * 230;
                                const isVisible = plotStep > i;
                                
                                return html`
                                    <g class="transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}">
                                        <!-- Guide Lines -->
                                        <line x1="${x}" y1="250" x2="${x}" y2="${y}" stroke="#3b82f6" stroke-dasharray="4" stroke-opacity="0.5" />
                                        <line x1="50" y1="${y}" x2="${x}" y2="${y}" stroke="#10b981" stroke-dasharray="4" stroke-opacity="0.5" />
                                        <!-- Point -->
                                        <circle cx="${x}" cy="${y}" r="6" fill="#6366f1" stroke="white" stroke-width="2" />
                                        <!-- Values -->
                                        <text x="${x}" y="265" text-anchor="middle" font-size="10" fill="#3b82f6">${d.temp}</text>
                                        <text x="35" y="${y+4}" text-anchor="end" font-size="10" fill="#10b981">${d.sales}</text>
                                    </g>
                                `;
                            })}
                        </svg>
                    </div>
                </div>
                <p class="text-center mt-4 text-gray-600">
                    表の「横（X）」と「縦（Y）」の数値がぶつかる場所に、点を打っていきます。<br/>
                    これを繰り返すと、データの「形」が見えてきます。
                </p>
            `
        },
        {
            title: "ステップ2：形から関係を読み解く",
            content: html`
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-full items-center animate-fade-in-up py-4">
                    <div class="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center text-center h-full">
                        <div class="h-32 w-full flex items-center justify-center mb-2">
                            <svg viewBox="0 0 100 80" class="w-3/4 overflow-visible">
                                <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
                                <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
                                <line x1="15" y1="65" x2="85" y2="15" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="20" cy="60" r="2" fill="#ef4444" />
                                <circle cx="35" cy="50" r="2" fill="#ef4444" />
                                <circle cx="50" cy="40" r="2" fill="#ef4444" />
                                <circle cx="65" cy="30" r="2" fill="#ef4444" />
                                <circle cx="80" cy="20" r="2" fill="#ef4444" />
                            </svg>
                        </div>
                        <h4 class="font-bold text-red-700 text-lg mb-2">正の相関</h4>
                        <p class="text-sm text-gray-600">右上がり↗</p>
                        <p class="text-xs text-gray-500 mt-2">「片方が増えると、もう片方も増える」関係。</p>
                        <p class="text-xs font-bold text-red-600 mt-1">例：勉強時間と成績</p>
                    </div>

                    <div class="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center text-center h-full">
                        <div class="h-32 w-full flex items-center justify-center mb-2">
                            <svg viewBox="0 0 100 80" class="w-3/4 overflow-visible">
                                <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
                                <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
                                <line x1="15" y1="15" x2="85" y2="65" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="20" cy="20" r="2" fill="#10b981" />
                                <circle cx="35" cy="30" r="2" fill="#10b981" />
                                <circle cx="50" cy="40" r="2" fill="#10b981" />
                                <circle cx="65" cy="50" r="2" fill="#10b981" />
                                <circle cx="80" cy="60" r="2" fill="#10b981" />
                            </svg>
                        </div>
                        <h4 class="font-bold text-green-700 text-lg mb-2">負の相関</h4>
                        <p class="text-sm text-gray-600">右下がり↘</p>
                        <p class="text-xs text-gray-500 mt-2">「片方が増えると、もう片方は減る」関係。</p>
                        <p class="text-xs font-bold text-green-600 mt-1">例：スマホ時間と成績</p>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center text-center h-full">
                        <div class="h-32 w-full flex items-center justify-center mb-2">
                            <svg viewBox="0 0 100 80" class="w-3/4 overflow-visible">
                                <line x1="10" y1="70" x2="90" y2="70" stroke="#666" stroke-width="1"/>
                                <line x1="10" y1="70" x2="10" y2="10" stroke="#666" stroke-width="1"/>
                                <circle cx="20" cy="50" r="2" fill="#666" />
                                <circle cx="30" cy="20" r="2" fill="#666" />
                                <circle cx="50" cy="60" r="2" fill="#666" />
                                <circle cx="70" cy="30" r="2" fill="#666" />
                                <circle cx="80" cy="65" r="2" fill="#666" />
                                <circle cx="40" cy="40" r="2" fill="#666" />
                            </svg>
                        </div>
                        <h4 class="font-bold text-gray-700 text-lg mb-2">相関なし</h4>
                        <p class="text-sm text-gray-600">バラバラ∴</p>
                        <p class="text-xs text-gray-500 mt-2">関係なさそう。</p>
                        <p class="text-xs font-bold text-gray-600 mt-1">例：出席番号と成績</p>
                    </div>
                </div>
            `
        },
        {
            title: "ステップ3：相関の「強さ」と相関係数(r)",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-full space-y-8 animate-fade-in-up py-4">
                    <div class="w-full max-w-3xl">
                        <div class="flex justify-between text-sm text-gray-500 font-mono mb-2">
                            <span>-1.0 (完全な負)</span>
                            <span>0.0 (バラバラ)</span>
                            <span>+1.0 (完全な正)</span>
                        </div>
                        <div class="relative h-6 w-full rounded-full bg-gradient-to-r from-green-400 via-gray-200 to-red-400 shadow-inner">
                            <!-- Markers -->
                            <div class="absolute top-0 bottom-0 w-0.5 bg-white left-1/2"></div>
                            <div class="absolute top-0 bottom-0 w-0.5 bg-white left-[25%]"></div>
                            <div class="absolute top-0 bottom-0 w-0.5 bg-white left-[75%]"></div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-400 mt-1">
                            <span class="w-1/4 text-center">強い負</span>
                            <span class="w-1/4 text-center">弱い負</span>
                            <span class="w-1/4 text-center">弱い正</span>
                            <span class="w-1/4 text-center">強い正</span>
                        </div>
                    </div>

                    <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100 max-w-2xl text-center">
                        <h3 class="font-bold text-indigo-900 text-lg mb-3">相関係数（そうかんけいすう：r）</h3>
                        <p class="text-gray-700 mb-4">
                            散布図の「点のまとまり具合」を数字にしたもの。<br/>
                            <span class="font-bold bg-white px-2 py-1 rounded shadow-sm mx-1">1</span>に近いほど、一直線に並ぶ（強い正）。<br/>
                            <span class="font-bold bg-white px-2 py-1 rounded shadow-sm mx-1">-1</span>に近いほど、逆向きに一直線に並ぶ（強い負）。<br/>
                            <span class="font-bold bg-white px-2 py-1 rounded shadow-sm mx-1">0</span>に近いほど、関係がない。
                        </p>
                        <p class="text-sm text-indigo-600 font-bold">ドリルでは、この数字とグラフの形を見比べよう！</p>
                    </div>
                </div>
            `
        },
        {
            title: "準備完了！",
            content: html`
                <div class="flex flex-col items-center justify-center min-h-full text-center space-y-8 animate-fade-in-up py-4">
                    <div class="text-8xl animate-bounce-slow">🎓</div>
                    <h2 class="text-3xl font-bold text-gray-800">マスターしましたね！</h2>
                    <p class="text-lg text-gray-600">
                        データの見方はわかりましたか？<br/>
                        次は実際に「ドリルモード」でデータ探偵として事件を解決しましょう！
                    </p>
                    <button 
                        onClick=${onFinish}
                        class="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all"
                    >
                        🔎 ドリルモードへ挑戦！
                    </button>
                </div>
            `
        }
    ];

    const current = pages[step];

    return html`
        <div class="flex-1 flex flex-col min-h-0 p-2 md:p-8 max-w-5xl mx-auto w-full">
            <div class="bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-200 flex flex-col h-full overflow-hidden">
                <!-- Tutorial Header -->
                <div class="bg-indigo-600 text-white px-4 py-3 md:px-6 md:py-4 flex justify-between items-center shrink-0">
                    <h2 class="text-lg md:text-xl font-bold flex items-center">
                        <span class="bg-white text-indigo-600 rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm font-black">${step + 1}</span>
                        ${current.title}
                    </h2>
                    <div class="text-xs md:text-sm opacity-80 whitespace-nowrap ml-2">
                        ${step + 1} / ${pages.length}
                    </div>
                </div>

                <!-- Content Area -->
                <div class="flex-1 p-4 md:p-10 pb-20 overflow-y-auto bg-gray-50/50 relative overscroll-contain">
                    ${current.content}
                </div>

                <!-- Footer / Controls -->
                <div class="bg-white border-t border-gray-100 p-3 md:p-4 pb-8 md:pb-4 flex justify-between items-center shrink-0">
                    <button 
                        onClick=${() => setStep(Math.max(0, step - 1))}
                        disabled=${step === 0}
                        class="px-4 py-2 md:px-6 rounded-lg font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                    >
                        ← 前へ
                    </button>
                    
                    <div class="flex space-x-1 md:space-x-2">
                        ${pages.map((_, i) => html`
                            <div class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${i === step ? 'bg-indigo-600 w-3 md:w-4' : 'bg-gray-300'}"></div>
                        `)}
                    </div>

                    <button 
                        onClick=${() => setStep(Math.min(pages.length - 1, step + 1))}
                        disabled=${step === pages.length - 1}
                        class="px-4 py-2 md:px-6 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow disabled:opacity-0 disabled:pointer-events-none transition-all text-sm md:text-base"
                    >
                        次へ →
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * データ入力モーダル
 */
const DataInputModal = ({ onClose, onImport }) => {
    const [name, setName] = useState("");
    const [text, setText] = useState("身長,体重\n170,60\n165,55\n180,75\n155,48\n172,68");
    const [error, setError] = useState("");

    const handleSave = () => {
        setError("");
        if (!name.trim()) {
            setError("データセット名を入力してください。");
            return;
        }
        if (!text.trim()) {
            setError("データを入力してください。");
            return;
        }
        onImport(name, text);
    };

    return html`
        <div class="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in-up">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 class="text-lg font-bold text-gray-800">新しいデータを作る</h3>
                    <button onClick=${onClose} class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">×</button>
                </div>
                
                <div class="p-6 overflow-y-auto space-y-5">
                    ${error && html`
                        <div class="bg-red-50 text-red-600 px-4 py-2 rounded text-sm border border-red-100 flex items-center">
                            <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ${error}
                        </div>
                    `}
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">データセット名</label>
                        <input 
                            type="text" 
                            class="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                            placeholder="例: クラスの身長と体重"
                            value=${name}
                            onInput=${e => setName(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <div class="flex justify-between items-end mb-1">
                            <label class="block text-sm font-bold text-gray-700">データ (CSV形式)</label>
                            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ExcelからコピペOK</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-2">1行目に見出し、2行目以降に数値をカンマ(,)区切りで入力。</p>
                        <textarea 
                            class="w-full h-48 border border-gray-300 rounded-md p-2.5 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow leading-relaxed"
                            placeholder="身長,体重&#10;170,60&#10;165,55"
                            value=${text}
                            onInput=${e => setText(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                <div class="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
                    <button onClick=${onClose} class="px-4 py-2 text-gray-600 hover:bg-white hover:text-gray-800 border border-transparent hover:border-gray-200 rounded-md transition-all">キャンセル</button>
                    <button onClick=${handleSave} class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-medium transition-colors flex items-center">
                        <span class="mr-1">＋</span> 作成する
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * フローティングデータウィンドウ (ドラッグ可能・タッチ対応)
 */
const FloatingDataWindow = ({ data, columns, excludedIds, onTogglePoint, onClose }) => {
    // 初期位置をレスポンシブに調整
    const isMobile = window.innerWidth < 768;
    const initialPos = isMobile ? { x: 10, y: 100 } : { x: 20, y: 150 };
    
    // カスタムフックを使用
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    const [isMinimized, setIsMinimized] = useState(false);

    return html`
        <div 
            class="fixed bg-white shadow-2xl rounded-lg border border-gray-200 z-[80] flex flex-col overflow-hidden max-w-[95vw]"
            style=${{ 
                top: position.y, 
                left: position.x, 
                width: isMinimized ? '200px' : '550px',
                height: isMinimized ? 'auto' : '400px',
                touchAction: 'none' // ブラウザのスクロール等を無効化してドラッグを優先
            }}
        >
            <div 
                class="bg-gray-800 text-white px-3 py-2 cursor-grab active:cursor-grabbing flex justify-between items-center select-none touch-none"
                onPointerDown=${onPointerDown}
                onPointerMove=${onPointerMove}
                onPointerUp=${onPointerUp}
            >
                <span class="text-sm font-bold">データ選択・一覧 (n=${data.length})</span>
                <div class="flex gap-2">
                    <button onClick=${() => setIsMinimized(!isMinimized)} class="hover:text-gray-300" onPointerDown=${(e) => e.stopPropagation()}>
                        ${isMinimized ? '□' : '－'}
                    </button>
                    <button onClick=${onClose} class="hover:text-red-300" onPointerDown=${(e) => e.stopPropagation()}>×</button>
                </div>
            </div>
            ${!isMinimized && html`
                <div class="flex-1 overflow-auto p-0">
                    <table class="w-full text-sm text-left text-gray-600">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th class="px-4 py-2 border-b bg-gray-50 w-10 text-center">使用</th>
                                <th class="px-4 py-2 border-b bg-gray-50">ID</th>
                                ${columns.map(col => html`<th key=${col.key} class="px-4 py-2 border-b bg-gray-50 whitespace-nowrap">${col.label}</th>`)}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(row => {
                                const isExcluded = excludedIds.includes(row.id);
                                return html`
                                <tr key=${row.id} class="border-b hover:bg-gray-50 ${isExcluded ? 'bg-gray-100 text-gray-400' : 'bg-white'}">
                                    <td class="px-4 py-2 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked=${!isExcluded} 
                                            onChange=${() => onTogglePoint(row.id)}
                                            class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                        />
                                    </td>
                                    <td class="px-4 py-2 font-medium">${row.id}</td>
                                    ${columns.map(col => html`
                                        <td key=${col.key} class="px-4 py-2">${row[col.key]}</td>
                                    `)}
                                </tr>
                            `})}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
};

/**
 * ドリルクエストウィンドウ (ドラッグ可能・最小化可能・タッチ対応)
 * 常に最前面に表示し、問題文と解説を表示
 */
const DrillQuestWindow = ({ quest, index, total, feedback, onSubmit, onNext }) => {
    // 画面右上（スマホなら画面下部）に配置
    const isMobile = window.innerWidth < 768;
    const initialPos = isMobile ? { x: 16, y: window.innerHeight - 250 } : { x: window.innerWidth - 380, y: 80 };
    
    // カスタムフックを使用
    const { position, onPointerDown, onPointerMove, onPointerUp } = useDraggableWindow(initialPos.x, initialPos.y);
    const [isMinimized, setIsMinimized] = useState(false);
    
    // 状態が変化したら自動展開
    useEffect(() => {
        setIsMinimized(false);
    }, [quest.id, feedback]);

    const isCorrect = feedback === 'correct';
    
    // Determine Feedback Content
    let feedbackContent = null;
    let icon = "🧐";
    let statusClass = "bg-gray-100 border-l-4 border-gray-400";
    
    if (isCorrect) {
        icon = "🎉";
        statusClass = "bg-green-50 border-l-4 border-green-500";
        feedbackContent = html`
            <div class="space-y-3">
                <div class="font-bold text-green-700 text-lg">EXCELLENT!</div>
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
        // Error / Hint states
        let message = "";
        let color = "orange";
        
        if (feedback === 'incorrect') { message = `ヒント: ${quest.hint}`; color="orange"; }
        else if (feedback === 'incorrect_dataset') { message = "まずはデータソース設定で、対象のデータセットに切り替えよう！"; color="red"; }
        else if (feedback === 'same_variable') { message = "同じ項目同士だと相関が1.0になってしまうよ。別の項目を選ぼう。"; color="yellow"; }
        else if (feedback === 'spurious') { message = "相関はあるけど…ミッションの意図と合うかな？因果関係を考えてみよう！"; color="pink"; }
        else if (feedback === 'found_no_correlation') { message = "ん？ そのデータはバラバラで「相関がない」みたいだぞ。"; color="gray"; }

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
        // Initial State
        feedbackContent = html`
            <button onClick=${onSubmit} class="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded shadow-md hover:from-orange-600 hover:to-red-600 transition-transform active:scale-95 flex items-center justify-center">
                <span>調査報告をする</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
        `;
    }

    return html`
        <div 
            class="fixed z-[90] bg-white shadow-xl rounded-xl overflow-hidden border-2 transition-all duration-300
                   ${isCorrect ? 'border-green-400 ring-4 ring-green-100' : 'border-indigo-100'}"
            style=${{ 
                top: position.y, 
                left: position.x,
                width: isMinimized ? '200px' : (isMobile ? 'calc(100vw - 32px)' : '350px'),
                maxHeight: '80vh',
                touchAction: 'none'
            }}
        >
            <!-- Header (Drag Handle) -->
            <div 
                class="px-4 py-2 bg-gradient-to-r from-slate-800 to-indigo-900 text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none touch-none"
                onPointerDown=${onPointerDown}
                onPointerMove=${onPointerMove}
                onPointerUp=${onPointerUp}
            >
                <div class="flex items-center space-x-2">
                    <span class="text-xl">${icon}</span>
                    <span class="font-bold text-sm">MISSION ${index + 1}/${total}</span>
                </div>
                <button onClick=${() => setIsMinimized(!isMinimized)} class="p-1 hover:bg-white/20 rounded" onPointerDown=${(e) => e.stopPropagation()}>
                    ${isMinimized ? '□' : '－'}
                </button>
            </div>

            <!-- Body -->
            ${!isMinimized && html`
                <div class="p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
                    <!-- Question Text -->
                    <div class="text-gray-800 font-bold text-base leading-snug">
                        ${quest.text}
                    </div>
                    
                    <!-- Feedback Area -->
                    <div class="rounded-lg p-3 ${statusClass} transition-colors duration-300">
                        ${feedbackContent}
                    </div>
                </div>
            `}
        </div>
    `;
}

/**
 * 散布図コンポーネント
 */
const ScatterVis = ({ data, xConfig, yConfig, regression, excludedIds, onTogglePoint }) => {
    // グラフのドメイン（表示範囲）を全データに基づいて固定する（点を除外しても軸がブレないように）
    const domain = useMemo(() => {
        if (!data || data.length === 0) return { x: ['auto', 'auto'], y: ['auto', 'auto'] };
        const xValues = data.map(d => d[xConfig.key]);
        const yValues = data.map(d => d[yConfig.key]);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        
        // 少し余白を持たせる
        const padX = (maxX - minX) * 0.1 || 1; // prevent 0 range
        const padY = (maxY - minY) * 0.1 || 1;

        return {
            x: [Math.floor(minX - padX), Math.ceil(maxX + padX)],
            y: [Math.floor(minY - padY), Math.ceil(maxY + padY)]
        };
    }, [data, xConfig, yConfig]);

    // 回帰直線のデータポイント生成（除外データの影響を受けたregressionパラメータを使用）
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
            <${ComposedChart}
                margin=${{ top: 20, right: 30, bottom: 20, left: 20 }}
            >
                <${CartesianGrid} strokeDasharray="3 3" />
                <${XAxis} 
                    type="number" 
                    dataKey=${xConfig.key} 
                    name=${xConfig.label} 
                    domain=${domain.x}
                    label=${{ value: xConfig.label, position: 'bottom', offset: 0, fill: '#3b82f6' }}
                />
                <${YAxis} 
                    type="number" 
                    dataKey=${yConfig.key} 
                    name=${yConfig.label} 
                    domain=${domain.y}
                    label=${{ value: yConfig.label, angle: -90, position: 'insideLeft', fill: '#10b981' }}
                />
                <${Tooltip} 
                    cursor=${{ strokeDasharray: '3 3' }}
                    content=${({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            // tooltip payload comes from Scatter or Line. Check data type.
                            if (!d.id) return null; // Ignore line tooltip
                            
                            const isExcluded = excludedIds.includes(d.id);
                            return html`
                                <div class="bg-white border border-gray-200 p-2 rounded shadow text-sm">
                                    <div class="font-bold mb-1 flex justify-between">
                                        <span>ID: ${d.id}</span>
                                        <span class="text-xs ${isExcluded ? 'text-red-500' : 'text-green-600'} ml-2">
                                            ${isExcluded ? '除外中' : '使用中'}
                                        </span>
                                    </div>
                                    <p class="text-blue-600">${xConfig.label}: ${d[xConfig.key]}</p>
                                    <p class="text-green-600">${yConfig.label}: ${d[yConfig.key]}</p>
                                    <p class="text-xs text-gray-400 mt-1">クリックで切替</p>
                                </div>
                            `;
                        }
                        return null;
                    }}
                />
                <${Scatter} 
                    name="Data" 
                    data=${data} 
                    onClick=${(d) => onTogglePoint(d.id)}
                    cursor="pointer"
                >
                    ${data.map((entry, index) => {
                        const isExcluded = excludedIds.includes(entry.id);
                        return html`
                            <${Cell} 
                                key=${`cell-${index}`} 
                                fill=${isExcluded ? '#e5e7eb' : '#6366f1'} 
                                stroke=${isExcluded ? '#9ca3af' : 'none'}
                            />
                        `;
                    })}
                </${Scatter}>
                <${Line}
                    data=${lineData}
                    dataKey=${yConfig.key}
                    stroke="#ff7300"
                    strokeWidth=${2}
                    dot=${false}
                    activeDot=${false}
                    legendType="none"
                    isAnimationActive=${false}
                />
            </${ComposedChart}>
        </${ResponsiveContainer}>
    `;
};

/**
 * ビジュアルメーター
 */
const CorrelationMeter = ({ r }) => {
    // -1 to 1 mapped to 0% to 100%
    const percentage = ((r + 1) / 2) * 100;
    
    return html`
        <div class="mt-3">
            <div class="relative h-4 w-full rounded-full bg-gradient-to-r from-green-400 via-gray-300 to-red-400 shadow-inner">
                <div class="absolute top-0 bottom-0 w-1 bg-black border border-white shadow transform -translate-x-1/2 transition-all duration-500" style=${{ left: `${percentage}%` }}></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                <span>-1.0 (負)</span>
                <span>0 (無)</span>
                <span>+1.0 (正)</span>
            </div>
        </div>
    `;
};

/**
 * 分析パネル
 */
const AnalysisPanel = ({ xLabel, yLabel, correlation, regression, strength, activeCount, totalCount }) => {
    const [predictInput, setPredictInput] = useState("");
    
    const predictedValue = useMemo(() => {
        const x = parseFloat(predictInput);
        if (isNaN(x)) return null;
        return MathUtils.predictY(x, regression.slope, regression.intercept).toFixed(2);
    }, [predictInput, regression]);

    return html`
        <div class="space-y-6">
            <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">相関分析</h3>
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="flex justify-between items-baseline mb-1">
                        <span class="text-gray-600 font-medium">相関係数 (r)</span>
                        <span class="text-2xl font-bold text-blue-700">${correlation.toFixed(3)}</span>
                    </div>
                    
                    <${CorrelationMeter} r=${correlation} />

                    <div class="text-right flex justify-between items-center mt-2">
                        <span class="text-xs text-gray-500">n = ${activeCount} / ${totalCount}</span>
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full 
                            ${strength.includes('かなり強い') ? 'bg-purple-100 text-purple-800' : 
                              strength.includes('正の') ? 'bg-red-100 text-red-800' :
                              strength.includes('負の') ? 'bg-green-100 text-green-800' : 
                              'bg-gray-200 text-gray-800'}">
                            ${strength}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">回帰分析</h3>
                <div class="bg-green-50 p-4 rounded-lg">
                    <div class="text-gray-600 font-medium mb-2">回帰式 (近似直線)</div>
                    <div class="text-lg font-mono text-center bg-white py-2 rounded border border-green-200 text-green-800">
                        y = ${regression.slope.toFixed(2)}x ${regression.intercept >= 0 ? '+' : '-'} ${Math.abs(regression.intercept).toFixed(2)}
                    </div>
                    <p class="text-xs text-gray-500 mt-2 text-center">
                        x: ${xLabel}, y: ${yLabel}
                    </p>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">予測シミュレーター</h3>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label class="block text-sm font-medium text-gray-700 mb-1">${xLabel} を入力:</label>
                    <div class="flex items-center space-x-2">
                        <input 
                            type="number" 
                            value=${predictInput}
                            onInput=${(e) => setPredictInput(e.target.value)}
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            placeholder="数値を入力"
                        />
                        <span class="text-gray-400">→</span>
                        <div class="w-full bg-white border border-gray-300 rounded-md p-2 text-center font-bold text-gray-800 h-10 flex items-center justify-center">
                            ${predictedValue !== null ? predictedValue : "-"}
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-2 text-right">予想される ${yLabel}</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * ドリルクリア時のモーダル
 */
const DrillClearModal = ({ onRestart }) => html`
    <div class="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
        <div class="bg-white/90 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden border-4 border-yellow-400 ring-4 ring-yellow-200/50">
            <!-- 背景装飾 -->
            <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400 via-orange-300 to-transparent"></div>
            
            <div class="relative z-10">
                <div class="text-7xl mb-4 animate-bounce-slow drop-shadow-md">🎊</div>
                <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 mb-2 filter drop-shadow-sm">
                    CONGRATULATIONS!
                </h2>
                <div class="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-6 rounded-full"></div>
                
                <p class="text-gray-700 mb-8 font-bold text-lg leading-relaxed">
                    全ミッション達成おめでとう！<br/>
                    君はもう立派なデータマスターだ！
                </p>
                
                <button onClick=${onRestart} class="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transform transition-all text-xl border-t border-white/20">
                    最初から遊ぶ
                </button>
            </div>
        </div>
    </div>
`;

// --- Main App Component ---

const App = () => {
    // State: Mode - 初期値を 'drill' に変更, 'explanation' 追加
    const [mode, setMode] = useState('drill'); // 'exploration' | 'drill' | 'explanation'
    
    // State: Datasets (Start with presets, allow adding more)
    const [availableDatasets, setAvailableDatasets] = useState(DATASETS);
    const [datasetId, setDatasetId] = useState(DATASETS[0].id);
    
    // State: Columns
    const [xKey, setXKey] = useState(DATASETS[0].columns[0].key);
    const [yKey, setYKey] = useState(DATASETS[0].columns[1].key);
    
    // State: Selection (Excluded Data Points)
    const [excludedIds, setExcludedIds] = useState([]);

    // State: UI
    const [showDataWindow, setShowDataWindow] = useState(false);
    const [showInputModal, setShowInputModal] = useState(false);
    
    // State: Drill
    const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
    const [drillFeedback, setDrillFeedback] = useState(null); // null | 'correct' | 'incorrect' | 'same_variable' | 'spurious'
    const [showClearModal, setShowClearModal] = useState(false);
    const [hasCleared, setHasCleared] = useState(false);

    // Derived Data
    const dataset = useMemo(() => 
        availableDatasets.find(d => d.id === datasetId) || availableDatasets[0], 
    [datasetId, availableDatasets]);
    
    const xColumn = useMemo(() => dataset.columns.find(c => c.key === xKey) || dataset.columns[0], [dataset, xKey]);
    const yColumn = useMemo(() => dataset.columns.find(c => c.key === yKey) || dataset.columns[1], [dataset, yKey]);
    
    // Statistics Calculation (Active data only)
    const stats = useMemo(() => {
        const activeData = dataset.data.filter(d => !excludedIds.includes(d.id));
        const xData = activeData.map(d => d[xColumn.key]);
        const yData = activeData.map(d => d[yColumn.key]);
        
        // Handle empty selection
        if (xData.length === 0) {
            return { 
                correlation: 0, regression: { slope: 0, intercept: 0 }, strength: "データなし", activeCount: 0,
                xStats: { min: 0, max: 0, mean: 0 }, yStats: { min: 0, max: 0, mean: 0 }
            };
        }

        const r = MathUtils.calculateCorrelation(xData, yData);
        const reg = MathUtils.calculateRegression(xData, yData);
        const str = MathUtils.getCorrelationStrength(r);
        
        // Basic stats for variables (useful for selection context)
        const calcStats = (arr) => ({
            min: Math.min(...arr),
            max: Math.max(...arr),
            mean: MathUtils.calculateMean(arr)
        });

        return { 
            correlation: r, 
            regression: reg, 
            strength: str, 
            activeCount: xData.length,
            xStats: calcStats(xData),
            yStats: calcStats(yData)
        };
    }, [dataset, xColumn, yColumn, excludedIds]);

    // Initialize Drill Quest (Force incorrect selection initially)
    useEffect(() => {
        if (mode === 'drill') {
            const quest = DRILL_QUESTS[currentQuestIndex];
            if (quest) {
                setDatasetId(quest.datasetId);
                setXKey(quest.initialX);
                setYKey(quest.initialY);
            }
            setDrillFeedback(null);
        }
    }, [currentQuestIndex, mode]);

    // Handlers
    const togglePoint = (id) => {
        setExcludedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSwapAxes = () => {
        setXKey(yKey);
        setYKey(xKey);
    };

    const handleImportData = (name, csvText) => {
        const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim() !== "");
        if (lines.length < 2) {
            alert("データは少なくとも2行（見出し＋データ）必要です");
            return;
        }

        const headers = lines[0].split(",").map(h => h.trim());
        const columns = headers.map((h, i) => ({ 
            key: `col_${i}`, 
            label: h, 
            type: 'number' 
        }));

        const rawData = lines.slice(1).map((line, idx) => {
            const values = line.split(",").map(v => v.trim());
            const row = { id: idx + 1 };
            columns.forEach((col, i) => {
                const val = parseFloat(values[i]);
                row[col.key] = isNaN(val) ? 0 : val;
            });
            return row;
        });

        const newDataset = {
            id: `custom_${Date.now()}`,
            name: name,
            description: "ユーザーが作成したカスタムデータセット",
            columns: columns,
            data: rawData
        };

        setAvailableDatasets([...availableDatasets, newDataset]);
        setDatasetId(newDataset.id);
        setShowInputModal(false);
        setExcludedIds([]);
    };

    const handleDrillSubmit = () => {
        const quest = DRILL_QUESTS[currentQuestIndex];
        
        // Ensure dataset is correct first
        if (datasetId !== quest.datasetId) {
             setDrillFeedback('incorrect_dataset');
             return;
        }

        // Prevent selecting the same variable
        if (xKey === yKey) {
            setDrillFeedback('same_variable');
            return;
        }

        // Strict Validation: Check if the pair matches the quest's Target and one of ValidAnswers
        const isTargetX = xKey === quest.targetKey;
        const isTargetY = yKey === quest.targetKey;
        
        let selectedPair = null;
        if (isTargetX) {
            selectedPair = yKey;
        } else if (isTargetY) {
            selectedPair = xKey;
        }

        const isCorrectPair = selectedPair && quest.validAnswers.includes(selectedPair);

        if (isCorrectPair) {
             setDrillFeedback('correct');
        } else {
             const currentStrength = stats.strength;
             const r = stats.correlation;

             // Improved feedback logic
             const isStrengthMatch = currentStrength === quest.expectedStrength || 
                                     (quest.expectedStrength.includes("正の相関") && currentStrength.includes("正の相関")) ||
                                     (quest.expectedStrength.includes("負の相関") && currentStrength.includes("負の相関"));
             
             // Check if user found "No Correlation" when asking for something else
             const isNoCorrelation = Math.abs(r) < 0.2;
             const askingForNoCorrelation = quest.expectedStrength.includes("ほとんど相関がない") || quest.expectedStrength.includes("無相関");

             if (isStrengthMatch && !isCorrectPair && !isNoCorrelation) {
                 setDrillFeedback('spurious');
             } else if (isNoCorrelation && !askingForNoCorrelation) {
                 setDrillFeedback('found_no_correlation'); // New feedback state
             } else {
                 setDrillFeedback('incorrect');
             }
        }
    };

    const nextQuest = () => {
        setDrillFeedback(null);
        if (currentQuestIndex < DRILL_QUESTS.length - 1) {
            setCurrentQuestIndex(prev => prev + 1);
        } else {
            // End of drills
            setHasCleared(true);
            setShowClearModal(true);
        }
    };
    
    const restartDrill = () => {
        setShowClearModal(false);
        setCurrentQuestIndex(0);
        setDrillFeedback(null);
        setMode('drill');
        // hasCleared remains true to keep the celebratory background
    };

    // Safety check to ensure keys are valid when dataset manually changed (Exploration mode mostly)
    useEffect(() => {
        // Only override if current keys don't exist in new dataset (avoid overriding drill initialization)
        if (!dataset.columns.find(c => c.key === xKey)) setXKey(dataset.columns[0].key);
        if (!dataset.columns.find(c => c.key === yKey)) setYKey(dataset.columns.length > 1 ? dataset.columns[1].key : dataset.columns[0].key);
        setExcludedIds([]); // Reset filters
    }, [datasetId, dataset]);

    // Safe access for display, prevents crash when currentQuestIndex = length
    const displayQuestIndex = Math.min(currentQuestIndex, DRILL_QUESTS.length - 1);
    const currentQuest = DRILL_QUESTS[displayQuestIndex];

    const bgClass = hasCleared 
        ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50" 
        : "bg-gray-50";

    return html`
        <div class="h-full flex flex-col font-sans ${bgClass} transition-colors duration-1000">
            <!-- Header -->
            <header class="bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row justify-between items-center shadow-sm z-10 gap-3">
                <div class="flex items-center space-x-3 md:space-x-4 w-full md:w-auto">
                    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-lg flex-shrink-0 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div class="min-w-0">
                        <h1 class="text-lg md:text-xl font-bold text-gray-900 truncate">Data Analysis</h1>
                        <p class="text-xs text-gray-500 truncate">データ探偵アカデミー</p>
                    </div>
                </div>
                
                <div class="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                    <button 
                        class="flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${mode === 'explanation' ? 'bg-white text-green-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}"
                        onClick=${() => { setMode('explanation'); setDrillFeedback(null); }}
                    >
                        📚 解説
                    </button>
                    <button 
                        class="flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${mode === 'drill' ? 'bg-white text-orange-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}"
                        onClick=${() => { setMode('drill'); setDrillFeedback(null); }}
                    >
                        🔎 ドリル
                    </button>
                    <button 
                        class="flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${mode === 'exploration' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}"
                        onClick=${() => { setMode('exploration'); setDrillFeedback(null); }}
                    >
                        📊 自由研究
                    </button>
                </div>
            </header>

            <!-- Main Area -->
            ${mode === 'explanation' ? html`
                <${TutorialMode} onFinish=${() => setMode('drill')} />
            ` : html`
                <main class="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-4 md:p-6 gap-4 md:gap-6 max-w-[1600px] w-full mx-auto">
                    
                    <!-- Left Column: Controls -->
                    <aside class="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
                        <${Card} title="データ設定" className="flex-none">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">データソース</label>
                                    <select 
                                        class="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white text-gray-900"
                                        value=${datasetId}
                                        onChange=${(e) => setDatasetId(e.target.value)}
                                    >
                                        ${availableDatasets.map(d => html`<option key=${d.id} value=${d.id}>${d.name}</option>`)}
                                    </select>
                                    <p class="mt-2 text-xs text-gray-500 leading-snug">${dataset.description}</p>
                                </div>

                                <!-- "Create Data" is only visible in Exploration Mode -->
                                ${mode === 'exploration' && html`
                                    <button 
                                        onClick=${() => setShowInputModal(true)}
                                        class="w-full flex items-center justify-center px-4 py-2 border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md text-sm font-medium transition-colors"
                                    >
                                        ＋ 自分でデータを作る
                                    </button>
                                `}

                                <button 
                                    onClick=${() => setShowDataWindow(!showDataWindow)}
                                    class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    ${showDataWindow ? 'データ一覧を閉じる' : 'データ一覧・選択'}
                                </button>
                                <p class="text-xs text-gray-400 text-center">※ グラフ上の点をクリックして一時的に除外可能</p>
                            </div>
                        </${Card}>

                        <${Card} title="変数選択" className="flex-1 lg:h-full min-h-[300px] lg:min-h-0">
                            <div class="space-y-4">
                                <div class="p-3 bg-blue-50 rounded-md border border-blue-100 transition-colors hover:bg-blue-100">
                                    <label class="block text-sm font-bold text-blue-800 mb-1">X軸 (横の軸)</label>
                                    <select 
                                        class="block w-full border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                                        value=${xKey}
                                        onChange=${(e) => setXKey(e.target.value)}
                                    >
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                    <div class="mt-2 text-xs text-blue-700 flex justify-between px-1">
                                        <span>最小: ${stats.xStats.min}</span>
                                        <span>平均: ${stats.xStats.mean.toFixed(1)}</span>
                                        <span>最大: ${stats.xStats.max}</span>
                                    </div>
                                </div>

                                <div class="flex justify-center items-center">
                                    <button 
                                        onClick=${handleSwapAxes}
                                        class="p-2 rounded-full hover:bg-gray-100 border border-gray-200 text-gray-500 transition-transform active:scale-95 transform hover:rotate-180 duration-300"
                                        title="軸を入れ替える"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5-6 5 6"/><path d="M17 14l-5 6-5-6"/></svg>
                                    </button>
                                </div>

                                <div class="p-3 bg-green-50 rounded-md border border-green-100 transition-colors hover:bg-green-100">
                                    <label class="block text-sm font-bold text-green-800 mb-1">Y軸 (縦の軸)</label>
                                    <select 
                                        class="block w-full border-green-300 rounded-md focus:ring-green-500 focus:border-green-500 sm:text-sm p-2 border bg-white text-gray-900"
                                        value=${yKey}
                                        onChange=${(e) => setYKey(e.target.value)}
                                    >
                                        ${dataset.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                                    </select>
                                    <div class="mt-2 text-xs text-green-700 flex justify-between px-1">
                                        <span>最小: ${stats.yStats.min}</span>
                                        <span>平均: ${stats.yStats.mean.toFixed(1)}</span>
                                        <span>最大: ${stats.yStats.max}</span>
                                    </div>
                                </div>
                            </div>
                        </${Card}>
                    </aside>

                    <!-- Center Column: Visualization -->
                    <section class="flex-1 flex flex-col min-w-0">
                        <${Card} className="h-full min-h-[400px] lg:min-h-0">
                            <div class="h-full flex flex-col">
                                <div class="flex justify-between items-center mb-4 px-2">
                                    <h2 class="font-bold text-gray-800 text-lg">散布図: <span class="text-green-600">${yColumn.label}</span> vs <span class="text-blue-600">${xColumn.label}</span></h2>
                                    <div class="flex items-center gap-4 text-xs md:text-sm">
                                        <div class="flex items-center"><span class="w-2 h-2 md:w-3 md:h-3 bg-indigo-500 rounded-full mr-1 md:mr-2"></span>実測値</div>
                                        <div class="flex items-center"><span class="w-2 h-2 md:w-3 md:h-3 bg-gray-300 rounded-full mr-1 md:mr-2"></span>除外値</div>
                                        <div class="flex items-center"><span class="w-4 h-1 md:w-8 bg-orange-500 mr-1 md:mr-2"></span>回帰直線</div>
                                    </div>
                                </div>
                                <div class="flex-1 w-full min-h-0 relative" style=${{ minHeight: '300px', height: '100%', width: '100%' }}>
                                    <${ScatterVis} 
                                        data=${dataset.data} 
                                        xConfig=${xColumn} 
                                        yConfig=${yColumn} 
                                        regression=${stats.regression}
                                        excludedIds=${excludedIds}
                                        onTogglePoint=${togglePoint}
                                    />
                                </div>
                            </div>
                        </${Card}>
                    </section>

                    <!-- Right Column: Analysis -->
                    <aside class="w-full lg:w-72 flex-shrink-0">
                        <${Card} title="分析結果" className="h-full">
                            <${AnalysisPanel} 
                                xLabel=${xColumn.label}
                                yLabel=${yColumn.label}
                                correlation=${stats.correlation}
                                regression=${stats.regression}
                                strength=${stats.strength}
                                activeCount=${stats.activeCount}
                                totalCount=${dataset.data.length}
                            />
                        </${Card}>
                    </aside>

                </main>
            `}

            <!-- Drill Quest Window (Floating Assistant) -->
            ${mode === 'drill' && !showClearModal && html`
                <${DrillQuestWindow}
                    quest=${currentQuest}
                    index=${displayQuestIndex}
                    total=${DRILL_QUESTS.length}
                    feedback=${drillFeedback}
                    onSubmit=${handleDrillSubmit}
                    onNext=${nextQuest}
                />
            `}

            <!-- Floating Window -->
            ${showDataWindow && mode !== 'explanation' && html`
                <${FloatingDataWindow} 
                    data=${dataset.data} 
                    columns=${dataset.columns} 
                    excludedIds=${excludedIds}
                    onTogglePoint=${togglePoint}
                    onClose=${() => setShowDataWindow(false)} 
                />
            `}
            
            <!-- Input Modal -->
            ${showInputModal && html`
                <${DataInputModal} 
                    onClose=${() => setShowInputModal(false)}
                    onImport=${handleImportData}
                />
            `}

            ${showClearModal && html`
                <${DrillClearModal} onRestart=${restartDrill} />
            `}
        </div>
    `;
};

// Mount App
const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
