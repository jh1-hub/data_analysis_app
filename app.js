
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

// --- Data & Config ---
const EXTRA_MISSION_STAGES = [
    { 
        id: "ex_1",
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
        id: "ex_2",
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
        id: "ex_3",
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

const EXPLANATION_SLIDES = [
    {
        title: "データの関係を見える化しよう",
        content: "「勉強時間」と「テストの点数」のように、2つのデータの関係を調べるときに使うのが『散布図（さんぷず）』です。点を打つことで、数字の羅列では見えない「傾向」が見えてきます。",
        image: "📊"
    },
    {
        title: "「相関」ってなに？",
        content: "片方が増えるともう片方も増える関係を「正の相関（右上がり）」、逆に減る関係を「負の相関（右下がり）」と呼びます。関係が強ければ強いほど、点は一直線に並びます。",
        image: "📈"
    },
    {
        title: "外れ値に注意！",
        content: "全体の傾向から大きく外れたデータを「外れ値（アウトライヤー）」と呼びます。入力ミスの場合もあれば、特別な意味を持つ重要なデータの場合もあります。",
        image: "⚡"
    }
];

// --- Custom Hooks ---

const useGameState = () => {
    const STORAGE_KEY = 'dac_save_v2'; // Version up for new structure
    
    const [state, setState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : { 
                completedDrills: [], 
                completedExtraMissions: [],
                masterHighScore: 0 
            };
        } catch (e) {
            console.error("Save data load error:", e);
            return { completedDrills: [], completedExtraMissions: [], masterHighScore: 0 };
        }
    });

    const saveState = (newState) => {
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    };

    const completeDrill = (id) => {
        if (!state.completedDrills.includes(id)) {
            saveState({ ...state, completedDrills: [...state.completedDrills, id] });
        }
    };

    const completeExtraMission = (id) => {
        if (!state.completedExtraMissions?.includes(id)) {
            saveState({ 
                ...state, 
                completedExtraMissions: [...(state.completedExtraMissions || []), id] 
            });
        }
    };

    const updateMasterScore = (score) => {
        if (score > state.masterHighScore) {
            saveState({ ...state, masterHighScore: score });
            return true;
        }
        return false;
    };

    const resetData = () => {
        if (window.confirm("【警告】\nこれまでの学習記録とハイスコアを全て消去します。\n本当によろしいですか？")) {
            const initialState = { completedDrills: [], completedExtraMissions: [], masterHighScore: 0 };
            saveState(initialState);
            alert("データをリセットしました。");
        }
    };

    return { state, completeDrill, completeExtraMission, updateMasterScore, resetData };
};

// --- Helper Components ---
const SimpleConfetti = () => {
    const pieces = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
        id: i, left: Math.random() * 100 + '%', animationDelay: Math.random() * 0.5 + 's',
        color: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)]
    })), []);
    return html`<div class="absolute inset-0 overflow-hidden pointer-events-none z-50">${pieces.map(p => html`<div key=${p.id} class="confetti-piece" style=${{ left: p.left, animationDelay: p.animationDelay, backgroundColor: p.color }}></div>`)}</div>`;
};

/**
 * Explanation Mode (Tutorial)
 */
