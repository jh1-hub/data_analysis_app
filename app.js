
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';

import { LectureMode } from './LectureMode.js';
import { MasterMode } from './modes/MasterMode.js';
import { DrillMode } from './modes/DrillMode.js';
import { SandboxMode } from './modes/SandboxMode.js';
import { ExtraMissionMode } from './modes/ExtraMissionMode.js';
import { EXTRA_MISSION_STAGES } from './utils/data.js';

const html = htm.bind(React.createElement);

/**
 * Main App Component
 */
const App = () => {
    const [mode, setMode] = useState('menu'); // menu, drill, sandbox, master, extra, lecture
    const [extraStageIndex, setExtraStageIndex] = useState(0);

    const startExtraMission = (index) => {
        setExtraStageIndex(index);
        setMode('extra');
    };

    // Main Menu
    if (mode === 'menu') {
        return html`
            <div class="h-full overflow-y-auto bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
                <div class="max-w-4xl mx-auto">
                    <header class="mb-8 text-center animate-fade-in-up">
                        <h1 class="text-3xl md:text-5xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">
                            <span class="text-blue-600">Data</span> Analysis <span class="text-green-500">Challenge</span>
                        </h1>
                        <p class="text-gray-500 dark:text-slate-400 font-bold">データ分析の直感を磨くインタラクティブ学習アプリ</p>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Lecture Mode (Updated Priority) -->
                        <div 
                            onClick=${() => setMode('lecture')}
                            class="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden relative md:col-span-2"
                        >
                            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl">📝</div>
                            <div class="relative z-10">
                                <div class="bg-indigo-100 text-indigo-700 inline-block px-3 py-1 rounded-full text-xs font-black mb-3 border border-indigo-200">授業プリント完全対応</div>
                                <h2 class="text-2xl font-black text-gray-800 dark:text-white mb-2">デジタルワークシート (解説)</h2>
                                <p class="text-sm text-gray-500 dark:text-slate-400 mb-4 font-medium leading-relaxed">
                                    授業で配られたプリントの内容を、動くグラフで体験しながら学べます。<br/>
                                    相関係数の変化シミュレーターや、疑似相関の図解で深く理解しよう！
                                </p>
                                <span class="text-white bg-indigo-600 px-4 py-2 rounded-lg font-bold text-sm inline-flex items-center group-hover:bg-indigo-700 transition-all shadow-md">
                                    ワークシートを開く <span class="ml-2">→</span>
                                </span>
                            </div>
                        </div>

                        <!-- Drill Mode -->
                        <div 
                            onClick=${() => setMode('drill')}
                            class="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden relative"
                        >
                            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl">📊</div>
                            <div class="relative z-10">
                                <div class="bg-blue-100 text-blue-700 inline-block px-3 py-1 rounded-full text-xs font-black mb-3">STORY MODE</div>
                                <h2 class="text-2xl font-black text-gray-800 dark:text-white mb-2">データ探偵ドリル</h2>
                                <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
                                    校長先生やコンビニ店長からの依頼をデータ分析で解決しよう！
                                </p>
                                <span class="text-blue-600 font-bold text-sm flex items-center group-hover:gap-2 transition-all">START <span class="ml-1">→</span></span>
                            </div>
                        </div>

                        <!-- Sandbox Mode -->
                        <div 
                            onClick=${() => setMode('sandbox')}
                            class="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden relative"
                        >
                            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl">🧪</div>
                            <div class="relative z-10">
                                <div class="bg-green-100 text-green-700 inline-block px-3 py-1 rounded-full text-xs font-black mb-3">FREE MODE</div>
                                <h2 class="text-2xl font-black text-gray-800 dark:text-white mb-2">自由研究ラボ</h2>
                                <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">
                                    様々なデータセットを自由に組み合わせて相関を探そう。
                                </p>
                                <span class="text-green-600 font-bold text-sm flex items-center group-hover:gap-2 transition-all">ENTER <span class="ml-1">→</span></span>
                            </div>
                        </div>

                        <!-- Master Mode -->
                        <div 
                            onClick=${() => setMode('master')}
                            class="group bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 md:col-span-2 relative overflow-hidden"
                        >
                            <div class="absolute -right-10 -bottom-10 text-9xl opacity-20 rotate-12">👑</div>
                            <div class="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                <div class="flex-1">
                                    <div class="bg-white/20 inline-block px-3 py-1 rounded-full text-xs font-black mb-3 border border-white/20">HARD MODE</div>
                                    <h2 class="text-3xl font-black mb-2">相関マスター</h2>
                                    <p class="text-blue-100 mb-4 text-sm font-bold opacity-90">
                                        あなたの「統計的直感」を試す最終試験。
                                        グラフだけを見て、相関係数(r)を瞬時に言い当てろ！
                                    </p>
                                </div>
                                <div class="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                                    <span class="text-2xl block animate-pulse">⚔️</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Extra Missions List -->
                    <div class="mt-8">
                        <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">Extra Missions (応用編)</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            ${EXTRA_MISSION_STAGES.map((stage, i) => html`
                                <div 
                                    key=${i}
                                    onClick=${() => startExtraMission(i)}
                                    class="bg-slate-800 text-slate-300 rounded-xl p-4 border border-slate-700 hover:border-yellow-500 cursor-pointer transition-all hover:bg-slate-750 group"
                                >
                                    <div class="text-xs text-yellow-500 font-bold mb-1">MISSION ${i + 1}</div>
                                    <div class="font-bold text-white group-hover:text-yellow-400 transition-colors">${stage.title}</div>
                                </div>
                            `)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    if (mode === 'drill') return html`<${DrillMode} onExit=${() => setMode('menu')} />`;
    if (mode === 'sandbox') return html`<${SandboxMode} onExit=${() => setMode('menu')} />`;
    if (mode === 'master') return html`<${MasterMode} onExit=${() => setMode('menu')} />`;
    if (mode === 'extra') return html`<${ExtraMissionMode} stageConfig=${EXTRA_MISSION_STAGES[extraStageIndex]} onExit=${() => setMode('menu')} />`;
    if (mode === 'lecture') return html`<${LectureMode} onExit=${() => setMode('menu')} />`;

    return null;
};

// Mount the app
const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
