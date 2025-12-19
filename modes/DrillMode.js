
import React, { useState } from 'react';
import htm from 'htm';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Line } from 'recharts';
import { DRILL_QUESTS, DATASETS } from '../utils/data.js';
import * as MathUtils from '../utils/math.js';
import { SimpleConfetti } from '../components/UI.js';

const html = htm.bind(React.createElement);

export const DrillMode = ({ onExit }) => {
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
