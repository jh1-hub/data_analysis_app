import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, CheckCircle, Search, Lightbulb, AlertCircle, Lock, Unlock, BarChart3, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GachaOverlay from './GachaOverlay';
import { CARDS } from '../data/cards';

const generateGameData = () => {
  const data = [];
  for(let i=0; i<60; i++) {
    const age = Math.floor(Math.random() * 40) + 15; // 15 to 55
    const play_time = Math.floor(100 - age * 1.5 + (Math.random() * 20 - 10)); // Negative with age
    const billing = Math.floor(play_time * 150 + (Math.random() * 3000 - 1500)); // Positive with play_time
    const friends = Math.floor(billing / 500 + (Math.random() * 6 - 3)); // Positive with billing
    const login_days = Math.floor(Math.random() * 30) + 1;
    const level = Math.floor(login_days * 2 + (Math.random() * 10 - 5)); // Positive with login_days
    const cs_tickets = Math.floor(play_time * 0.1 + (Math.random() * 4 - 2)); // Positive with play_time

    data.push({
      age,
      play_time: Math.max(0, play_time),
      billing: Math.max(0, billing),
      friends: Math.max(0, friends),
      login_days,
      level: Math.max(1, level),
      cs_tickets: Math.max(0, cs_tickets)
    });
  }
  return data;
};

const generateECData = () => {
  const data = [];
  for(let i=0; i<60; i++) {
    const age = Math.floor(Math.random() * 40) + 20; // 20 to 60
    const income = Math.floor(age * 15 + (Math.random() * 200 - 100)); // 200 to 1100
    const visit_days = Math.floor(Math.random() * 20) + 1; // 1 to 20
    const coupon = Math.floor(visit_days * 0.4 + (Math.random() * 3)); // 0 to 11
    const purchase = Math.floor(income * 10 + visit_days * 500 + (Math.random() * 4000 - 2000));
    const support = Math.floor(age * 0.08 + (Math.random() * 3)); // 1 to 7
    const review = Math.max(1, Math.min(5, 5 - support * 0.4 + (Math.random() * 1 - 0.5)));

    data.push({
      age,
      income: Math.max(0, income),
      visit_days,
      coupon: Math.max(0, coupon),
      purchase: Math.max(0, purchase),
      support: Math.max(0, support),
      review: Number(review.toFixed(1))
    });
  }
  return data;
};

const generateSchoolData = () => {
  const data = [];
  for(let i=0; i<60; i++) {
    const study_time = Math.floor(Math.random() * 180); // 0 to 180 mins
    const smartphone = Math.floor(Math.random() * 240); // 0 to 240 mins
    
    // Test score is positively correlated with study, negatively with smartphone
    const test_score = Math.floor(50 + study_time * 0.2 - smartphone * 0.1 + (Math.random() * 20 - 10));
    
    // Sleep is negatively correlated with smartphone
    const sleep_time = Math.floor(9 - smartphone * 0.01 + (Math.random() * 2 - 1));
    
    // Vision is negatively correlated with both study and smartphone
    const vision = Math.max(0.1, 1.5 - (study_time + smartphone) * 0.002 + (Math.random() * 0.4 - 0.2));
    
    const exercise = Math.floor(Math.random() * 120);
    const reading = Math.floor(Math.random() * 60);

    data.push({
      study_time,
      smartphone,
      test_score: Math.max(0, Math.min(100, test_score)),
      sleep_time: Math.max(4, Math.min(12, sleep_time)),
      vision: Number(vision.toFixed(1)),
      exercise,
      reading
    });
  }
  return data;
};

