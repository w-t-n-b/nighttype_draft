// quiz-vertical.js — 軸別5問の縦リストUIと回答状態管理
// 共通: index.html(p=1) と quiz.html(p=2/3/4) で利用
//
// State persistence:
//   localStorage 'nightTypeAnswers' = { "1": 3, "2": -2, ... } (qid → val)
//
// Pages:
//   p=1: Q1〜Q5 (axis=numa)
//   p=2: Q6〜Q10 (axis=sm)
//   p=3: Q11〜Q15 (axis=ai)
//   p=4: Q16〜Q20 (axis=gt)  + プロフィールへ

(function(){
  const ANS_KEY = 'nightTypeAnswers';
  const PAGE_AXIS = { 1:'numa', 2:'sm', 3:'ai', 4:'gt' };
  const AXIS_LABEL = {
    numa: { eyebrow:'01 · Axis 1', title:'沼 · 塩', sub:'引きずる / 切り替わる' },
    sm:   { eyebrow:'02 · Axis 2', title:'S · M',   sub:'引き出す / 委ねる' },
    ai:   { eyebrow:'03 · Axis 3', title:'愛 · 欲', sub:'感情を確かめる / 快楽を追求する' },
    gt:   { eyebrow:'04 · Axis 4', title:'Give · Take', sub:'相手のピーク / 自分のピーク' },
  };

  function loadAnswers(){
    try{ return JSON.parse(localStorage.getItem(ANS_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function saveAnswers(answers){
    localStorage.setItem(ANS_KEY, JSON.stringify(answers));
  }
  function clearAnswers(){
    localStorage.removeItem(ANS_KEY);
    localStorage.removeItem('nightTypeResult');
    localStorage.removeItem('nightTypeScores');
  }

  // 星SVG(常に輪郭。塗りつぶしはCSSの .selected で制御)
  function starSvg(){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3l2.5 6.5L21 10l-5 4.5L17.5 21 12 17.5 6.5 21 8 14.5 3 10l6.5-.5z"/>
    </svg>`;
  }

  // 6ボタン行: ピンク3つ(強・中・弱) + シアン3つ(弱・中・強)
  // val: A=+3/+2/+1 (ピンク), B=-1/-2/-3 (シアン)
  function buildHeartRow(qid){
    const sides = [
      { val: 3,  cls:'s-l3' },
      { val: 2,  cls:'s-l2' },
      { val: 1,  cls:'s-l1' },
      { val:-1,  cls:'s-n1' },
      { val:-2,  cls:'s-n2' },
      { val:-3,  cls:'s-n3' },
    ];
    let html = '<div class="qv-srow" role="radiogroup">';
    sides.forEach(s => {
      html += `<button type="button" class="sbtn ${s.cls}" data-qid="${qid}" data-val="${s.val}" role="radio" aria-checked="false" aria-label="${s.val>0?'A':'B'} (強さ${Math.abs(s.val)})"><span class="sbtn-icon">${starSvg()}</span></button>`;
    });
    html += '</div>';
    return html;
  }

  // 単一質問アイテム
  function buildItem(q){
    return `
      <div class="qv-item" data-qid="${q.id}">
        <div class="qv-item-text">${escapeHtml(q.text)}</div>
        <div class="qv-item-opts">
          <div class="opt-a"><span class="opt-key">A.</span>${escapeHtml(q.like)}</div>
          <div class="opt-b"><span class="opt-key">B.</span>${escapeHtml(q.nope)}</div>
        </div>
        ${buildHeartRow(q.id)}
        <div class="qv-hlabels"><span>A</span><span>B</span></div>
      </div>`;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // バンドル: 5問+次へ
  function renderPage(rootEl, page){
    const axis = PAGE_AXIS[page];
    if(!axis){ console.warn('Invalid page', page); return; }
    // questions は他スクリプトのトップレベル const。global lexical scope経由でアクセス
    const allQs = (typeof questions !== 'undefined') ? questions : (window.questions || []);
    const qs = allQs.filter(q => q.axis === axis);
    if(qs.length === 0){
      console.error('[QuizVertical] No questions found for axis', axis,
        '- questions.js が読み込まれているか確認してください');
    }

    const lbl = AXIS_LABEL[axis];
    const totalQuestions = 20;
    const startQId = (page - 1) * 5 + 1;
    const progress = ((page - 1) * 5) / totalQuestions * 100;

    rootEl.innerHTML = `
      <div class="qv-wrap">
        <div class="qv-progress">
          <span>Q${startQId} / ${totalQuestions}</span>
          <span>${page} / 4</span>
        </div>
        <div class="qv-progress-bar"><div class="qv-progress-fill" style="width:${progress}%"></div></div>
        <div class="qv-list">${qs.map(buildItem).join('')}</div>
        <div class="qv-cta-row">
          <a class="cta-start" id="qvNext" href="#">次へ<span class="arrow">→</span></a>
          ${page > 1 ? '<button class="qv-back" id="qvBack">← 前のページに戻る</button>' : ''}
          <div class="qv-warn" id="qvWarn">全部の質問に答えてください</div>
        </div>
      </div>`;

    // 既存回答を反映
    const answers = loadAnswers();
    qs.forEach(q => {
      if(answers[q.id] != null){
        applySelection(q.id, answers[q.id]);
      }
    });

    // クリックハンドラ + 次の質問へ自動スクロール
    rootEl.querySelectorAll('.sbtn').forEach(btn => {
      btn.addEventListener('click', e => {
        const qid = +btn.dataset.qid;
        const val = +btn.dataset.val;
        const isNew = answers[qid] == null;  // 初回回答か?
        answers[qid] = val;
        saveAnswers(answers);
        applySelection(qid, val);
        // 初回回答時のみ、次の未回答質問へスクロール
        if(isNew){
          setTimeout(() => scrollToNext(rootEl, qs, answers, qid), 250);
        }
      });
    });

    // 次へボタン
    const nextBtn = document.getElementById('qvNext');
    const warn = document.getElementById('qvWarn');
    nextBtn.addEventListener('click', e => {
      e.preventDefault();
      const allAnswered = qs.every(q => answers[q.id] != null);
      if(!allAnswered){
        warn.classList.add('show');
        // 未回答の最初へスクロール
        const unanswered = qs.find(q => answers[q.id] == null);
        if(unanswered){
          const el = rootEl.querySelector(`[data-qid="${unanswered.id}"]`);
          if(el) el.scrollIntoView({behavior:'smooth', block:'center'});
        }
        setTimeout(()=>warn.classList.remove('show'), 3000);
        return;
      }
      // 次へ
      if(page < 4){
        location.href = 'quiz.html?p=' + (page + 1);
      } else {
        // 最終ページ → プロフィール入力エリア表示
        showProfileSection(answers);
      }
    });

    // 戻るボタン
    const backBtn = document.getElementById('qvBack');
    if(backBtn){
      backBtn.addEventListener('click', e => {
        e.preventDefault();
        location.href = 'quiz.html?p=' + (page - 1);
      });
    }
  }

  function scrollToNext(rootEl, qs, answers, currentQid){
    // 1) このページ内の「現在より下の未回答質問」を最優先
    let nextIdx = qs.findIndex(q => q.id === currentQid) + 1;
    while(nextIdx < qs.length){
      const q = qs[nextIdx];
      if(answers[q.id] == null){
        const el = rootEl.querySelector(`.qv-item[data-qid="${q.id}"]`);
        if(el){ el.scrollIntoView({behavior:'smooth', block:'center'}); return; }
      }
      nextIdx++;
    }
    // 2) ページ内全部回答済なら「次へ」ボタンへスクロール
    const allAnswered = qs.every(q => answers[q.id] != null);
    if(allAnswered){
      const nextBtn = document.getElementById('qvNext');
      if(nextBtn){ nextBtn.scrollIntoView({behavior:'smooth', block:'center'}); }
    }
  }

  function applySelection(qid, val){
    const item = document.querySelector(`.qv-item[data-qid="${qid}"]`);
    if(!item) return;
    item.classList.add('answered');
    item.querySelectorAll('.sbtn').forEach(b => {
      const bv = +b.dataset.val;
      b.classList.toggle('selected', bv === val);
      b.setAttribute('aria-checked', bv === val ? 'true' : 'false');
    });
  }

  function showProfileSection(answers){
    const profileEl = document.getElementById('profileSection');
    if(profileEl){
      profileEl.style.display = 'block';
      profileEl.scrollIntoView({behavior:'smooth', block:'start'});
    } else {
      // fallback: 直接結果へ
      submitAndGo(answers);
    }
  }

  // スコア計算 & 結果ページへ
  function submitAndGo(answers, profileData){
    const W1_SCORE = {3:4, 2:3, 1:2, '-1':-2, '-2':-3, '-3':-4};
    const axisScores = { numa:0, sm:0, ai:0, gt:0 };
    const tieBreakers = { numa:null, sm:null, ai:null, gt:null };
    const allQs = (typeof questions !== 'undefined') ? questions : (window.questions || []);
    allQs.forEach(q => {
      const v = answers[q.id];
      if(v == null) return;
      const sc = q.weight === 2 ? v * 2 : (W1_SCORE[v] || 0);
      axisScores[q.axis] += sc;
      if(q.weight === 2) tieBreakers[q.axis] = v > 0 ? 1 : -1;
    });
    const judge = ax => {
      const s = axisScores[ax];
      if(s > 0) return 'A';
      if(s < 0) return 'B';
      const tb = tieBreakers[ax];
      return tb !== null ? (tb > 0 ? 'A' : 'B') : 'B';
    };
    const numaStr = judge('numa') === 'A' ? 'numa' : 'shio';
    const smStr   = judge('sm')   === 'A' ? 'S'    : 'M';
    const aiStr   = judge('ai')   === 'A' ? 'ai'   : 'yoku';
    const gtStr   = judge('gt')   === 'A' ? 'G'    : 'T';
    const TM = (typeof TYPE_MAP !== 'undefined') ? TYPE_MAP : (window.TYPE_MAP || {});
    const code = TM[`${numaStr}_${smStr}_${aiStr}_${gtStr}`] || 'A1';
    localStorage.setItem('nightTypeResult', code);
    localStorage.setItem('nightTypeScores', JSON.stringify(axisScores));
    if(profileData) localStorage.setItem('nightTypeProfile', JSON.stringify(profileData));
    location.href = 'result.html';
  }

  // export
  window.QuizVertical = {
    renderPage,
    loadAnswers, saveAnswers, clearAnswers,
    submitAndGo,
  };
})();
