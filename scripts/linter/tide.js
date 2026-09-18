// F69's IDE (FIDE) - Static Analysis Main Commander 'TIDE' (Part 1)
import { TIDEErrorFactory, isValidV8Builtin, DEPRECATED_WORDS, DEPRECATED_PAIRS, DEPRECATED_STR_METHODS } from "./db.js";
import { hoistingPreScan, extractContextualUsedWords } from "./parser.js";

export let codehaserror = false;

// 💡 フォーク元伝統の変数宣言検証ロジックを完全継承
export function checkVariableDeclaration(tokens, part, lineNo) {
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (t === "var" || t === "let" || t === "const") {
      let rest = tokens.slice(i + 1).join("");
      if (!rest) continue;

      let varName = "", varValue = "undefined", isErr = false;
      if (!rest.includes("=")) {
        varName = rest.replace(/;/g, "");
        if (t === "const") return TIDEErrorFactory.create("MISSING_INITIALIZER", lineNo, part, varName);
      } else {
        let eqs = rest.split("=");
        varName = eqs[0].replace(/;/g, "");
        varValue = eqs[1] ? eqs[1].replace(/;/g, "") : "undefined";
      }

      if (t === "var") return TIDEErrorFactory.create("INVALID_ASSIGNMENT_TO_CONST", lineNo, part, "var"); // 警告代入
      if (!isValidV8Builtin(varName) && varName !== "console") {
        // 通常の正常な宣言オブジェクトを返却
        return { name: varName, value: varValue, type: t, error: false, errorcode: 0, line: lineNo, all: part };
      }
    }
  }
  return null;
}

// 💡 フォーク元伝統のレガシー構文スキャンを完全継承
export function scanDeprecatedSyntax(part, noStringsText, lineNo) {
  let alerts = [];
  let cleanText = noStringsText.split("//")[0];

  if (/\\[0-7]/.test(part)) {
    alerts.push(TIDEErrorFactory.create("BAD_OCTAL_ESCAPE", lineNo, part));
  }

  DEPRECATED_WORDS.forEach(keyword => {
    if (cleanText.includes(keyword)) {
      if (keyword === "with") alerts.push(TIDEErrorFactory.create("STRICT_WITH_STATEMENT", lineNo, part));
      else alerts.push(TIDEErrorFactory.create("UNEXPECTED_TOKEN", lineNo, part, keyword));
    }
  });

  return alerts;
}

// 💡 フォーク元伝統の超親切なHTMLテーブルレンダリングを完全継承（haserror/haswarning完全連動）
export function renderVariables(vars, container) {
  vars.forEach(t => {
    if (!container) return;

    let m = document.createElement("tr"), r = document.createElement("td"), g = document.createElement("tr");
    let p = document.createElement("s"), q = document.createElement("pre"), c = document.createElement("code");
    let l = document.createElement("span"), b = document.createElement("br");

    r.classList.add("inline");
    r.innerText = "値:" + t.value;

    if (t.error) {
      if (t.errorcode !== 5) { codehaserror = true; window.codehaserror = true; }
      
      p.innerText = t.name.toUpperCase();
      g.classList.add("error");
      if (t.errorcode === 5) { g.classList.add("warning"); }

      let ln = document.querySelector("#line" + (t.line - 1));
      if (ln) { ln.classList.add(t.errorcode === 5 ? "haswarning" : "haserror"); }

      // 💡 db.js の超強力なファクトリーから引き出したMDNの正確なログを流し込む！
      q.innerText = t.mdnHint || "ヒント: 構文エラーが検出されました。";
      c.innerText = t.mdnMessage || "SyntaxError";
      l.innerText = "該当箇所: " + t.line + "行目";

      l.lineno = t.line;
      l.allText = t.all;
      l.classList.add("linenum");

      g.appendChild(p); g.appendChild(q); g.appendChild(c); g.appendChild(b); g.appendChild(l);
      container.appendChild(g);
    } else {
      let j = document.createElement("td");
      j.innerText = t.type === "const" ? t.name.toUpperCase() + "   [定数]" : t.name;
      m.appendChild(j); m.appendChild(r);
      container.appendChild(m);
    }
  });
}
// =========================================================
// 司令塔メインエントリーポイント - V8-Turbo Execution Loop
// =========================================================

