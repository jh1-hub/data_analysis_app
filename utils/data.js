
// データセットとクエスト定義を統合

export const DATASETS = [
    {
        id: "students",
        name: "高校生の生活習慣と成績",
        description: "ある高校のクラス（20名）における生活習慣アンケートと期末テストの結果データ。",
        columns: [
            { key: "study_time", label: "勉強時間 (分/日)", type: "number", min: 0, max: 300 },
            { key: "score", label: "テスト点数 (点)", type: "number", min: 0, max: 100 },
            { key: "smartphone_time", label: "スマホ使用時間 (分/日)", type: "number", min: 0, max: 300 },
            { key: "height", label: "身長 (cm)", type: "number", min: 150, max: 190 },
            { key: "sleep_time", label: "睡眠時間 (時間)", type: "number", min: 4, max: 10 },
            { key: "commute_time", label: "通学時間 (分)", type: "number", min: 0, max: 120 },
            { key: "gaming_time", label: "ゲーム時間 (分/日)", type: "number", min: 0, max: 300 }
        ],
        data: [
            { id: 1, study_time: 120, score: 85, smartphone_time: 60, height: 170, sleep_time: 7.5, commute_time: 30, gaming_time: 20 },
            { id: 2, study_time: 30, score: 45, smartphone_time: 240, height: 165, sleep_time: 5.0, commute_time: 15, gaming_time: 180 },
            { id: 3, study_time: 90, score: 78, smartphone_time: 90, height: 172, sleep_time: 7.0, commute_time: 45, gaming_time: 60 },
            { id: 4, study_time: 150, score: 92, smartphone_time: 45, height: 168, sleep_time: 8.0, commute_time: 20, gaming_time: 10 },
            { id: 5, study_time: 60, score: 60, smartphone_time: 150, height: 175, sleep_time: 6.5, commute_time: 60, gaming_time: 90 },
            { id: 6, study_time: 10, score: 30, smartphone_time: 280, height: 160, sleep_time: 4.5, commute_time: 25, gaming_time: 200 },
            { id: 7, study_time: 180, score: 98, smartphone_time: 20, height: 171, sleep_time: 8.5, commute_time: 50, gaming_time: 0 },
            { id: 8, study_time: 75, score: 70, smartphone_time: 100, height: 178, sleep_time: 7.0, commute_time: 10, gaming_time: 60 },
            { id: 9, study_time: 45, score: 55, smartphone_time: 180, height: 166, sleep_time: 6.0, commute_time: 40, gaming_time: 120 },
            { id: 10, study_time: 110, score: 82, smartphone_time: 70, height: 169, sleep_time: 7.5, commute_time: 35, gaming_time: 30 },
            { id: 11, study_time: 130, score: 88, smartphone_time: 50, height: 173, sleep_time: 8.0, commute_time: 15, gaming_time: 20 },
            { id: 12, study_time: 20, score: 40, smartphone_time: 220, height: 158, sleep_time: 5.5, commute_time: 55, gaming_time: 150 },
            { id: 13, study_time: 100, score: 75, smartphone_time: 80, height: 174, sleep_time: 7.2, commute_time: 20, gaming_time: 50 },
            { id: 14, study_time: 50, score: 58, smartphone_time: 160, height: 167, sleep_time: 6.0, commute_time: 30, gaming_time: 100 },
            { id: 15, study_time: 160, score: 95, smartphone_time: 30, height: 176, sleep_time: 8.2, commute_time: 45, gaming_time: 10 },
            { id: 16, study_time: 80, score: 72, smartphone_time: 110, height: 162, sleep_time: 7.0, commute_time: 25, gaming_time: 70 },
            { id: 17, study_time: 40, score: 50, smartphone_time: 190, height: 170, sleep_time: 5.8, commute_time: 60, gaming_time: 130 },
            { id: 18, study_time: 140, score: 90, smartphone_time: 55, height: 180, sleep_time: 7.8, commute_time: 10, gaming_time: 15 },
            { id: 19, study_time: 5, score: 25, smartphone_time: 300, height: 164, sleep_time: 4.0, commute_time: 5, gaming_time: 240 },
            { id: 20, study_time: 95, score: 76, smartphone_time: 95, height: 172, sleep_time: 7.0, commute_time: 30, gaming_time: 60 }
        ]
    },
    {
        id: "convenience",
        name: "コンビニエンスストアの日別データ",
        description: "ある店舗の8月の営業データ（20日間）。気象条件と売上の関係。",
        columns: [
            { key: "temperature", label: "最高気温 (℃)", type: "number", min: 20, max: 40 },
            { key: "customers", label: "来客数 (人)", type: "number", min: 200, max: 1000 },
            { key: "icecream_sales", label: "アイス売上 (個)", type: "number", min: 0, max: 200 },
            { key: "cold_drink_sales", label: "清涼飲料水売上 (本)", type: "number", min: 0, max: 500 },
            { key: "hot_coffee_sales", label: "ホットコーヒー売上 (杯)", type: "number", min: 0, max: 100 },
            { key: "umbrella_sales", label: "傘売上 (本)", type: "number", min: 0, max: 50 },
            { key: "rain", label: "降水量 (mm)", type: "number", min: 0, max: 100 }
        ],
        data: [
            { id: 1, temperature: 35.0, customers: 850, icecream_sales: 180, cold_drink_sales: 450, hot_coffee_sales: 10, umbrella_sales: 0, rain: 0 },
            { id: 2, temperature: 28.0, customers: 600, icecream_sales: 50, cold_drink_sales: 200, hot_coffee_sales: 40, umbrella_sales: 20, rain: 15 },
            { id: 3, temperature: 33.5, customers: 800, icecream_sales: 150, cold_drink_sales: 400, hot_coffee_sales: 15, umbrella_sales: 0, rain: 0 },
            { id: 4, temperature: 24.0, customers: 450, icecream_sales: 20, cold_drink_sales: 120, hot_coffee_sales: 60, umbrella_sales: 45, rain: 50 },
            { id: 5, temperature: 36.2, customers: 900, icecream_sales: 200, cold_drink_sales: 480, hot_coffee_sales: 5, umbrella_sales: 0, rain: 0 },
            { id: 6, temperature: 31.0, customers: 700, icecream_sales: 100, cold_drink_sales: 320, hot_coffee_sales: 25, umbrella_sales: 5, rain: 0 },
            { id: 7, temperature: 22.5, customers: 400, icecream_sales: 15, cold_drink_sales: 100, hot_coffee_sales: 80, umbrella_sales: 30, rain: 20 },
            { id: 8, temperature: 34.0, customers: 820, icecream_sales: 160, cold_drink_sales: 430, hot_coffee_sales: 12, umbrella_sales: 0, rain: 0 },
            { id: 9, temperature: 30.5, customers: 680, icecream_sales: 90, cold_drink_sales: 300, hot_coffee_sales: 28, umbrella_sales: 2, rain: 0 },
            { id: 10, temperature: 29.0, customers: 620, icecream_sales: 70, cold_drink_sales: 250, hot_coffee_sales: 35, umbrella_sales: 10, rain: 5 },
            { id: 11, temperature: 37.0, customers: 950, icecream_sales: 210, cold_drink_sales: 490, hot_coffee_sales: 5, umbrella_sales: 0, rain: 0 },
            { id: 12, temperature: 23.0, customers: 420, icecream_sales: 18, cold_drink_sales: 110, hot_coffee_sales: 75, umbrella_sales: 40, rain: 35 },
            { id: 13, temperature: 32.5, customers: 750, icecream_sales: 130, cold_drink_sales: 380, hot_coffee_sales: 18, umbrella_sales: 0, rain: 0 },
            { id: 14, temperature: 27.5, customers: 580, icecream_sales: 45, cold_drink_sales: 190, hot_coffee_sales: 45, umbrella_sales: 15, rain: 10 },
            { id: 15, temperature: 35.5, customers: 880, icecream_sales: 190, cold_drink_sales: 460, hot_coffee_sales: 8, umbrella_sales: 0, rain: 0 },
            { id: 16, temperature: 30.0, customers: 650, icecream_sales: 80, cold_drink_sales: 280, hot_coffee_sales: 30, umbrella_sales: 0, rain: 0 },
            { id: 17, temperature: 25.0, customers: 500, icecream_sales: 30, cold_drink_sales: 150, hot_coffee_sales: 55, umbrella_sales: 25, rain: 12 },
            { id: 18, temperature: 34.5, customers: 830, icecream_sales: 170, cold_drink_sales: 440, hot_coffee_sales: 10, umbrella_sales: 0, rain: 0 },
            { id: 19, temperature: 21.0, customers: 350, icecream_sales: 10, cold_drink_sales: 80, hot_coffee_sales: 90, umbrella_sales: 50, rain: 60 },
            { id: 20, temperature: 31.5, customers: 720, icecream_sales: 110, cold_drink_sales: 330, hot_coffee_sales: 22, umbrella_sales: 0, rain: 0 }
        ]
    },
    {
        id: "rpg_game",
        name: "RPGキャラクターのステータス",
        description: "あるRPGゲームのプレイヤーキャラクター20体のステータスデータ。",
        columns: [
            { key: "level", label: "レベル", type: "number", min: 1, max: 50 },
            { key: "hp", label: "最大HP", type: "number", min: 100, max: 5000 },
            { key: "attack", label: "攻撃力", type: "number", min: 10, max: 200 },
            { key: "speed", label: "素早さ", type: "number", min: 0, max: 100 },
            { key: "equip_weight", label: "装備重量", type: "number", min: 0, max: 100 },
            { key: "luck", label: "運", type: "number", min: 0, max: 100 }
        ],
        data: [
            { id: 1, level: 10, hp: 500, attack: 30, speed: 80, equip_weight: 10, luck: 50 },
            { id: 2, level: 45, hp: 4500, attack: 180, speed: 20, equip_weight: 90, luck: 10 },
            { id: 3, level: 25, hp: 2500, attack: 100, speed: 50, equip_weight: 50, luck: 80 },
            { id: 4, level: 5, hp: 300, attack: 15, speed: 70, equip_weight: 15, luck: 20 },
            { id: 5, level: 50, hp: 4800, attack: 195, speed: 90, equip_weight: 5, luck: 90 },
            { id: 6, level: 30, hp: 3000, attack: 120, speed: 40, equip_weight: 60, luck: 40 },
            { id: 7, level: 15, hp: 1500, attack: 60, speed: 60, equip_weight: 30, luck: 60 },
            { id: 8, level: 40, hp: 4000, attack: 160, speed: 30, equip_weight: 70, luck: 30 },
            { id: 9, level: 20, hp: 2000, attack: 80, speed: 55, equip_weight: 40, luck: 55 },
            { id: 10, level: 35, hp: 3500, attack: 140, speed: 35, equip_weight: 65, luck: 45 },
            { id: 11, level: 12, hp: 1200, attack: 45, speed: 65, equip_weight: 25, luck: 25 },
            { id: 12, level: 48, hp: 4700, attack: 190, speed: 15, equip_weight: 95, luck: 15 },
            { id: 13, level: 22, hp: 2200, attack: 90, speed: 52, equip_weight: 45, luck: 75 },
            { id: 14, level: 8, hp: 400, attack: 25, speed: 75, equip_weight: 12, luck: 85 },
            { id: 15, level: 42, hp: 4200, attack: 170, speed: 25, equip_weight: 80, luck: 5 },
            { id: 16, level: 18, hp: 1800, attack: 70, speed: 58, equip_weight: 35, luck: 95 },
            { id: 17, level: 38, hp: 3800, attack: 150, speed: 28, equip_weight: 75, luck: 35 },
            { id: 18, level: 28, hp: 2800, attack: 110, speed: 45, equip_weight: 55, luck: 65 },
            { id: 19, level: 4, hp: 250, attack: 12, speed: 85, equip_weight: 8, luck: 12 },
            { id: 20, level: 33, hp: 3300, attack: 130, speed: 38, equip_weight: 62, luck: 70 }
        ]
    },
    // --- Extra Missions (Data Cleaning & Searching) ---
    {
        id: "extra_cleaning_1",
        name: "【修正用 Lv.1】テスト結果の入力ミス",
        description: "入力ミスが含まれているデータセット。",
        columns: [
            { key: "study_time", label: "勉強時間 (分/日)", type: "number", min: 0, max: 300 },
            { key: "score", label: "テスト点数 (点)", type: "number", min: 0, max: 100 }
        ],
        data: [
            { id: 1, study_time: 120, score: 85 },
            { id: 2, study_time: 30, score: 45 },
            { id: 3, study_time: 90, score: 78 },
            { id: 4, study_time: 150, score: 92 },
            { id: 5, study_time: 60, score: 60 },
            { id: 6, study_time: 10, score: 30 },
            { id: 7, study_time: 180, score: 98 },
            { id: 8, study_time: 75, score: 70 },
            { id: 9, study_time: 45, score: 55 },
            { id: 10, study_time: 110, score: 82 },
            { id: 11, study_time: 130, score: 88 },
            { id: 12, study_time: 20, score: 40 },
            { id: 13, study_time: 100, score: 75 },
            { id: 99, study_time: 10, score: 95 },
            { id: 100, study_time: 250, score: 10 }
        ]
    },
    {
        id: "extra_selection_1",
        name: "【探索用 Lv.1】天才肌の生徒",
        description: "生徒の特性データ。",
        columns: [
            { key: "study_time", label: "勉強時間 (分/日)", type: "number", min: 0, max: 300 },
            { key: "score", label: "テスト点数 (点)", type: "number", min: 0, max: 100 }
        ],
        data: [
            { id: 1, study_time: 120, score: 85 },
            { id: 2, study_time: 130, score: 88 },
            { id: 3, study_time: 140, score: 90 },
            { id: 4, study_time: 150, score: 92 },
            { id: 5, study_time: 180, score: 98 },
            { id: 6, study_time: 30, score: 45 },
            { id: 7, study_time: 40, score: 50 },
            { id: 8, study_time: 45, score: 55 },
            { id: 9, study_time: 20, score: 40 },
            { id: 10, study_time: 10, score: 30 },
            // Targets: Low Study, High Score
            { id: 21, study_time: 20, score: 90 },
            { id: 22, study_time: 30, score: 95 },
            { id: 23, study_time: 15, score: 85 },
            // Decoys: Low Study, but Average Score (Not Genius)
            { id: 91, study_time: 25, score: 60 }, 
            { id: 92, study_time: 35, score: 65 }
        ]
    },
    {
        id: "extra_selection_2",
        name: "【探索用 Lv.2】伝説の武器",
        description: "装備と攻撃力のデータ。",
        columns: [
            { key: "equip_weight", label: "装備重量", type: "number", min: 0, max: 100 },
            { key: "attack", label: "攻撃力", type: "number", min: 10, max: 200 }
        ],
        data: [
            { id: 1, equip_weight: 80, attack: 150 },
            { id: 2, equip_weight: 90, attack: 180 },
            { id: 3, equip_weight: 70, attack: 140 },
            { id: 4, equip_weight: 85, attack: 170 },
            { id: 5, equip_weight: 95, attack: 190 },
            { id: 6, equip_weight: 20, attack: 30 },
            { id: 7, equip_weight: 15, attack: 25 },
            { id: 8, equip_weight: 30, attack: 40 },
            { id: 9, equip_weight: 25, attack: 35 },
            { id: 10, equip_weight: 10, attack: 20 },
            // Good weapons (Decoys)
            { id: 31, equip_weight: 15, attack: 140 }, // Good
            { id: 32, equip_weight: 20, attack: 150 }, // Good
            // The Legendary One (Target)
            { id: 33, equip_weight: 5, attack: 195 } // Extreme
        ]
    }
];