const ExplanationMode = ({ onExit }) => {
    const [step, setStep] = useState(0);

    return html`
        <div class="h-full flex flex-col items-center justify-center p-4 bg-indigo-50 dark:bg-gray-900 animate-fade-in-up">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full relative min-h-[400px] flex flex-col">
                <button onClick=${onExit} class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕ 閉じる</button>
                
                <div class="flex-1 flex flex-col items-center justify-center text-center">
                    <div class="text-6xl mb-6 animate-bounce-slow">${EXPLANATION_SLIDES[step].image}</div>
                    <h2 class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-4">${EXPLANATION_SLIDES[step].title}</h2>
                    <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">${EXPLANATION_SLIDES[step].content}</p>
                </div>

                <div class="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        onClick=${() => setStep(s => Math.max(0, s - 1))}
                        disabled=${step === 0}
                        class="px-6 py-2 rounded-lg font-bold ${step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}"
                    >
                        ⬅ 前へ
                    </button>
                    <div class="flex gap-2">
                        ${EXPLANATION_SLIDES.map((_, i) => html`
                            <div key=${i} class="w-2 h-2 rounded-full ${i === step ? 'bg-indigo-600' : 'bg-gray-300'}"></div>
                        `)}
                    </div>
                    <button 
                        onClick=${() => step < EXPLANATION_SLIDES.length - 1 ? setStep(s => s + 1) : onExit()}
                        class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all"
                    >
                        ${step < EXPLANATION_SLIDES.length - 1 ? '次へ ➡' : 'わかった！'}
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Extra Mission Mode (Free Research / Advanced)
 */
const ExtraMissionMode = ({ completedMissions, onComplete, onExit }) => {
    const [currentMissionId, setCurrentMissionId] = useState(null);
    const [gameState, setGameState] = useState({ 
        selectedIds: [], 
        excludedIds: [], 
        showResult: false, 
        isCleared: false 
    });

    const currentMission = useMemo(() => EXTRA_MISSION_STAGES.find(m => m.id === currentMissionId), [currentMissionId]);
    const dataset = useMemo(() => currentMission ? DATASETS.find(d => d.id === currentMission.datasetId) : null, [currentMission]);

    // Reset game state when mission changes
    useEffect(() => {
        setGameState({ selectedIds: [], excludedIds: [], showResult: false, isCleared: false });
    }, [currentMissionId]);

    // Calculate metrics based on current game state
    const metrics = useMemo(() => {
        if (!dataset || !currentMission) return null;
        
        // Filter data based on excludedIds (for cleaning mode)
        const activeData = dataset.data.filter(d => !gameState.excludedIds.includes(d.id));
        const xData = activeData.map(d => d[currentMission.xKey]);
        const yData = activeData.map(d => d[currentMission.yKey]);
        
        const r = MathUtils.calculateCorrelation(xData, yData);
        const regression = MathUtils.calculateRegression(xData, yData);
        
        return { activeData, r, regression };
    }, [dataset, currentMission, gameState.excludedIds]);

    const handlePointClick = (dataPoint) => {
        if (gameState.showResult && gameState.isCleared) return; // Prevent changes after clear

        if (currentMission.type === "cleaning") {
            // Toggle exclusion
            const isExcluded = gameState.excludedIds.includes(dataPoint.id);
            setGameState(prev => ({
                ...prev,
                excludedIds: isExcluded 
                    ? prev.excludedIds.filter(id => id !== dataPoint.id)
                    : [...prev.excludedIds, dataPoint.id]
            }));
        } else if (currentMission.type === "selection") {
            // Toggle selection
            const isSelected = gameState.selectedIds.includes(dataPoint.id);
            setGameState(prev => ({
                ...prev,
                selectedIds: isSelected
                    ? prev.selectedIds.filter(id => id !== dataPoint.id)
                    : [...prev.selectedIds, dataPoint.id]
            }));
        }
    };

    const handleCheck = () => {
        if (!currentMission || !metrics) return;
        
        let isSuccess = false;

        if (currentMission.type === "cleaning") {
            // Check if R is improved enough
            if (metrics.r >= currentMission.targetR) {
                isSuccess = true;
            }
        } else if (currentMission.type === "selection") {
            // Check if selected IDs match target IDs exactly
            const selected = gameState.selectedIds.sort().join(',');
            const target = currentMission.targetIds.sort().join(',');
            if (selected === target) {
                isSuccess = true;
            }
        }

        setGameState(prev => ({ ...prev, showResult: true, isCleared: isSuccess }));
        if (isSuccess) {
            onComplete(currentMission.id);
        }
    };

    // --- List View ---
    if (!currentMissionId) {
        return html`
            <div class="h-full flex flex-col p-4 max-w-5xl mx-auto w-full animate-fade-in-up">
                <div class="flex items-center justify-between mb-6">
                    <button onClick=${onExit} class="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">⬅ 戻る</button>
                    <h2 class="text-2xl font-black text-gray-800 dark:text-white">自由研究ミッション</h2>
                    <div class="w-10"></div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${EXTRA_MISSION_STAGES.map(mission => {
                        const isCompleted = completedMissions?.includes(mission.id);
                        return html`
                            <button key=${mission.id} onClick=${() => setCurrentMissionId(mission.id)}
                                class="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border-2 transition-all hover:scale-[1.03] text-left flex flex-col h-full
                                ${isCompleted ? 'border-green-400 dark:border-green-600' : 'border-transparent hover:border-purple-400'}">
                                <div class="h-2 bg-gradient-to-r ${isCompleted ? 'from-green-400 to-emerald-500' : 'from-purple-500 to-indigo-500'}"></div>
                                <div class="p-5 flex-1 flex flex-col">
                                    <div class="flex justify-between items-start mb-2">
                                        <span class="text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                                            ${mission.type === 'cleaning' ? 'データ修正' : 'データ探索'}
                                        </span>
                                        ${isCompleted && html`<span class="text-green-500 font-bold text-sm">CLEAR!</span>`}
                                    </div>
                                    <h3 class="font-bold text-lg text-gray-800 dark:text-white mb-2">${mission.title}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">${mission.intro}</p>
                                </div>
                            </button>
                        `;
                    })}
                </div>
            </div>
        `;
    }

    // --- Game View ---
    const { activeData, r, regression } = metrics || {};
    const xLabel = dataset.columns.find(c => c.key === currentMission.xKey)?.label;
    const yLabel = dataset.columns.find(c => c.key === currentMission.yKey)?.label;

    return html`
        <div class="h-full flex flex-col p-2 md:p-4 max-w-6xl mx-auto w-full animate-fade-in-up">
            <div class="flex items-center justify-between mb-2">
                <button onClick=${() => setCurrentMissionId(null)} class="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1">
                    ⬅ ミッション一覧
                </button>
                <div class="font-bold text-purple-600 dark:text-purple-400 text-sm">MISSION: ${currentMission.title}</div>
            </div>

            <div class="bg-purple-50 dark:bg-slate-800/50 p-4 rounded-xl border border-purple-100 dark:border-slate-700 mb-4 text-sm text-gray-800 dark:text-gray-200">
                <div class="font-bold mb-1">指令:</div>
                ${currentMission.intro}
            </div>

            <div class="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 p-2 md:p-4 relative flex flex-col">
                    ${dataset && html`
                        <${ResponsiveContainer} width="100%" height="100%">
                            <${ScatterChart} margin=${{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <${CartesianGrid} strokeDasharray="3 3" opacity=${0.3} />
                                <${XAxis} type="number" dataKey=${currentMission.xKey} name=${xLabel} domain=${['auto', 'auto']} label=${{ value: xLabel, position: 'bottom', offset: 0 }} />
                                <${YAxis} type="number" dataKey=${currentMission.yKey} name=${yLabel} domain=${['auto', 'auto']} label=${{ value: yLabel, angle: -90, position: 'left' }} />
                                <${Tooltip} cursor=${{ strokeDasharray: '3 3' }} />
                                <!-- Render all points, differentiate style based on state -->
                                <${Scatter} name="Data" data=${dataset.data} onClick=${handlePointClick} cursor="pointer">
                                    ${dataset.data.map((entry, index) => {
                                        let fill = "#6366f1"; // default
                                        let opacity = 1;
                                        
                                        if (currentMission.type === "cleaning") {
                                            if (gameState.excludedIds.includes(entry.id)) {
                                                fill = "#ef4444"; // Red for excluded
                                                opacity = 0.2;
                                            }
                                        } else if (currentMission.type === "selection") {
                                            if (gameState.selectedIds.includes(entry.id)) {
                                                fill = "#f59e0b"; // Amber for selected
                                            } else {
                                                fill = "#cbd5e1"; // Gray for unselected
                                            }
                                        }
                                        return html`<${Cell} key=${index} fill=${fill} opacity=${opacity} />`;
                                    })}
                                </${Scatter}>
                                
                                ${regression && html`
                                    <${Line} 
                                        data=${[
                                            { [currentMission.xKey]: dataset.columns.find(c=>c.key===currentMission.xKey).min, [currentMission.yKey]: MathUtils.predictY(dataset.columns.find(c=>c.key===currentMission.xKey).min, regression.slope, regression.intercept) },
                                            { [currentMission.xKey]: dataset.columns.find(c=>c.key===currentMission.xKey).max, [currentMission.yKey]: MathUtils.predictY(dataset.columns.find(c=>c.key===currentMission.xKey).max, regression.slope, regression.intercept) }
                                        ]}
                                        dataKey=${currentMission.yKey} stroke="#10b981" strokeWidth=${2} strokeDasharray="5 5" dot=${false} activeDot=${false}
                                    />
                                `}
                            </${ScatterChart}>
                        </${ResponsiveContainer}>
                    `}

                    ${gameState.isCleared && html`
                         <div class="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                             <div class="text-6xl md:text-9xl opacity-90 animate-pop-in">⭕ CLEAR!</div>
                             <${SimpleConfetti} />
                        </div>
                    `}
                </div>

                <div class="md:w-80 flex flex-col gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div class="text-center mb-4">
                            <div class="text-xs text-gray-500">現在の相関係数</div>
                            <div class="text-4xl font-mono font-black text-indigo-600 dark:text-indigo-400 transition-all duration-300">
                                ${r ? r.toFixed(3) : '---'}
                            </div>
                        </div>

                        ${currentMission.type === 'cleaning' && html`
                            <div class="mb-4 text-center">
                                <div class="text-xs text-gray-500 mb-1">目標</div>
                                <div class="text-sm font-bold">相関係数 ${currentMission.targetR} 以上にする</div>
                                <div class="text-xs text-red-500 mt-2">グラフ上の点をクリックして<br/>おかしなデータを除外しよう</div>
                            </div>
                        `}

                        ${currentMission.type === 'selection' && html`
                            <div class="mb-4 text-center">
                                <div class="text-xs text-gray-500 mb-1">選択数</div>
                                <div class="text-xl font-bold">${gameState.selectedIds.length} / ${currentMission.targetIds.length}</div>
                                <div class="text-xs text-amber-500 mt-2">条件に合う点をクリックして<br/>すべて選択しよう</div>
                            </div>
                        `}

                        <button onClick=${handleCheck} disabled=${gameState.isCleared}
                            class="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-green-500 disabled:opacity-100">
                            ${gameState.isCleared ? 'クリア！' : 'これで判定する'}
                        </button>
                    </div>

                    ${gameState.showResult && html`
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-2 ${gameState.isCleared ? 'border-green-400' : 'border-red-400'} animate-fade-in-up flex-1 overflow-y-auto">
                             <h3 class="font-black ${gameState.isCleared ? 'text-green-600' : 'text-red-500'} mb-2">
                                ${gameState.isCleared ? 'ミッション達成！' : '失敗...'}
                            </h3>
                            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                ${gameState.isCleared 
                                    ? currentMission.explanation 
                                    : (currentMission.type === 'cleaning' ? 'まだ相関が弱いです。他の外れ値がないか探してみましょう。' : '選択が間違っているか、数が足りません。条件をよく読んで再挑戦！')
                                }
                            </p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
};

/**
 * DrillMode (Story/Quest Mode)
 */
const DrillMode = ({ completedDrills, onComplete, onExit }) => {
    const [currentDrillId, setCurrentDrillId] = useState(null);
    const [selectedX, setSelectedX] = useState("");
    const [selectedY, setSelectedY] = useState("");
    const [showResult, setShowResult] = useState(false);

    const currentDrill = useMemo(() => DRILL_QUESTS.find(q => q.id === currentDrillId), [currentDrillId]);
    const dataset = useMemo(() => currentDrill ? DATASETS.find(d => d.id === currentDrill.datasetId) : null, [currentDrill]);

    useEffect(() => {
        if (currentDrill) {
            setSelectedX(currentDrill.initialX || "");
            setSelectedY(currentDrill.initialY || "");
            setShowResult(false);
        }
    }, [currentDrill]);

    const handleCheckAnswer = () => {
        if (!currentDrill) return;
        const isTargetX = currentDrill.targetKey === selectedX;
        const isTargetY = currentDrill.targetKey === selectedY;
        let isCorrect = false;
        if (isTargetX && currentDrill.validAnswers.includes(selectedY)) isCorrect = true;
        if (isTargetY && currentDrill.validAnswers.includes(selectedX)) isCorrect = true;

        if (isCorrect) onComplete(currentDrill.id);
        setShowResult(true);
    };

    if (!currentDrillId) {
        return html`
            <div class="h-full flex flex-col p-4 max-w-4xl mx-auto w-full animate-fade-in-up">
                <div class="flex items-center justify-between mb-6">
                    <button onClick=${onExit} class="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">⬅ 戻る</button>
                    <h2 class="text-2xl font-black text-gray-800 dark:text-white">ドリル一覧</h2>
                    <div class="w-10"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4">
                    ${DRILL_QUESTS.map(drill => {
                        const isCompleted = completedDrills.includes(drill.id);
                        return html`
                            <button key=${drill.id} onClick=${() => setCurrentDrillId(drill.id)}
                                class="text-left p-4 rounded-xl border-2 transition-all shadow-sm group hover:scale-[1.02]
                                ${isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-100 hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700'}">
                                <div class="flex items-start justify-between mb-2">
                                    <span class="font-bold text-xs px-2 py-1 rounded ${isCompleted ? 'bg-green-200 text-green-800' : 'bg-indigo-100 text-indigo-700'}">QUEST ${drill.id}</span>
                                    ${isCompleted && html`<span class="text-xl">✅</span>`}
                                </div>
                                <div class="text-sm font-bold text-gray-700 dark:text-gray-200 line-clamp-2 group-hover:text-indigo-600">${drill.text}</div>
                            </button>
                        `;
                    })}
                </div>
            </div>
        `;
    }

    const isCompleted = completedDrills.includes(currentDrill.id);
    const isAnswerCorrect = showResult && (isCompleted || (() => {
         const isTargetX = currentDrill.targetKey === selectedX;
         const isTargetY = currentDrill.targetKey === selectedY;
         return (isTargetX && currentDrill.validAnswers.includes(selectedY)) || (isTargetY && currentDrill.validAnswers.includes(selectedX));
    })());
    const regression = (dataset && selectedX && selectedY) ? MathUtils.calculateRegression(dataset.data.map(d=>d[selectedX]), dataset.data.map(d=>d[selectedY])) : null;
    const r = (dataset && selectedX && selectedY) ? MathUtils.calculateCorrelation(dataset.data.map(d=>d[selectedX]), dataset.data.map(d=>d[selectedY])) : 0;

    return html`
        <div class="h-full flex flex-col p-2 md:p-4 max-w-6xl mx-auto w-full animate-fade-in-up">
            <div class="flex items-center justify-between mb-2">
                <button onClick=${() => setCurrentDrillId(null)} class="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1">⬅ 一覧へ</button>
                <div class="font-bold text-gray-400 text-xs">QUEST ${currentDrill.id}</div>
            </div>
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700 mb-4">
                <div class="flex gap-3 items-start">
                    <div class="text-3xl">🕵️‍♂️</div>
                    <div>
                        <div class="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">${currentDrill.text}</div>
                        <div class="text-xs bg-indigo-50 dark:bg-slate-700 text-indigo-800 dark:text-indigo-200 px-3 py-1.5 rounded inline-block font-bold">ヒント: ${currentDrill.hint}</div>
                    </div>
                </div>
            </div>
            <div class="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 p-2 md:p-4 relative flex flex-col min-h-[300px]">
                    ${dataset && html`
                        <${ResponsiveContainer} width="100%" height="100%">
                            <${ScatterChart} margin=${{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <${CartesianGrid} strokeDasharray="3 3" opacity=${0.3} />
                                <${XAxis} type="number" dataKey=${selectedX} name=${dataset.columns.find(c=>c.key===selectedX)?.label} domain=${['auto', 'auto']} label=${{ value: dataset.columns.find(c=>c.key===selectedX)?.label, position: 'bottom', offset: 0 }} />
                                <${YAxis} type="number" dataKey=${selectedY} name=${dataset.columns.find(c=>c.key===selectedY)?.label} domain=${['auto', 'auto']} label=${{ value: dataset.columns.find(c=>c.key===selectedY)?.label, angle: -90, position: 'left' }} />
                                <${Tooltip} cursor=${{ strokeDasharray: '3 3' }} />
                                <${Scatter} name="Data" data=${dataset.data} fill="#6366f1" />
                                ${showResult && regression && html`
                                    <${Line} data=${[{ [selectedX]: dataset.columns.find(c=>c.key===selectedX).min, [selectedY]: MathUtils.predictY(dataset.columns.find(c=>c.key===selectedX).min, regression.slope, regression.intercept) }, { [selectedX]: dataset.columns.find(c=>c.key===selectedX).max, [selectedY]: MathUtils.predictY(dataset.columns.find(c=>c.key===selectedX).max, regression.slope, regression.intercept) }]} dataKey=${selectedY} stroke="#f97316" strokeWidth=${2} dot=${false} activeDot=${false} />
                                `}
                            </${ScatterChart}>
                        </${ResponsiveContainer}>
                    `}
                    ${showResult && isAnswerCorrect && html`<div class="absolute inset-0 pointer-events-none flex items-center justify-center"><div class="text-6xl md:text-9xl opacity-80 animate-pop-in">⭕</div></div>`}
                    ${showResult && !isAnswerCorrect && html`<div class="absolute inset-0 pointer-events-none flex items-center justify-center"><div class="text-6xl md:text-9xl opacity-80 animate-pop-in">❌</div></div>`}
                </div>
                <div class="md:w-72 flex flex-col gap-4">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-400 mb-1">横軸 (X)</label>
                            <select value=${selectedX} onChange=${(e) => { setSelectedX(e.target.value); setShowResult(false); }} class="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-bold text-gray-700 dark:text-white">
                                ${dataset?.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-400 mb-1">縦軸 (Y)</label>
                            <select value=${selectedY} onChange=${(e) => { setSelectedY(e.target.value); setShowResult(false); }} class="w-full p-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-bold text-gray-700 dark:text-white">
                                ${dataset?.columns.map(c => html`<option key=${c.key} value=${c.key}>${c.label}</option>`)}
                            </select>
                        </div>
                        <button onClick=${handleCheckAnswer} disabled=${showResult && isAnswerCorrect} class="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-green-500 disabled:opacity-100">
                            ${showResult && isAnswerCorrect ? '正解！' : '関係性をチェック'}
                        </button>
                    </div>
                    ${showResult && html`
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border-2 ${isAnswerCorrect ? 'border-green-400' : 'border-red-400'} animate-fade-in-up flex-1 overflow-y-auto">
                            <h3 class="font-black ${isAnswerCorrect ? 'text-green-600' : 'text-red-500'} mb-2 text-lg">${isAnswerCorrect ? '分析成功！' : '分析失敗...'}</h3>
                            <div class="mb-4 text-sm bg-gray-50 dark:bg-slate-700 p-2 rounded">
                                <div class="flex justify-between mb-1"><span class="text-gray-500 text-xs">相関係数 (r)</span><span class="font-mono font-bold">${r.toFixed(2)}</span></div>
                                <div class="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">判定: ${MathUtils.getCorrelationStrength(r)}</div>
                            </div>
                            <p class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">${isAnswerCorrect ? currentDrill.causationNote : 'ヒント：指定された相関関係が見つかりません。軸の組み合わせを変えてみましょう。'}</p>
                            ${isAnswerCorrect && !completedDrills.includes(currentDrill.id) && html`<div class="mt-4 text-center text-xs text-green-500 font-bold">クリア記録を保存しました</div>`}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
};

/**
 * 相関マスターモード (MasterMode)
 */
const MasterMode = ({ onExit, highScore, onUpdateScore }) => {
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
        let slope = 0; let noiseLevel = 0;
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
        let sumXY = 0; let sumXX = 0; let sumYY = 0;
        data.forEach(p => {
            sumXY += (p.x - meanX) * (p.y - meanY);
            sumXX += (p.x - meanX) ** 2;
            sumYY += (p.y - meanY) ** 2;
        });
        const covariance = sumXY / n;
        const stdDevX = Math.sqrt(sumXX / n);
        const stdDevY = Math.sqrt(sumYY / n);
        const denominator = (stdDevX * stdDevY);
        const r = denominator === 0 ? 0 : covariance / denominator;
        return { data, r };
    };

    useEffect(() => {
        if (phase === 'practice' || phase === 'game_start') {
            setCurrentData(generateData());
            setUserGuess(0);
            if (phase === 'game_start') setPhase('playing');
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'finished') {
            if (onUpdateScore) onUpdateScore(score);
        }
    }, [phase, score]);

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
            setRound(1); setScore(0); setHistory([]); setPhase('game_start');
        } else if (phase === 'result') {
            if (round >= TOTAL_ROUNDS) {
                setPhase('finished');
            } else {
                setRound(prev => prev + 1); setCurrentData(generateData()); setUserGuess(0); setPhase('playing');
            }
        }
    };

    const handleRetry = () => { setRound(1); setScore(0); setHistory([]); setPhase('game_start'); };

    if (phase === 'intro') {
        return html`
            <div class="h-full flex flex-col items-center justify-center p-4 animate-fade-in-up bg-indigo-50 dark:bg-slate-900">
                <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border-2 border-indigo-200">
                    <button onClick=${onExit} class="absolute top-4 left-4 text-gray-400 hover:text-gray-600">⬅ 戻る</button>
                    <div class="text-6xl mb-4 animate-bounce-slow">👑</div>
                    <h2 class="text-3xl font-black text-indigo-800 dark:text-indigo-300 mb-2">相関マスターモード</h2>
                    <p class="text-gray-600 dark:text-slate-400 mb-6 font-bold text-sm">散布図を見て、<span class="text-indigo-600 dark:text-indigo-400 font-black text-lg">相関係数（r）</span>を目視で当ててください！</p>
                    ${highScore > 0 && html`<div class="bg-yellow-100 border border-yellow-300 rounded-lg p-2 mb-6 animate-pulse"><div class="text-xs text-yellow-700 font-bold">YOUR BEST SCORE</div><div class="text-2xl font-black text-yellow-600">${highScore} pts</div></div>`}
                    <button onClick=${() => setPhase('practice')} class="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-all">練習問題へ進む ➡</button>
                </div>
            </div>
        `;
    }

    if (phase === 'finished') {
        const isSRank = score >= 450;
        return html`
            <div class="h-full flex flex-col items-center justify-center p-4 animate-fade-in-up">
                ${isSRank && html`<${SimpleConfetti} />`}
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border-2 border-indigo-500 relative">
                    <h2 class="text-2xl font-black text-gray-800 dark:text-white mb-2">RESULT</h2>
                    <div class="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-2">${score} <span class="text-xl">pts</span></div>
                    <div class="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto text-sm">
                        <table class="w-full text-left">
                            <thead class="text-gray-500 dark:text-slate-400 border-b dark:border-slate-600"><tr><th>Round</th><th>正解</th><th>予想</th><th>Pts</th></tr></thead>
                            <tbody class="text-gray-700 dark:text-slate-200">
                                ${history.map((h, i) => html`<tr key=${i} class="border-b dark:border-slate-700/50"><td class="py-1">${h.round}</td><td class="font-mono font-bold">${h.r.toFixed(2)}</td><td class="font-mono">${h.guess.toFixed(2)}</td><td class="font-bold text-indigo-600 dark:text-indigo-400">+${h.points}</td></tr>`)}
                            </tbody>
                        </table>
                    </div>
                    <div class="flex gap-3">
                        <button onClick=${onExit} class="flex-1 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-300">終了</button>
                        <button onClick=${handleRetry} class="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700">もう一度挑戦</button>
                    </div>
                </div>
            </div>
        `;
    }

    const points = (phase === 'result' || phase === 'practice_result') ? calculatePoints(currentData.r, userGuess) : 0;
    const isPerfect = points >= 90;
    
    return html`
        <div class="h-full flex flex-col p-2 md:p-4 max-w-4xl mx-auto w-full animate-fade-in-up">
            <div class="flex justify-between items-center mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div class="font-black text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    ${phase.includes('practice') ? html`<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm">PRACTICE</span>` : html`<span class="text-indigo-500 mr-2">ROUND</span>${round} <span class="text-sm text-gray-400">/ ${TOTAL_ROUNDS}</span>`}
                </div>
                ${!phase.includes('practice') && html`<div class="font-black text-xl text-gray-800 dark:text-white">SCORE: <span class="text-indigo-600 dark:text-indigo-400">${score}</span></div>`}
            </div>
            <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-inner border border-gray-200 dark:border-slate-700 p-2 md:p-6 mb-4 relative overflow-hidden flex flex-col justify-center">
                 ${currentData && html`
                    <${ResponsiveContainer} width="100%" height="100%">
                        <${ScatterChart} margin=${{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <${CartesianGrid} strokeDasharray="3 3" opacity=${0.3} />
                            <${XAxis} type="number" dataKey="x" hide domain=${['auto', 'auto']} />
                            <${YAxis} type="number" dataKey="y" hide domain=${['auto', 'auto']} />
                            <${Scatter} data=${currentData.data} fill="#8884d8">${currentData.data.map((entry, index) => html`<${Cell} key=${index} fill="#6366f1" />`)}</${Scatter}>
                            ${(phase === 'result' || phase === 'practice_result') && html`<${Line} data=${[{ x: 0, y: MathUtils.predictY(0, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).slope, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).intercept) }, { x: 100, y: MathUtils.predictY(100, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).slope, MathUtils.calculateRegression(currentData.data.map(d=>d.x), currentData.data.map(d=>d.y)).intercept) }]} dataKey="y" stroke="#f97316" strokeWidth=${3} dot=${false} isAnimationActive=${true} />`}
                        </${ScatterChart}>
                    </${ResponsiveContainer}>
                 `}
                 ${(phase === 'result' || phase === 'practice_result') && html`
                    <div class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in-up z-10 p-4">
                        ${isPerfect && html`<${SimpleConfetti} />`}
                        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border-4 ${isPerfect ? 'border-yellow-400' : 'border-indigo-500'} w-full max-w-lg text-center relative">
                            <div class="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1">正解 (r)</div>
                            <div class="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2 font-mono">${currentData.r.toFixed(2)}</div>
                            <div class="flex justify-between gap-4 text-sm border-b dark:border-slate-700 pb-4 mb-4">
                                <div class="flex-1"><div class="font-bold text-gray-400 text-xs">予想</div><div class="font-mono font-bold text-xl text-gray-800 dark:text-white">${userGuess.toFixed(2)}</div></div>
                                <div class="flex-1"><div class="font-bold text-gray-400 text-xs">誤差</div><div class="font-mono font-bold text-xl ${points > 0 ? 'text-gray-800 dark:text-white' : 'text-red-500'}">${Math.abs(currentData.r - userGuess).toFixed(2)}</div></div>
                                ${!phase.includes('practice') && html`<div class="flex-1"><div class="font-bold text-gray-400 text-xs">Pts</div><div class="font-bold text-xl ${isPerfect ? 'text-yellow-500' : 'text-orange-500'}">+${points}</div></div>`}
                            </div>
                            <button onClick=${handleNext} class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">${phase.includes('practice') ? '本番スタート！ 🔥' : (round >= TOTAL_ROUNDS ? '最終結果を見る 🏆' : '次の問題へ ➡')}</button>
                        </div>
                    </div>
                 `}
            </div>
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div class="flex flex-col gap-4">
                    <div class="flex justify-between items-center px-2">
                        <span class="font-mono text-gray-400 font-bold text-xs">-1.00</span>
                        <span class="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider w-32 text-center bg-gray-50 dark:bg-slate-900 rounded-lg py-1 border dark:border-slate-700 shadow-inner">${userGuess.toFixed(2)}</span>
                        <span class="font-mono text-gray-400 font-bold text-xs">1.00</span>
                    </div>
                    <input type="range" min="-1" max="1" step="0.01" value=${userGuess} onInput=${(e) => setUserGuess(parseFloat(e.target.value))} disabled=${phase.includes('result')} class="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    <button onClick=${handleSubmit} disabled=${phase.includes('result')} class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">決定</button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Main App Component
 */
const App = () => {
    // Mode: 'home', 'explanation', 'drill', 'extra', 'master'
    const [mode, setMode] = useState('home');
    const { state, completeDrill, completeExtraMission, updateMasterScore, resetData } = useGameState();

    const renderHome = () => html`
        <div class="h-full flex flex-col p-4 bg-gray-50 dark:bg-gray-900 animate-fade-in-up overflow-y-auto">
            <div class="text-center mb-6">
                <h1 class="text-3xl font-black text-indigo-600 dark:text-indigo-400">Data Challenge</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">データ分析・活用スキル学習アプリ</p>
            </div>

            <div class="grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full flex-1 content-start">
                
                <!-- 1. 解説モード -->
                <button onClick=${() => setMode('explanation')} 
                    class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border-b-4 border-indigo-200 dark:border-indigo-900 hover:border-indigo-400 hover:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group h-40">
                    <div class="text-5xl group-hover:scale-110 transition-transform">🎓</div>
                    <div class="font-black text-lg text-gray-700 dark:text-white">解説モード</div>
                    <div class="text-xs text-gray-400 font-bold">まずはここから！</div>
                </button>

                <!-- 2. ドリルモード -->
                <button onClick=${() => setMode('drill')} 
                    class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border-b-4 border-blue-200 dark:border-blue-900 hover:border-blue-400 hover:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group h-40 relative overflow-hidden">
                    <div class="text-5xl group-hover:scale-110 transition-transform">🔍</div>
                    <div class="font-black text-lg text-gray-700 dark:text-white relative z-10">ドリルモード</div>
                    <div class="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full relative z-10">
                        ${state.completedDrills.length} / ${DRILL_QUESTS.length} クリア
                    </div>
                </button>

                <!-- 3. 自由研究（応用）モード -->
                <button onClick=${() => setMode('extra')} 
                    class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border-b-4 border-purple-200 dark:border-purple-900 hover:border-purple-400 hover:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group h-40">
                    <div class="text-5xl group-hover:scale-110 transition-transform">🧪</div>
                    <div class="font-black text-lg text-gray-700 dark:text-white">自由研究</div>
                    <div class="text-xs text-purple-500 font-bold bg-purple-50 px-2 py-0.5 rounded-full">
                        ${state.completedExtraMissions?.length || 0} / ${EXTRA_MISSION_STAGES.length} クリア
                    </div>
                </button>

                <!-- 4. マスターモード -->
                <button onClick=${() => setMode('master')} 
                    class="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg border-b-4 border-indigo-800 hover:border-indigo-600 hover:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group h-40 col-span-2 text-white">
                    <div class="flex items-center gap-3">
                        <div class="text-5xl group-hover:rotate-12 transition-transform">👑</div>
                        <div class="text-left">
                            <div class="font-black text-2xl">マスターモード</div>
                            <div class="text-xs text-indigo-200 font-bold">上級者向け：目視で相関を当てろ！</div>
                            <div class="mt-1 inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-mono">
                                BEST: ${state.masterHighScore} pts
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            <div class="mt-8 text-center">
                <button onClick=${resetData} class="text-xs text-gray-300 hover:text-red-400 underline transition-colors">
                    データをリセット
                </button>
            </div>
        </div>
    `;

    return html`
        <div class="w-full h-full text-gray-800 dark:text-gray-200">
            ${mode === 'home' && renderHome()}
            ${mode === 'explanation' && html`<${ExplanationMode} onExit=${() => setMode('home')} />`}
            ${mode === 'drill' && html`
                <${DrillMode} 
                    completedDrills=${state.completedDrills} 
                    onComplete=${completeDrill} 
                    onExit=${() => setMode('home')} 
                />
            `}
            ${mode === 'extra' && html`
                <${ExtraMissionMode} 
                    completedMissions=${state.completedExtraMissions}
                    onComplete=${completeExtraMission}
                    onExit=${() => setMode('home')}
                />
            `}
            ${mode === 'master' && html`
                <${MasterMode} 
                    highScore=${state.masterHighScore}
                    onUpdateScore=${updateMasterScore}
                    onExit=${() => setMode('home')} 
                />
            `}
        </div>
    `;
};

const root = createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
