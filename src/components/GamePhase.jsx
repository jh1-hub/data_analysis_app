import React, { useState, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, ArrowRight, CheckCircle, RotateCcw, BookOpen, Star, BarChart3, AlertCircle, MessageSquare, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GachaOverlay from './GachaOverlay';
import { CARDS } from '../data/cards';

const generateDatasetData = (datasetId) => {
  const data = [];
  for(let i=0; i<30; i++) {
    if (datasetId === 'apparel') {
      const ad = Math.floor(Math.random() * 90) + 10;
      const temp = Math.floor(Math.random() * 30) + 5;
      const sales = Math.floor(ad * 1.5 - temp * 3 + (Math.random() * 30 - 15)) + 200;
      const emp = Math.floor(Math.random() * 40) + 10;
      const traffic = Math.floor(ad * 1.5 + (Math.random() * 20 - 10)) + 20;
      const comp = Math.floor(Math.random() * 100) + 50;
      const price = Math.floor(Math.random() * 3000) + 2000;
      const age = Math.floor(Math.random() * 30) + 20;
      data.push({ ad, sales, emp, temp, traffic, comp, price, age });
    } else if (datasetId === 'factory') {
      const training = Math.floor(Math.random() * 90) + 10;
      const machine_age = Math.floor(Math.random() * 20) + 1;
      const errors = Math.floor(100 - training * 0.8 + machine_age * 2 + (Math.random() * 20 - 10));
      const temp = Math.floor(Math.random() * 15) + 15;
      const sleep = Math.floor(Math.random() * 4) + 5;
      const volume = Math.floor(Math.random() * 4000) + 1000;
      const humidity = Math.floor(Math.random() * 50) + 30;
      const break_time = Math.floor(Math.random() * 60) + 30;
      data.push({ training, errors: Math.max(0, errors), temp, machine_age, sleep, volume, humidity, break_time });
    } else if (datasetId === 'cafe') {
      const rain = Math.floor(Math.random() * 100);
      const temp = Math.floor(Math.random() * 25) + 10;
      const coffee = Math.floor(rain * 1.5 + (Math.random() * 30 - 15)) + 50;
      const umbrella = Math.floor(rain * 2 + (Math.random() * 40 - 20)) + 10;
      const tourist = Math.floor(Math.random() * 400) + 100;
      const icecream = Math.floor(temp * 3 + (Math.random() * 20 - 10)) + 20;
      const accidents = Math.floor(rain * 0.5 + (Math.random() * 10 - 5)) + 5;
      const humidity = Math.floor(rain * 0.4 + 40 + (Math.random() * 20 - 10));
      data.push({ rain, coffee, umbrella: Math.max(0, umbrella), temp, tourist, icecream, accidents: Math.max(0, accidents), humidity });
    } else if (datasetId === 'supermarket') {
      const bgm_volume = Math.floor(Math.random() * 40) + 40;
      const flyers = Math.floor(Math.random() * 9000) + 1000;
      const customers = Math.floor(flyers * 0.05 + (Math.random() * 100 - 50)) + 200;
      const temp = Math.floor(Math.random() * 30) + 5;
      const rival_sale = Math.floor(Math.random() * 2);
      const rain = Math.floor(Math.random() * 50);
      const parking = Math.floor(Math.random() * 100);
      const wait_time = Math.floor(Math.random() * 15);
      data.push({ bgm_volume, customers, temp, flyers, rival_sale, rain, parking, wait_time });
    } else if (datasetId === 'gym') {
      const smartphone = Math.floor(Math.random() * 180) + 10;
      const sleep_score = Math.floor(100 - smartphone * 0.3 + (Math.random() * 20 - 10));
      const workout = Math.floor(Math.random() * 120);
      const protein = Math.floor(Math.random() * 100) + 20;
      const weight = Math.floor(Math.random() * 40) + 50;
      const age = Math.floor(Math.random() * 40) + 20;
      const calories = Math.floor(Math.random() * 1500) + 1500;
      const water = Math.floor(Math.random() * 3) + 1;
      data.push({ smartphone, sleep_score: Math.max(0, Math.min(100, sleep_score)), workout, protein, weight, age, calories, water });
    } else if (datasetId === 'school') {
      const grade = Math.floor(Math.random() * 6) + 1;
      const shoe_size = Math.floor(18 + grade * 1.2 + (Math.random() * 2 - 1));
      const kanji_score = Math.floor(40 + grade * 8 + (Math.random() * 20 - 10));
      const sleep = Math.floor(Math.random() * 3) + 7;
      const reading = Math.floor(Math.random() * 60);
      const pe_score = Math.floor(Math.random() * 50) + 50;
      const vision = Math.floor(Math.random() * 10) / 10 + 0.5;
      const siblings = Math.floor(Math.random() * 4);
      data.push({ grade, shoe_size, kanji_score: Math.max(0, Math.min(100, kanji_score)), sleep, reading, pe_score, vision, siblings });
    } else if (datasetId === 'explore1') {
      const wait_time = Math.floor(Math.random() * 20) + 5;
      const sales = Math.floor(1000 - wait_time * 30 + (Math.random() * 200 - 100));
      const temp = Math.floor(Math.random() * 30) + 5;
      const customers = Math.floor(sales * 0.5 + (Math.random() * 50 - 25));
      const flyers = Math.floor(Math.random() * 5000) + 1000;
      const parking = Math.floor(Math.random() * 100);
      const competitor_price = Math.floor(Math.random() * 500) + 100;
      const rain = Math.floor(Math.random() * 50);
      data.push({ wait_time, sales: Math.max(0, sales), temp, customers, flyers, parking, competitor_price, rain });
    } else if (datasetId === 'explore2') {
      const remote_days = Math.floor(Math.random() * 20);
      const satisfaction = Math.floor(40 + remote_days * 2.5 + (Math.random() * 20 - 10));
      const salary = Math.floor(Math.random() * 400) + 300;
      const overtime = Math.floor(Math.random() * 60);
      const commute = Math.floor(Math.random() * 90) + 10;
      const training = Math.floor(Math.random() * 20);
      const meetings = Math.floor(Math.random() * 30) + 5;
      const age = Math.floor(Math.random() * 40) + 20;
      data.push({ remote_days, satisfaction: Math.max(0, Math.min(100, satisfaction)), salary, overtime, commute, training, meetings, age });
    } else if (datasetId === 'explore3') {
      const load_time = Math.floor(Math.random() * 80) / 10 + 1;
      const cv_rate = Math.max(0.5, 10 - load_time * 1.2 + (Math.random() * 2 - 1));
      const page_views = Math.floor(Math.random() * 10000) + 1000;
      const bounce_rate = Math.floor(Math.random() * 40) + 40;
      const ad_spend = Math.floor(Math.random() * 50) + 10;
      const social_shares = Math.floor(Math.random() * 500);
      const blog_posts = Math.floor(Math.random() * 20);
      const email_open = Math.floor(Math.random() * 30) + 10;
      data.push({ load_time, cv_rate: Math.max(0, cv_rate), page_views, bounce_rate, ad_spend, social_shares, blog_posts, email_open });
    }
  }
  return data;
};

const missions = [
  {
    id: 1,
    datasetId: 'apparel',
    client: "アパレル会社の社長",
    avatar: "👔",
    request: "「最近、広告費を増やしているんだが、本当に売上アップにつながっているのか調べてくれないか？」",
    columns: [
      { id: 'emp', name: '従業員数 (人)' },
      { id: 'sales', name: '売上 (万円)' },
      { id: 'temp', name: '平均気温 (℃)' },
      { id: 'ad', name: '広告費 (万円)' },
      { id: 'traffic', name: 'Webアクセス数 (万回)' },
      { id: 'comp', name: '競合の売上 (万円)' },
      { id: 'price', name: '商品単価 (円)' },
      { id: 'age', name: '顧客平均年齢 (歳)' }
    ],
    conclusions: [
      { text: "広告費を増やすと売上も増える傾向があります。（正の相関）", isCorrect: true, feedback: "素晴らしい！広告費と売上の間に「正の相関」があることを突き止めましたね。社長も納得の分析です。" },
      { text: "広告費を増やすと売上が減る傾向があります。（負の相関）", isCorrect: false, feedback: "散布図をよく見てください。右肩上がりになっていますか？右肩下がりになっていますか？" },
      { text: "広告費と売上には関係がありません。（相関なし）", isCorrect: false, feedback: "点がバラバラに散らばっているわけではなく、一定の傾向（右肩上がり）が見られませんか？" }
    ],
    correctVars: ['ad', 'sales']
  },
  {
    id: 2,
    datasetId: 'apparel',
    client: "アパレル会社の社長",
    avatar: "👔",
    request: "「実は最近、暑い日ほど冬物コートの売上が落ちている気がするんだ。気温と売上の関係も調べてくれないか？」",
    columns: [
      { id: 'price', name: '商品単価 (円)' },
      { id: 'traffic', name: 'Webアクセス数 (万回)' },
      { id: 'sales', name: '売上 (万円)' },
      { id: 'age', name: '顧客平均年齢 (歳)' },
      { id: 'temp', name: '平均気温 (℃)' },
      { id: 'emp', name: '従業員数 (人)' },
      { id: 'ad', name: '広告費 (万円)' },
      { id: 'comp', name: '競合の売上 (万円)' }
    ],
    conclusions: [
      { text: "気温が上がると売上も上がる傾向があります。（正の相関）", isCorrect: false, feedback: "気温が高いほど売上が伸びていますか？グラフは右肩下がりになっているはずです。" },
      { text: "気温が上がると売上が落ちる傾向があります。（負の相関）", isCorrect: true, feedback: "お見事！気温と売上には「負の相関」があります。気温が高い日は冬物が売れないという仮説が実証されました。" },
      { text: "気温と売上には関係がありません。（相関なし）", isCorrect: false, feedback: "点がバラバラではなく、右下に向かって集まる傾向（右肩下がり）がありませんか？" }
    ],
    correctVars: ['temp', 'sales']
  },
  {
    id: 3,
    datasetId: 'supermarket',
    client: "スーパーの店長",
    avatar: "🛒",
    request: "「店内のBGMの音量を大きくすれば、お客さんのテンションが上がって客数が増えるんじゃないか？調べてくれ！」",
    columns: [
      { id: 'rain', name: '降水量 (mm)' },
      { id: 'bgm_volume', name: 'BGM音量 (dB)' },
      { id: 'parking', name: '駐車場稼働率 (%)' },
      { id: 'customers', name: '来客数 (人)' },
      { id: 'temp', name: '気温 (℃)' },
      { id: 'flyers', name: 'チラシ配布数 (枚)' },
      { id: 'rival_sale', name: '競合の特売 (有無)' },
      { id: 'wait_time', name: 'レジ待ち時間 (分)' }
    ],
    conclusions: [
      { text: "BGM音量を大きくすると客数が増えます。（正の相関）", isCorrect: false, feedback: "グラフに右肩上がりの傾向はありますか？点が全体にバラバラに散らばっていませんか？" },
      { text: "BGM音量を大きくすると客数が減ります。（負の相関）", isCorrect: false, feedback: "グラフに右肩下がりの傾向はありますか？点が全体にバラバラに散らばっていませんか？" },
      { text: "BGM音量と客数には関係がありません。（相関なし）", isCorrect: true, feedback: "冷静な分析です！BGMの音量と来客数には全く相関がありませんでした。店長の思い込みをデータで正すことができましたね。" }
    ],
    correctVars: ['bgm_volume', 'customers']
  },
  {
    id: 4,
    datasetId: 'cafe',
    client: "カフェの店長",
    avatar: "☕",
    request: "「コーヒーが売れる日は、なぜか傘もよく売れるんだ！コーヒーを大々的に宣伝すれば、傘もバカ売れするんじゃないか！？」",
    columns: [
      { id: 'tourist', name: '観光客数 (人)' },
      { id: 'coffee', name: 'コーヒー売上 (杯)' },
      { id: 'temp', name: '気温 (℃)' },
      { id: 'umbrella', name: '傘の売上 (本)' },
      { id: 'icecream', name: 'アイス売上 (個)' },
      { id: 'rain', name: '降水量 (mm)' },
      { id: 'accidents', name: '交通事故件数 (件)' },
      { id: 'humidity', name: '湿度 (%)' }
    ],
    conclusions: [
      { text: "はい、コーヒーを宣伝すれば傘も売れます！（因果関係あり）", isCorrect: false, feedback: "確かに相関はありますが、コーヒーを買うと雨が降る（傘が売れる）のでしょうか？別の要因（降水量）が両方に影響していませんか？" },
      { text: "いいえ、これは「降水量」が原因の疑似相関です。", isCorrect: true, feedback: "鋭い！コーヒーと傘の間に相関はありますが、それは「雨が降ったから（降水量）」という第3の要因（交絡因子）による疑似相関です。店長の早とちりを防ぎました！" },
      { text: "いいえ、コーヒーと傘には全く相関がありません。", isCorrect: false, feedback: "散布図を見ると、右肩上がりの傾向（相関）自体は存在しているようです。相関と因果の違いに注意しましょう。" }
    ],
    correctVars: ['coffee', 'umbrella', 'rain'],
    isSpurious: true
  },
  {
    id: 5,
    datasetId: 'explore1',
    client: "スーパーのエリアマネージャー",
    avatar: "👔",
    request: "「最近、A店の『売上』が伸び悩んでいる。様々なデータの中から、売上と最も強い『負の相関（増えると売上が減る）』を持つ悪化要因を探し出してくれ！」",
    columns: [
      { id: 'sales', name: '売上 (万円)' },
      { id: 'wait_time', name: 'レジ待ち時間 (分)' },
      { id: 'temp', name: '気温 (℃)' },
      { id: 'customers', name: '来客数 (人)' },
      { id: 'flyers', name: 'チラシ配布数 (枚)' },
      { id: 'parking', name: '駐車場稼働率 (%)' },
      { id: 'competitor_price', name: '競合店の特売品価格 (円)' },
      { id: 'rain', name: '降水量 (mm)' }
    ],
    conclusions: [
      { text: "『レジ待ち時間』が長くなるほど、売上が減る傾向があります。", isCorrect: true, feedback: "素晴らしい！レジ待ち時間が売上低下の最大の要因（負の相関）であることを突き止めました。レジの応援体制を見直すよう指示します！" },
      { text: "『競合店の特売品価格』が上がるほど、売上が減る傾向があります。", isCorrect: false, feedback: "競合店の価格と売上の散布図を見てみましょう。明らかな右肩下がりの傾向はありますか？" },
      { text: "『降水量』が増えるほど、売上が減る傾向があります。", isCorrect: false, feedback: "降水量と売上の散布図を見てみましょう。明らかな右肩下がりの傾向はありますか？" }
    ],
    correctVars: ['sales', 'wait_time'],
    isExploration: true
  }
];

export default function GamePhase({ onBack, onNext, onUnlockCard }) {
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, result
  const [missionState, setMissionState] = useState('analyze'); // analyze, feedback
  
  const [varX, setVarX] = useState('');
  const [varY, setVarY] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const [showGacha, setShowGacha] = useState(false);
  const [gachaCard, setGachaCard] = useState(null);

  const mission = missions[currentMissionIndex];
  
  // Generate data once per mission
  const missionData = useMemo(() => {
    if (!mission) return [];
    return generateDatasetData(mission.datasetId);
  }, [mission]);

  // Shuffle conclusions once per mission
  const shuffledConclusions = useMemo(() => {
    if (!mission) return [];
    const conclusions = [...mission.conclusions];
    for (let i = conclusions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [conclusions[i], conclusions[j]] = [conclusions[j], conclusions[i]];
    }
    return conclusions;
  }, [mission]);

  const handleConclusion = (idx) => {
    const selectedConclusion = shuffledConclusions[idx];
    const isCorrect = selectedConclusion.isCorrect;
    const specificFeedback = selectedConclusion.feedback;
    
    // Validate if the user has plotted the correct variables
    let hasCorrectVars = false;
    if (mission.isSpurious) {
      // For spurious correlation missions, they need to plot at least two of the key variables
      const plotted = [varX, varY];
      hasCorrectVars = plotted.every(v => mission.correctVars.includes(v));
    } else {
      // For others, they must plot exactly the two correct variables
      const plotted = [varX, varY];
      hasCorrectVars = mission.correctVars.every(v => plotted.includes(v));
    }

    if (!hasCorrectVars) {
      if (mission.isExploration) {
        setFeedback({ 
          isCorrect: false, 
          text: "正解の結論を出すには、まずその証拠となる2つのデータを散布図に表示させる必要があります。色々な組み合わせを試して、強い相関を探し出してください！" 
        });
      } else {
        setFeedback({ 
          isCorrect: false, 
          text: "結論を出す前に、依頼に関連する正しい2つのデータを選んで散布図を確認してみましょう。" 
        });
      }
      return;
    }

    if (isCorrect) {
      setScore(s => s + 100);
      setFeedback({ isCorrect: true, text: specificFeedback });
      setMissionState('feedback');
    } else {
      setFeedback({ isCorrect: false, text: specificFeedback });
    }
  };

  const nextMission = () => {
    if (currentMissionIndex + 1 < missions.length) {
      setCurrentMissionIndex(i => i + 1);
      setMissionState('analyze');
      setVarX('');
      setVarY('');
      setFeedback(null);
    } else {
      const spCard = CARDS.find(c => c.id === 2);
      setGachaCard(spCard);
      setShowGacha(true);
      if (onUnlockCard) onUnlockCard(2); // Unlock SP Card 2
    }
  };

  const startNewGame = () => {
    setCurrentMissionIndex(0);
    setGameState('playing');
    setMissionState('analyze');
    setVarX('');
    setVarY('');
    setFeedback(null);
    setScore(0);
  };

  if (showGacha && gachaCard) {
    return <GachaOverlay card={gachaCard} onClose={() => {
      setShowGacha(false);
      setGameState('result');
    }} />;
  }

  if (gameState === 'result') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-8"
      >
        <Trophy className="w-32 h-32 mx-auto text-yellow-500 drop-shadow-lg" />
        <h2 className="text-3xl font-bold text-slate-800">データアナリスト特訓 完了！</h2>
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-bold mb-2">最終スコア</p>
          <p className="text-6xl font-black text-indigo-600 mb-4">{score} <span className="text-2xl text-slate-500">pts</span></p>
          <p className="text-lg text-slate-700 font-bold">すべての依頼を見事に解決しました！<br/>あなたはもう立派なデータアナリストです。</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button onClick={startNewGame} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-md">
            <RotateCcw className="w-5 h-5" /> もう一度挑戦する
          </button>
          {onNext && (
            <button onClick={onNext} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-md">
              <Search className="w-5 h-5" /> データ発掘ゲームへ
            </button>
          )}
          <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-8 py-4 rounded-2xl font-bold transition-all shadow-sm border border-slate-200">
            <BookOpen className="w-5 h-5" /> トップへ戻る
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="font-bold text-slate-500 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            依頼を選択:
          </div>
          <select 
            value={currentMissionIndex}
            onChange={(e) => {
              setCurrentMissionIndex(Number(e.target.value));
              setMissionState('analyze');
              setVarX('');
              setVarY('');
              setFeedback(null);
            }}
            className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold outline-none cursor-pointer border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            {missions.map((m, i) => (
              <option key={m.id} value={i}>
                問{i + 1}: {m.client} ({m.isExploration ? '探索' : '基本'})
              </option>
            ))}
          </select>
        </div>
        <div className="font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 flex items-center gap-2">
          <Star className="w-5 h-5 fill-indigo-600" /> スコア: {score}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentMissionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Client Request */}
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex gap-4 items-start shadow-sm">
            <div className="text-5xl bg-white p-3 rounded-2xl shadow-sm border border-indigo-50 shrink-0">
              {mission.avatar}
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">{mission.client}からの依頼</h3>
              <p className="text-indigo-800 font-medium text-lg leading-relaxed">{mission.request}</p>
            </div>
          </div>

          {missionState === 'analyze' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel: Variable Selection */}
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-slate-500" />
                    調べるデータを選ぶ
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">横軸 (X軸) のデータ</label>
                      <select 
                        value={varX} 
                        onChange={(e) => setVarX(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 bg-slate-50"
                      >
                        <option value="">-- 選択してください --</option>
                        {mission.columns.map(col => (
                          <option key={col.id} value={col.id} disabled={col.id === varY}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 mb-2">縦軸 (Y軸) のデータ</label>
                      <select 
                        value={varY} 
                        onChange={(e) => setVarY(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-700 bg-slate-50"
                      >
                        <option value="">-- 選択してください --</option>
                        {mission.columns.map(col => (
                          <option key={col.id} value={col.id} disabled={col.id === varX}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {feedback && !feedback.isCorrect && (
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-700 text-sm font-bold flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {feedback.text}
                  </div>
                )}
              </div>

              {/* Right Panel: Visualization & Conclusion */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-[500px] flex flex-col">
                  <h4 className="font-bold text-slate-800 mb-4">散布図</h4>
                  <div className="flex-1 w-full bg-slate-50 rounded-xl border border-slate-100 p-4">
                    {varX && varY ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            type="number" 
                            dataKey={varX} 
                            name={mission.columns.find(c => c.id === varX)?.name} 
                            label={{ value: mission.columns.find(c => c.id === varX)?.name, position: 'bottom', offset: 0 }}
                          />
                          <YAxis 
                            type="number" 
                            dataKey={varY} 
                            name={mission.columns.find(c => c.id === varY)?.name} 
                            label={{ value: mission.columns.find(c => c.id === varY)?.name, angle: -90, position: 'left', offset: 0 }}
                          />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter data={missionData} fill="#6366f1" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-center px-4">
                        左のメニューからX軸とY軸のデータを選んでください
                      </div>
                    )}
                  </div>
                </div>

                {varX && varY && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"
                  >
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-slate-500" />
                      依頼への回答を選ぶ
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {shuffledConclusions.map((conc, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleConclusion(idx)}
                          className="text-left px-6 py-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 font-bold text-slate-700 transition-colors shadow-sm"
                        >
                          {conc.text}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 p-8 rounded-3xl border-2 border-emerald-200 text-center space-y-6 shadow-sm"
            >
              <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto" />
              <h3 className="text-3xl font-black text-emerald-700">分析完了！</h3>
              <p className="text-lg text-emerald-800 font-bold bg-white p-6 rounded-2xl border border-emerald-100 inline-block text-left max-w-2xl">
                {feedback.text}
              </p>
              <div>
                <button 
                  onClick={nextMission} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-md text-lg flex items-center justify-center gap-2 mx-auto"
                >
                  次の依頼へ <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
