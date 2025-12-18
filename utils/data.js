
// プリセットデータセット定義

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
    // --- Extra Missions (Data Cleaning) ---
    {
        id: "extra_cleaning_1",
        name: "【修正用 Lv.1】テスト結果の入力ミス",
        description: "先生が入力ミスをしてしまったデータ。勉強時間と点数の関係がおかしいデータを見つけよう。",
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
        id: "extra_cleaning_2",
        name: "【修正用 Lv.2】コンビニ発注ミス？",
        description: "気温と「冷たい飲み物」の売上データ。暑いのに売れてない日がある…？",
        columns: [
            { key: "temperature", label: "最高気温 (℃)", type: "number", min: 20, max: 40 },
            { key: "cold_drink_sales", label: "清涼飲料水売上 (本)", type: "number", min: 0, max: 500 }
        ],
        data: [
            { id: 1, temperature: 35.0, cold_drink_sales: 450 },
            { id: 2, temperature: 28.0, cold_drink_sales: 200 },
            { id: 3, temperature: 33.5, cold_drink_sales: 400 },
            { id: 4, temperature: 24.0, cold_drink_sales: 120 },
            { id: 5, temperature: 36.2, cold_drink_sales: 480 },
            { id: 6, temperature: 31.0, cold_drink_sales: 320 },
            { id: 7, temperature: 22.5, cold_drink_sales: 100 },
            { id: 8, temperature: 34.0, cold_drink_sales: 430 },
            { id: 9, temperature: 30.5, cold_drink_sales: 300 },
            { id: 10, temperature: 29.0, cold_drink_sales: 250 },
            { id: 11, temperature: 37.0, cold_drink_sales: 490 },
            { id: 12, temperature: 23.0, cold_drink_sales: 110 },
            { id: 13, temperature: 32.5, cold_drink_sales: 380 },
            { id: 14, temperature: 27.5, cold_drink_sales: 190 },
            { id: 98, temperature: 38.0, cold_drink_sales: 50 },
            { id: 99, temperature: 21.0, cold_drink_sales: 450 }
        ]
    },
    {
        id: "extra_cleaning_3",
        name: "【修正用 Lv.3】ゲームのバグ報告",
        description: "レベルと「最大HP」のデータ。レベルが高いのにHPが低いキャラがいるみたいだ。",
        columns: [
            { key: "level", label: "レベル", type: "number", min: 1, max: 50 },
            { key: "hp", label: "最大HP", type: "number", min: 100, max: 5000 }
        ],
        data: [
            { id: 1, level: 10, hp: 500 },
            { id: 2, level: 45, hp: 4500 },
            { id: 3, level: 25, hp: 2500 },
            { id: 4, level: 5, hp: 300 },
            { id: 5, level: 50, hp: 4800 },
            { id: 6, level: 30, hp: 3000 },
            { id: 7, level: 15, hp: 1500 },
            { id: 8, level: 40, hp: 4000 },
            { id: 9, level: 20, hp: 2000 },
            { id: 10, level: 35, hp: 3500 },
            { id: 11, level: 12, hp: 1200 },
            { id: 12, level: 48, hp: 4700 },
            { id: 13, level: 22, hp: 2200 },
            { id: 14, level: 8, hp: 400 },
            { id: 15, level: 42, hp: 4200 },
            { id: 97, level: 49, hp: 100 },
            { id: 98, level: 1, hp: 5000 },
            { id: 99, level: 46, hp: 50 }
        ]
    }
];

