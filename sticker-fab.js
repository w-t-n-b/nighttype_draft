/* ============================================================
   LINE スタンプ フローティングCTA (共有)
   - 結果ページ(result.html) と キャラページ(type/*.html) で共通利用
   - 段階販売: スタンプが出たキャラのコードを STICKER_IDS に追記するだけで
     そのキャラのページ/結果でだけ FAB が出るようになる(未販売キャラは非表示)
   ============================================================ */
(function(){
  'use strict';

  /* ── 販売開始済みキャラの LINE スタンプ商品ID ──
     スタンプが出たら「コード: 'ID'」を1行足すだけ。 */
  var STICKER_IDS = {
    A1: '34797458',  // オンリーユー没入者
    A2: '34797457',  // 色欲の共鳴者
    A3: '34963801',  // 感情同期ドリフター
    A4: '34797711',  // 沼化プランナー
    B1: '34963585',  // ムード絶対主義者
    B2: '34797715',  // 儀式化ナイト
    B3: '34963708',  // 快楽エンジニア
    B4: '34963700',  // 空気読解オペレーター
    C1: '34963715',  // 本能解放ランナー
    C2: '34963727',  // フィジカル優位者
    C3: '34963761',  // 欲望直結タイプ
    C4: '34963732',  // スピード重視型
    D1: '34963746',  // 観測者ポジション
    D2: '34963795',  // 妄想シナリオライター
    D3: '34963737',  // 依存ドミネーター
    D4: '34963734'   // 隠れ独占ウィザード
    // 全16キャラ販売済み ✅
    // 全キャラ入り版(34964266)は別途設置場所検討中
  };

  var CDN = 'https://stickershop.line-scdn.net/stickershop/v1/product/';
  function stickerImg(id){ return CDN + id + '/iphone/main.png'; }
  // 端末で最適なリンクを出し分ける:
  //  - モバイル: ディープリンク(line.me/S/sticker)→ LINEアプリのスタンプ画面を直接開く
  //  - PC: 上記はPCだと英語ロケールの別ページに転送され表示崩れするため、
  //        日本語のストアWebページ(/ja)を直接開く
  var IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(
    (navigator && navigator.userAgent) || ''
  );
  function stickerLink(id){
    return IS_MOBILE
      ? 'https://line.me/S/sticker/' + id
      : 'https://store.line.me/stickershop/product/' + id + '/ja';
  }

  /* CSS は一度だけ注入(結果ページは既にインラインCSSを持つのでスキップ) */
  function injectCSS(){
    if(document.getElementById('sticker-fab-css')) return;
    var css =
    '.sticker-fab{position:fixed;right:12px;bottom:12px;z-index:80;display:none;flex-direction:column;align-items:center;padding:8px 10px 10px;border-radius:14px;background:rgba(20,16,42,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.14);box-shadow:0 12px 30px rgba(0,0,0,.55);text-decoration:none;color:#fff;font-family:"Noto Sans JP",sans-serif;width:96px;box-sizing:border-box;transition:transform .18s ease;}'+
    '.sticker-fab.show{display:flex;animation:stickerFabIn .35s cubic-bezier(.16,1,.3,1);}'+
    '.sticker-fab:hover{transform:translateY(-2px);}'+
    '.sticker-fab-img{width:72px;height:72px;border-radius:10px;object-fit:contain;display:block;background:rgba(255,255,255,.06);}'+
    '.sticker-fab-text{font-size:10px;line-height:1.35;margin-top:6px;text-align:center;color:#fff;letter-spacing:.02em;font-weight:600;}'+
    '.sticker-fab-text em{font-style:normal;color:#06C755;}'+
    '.sticker-fab-close{position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:rgba(20,16,42,.95);border:1px solid rgba(255,255,255,.25);color:rgba(255,255,255,.85);font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit;}'+
    '.sticker-fab-close:hover{background:rgba(255,255,255,.12);}'+
    '@keyframes stickerFabIn{from{transform:translateY(20px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}'+
    '@media(max-width:380px){.sticker-fab{right:10px;bottom:10px;width:86px;}.sticker-fab-img{width:64px;height:64px;}}';
    var s = document.createElement('style');
    s.id = 'sticker-fab-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function track(name, code){
    if(typeof window.trackEvent === 'function'){
      try{ window.trackEvent(name, {type: code}); }catch(_){}
    }
  }

  /* ページから呼ぶ / 自動マウント共通の本体 */
  window.mountStickerFab = function(code, opts){
    opts = opts || {};
    var id = STICKER_IDS[code];
    if(!id) return;  // 未販売キャラは何も出さない
    try{ if(sessionStorage.getItem('stickerFab_closed') === '1') return; }catch(_){}

    /* 結果ページは静的な #stickerFab を持つので再利用。無ければ生成(キャラページ) */
    var fab = document.getElementById('stickerFab');
    var img, closeBtn;
    if(fab){
      img = document.getElementById('stickerFabImg');
      closeBtn = document.getElementById('stickerFabClose');
    } else {
      injectCSS();
      fab = document.createElement('a');
      fab.className = 'sticker-fab';
      fab.id = 'stickerFab';
      fab.target = '_blank';
      fab.rel = 'noopener';
      fab.setAttribute('aria-label', 'LINEスタンプを見る');

      img = document.createElement('img');
      img.className = 'sticker-fab-img';
      img.id = 'stickerFabImg';
      img.width = 72; img.height = 72; img.loading = 'lazy'; img.alt = '';

      var span = document.createElement('span');
      span.className = 'sticker-fab-text';
      span.innerHTML = '<em>スタンプ</em><br/>出ました';

      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'sticker-fab-close';
      closeBtn.id = 'stickerFabClose';
      closeBtn.setAttribute('aria-label', '閉じる');
      closeBtn.textContent = '×';

      fab.appendChild(img);
      fab.appendChild(span);
      fab.appendChild(closeBtn);
      document.body.appendChild(fab);
    }

    /* リンク & 画像
       手元の実スタンプ画像(images/sticker/<code>.png) → LINE公式 main.png → キャラ絵
       の順に読み込み、404/失敗のたびに次の候補へ自動フォールバック。
       ローカル画像が無いキャラは自動でLINE公式にフォールバックするので無害。 */
    fab.href = stickerLink(id);
    if(img){
      img.alt = 'LINEスタンプ';
      var localImg = opts.localImg;
      if(!localImg && opts.imgFallback){
        // 'images/A1.png' や '../images/A1.png' の階層を保ったまま sticker/ 配下を指す
        var slash = opts.imgFallback.lastIndexOf('/');
        var dir = slash >= 0 ? opts.imgFallback.slice(0, slash + 1) : '';
        localImg = dir + 'sticker/' + code + '.png';
      }
      var sources = [];
      if(localImg) sources.push(localImg);                  // 手元の実スタンプ(最優先)
      sources.push(stickerImg(id));                          // LINE公式 main.png
      if(opts.imgFallback) sources.push(opts.imgFallback);   // 最後の砦: キャラ絵
      var si = 0;
      img.onerror = function(){ if(si < sources.length){ img.src = sources[si++]; } };
      img.onerror();  // 先頭の候補から読み込み開始
    }

    function show(){
      if(fab.classList.contains('show')) return;
      fab.classList.add('show');
      track('stamp_fab_view', code);
    }

    /* 表示トリガ: 指定要素が見えたら / 無ければ少しスクロールで */
    var target = opts.target || null;
    if(target && 'IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        if(entries.some(function(e){ return e.isIntersecting; })){ show(); io.disconnect(); }
      }, { threshold: 0.15 });
      io.observe(target);
    } else {
      var onScroll = function(){
        if((window.scrollY || window.pageYOffset || 0) > window.innerHeight * 0.6){
          show();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    fab.addEventListener('click', function(e){
      if(e.target.closest('.sticker-fab-close')) return;
      track('stamp_fab_clicked', code);
    });
    if(closeBtn){
      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        fab.classList.remove('show');
        try{ sessionStorage.setItem('stickerFab_closed', '1'); }catch(_){}
        track('stamp_fab_dismissed', code);
      });
    }
  };

  /* キャラページ(/type/XX.html)は自動マウント。
     結果ページ(result.html)は自前で code を持つので側で明示的に呼ぶ。 */
  function autoMount(){
    var m = location.pathname.match(/\/type\/([A-Da-d][1-4])\.html?$/);
    if(m){
      var code = m[1].toUpperCase();
      window.mountStickerFab(code, { imgFallback: '../images/' + code + '.png' });
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})();
