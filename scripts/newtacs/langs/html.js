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
    
    // 💡【重要】 w の中身が "/div" や "/body" のようにスラッシュから始まっている場合は、
    // 先頭の "/" を取り除いた純粋なタグ名（div, body）が登録リストにあるかスマートに照合！
    let cleanWord = w;
    if (w.startsWith("/")) {
      cleanWord = w.slice(1);
    }

    if (inTag) {
      if (TAGS.includes(cleanWord)) span.className = "k";      // HTMLタグ名ならエメラルド
      else if (ATTRS.includes(cleanWord)) span.className = "a"; // 属性名ならゴールド
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

    // 4. タグ外クォートの安全ガード
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

    // 💡【閉じタグバグ完全粉砕パッチ】
    // タグの内部（inTag === true）を解析している時に限り、スラッシュ「/」も単語の一部（isWordChar）として
    // 完璧に許容し、タグ名と記号を綺麗に1つの塊（例: /div）としてバインドさせます！
    const isWordChar = inTag ? /[a-zA-Z0-9_\-\/]/.test(c) : /[a-zA-Z0-9_]/.test(c);
    
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
