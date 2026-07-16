// interest-ads.js — 診断で「18歳以上」かつ「恋愛対象」を回答した人にだけ、
//                    恋愛対象別の広告を出し分ける。result.html / match.html で使用。
//
// 表示条件(fail-closed。ひとつでも欠ければ何も出さない):
//   1) localStorage 'nightTypeProfile' がある(=診断を完了している)
//   2) profile.ageRange が18歳未満でない(下の UNDER18)
//   → 未診断で相性ページに直接来た人などには一切表示されない
//
// 出し分け:
//   profile.romanticInterest ('male'|'female'|'both') で CREATIVES を選択
//
// 使い方(各ページ):
//   <div id="interestAdSlot"></div> を置く
//   <script src="interest-ads.js"></script> を読み込む
//   NightInterestAd.render('interestAdSlot') を呼ぶ

(function(){
  'use strict';

  // ▼▼▼▼▼ 恋愛対象別の広告素材をここに設定 ▼▼▼▼▼
  //   href      : 遷移先URL(アフィリエイトリンク等)
  //   square    : 正方形(1:1)画像 … スマホ(狭い画面)で使用。縦に大きく出て目に入りやすい
  //   landscape : 横長(約1.9:1)画像 … PC/タブレット等の広い画面で使用
  //   noPr:true … 画像にPR/18禁が焼き込み済みなのでカード側のPRバッジを出さない
  //   href か画像が欠けている恋愛対象は、その人には広告を出さない(枠ごと非表示)
  //
  //   ※ 3サイズ目「横長帯(3:1)」は素材差し替え待ち(お待ち中)。届いたら各CRに
  //     strip:'…' を足し、下の buildPicture の <source> 分岐に一行追加すればよい。
  const CREATIVES = {
    // 恋愛対象=女性 → 「男性向け」広告(性癖マッチング / バーの女性)
    female: {
      href: 'https://ad.ignite-ad.jp/a77r26r8054911bb/cl/?bId=5W56W45f',
      square:    '/images/ads/ad-seiheki-square.jpg',
      landscape: '/images/ads/ad-seiheki-landscape.jpg',
      strip:     '/images/ads/ad-seiheki-strip.jpg'
    },
    // 恋愛対象=どちらも → 男性向け広告(性癖マッチング)に合わせる
    both: {
      href: 'https://ad.ignite-ad.jp/a77r26r8054911bb/cl/?bId=5W56W45f',
      square:    '/images/ads/ad-seiheki-square.jpg',
      landscape: '/images/ads/ad-seiheki-landscape.jpg',
      strip:     '/images/ads/ad-seiheki-strip.jpg'
    },
    // 恋愛対象=男性 → 「女性向け」広告(いつもの恋の外側へ / 窓辺の女性)
    //   noPr:true … 画像にPR/18禁が焼き込まれているのでカード側のPRバッジは出さない
    male: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B7WD7+GFSW36+1KZ4+601S2',
      square:    '/images/ads/ad-itsumono-square.jpg',
      landscape: '/images/ads/ad-itsumono-landscape.jpg',
      strip:     '/images/ads/ad-itsumono-strip.jpg',
      noPr: true
    }
  };
  // ▲▲▲▲▲ ここまで設定 ▲▲▲▲▲

  // スマホ判定の境界。この幅以下(<=)は square、それより広ければ landscape。
  const MOBILE_MAX = 599; // px

  // 18歳未満とみなす ageRange 値。
  //   新: 'u18'(17歳以下)
  //   旧データ: '10e'(10代前半) / '10l'(10代後半) も、18歳未満を含みうるため安全側で除外
  const UNDER18 = { 'u18':1, '10e':1, '10l':1 };

  function loadProfile(){
    try { return JSON.parse(localStorage.getItem('nightTypeProfile')) || null; }
    catch(e){ return null; }
  }

  // 表示可否: プロフィールがあり、かつ18歳未満でない
  function isEligible(p){
    return !!(p && p.ageRange && !UNDER18[p.ageRange]);
  }

  function pickCreative(p){
    const key = (p && p.romanticInterest) || 'both';
    return CREATIVES[key] || CREATIVES.both;
  }

  let styleInjected = false;
  function injectStyle(){
    if(styleInjected) return; styleInjected = true;
    var css =
      '.nia-wrap{margin:28px auto;max-width:480px;padding:0 4px}' +
      '.nia-eyebrow{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.28em;' +
        'text-transform:uppercase;color:rgba(154,150,184,.7);text-align:center;margin-bottom:10px}' +
      '.nia-card{position:relative;display:block;border-radius:20px;overflow:hidden;' +
        'border:1px solid rgba(255,255,255,.10);background:rgba(20,16,42,.55);' +
        'text-decoration:none;color:#e9e6ff;transition:transform .25s,box-shadow .25s,border-color .25s}' +
      '.nia-card:hover{transform:translateY(-2px);border-color:rgba(155,124,248,.55);' +
        'box-shadow:0 14px 44px rgba(155,124,248,.28)}' +
      '.nia-pr{position:absolute;top:10px;right:10px;z-index:2;font-family:"Space Mono",monospace;' +
        'font-size:9px;letter-spacing:.12em;color:#cfc8ee;background:rgba(4,4,14,.6);' +
        'border:1px solid rgba(255,255,255,.18);border-radius:6px;padding:2px 6px}' +
      '.nia-img{display:block;width:100%;height:auto}' +
      '.nia-body{padding:14px 16px 16px}' +
      '.nia-headline{display:block;font-family:"Noto Sans JP",sans-serif;font-size:14px;' +
        'font-weight:600;line-height:1.6;color:#e9e6ff;margin-bottom:12px}' +
      '.nia-cta{display:inline-flex;align-items:center;gap:6px;padding:11px 22px;border-radius:99px;' +
        'background:linear-gradient(135deg,#9B7CF8,#22D3EE);color:#0b0820;font-family:"Noto Sans JP",sans-serif;' +
        'font-size:13px;font-weight:700;letter-spacing:.04em}';
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function esc(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // レイアウトに応じて <picture> を組み立てる。
  //   layout='hero'  … 結果ページ等。スマホ(<=MOBILE_MAX)=square / 広い画面=landscape
  //   layout='strip' … 相性ページ等。全端末で横長帯(strip)を軽く添える
  //   ブラウザが media を見て自前で選ぶので回転・リサイズにも追従する。
  function buildPicture(c, layout){
    if(layout === 'strip'){
      var s = c.strip || c.landscape || c.square;
      return '<picture><img class="nia-img" src="' + esc(s) + '" alt="" loading="lazy"></picture>';
    }
    // hero(既定): スマホ=square / 広い画面=landscape
    var def = c.landscape || c.square;
    var srcs = (c.square && c.landscape)
      ? '<source media="(max-width:' + MOBILE_MAX + 'px)" srcset="' + esc(c.square) + '">' : '';
    return '<picture>' + srcs +
      '<img class="nia-img" src="' + esc(def) + '" alt="" loading="lazy">' +
      '</picture>';
  }

  // containerId の要素に広告を描画。条件を満たさなければ枠ごと非表示。
  //   opts.layout   : 'hero'(既定) | 'strip'
  //   opts.maxWidth : カード最大幅(px)。各ページの本文幅に合わせる(既定480)
  function render(containerId, opts){
    var layout = (opts && opts.layout) || 'hero';
    var maxW = (opts && opts.maxWidth) || 480;
    var el = document.getElementById(containerId);
    if(!el) return false;
    var p = loadProfile();
    if(!isEligible(p)){ el.style.display = 'none'; return false; }
    var c = pickCreative(p);
    if(!c || !c.href || !(c.square || c.landscape || c.strip)){ el.style.display = 'none'; return false; }
    injectStyle();
    // headline か cta があるときだけ、画像下のテキスト帯(nia-body)を出す。
    // (今の素材はボタンが画像に焼き込み済みなので通常は出ない)
    var bodyParts = '';
    if(c.headline) bodyParts += '<span class="nia-headline">' + esc(c.headline) + '</span>';
    if(c.cta)      bodyParts += '<span class="nia-cta">' + esc(c.cta) + ' →</span>';
    var body = bodyParts ? '<span class="nia-body">' + bodyParts + '</span>' : '';
    el.innerHTML =
      '<div class="nia-wrap" style="max-width:' + (+maxW) + 'px">' +
        '<div class="nia-eyebrow">Sponsored</div>' +
        '<a class="nia-card" href="' + esc(c.href) + '" target="_blank" rel="sponsored noopener nofollow">' +
          (c.noPr ? '' : '<span class="nia-pr">PR</span>') +
          buildPicture(c, layout) +
          body +
        '</a>' +
      '</div>';
    el.style.display = 'block';
    if(typeof gtag === 'function'){
      try { gtag('event', 'interest_ad_view', { interest: (p.romanticInterest || 'both') }); } catch(_){}
    }
    return true;
  }

  window.NightInterestAd = { render: render, isEligible: isEligible, CREATIVES: CREATIVES };
})();
