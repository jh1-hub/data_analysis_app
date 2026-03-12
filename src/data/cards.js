export const CARDS = [
  // SP Cards (Obtained from clearing phases)
  { id: 1, name: '平均値', nameEn: 'Mean', icon: 'Scale', desc: 'データの合計を個数で割った値。極端な値（外れ値）に引っ張られやすい弱点がある。', flavorText: 'クラスの平均点が高いからといって、自分が赤点じゃないとは限らない。外れ値（天才）に感謝しよう。', rarity: 'SP', source: '予備学習クリア' },
  { id: 2, name: '散布図', nameEn: 'Scatter Plot', icon: 'Grip', desc: '2つのデータの関係性を視覚的に表すグラフ。相関関係を見つけるための最強の武器。', flavorText: '点と点をつなぐのは星座だけじゃない。データサイエンティストはここに宇宙を見る（ただの点です）。', rarity: 'SP', source: '特訓ドリルクリア' },
  { id: 3, name: '相関関係', nameEn: 'Correlation', icon: 'Link', desc: '片方が増えると、もう片方も増える（または減る）関係。', flavorText: '「アイスが売れるとプールで溺れる人が増える」…アイスが犯人ではない。夏という黒幕がいるのだ。', rarity: 'SP', source: 'データ発掘（スマホアプリ編）クリア' },
  { id: 11, name: '交絡因子', nameEn: 'Confounding Factor', icon: 'Users', desc: '原因と結果の両方に影響を与え、疑似相関を生み出す隠れた第3の要因。', flavorText: '名探偵が最後に指差す真犯人。こいつを見逃すと冤罪が生まれる。', rarity: 'SP', source: 'データ発掘（ECサイト編）クリア' },
  { id: 12, name: '相関係数', nameEn: 'Correlation Coefficient', icon: 'Activity', desc: '2つのデータの関係の強さを-1から1までの数値で表した指標。', flavorText: '「私たち、どれくらい相性いい？」を冷酷なまでに数値化する魔法の数字。', rarity: 'SP', source: 'データ発掘（学校・教育編）クリア' },
  
  // Normal Cards (Obtained from Gacha)
  { id: 4, name: '中央値', nameEn: 'Median', icon: 'AlignCenter', desc: 'データを大きさ順に並べたとき、ちょうど真ん中にくる値。外れ値の影響を受けにくい。', flavorText: '平均年収に絶望した若者がすがりつく、もう一つの希望の光。', rarity: 'N' },
  { id: 5, name: '最頻値', nameEn: 'Mode', icon: 'BarChart2', desc: 'データの中で最も多く現れる値。', flavorText: '「みんな持ってるよ！」と親にゲームをねだる小学生が、無意識に使っている最強の統計量。', rarity: 'N' },
  { id: 6, name: '外れ値', nameEn: 'Outlier', icon: 'AlertCircle', desc: '他のデータから極端に外れた値。', flavorText: '入力ミスか、世紀の大発見か。とりあえず除外されがちな可哀想なヤツ。', rarity: 'R' },
  { id: 7, name: '標準偏差', nameEn: 'Standard Deviation', icon: 'MoveHorizontal', desc: 'データが平均値からどれくらい散らばっているかを表す指標。', flavorText: 'これが大きいクラスの担任は、授業のレベル合わせに毎日頭を抱えている。', rarity: 'R' },
  { id: 8, name: '因果関係', nameEn: 'Causality', icon: 'ArrowRight', desc: '「Aが原因でBが起こる」という原因と結果の関係。', flavorText: '相関関係と勘違いされやすく、日々あちこちで冤罪を生み出している。', rarity: 'SR' },
  { id: 9, name: '疑似相関', nameEn: 'Spurious Correlation', icon: 'Unlink', desc: '本当は無関係なのに、第3の要因によって相関があるように見える罠。', flavorText: '「ニコラス・ケイジの映画出演数とプールでの溺死者数」が見事に一致する奇跡。', rarity: 'SR' },
  { id: 10, name: '回帰分析', nameEn: 'Regression', icon: 'TrendingUp', desc: 'データの間にある関係を数式で表し、未知のデータを予測する手法。', flavorText: '過去のデータから未来を予言する、現代の合法的な水晶玉。', rarity: 'SSR' },
  { id: 13, name: 'ヒストグラム', nameEn: 'Histogram', icon: 'BarChart', desc: 'データの散らばり具合（分布）を棒グラフのように表したもの。', flavorText: '「平均点は60点です」の裏に隠された、二極化の悲劇を暴き出す。', rarity: 'N' },
  { id: 14, name: '箱ひげ図', nameEn: 'Box Plot', icon: 'Layout', desc: 'データのばらつきを「箱」と「ひげ」で視覚的に表現したグラフ。', flavorText: '名前は可愛いが、四分位数といういかつい概念を隠し持っている。', rarity: 'R' },
  { id: 15, name: 'P値', nameEn: 'P-value', icon: 'Percent', desc: '偶然その結果が起こる確率。小さいほど「偶然ではない」と言える。', flavorText: '0.05の壁を越えられるか。研究者たちの運命を握る神のサイコロ。', rarity: 'SR' },
];
