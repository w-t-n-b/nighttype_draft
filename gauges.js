// gauges.js — 5ゲージ・プロファイル計算
// 入力: localStorage 'nightTypeAnswers' = { "1": 3, "2": -2, ... }
// 出力: 各ゲージの % + ランク名 + メタ情報

(function(){
  // ── スコアカーブ ──
  // 通常カーブ(一方向): val ∈ [-3..+3] → 0..100
  const LINEAR = {  3:100,  2:80,  1:60, '-1':40, '-2':20, '-3':0 };
  // 両極端カーブ(変態度): |val| が大きいほど高い
  const SYMMETRIC = { 3:100, 2:80, 1:20, '-1':20, '-2':80, '-3':100 };
  // メンヘラ度専用: 全体に+5〜+10%シフト(平均ユーザーがちょい高めに出る)
  const MENHERA_UP = { 3:100, 2:85, 1:70, '-1':35, '-2':15, '-3':5 };

  // ── 各ゲージ定義 ──
  // dir: 'A' = LIKE側で+, 'B' = NOPE側で+
  // curve: 'linear' or 'symmetric'
  const GAUGES = [
    {
      key: 'kink',
      name: '変態度',
      sub: '「両極に振り切る精神性」',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
      color: '#F472B6',
      colorTo: '#9B7CF8',
      curve: 'symmetric',
      questions: [
        { qid: 6,  dir: 'A' },
        { qid: 7,  dir: 'A' },
        { qid: 8,  dir: 'A' },
        { qid: 9,  dir: 'A' },
        { qid: 10, dir: 'A' },
      ],
      ranks: [
        { upTo: 20,  label: 'ただの寝具' },
        { upTo: 40,  label: '冒険ゼロのノーマル人間' },
        { upTo: 60,  label: '清楚詐欺師' },
        { upTo: 80,  label: '勘違いセックスジャンキー' },
        { upTo: 100, label: '性器摘出推奨' },
      ],
      descs: [
        '動かない、感じない、ただ敷いてあるだけ。マグロは泳ぐぶんまだマシ、陸に上がった置物。',
        '地図を持たない出不精、半径3メートルで完結する世界。',
        '看板に偽りあり、開けてびっくりの福袋。',
        '中毒者を気取る素人。',
        '性欲が振り切れて隔離が必要なレベル。',
      ],
    },
    {
      key: 'satisfaction',
      name: '顧客満足度',
      sub: '「相手を満たすホスピタリティ」',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17a3 3 0 0 1-2.12-.88l-3.06-3.06a1.5 1.5 0 0 1 0-2.12L9 7a3 3 0 0 1 2.12-.88h5.76A3 3 0 0 1 19 7l3.18 3.18a1.5 1.5 0 0 1 0 2.12L18.9 15.4a3 3 0 0 1-2.13.88H13"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/><circle cx="6" cy="18" r="2"/></svg>',
      color: '#22D3EE',
      colorTo: '#9B7CF8',
      curve: 'linear',
      questions: [
        { qid: 16, dir: 'A' },
        { qid: 17, dir: 'A' },
        { qid: 18, dir: 'A' },
        { qid: 19, dir: 'A' },
        { qid: 20, dir: 'A' },
      ],
      ranks: [
        { upTo: 20,  label: '苦情殺到案件' },
        { upTo: 40,  label: '金返せ案件' },
        { upTo: 60,  label: '無個性がんばれちゃん' },
        { upTo: 80,  label: 'リピ確定の沼' },
        { upTo: 100, label: '年間予約待ち名器' },
      ],
      descs: [
        '関わった全員をクレーマーへ変える事故物件。',
        '期待を膨らませて連れ帰り、しぼんで終わる不良債権。',
        '頑張りだけは満点、印象は白紙。可もなく不可もなく、味のしないガム。',
        'また来たくなる中毒性はある、底なしの常連製造機。',
        '一度味わえば二度と他では満足できない名店。',
      ],
    },
    {
      key: 'difficulty',
      name: 'あなたと<br>ヤる難易度',
      sub: '「気軽さvsハードルの高さ」',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1.2"/><path d="M12 17.2v1.8"/></svg>',
      color: '#a78bfa',
      colorTo: '#F472B6',
      curve: 'linear',
      questions: [
        { qid: 1,  dir: 'B' },   // NOPE「興味ない」で+
        { qid: 3,  dir: 'A' },
        { qid: 4,  dir: 'A' },
        { qid: 15, dir: 'A' },
        { qid: 17, dir: 'B' },   // NOPE「自分の好み譲らない」で+
      ],
      ranks: [
        { upTo: 20,  label: '即パコ案件・無料配布中!' },
        { upTo: 40,  label: 'てこずり0%案件' },
        { upTo: 60,  label: '中級者向けコース' },
        { upTo: 80,  label: '本命覚悟必須レベル' },
        { upTo: 100, label: '攻略不可・無限城' },
      ],
      descs: [
        '鍵のかかってない家、値札の取れた商品。安売りを通り越して、無料配布のティッシュ。',
        '抵抗ほぼゼロ、軽く押せば倒れるドミノ。酒一杯で陥落する低い障壁。',
        '難しすぎず簡単すぎず、ちょうどいい中堅の壁。数回通えば落ちる標準仕様。',
        '生半可な気持ちは即入場拒否、覚悟がないと門前払い。',
        '全方位ガードの鉄壁要塞、近づくだけで跳ね返される聖域。',
      ],
    },
    {
      key: 'menhera',
      name: 'メンヘラ度',
      sub: '「沼と愛と依存の総合値」',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="m12 13-1-1 2-2-3-2.5 2.77-2.92"/></svg>',
      color: '#db2777',
      colorTo: '#7c3aed',
      curve: 'menhera_up',
      questions: [
        { qid: 1,  dir: 'A' },
        { qid: 2,  dir: 'A' },
        { qid: 3,  dir: 'A' },
        { qid: 4,  dir: 'A' },
        { qid: 5,  dir: 'A' },
        { qid: 11, dir: 'A' },
        { qid: 12, dir: 'A' },
        { qid: 13, dir: 'A' },
        { qid: 14, dir: 'A' },
        { qid: 19, dir: 'B' },   // NOPE「自分も満たされたい」で+
      ],
      ranks: [
        { upTo: 20,  label: 'サイコパス疑惑' },
        { upTo: 40,  label: '自称サバサバ・泣き上戸予備軍' },
        { upTo: 60,  label: '猫かぶり地雷爆弾' },
        { upTo: 80,  label: '沈む船・巻き込み事故' },
        { upTo: 100, label: '入院案件' },
      ],
      descs: [
        '心が冷凍保存された無風地帯。振られても傷つかない鋼のメンタル、凪を通り越した真空。',
        'サバサバの旗を掲げた重量級。「重くないよ」の前置きがすでに重い。',
        '表面はおとなしい猫、地中には埋設済みの爆薬。踏むと即爆発。',
        '乗った相手ごと海の底へ引きずる難破船。',
        '感情のブレーキが付いてない暴走車。メンタルは豆腐どころか水。',
      ],
    },
    {
      key: 'kuzu',
      name: 'クズ度',
      sub: '「身体目当て・自分本位の総量」',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      color: '#ef4444',
      colorTo: '#7c3aed',
      curve: 'linear',
      questions: [
        { qid: 2,  dir: 'B' },
        { qid: 3,  dir: 'B' },
        { qid: 4,  dir: 'B' },
        { qid: 5,  dir: 'B' },
        { qid: 12, dir: 'B' },
        { qid: 14, dir: 'B' },
        { qid: 15, dir: 'B' },
        { qid: 17, dir: 'B' },
        { qid: 18, dir: 'B' },
      ],
      ranks: [
        { upTo: 20,  label: 'お人好し好物件' },
        { upTo: 40,  label: 'ホスト/キャバ憧れ聖人' },
        { upTo: 60,  label: '中途半端な悪人' },
        { upTo: 80,  label: '社会の弊害' },
        { upTo: 100, label: '人間卒業・関わったら負け' },
      ],
      descs: [
        '優しさが値札になって貼られた好物件、利用される前提の優良物件。',
        '悪に憧れるだけの善人、夜の世界を眺める外野。染まりたいのに染まれない、白すぎる布。',
        '悪に振り切れない器の小ささだけが救いチンピラ。しれっと二股はするが、バレると全力で泣いて逃げる。',
        '街を歩けば誰かが泣く、歩く公害。「自分クズだから」を免罪符に配り歩く確信犯。',
        '良心が化石化した完成形のクズ。異性の関係の同時進行は呼吸同然。',
      ],
    },
  ];

  function getWeight(qid){
    if(typeof questions === 'undefined') return 1;
    const q = questions.find(q => q.id === qid);
    return q ? q.weight : 1;
  }

  function scoreOne(val, dir, curve){
    if(val == null) return null;
    // dir 'B' は val を反転
    const v = (dir === 'A') ? val : -val;
    let map;
    if(curve === 'symmetric') map = SYMMETRIC;
    else if(curve === 'menhera_up') map = MENHERA_UP;
    else map = LINEAR;
    return map[v] != null ? map[v] : 50;
  }

  function calcGauge(g, answers){
    let weightedSum = 0;
    let totalWeight = 0;
    let answered = 0;
    for(const q of g.questions){
      const val = answers[q.qid];
      const w = getWeight(q.qid);
      if(val != null){
        const s = scoreOne(val, q.dir, g.curve);
        weightedSum += s * w;
        totalWeight += w;
        answered++;
      }
    }
    if(totalWeight === 0) return { percent: 0, answered: 0, total: g.questions.length };
    const percent = Math.round(weightedSum / totalWeight);
    return { percent, answered, total: g.questions.length };
  }

  function rankOf(g, percent){
    for(const r of g.ranks){
      if(percent <= r.upTo) return r.label;
    }
    return g.ranks[g.ranks.length-1].label;
  }

  function descOf(g, percent){
    // 0-20=0, 21-40=1, 41-60=2, 61-80=3, 81-100=4
    const idx = percent <= 20 ? 0 : percent <= 40 ? 1 : percent <= 60 ? 2 : percent <= 80 ? 3 : 4;
    return g.descs[idx] || '';
  }

  // 全ゲージ計算 → 表示用配列
  function computeAll(answers){
    return GAUGES.map(g => {
      const { percent, answered, total } = calcGauge(g, answers);
      return {
        key: g.key,
        name: g.name,
        sub: g.sub,
        icon: g.icon,
        color: g.color,
        colorTo: g.colorTo,
        percent,
        rank: rankOf(g, percent),
        desc: descOf(g, percent),
        answered, total,
      };
    });
  }

  window.Gauges = { computeAll };
})();
