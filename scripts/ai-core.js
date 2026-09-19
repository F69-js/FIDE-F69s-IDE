// FIDE Custom IDE - Built-in AI (Prompt API) Core Interface Module (v1.0.1 Stable)
import { detectLanguageByExtension, applyFIDEHighlight } from "./highlighter.js";

export let sysprompt = `
ユーザーの指示と現在のコード(raw)を元に、不具合の修正と詳細な解説を行ってください。

【出力の絶対ルール】
1. Markdown記号（\`\`\`、**、*、#、\` など）は画面が崩れるため、絶対に、1文字も使用しないでください。
2. 太字や見出しを表現したい場合は、記号を使わず「■ 修正理由」「■ 詳しい解説」のように単語の前に四角などの記号（■、・）を付けて表現してください。
3. すべての出力の最初（1行目）には、必ず「空行（改行）」を1行入れてから文字を開始してください。
4. コードを出力する際は、必ず指定の形式「[!code_editor 対象のファイル名]」を使用してください。

【出力フォーマット】

修正が必要な場合：
■ 修正理由
[ここに、どこがどう間違えているのかを初心者向けに優しく詳細に記述]

■ 詳しい解説
[・を使って、なぜそのエラーが起きるのか、どういう仕組みなのかを構造的に詳しく解説]

[!code_editor 現在扱っているファイル名]
// 修正後のコード

修正が不要な場合：
■ コードの評価
[現在のコードがどれだけ適切かを褒めつつ、詳細に記述]

■ 仕組みの解説
[・を使って、このコードがどのように動作しているのかを構造的に詳しく解説]

[!code_editor 現在扱っているファイル名]
// 現在のコード

`;

// 💡 外部からメインの rawText 状態と現在の lineID を受け取って一括反映させるAI初期化＆送信コア
export async function initBuiltInAI() {
    if (!window.LanguageModel) {
        if (globalThis.available) globalThis.available.hidden = true;
        if (globalThis.ainotavailable) globalThis.ainotavailable.hidden = false;
        return;
    }
    try {
        const capabilities = await window.LanguageModel.availability();
        if (capabilities === "no") {
            if (globalThis.available) globalThis.available.hidden = true;
            if (globalThis.ainotavailable) globalThis.ainotavailable.hidden = false;
        }
    } catch (e) {
        if (globalThis.available) globalThis.available.hidden = true;
        if (globalThis.ainotavailable) globalThis.ainotavailable.hidden = false;
    }
}

export async function sendBtnCheck(getRawTextFn, setRawTextFn, doEnterFn) {
    if (globalThis.aienable && !globalThis.aienable.checked) {
        if (globalThis.aioutput) globalThis.aioutput.innerText = "AI機能は設定で無効化されています。";
        return;
    }
    if (!window.LanguageModel) {
        alert("お使いのブラウザはBuilt-in AIに対応していません。");
        return;
    }

    const promptText = globalThis.aiinput ? globalThis.aiinput.value.trim() : "";
    if (!promptText) return;

    if (globalThis.aioutput) globalThis.aioutput.innerText = "AIが思考中...";

    try {
        const session = await window.LanguageModel.create({
            expectedOutputLanguage: 'ja',
            initialPrompts: [{ role: "system", content: sysprompt }]
        });

        const currentFileName = globalThis.filenamei ? (globalThis.filenamei.value || "F69sIDE.js") : "F69sIDE.js";
        const currentRaw = getRawTextFn();

        const fullPrompt = `
[!PROMPT]
\${promptText}

[!RAWCODE]
[!code_editor \({currentFileName}]\){currentRaw}
        `.trim();

        const response = await session.prompt(fullPrompt);
        session.destroy();

        const codeBlockRegex = /\[!code_editor\s+([^\]]+)\]([\s\S]*?)(?:\`\`\`|\$)/;
        const match = response.match(codeBlockRegex);

        let explanation = response;
        if (match) {
            const extractedCode = match[2].trim();
            explanation = response.replace(codeBlockRegex, "").trim();
            
            // 💡 メインエディタのテキスト状態をAI側から安全に一括更新デプロイ！
            undoStack.push(currentRaw);
            globalThis.redoStack = [];
            setRawTextFn("");
            
            const lines = extractedCode.split(/\r?\n/);
            globalThis.maincontainer.innerHTML = `
                <div id="lineGroup0" class="group">
                   <div id="lineno0" class="lineno">1</div>
                   <div id="line0" class="line">${lines[0] || ""}</div>
                   <div id="cursol0" class="cursol"></div>
                </div>
            `;
            globalThis.lineID = 0;
            globalThis.cur = document.querySelector("#line0");
            setRawTextFn(lines[0] || "");

            for (let i = 1; i < lines.length; i++) {
                await doEnterFn();
                globalThis.cur.innerText = lines[i];
                setRawTextFn(getRawTextFn() + lines[i]);
            }
            applyFIDEHighlight();
        }

        if (globalThis.aioutput) {
            globalThis.aioutput.innerText = explanation;
        }

    } catch (err) {
        console.error(err);
        if (globalThis.aioutput) globalThis.aioutput.innerText = "AI実行エラー: " + err.message;
    }
}
