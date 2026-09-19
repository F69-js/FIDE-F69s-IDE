// FIDE Tacs Highlighter© - Markdown (.md) Plugin Module (True Final Fixed)

// 💡 拡張性抜群！Markdown専用のミニマルネオンカラーパレットを完全内蔵
export const MDtheme = `
  .k { color: #569cd6; font-weight: bold; }   /* 見出し(#): ブルー */
  .a { color: #ff007f; font-weight: bold; }   /* 太字(**)・斜体: ネオンピンク */
  .s { color: #f2c94c; font-weight: bold; }   /* リンクのテキスト: ゴールド */
  .b { color: #4ec9b0; }                      /* 引用(>): エメラルド */
  .m { color: #dcdcaa; }                      /* リスト記号(-/*): ライトイエロー */
  .o { color: #ffffff; }                      /* 区切り記号: 白 */
  .str { color: #ce9178; }                    /* インラインコード・コードブロック: オレンジ */
  .prop { color: #9cdcfe; }                   /* リンクのURL部分: ライトブルー */
  .c { color: #6a9955; font-style: italic; }   /* 注釈・コメント: グリーン */
`;

/**
 * Markdown用のText-as-colorsスキャンを実行する関数
 * @param {string} t - 生の行テキスト
 * @returns {string} HTML要素文字列
 */
export function ApplyHighlighttoMD(t) {
  let idx = 0, res = '', s = 0, w = '';
  
  // 行全体の文脈（行頭の見出しやリスト）を一瞬でチェックするための簡易フラグ
  const trimText = t.trim();

  // 1. 行頭の見出し判定（# Header）
  if (trimText.startsWith('#')) {
    const span = document.createElement("span");
    span.className = "k";
    span.textContent = t;
    return span.outerHTML;
  }

  // 2. 行頭の引用判定（> Quote）
  if (trimText.startsWith('>')) {
    const span = document.createElement("span");
    span.className = "b";
    span.textContent = t;
    return span.outerHTML;
  }

  // 3. 1文字ずつの高速クリーン・シリアルスキャン
  while (idx < t.length) {
    const c = t[idx];

    // インラインコード（`code`）のパース処理
    if (s) {
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === '`') {
        res += '</span>';
        s = 0;
      }
      idx++;
      continue;
    }

    // バッククォートを見つけたらインラインコードモード（オレンジ）へ突入！
    if (c === '`') {
      res += '<span class="str">`';
      s = 1;
      idx++;
      continue;
    }

    // 太字（**bold**）のトークン検出
    if (c === '*' && t[idx + 1] === '*') {
      res += '<span class="a">**';
      idx += 2;
      while (idx < t.length) {
        if (t[idx] === '*' && t[idx + 1] === '*') {
          res += '**</span>';
          idx += 2;
          break;
        }
        res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;');
        idx++;
      }
      continue;
    }

    // リンク記法（[Text](URL)）のコンテキスト検出
    if (c === '[') {
      res += '<span class="o">[</span><span class="s">';
      idx++;
      while (idx < t.length) {
        if (t[idx] === ']') {
          res += '</span><span class="o">]</span>';
          idx++;
          if (t[idx] === '(') {
            res += '<span class="o">(</span><span class="prop">';
            idx++;
            while (idx < t.length) {
              if (t[idx] === ')') {
                res += '</span><span class="o">)</span>';
                idx++;
                break;
              }
              res += t[idx];
              idx++;
            }
          }
          break;
        }
        res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;');
        idx++;
      }
      continue;
    }

    // 一般的な記号・箇条書き（-, *, +, |）の着色
    if (idx === 0 && ['-', '*', '+'].includes(c) && t[idx + 1] === ' ') {
      const span = document.createElement("span");
      span.className = "m"; span.textContent = c; res += span.outerHTML;
    } else if (['|', '[', ']', '(', ')', '#', '`'].includes(c)) {
      const span = document.createElement("span");
      span.className = "o"; span.textContent = c; res += span.outerHTML;
    } else {
      res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    idx++;
  }

  return res;
}