/**
 * エディタから呼び出され、ソースコード全体をV8スペックで高速静的解析するメイン関数
 * @param {string} code - エディタ内の生のソースコード文字列
 * @returns {boolean} コードに実行不可能な致命的エラーがあるかどうかのフラグ
 */
export function TIDEPreParse(code) {
  // 1. グローバルなエラー状態とHTML表示コンテナを完全に初期化
  codehaserror = false;
  if (typeof window !== "undefined") window.codehaserror = false;
  
  const container = document.getElementById("variables") || globalThis.variables;
  if (container) container.innerHTML = "";

  let vars = [];
  let used = [];
  let alerts = [];

  // ソースコードを行ごとにバラバラに分解
  let cop = code.split("\n");

  try {
    // STAGE 1: V8型・事前スキャン（ホイスティング）
    // 関数宣言、クラス宣言、変数宣言、分割代入の名前をエラー判定の前にあらかじめ完全ホイスティング！
    const declared = hoistingPreScan(cop);

    // STAGE 2: 各行の精査ループ
    cop.forEach((part, i) => {
      let n = i + 1;
      
      // 文字列リテラルやコメント文を物理的に消去して、ピュアな識別子だけにする
      let clean = part.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, " ")
                      .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, " ")
                      .replace(/\/\/.*$/, "");
      
      let tk = part.trim().split(/\s+/).filter(Boolean);

      // A. 変数宣言の妥当性検証
      let decl = checkVariableDeclaration(tk, part, n);
      if (decl) vars.push(decl);

      // B. コンテキスト依存の単語抽出（?.チェーンやキー定義の左側を自動スキップ）
      let words = extractContextualUsedWords(clean, declared);
      words.forEach(w => {
        used.push({ name: w, line: n, all: part });
      });

      // C. レガシー・非推奨構文のスキャン
      let depAlerts = scanDeprecatedSyntax(part, clean, n);
      alerts.push(...depAlerts);
    });

    // STAGE 3: 重複チェックの最終マージ
    vars.forEach(item => {
      if (item.errorcode === 0 || item.errorcode === 5) {
        // すでにホイスティング済み、または他で宣言されている場合は SyntaxError (Identifier declared)
        if (declared.has(item.name)) {
          // 自分自身の宣言行ではない場合のみ重複エラーにする
          const isSameLine = vars.some(v => v.name === item.name && v.line < item.line);
          if (isSameLine) {
            let dupErr = TIDEErrorFactory.create("IDENTIFIER_DECLARED", item.line, item.all, item.name);
            vars.push(dupErr);
          }
        } else {
          declared.add(item.name);
        }
      }
    });

    // STAGE 4: 未定義参照（ReferenceError）のバインド照合
    used.forEach(w => {
      if (!declared.has(w.name)) {
        // すでに同じ行でエラーが登録されていないか重複ガード
        let already = vars.some(v => v.name === w.name && v.errorcode === 3 && v.line === w.line);
        if (!already) {
          let defErr = TIDEErrorFactory.create("NOT_DEFINED", w.line, w.all, w.name);
          vars.push(defErr);
        }
      }
    });

    // STAGE 5: 非推奨アラートのマージ照合
    alerts.forEach(a => {
      let already = vars.some(v => v.name === a.name && v.errorcode === 5 && v.line === a.line);
      if (!already) {
        vars.push(a);
      }
    });

    // STAGE 6: 磨き上げたエラー配列を一表にまとめてHTMLへ美しくレンダリング
    renderVariables(vars, container);

  } catch (fatalParserError) {
    // 💡【万が一のセルフ診断】TIDEエンジン自身がパースに失敗した場合は、自給自足で内部エラーを発生させる！
    console.error("[TIDE V8 Core] Fatal Parsing Crash:", fatalParserError);
    let internalCrash = TIDEErrorFactory.create("TIDE_INTERNAL_PARSE_ERROR", 1, "TIDE_CORE_STREAM");
    vars.push(internalCrash);
    renderVariables(vars, container);
  }

  return codehaserror;
}

