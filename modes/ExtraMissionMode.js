
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { DATASETS } from '../utils/data.js';
import * as MathUtils from '../utils/math.js';
import { SimpleConfetti } from '../components/UI.js';

const html = htm.bind(React.createElement);

export const ExtraMissionMode = ({ stageConfig, onExit }) => {
    const [localData, setLocalData] = useState([...DATASETS.find(d => d.id === stageConfig.datasetId).data]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [cleared, setCleared] = useState(false);
    
    // Reset state when stage changes
    useEffect(() => {
        setLocalData([...DATASETS.find(d => d.id === stageConfig.datasetId).data]);
        setSelectedIds([]);
        setCleared(false);
    }, [stageConfig]);

    const r = MathUtils.calculateCorrelation(
        localData.map(d => d[stageConfig.xKey]),
        localData.map(d => d[stageConfig.yKey])
    );

    const checkVictory = () => {
        if (stageConfig.type === 'cleaning') {
            if (r >= stageConfig.targetR) return true;
        } else if (stageConfig.type === 'selection') {
            // Check if selected IDs perfectly match target IDs
            if (selectedIds.length !== stageConfig.targetIds.length) return false;
            const sortedSelected = [...selectedIds].sort();
            const sortedTarget = [...stageConfig.targetIds].sort();
            return JSON.stringify(sortedSelected) === JSON.stringify(sortedTarget);
        }
        return false;
    };

    const isVictory = checkVictory();

    const handlePointClick = (point) => {
        if (cleared) return;

        if (stageConfig.type === 'cleaning') {
            // Remove point
            setLocalData(prev => prev.filter(p => p.id !== point.id));
        } else if (stageConfig.type === 'selection') {
            // Toggle selection
            if (selectedIds.includes(point.id)) {
                setSelectedIds(prev => prev.filter(id => id !== point.id));
            } else {
                setSelectedIds(prev => [...prev, point.id]);
            }
        }
    };

    return html`
        <div class="h-full flex flex-col bg-slate-900 text-white">
            <div class="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-lg z-10">
                <div>
                    <div class="text-xs font-bold text-yellow-400 mb-1">EXTRA MISSION</div>
                    <div class="text-lg font-black">${stageConfig.title}</div>
                </div>
                <button onClick=${onExit} class="text-gray-400 hover:text-white text-sm">中断</button>
            </div>
            
            <div class="flex-1 flex flex-col relative overflow-hidden">
                ${isVictory && html`<${SimpleConfetti} />`}
                
                <!-- Overlay Instruction -->
                <div class="absolute top-4 left-4 right-4 z-20 pointer-events-none">
                    <div class="bg-black/60 backdrop-blur text-white p-4 rounded-xl border border-white/10 shadow-xl animate-fade-in-up">
                        <p class="text-sm md:text-base font-bold text-yellow-100">${isVictory ? stageConfig.explanation : stageConfig.intro}</p>
                    </div>
                </div>

                <!-- Chart -->
                <div class="flex-1 p-4 md:p-8">
                    <${ResponsiveContainer} width="100%" height="100%">
                        <${ScatterChart} margin=${{ top: 60, right: 20, bottom: 20, left: 20 }}>
                            <${CartesianGrid} strokeDasharray="3 3" stroke="#475569" />
                            <${XAxis} type="number" dataKey=${stageConfig.xKey} stroke="#94a3b8" />
                            <${YAxis} type="number" dataKey=${stageConfig.yKey} stroke="#94a3b8" />
                            <${Tooltip} cursor=${{ strokeDasharray: '3 3' }} contentStyle=${{ backgroundColor: '#1e293b', borderColor: '#334155', color: 'white' }} />
                            <${Scatter} data=${localData} onClick=${(e) => handlePointClick(e.payload)}>
                                ${localData.map((entry) => {
                                    const isSelected = selectedIds.includes(entry.id);
                                    return html`
                                        <${Cell} 
                                            key=${entry.id} 
                                            fill=${isSelected ? '#facc15' : '#3b82f6'} 
                                            stroke=${isSelected ? '#fff' : 'none'}
                                            strokeWidth=${2}
                                            cursor="pointer"
                                        />
                                    `;
                                })}
                            </${Scatter}>
                        </${ScatterChart}>
                    </${ResponsiveContainer}>
                </div>

                <!-- Footer Status -->
                <div class="h-24 bg-slate-800 border-t border-slate-700 p-4 flex items-center justify-between">
                    <div>
                        ${stageConfig.type === 'cleaning' && html`
                            <div class="text-xs text-slate-400">現在の相関係数</div>
                            <div class="text-2xl font-mono font-bold ${isVictory ? 'text-green-400' : 'text-white'}">${r.toFixed(3)}</div>
                        `}
                        ${stageConfig.type === 'selection' && html`
                            <div class="text-xs text-slate-400">選択中</div>
                            <div class="text-xl font-bold text-white">${selectedIds.length} <span class="text-sm font-normal text-slate-500">個</span></div>
                        `}
                    </div>

                    ${isVictory ? html`
                         <button onClick=${onExit} class="bg-yellow-500 hover:bg-yellow-600 text-black font-black py-3 px-8 rounded-full shadow-lg animate-bounce">
                            MISSION CLEAR!
                        </button>
                    ` : html`
                         <div class="text-xs text-slate-500 font-bold">
                            ${stageConfig.type === 'cleaning' ? 'クリックして外れ値を除外せよ' : '該当するデータをクリックせよ'}
                         </div>
                    `}
                </div>
            </div>
        </div>
    `;
};
