import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, ReferenceLine } from 'recharts';
import { generateCorrelatedData } from '../utils/dataGenerator';
import { ArrowRight, ArrowDownRight, ArrowDownLeft, ArrowUpRight, BookOpen, GraduationCap, ThermometerSun, IceCream, LifeBuoy } from 'lucide-react';

export const Step1Explanation = () => {
  const sampleData = [
    { id: 1, x: 1, y: 25 },
    { id: 2, x: 1.5, y: 20 },
    { id: 3, x: 2, y: 45 },
    { id: 4, x: 2.5, y: 40 },
    { id: 5, x: 3, y: 55 },
    { id: 6, x: 3.5, y: 65 },
    { id: 7, x: 4, y: 60 },
    { id: 8, x: 4.5, y: 85 },
    { id: 9, x: 5, y: 75 },
    { id: 10, x: 5.5, y: 90 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm">
        <h3 className="text-xl font-black text-indigo-900 mb-3 flex items-center gap-2">
          <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          散布図（さんぷず）とは？
        </h3>
        <p className="text-slate-700 leading-relaxed text-lg">
          「勉強時間」と「テストの点数」のように、2つのデータの関係を「点」で表したグラフです。<br />
          <strong className="text-indigo-600 font-black">横軸（X軸）</strong>に1つ目のデータ、<strong className="text-indigo-600 font-black">縦軸（Y軸）</strong>に2つ目のデータをとり、交わる場所に点を打ちます。
        </p>
      </div>
      
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/3">
          <h4 className="font-bold text-slate-700 mb-4 text-center">データ表</h4>
          <div className="max-h-96 overflow-y-auto rounded-lg shadow-sm border border-slate-200">
            <table className="w-full bg-white text-center relative">
              <thead className="bg-indigo-100 text-indigo-800 sticky top-0 z-10">
                <tr><th className="p-2">生徒</th><th className="p-2">勉強時間(X)</th><th className="p-2">点数(Y)</th></tr>
              </thead>
              <tbody>
                {sampleData.map(d => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="p-2">{d.id}</td><td className="p-2">{d.x}時間</td><td className="p-2">{d.y}点</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="hidden md:flex text-indigo-400">
          <ArrowRight className="w-8 h-8" />
        </div>
        
        <div className="w-full md:w-1/2 h-96 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-2 text-center">散布図</h4>
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="x" name="勉強時間" unit="h" domain={[0, 6]} />
              <YAxis type="number" dataKey="y" name="点数" unit="点" domain={[0, 100]} />
              <Scatter data={sampleData} fill="#6366f1" r={6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const Step2Explanation = () => {
  const positiveData = generateCorrelatedData(100, 0.85);
  const negativeData = generateCorrelatedData(100, -0.85);
  const noneData = generateCorrelatedData(100, 0);

  const ChartBox = ({ title, data, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
      <h4 className={`font-bold flex items-center gap-2 mb-2 ${color}`}>
        <Icon className="w-5 h-5" /> {title}
      </h4>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
            <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
            <Scatter data={data} fill="currentColor" className={color} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm">
        <h3 className="text-xl font-black text-indigo-900 mb-3 flex items-center gap-2">
          <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          相関関係（そうかんかんけい）とは？
        </h3>
        <p className="text-slate-700 leading-relaxed text-lg">
          散布図の「点の並び方」を見ると、2つのデータにどんな関係があるかが分かります。これを<strong className="text-indigo-600 font-black text-xl bg-indigo-100 px-2 py-1 rounded mx-1">相関関係</strong>と呼びます。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-rose-100 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-400"></div>
          <h4 className="font-black text-rose-800 mb-2 text-lg flex items-center gap-2"><ArrowUpRight className="w-6 h-6 text-rose-500" /> 正の相関</h4>
          <p className="text-sm text-slate-600 mb-4 text-center font-bold">一方が増えると、<br/>もう一方も増える</p>
          <div className="w-full h-48 bg-slate-50 rounded-xl p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
                <Scatter data={positiveData} fill="#f43f5e" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">例：身長 と 体重</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-400"></div>
          <h4 className="font-black text-blue-800 mb-2 text-lg flex items-center gap-2"><ArrowDownRight className="w-6 h-6 text-blue-500" /> 負の相関</h4>
          <p className="text-sm text-slate-600 mb-4 text-center font-bold">一方が増えると、<br/>もう一方は減る</p>
          <div className="w-full h-48 bg-slate-50 rounded-xl p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
                <Scatter data={negativeData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">例：標高 と 気温</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-400"></div>
          <h4 className="font-black text-slate-800 mb-2 text-lg flex items-center gap-2"><ArrowRight className="w-6 h-6 text-slate-500" /> 相関なし</h4>
          <p className="text-sm text-slate-600 mb-4 text-center font-bold">お互いに<br/>関係がない</p>
          <div className="w-full h-48 bg-slate-50 rounded-xl p-2 border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
                <Scatter data={noneData} fill="#64748b" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">例：身長 と テストの点数</div>
        </div>
      </div>
    </div>
  );
};

export const Step3Explanation = () => {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm">
        <h3 className="text-xl font-black text-indigo-900 mb-3 flex items-center gap-2">
          <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          相関係数（そうかんけいすう）
        </h3>
        <p className="text-slate-700 leading-relaxed text-lg">
          相関の強さを <strong className="text-rose-600 font-black text-xl bg-rose-100 px-2 py-1 rounded mx-1">-1.0 ～ 1.0</strong> の数字で表したものを<strong className="text-indigo-600 font-black">相関係数 (r)</strong>と呼びます。<br/>
          数字を見るだけで、グラフがどんな形をしているか想像できるようになります。
        </p>
      </div>
      
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="relative h-24 flex items-center justify-between mb-8">
          <div className="absolute w-full h-2 bg-gradient-to-r from-blue-500 via-slate-300 to-rose-500 rounded-full top-1/2 -translate-y-1/2"></div>
          
          {[
            { val: -1.0, label: '強い負', color: 'text-blue-600' },
            { val: -0.5, label: '弱い負', color: 'text-blue-400' },
            { val: 0.0, label: '相関なし', color: 'text-slate-500' },
            { val: 0.5, label: '弱い正', color: 'text-rose-400' },
            { val: 1.0, label: '強い正', color: 'text-rose-600' }
          ].map((item, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200">
              <span className={`font-mono font-bold text-lg ${item.color}`}>{item.val > 0 ? '+' : ''}{item.val.toFixed(1)}</span>
              <span className="text-xs font-bold text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {[-0.95, -0.5, 0, 0.5, 0.95].map((r, i) => (
            <div key={i} className="h-40 bg-white rounded border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                  <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
                  <Scatter data={generateCorrelatedData(100, r)} fill={r < 0 ? '#3b82f6' : r > 0 ? '#f43f5e' : '#64748b'} r={2} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Step4Explanation = () => {
  const regressionData = [
    { x: 1, y: 30 }, { x: 2, y: 40 }, { x: 3, y: 50 }, { x: 4, y: 60 }, { x: 5, y: 70 },
    { x: 1.5, y: 35 }, { x: 2.5, y: 45 }, { x: 3.5, y: 55 }, { x: 4.5, y: 65 }, { x: 5.5, y: 75 }
  ];
  const lineData = [{ x: 0, y: 20 }, { x: 7, y: 90 }];
  const predictionPoint = [{ x: 6, y: 80 }];

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm">
        <h3 className="text-xl font-black text-indigo-900 mb-3 flex items-center gap-2">
          <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
          回帰直線（かいきちょくせん）と予測
        </h3>
        <p className="text-slate-700 leading-relaxed text-lg">
          データに相関があるとき、その中心を通るような直線を引くことができます。これを<strong className="text-indigo-600 font-black text-xl bg-indigo-100 px-2 py-1 rounded mx-1">回帰直線</strong>といいます。<br/>
          この線を使うと、「データがない部分（未来の数値など）」を予測することができます。これを<strong className="text-indigo-600 font-black">回帰分析</strong>と呼びます。
        </p>
      </div>
      
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/2 h-80 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="x" domain={[0, 7]} name="勉強時間" unit="h" />
              <YAxis type="number" domain={[0, 100]} name="点数" unit="点" />
              <Scatter data={regressionData} fill="#94a3b8" name="実際のデータ" />
              <Line data={lineData} type="linear" dataKey="y" stroke="#f97316" strokeWidth={3} dot={false} name="回帰直線" />
              <Scatter data={predictionPoint} fill="#10b981" r={8} name="予測値" />
              <ReferenceLine x={6} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full md:w-1/2 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="font-bold text-orange-500 mb-2">回帰直線の役割</h4>
            <p className="text-sm text-slate-600">バラバラの点の中央を通る直線を引くことで、全体の傾向を数式（Y = aX + b）で表します。</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm">
            <h4 className="font-bold text-emerald-600 mb-2">予測ができる！</h4>
            <p className="text-sm text-slate-600">例えば「6時間勉強したら何点取れそうか？」という予測が、緑の点（80点）のように線の上から読み取れます。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Step5Explanation = () => {
  return (
    <div className="space-y-8">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-sm">
        <h3 className="text-xl font-black text-indigo-900 mb-3 flex items-center gap-2">
          <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">!</span>
          「相関関係」＝「因果関係」ではない！
        </h3>
        <p className="text-slate-700 leading-relaxed text-lg">
          データに相関があっても、<strong className="text-rose-600 font-black border-b-2 border-rose-300">「Aが原因でBが起きた（因果関係）」とは限りません。</strong><br/>
          別の隠れた要因（<strong className="text-indigo-600 font-black">交絡因子：こうらくいんし</strong>）のせいで、無関係な2つが連動しているように見える罠を<strong className="text-rose-600 font-black text-xl bg-rose-100 px-2 py-1 rounded mx-1">疑似相関（ぎじそうかん）</strong>と呼びます。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 因果関係 */}
        <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400"></div>
          <h4 className="font-black text-emerald-800 mb-8 text-lg bg-emerald-50 px-4 py-1 rounded-full">⭕️ 因果関係（本当の関係）</h4>
          
          <div className="flex items-center gap-4 w-full justify-center mb-8">
            <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border-2 border-emerald-200 text-center font-black text-slate-700 w-32 flex flex-col items-center">
              <BookOpen className="w-8 h-8 text-emerald-500 mb-2" />
              勉強時間<br/><span className="text-xs text-emerald-600 font-bold mt-1 bg-white px-2 py-0.5 rounded-full">原因</span>
            </div>
            <ArrowRight className="w-10 h-10 text-emerald-500 drop-shadow-sm" />
            <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border-2 border-emerald-200 text-center font-black text-slate-700 w-32 flex flex-col items-center">
              <GraduationCap className="w-8 h-8 text-emerald-500 mb-2" />
              テストの点数<br/><span className="text-xs text-emerald-600 font-bold mt-1 bg-white px-2 py-0.5 rounded-full">結果</span>
            </div>
          </div>
          <p className="text-base font-bold text-emerald-700 text-center bg-emerald-50 w-full py-3 rounded-xl">
            「勉強したから」点数が上がった。<br/>（直接つながっている）
          </p>
        </div>
        
        {/* 疑似相関 */}
        <div className="bg-white p-6 rounded-2xl border-2 border-rose-100 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rose-400"></div>
          <h4 className="font-black text-rose-800 mb-6 text-lg bg-rose-50 px-4 py-1 rounded-full">❌ 疑似相関（見せかけの関係）</h4>
          
          <div className="flex flex-col items-center w-full max-w-md mx-auto mb-6">
            {/* 隠れた要因 */}
            <div className="bg-rose-500 p-3 rounded-xl shadow-md border-2 border-rose-600 text-center font-black text-white w-56 mb-2 z-10 flex flex-col items-center transform hover:scale-105 transition-transform">
              <ThermometerSun className="w-8 h-8 text-white mb-1" />
              気温が高い<br/>
              <span className="text-xs text-rose-100 font-bold mt-1 bg-rose-700/50 px-2 py-0.5 rounded-full">隠れた要因（交絡因子）</span>
            </div>
            
            <div className="flex justify-between w-full px-12 sm:px-20 mb-2">
              <ArrowDownLeft className="w-10 h-10 text-rose-400 drop-shadow-sm" />
              <ArrowDownRight className="w-10 h-10 text-rose-400 drop-shadow-sm" />
            </div>
            
            <div className="flex items-center justify-between w-full gap-2">
              <div className="bg-slate-50 p-3 rounded-xl shadow-sm border-2 border-slate-200 text-center font-black text-slate-700 w-28 sm:w-32 flex flex-col items-center z-10">
                <IceCream className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mb-2" />
                <span className="text-sm sm:text-base">アイスの売上</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center relative min-w-0">
                <div className="w-full border-t-4 border-dashed border-rose-300 absolute top-1/2 -translate-y-1/2 z-0"></div>
                <div className="bg-white px-2 py-1 text-[10px] sm:text-xs font-black text-rose-500 rounded-full border-2 border-rose-200 z-10 whitespace-normal sm:whitespace-nowrap text-center shadow-sm">
                  相関があるように<br className="sm:hidden"/>見えるだけ！
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl shadow-sm border-2 border-slate-200 text-center font-black text-slate-700 w-28 sm:w-32 flex flex-col items-center z-10">
                <LifeBuoy className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 mb-2" />
                <span className="text-sm sm:text-base">水難事故の数</span>
              </div>
            </div>
          </div>
          <p className="text-base font-bold text-rose-700 text-center bg-rose-50 w-full py-3 rounded-xl">
            アイスを食べたから溺れたわけではない。<br/>
            <span className="text-rose-600 underline decoration-rose-300 decoration-2 underline-offset-2">「気温」が両方を増やしているだけ。</span>
          </p>
        </div>
      </div>
    </div>
  );
};
