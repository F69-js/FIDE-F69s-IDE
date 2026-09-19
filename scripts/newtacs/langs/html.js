const TAGS = ["DOCTYPE","html","head","body","meta","title","link","script","style","div","span","p","a","img","ul","ol","li","table","tr","td","th","thead","tbody","form","input","button","textarea","label","select","option","iframe","canvas","svg"];
const ATTRS = ["id","class","style","href","src","alt","type","value","name","placeholder","disabled","checked","readonly","required","onclick","onload"];

export const HTMLtheme = `
  .k { color: #4ec9b0; font-weight: bold; } /* HTMLタグ名: エメラルド */
  .a { color: #f2c94c; font-weight: bold; } /* 属性名(id/class): ゴールド */
  .o { color: #569cd6; }                    /* イコール記号等: ブルー */
  .str { color: #ce9178; }                  /* 属性の値: オレンジ */
  .c { color: #6a9955; font-style: italic; } /* コメント: グリーン */
`;

export function ApplyHighlighttoHTML(t) {
  let idx = 0, res = '', s = 0, sC = '', w = '';
  let inTag = false;

  const flush = () => {
    if (!w) return;
    const span = document.createElement("span");
    if (inTag) {
      if (TAGS.includes(w)) span.className = "k";
      else if (ATTRS.includes(w)) span.className = "a";
    }
    if (span.className) {
      span.textContent = w; res += span.outerHTML;
    } else { res += w; }
    w = '';
  };

  while (idx < t.length) {
    const c = t[idx];

    // 1. 文字列（属性値）のパース処理
    if (s) {
      if (c === '\\') { res += c + (t[idx + 1] || ''); idx += 2; continue; }
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === sC) { res += '</span>'; s = 0; } 
      idx++; 
      continue;
    }

    // 2. コメントのパース処理 (<!-- -->)
    if (c === '<' && t[idx + 1] === '!' && t[idx + 2] === '-' && t[idx + 3] === '-') {
      flush(); res += '<span class="c">&lt;!--'; idx += 4;
      while (idx < t.length) {
        if (t[idx] === '-' && t[idx + 1] === '-' && t[idx + 2] === '>') { res += '--&gt;</span>'; idx += 3; break; }
        res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;'); idx++;
      } 
      continue;
    }

    // 3. タグの開始と終了の文脈制御
    if (c === '<') { flush(); inTag = true; res += '&lt;'; idx++; continue; }
    if (c === '>') { flush(); inTag = false; res += '&gt;'; idx++; continue; }

    // 💡【バグ完全粉砕ガード】
    // クォート（" や '）を見つけたとき、『タグの内部（inTag === true）』にいる時だけ文字列モードを起動！
    // タグの外（普通の文章内）にあるアポストロフィ（F69's IDEなど）は、100%安全にスルーさせます！
    if (c === '"' || c === "'") { 
      if (inTag) {
        flush(); 
        sC = c; 
        res += '<span class="str">' + c; 
        s = 1; 
        idx++; 
        continue; 
      }
    }

    const isWordChar = inTag ? /[a-zA-Z0-9_\-]/.test(c) : /[a-zA-Z0-9_]/.test(c);
    if (isWordChar) { 
      w += c; 
    } else {
      if (w) flush();
      if (c === '=' && inTag) {
        const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
      } else { 
        res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
      }
    } 
    idx++;
  }

  if (w) flush(); 
  return res;
}