const DATASETS = {
  game: {
    id: 'game',
    name: '📱 スマホアプリ',
    description: 'スマホアプリのユーザーデータから、隠された「11の法則（相関）」を見つけ出せ！',
    generateData: generateGameData,
    columns: [
      { id: 'age', name: '年齢 (歳)' },
      { id: 'play_time', name: 'プレイ時間 (時間/月)' },
      { id: 'billing', name: '課金額 (円/月)' },
      { id: 'login_days', name: 'ログイン日数 (日/月)' },
      { id: 'friends', name: 'フレンド数 (人)' },
      { id: 'cs_tickets', name: '問い合わせ回数 (回)' },
      { id: 'level', name: 'キャラクターレベル' }
    ],
    insights: [
      { id: 1, vars: ['play_time', 'billing'], direction: 'positive', nature: 'direct', title: 'プレイ時間と課金額の正の相関', description: 'プレイ時間が長いユーザーほど、課金額も多くなる傾向があります。長く遊んでもらう工夫が売上アップに直結します。' },
      { id: 2, vars: ['age', 'play_time'], direction: 'negative', nature: 'direct', title: '年齢とプレイ時間の負の相関', description: '年齢が高いユーザーほど、プレイ時間が短くなる傾向があります。忙しい大人向けに短時間で遊べるコンテンツが必要です。' },
      { id: 3, vars: ['login_days', 'level'], direction: 'positive', nature: 'direct', title: 'ログイン日数とレベルの正の相関', description: 'ログイン日数が多いユーザーほど、キャラクターレベルが高くなっています。毎日のログインボーナスが育成の鍵です。' },
      { id: 4, vars: ['play_time', 'cs_tickets'], direction: 'positive', nature: 'direct', title: 'プレイ時間と問い合わせの正の相関', description: 'プレイ時間が長い（熱心な）ユーザーほど、バグ遭遇や要望による問い合わせが多くなる傾向があります。' },
      { id: 5, vars: ['friends', 'billing'], direction: 'positive', nature: 'direct', title: 'フレンド数と課金額の正の相関', description: 'フレンドが多いユーザーほど課金額も多い傾向があります。ソーシャル機能の強化が売上向上に繋がる可能性があります。' },
      { id: 6, vars: ['age', 'billing'], direction: 'negative', nature: 'spurious', title: '年齢と課金額の負の相関（間接的）', description: '年齢が高いほど「プレイ時間」が短いため、結果的に課金額も少なくなるという間接的な相関です。「プレイ時間」が間に隠れた要因です。' },
      { id: 7, vars: ['age', 'cs_tickets'], direction: 'negative', nature: 'spurious', title: '年齢と問い合わせの負の相関（間接的）', description: '年齢が高いほど「プレイ時間」が短いため、バグに遭遇する確率も減り、問い合わせも少なくなります。' },
      { id: 8, vars: ['age', 'friends'], direction: 'negative', nature: 'spurious', title: '年齢とフレンド数の負の相関（間接的）', description: '年齢が高いほどプレイ時間が短く課金も少ないため、フレンド数も少なくなる傾向があります。' },
      { id: 9, vars: ['play_time', 'friends'], direction: 'positive', nature: 'spurious', title: 'プレイ時間とフレンド数の正の相関（間接的）', description: 'プレイ時間が長いほど「課金額」が増え、結果的にフレンドも多くなる傾向があります。' },
      { id: 10, vars: ['billing', 'cs_tickets'], direction: 'positive', nature: 'spurious', title: '課金額と問い合わせの正の相関（疑似相関）', description: '課金額が多いユーザーは「プレイ時間」も長いため、結果的に問い合わせ回数も多くなります。「プレイ時間」が両方の原因です。' },
      { id: 11, vars: ['friends', 'cs_tickets'], direction: 'positive', nature: 'spurious', title: 'フレンド数と問い合わせの正の相関（疑似相関）', description: '一見無関係ですが、どちらも「プレイ時間が長い」ユーザーに多いため、正の相関が現れます。これも疑似相関の一種です。' }
    ]
  },
  ec: {
    id: 'ec',
    name: '🛒 ECサイト',
    description: 'オンラインショップの顧客データから、隠された「10の法則（相関）」を見つけ出せ！',
    generateData: generateECData,
    columns: [
      { id: 'age', name: '年齢 (歳)' },
      { id: 'income', name: '世帯年収 (万円)' },
      { id: 'visit_days', name: '月間訪問日数 (日)' },
      { id: 'purchase', name: '月間購入額 (円)' },
      { id: 'coupon', name: 'クーポン利用数 (回)' },
      { id: 'support', name: '問い合わせ回数 (回)' },
      { id: 'review', name: '平均レビュースコア (点)' }
    ],
    insights: [
      { id: 1, vars: ['income', 'purchase'], direction: 'positive', nature: 'direct', title: '年収と購入額の正の相関', description: '世帯年収が高いほど、購入額も大きくなる直接的な関係があります。高価格帯商品のターゲットになります。' },
      { id: 2, vars: ['visit_days', 'purchase'], direction: 'positive', nature: 'direct', title: '訪問日数と購入額の正の相関', description: 'サイトへの訪問日数が多いほど、購入額も大きくなる直接的な関係があります。再訪を促す施策が重要です。' },
      { id: 3, vars: ['age', 'income'], direction: 'positive', nature: 'direct', title: '年齢と年収の正の相関', description: '年齢が高いほど、世帯年収が高くなる傾向があります。' },
      { id: 4, vars: ['visit_days', 'coupon'], direction: 'positive', nature: 'direct', title: '訪問日数とクーポンの正の相関', description: '訪問日数が多いほど、クーポンを獲得・利用する機会が増えます。' },
      { id: 5, vars: ['support', 'review'], direction: 'negative', nature: 'direct', title: '問い合わせとレビューの負の相関', description: '問い合わせ（トラブルや不明点）が多いユーザーほど、レビュースコアが低くなります。UI改善やサポート体制の強化が必要です。' },
      { id: 6, vars: ['age', 'support'], direction: 'positive', nature: 'direct', title: '年齢と問い合わせの正の相関', description: '年齢が高い（IT操作に不慣れな可能性がある）ユーザーほど、問い合わせ回数が多くなる傾向があります。シニア向けの分かりやすい導線が求められます。' },
      { id: 7, vars: ['age', 'purchase'], direction: 'positive', nature: 'spurious', title: '年齢と購入額の正の相関（疑似相関）', description: '年齢と購入額に正の相関が見られますが、これは「年齢が高いと年収が高い」ため購入額が増えている疑似相関（間接的）です。' },
      { id: 8, vars: ['coupon', 'purchase'], direction: 'positive', nature: 'spurious', title: 'クーポンと購入額の正の相関（疑似相関）', description: 'クーポン利用数と購入額に正の相関が見られますが、これは「訪問日数が多い」熱心なユーザーが両方を行っている疑似相関です。' },
      { id: 9, vars: ['age', 'review'], direction: 'negative', nature: 'spurious', title: '年齢とレビューの負の相関（疑似相関）', description: '年齢が高いほどレビュースコアが低く見えますが、これは「年齢が高いと問い合わせ（トラブル）が多い」ためスコアが下がっている疑似相関です。' },
      { id: 10, vars: ['income', 'support'], direction: 'positive', nature: 'spurious', title: '年収と問い合わせの正の相関（疑似相関）', description: '年収と問い合わせ回数に正の相関が見られますが、これはどちらも「年齢が高い」ユーザーに多いために生じている疑似相関です。' }
    ]
  },
  school: {
    id: 'school',
    name: '🏫 学校・教育',
    description: '中学生の生活習慣データから、隠された「8つの法則（相関）」を見つけ出せ！',
    generateData: generateSchoolData,
    columns: [
      { id: 'study_time', name: '家庭学習時間 (分/日)' },
      { id: 'smartphone', name: 'スマホ利用時間 (分/日)' },
      { id: 'test_score', name: '定期テスト平均点 (点)' },
      { id: 'sleep_time', name: '睡眠時間 (時間)' },
      { id: 'vision', name: '視力' },
      { id: 'exercise', name: '運動時間 (分/日)' },
      { id: 'reading', name: '読書時間 (分/日)' }
    ],
    insights: [
      { id: 1, vars: ['study_time', 'test_score'], direction: 'positive', nature: 'direct', title: '学習時間とテストの正の相関', description: '家庭学習時間が長いほど、テストの点数が高くなる直接的な関係です。' },
      { id: 2, vars: ['smartphone', 'test_score'], direction: 'negative', nature: 'direct', title: 'スマホ時間とテストの負の相関', description: 'スマホ利用時間が長いほど、テストの点数が低くなる傾向があります。' },
      { id: 3, vars: ['smartphone', 'sleep_time'], direction: 'negative', nature: 'direct', title: 'スマホ時間と睡眠の負の相関', description: 'スマホ利用時間が長いほど、睡眠時間が削られる傾向があります。' },
      { id: 4, vars: ['study_time', 'vision'], direction: 'negative', nature: 'direct', title: '学習時間と視力の負の相関', description: '学習時間が長い（近くを見る時間が長い）ほど、視力が低下しやすい傾向があります。' },
      { id: 5, vars: ['smartphone', 'vision'], direction: 'negative', nature: 'direct', title: 'スマホ時間と視力の負の相関', description: 'スマホ利用時間が長いほど、視力が低下しやすい傾向があります。' },
      { id: 6, vars: ['sleep_time', 'test_score'], direction: 'positive', nature: 'spurious', title: '睡眠時間とテストの正の相関（疑似相関）', description: '睡眠時間が長いほど点数が高く見えますが、これは「スマホ時間が短い」生徒が睡眠も長く点数も高いという疑似相関（間接的）です。' },
      { id: 7, vars: ['vision', 'test_score'], direction: 'negative', nature: 'spurious', title: '視力とテストの負の相関（疑似相関）', description: '視力が低いほど点数が高く見えますが、これは「学習時間が長い」生徒が点数が高く視力も低いという疑似相関です。' },
      { id: 8, vars: ['study_time', 'smartphone'], direction: 'negative', nature: 'spurious', title: '学習時間とスマホの負の相関（トレードオフ）', description: '1日の時間は限られているため、スマホ時間が長い生徒は結果的に学習時間が短くなるという関係（トレードオフ）です。' }
    ]
  }
};

