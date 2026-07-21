let codehaserror = false;

function TIDEPreParse(code) {
    codehaserror = false;
    
    const variablesContainer = document.getElementById("variables") || globalThis.variables;
    if (variablesContainer) variablesContainer.innerHTML = "";
    
    let vars = [];          // 宣言された変数のスタック
    let usedWords = [];     // コード内で使われている変数名のスタック
    
    // 予約語のリスト
    const RESERVED_WORDS = [
        "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
        "return", "function", "class", "let", "var", "const", "new", "this", "true", 
        "false", "null", "undefined", "console", "window", "document", "globalThis", "_jala"
    ];

    function PreParsePart(part, idx) {
        // 💡 改善点1: console.log(...) などのメソッド呼び出しや記号のまわりを整理し、純粋な変数・単語だけを抽出する
        // ドットや括弧をスペースに置き換えてから切り出すことで、合体バグを防ぐ
        let cleanTextForWords = part.replace(/[\(\)\{\}\[\]\.,;:?\+\-\*\/%&|=<>!]/g, " ");
        let wordsInLine = cleanTextForWords.trim().split(/\s+/).filter(Boolean);
        
        wordsInLine.forEach(w => {
            // 純粋な変数名・英単語らしきもの（数字のみの定数や予約語は除外）
            if (isNaN(w) && !RESERVED_WORDS.includes(w)) {
                usedWords.push({
                    name: w,
                    line: idx + 1,
                    all: part
                });
            }
        });

        // 💡 改善点2: 変数宣言の解析を「スペースで分割したトークンベース」に超高性能化
        let tokens = part.trim().split(/\s+/).filter(Boolean);
        
        for (let i = 0; i < tokens.length; i++) {
            let t = tokens[i];
            
            if (t === "var" || t === "let" || t === "const") {
                // 宣言キーワードの後ろにある要素をすべて合体させてスペースを排除（例: ["banana", "=", "20"] ➔ "banana=20"）
                let restLine = tokens.slice(i + 1).join("");
                if (!restLine) continue;

                let varName = "";
                let varValue = "undefined";
                let isError = false;
                let errCode = 0;

                if (!restLine.includes("=")) {
                    // イコールがない場合（例: let a;）
                    varName = restLine.replace(/;/g, "");
                    if (t === "const") {
                        isError = true;
                        errCode = 2; // const値なしエラー
                    }
                } else {
                    // イコールがある場合（例: const banana = 20; または const banana=20;）
                    let eqs = restLine.split("=");
                    varName = eqs[0].replace(/;/g, "");
                    varValue = eqs[1] ? eqs[1].replace(/;/g, "") : "undefined";
                }

                // 予約語の変数名チェック
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
                
                // 1行で複数のvar宣言を追わない単純化のため、この行の処理はブレイク
                break;
            }
        }
    }

    // 各行をスキャン
    let cop = code.split("\n");
    for (let i = 0; i < cop.length; i++) {
        PreParsePart(cop[i], i);
    }

    // 重複チェック
    let declared = [];
    vars.forEach(item => {
        if (item.errorcode === 0) {
            if (declared.includes(item.name)) {
                item.error = true;
                item.errorcode = 1;
            } else {
                declared.push(item.name);
            }
        } else {
            declared.push(item.name);
        }
    });

    // 未定義の参照チェック
    usedWords.forEach(word => {
        if (!declared.includes(word.name)) {
            let alreadyReported = vars.some(v => v.name === word.name && v.errorcode === 3 && v.line === word.line);
            if (!alreadyReported) {
                vars.push({
                    name: word.name,
                    value: "N/A",
                    type: "unknown",
                    error: true,
                    errorcode: 3, // Not Defined
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

    // レンダリング
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
                    q.innerText = "ヒント: 変数 '" + t.name + "' は、まだどこにも作られていません！\n" +
                                  "文字の打ち間違い（タイポ）がないか、または事前に let や const で\n" +
                                  "この変数を作ったかどうかを確認してください。\n予測されるエラー:";
                    c.innerText = "ReferenceError: " + t.name + " is not defined";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
                case 4:
                    q.innerText = "ヒント: '" + t.name + "' はJavaScriptが最初から特別な意味で使用している「予約語」です。\n" +
                                  "これらを変数名として使用することは禁止されています。\n別の名前に変更してください。\n予測されるエラー:";
                    c.innerText = "SyntaxError: Unexpected token '" + t.name + "'";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
                default:
                    q.innerText = "未知のエラーが発生しました。";
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
