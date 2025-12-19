
import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';
import { 
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Line, Cell 
} from 'recharts';

const html = htm.bind(React.createElement);

// --- ヘルパーコンポーネント ---

/**
 * 相関シミュレーター（スライド内埋め込み用）
 */
const CorrelationSimulator = ({ defaultR = 0.7 }) => {
    const [r, setR] = useState(defaultR);
    const [data, setData] = useState([]);

    useEffect(() => {
        const newData = [];
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 100;
            const error = (Math.random() - 0.5) * 100 * (1 - Math.abs(r)) * 1.5;
            let y = 50 + (x - 50) * r + error;
            y = Math.max(0, Math.min(100, y));
            newData.push({ x, y });
        }
        setData(newData);
    }, [r]);

    return html`
        <div class="bg-indigo-50 p-4 rounded-xl border-2 border-indigo-100 flex flex-col items-center">
            <div class="h-40 w-full mb-2 bg-white rounded border border-indigo-50">
                <${ResponsiveContainer} width="100%" height="100%">
                    <${ScatterChart} margin=${{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <${XAxis} type="number" dataKey="x" domain=${[0, 100]} hide />
                        <${YAxis} type="number" dataKey="y" domain=${[0, 100]} hide />
                        <${Scatter} data=${data} fill="#4f46e5" />
                    </${ScatterChart}>
                </${ResponsiveContainer}>
            </div>
            <div class="w-full flex items-center gap-2">
                <span class="text-xs font-bold text-gray-500">-1.0</span>
                <input 
                    type="range" min="-1" max="1" step="0.1" 
                    value=${r} 
                    onInput=${(e) => setR(parseFloat(e.target.value))}
                    class="flex-1 accent-indigo-600 h-2 bg-gray-300 rounded-lg cursor-pointer"
                />
                <span class="text-xs font-bold text-gray-500">1.0</span>
            </div>
            <div class="text-indigo-800 font-bold font-mono mt-1">r = ${r.toFixed(1)}</div>
        </div>
    `;
};

/**
 * 疑似相関のアニメーション図解
 */
const SpuriousCorrelationDemo = () => {
    const [step, setStep] = useState(0);

    return html`
        <div class="bg-white p-4 rounded-xl border-2 border-gray-200 relative h-64 w-full select-none overflow-hidden" onClick=${() => setStep((s) => (s + 1) % 3)}>
            <div class="absolute top-2 right-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full cursor-pointer">タップして進める ▶</div>
            
            <div class="flex justify-between items-center h-full px-8 relative z-10">
                <div class="text-center transition-all duration-500 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
                    <div class="text-4xl mb-2">🍦</div>
                    <div class="font-bold text-sm text-gray-700">アイスの売上</div>
                </div>
                
                <div class="text-center transition-all duration-500 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
                    <div class="text-4xl mb-2">🌊</div>
                    <div class="font-bold text-sm text-gray-700">海難事故</div>
                </div>
            </div>

            <!-- Arrow: Direct Causation (False) -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-1 bg-red-400 transition-all duration-500 ${step === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}" style=${{marginTop: '-20px'}}></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold text-xs bg-white px-1 transition-all duration-500 ${step === 0 ? 'opacity-100' : 'opacity-0'}" style=${{marginTop: '-20px'}}>
                直接の原因？
            </div>

            <!-- Hidden Factor: Temperature -->
            <div class="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}">
                <div class="text-5xl animate-pulse-slow">☀️</div>
                <div class="font-black text-yellow-600 bg-yellow-50 px-2 rounded mt-1">気温 (交絡因子)</div>
            </div>

            <!-- Arrows: Common Cause -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ${step >= 1 ? 'opacity-100' : 'opacity-0'}">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                        <path d="M0,0 L10,5 L0,10" fill="#9ca3af" />
                    </marker>
                </defs>
                <line x1="50%" y1="20%" x2="20%" y2="50%" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)" />
                <line x1="50%" y1="20%" x2="80%" y2="50%" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrow)" />
            </svg>

            <!-- Conclusion -->
            <div class="absolute bottom-4 left-0 right-0 text-center transition-all duration-500 ${step === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}">
                <div class="inline-block bg-red-100 text-red-800 font-bold px-4 py-2 rounded-lg shadow-sm border border-red-200">
                    これが「疑似相関」だ！
                </div>
            </div>
        </div>
    `;
};

