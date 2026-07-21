let codehaserror = false;

function TIDEPreParse(code) {
    codehaserror = false;
    
    const variablesContainer = document.getElementById("variables") || globalThis.variables;
    if (variablesContainer) variablesContainer.innerHTML = "";
    
    let vars = [];          // 宣言された変数のスタック
    let usedWords = [];     // コード内で「使われている」すべての単語のスタック
    
    // JavaScriptの主要な予約語（キーワード）とグローバル標準オブジェクトのリスト
    const RESERVED_WORDS = [
        "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
        "return", "function", "class", "let", "var", "const", "new", "this", "true", 
        "false", "null", "undefined", "console", "window", "document", "globalThis", "_jala"
    ];

    function PreParsePart(part, idx) {
        let cosp = part.trim().split(/\s+/).filter(Boolean);
        
        for (let i = 0; i < cosp.length; i++) {
            let t = cosp[i];
            let n = cosp[i + 1];

            // 💡 高性能化：コード内で使われている単語を「未定義参照チェック用」に全て抽出
            // 記号（+, -, *, /, ;, (, ), {, } 等）をきれいに除去して純粋な英数字の単語にする
            let cleanWord = t.replace(/[+\-*/%&|=<>!(){}[\]\.,;:?"']/g, "").trim();
            if (cleanWord && !RESERVED_WORDS.includes(cleanWord) && isNaN(cleanWord)) {
                usedWords.push({
                    name: cleanWord,
                    line: idx + 1,
                    all: part
                });
            }

            if (!t || !n) continue;

            switch (t) {
                case "var":
                case "let":
                case "const":
                    let varName = "";
                    let varValue = "undefined";
                    let isError = false;
                    let errCode = 0;

                    if (!n.includes("=")) {
                        varName = n.replace(/;/g, "");
                        if (t === "const") {
                            isError = true;
                            errCode = 2; // const初期値なし
                        }
                    } else {
                        let eqs = n.split("=");
                        varName = eqs[0];
                        varValue = eqs[1] || "undefined";
                    }

                    // 💡 新機能：予約語を変数名に使おうとしていないかチェック
                    if (RESERVED_WORDS.includes(varName) && varName !== "console" && varName !== "window") {
                        isError = true;
                        errCode = 4; // 予約語エラー
                    }

                    vars.push({
                        name: varName,
                        value: varValue,
                        type: t,
                        error: isError,
                        errorcode: errCode,
                        line: idx + 1,
                        all: part
                    });
                    break;
            }
        }
    }

    // 各行をスキャン
    let cop = code.split("\n");
    for (let i = 0; i < cop.length; i++) {
        PreParsePart(cop[i], i);
    }

    // 宣言された変数名のリストを抽出
    let declared = [];
    vars.forEach(item => {
        // すでに別のエラー（予約語など）になっていない場合のみ重複チェック
        if (item.errorcode === 0) {
            if (declared.includes(item.name)) {
                item.error = true;
                item.errorcode = 1; // 重複定義エラー
            } else {
                declared.push(item.name);
            }
        } else {
            declared.push(item.name);
        }
    });

    // 💡 🚀 新機能：Not Defined（未定義の参照）をバックグラウンドで全走査！
    usedWords.forEach(word => {
        // 使われている単語が、これまでに「宣言された変数リスト（declared）」に入っていない場合
        if (!declared.includes(word.name)) {
            // 重複して同じ未定義エラーを何個も出さないようにガード
            let alreadyReported = vars.some(v => v.name === word.name && v.errorcode === 3 && v.line === word.line);
            if (!alreadyReported) {
                vars.push({
                    name: word.name,
                    value: "N/A",
                    type: "unknown",
                    error: true,
                    errorcode: 3, // ReferenceError (Not Defined)
                    line: word.line,
                    all: word.all
                });
            }
        }
    });

    function resetLineLabels() {
        let labels = Array.from(document.querySelectorAll(".linenum"));
        labels.forEach(el => {
            if (el && el.innerText) el.innerText = el.innerText.split("(")[0];
        });
    }

    // レンダリング層
    vars.forEach(t => {
        if (!variablesContainer) return;

        let m = document.createElement("tr");
        let r = document.createElement("td");
        let g = document.createElement("tr");
        let p = document.createElement("s");
        let q = document.createElement("pre");
        let c = document.createElement("code");
        let l = document.createElement("span");
        let b = document.createElement("br");

        r.classList.add("inline");
        r.innerText = "値:" + t.value;

        if (t.error) {
            codehaserror = true;
            p.innerText = t.name.toUpperCase();
            g.classList.add("error");

            let ln = document.querySelector("#line" + (t.line - 1));
            if (!ln) {
                const errorBox = document.getElementById("error");
                if (errorBox) errorBox.innerText += `[${t.line}行目] 構文エラーを検知しました\n`;
            } else {
                ln.classList.add("haserror");
            }

            // エラーコードの分岐に初心者が感動する親切ヒントを追加
            switch (t.errorcode) {
                case 1:
                    q.innerText = "ヒント: この変数はすでに別の場所で定義されています。\n" +
                                  "JavaScriptでは同じ変数名を何度も作ることができません。\n変数名を変えてみてください。\n予測されるエラー:";
                    c.innerText = "SyntaxError: Identifier '" + t.name + "' has already been declared";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
                case 2:
                    q.innerText = "ヒント: 定数（const）を作る時は、必ず最初に値をセットする必要があります。\n" +
                                  "あとから値を変更できないルールだからです。\n例: const " + t.name + " = 値;\n予測されるエラー:";
                    c.innerText = "SyntaxError: Missing initializer in const declaration";
                    l.innerText = t.line + "行目";
                    break;
                case 3:
                    // 💡 新設：Not Defined のお助けメッセージ
                    q.innerText = "ヒント: 変数 '" + t.name + "' は、まだどこにも作られていません！\n" +
                                  "文字の打ち間違い（タイポ）がないか、または事前に let や const で\n" +
                                  "この変数を作ったかどうかを確認してください。\n予測されるエラー:";
                    c.innerText = "ReferenceError: " + t.name + " is not defined";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
                case 4:
                    // 💡 新設：予約語テロのお助けメッセージ
                    q.innerText = "ヒント: '" + t.name + "' はJavaScriptが最初から特別な意味で使用している「予約語」です。\n" +
                                  "これらを変数名として使用することは禁止されています。\n別の名前に変更してください。\n予測されるエラー:";
                    c.innerText = "SyntaxError: Unexpected token '" + t.name + "'";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
            }

            l.lineno = t.line;
            l.allText = t.all;
            l.tabIndex = 0;
            l.classList.add("linenum");

            l.addEventListener("click", (e) => {
                let tgt = e.currentTarget;
                resetLineLabels();
                tgt.innerText += "(" + tgt.lineno + ":" + tgt.allText + ")";
            });

            g.appendChild(p);
            g.appendChild(q);
            g.appendChild(c);
            g.appendChild(b);
            g.appendChild(l);
            variablesContainer.appendChild(g);
        } else {
            let j = document.createElement("td");
            j.innerText = t.type === "const" ? t.name.toUpperCase() + "   [定数]" : t.name;
            m.appendChild(j);
            m.appendChild(r);
            variablesContainer.appendChild(m);
        }
    });

    return codehaserror;
}

export { TIDEPreParse };
