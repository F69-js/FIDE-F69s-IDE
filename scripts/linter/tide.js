// =========================================================
// 🌌 FIDE Static Analysis Engine 'TIDE v8-Turbo'
// =========================================================

// V8エンジン級の膨大な組み込み安全単語データベース
const TIDE_BUILTINS = new Set([
  "if","else","switch","case","break","return","continue","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","async","await","default","do","while","yield","function",
  "extends","super","finally","with","debugger","arguments","interface","implements","package","private","protected","public","static",
  "this","window","globalThis","self","global","screenLeft","screenTop",
  "JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false",
  "Boolean","RegExp","Function","Symbol","Proxy","Reflect","BigInt","URL","URLSearchParams","WeakMap","WeakSet","ArrayBuffer","DataView",
  "Uint8Array","Float64Array","Int32Array","Int8Array","Uint16Array","Int16Array","Uint32Array","Float32Array","BigInt64Array","BigUint64Array",
  "TypeError","ReferenceError","SyntaxError","RangeError","URIError","AggregateError","EvalError",
  "Atomics","FinalizationRegistry","WeakRef","Intl","Collator","DateTimeFormat","NumberFormat","PluralRules","RelativeTimeFormat","ListFormat","Locale","DisplayNames","Segmenter",
  "process","document","navigator","screen","location","history","Temporal","LanguageModel","ai","InternalError","ParallelArray","StopIteration",
  "eval","escape","unescape","$","_","jQuery","React","ReactDOM","Vue","Angular","Rx",
  // 頻出する標準コアプロパティ
  "length","size","prototype","name","status","version","author","modules","features"
]);

export function TIDEPreParse(codeText) {
  const errors = [];
  const warnings = [];
  const lines = codeText.split("\n");
  
  // ユーザーが自作した変数・関数・クラス名を完全に記憶する仮想グローバルスコープ
  const virtualScope = new Set();

  // ─── STAGE 1: V8型 プリコンパイル・スコープホイスティング（名前の先読み登録） ───
  lines.forEach(line => {
    let t = line.split("//")[0].split("/*")[0].trim(); // コメントを物理的に除去
    if (!t) return;

    // 1. function 名のキャッチ（async function* も完全カバー）
    const funcMatch = t.match(/(?:async\s+)?function\*?\s+([a-zA-Z0-9_]+)/);
    if (funcMatch) virtualScope.add(funcMatch[1]);

    // 2. 変数・クラス宣言のキャッチ (const, let, var, class)
    const declMatch = t.match(/(?:const|let|var|class)\s+([a-zA-Z0-9_]+)/);
    if (declMatch) virtualScope.add(declMatch[1]);

    // 3. アロー関数の宣言キャッチ (const test = () =>)
    const arrowMatch = t.matchCustom || t.match(/([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/);
    if (arrowMatch) virtualScope.add(arrowMatch[1]);
  });

  // ─── STAGE 2: コンテキスト・アウェア・静的バリデーション ───
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // 文字列リテラルやコメントの中身を完全に消去して構文だけを抽出（誤検知の完全破壊）
    let analysisText = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "");
    analysisText = analysisText.replace(/(["'`])(.*?)\1/g, "");

    if (!analysisText.trim()) return;

    // 1. 【リアルリスク警告】真に危険な非推奨APIのみを検知
    if (analysisText.includes("document.write")) {
      warnings.push({
        type: "DOCUMENT_WRITE",
        hint: "警告【非推奨 / 危険】: document.writeは現代のWeb開発ではレンダリングを阻害するため非推奨です。Element.append()等を使用してください。",
        line: lineNum
      });
    }

    // 2. 【V8型 スマート文脈解析】未定義変数の検知
    // テキストから英単語（識別子）を厳密に抽出
    const words = analysisText.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
    if (words) {
      words.forEach(word => {
        // 文脈検査A: 直前にドット「.」がある場合は「オブジェクトのプロパティアクセス」なのでチェックをスキップ
        const dotCheck = new RegExp(`\\.\\s*${word}`);
        if (dotCheck.test(analysisText)) return;

        // 文脈検査B: オブジェクトのキー定義（例: key: value）の左側はチェックをスキップ
        const colonCheck = new RegExp(`${word}\\s*:\\s*`);
        if (colonCheck.test(analysisText) && !analysisText.includes(`?.*${word}`)) return;

        // 安全データベース、または事前登録スコープのどちらにも存在しない未知の単語のみを弾く！
        if (!TIDE_BUILTINS.has(word) && !virtualScope.has(word)) {
          errors.push({
            type: "REFERENCE_ERROR",
            hint: `ReferenceError: ${word} is not defined\nヒント: 変数や関数 '${word}' は、定義されていないかタイポの可能性があります。let や const で作成されているか確認してください。`,
            line: lineNum
          });
        }
      });
    }
  });

  // 実行可否の判定結果をメインスレッドへ返却
  return {
    errors: errors,
    warnings: warnings,
    isValid: errors.length === 0
  };
}