/**
 * 散布図作成アニメーション
 */
const PlotBuildingDemo = () => {
    const [count, setCount] = useState(0);
    const totalPoints = 20;

    useEffect(() => {
        if (count < totalPoints) {
            const timer = setTimeout(() => setCount(c => c + 1), 200);
            return () => clearTimeout(timer);
        }
    }, [count]);

    const data = useMemo(() => {
        const d = [];
        for(let i=0; i<totalPoints; i++) {
            d.push({ x: 20 + i*4 + Math.random()*10, y: 30 + i*3 + Math.random()*20 });
        }
        return d;
    }, []);

    return html`
        <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center h-64">
            <div class="font-bold text-blue-800 mb-2 text-sm">データが「点」になっていく様子</div>
            <div class="flex-1 w-full bg-white rounded shadow-inner relative overflow-hidden">
                <${ResponsiveContainer} width="100%" height="100%">
                    <${ScatterChart} margin=${{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <${CartesianGrid} strokeDasharray="3 3" />
                        <${XAxis} type="number" dataKey="x" domain=${[0, 100]} hide />
                        <${YAxis} type="number" dataKey="y" domain=${[0, 100]} hide />
                        <${Scatter} data=${data.slice(0, count)} fill="#3b82f6" animationDuration=${300} />
                    </${ScatterChart}>
                </${ResponsiveContainer}>
                <div class="absolute bottom-2 right-2 font-mono text-xs text-gray-400">n = ${count}</div>
            </div>
            <button onClick=${() => setCount(0)} class="mt-2 text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded hover:bg-blue-300 transition-colors">もう一度見る</button>
        </div>
    `;
};

// --- スライドデータ定義 ---