export const DRILL_QUESTS = [
    {
        id: 1,
        text: "「勉強時間」と「もっとも強い正の相関がある」項目を探そう。",
        datasetId: "students",
        initialX: "study_time",
        initialY: "height",
        targetKey: "study_time",
        validAnswers: ["score"], 
        expectedStrength: "かなり強い正の相関がある",
        hint: "勉強を頑張れば頑張るほど、明確に上がる数値は？",
        causationNote: "【因果関係あり】勉強時間が増えたことが原因で、成績が上がったと考えられます。"
    },
    {
        id: 2,
        text: "「スマホ使用時間」と「もっとも強い負の相関がある」項目を探そう。",
        datasetId: "students",
        initialX: "smartphone_time",
        initialY: "height",
        targetKey: "smartphone_time",
        validAnswers: ["score"], 
        expectedStrength: "かなり強い負の相関がある",
        hint: "いくつか負の相関（右下がり）がある項目があるけど、グラフの点が一番キレイに直線に並ぶのはどれかな？",
        causationNote: "【考察】スマホの長時間利用は、睡眠時間を減らし、結果として成績を下げる原因になっている可能性があります。"
    },
    {
        id: 3,
        text: "RPGデータ：「装備重量」と「もっとも強い負の相関」がある項目は？",
        datasetId: "rpg_game",
        initialX: "equip_weight",
        initialY: "hp",
        targetKey: "equip_weight",
        validAnswers: ["speed"],
        expectedStrength: "負の相関がある", 
        hint: "重たい鎧を着ると、キャラクターの動きはどうなるかな？",
        causationNote: "【因果関係あり】装備が重いことが原因で、動くスピードが遅くなっています。"
    },
    {
        id: 4,
        text: "「最高気温」と「もっとも強い正の相関がある」飲み物はどっち？",
        datasetId: "convenience",
        initialX: "temperature",
        initialY: "customers",
        targetKey: "temperature",
        validAnswers: ["cold_drink_sales"], 
        expectedStrength: "かなり強い正の相関がある",
        hint: "暑い日に飲みたくなるのは、ホットコーヒー？それとも清涼飲料水？",
        causationNote: "【因果関係あり】気温が高いことが原因で、冷たい飲み物が売れています。"
    },
    {
        id: 5,
        text: "★難問★ 「アイス売上」と「かなり強い正の相関」がある別の商品は？",
        datasetId: "convenience",
        initialX: "icecream_sales",
        initialY: "customers",
        targetKey: "icecream_sales",
        validAnswers: ["cold_drink_sales"], 
        expectedStrength: "かなり強い正の相関がある",
        hint: "アイスが売れる暑い日は、他の冷たいものも売れているはず！",
        causationNote: "【重要：因果関係なし！】これを「擬似相関」と呼びます。"
    },
    {
        id: 6,
        text: "RPGデータ：「レベル」と「もっとも強い正の相関」があるステータスは？",
        datasetId: "rpg_game",
        initialX: "level",
        initialY: "luck",
        targetKey: "level",
        validAnswers: ["hp", "attack"], 
        expectedStrength: "かなり強い正の相関がある",
        hint: "レベルが上がると、キャラクターは全体的に強くなるよ！",
        causationNote: "【正解】レベルアップによって、HPも攻撃力も上昇するように設定されています。"
    },
    {
        id: 7,
        text: "「雨の降水量」と「もっとも強い正の相関」がある売上データは？",
        datasetId: "convenience",
        initialX: "rain",
        initialY: "icecream_sales",
        targetKey: "rain",
        validAnswers: ["umbrella_sales"],
        expectedStrength: "正の相関がある",
        hint: "雨が降ると、濡れないためにこれが必要になるよね？（ホットコーヒーも売れるけど、もっと直接関係があるよ）",
        causationNote: "【因果関係あり】雨が降ったことが原因で、傘を必要とする人が増えました。"
    },
    {
        id: 8,
        text: "「テスト点数」と「ほとんど相関がない（関係がない）」項目はどれ？",
        datasetId: "students",
        initialX: "score",
        initialY: "study_time",
        targetKey: "score",
        validAnswers: ["height", "commute_time"],
        expectedStrength: "ほとんど相関がない",
        hint: "背の高さや通学時間で、テストの点数は決まるかな？",
        causationNote: "【相関なし】これを「無相関」と呼びます。"
    }
];
