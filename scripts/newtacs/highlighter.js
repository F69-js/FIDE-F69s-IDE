// FIDE Custom IDE - Text-as-colors (Tacs) Main Router© (v7.2 Fixed)
import { ApplyHighlighttoJS } from "./langs/js.js";
import { ApplyHighlighttoJSON } from "./langs/json.js";
import { ApplyHighlighttoHTML } from "./langs/html.js";
import { ApplyHighlighttoCSS } from "./langs/css.js";

// 💡 【重要】起動時にファイル名が未指定であっても、絶対にフリーズさせず
// デフォルトでJSモードとして大起動させるための鉄壁の初期値ロック！
let currentLang = 'js';

/**
 * ファイル名から拡張子を自動検知して現在の動作言語を切り替える
 * @param {string} filename 
 */
export function detectLanguageByExtension(filename) {
  // 💡 【バグ撃退】名前が指定されていない（空っぽの）時は、安全にJSモードとしてフォールバック！
  if (!filename || !filename.trim()) {
    currentLang = 'js';
    console.log("[Tacs© Router] 📝 ファイル名未指定のため、デフォルトのJSモードを維持します");
    return;
  }

  const ext = filename.split('.').pop().toLowerCase();
  
  // 💡 指定された拡張子がプラグインとして登録されている場合のみ切り替え
  if (['js', 'json', 'html', 'css'].includes(ext)) {
    currentLang = ext;
    console.log(`[Tacs© Router] 🔍 言語プラグインが有効化されました: ${ext.toUpperCase()}モード`);
  } else {
    // 💡 .txt など、未知の拡張子の場合もJSモードに安全に逃がす
    currentLang = 'js';
    console.log(`[Tacs© Router] ⚠️ 未知の拡張子 "${ext}" のため、JSモードを適用します`);
  }
}

/**
 * メインエディタの行要素を検知してダイナミックに各言語プラグインへ処理を分配する
 */
export function applyFIDEHighlight() {
  const lines = document.querySelectorAll(".line");
  lines.forEach(line => {
    const plainText = line.innerText.replace(/\|/g, "\t");
    
    let highlightedHtml = '';
    
    // 💡 起動直後から currentLang が必ず 'js' に初期化されているため、
    // ここで参照エラーを起こしてフリーズする心配は100%完全に消滅しました！
    if (currentLang === 'json') {
      highlightedHtml = ApplyHighlighttoJSON(plainText);
    } else if (currentLang === 'html') {
      highlightedHtml = ApplyHighlighttoHTML(plainText);
    } else if (currentLang === 'css') {
      highlightedHtml = ApplyHighlighttoCSS(plainText);
    } else {
      highlightedHtml = ApplyHighlighttoJS(plainText);
    }
    
    line.innerHTML = highlightedHtml.replace(/\t/g, "|");
  });
}
