
import React, { useState } from 'react';
import htm from 'htm';
import { 
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Line 
} from 'recharts';

const html = htm.bind(React.createElement);

/**
 * 穴埋め箇所コンポーネント
 * クリックすると答えが表示されます
 */
const WorksheetBlank = ({ answer, width = "120px" }) => {
    const [revealed, setRevealed] = useState(false);
    return html`
        <span 
            class="inline-flex items-center justify-center border-b-2 border-gray-800 px-2 mx-1 font-bold text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-all select-none print:text-black print:border-none"
            style=${{ minWidth: width, minHeight: '1.5em' }}
            onClick=${() => setRevealed(!revealed)}
            title="クリックして答えを表示/非表示"
        >
            ${revealed ? answer : html`<span class="text-gray-300 text-xs">（クリック）</span>`}
        </span>
    `;
};

/**
 * 解説用の小さな散布図コンポーネント
 */
const MiniScatter = ({ type, title }) => {
    const generateData = () => {
        const data = [];
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 100;
            let y = 50;
            if (type === 'positive') y = x + (Math.random() - 0.5) * 40;
            else if (type === 'negative') y = 100 - x + (Math.random() - 0.5) * 40;
            else y = Math.random() * 100;
            data.push({ x, y });
        }
        return data;
    };
    const data = generateData();

    return html`
        <div class="flex flex-col items-center bg-white p-2 border border-gray-200 rounded">
            <div class="h-32 w-full">
                <${ResponsiveContainer} width="100%" height="100%">
                    <${ScatterChart} margin=${{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <${XAxis} type="number" dataKey="x" hide />
                        <${YAxis} type="number" dataKey="y" hide />
                        <${Scatter} data=${data} fill=${type === 'positive' ? '#ef4444' : type === 'negative' ? '#3b82f6' : '#6b7280'} />
                    </${ScatterChart}>
                </${ResponsiveContainer}>
            </div>
            <div class="text-xs font-bold mt-1 text-gray-600">${title}</div>
        </div>
    `;
};

/**
 * デジタルワークシートモード（解説モード）
 */
