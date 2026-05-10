// questions.js — v15 4軸判定型（沼/塩 × S/M × 愛/欲 × Give/Take）
// axis: numa=沼塩, sm=SM, ai=愛欲, gt=GiveTake
// LIKE → +weight（端A方向）、NOPE → -weight（端B方向）

const questions = [
  // ── 沼/塩（Q1〜Q5）──
  {
    id: 1, axis: "numa", weight: 2,
    text: "セックスした相手のSNS、翌日チェックする？",
    like: "する。何投稿してるか気になる",
    nope: "しない。興味ない"
  },
  {
    id: 2, axis: "numa", weight: 2,
    text: "一回寝た相手のことを、次の日も考えてしまう？",
    like: "ついつい考えてしまう",
    nope: "あまり気にならない"
  },
  {
    id: 3, axis: "numa", weight: 2,
    text: "セフレ関係、本音はどう思う？",
    like: "情が湧いてしまう。恋愛モードに入ってしまう",
    nope: "割り切れる。むしろラク"
  },
  {
    id: 4, axis: "numa", weight: 1,
    text: "ワンナイトの翌朝、正直な気持ちは？",
    like: "むなしい。後悔",
    nope: "すっきり。いい夜だった"
  },
  {
    id: 5, axis: "numa", weight: 1,
    text: "セフレが他の人ともしてると知ったら？",
    like: "無理。嫉妬しちゃう",
    nope: "別に。自分も自由だし"
  },
  // ── S/M（Q6〜Q10）──
  {
    id: 6, axis: "sm", weight: 2,
    text: "ベッドで主導権、握りたい？握られたい？",
    like: "握りたい。リードしたい",
    nope: "握られたい。委ねたい"
  },
  {
    id: 7, axis: "sm", weight: 2,
    text: "「やめて」って言いながら感じてる相手のこと、どう思う？",
    like: "もっと迫りたくなる",
    nope: "されている側に回りたい"
  },
  {
    id: 8, axis: "sm", weight: 2,
    text: "言葉で追い詰める/命令することに興奮する？",
    like: "する。従わせたい",
    nope: "される方が好き。命令されたい"
  },
  {
    id: 9, axis: "sm", weight: 1,
    text: "セックスの「流れ」を作るのは、自分？相手？",
    like: "自分で作りたい",
    nope: "相手に作ってほしい"
  },
  {
    id: 10, axis: "sm", weight: 1,
    text: "セックス中、相手の表情見るのと表情見られるの、どちらが興奮する？",
    like: "見る方。相手の反応に興奮する",
    nope: "見られる方。恥ずかしいけど興奮する"
  },
  // ── 愛/欲（Q11〜Q15）──
  {
    id: 11, axis: "ai", weight: 2,
    text: "セックスに一番求めるものは？",
    like: "「大事にされてる」って実感",
    nope: "「気持ちいい」って快感"
  },
  {
    id: 12, axis: "ai", weight: 2,
    text: "前戯、正直どう思う？",
    like: "丁寧にされたい/したい",
    nope: "すぐに本番いきたい"
  },
  {
    id: 13, axis: "ai", weight: 2,
    text: "事後のハグやくっつく時間は？",
    like: "絶対必要",
    nope: "なくていい"
  },
  {
    id: 14, axis: "ai", weight: 1,
    text: "体の相性が悪い恋人、続けられる？",
    like: "好きだから関係ない。気持ちが大事",
    nope: "正直キツい。続けられる自信ない"
  },
  {
    id: 15, axis: "ai", weight: 1,
    text: "「愛してる」と「気持ちいい」、セックス中に言われたいのは？",
    like: "愛してる",
    nope: "気持ちいい"
  },
  // ── Give/Take（Q16〜Q20）──
  {
    id: 16, axis: "gt", weight: 2,
    text: "相手がイった瞬間と、自分がイった瞬間、どっちが興奮する？",
    like: "相手がイった瞬間",
    nope: "自分がイった瞬間"
  },
  {
    id: 17, axis: "gt", weight: 2,
    text: "セックス中、どちらに集中してる？",
    like: "相手の表情や反応",
    nope: "自分の感覚や高まり"
  },
  {
    id: 18, axis: "gt", weight: 2,
    text: "セックスで一番大事にしてることは？",
    like: "相手が気持ちよくなること",
    nope: "自分が気持ちよくなること"
  },
  {
    id: 19, axis: "gt", weight: 1,
    text: "相手が寝た後、自分だけ満たされてなかったら？",
    like: "相手が満足してるなら別にいい",
    nope: "正直モヤる。自分も満たされたい"
  },
  {
    id: 20, axis: "gt", weight: 1,
    text: "「始める」のはどちら？",
    like: "自分から動いて、相手をその気にさせたい",
    nope: "相手から求められたい。欲しがられる側に回りたい"
  }
];
