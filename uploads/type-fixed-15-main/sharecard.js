// ── NightType シェアカード生成エンジン ──
// SNSで「止まる」レベルのビジュアル設計
// ・キャラ大きく・タイプ名極太・一言コピー
// ・Square(1080x1080) / Story(1080x1920) 対応

async function generateShareCard(canvas, resultType, resultData, types, mode='square'){
  const isStory = mode === 'story';
  const W = 1080, H = isStory ? 1920 : 1080;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── 1. 背景 ──
  ctx.fillStyle = '#07050e';
  ctx.fillRect(0,0,W,H);

  // メッシュグラデ
  const meshColors = [
    { x:W*0.1, y:H*0.15, r:isStory?420:340, c:'rgba(109,40,217,0.55)' },
    { x:W*0.9, y:H*0.8,  r:isStory?380:300, c:'rgba(219,39,119,0.4)'  },
    { x:W*0.5, y:H*0.5,  r:isStory?300:240, c:'rgba(14,165,233,0.15)' },
  ];
  meshColors.forEach(({x,y,r,c}) => {
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,c); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  });

  // ノイズ星
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for(let i=0;i<180;i++){
    const x=Math.random()*W, y=Math.random()*H;
    const r=Math.random()*1.8+0.2;
    ctx.globalAlpha = Math.random()*0.7+0.2;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── 2. キャラ画像（大きく・ドラマチックに） ──
  const charY  = isStory ? H*0.42 : H*0.46;
  const charR  = isStory ? 310    : 260;

  const drawTextLayer = () => {
    // グロー背景
    const glow = ctx.createRadialGradient(W/2, charY, 0, W/2, charY, charR*1.8);
    glow.addColorStop(0, 'rgba(109,40,217,0.5)');
    glow.addColorStop(0.5,'rgba(219,39,119,0.2)');
    glow.addColorStop(1,'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,W,H);

    // ── 3. ロゴ ──
    const logoY = isStory ? 96 : 72;
    ctx.font = `800 ${isStory?44:34}px 'Arial Black', sans-serif`;
    ctx.fillStyle = 'rgba(196,181,253,0.9)';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText('NIGHTTYPE', W/2, logoY);

    // ロゴ下ライン
    ctx.strokeStyle = 'rgba(167,139,250,0.3)';
    ctx.lineWidth = 1;
    const lineW = isStory ? 200 : 160;
    ctx.beginPath();
    ctx.moveTo(W/2-lineW, logoY+14);
    ctx.lineTo(W/2+lineW, logoY+14);
    ctx.stroke();

    // ── 4. タイプコード（背景に大きく） ──
    const codeY = isStory ? H*0.67 : H*0.72;
    ctx.font = `800 ${isStory?200:170}px 'Arial Black', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.textAlign = 'center';
    ctx.fillText(resultType, W/2, codeY);

    // ── 5. タグライン（イタリック・小） ──
    const tagY = isStory ? H*0.70 : H*0.745;
    ctx.font = `italic ${isStory?32:28}px Georgia, serif`;
    ctx.fillStyle = 'rgba(196,181,253,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText(`"${resultData.tagline}"`, W/2, tagY);

    // ── 6. タイプ名（極太・グラデ） ──
    const nameY = isStory ? H*0.775 : H*0.825;
    const nameFontSize = isStory ? 88 : 76;
    ctx.font = `800 ${nameFontSize}px 'Arial Black', sans-serif`;

    // グラデテキスト
    const nameGrad = ctx.createLinearGradient(W*0.15, 0, W*0.85, 0);
    nameGrad.addColorStop(0,'#c4b5fd');
    nameGrad.addColorStop(0.5,'#f9a8d4');
    nameGrad.addColorStop(1,'#c4b5fd');
    ctx.fillStyle = nameGrad;
    ctx.textAlign = 'center';

    // 長い名前は自動折り返し
    const name = resultData.name;
    if(ctx.measureText(name).width > W*0.82){
      const mid = Math.ceil(name.length/2);
      ctx.fillText(name.slice(0,mid), W/2, nameY - nameFontSize*0.55);
      ctx.fillText(name.slice(mid),   W/2, nameY + nameFontSize*0.1);
    } else {
      ctx.fillText(name, W/2, nameY);
    }

    // ── 7. 区切り装飾ライン ──
    const divY = isStory ? H*0.835 : H*0.876;
    const divGrad = ctx.createLinearGradient(W*0.2,0,W*0.8,0);
    divGrad.addColorStop(0,'transparent');
    divGrad.addColorStop(0.3,'rgba(167,139,250,0.6)');
    divGrad.addColorStop(0.7,'rgba(244,114,182,0.6)');
    divGrad.addColorStop(1,'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W*0.2, divY); ctx.lineTo(W*0.8, divY);
    ctx.stroke();

    // ダイヤ装飾
    ctx.fillStyle='rgba(196,181,253,0.5)';
    ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('◆', W/2, divY+5);

    // ── 8. 相性◎タイプ ──
    const compatY = isStory ? H*0.875 : H*0.916;
    const g1 = types[resultData.good[0]];
    const g2 = types[resultData.good[1]];
    ctx.font = `${isStory?26:22}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.textAlign = 'center';
    ctx.fillText(`相性◎  ${g1?.name??''}  ×  ${g2?.name??''}`, W/2, compatY);

    // ── 9. ハッシュタグ ──
    const hashY = isStory ? H*0.915 : H*0.95;
    ctx.font = `${isStory?24:20}px sans-serif`;
    ctx.fillStyle = 'rgba(167,139,250,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('#NightType  #夜の価値観診断', W/2, hashY);

    // ── 10. URL ──
    const urlY = isStory ? H*0.955 : H*0.978;
    ctx.font = `${isStory?22:18}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillText('nighttype.jp', W/2, urlY);
  };

  // キャラ画像の描画
  if(resultData.image){
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // ── キャラのグロー影 ──
        const shadowGrad = ctx.createRadialGradient(W/2,charY+charR*0.4,0,W/2,charY,charR*1.6);
        shadowGrad.addColorStop(0,'rgba(109,40,217,0.6)');
        shadowGrad.addColorStop(0.4,'rgba(219,39,119,0.2)');
        shadowGrad.addColorStop(1,'transparent');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath(); ctx.ellipse(W/2,charY+charR*0.5,charR*1.4,charR*0.5,0,0,Math.PI*2); ctx.fill();

        // キャラ（丸クリップなし・大きくそのまま表示）
        const imgW = charR * 2.2;
        const imgH = imgW;
        const imgX = W/2 - imgW/2;
        const imgY = charY - charR * 1.35;
        ctx.drawImage(img, imgX, imgY, imgW, imgH);

        drawTextLayer();
        resolve();
      };
      img.onerror = () => {
        ctx.font=`${isStory?280:240}px sans-serif`; ctx.textAlign='center';
        ctx.fillText(resultData.icon, W/2, charY+60);
        drawTextLayer(); resolve();
      };
      img.src = resultData.image;
    });
  } else {
    ctx.font=`${isStory?280:240}px sans-serif`; ctx.textAlign='center';
    ctx.fillText(resultData.icon, W/2, charY+60);
    drawTextLayer();
  }
}
