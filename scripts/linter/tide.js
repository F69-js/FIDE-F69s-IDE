let codehaserror = false;

function TIDEPreParse(code) {
    codehaserror = false;
    
    const variablesContainer = document.getElementById("variables") || globalThis.variables;
    if (variablesContainer) variablesContainer.innerHTML = "";
    
    let vars = [];          // 宣言された変数のスタック
    let usedWords = [];     // コード内で使われている変数名のスタック
    
    // 手動の log や push はすべて綺麗に削除！純粋な構文キーワードだけに絞りました
    const RESERVED_WORDS = [
        "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
        "return", "function", "class", "let", "var", "const", "new", "this", "true", 
        "false", "null", "undefined", "window", "document", "globalThis", "_jala"
    ];

    function PreParsePart(part, idx) {
        // 1. 文字列リテラル（"hello" や 'world'）の中身を完全に消去（クォーテーションごとスペース化）
        let noStringsText = part.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, " ").replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, " ");

        // 2. 括弧や演算子などの記号をスペースに変えて単語を切り出す（ドット "." はここでは残す！）
        let cleanTextForWords = noStringsText.replace(/[\(\)\{\}\[\]\s;\+-\/\*%&|=<>!\?,:]/g, " ");
        let wordsInLine = cleanTextForWords.trim().split(/\s+/).filter(Boolean);
        
        wordsInLine.forEach(w => {
            let finalWord = w;

            // 💡 修正：ドットが含まれていたら、分割した「最初の要素（0番目）」だけを確実に切り出す！
            if (finalWord.includes(".")) {
                finalWord = finalWord.split(".")[0];
            }

            // 抽出した結果が数字のみ、または予約語でなければ「使われている変数」として登録
            if (finalWord && isNaN(finalWord) && !RESERVED_WORDS.includes(finalWord)) {
                usedWords.push({
                    name: finalWord,
                    line: idx + 1,
                    all: part
                });
            }
        });
        // 3. 変数宣言のトークン解析（const banana = 20 のスペース対応）
        let tokens = part.trim().split(/\s+/).filter(Boolean);
        for (let i = 0; i < tokens.length; i++) {
            let t = tokens[i];
            
            if (t === "var" || t === "let" || t === "const") {
                let restLine = tokens.slice(i + 1).join("");
                if (!restLine) continue;

                let varName = "";
                let varValue = "undefined";
                let isError = false;
                let errCode = 0;

                if (!restLine.includes("=")) {
                    varName = restLine.replace(/;/g, "");
                    if (t === "const") {
                        isError = true;
                        errCode = 2; // const値なしエラー
                    }
                } else {
                    let eqs = restLine.split("=");
                    varName = eqs[0].replace(/;/g, "");
                    varValue = eqs[1] ? eqs[1].replace(/;/g, "") : "undefined";
                }

                if (RESERVED_WORDS.includes(varName)) {
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
