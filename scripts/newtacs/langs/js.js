const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '';
  
  // 💡 【新Tacsテクノロジー】JavaScriptの字句解析トークンパターン
  // コメント、文字列、数値、有効な記号グループ、英単語を一発で仕分けるV8スペックの正規表現
  const tokenRegex = /(?:\/\/.*|\/\*[\s\S]*?\*\/)|(?:"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)|(?:\b\d+\b)|(=>|\*\*=|\|\|=|&&=|\?\?=|===|!==|==|!=|\+\+|\-\-|\+=|\-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|>>>=|<=|>=|&&|\|\||\?\?|\?.|\*\*|->|[\{\}\[\]\(\)\+\-\*\/%=&\|\^!<>:;,\.])|([a-zA-Z_\(][a-zA-Z0-9_\)]*)|(\s+)|(.)/g;

  let match;
  let lastTokenWasDot = false;

  while ((match = tokenRegex.exec(t)) !== null) {
    const [raw, comment, str, num, op, word, space, any] = match;

    // 1. コメントの処理
    if (comment) {
      const span = document.createElement("span");
      span.className = "c"; span.textContent = raw;
      res += span.outerHTML;
      lastTokenWasDot = false;
      continue;
    }

    // 2. 文字列リテラルの処理
    if (str) {
      const span = document.createElement("span");
      span.className = "str"; span.textContent = raw;
      res += span.outerHTML;
      lastTokenWasDot = false;
      continue;
    }

    // 3. 数値リテラルの処理
    if (num) {
      const span = document.createElement("span");
      span.style.color = "#b5cea8"; span.textContent = raw;
      res += span.outerHTML;
      lastTokenWasDot = false;
      continue;
    }

    // 4. 🧠 記号グループ（演算子・区切り文字）の高度な仕分け判定
    if (op) {
      const span = document.createElement("span");
      
      if (op === '{' || op === '}') span.className = "br1";
      else if (op === '(' || op === ')') span.className = "br2";
      else if (op === '[' || op === ']') span.className = "br3";
      else if (op === '=>') span.className = "a";
      else if (op === '*') span.className = "g-star";
      else if (['===','!==','==','!=','=','+','-','/','%','!','<','>','?','&&','||','??','?.',':','.'].includes(op)) {
        // 💡 単なる文章としての記号ではなく、プログラムとして意味のある有効な演算子グループのみを着色！
        span.className = "o";
      }

      if (span.className) {
        span.textContent = raw;
        res += span.outerHTML;
      } else {
        res += raw.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      
      lastTokenWasDot = (op === '.');
      continue;
    }

    // 5. 英単語（識別子・予約語）の処理
    if (word) {
      const span = document.createElement("span");
      
      // 次のトークンが開きカッコか先読みして関数呼び出しをスマートに判定
      let isFunctionCall = false;
      const nextIdx = tokenRegex.lastIndex;
      const tail = t.slice(nextIdx).match(/^\s*\(/);
      if (tail) isFunctionCall = true;

      if (KEYWORDS.includes(word)) span.className = "k";
      else if (NEON_PINK.includes(word)) span.className = "a";
      else if (GOLD.includes(word)) span.className = "s";
      else if (BUILTINS.includes(word)) span.className = "b";
      else if (METHODS.includes(word) || isFunctionCall) {
        span.className = METHODS.includes(word) ? "m" : "fn";
      }
      else if (lastTokenWasDot) span.className = "prop";

      if (span.className) {
        span.textContent = raw;
        res += span.outerHTML;
      } else {
        res += raw;
      }
      
      lastTokenWasDot = false;
      continue;
    }

    // 6. 空白やその他の文字（プレーンテキスト）の処理
    if (space) {
      res += raw;
      continue;
    }

    if (any) {
      // 💡 演算子グループ（op）に含まれなかったただのテキスト記号（→ など）は、
      // ここに安全に流し込まれ、色を塗られずに100%無傷でスルーされます！
      res += raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      lastTokenWasDot = false;
    }
  }

  return res;
}
