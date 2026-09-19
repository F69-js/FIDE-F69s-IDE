// FIDE Tacs Highlighter© - Markdown (.md) CodeBlock Embedded Module (v2.0)
import * as Gateway from "./gateway.js";

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

// コードブロックの内部状態を管理するグローバル(モジュール)ステーショナリー
let inCodeBlock = false;
let codeBlockLang = 'js';

export function ApplyHighlighttoMD(t) {
  let idx = 0, res = '', s = 0, w = '';
  const trimText = t.trim();

  // 💡 【核心：コードブロックの開始と終了の検知】
  // 行が "```" で始まっている場合の超高度な多重ルーティング制御！
  if (trimText.startsWith('```')) {
    if (inCodeBlock) {
      // 終了検知：ブロックを閉じて、閉じタグ自体はオレンジ色で発光
      inCodeBlock = false;
      const span = document.createElement("span");
      span.className = "str"; span.textContent = t;
      return span.outerHTML;
    } else {
      // 開始検知： ```py などの記述から埋め込み対象の言語を一本釣り抽出！
      inCodeBlock = true;
      const targetLang = trimText.slice(3).toLowerCase().trim();
      
      // 対応している言語リポジトリに存在するかチェック、なければデフォルトでjs
      codeBlockLang = targetLang ? targetLang : 'js';
      
      const span = document.createElement("span");
      span.className = "str"; span.textContent = t;
      return span.outerHTML;
    }
  }

  // 💡 【コードブロック内部のインターセプトルーティング】
  // ブロックの中にいる間は、Markdownの解析を完全にミュートし、
  // 指定された言語（PythonやC++など）の専門スキャナーに処理を丸投げ委託！
  if (inCodeBlock) {
    if (codeBlockLang === 'js') return Gateway.ApplyHighlighttoJS(t);
    if (codeBlockLang === 'json') return Gateway.ApplyHighlighttoJSON(t);
    if (codeBlockLang === 'html') return Gateway.ApplyHighlighttoHTML(t);
    if (codeBlockLang === 'css') return Gateway.ApplyHighlighttoCSS(t);
    if (codeBlockLang === 'py') return Gateway.ApplyHighlighttoPY(t);
    if (codeBlockLang === 'php') return Gateway.ApplyHighlighttoPHP(t);
    if (codeBlockLang === 'cpp' || codeBlockLang === 'h') return Gateway.ApplyHighlighttoCPP(t);
    if (codeBlockLang === 'cs') return Gateway.ApplyHighlighttoCS(t);
    if (codeBlockLang === 'java') return Gateway.ApplyHighlighttoJAVA(t);
    if (codeBlockLang === 'ts') return Gateway.ApplyHighlighttoTS(t);
    if (codeBlockLang === 'sql') return Gateway.ApplyHighlighttoSQL(t);
    if (codeBlockLang === 'sh') return Gateway.ApplyHighlighttoSH(t);
    if (codeBlockLang === 'yaml' || codeBlockLang === 'yml') return Gateway.ApplyHighlighttoYAML(t);
    if (codeBlockLang === 'toml') return Gateway.ApplyHighlighttoTOML(t);
    if (codeBlockLang === 'rs') return Gateway.ApplyHighlighttoRust(t);
    if (codeBlockLang === 'go') return Gateway.ApplyHighlighttoGo(t);
    if (codeBlockLang === 'rb') return Gateway.ApplyHighlighttoRuby(t);
    if (codeBlockLang === 'kt' || codeBlockLang === 'kts') return Gateway.ApplyHighlighttoKT(t);
    if (codeBlockLang === 'swift') return Gateway.ApplyHighlighttoSwift(t);
    if (codeBlockLang === 'dart') return Gateway.ApplyHighlighttoDart(t);
    if (codeBlockLang === 'r') return Gateway.ApplyHighlighttoR(t);
    if (codeBlockLang === 'dockerfile') return Gateway.ApplyHighlighttoDocker(t);
    return Gateway.ApplyHighlighttoJS(t);
  }

  // ─── 以下、通常のMarkdownスキャンロジック（鉄壁版） ───
  if (trimText.startsWith('#')) {
    const span = document.createElement("span"); span.className = "k"; span.textContent = t; return span.outerHTML;
  }
  if (trimText.startsWith('>')) {
    const span = document.createElement("span"); span.className = "b"; span.textContent = t; return span.outerHTML;
  }

  while (idx < t.length) {
    const c = t[idx];
    if (s) {
      res += c.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (c === '`') { res += '</span>'; s = 0; } idx++; continue;
    }
    if (c === '`') {
      res += '<span class="str">`'; s = 1; idx++; continue;
    }
    if (c === '*' && t[idx + 1] === '*') {
      res += '<span class="a">**'; idx += 2;
      while (idx < t.length) {
        if (t[idx] === '*' && t[idx + 1] === '*') { res += '**</span>'; idx += 2; break; }
        res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;'); idx++;
      } continue;
    }
    if (c === '[') {
      res += '<span class="o">[</span><span class="s">'; idx++;
      while (idx < t.length) {
        if (t[idx] === ']') {
          res += '</span><span class="o">]</span>'; idx++;
          if (t[idx] === '(') {
            res += '<span class="o">(</span><span class="prop">'; idx++;
            while (idx < t.length) {
              if (t[idx] === ')') { res += '</span><span class="o">)</span>'; idx++; break; }
              res += t[idx]; idx++;
            }
          } break;
        }
        res += t[idx].replace(/</g, '&lt;').replace(/>/g, '&gt;'); idx++;
      } continue;
    }
    if (idx === 0 && ['-', '*', '+'].includes(c) && t[idx + 1] === ' ') {
      const span = document.createElement("span"); span.className = "m"; span.textContent = c; res += span.outerHTML;
    } else if (['|', '[', ']', '(', ')', '#', '`'].includes(c)) {
      const span = document.createElement("span"); span.className = "o"; span.textContent = c; res += span.outerHTML;
    } else {
      res += c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    idx++;
  }
  return res;
}
