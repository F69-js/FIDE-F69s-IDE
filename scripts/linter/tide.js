function TIDEPreParse(code) {
    variables.innerHTML="";
    let vars = [];
    function PreParsePart(part, idx) {
        let cosp = part.split(" ")
        for (var i = 0; i < cosp.length; i++) {
            let t = cosp[i]
            let n = cosp[i + 1]
            if (!t) continue;
            if (t.startsWith("if")) {
                dev("if")
            }
            switch (t) {
                case "var":
                case "let":
                case "const":
                    if (!n.includes("=")) {
                        vars.push({
                            name: n,
                            value: "N/A",
                            type: t,
                            error: true,
                            errorcode: 2,
                            line: idx+1,
                            all: part
                        })
                        break;
                    }
                    let eqs = n.split("=")
                    vars.push({
                        name: eqs[0],
                        value: eqs[1],
                        type: t,
                        error: false,
                        errorcode: 1,
                        line: idx+1,
                        all: part
                    })
                    break;
            }
            continue;
        }
    }
    function PreParseCode(code) {
        let cop = code.split("\n")
        cop.forEach((t, i) => {
            PreParsePart(t, i);
            return;
        })
    }
    PreParseCode(code);
    let declared = []
    let declaredobj = [];
    let c = 0;
    function put() {
        let y = Array.from(document.querySelectorAll(".linenum"))
        y.forEach(t => {
            t.innerText = t.innerText.split("(")[0]
        })
    }
    vars.map((t, i) => {
        if (declared.includes(t.name)) {
            t.error = true;
            return;
        }
        declared.push(t.name)
        c++;
        declaredobj.push(t)
    })
    vars.forEach(t => {
        let m = document.createElement("tr")
        let r = document.createElement("td")
        let g = document.createElement("tr")
        let p = document.createElement("s")
        let q = document.createElement("pre")
        let c = document.createElement("code")
        let l = document.createElement("span")
        let b = document.createElement("br")
        r.classList.add("inline")
        r.innerText = "値:" + t.value
        if (t.error) {
            codehaserror = true
            p.innerText = t.name.toUpperCase()
            g.classList.add("error")
            let ln = document.querySelector("#line"+(t.line-1))
            if(!ln){
                error.innerText+="エラー箇所の取得に失敗しました"
                return;
            }
            ln.classList.add("haserror")
            switch (t.errorcode) {
                case 1:
                    q.innerText = "ヒント:この変数は再定義されていて、実行すると構文エラーになります"
                    q.innerText += "\n変数名を変えるか、const以外に設定してください\n予測されるエラー:";
                    c.innerText = "SyntaxError:Identifier '" + t.name + "' has already been declared";
                    l.innerText = "最初の定義:" + t.line + "行目";
                    l.all = t.all
                    l.lineno = t.line
                    l.tabindex = 0
                    l.classList.add("linenum")
                    break;
                case 2:
                    q.innerText = "ヒント:定数を使用する際は、値が必要です。"
                    q.innerText += "\nこれは、一度設定した定数は変更できないためです。\n予測されるエラー:"
                    c.innerText = "SyntaxError: Missing initializer in const declaration";
                    l.innerText = t.line + "行目";
                    l.lineno = t.line
                    l.all = t.all
                    l.tabindex = 0
                    l.classList.add("linenum")
                    break;
            }
            l.addEventListener("click", (e) => {
                let tgt = e.target
                put()
                tgt.innerText += "(" + tgt.lineno + ":" + tgt.all + ")"
            })
            g.appendChild(p)
            g.appendChild(q)
            g.appendChild(c)
            g.appendChild(b)
            g.appendChild(l)
            variables.appendChild(g)
            return;
        } else {
            let j = document.createElement("td")
            j.innerText = t.type === "const" ? t.name.toUpperCase() + "   [定数]" : t.name
            m.appendChild(j)
        }
        m.appendChild(r)
        variables.appendChild(m)
    })
}
export {TIDEPreParse}
