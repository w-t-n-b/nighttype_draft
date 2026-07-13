/**
 * 夜キャラ診断 広告掲載フォーム 受信ウェブアプリ（参照用ソース）
 * ============================================================
 * ※ これは advertising.html のフォーム受信スクリプトの控えです。
 *    実体は clasp プロジェクト「夜キャラ広告フォーム」としてデプロイ済み。
 *    編集する場合はそちらを clasp push（※clasp login=nighttypediagnosis 必要）。
 *
 *   所有者   : nighttypediagnosis@gmail.com
 *   ローカル : ~/Downloads/夜キャラ_広告フォーム/
 *   scriptId : 1RWMrL8IDpKTx7vpAkSW02XlBrNp2b5sMrbILHcHtwbWsy2m_0Sv3LW9t
 *   exec URL : https://script.google.com/macros/s/AKfycbxcZyERPF61DxXH6mRbOiISTQdLzLX1kL1hxqmXDxQSegezE3OsXEQeb1IUHY_2tstrHw/exec
 *   受信先   : スプレッドシート「夜キャラ広告問い合わせ」（初回doPost/authorizeで自動生成）
 *   通知先   : nighttypediagnosis@gmail.com
 *
 * ── 有効化（初回のみ・所有者 nighttypediagnosis が1回だけ承認）──
 *   デプロイ直後は権限未承認のため 403（アクセス拒否）。
 *   エディタ https://script.google.com/d/1RWMrL8IDpKTx7vpAkSW02XlBrNp2b5sMrbILHcHtwbWsy2m_0Sv3LW9t/edit
 *   を開き、関数 authorize を1回実行して権限を許可すると本稼働。
 * ============================================================
 */

var NOTIFY_EMAIL = 'nighttypediagnosis@gmail.com';

function doPost(e){
  try {
    var p = (e && e.parameter) || {};
    if (p._hp) { return ContentService.createTextOutput('ok'); } // ハニーポット無視
    var now = new Date();
    getSheet_().appendRow([
      now, p.company||'', p.name||'', p.email||'', p.budget||'', p.interest||'', p.message||'', p.userAgent||''
    ]);
    notify_(p, now);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    try { MailApp.sendEmail(NOTIFY_EMAIL, '[夜キャラ広告フォーム] 受信エラー', String(err)); } catch (_){}
    return ContentService.createTextOutput('error');
  }
}

// 受信先シートを取得（無ければ新規作成しIDをScriptPropertiesに保存）
function getSheet_(){
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  var ss = id ? SpreadsheetApp.openById(id)
              : SpreadsheetApp.create('夜キャラ広告問い合わせ');
  if (!id) props.setProperty('SHEET_ID', ss.getId());
  var sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['受信日時','会社名','担当者','メール','予算感','興味メニュー','内容','UA']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify_(p, now){
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: '[夜キャラ広告] 新規お問い合わせ: ' + (p.company || p.name || '匿名'),
    replyTo: p.email || NOTIFY_EMAIL,
    body:
      '広告掲載ページに新しいお問い合わせがありました。\n\n' +
      '受信日時 : ' + now + '\n' +
      '会社名   : ' + (p.company  || '（未記入）') + '\n' +
      '担当者   : ' + (p.name     || '') + '\n' +
      'メール   : ' + (p.email    || '') + '\n' +
      '予算感   : ' + (p.budget   || '（未選択）') + '\n' +
      '興味     : ' + (p.interest || '（未選択）') + '\n' +
      '----------------------------------------\n' +
      (p.message || '') + '\n' +
      '----------------------------------------\n'
  });
}

function doGet(){ return ContentService.createTextOutput('advertising form endpoint: OK'); }

// 権限承認用：エディタから一度だけ実行するとスコープが承認され、受信シートも生成される。
function authorize(){
  var s = getSheet_();
  Logger.log('authorized. sheet id = ' + s.getParent().getId());
}
