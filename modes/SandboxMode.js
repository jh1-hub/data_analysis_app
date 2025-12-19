
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Line } from 'recharts';
import { DATASETS } from '../utils/data.js';
import * as MathUtils from '../utils/math.js';

const html = htm.bind(React.createElement);

export const SandboxMode = ({ onExit }) => {
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