const SLIDES = [
    {
        title: "はじめに：データ分析って？",
        render: () => html`
            <div class="space-y-6 animate-fade-in-up">
                <div class="text-center text-6xl mb-4">🕵️‍♀️</div>
                <p class="text-lg font-bold text-gray-700 leading-relaxed">
                    「勉強時間が増えると、成績は上がるのかな？」<br/>
                    「気温が上がると、アイスはどれくらい売れるのかな？」
                </p>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p class="text-gray-600">
                        世の中には<span class="text-indigo-600 font-black text-xl mx-1">2つの関係</span>がたくさんあります。<br/>
                        数字の表を眺めているだけでは気づけない「関係」を、<br/>
                        グラフを使って解き明かすのがこのレッスンの目的です。
                    </p>
                </div>
            </div>
        `
    },
    {
        title: "基本の「き」：散布図",
        render: () => html`
            <div class="space-y-4 animate-fade-in-up">
                <p class="font-bold text-gray-700">
                    2つのデータの関係を見るための最強の武器、それが<span class="text-blue-600 text-xl mx-1 border-b-4 border-blue-200">散布図</span>です。
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-100 p-4 rounded-lg text-sm space-y-2">
                        <div class="flex justify-between border-b border-gray-300 pb-1"><span>Aさん</span><span>勉強 2h / 70点</span></div>
                        <div class="flex justify-between border-b border-gray-300 pb-1"><span>Bさん</span><span>勉強 4h / 90点</span></div>
                        <div class="flex justify-between border-b border-gray-300 pb-1"><span>Cさん</span><span>勉強 1h / 40点</span></div>
                        <div class="text-center text-gray-500 py-2">...</div>
                        <p class="font-bold text-center mt-2">数字の羅列だとわかりにくい...</p>
                    </div>
                    <${PlotBuildingDemo} />
                </div>
                <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                    💡 1人分のデータを「1つの点」として打っていきます。<br/>
                    点が集まると、なんとなく「右上がり」などの形が見えてきませんか？
                </p>
            </div>
        `
    },
    {
        title: "関係の形：相関関係",
        render: () => html`
            <div class="space-y-6 animate-fade-in-up">
                <p class="font-bold text-gray-700">点の並び方には、大きく分けて3つのパターンがあります。</p>
                
                <div class="grid grid-cols-3 gap-2 md:gap-4">
                    <div class="bg-red-50 p-2 rounded-lg border border-red-100 text-center hover:scale-105 transition-transform cursor-default group">
                        <div class="h-20 mb-2"><${ResponsiveContainer}><${ScatterChart}><${Scatter} data=${[{x:10,y:20},{x:30,y:40},{x:50,y:60},{x:70,y:80},{x:90,y:90}]} fill="#ef4444" /></${ScatterChart}></${ResponsiveContainer}></div>
                        <div class="text-sm font-black text-red-600">正の相関</div>
                        <div class="text-xs text-red-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">一方が増えると<br/>もう一方も増える</div>
                    </div>
                    <div class="bg-blue-50 p-2 rounded-lg border border-blue-100 text-center hover:scale-105 transition-transform cursor-default group">
                        <div class="h-20 mb-2"><${ResponsiveContainer}><${ScatterChart}><${Scatter} data=${[{x:10,y:90},{x:30,y:70},{x:50,y:50},{x:70,y:30},{x:90,y:10}]} fill="#3b82f6" /></${ScatterChart}></${ResponsiveContainer}></div>
                        <div class="text-sm font-black text-blue-600">負の相関</div>
                        <div class="text-xs text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">一方が増えると<br/>もう一方は減る</div>
                    </div>
                    <div class="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center hover:scale-105 transition-transform cursor-default group">
                        <div class="h-20 mb-2"><${ResponsiveContainer}><${ScatterChart}><${Scatter} data=${[{x:10,y:50},{x:30,y:90},{x:50,y:20},{x:70,y:80},{x:90,y:40}]} fill="#9ca3af" /></${ScatterChart}></${ResponsiveContainer}></div>
                        <div class="text-sm font-black text-gray-500">相関なし</div>
                        <div class="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">関係がない<br/>バラバラ</div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                    <h4 class="font-bold text-indigo-700 mb-1">ポイント</h4>
                    <p class="text-sm text-gray-600">
                        「右肩上がり」なら<span class="font-bold text-red-500">プラス</span>の関係。<br/>
                        「右肩下がり」なら<span class="font-bold text-blue-500">マイナス</span>の関係。<br/>
                        これさえ覚えればOKです！
                    </p>
                </div>
            </div>
        `
    },
    {
        title: "関係の強さ：相関係数 (r)",
        render: () => html`
            <div class="space-y-4 animate-fade-in-up">
                <p class="text-gray-700">
                    関係の強さを数字で表したのが<span class="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">相関係数 r</span>です。<br/>
                    必ず <span class="font-mono font-bold">-1.0 〜 1.0</span> の間になります。
                </p>

                <!-- Simulator -->
                <div class="my-4">
                    <p class="text-xs text-center font-bold text-gray-400 mb-2">下のスライダーを動かして、形の変化を見てみよう！ 👇</p>
                    <${CorrelationSimulator} />
                </div>

                <ul class="text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
                    <li class="flex items-center gap-2"><span class="w-16 font-mono font-bold text-right text-red-600">1.0</span> <span class="text-gray-600">一直線の右上がり（完全な正）</span></li>
                    <li class="flex items-center gap-2"><span class="w-16 font-mono font-bold text-right text-gray-400">0.0</span> <span class="text-gray-600">バラバラ（無相関）</span></li>
                    <li class="flex items-center gap-2"><span class="w-16 font-mono font-bold text-right text-blue-600">-1.0</span> <span class="text-gray-600">一直線の右下がり（完全な負）</span></li>
                </ul>
            </div>
        `
    },
    {
        title: "未来予測：回帰分析",
        render: () => html`
            <div class="space-y-6 animate-fade-in-up">
                <p class="text-gray-700">
                    データの真ん中を通る線を引くことを<span class="font-black text-yellow-600 border-b-4 border-yellow-200">回帰分析</span>といいます。<br/>
                    この線を使えば、データがない部分も予測できます。
                </p>

                <div class="bg-white p-4 rounded-xl shadow border border-gray-200 flex flex-col items-center">
                    <div class="h-48 w-full">
                        <${ResponsiveContainer} width="100%" height="100%">
                            <${ScatterChart} margin=${{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                <${CartesianGrid} strokeDasharray="3 3" />
                                <${XAxis} type="number" dataKey="x" name="時間" label={{ value: '勉強時間', position: 'bottom' }} />
                                <${YAxis} type="number" dataKey="y" name="点数" label={{ value: '点数', angle: -90, position: 'left' }} />
                                <${Scatter} data=${[{x:1,y:20},{x:2,y:40},{x:3,y:55},{x:4,y:85}]} fill="#ccc" />
                                <${Line} type="monotone" dataKey="y" data=${[{x:0,y:0},{x:6,y:120}]} stroke="#eab308" strokeWidth=${3} dot=${false} animationDuration=${1500} />
                            </${ScatterChart}>
                        </${ResponsiveContainer}>
                    </div>
                    <div class="bg-yellow-50 px-4 py-2 rounded-full text-yellow-800 font-bold text-sm mt-2">
                        「もし5時間勉強したら...100点いけるかも？」
                    </div>
                </div>

                <p class="text-sm text-gray-500">
                    数式で書くと <span class="font-mono font-bold">y = ax + b</span>。<br/>
                    中学校で習った「一次関数」がここで役に立ちます！
                </p>
            </div>
        `
    },
    {
        title: "注意点：疑似相関の罠",
        render: () => html`
            <div class="space-y-6 animate-fade-in-up">
                <p class="text-gray-700">
                    「相関がある ＝ 原因と結果」<span class="font-black text-red-500 text-xl">ではありません！</span><br/>
                    有名な「アイスと水難事故」の例を見てみましょう。
                </p>

                <${SpuriousCorrelationDemo} />

                <div class="text-sm bg-red-50 p-4 rounded-lg border border-red-100 text-red-900 leading-relaxed">
                    <span class="font-bold">解説：</span><br/>
                    アイスが原因で事故が起きるわけではありません。<br/>
                    本当の原因は<span class="font-bold underline">「気温が高い（暑い）」</span>こと。<br/>
                    暑いからアイスが売れるし、暑いから海に行く人が増えて事故も増えるのです。<br/>
                    隠れた真犯人（交絡因子）を見逃さないようにしましょう！
                </div>
            </div>
        `
    },
    {
        title: "まとめ：データ探偵への道",
        render: () => html`
            <div class="space-y-8 animate-fade-in-up text-center">
                <div class="text-8xl mb-4 animate-bounce-slow">🎓</div>
                <h3 class="text-2xl font-black text-indigo-700">解説完了！</h3>
                
                <div class="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-3">
                    <p>✅ <span class="font-bold">散布図</span>で形を見る</p>
                    <p>✅ <span class="font-bold">相関関係</span>（正・負）を見極める</p>
                    <p>✅ <span class="font-bold">回帰分析</span>で未来を予測する</p>
                    <p>✅ <span class="font-bold">疑似相関</span>に騙されない</p>
                </div>

                <p class="font-bold text-gray-600">
                    知識はバッチリです。<br/>
                    さあ、「ドリルモード」で実際の依頼を解決しに行きましょう！
                </p>
            </div>
        `
    }
];

