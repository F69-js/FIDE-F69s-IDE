// =========================================================
// 🧠 FIDE Static Analysis Engine - V8 Parser Core (Fixed)
// =========================================================
import { isValidV8Builtin } from "./db.js";

/**
 * 渡されたソースコード全体から、宣言された名前を事前にすべてホイスティングする関数
 * @param {string[]} lines - 行配列
 * @returns {Set<string>} 宣言済み識別子のセット
 */
export function hoistingPreScan(lines) {
  const virtualScope = new Set();

  lines.forEach(line => {
    let t = line.trim();
    if (!t || t.startsWith("//") || t.startsWith("/*")) return;

    // 1. function 宣言のホイスティング (配列の1番目の文字列を確実に抽出！)
    const funcMatch = t.match(/(?:async\s+)?function\*?\s+([a-zA-Z0-9_]+)/);
    if (funcMatch && funcMatch[1]) {
      virtualScope.add(funcMatch[1]);
    }

    // 2. 変数・クラス宣言のホイスティング (const, let, var, class)
    const declMatch = t.match(/(?:const|let|var|class)\s+([a-zA-Z0-9_]+)/);
    if (declMatch && declMatch[1]) {
      virtualScope.add(declMatch[1]);
    }

    // 3. アロー関数の宣言ホイスティング
    const arrowMatch = t.match(/([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/);
    if (arrowMatch && arrowMatch[1]) {
      virtualScope.add(arrowMatch[1]);
    }

    // 4. オブジェクト分割代入のホイスティング (安全なループ展開構造)
    const destructuringMatch = t.match(/(?:const|let|var)\s*\{([^}]+)\}/);
    if (destructuringMatch && destructuringMatch[1]) {
      destructuringMatch[1].split(",").forEach(item => {
        let name = item.trim();
        if (name.includes(":")) {
          name = name.split(":")[1].trim(); // エイリアス { original: custom } の右側
        }
        // イコール初期値付きの分割代入 { status = "OK" } に対応
        if (name.includes("=")) {
          name = name.split("=")[0].trim();
        }
        if (name && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
          virtualScope.add(name);
        }
      });
    }
  });

  return virtualScope;
}

/**
 * テキストから「実際に使用されている変数名」を文脈依存で一本釣り抽出する関数
 * @param {string} noStringsText - 文字列リテラルが除去された行テキスト
 * @param {Set<string>} virtualScope - 事前登録スコープ
 * @returns {string[]} 精査が必要な識別子の配列
 */
export function extractContextualUsedWords(noStringsText, virtualScope) {
  let usedWords = [];

  // 💡 【超強化】ドットチェーン（.substring）やオプショナルチェーン（?.replace）を完全抹殺
  let cleanText = noStringsText.replace(/\??\.\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g, " ");

  // 💡 テンプレートリテラル内の生の文字列や、正規表現フラグ（/g）の文字化け・残骸を完全除去
  cleanText = cleanText.replace(/`[^`]*`/g, " ");
  cleanText = cleanText.replace(/\/.*\/[a-z]*/g, " ");

  // オブジェクトのキー定義（key: value）の左側を変数名チェックから除外
  cleanText = cleanText.replace(/[a-zA-Z_\(][a-zA-Z0-9_\)]*\s*:/g, " ");

  // 純粋な英単語の塊だけを正規表現で抽出
  let words = cleanText.match(/[a-zA-Z_\(][a-zA-Z0-9_\)]*/g);

  if (words) {
    words.forEach(w => {
      if (w && isNaN(w) && !isValidV8Builtin(w) && !virtualScope.has(w)) {
        usedWords.push(w);
      }
    });
  }

  return usedWords;
}
