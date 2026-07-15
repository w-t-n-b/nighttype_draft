/* ============================================================
   広告出し分けヘルパー v2（恋愛対象別・ネイティブカード・クリック計測付き）
   - localStorage の nightTypeProfile.romanticInterest を読んで
     .aff-slot 要素に商材カードを差し込む
   - male(男性が好き) → 女性向け商材
   - female(女性が好き) → 男性向け商材
   - both(両対応)     → 男性向け商材 (femaleと同じ)
   - unknown(未診断)   → 男性向け商材 (femaleと同じ・フォールバック)

   運用:
   1. 商材が決まったら OFFERS の for_women / for_men を埋める
      （href = A8のリンクURL / beacon = 1x1計測タグ / media = バナーimgタグ(任意)）
   2. headline / copy / cta はこちらで自由に書ける（カードの文言）
      ※A8素材のバナー画像・リンク先URLは改変不可。文言はカードの「周辺文脈」として配置
   3. 300x250 や テキストリンク素材を再取得したら media / href を差し替え

   GA4イベント:
   - ad_target_impression {interest, key, page}
   - aff_click            {key, page, context}
   ============================================================ */
(function(){
  'use strict';

  /* ── 商材定義 ── */
  var OFFERS = {
    // 女性向け商材(恋愛対象=男性のユーザーに表示)
    // A8 素材コード a8mat=4B7WD7+GFSW36+1KZ4+5ZEMP (匿名の出会い系)
    for_women: {
      href: 'https://px.a8.net/svt/ejp?a8mat=4B7WD7+GFSW36+1KZ4+5ZEMP',
      media: '<img border="0" width="88" height="31" alt="" src="https://www29.a8.net/svt/bgt?aid=260709019994&amp;wid=001&amp;eno=01&amp;mid=s00000007384001005000&amp;mc=1" style="display:block; margin:0 auto;" />',
      beacon: '<img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4B7WD7+GFSW36+1KZ4+5ZEMP" alt="" style="position:absolute; opacity:0; pointer-events:none;">',
      headline: '診断のあと、試したくなったら。',
      copy: '匿名のままはじめられる、大人の出会い。登録は数分。',
      cta: '詳しく見る →'
    },
    // 男性向け商材(恋愛対象=女性/両対応/未診断のユーザーに表示)
    // TODO: A8承認後、href / beacon / (media) を貼るとカードが自動で出ます
    for_men: {
      href: '',   // ← ここにA8リンクURL
      media: '',  // ← バナー素材があればimgタグ、テキスト素材なら空でOK
      beacon: '', // ← 1x1計測タグ
      headline: '夜のタイプが分かったら、次は実践。',
      copy: '', // 商材に合わせて記入
      cta: '詳しく見る →'
    }
  };

  /* ── 恋愛対象 → 商材キー ── */
  var INTEREST_TO_KEY = {
    'male':    'for_women',
    'female':  'for_men',
    'both':    'for_men',
    'unknown': 'for_men'
  };

  function getInterest(){
    try{
      var raw = localStorage.getItem('nightTypeProfile');
      if(!raw) return 'unknown';
      var obj = JSON.parse(raw);
      return (obj && obj.romanticInterest) || 'unknown';
    }catch(_){ return 'unknown'; }
  }

  function track(name, params){
    if(typeof window.gtag === 'function'){
      try{ window.gtag('event', name, params || {}); }catch(_){}
    }
  }

  /* ── ネイティブカード生成 ── */
  function cardHtml(offer){
    return '' +
      '<a href="' + offer.href + '" target="_blank" rel="sponsored nofollow noopener" class="aff-card"' +
      ' style="display:block; padding:20px 22px; border-radius:16px; text-decoration:none;' +
      ' background:linear-gradient(135deg, rgba(244,114,182,.13), rgba(155,124,248,.13));' +
      ' border:1px solid rgba(244,114,182,.35); box-shadow:0 8px 30px rgba(244,114,182,.12);' +
      ' color:#e9e6ff; font-family:\'Noto Sans JP\',sans-serif;' +
      ' transition:transform .2s, box-shadow .2s;"' +
      ' onmouseover="this.style.transform=\'translateY(-2px)\'"' +
      ' onmouseout="this.style.transform=\'\'">' +
        '<div style="font-family:\'Space Mono\',monospace; font-size:10px; letter-spacing:.24em; color:#F472B6; margin-bottom:10px; text-transform:uppercase;">— PR —</div>' +
        (offer.headline ? '<div style="font-size:16px; font-weight:700; line-height:1.6; margin-bottom:6px;">' + offer.headline + '</div>' : '') +
        (offer.copy ? '<div style="font-size:12.5px; line-height:1.8; color:#b8b3d9; margin-bottom:12px;">' + offer.copy + '</div>' : '') +
        (offer.media ? '<div style="margin:10px 0;">' + offer.media + '</div>' : '') +
        '<div style="display:inline-block; font-size:13px; font-weight:700; color:#0b0820; letter-spacing:.03em;' +
        ' background:linear-gradient(135deg,#F472B6,#9B7CF8); border-radius:99px; padding:10px 22px;">' +
          (offer.cta || '詳しく見る →') +
        '</div>' +
      '</a>' +
      (offer.beacon || '');
  }

  function apply(){
    var interest = getInterest();
    var key = INTEREST_TO_KEY[interest] || 'for_men';
    var offer = OFFERS[key];
    var ready = offer && offer.href;  // href未設定なら非表示(準備中UI回避)
    var page = (location.pathname.split('/').pop() || 'index.html');

    var slots = document.querySelectorAll('.aff-slot');
    var shown = 0;
    for(var i = 0; i < slots.length; i++){
      var el = slots[i];
      if(ready){
        el.innerHTML = cardHtml(offer);
        el.style.display = '';
        el.setAttribute('data-ad-key', key);
        // クリック計測（カードごと）
        (function(slot){
          var a = slot.querySelector('a.aff-card');
          if(a && !a.__affBound){
            a.__affBound = true;
            a.addEventListener('click', function(ev){
              if(ev.defaultPrevented) return;
              track('aff_click', { key: key, page: page, context: slot.getAttribute('data-aff-context') || '' });
            });
          }
        })(el);
        shown++;
      } else {
        el.style.display = 'none';
      }
    }

    if(shown > 0){
      track('ad_target_impression', { interest: interest, key: key, page: page });
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
