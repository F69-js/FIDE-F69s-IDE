// =========================================================
// 🧠 FIDE Static Analysis Engine - V8-Turbo Parser Core
// =========================================================
import { isValidV8Builtin } from "./db.js";

/**
 * 渡されたソースコード全体から、function宣言、class宣言、および変数宣言を
 * 事前にすべて抽出してホイスティング（仮想スコープへの事前登録）を行う関数
 * @param {string[]} lines - 改行で分割されたソースコードの行配列
 * @returns {Set<string>} 事前登録された安全な識別子（名前）のセット
 */
export function hoistingPreScan(lines) {
  const virtualScope = new Set();

  lines.forEach(line => {
    let t = line.split("//")[0].split("/*")[0].trim(); // コメントを物理的に完全除去
    if (!t) return;

    // 1. function 宣言のホイスティング (async function* 含む)
    const funcMatch = t.match(/(?:async\s+)?function\*?\s+([a-zA-Z0-9_]+)/);
    if (funcMatch && funcMatch[1]) {
      virtualScope.add(funcMatch[1]);
    }

    // 2. 基本的な変数・クラス宣言のホイスティング (const, let, var, class)
    const declMatch = t.match(/(?:const|let|var|class)\s+([a-zA-Z0-9_]+)/);
    if (declMatch && declMatch[1]) {
      virtualScope.add(declMatch[1]);
    }

    // 3. アロー関数の宣言ホイスティング (例: const test = () =>)
    const arrowMatch = t.match(/([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/);
    if (arrowMatch && arrowMatch[1]) {
      virtualScope.add(arrowMatch[1]);
    }

    // 4. モダンなオブジェクト分割代入のホイスティング (例: const { version, author } = ...)
    const destructuringMatch = t.match(/(?:const|let|var)\s*\{([^}]+)\}/);
    if (destructuringMatch && destructuringMatch[1]) {
      destructuringMatch[1].split(",").forEach(item => {
        let name = item.split(":")[0].trim(); // コロンの左側（または単体の変数名）を取得
        // エイリアス形式 { original: customName } の場合は右側を取得
        if (item.includes(":")) {
          const parts = item.split(":");
          name = parts[1] ? parts[1].trim() : parts[0].trim();
        }
        // 変数名として有効な形であればスコープに追加
        if (name && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
          virtualScope.add(name);
        }
      });
    }
  });

  return virtualScope;
}

/**
 * 静的解析のために、テキストから「実際に使用されている変数名・単語」を
 * V8級のコンテキスト・アウェア（文脈依存）ロジックで安全に一本釣り抽出する関数
 * @param {string} noStringsText - 文字列リテラルがすでに除去された行テキスト
 * @param {Set<string>} virtualScope - 事前登録済みのユーザー定義スコープ
 * @returns {string[]} エラーチェックが必要な、使用されている単語の配列
 */
export function extractContextualUsedWords(noStringsText, virtualScope) {
  let usedWords = [];

  // 💡【V8型コンテキスト防壁】
  // ドットチェーン（.prop）やオプショナルチェイニング（?.prop）、および空白や改行を挟んだ
  // プロパティアクセスを、単語に分解するより前の最上流の段階で物理的に完全消滅させます！
  let cleanText = noStringsText.replace(/\??\.\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g, " ");

  // オブジェクトリテラルのキー定義（例: version: "v4"）の左側も変数名チェックから除外！
  cleanText = cleanText.replace(/[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/g, " ");

  // 純粋な英単語・識別子の塊だけを正規表現で抽出
  let words = cleanText.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/g);

  if (words) {
    words.forEach(w => {
      // 数値のみのデータではなく、db.jsのビルトイン安全辞書にも、
      // 事前スキャンしたユーザー定義スコープにも含まれていない「未知の単語」だけを精査対象として一本釣り！
      if (w && isNaN(w) && !isValidV8Builtin(w) && !virtualScope.has(w)) {
        usedWords.push(w);
      }
    });
  }

  return usedWords;
}