export const LectureMode = ({ onExit }) => {
    return html`
        <div class="h-full flex flex-col bg-gray-100 dark:bg-slate-900 overflow-hidden">
            <!-- Header -->
            <div class="bg-white dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="bg-indigo-600 text-white px-3 py-1 rounded-full font-bold text-sm">授業プリント</div>
                    <h1 class="font-black text-lg text-gray-800 dark:text-white">23 データの活用：相関と回帰分析</h1>
                </div>
                <button onClick=${onExit} class="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-700 dark:text-white rounded-lg font-bold text-sm transition-colors">
                    閉じる
                </button>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto p-4 md:p-8">
                <div class="max-w-4xl mx-auto bg-white min-h-screen shadow-lg p-8 md:p-12 text-gray-800 print:shadow-none">
                    
                    <!-- Title Section -->
                    <div class="border-b-4 border-gray-800 pb-4 mb-8 flex justify-between items-end">
                        <div>
                            <div class="text-sm text-gray-600 mb-1">情報I next p.142～ / 最新情報I p.134～</div>
                            <h2 class="text-3xl font-black">３ 相関と回帰分析</h2>
                        </div>
                        <div class="text-right">
                            <div class="text-lg border-b border-gray-400 px-4 mb-2 inline-block min-w-[100px]">　年　　組　　番</div>
                            <div class="text-lg border-b border-gray-400 px-4 inline-block min-w-[150px]">氏名：　　　　　　</div>
                        </div>
                    </div>

                    <!-- Objectives -->
                    <div class="mb-8">
                        <h3 class="font-black text-lg mb-2">●本時の目標</h3>
                        <p class="pl-4 border-l-4 border-indigo-500 bg-indigo-50 p-2">
                            相関関係と回帰分析について理解し、データを分析する。
                        </p>
                    </div>

                    <!-- Section 1: Scatter Plot -->
                    <div class="mb-10">
                        <h3 class="font-bold text-xl border-b-2 border-gray-300 mb-4 pb-1">1. ２つのデータの関係を調べてみよう</h3>
                        <div class="bg-gray-50 p-4 rounded-xl mb-4 text-sm md:text-base leading-relaxed">
                            <div class="font-bold text-gray-600 mb-2">例：「勉強を頑張るほど、テストの点数は上がるか」「気温が上がると、アイスの売上は増えるか」</div>
                            <ul class="list-disc pl-5 space-y-2">
                                <li>
                                    <${WorksheetBlank} answer="散布図" /> ：上記のような2つのデータの関係を、「点」を使って視覚的に表したグラフ。
                                </li>
                            </ul>
                            <div class="mt-4 flex gap-4 items-center bg-white p-3 rounded-lg border border-gray-200">
                                <div class="flex-1 text-sm text-gray-600">
                                    データをグラフにすることで、数字の列だけでは気づけない「傾向」「つながり」が見えてくる。
                                </div>
                                <div class="w-1/3">
                                    <${MiniScatter} type="positive" title="勉強時間と成績の例" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: Correlation -->
                    <div class="mb-10">
                        <h3 class="font-bold text-xl border-b-2 border-gray-300 mb-4 pb-1">2. 相関関係とその種類</h3>
                        <div class="mb-4 text-sm md:text-base leading-relaxed">
                            <ul class="list-disc pl-5 space-y-4">
                                <li>
                                    <${WorksheetBlank} answer="相関関係" /> ：どちらか増え（減）れば、もう一方も増える（減る）関係のこと。
                                </li>
                                <li>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                        <div class="bg-red-50 p-3 rounded border border-red-100 text-center">
                                            <div class="h-24 mb-2"><${MiniScatter} type="positive" title="右上がりの並び" /></div>
                                            <div>一方が増えるともう一方も<br/><${WorksheetBlank} answer="増える" width="80px" />傾向</div>
                                            <div class="font-bold text-red-600 mt-1">正の相関</div>
                                        </div>
                                        <div class="bg-blue-50 p-3 rounded border border-blue-100 text-center">
                                            <div class="h-24 mb-2"><${MiniScatter} type="negative" title="右下がりの並び" /></div>
                                            <div>一方が増えるともう一方は<br/><${WorksheetBlank} answer="減る" width="80px" />傾向</div>
                                            <div class="font-bold text-blue-600 mt-1">負の相関</div>
                                        </div>
                                        <div class="bg-gray-50 p-3 rounded border border-gray-200 text-center">
                                            <div class="h-24 mb-2"><${MiniScatter} type="none" title="バラバラ" /></div>
                                            <div>お互いに関係なく増減する</div>
                                            <div class="font-bold text-gray-600 mt-1">相関なし</div>
                                        </div>
                                    </div>
                                </li>
                                <li class="mt-4">
                                    <${WorksheetBlank} answer="相関係数" /> ：相関（関係）の強さの強弱を判断する指標。
                                    <div class="text-sm text-gray-600 mt-1 pl-4">
                                        散布図の「点の集まり具合」を数字にしたもの。この数字は必ず <span class="font-bold font-mono text-lg mx-1">-1.0 ～ 1.0</span> の間に収まる。
                                    </div>
                                    <div class="mt-4 relative h-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center px-4 overflow-hidden">
                                        <div class="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-blue-500 via-gray-300 to-red-500"></div>
                                        <div class="w-full flex justify-between text-xs font-bold relative z-10">
                                            <div class="text-center"><div class="text-lg text-blue-600">-0.9</div><div>強い負</div></div>
                                            <div class="text-center"><div class="text-lg text-blue-400">-0.5</div><div>負</div></div>
                                            <div class="text-center"><div class="text-lg text-gray-500">0</div><div>なし</div></div>
                                            <div class="text-center"><div class="text-lg text-red-400">0.5</div><div>正</div></div>
                                            <div class="text-center"><div class="text-lg text-red-600">0.9</div><div>強い正</div></div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Section 3: Regression Analysis -->
                    <div class="mb-10">
                        <h3 class="font-bold text-xl border-b-2 border-gray-300 mb-4 pb-1">3. 未来を予測する分析</h3>
                        <div class="text-sm md:text-base leading-relaxed space-y-4">
                            <div>
                                <${WorksheetBlank} answer="回帰分析" /> ：データ１（ｘ軸）とデータ２（ｙ軸）に相関があるとき、その関係を式で表すことができる。
                                これを（ <${WorksheetBlank} answer="回帰" width="80px" /> ）といい、その分析をすること。
                                <br/><span class="text-sm text-gray-600">この式を使うことで、データがない部分（未来の数値など）を予測できるようになる。</span>
                            </div>
                            <div>
                                <${WorksheetBlank} answer="回帰直線" /> ：データの中心を通る線。
                            </div>
                            <div class="bg-yellow-50 p-4 border border-yellow-200 rounded-lg">
                                <span class="font-bold text-yellow-800">● <${WorksheetBlank} answer="単回帰分析" /></span>
                                <div class="mt-2">
                                    １つのデータを使って、もう１つのデータを予測するシンプルな分析。
                                    <div class="text-center my-2 text-2xl font-mono font-bold text-indigo-700">y = ax + b</div>
                                    の形の式を求めること。
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 4: Causation vs Correlation -->
                    <div class="mb-10">
                        <h3 class="font-bold text-xl border-b-2 border-gray-300 mb-4 pb-1">4. 因果関係と疑似相関（注意点）</h3>
                        <div class="text-sm md:text-base leading-relaxed space-y-6">
                            <div>
                                <${WorksheetBlank} answer="因果関係" /> ：「Aが原因でBが起きた」という関係。
                                <div class="pl-4 text-red-600 font-bold text-sm mt-1">
                                    ※（ <${WorksheetBlank} answer="相関" width="80px" /> ）があっても因果があるとは限らない。
                                </div>
                            </div>
                            
                            <div class="bg-white border-2 border-gray-200 rounded-xl p-4">
                                <div class="font-bold text-gray-700 mb-2 border-b pb-2">例）アイスの売上が多い日は、海難事故が多かった。（正の相関があった）</div>
                                <div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 my-4">
                                    <div class="text-center p-3 bg-blue-50 rounded w-32">
                                        <div class="text-2xl">🍦</div>
                                        <div class="text-xs font-bold">アイスの売上</div>
                                    </div>
                                    <div class="text-2xl text-gray-400">⇔</div>
                                    <div class="text-center p-3 bg-blue-50 rounded w-32">
                                        <div class="text-2xl">🌊</div>
                                        <div class="text-xs font-bold">海難事故</div>
                                    </div>
                                </div>
                                <div class="text-center text-sm font-bold text-red-500 mb-4">アイスには海での事故を引き起こす成分があるのか？（いや、ない）</div>

                                <div class="bg-gray-100 p-4 rounded-lg relative">
                                    <div class="text-center font-bold mb-4">本当の理由：<${WorksheetBlank} answer="疑似相関" /></div>
                                    
                                    <div class="flex justify-center items-center gap-8 relative z-10">
                                        <div class="text-center">
                                            <div class="text-4xl">☀️</div>
                                            <div class="font-bold text-yellow-600 mt-1">
                                                <${WorksheetBlank} answer="交絡因子" />
                                                <div class="text-xs text-black">(今回の場合は気温)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Arrows -->
                                    <svg class="absolute inset-0 w-full h-full pointer-events-none" style=${{top: '20px'}}>
                                        <defs>
                                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                                            </marker>
                                        </defs>
                                        <line x1="50%" y1="40%" x2="25%" y2="80%" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrowhead)" />
                                        <line x1="50%" y1="40%" x2="75%" y2="80%" stroke="#9ca3af" stroke-width="2" marker-end="url(#arrowhead)" />
                                    </svg>

                                    <div class="flex justify-between px-10 mt-8">
                                        <div class="text-xs text-center w-32">暑いから<br/>アイスが売れる</div>
                                        <div class="text-xs text-center w-32">暑いから<br/>海に行く人が増える</div>
                                    </div>
                                </div>
                                <div class="mt-4 text-sm">
                                    <span class="font-bold">● <${WorksheetBlank} answer="疑似相関" /></span> ：本当は無関係なのに、別の隠れた要因（交絡因子）の影響であたかも関係があるように見えてしまう現象。
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reflection -->
                    <div class="mt-12 pt-8 border-t-2 border-gray-200">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg">学習の振り返り</h3>
                            <div class="text-sm">
                                目標に対する達成度：
                                <span class="inline-block border border-gray-300 px-2 py-1 ml-2 rounded bg-white">
                                    よくできた ・ できた ・ ある程度できた ・ できなかった
                                </span>
                            </div>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 h-32 bg-gray-50 text-gray-400 text-sm">
                            （このプリントを通して学んだことを要約してまとめよう）
                        </div>
                    </div>

                </div>
                
                <div class="max-w-4xl mx-auto mt-8 text-center print:hidden">
                    <p class="text-gray-500 mb-4">一通り理解したら、実践問題にチャレンジしてみよう！</p>
                    <button onClick=${onExit} class="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all">
                        メニューに戻る
                    </button>
                </div>
            </div>
        </div>
    `;
};