export default function DiscoveryPhase({ onBack, onNext, onUnlockCard }) {
  const [datasetId, setDatasetId] = useState('game');
  const [varX, setVarX] = useState('');
  const [varY, setVarY] = useState('');
  const [discoveredIds, setDiscoveredIds] = useState({ game: [], ec: [], school: [] });
  const [feedback, setFeedback] = useState(null);
  
  const [showGacha, setShowGacha] = useState(false);
  const [gachaCard, setGachaCard] = useState(null);

  const dataGame = useMemo(() => DATASETS.game.generateData(), []);
  const dataEC = useMemo(() => DATASETS.ec.generateData(), []);
  const dataSchool = useMemo(() => DATASETS.school.generateData(), []);

  const currentDataset = DATASETS[datasetId];
  const currentData = datasetId === 'game' ? dataGame : datasetId === 'ec' ? dataEC : dataSchool;
  const currentDiscovered = discoveredIds[datasetId];

  const handleDatasetChange = (newId) => {
    setDatasetId(newId);
    setVarX('');
    setVarY('');
    setFeedback(null);
  };

  const handleDeclare = (direction, nature) => {
    if (!varX || !varY || varX === varY) {
      setFeedback({ type: 'error', text: '異なる2つのデータを選択して散布図を描画してください。' });
      return;
    }

    // Check if this combination matches any hidden insight
    const matchedInsight = currentDataset.insights.find(insight => {
      const hasVars = insight.vars.includes(varX) && insight.vars.includes(varY);
      return hasVars && insight.direction === direction && insight.nature === nature;
    });

    if (matchedInsight) {
      if (currentDiscovered.includes(matchedInsight.id)) {
        setFeedback({ type: 'warning', text: 'その法則はすでに発見済みです！他の組み合わせを探しましょう。' });
      } else {
        setDiscoveredIds(prev => {
          const newDiscovered = { ...prev, [datasetId]: [...prev[datasetId], matchedInsight.id] };
          
          // Check if the current dataset is completed with this new discovery
          const isCurrentDatasetComplete = newDiscovered[datasetId].length === DATASETS[datasetId].insights.length;
          
          if (isCurrentDatasetComplete) {
            let cardIdToUnlock = null;
            if (datasetId === 'game') cardIdToUnlock = 3;
            else if (datasetId === 'ec') cardIdToUnlock = 4;
            else if (datasetId === 'school') cardIdToUnlock = 5;

            if (cardIdToUnlock) {
              const spCard = CARDS.find(c => c.id === cardIdToUnlock);
              setGachaCard(spCard);
              
              // Delay gacha appearance by 1.5 seconds to show the completion message
              setTimeout(() => {
                setShowGacha(true);
                if (onUnlockCard) onUnlockCard(cardIdToUnlock);
              }, 1500);
            }
          }
          
          return newDiscovered;
        });
        setFeedback({ type: 'success', text: `大発見！「${matchedInsight.title}」を見つけ出しました！` });
      }
    } else {
      // Check if they got the vars right but wrong type
      const wrongMatch = currentDataset.insights.find(insight => 
        insight.vars.includes(varX) && insight.vars.includes(varY)
      );
      
      if (wrongMatch) {
        if (wrongMatch.direction !== direction && wrongMatch.nature !== nature) {
          setFeedback({ type: 'error', text: '相関の「向き（正・負）」も「種類（直接・疑似）」も間違っているようです。散布図と背景要因をよく考えてみましょう。' });
        } else if (wrongMatch.direction !== direction) {
          setFeedback({ type: 'error', text: '「種類（直接・疑似）」は合っていますが、相関の「向き（正・負）」が逆のようです。散布図の傾きを確認してください。' });
        } else {
          setFeedback({ type: 'error', text: '相関の「向き（正・負）」は合っていますが、これは直接的な原因ではなく「疑似相関（または間接的）」ではないでしょうか？（あるいはその逆）' });
        }
      } else {
        setFeedback({ type: 'error', text: 'うーん、この2つのデータには明確な相関（法則）は見られないようです。別の組み合わせを試しましょう。' });
      }
    }
  };

  const isComplete = currentDiscovered.length === currentDataset.insights.length;
  const isAllComplete = discoveredIds.game.length === DATASETS.game.insights.length && 
                        discoveredIds.ec.length === DATASETS.ec.insights.length && 
                        discoveredIds.school.length === DATASETS.school.insights.length;

  const handleGachaClose = () => {
    setShowGacha(false);
    
    // Auto-transition to the next dataset or endless phase
    if (datasetId === 'game') {
      handleDatasetChange('ec');
    } else if (datasetId === 'ec') {
      handleDatasetChange('school');
    } else if (datasetId === 'school' && isAllComplete && onNext) {
      onNext();
    }
  };

  if (showGacha && gachaCard) {
    return <GachaOverlay card={gachaCard} onClose={handleGachaClose} />;
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Dataset Selector */}
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.values(DATASETS).map(ds => (
          <button
            key={ds.id}
            onClick={() => handleDatasetChange(ds.id)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
              datasetId === ds.id 
                ? 'bg-indigo-600 text-white shadow-md scale-105' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Database className="w-5 h-5" />
            {ds.name}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-500" />
            データ発掘ゲーム：{currentDataset.name}編
          </h2>
          <p className="text-slate-500 font-bold mt-1">
            {currentDataset.description}
          </p>
        </div>
        <div className="font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-2 text-lg">
          <Lightbulb className="w-6 h-6 fill-indigo-600" /> 
          発見: {currentDiscovered.length} / {currentDataset.insights.length}
        </div>
      </div>

      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border-2 border-emerald-200 p-8 rounded-3xl text-center space-y-4"
        >
          <Trophy className="w-20 h-20 mx-auto text-emerald-500 drop-shadow-md" />
          <h3 className="text-2xl font-black text-emerald-800">このデータセットの法則をすべて発見しました！</h3>
          <p className="text-emerald-700 font-bold mb-4">
            {isAllComplete ? '見事な分析力です。すべての法則を発見しました！' : '見事な分析力です。他のデータセットにも挑戦してみましょう！'}
          </p>
          {isAllComplete && onNext && (
            <button
              onClick={onNext}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all hover:-translate-y-1"
            >
              時間が余ったら…「相関チャレンジ」へ！
            </button>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500" />
              散布図メーカー
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">X軸（横）のデータ</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  value={varX}
                  onChange={(e) => setVarX(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {currentDataset.columns.map(c => (
                    <option key={c.id} value={c.id} disabled={c.id === varY}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Y軸（縦）のデータ</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  value={varY}
                  onChange={(e) => setVarY(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {currentDataset.columns.map(c => (
                    <option key={c.id} value={c.id} disabled={c.id === varX}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 h-80 flex items-center justify-center">
              {varX && varY ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      dataKey={varX} 
                      name={currentDataset.columns.find(c => c.id === varX)?.name} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      type="number" 
                      dataKey={varY} 
                      name={currentDataset.columns.find(c => c.id === varY)?.name}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Scatter data={currentData} fill="#6366f1" />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 font-bold flex flex-col items-center gap-2">
                  <BarChart3 className="w-8 h-8 opacity-50" />
                  2つのデータを選ぶと散布図が表示されます
                </div>
              )}
            </div>
          </div>

          {/* Declaration Area */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-slate-500" />
              法則を宣言する（4択）
            </h4>
            <p className="text-sm text-slate-500 font-bold mb-4">
              散布図の傾向と、その背景にある「原因」を考えて、正しい相関の種類を選んでください。
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => handleDeclare('positive', 'direct')}
                disabled={!varX || !varY}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 p-3 rounded-xl font-bold text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-base">📈 直接的な正の相関</div>
                <div className="text-xs opacity-80 mt-1">Aが増えればBも増える（直接の原因）</div>
              </button>
              <button 
                onClick={() => handleDeclare('negative', 'direct')}
                disabled={!varX || !varY}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 p-3 rounded-xl font-bold text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-base">📉 直接的な負の相関</div>
                <div className="text-xs opacity-80 mt-1">Aが増えればBは減る（直接の原因）</div>
              </button>
              <button 
                onClick={() => handleDeclare('positive', 'spurious')}
                disabled={!varX || !varY}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-2 border-orange-200 p-3 rounded-xl font-bold text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-base">🤔 疑似的な正の相関</div>
                <div className="text-xs opacity-80 mt-1">見かけ上一緒に増える（裏に別の要因）</div>
              </button>
              <button 
                onClick={() => handleDeclare('negative', 'spurious')}
                disabled={!varX || !varY}
                className="bg-teal-50 hover:bg-teal-100 text-teal-700 border-2 border-teal-200 p-3 rounded-xl font-bold text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-base">🧐 疑似的な負の相関</div>
                <div className="text-xs opacity-80 mt-1">見かけ上逆の動きをする（裏に別の要因）</div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.text}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-6 p-4 rounded-xl font-bold flex items-start gap-3 ${
                    feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                    feedback.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                  <p>{feedback.text}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel: Discovered Insights */}
        <div className="lg:col-span-1 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 px-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            隠された法則リスト
          </h4>
          
          <div className="max-h-[800px] overflow-y-auto space-y-4 pr-2 pb-4">
            {currentDataset.insights.map((insight, idx) => {
              const isDiscovered = currentDiscovered.includes(insight.id);
              return (
                <div 
                  key={insight.id}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    isDiscovered 
                      ? 'bg-white border-emerald-200 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 border-dashed'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isDiscovered ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isDiscovered ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div className={`font-black ${isDiscovered ? 'text-slate-800' : 'text-slate-400'}`}>
                      法則 {idx + 1}
                    </div>
                  </div>
                  
                  {isDiscovered ? (
                    <div className="animate-fade-in">
                      <div className="text-sm font-bold text-indigo-600 mb-1">{insight.title}</div>
                      <p className="text-xs text-slate-600 font-bold leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-slate-400 mt-2">
                      未発見（???）
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