export const DRILL_QUESTS = [
    {
        id: 1,
        text: "【調査依頼：校長先生】\n「『身長が高い生徒ほど、テストの点数が良い』なんていう妙な噂が流れておる…。\nわしの目から見れば、単に長く勉強している生徒が良い点を取っているように思うのだが。\nデータを使って、本当に成績と関係があるのは『身長』なのか『勉強時間』なのか、ハッキリさせてくれんか！」",
        datasetId: "students",
        initialX: "height", // あえて間違った仮説(身長)を初期値に
        initialY: "score",
        targetKey: "study_time",
        validAnswers: ["study_time"], 
        explicitObjective: "成績（テスト点数）を上げるための本当の要因を探せ！",
        expectedStrength: "かなり強い正の相関がある",
        hint: "Y軸（縦）は「テスト点数」のままでOK。X軸（横）を「身長」から他の項目に変えてみよう。右上がり（正の相関）になる項目が見つかるはずだ。",
        causationNote: "【調査完了】校長先生の言う通りでした！「身長」と点数はバラバラ（無相関）ですが、「勉強時間」と点数には綺麗な右上がりの関係（正の相関）があります。噂はデマだったことが証明されました。"
    },
    {
        id: 2,
        text: "【調査依頼：生活指導の先生】\n「最近、授業中に居眠りをする生徒や、成績が急に下がった生徒が増えている気がするんだ。\n生徒への聞き取りでは『夜遅くまでスマホを見ている』という声が多いのだが…。\nスマホの使用時間が長いと、何が犠牲になっているのか？ そして成績にどう響いているのか？\n深刻な悪影響を見つけて、生徒たちに警告したいんだ！」",
        datasetId: "students",
        initialX: "smartphone_time",
        initialY: "score",
        targetKey: "smartphone_time", // スマホ時間に対して負の相関があるものを探させる
        validAnswers: ["score", "study_time", "sleep_time"],
        explicitObjective: "スマホ時間が長いと「減ってしまうもの（負の相関）」を探せ！",
        expectedStrength: "強い負の相関がある",
        hint: "X軸は「スマホ使用時間」に固定しよう。Y軸を色々変えてみて、右下がり（負の相関）になるグラフを探してほしい。成績、勉強時間、睡眠時間…どれか1つでも見つかれば証拠になる！",
        causationNote: "【調査完了】データは残酷な現実を示しました。スマホ時間が長い生徒ほど、「睡眠時間」や「勉強時間」が減り、結果として「テスト点数」も下がっています（負の相関）。これを生徒に見せれば、きっと行動を改めてくれるでしょう。"
    },
    {
        id: 3,
        text: "【調査依頼：ゲーム開発部】\n「新作RPGのバランス調整中なんだけど、テストプレイヤーから『重装備のキャラが弱すぎる』って苦情が来てるんだ。\nどうやら、重い鎧を装備すると、ある重要なステータスが下がりすぎて、敵の攻撃を避けられなくなってるみたいだ。\n装備の重さとトレードオフ（一方が上がると他方が下がる）になっているステータスを特定してくれないか？」",
        datasetId: "rpg_game",
        initialX: "equip_weight",
        initialY: "hp",
        targetKey: "equip_weight",
        validAnswers: ["speed"],
        explicitObjective: "装備重量が増えると「下がってしまう能力」を特定せよ！",
        expectedStrength: "負の相関がある", 
        hint: "X軸は「装備重量」。重い鎧を着ると、キャラクターの動きはどうなる？「素早さ」や「攻撃力」などをY軸にして確認してみよう。",
        causationNote: "【調査完了】やはり…。「装備重量」が増えるほど「素早さ」が極端に下がっています。これでは敵の攻撃を回避できません。開発チームに報告して、重装備でも最低限のスピードは確保できるように修正してもらいましょう。"
    },
    {
        id: 4,
        text: "【調査依頼：コンビニ店長】\n「もうすぐ夏本番！ 暑くなると売れる商品を見極めて、在庫をたっぷり確保しておきたいんだ。\n気温が上がると、アイスが売れるのはなんとなく分かるが、他にもっと強く売上が伸びる商品はないかな？\n気温との結びつき（相関）が一番強い商品を見つけて、発注リストに加えたい！」",
        datasetId: "convenience",
        initialX: "temperature",
        initialY: "customers",
        targetKey: "temperature",
        validAnswers: ["cold_drink_sales", "icecream_sales"], 
        explicitObjective: "気温が上がると「最も売れる（強い正の相関）」商品を探せ！",
        expectedStrength: "かなり強い正の相関がある",
        hint: "X軸は「最高気温」。Y軸を商品ごとの売上に変えてみよう。アイスも売れるけど、もっと点が一直線に並ぶ（相関が強い）飲み物があるんじゃないかな？",
        causationNote: "【調査完了】データを見ると、「清涼飲料水」が気温と非常に強い正の相関を示しています！アイス以上に、喉の渇きを潤すドリンクの需要は気温に敏感なようです。早速大量発注しましょう！"
    },
    {
        id: 5,
        text: "【調査依頼：新人アルバイト】\n「店長！大発見です！\nデータを見ていたら『アイスが売れる日ほど、水難事故（海での事故）が増える』という衝撃的な関係を見つけました！\nアイスには人を海に行かせる成分が含まれているに違いありません！\n…え？違う？ じゃあ、この2つが同時に増える『本当の理由』をデータで証明してください！」",
        datasetId: "convenience",
        initialX: "icecream_sales",
        initialY: "customers", // ダミー。ここから交絡因子を探させる
        targetKey: "icecream_sales", // 実際には交絡因子を探すのだが、システム上はY軸選択
        validAnswers: ["temperature"], // 交絡因子である「気温」を選択させたいが、scatterでは2変数しか選べないので、Yに気温を選ぶことで「アイスと気温の相関」を確認させる流れ
        explicitObjective: "アイスと事故、両方の「共通の原因（交絡因子）」となっているデータを探せ！",
        expectedStrength: "かなり強い正の相関がある",
        hint: "アイスが売れるのも、海で事故が増えるのも、ある「気象条件」のせいじゃないかな？Y軸をその条件（例：気温）に変えて、アイスとの関係を見てみよう。",
        causationNote: "【調査完了】その通り！「アイスの売上」と「気温」には強い関係があります。暑いからアイスが売れるし、暑いから海に行って事故も増える。これを『疑似相関』と言います。アイスは無実でしたね！"
    },
    {
        id: 6,
        text: "【調査依頼：統計の先生】\n「最後は難問だぞ。『相関がない（無相関）』ということを見つけるのも、立派な発見だ。\n世の中には『関係がありそうで、実は全く関係ない』ことがたくさんある。\nこのクラスのデータの中で、テストの点数とは全く関係がない（バラバラな）項目を見つけてみてくれ。」",
        datasetId: "students",
        initialX: "score",
        initialY: "study_time",
        targetKey: "score",
        validAnswers: ["height", "commute_time"],
        explicitObjective: "テスト点数と「関係がない（相関なし）」項目を探せ！",
        expectedStrength: "ほとんど相関がない",
        hint: "「通学時間」が長いと成績が下がる？「身長」が高いと有利？ 色々試して、グラフの点が丸くバラバラに散らばるものを探そう。",
        causationNote: "【調査完了】正解です！「身長」や「通学時間」のグラフは点がバラバラで、右上がりでも右下がりでもありません。これは『どちらの数値も、テストの点数には影響しない』という重要な事実を表しています。"
    }
];

export const EXTRA_MISSION_STAGES = [
    { 
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