/**
 * メイン: 解説モード
 */
export const LectureMode = ({ onExit }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = SLIDES.length;

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) setCurrentSlide(c => c + 1);
        else onExit();
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(c => c - 1);
    };

    const SlideContent = SLIDES[currentSlide].render;

    return html`
        <div class="h-full flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <!-- Header -->
            <div class="bg-white dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shadow-sm shrink-0 z-20">
                <div class="flex items-center gap-3">
                    <button onClick=${onExit} class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h1 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span class="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">LECTURE</span>
                        ${SLIDES[currentSlide].title}
                    </h1>
                </div>
                <div class="text-sm font-mono font-bold text-gray-400">
                    ${currentSlide + 1} / ${totalSlides}
                </div>
            </div>

            <!-- Slide Area -->
            <div class="flex-1 overflow-y-auto relative">
                <div class="max-w-3xl mx-auto p-4 md:p-8 pb-32 min-h-full flex flex-col justify-center">
                    <${SlideContent} />
                </div>
            </div>

            <!-- Footer Navigation -->
            <div class="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button 
                    onClick=${prevSlide} 
                    disabled=${currentSlide === 0}
                    class="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    前へ
                </button>

                <div class="flex gap-2">
                    ${SLIDES.map((_, i) => html`
                        <div key=${i} class="w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-indigo-600 scale-125' : 'bg-gray-300'}"></div>
                    `)}
                </div>

                <button 
                    onClick=${nextSlide} 
                    class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 transition-all flex items-center gap-2"
                >
                    ${currentSlide === totalSlides - 1 ? '完了！' : '次へ'}
                    ${currentSlide !== totalSlides - 1 && html`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>`}
                </button>
            </div>
        </div>
    `;
};
