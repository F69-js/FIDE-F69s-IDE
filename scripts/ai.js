// FIDE Custom IDE - Web Local AI Router (v4.0 Streaming Master Compliant)
import { detectLanguageByExtension, applyFIDEHighlight } from "./newtacs/highlighter.js";

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

// ⭕ 最新の window.LanguageModel 仕様に完全適合させた初期化ロジック
export async function initBuiltInAI() { 
  if (!window.LanguageModel) { 
    if (globalThis.available) available.hidden = true; 
    if (globalThis.ainotavailable) ainotavailable.hidden = false; 
    return; 
  } 
  try { 
    // 戻り値オブジェクトから available プロパティを正しく検証
    const capabilities = await window.LanguageModel.availability(); 
    const isAvailable = typeof capabilities === "object" ? capabilities.available : capabilities;

    if (isAvailable === "no" || isAvailable === "unavailable") { 
      if (globalThis.available) available.hidden = true; 
      if (globalThis.ainotavailable) ainotavailable.hidden = false; 
    } 
  } catch (e) { 
    if (globalThis.available) available.hidden = true; 
    if (globalThis.ainotavailable) ainotavailable.hidden = false; 
  } 
}

// ⭕ ストリーミング（1トークンずつの描画）に完全対応させたメイン関数（自爆バグ修正版）
export async function sendBtnCheck(getRawTextFn, setRawTextFn, doEnterFn, undoStackRef) { 
  if (globalThis.aienable && !globalThis.aienable.checked) { 
    if (globalThis.aioutput) aioutput.innerText = "AI機能は設定で無効化されています。"; 
    return; 
  } 
  if (!window.LanguageModel) { 
    alert("お使いのブラウザはBuilt-in AIに対応していません。"); 
    return; 
  } 
  const promptText = globalThis.aiinput ? aiinput.value.trim() : ""; 
  if (!promptText) return; 
  
  if (globalThis.aioutput) aioutput.innerText = "AIが思考中..."; 
  if (globalThis.aiinput) aiinput.value = ""; 

  let session = null;
  try { 
    // セッションの生成
    session = await window.LanguageModel.create({ 
      expectedOutputLanguage: 'ja', 
      systemPrompt: sysprompt
    }); 

    const currentFileName = globalThis.filenamei ? (filenamei.value || "F69sIDE.js") : "F69sIDE.js"; 
    const fullPrompt = `[!PROMPT]\n${promptText}\n\n[!RAWCODE]\n[!code_editor ${currentFileName}]\n${getRawTextFn()}`.trim(); 
    
    // 【ストリーミング実行】
    const stream = await session.promptStreaming(fullPrompt);
    let fullResponse = "";

    for await (const chunk of stream) {
      fullResponse = chunk; 
      if (globalThis.aioutput) {
        aioutput.innerText = fullResponse; // リアルタイムに1文字ずつカタカタ描画！
      }
    }

    // ⭕ 【安全地帯】ループが完全に終わり、最後の1文字まで出力しきった後にセッションを破棄する
    try { session.destroy(); } catch(e) {}
    session = null;

    // AIからの最終回答テキストを元にコード置換処理へ進む
    let explanation = fullResponse; 
    
    // コード置換ロジック
    const codeBlockRegex = /\[!code_editor\s+([^\]]+)\]([\s\S]*?)(?:\$)/; 
    const match = explanation.match(codeBlockRegex); 
    
    if (match && match[2]) { 
      const extractedCode = match[2].trim(); 
      undoStackRef.push(getRawTextFn()); 
      globalThis.redoStack = []; 
      setRawTextFn(""); 
      
      const lines = extractedCode.split(/\r?\n/); 
      if (globalThis.maincontainer) {
        maincontainer.innerHTML = `<div id="lineGroup0" class="group"><div id="lineno0" class="lineno">1</div><div id="line0" class="line"></div><div id="cursol0" class="cursol"></div></div>`; 
      }
      globalThis.lineID = 0; 
      globalThis.cur = document.querySelector("#line0"); 
      
      if (cur) cur.innerText = lines[0] || "";
      setRawTextFn(lines[0] || ""); 

      for (let i = 1; i < lines.length; i++) { 
        await doEnterFn(); 
        if (globalThis.cur) cur.innerText = lines[i] || ""; 
        setRawTextFn(getRawTextFn() + "\n" + (lines[i] || "")); 
      } 
      detectLanguageByExtension(currentFileName);
      applyFIDEHighlight(); 
    } 

  } catch (err) { 
    console.error(err); 
    if (globalThis.aioutput) aioutput.innerText = "AI実行エラー: " + err.message; 
    // エラー時もセッションが残っていれば安全に片付ける
    if (session) {
      try { session.destroy(); } catch(e) {}
    }
  }
}
