let codehaserror = false; 
const RESERVED_WORDS = ["if", "else", "for", "while", "do", "switch", "case", "break", "continue","return", "function", "class", "let", "var", "const", "new", "this", "true","false", "null", "undefined", "window", "document", "globalThis", "_jala", "console"];
const DEPRECATED_SINGLE_WORDS = ["substr", "substring", "escape", "unescape", "with", "caller", "showModalDialog","applicationCache", "AppCache"];
const DEPRECATED_PAIRS = {"document": ["all", "write", "alinkColor", "bgColor", "fgColor", "linkColor", "vlinkColor", "anchors", "applets"],"navigator": ["getUserMedia"],"KeyboardEvent": ["keyCode"],"Object.prototype": ["proto"]};
const DEPRECATED_STRING_METHODS = ["anchor", "big", "blink", "bold", "fixed", "fontcolor", "fontsize", "italics","link", "small", "strike", "sub", "sup"];
function checkVariableDeclaration(tokens, part, lineNo) {
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
                if (t === "const") { isError = true; errCode = 2; }
            } else {
                let eqs = restLine.split("=");
                varName = eqs[0].replace(/;/g, "");
                varValue = eqs[1] ? eqs[1].replace(/;/g, "") : "undefined";
            }

            if (t === "var") { isError = true; errCode = 5; }
            if (RESERVED_WORDS.includes(varName) && varName !== "console") { isError = true; errCode = 4; }

            return { name: varName, value: varValue, type: t, error: isError, errorcode: errCode, line: lineNo, all: part };
        }
    }
    return null;
}
function extractUsedWords(noStringsText, part, lineNo) {
    let usedWords = [];
    let cleanText = noStringsText.replace(/[\(\)\{\}\[\]\s;\+-\/\*%&|=<>!\?,:]/g, " ");
    let words = cleanText.trim().split(/\s+/).filter(Boolean);
    
    words.forEach(w => {
        let finalWord = w;
        if (finalWord.includes(".")) {
            finalWord = finalWord.split(".")[0];
        }
        if (finalWord && isNaN(finalWord) && !RESERVED_WORDS.includes(finalWord)) {
            usedWords.push({ name: finalWord, line: lineNo, all: part });
        }
    });
    return usedWords;
}
function scanDeprecatedSyntax(part, noStringsText, lineNo) {
    let alerts = [];

    if (/\\[0-7]/.test(part)) {
        alerts.push({ name: "octal_escape", line: lineNo, all: part });
    }

    DEPRECATED_SINGLE_WORDS.forEach(keyword => {
        if (noStringsText.includes(keyword)) {
            alerts.push({ name: keyword, line: lineNo, all: part });
        }
    });

    Object.keys(DEPRECATED_PAIRS).forEach(objName => {
        DEPRECATED_PAIRS[objName].forEach(propName => {
            let pairRegex = new RegExp(objName + "\\s*\\.\\s*" + propName);
            if (pairRegex.test(noStringsText) || (objName === "document" && noStringsText.includes("." + propName))) {
                alerts.push({ name: propName, line: lineNo, all: part });
            }
        });
    });

    if (noStringsText.includes("keyCode")) alerts.push({ name: "keyCode", line: lineNo, all: part });
    if (noStringsText.includes("__proto__")) alerts.push({ name: "__proto__", line: lineNo, all: part });

    DEPRECATED_STRING_METHODS.forEach(method => {
        if (noStringsText.includes("." + method)) {
            alerts.push({ name: method, line: lineNo, all: part });
        }
    });

    return alerts;
}
function renderVariables(vars, variablesContainer) {
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
            if (t.errorcode !== 5) { codehaserror = true; }
            
            p.innerText = t.name.toUpperCase();
            g.classList.add("error");
            if (t.errorcode === 5) { g.classList.add("warning"); }

            let ln = document.querySelector("#line" + (t.line - 1));
            if (ln) { ln.classList.add(t.errorcode === 5 ? "haswarning" : "haserror"); }

            switch (t.errorcode) {
                case 1:
                    q.innerText = "ヒント: この変数はすでに別の場所で定義されています。\nJavaScriptでは同じ変数名を何度も作ることができません。\n変数名を変えてみてください。\n予測されるエラー:";
                    c.innerText = "SyntaxError: Identifier '" + t.name + "' has already been declared";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
                case 2:
                    q.innerText = "ヒント: 定数（const）を作る時は、必ず最初に値をセットする必要があります。\nあとから値を変更できないルールだからです。\n例: const " + t.name + " = 値;\n予測されるエラー:";
                    c.innerText = "SyntaxError: Missing initializer in const declaration";
                    l.innerText = t.line + "行目";
                    break;
                case 3:
                    q.innerText = "ヒント: 変数 '" + t.name + "' は、まだどこにも作られていません！\n文字の打ち間違い（タイポ）がないか、または事前に let や const で\nこの変数を作ったかどうかを確認してください。\n予測されるエラー:";
                    c.innerText = "ReferenceError: " + t.name + " is not defined";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
                case 4:
                    q.innerText = "ヒント: '" + t.name + "' はJavaScriptが最初から特別な意味で使用している「予約語」です。\nこれらを変数名として使用することは禁止されています。\n別の名前に変更してください。\n予測されるエラー:";
                    c.innerText = "SyntaxError: Unexpected token '" + t.name + "'";
                    l.innerText = "エラー発生箇所: " + t.line + "行目";
                    break;
                case 5:
                    q.innerText = "警告【非推奨 / 危険】: レガシーまたは非推奨の構文 '" + t.name + "' が検出されました！\n";
                    if (t.name === "var") {
                        q.innerText += "現代のJavaScriptでは『let』か『const』を使うのが安全な鉄則です。";
                        c.innerText = "Warning: 'var' is deprecated. Use 'let' or 'const' instead.";
                    } else if (t.name === "with") {
                        q.innerText += "with文はコードの予測を不可能にし、バグの温床になるため厳しく禁止されています。";
                        c.innerText = "SyntaxError: Strict mode code may not include a with statement";
                    } else if (t.name === "caller") {
                        q.innerText += "arguments.caller および callee は現代の厳格モードでは使用できません。";
                        c.innerText = "TypeError: 'caller' object is not accessible in strict mode";
                    } else if (t.name === "__proto__") {
                        q.innerText += ".__proto__ は古い仕様です。代わりに Object.getPrototypeOf() を使用してください。";
                        c.innerText = "Warning: Use Object.getPrototypeOf() instead of __proto__";
                    } else if (["anchor", "big", "blink", "bold", "fixed", "fontcolor", "fontsize", "italics", "link", "small", "strike", "sub", "sup"].includes(t.name)) {
                        q.innerText += "String.prototype のHTML生成メソッドは完全に非推奨です。CSSやDOM操作を使いましょう。";
                        c.innerText = "Warning: HTML wrapper methods are deprecated. Use DOM manipulation.";
                    } else if (t.name === "keyCode") {
                        q.innerText += "KeyboardEvent.keyCode は非推奨です。代わりに .key または .code を使用してください。";
                        c.innerText = "Hint: Use event.key instead of event.keyCode";
                    } else if (t.name === "all") {
                        q.innerText += "document.all はIE時代の遺物であり完全に非推奨です。getElementById 等を使用してください。";
                        c.innerText = "Warning: document.all is deprecated. Use standard DOM selection APIs.";
                    } else if (t.name === "write") {
                        q.innerText += "document.write() はページのパースを破壊する恐れがあります。textContent等を使いましょう。";
                        c.innerText = "Warning: document.write() is a huge anti-pattern.";
                    } else if (t.name === "showModalDialog") {
                        q.innerText += "window.showModalDialog() は完全に廃止されました。HTMLの <dialog> 要素を使いましょう。";
                        c.innerText = "TypeError: window.showModalDialog is not a function";
                    } else if (t.name === "getUserMedia") {
                        q.innerText += "navigator.getUserMedia は古い型です。navigator.mediaDevices.getUserMedia を使います。";
                        c.innerText = "Hint: Use navigator.mediaDevices.getUserMedia()";
                    } else if (t.name === "octal_escape") {
                        q.innerText += "8進数エスケープシーケンス (\\0〜\\7) は、厳格モードのエディタでは使用が禁止されています。";
                        c.innerText = "SyntaxError: Octal escape sequences are not allowed in strict mode.";
                    } else if (["alinkColor", "bgColor", "fgColor", "linkColor", "vlinkColor", "anchors", "applets"].includes(t.name)) {
                        q.innerText += "document." + t.name + " などの古いオブジェクト/プロパティは非推奨です。現代のDOM APIを使用してください。";
                        c.innerText = "Warning: Legacy document property is deprecated.";
                    } else if (t.name.includes("Cache") || t.name === "applicationCache") {
                        q.innerText += "AppCache（Application Cache）は完全に廃止されました。代わりに Service Workers を使用してください。";
                        c.innerText = "Warning: AppCache is deprecated. Use Service Workers.";
                    } else {
                        q.innerText += "この構文は古い仕様のため非推奨です。新しい代替の構文に書き換えてください。";
                        c.innerText = "Hint: Use '.slice()' instead of '." + t.name + "()'";
                    }
                    l.innerText = "該当箇所: " + t.line + "行目";
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

            g.appendChild(p); g.appendChild(q); g.appendChild(c); g.appendChild(b); g.appendChild(l);
            variablesContainer.appendChild(g);
        } else {
            let j = document.createElement("td");
            j.innerText = t.type === "const" ? t.name.toUpperCase() + "   [定数]" : t.name;
            m.appendChild(j); m.appendChild(r);
            variablesContainer.appendChild(m);
        }
    });
}
function TIDEPreParse(code) {
    codehaserror = false;
    const variablesContainer = document.getElementById("variables") || globalThis.variables;
    if (variablesContainer) variablesContainer.innerHTML = "";
    
    let vars = [];          
    let usedWords = [];     
    let deprecatedAlerts = []; 

    // ① 各行をバラして3つの独立スキャナーを実行
    let cop = code.split("\n");
    cop.forEach((part, i) => {
        let lineNo = i + 1;
        let noStringsText = part.replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, " ").replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, " ");
        let tokens = part.trim().split(/\s+/).filter(Boolean);

        let decl = checkVariableDeclaration(tokens, part, lineNo);
        if (decl) vars.push(decl);

        usedWords.push(...extractUsedWords(noStringsText, part, lineNo));
        deprecatedAlerts.push(...scanDeprecatedSyntax(part, noStringsText, lineNo));
    });

    // ② 重複チェック
    let declared = [];
    vars.forEach(item => {
        if (item.errorcode === 0 || item.errorcode === 5) {
            if (declared.includes(item.name)) { item.error = true; item.errorcode = 1; }
            else { declared.push(item.name); }
        } else {
            declared.push(item.name);
        }
    });

    // ③ 未定義参照の照合
    usedWords.forEach(word => {
        if (!declared.includes(word.name)) {
            let already = vars.some(v => v.name === word.name && v.errorcode === 3 && v.line === word.line);
            if (!already) vars.push({ name: word.name, value: "N/A", type: "unknown", error: true, errorcode: 3, line: word.line, all: word.all });
        }
    });

    // ④ 非推奨アラートの照合
    deprecatedAlerts.forEach(alert => {
        let already = vars.some(v => v.name === alert.name && v.errorcode === 5 && v.line === alert.line);
        if (!already) vars.push({ name: alert.name, value: "Warning", type: "deprecated", error: true, errorcode: 5, line: alert.line, all: alert.all });
    });

    // ⑤ 画面へのレンダリング処理（後半へ続く）
    renderVariables(vars, variablesContainer);

    return codehaserror;
}
export { TIDEPreParse } 
