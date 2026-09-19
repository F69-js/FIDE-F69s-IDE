const KEYWORDS = ["if","else","switch","case","break","return","typeof","instanceof","throw","for","let","const","var","class","export","constructor","new","import","from","try","catch","in","await","default","do","yield","function","extends","super","finally","with","arguments","interface","implements","package","private","protected","public","static"];
const NEON_PINK = ["async","while","continue","debugger","null"];
const GOLD = ["this","window","globalThis","super","self","global"];
const BUILTINS = ["JSON","console","Math","Date","Promise","String","Map","Set","Object","Number","Error","undefined","null","true","false","process","document","navigator","screen","location","history","Temporal","LanguageModel","ai"];
const METHODS = ["push","pop","unshift","shift","slice","splice","filter","some","findIndex","includes","join","split","match","replace","replaceAll","trim","startsWith","indexOf","lastIndexOf","substring","map","forEach","reduce","padStart","toFixed","has","get","set","delete","entries","add","then","catch","finally","log","warn","error"];

// 💡 拡張性抜群！JS専用のネオンカラーパレットを完全内蔵
export const JStheme = `
  .k { color: #569cd6; font-weight: bold; } /* 予約語: ブルー */
  .a { color: #ff007f; font-weight: bold; } /* async/while: ネオンピンク */
  .s { color: #f2c94c; font-weight: bold; } /* this/super: ゴールド */
  .b { color: #4ec9b0; }                    /* ビルトイン: エメラルド */
  .m { color: #dcdcaa; }                    /* メソッド: ライトイエロー */
  .o { color: #c586c0; font-weight: bold; } /* 演算子: マゼンタ */
  .str { color: #ce9178; }                  /* 文字列: オレンジ */
  .prop { color: #9cdcfe; }                 /* プロパティ: ライトブルー */
  .c { color: #6a9955; font-style: italic; }
  .fn { color: #dcdcaa; font-weight: bold; }
  .br1 { color: #00ffaa; font-weight: bold; }
  .br2 { color: #00ffff; font-weight: bold; }
  .br3 { color: #ff00ff; font-weight: bold; }
  .g-star { color: #ff453a; font-weight: bold; }
`;

export function ApplyHighlighttoJS(t) {
  let idx = 0, res = '';
  const tokenRegex = /(?:\/\/.*|\/\*[\s\S]*?\*\/)|(?:"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)|(?:\b\d+\b)|(=>|\*\*=|\|\|=|&&=|\?\?=|===|!==|==|!=|\+\+|\-\-|\+=|\-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|>>>=|<=|>=|&&|\|\||\?\?|\?.|\*\*|->|[\{\}\[\]\(\)\+\-\*\/%=&\|\^!<>:;,\.])|([a-zA-Z_\(][a-zA-Z0-9_\)]*)|(\s+)|(.)/g;
  let match;
  let lastTokenWasDot = false;

  while ((match = tokenRegex.exec(t)) !== null) {
    const [raw, comment, str, num, op, word, space, any] = match;
    if (comment) {
      const span = document.createElement("span"); span.className = "c"; span.textContent = raw; res += span.outerHTML; lastTokenWasDot = false; continue;
    }
    if (str) {
      const span = document.createElement("span"); span.className = "str"; span.textContent = raw; res += span.outerHTML; lastTokenWasDot = false; continue;
    }
    if (num) {
      const span = document.createElement("span"); span.style.color = "#b5cea8"; span.textContent = raw; res += span.outerHTML; lastTokenWasDot = false; continue;
    }
    if (op) {
      const span = document.createElement("span");
      if (op === '{' || op === '}') span.className = "br1";
      else if (op === '(' || op === ')') span.className = "br2";
      else if (op === '[' || op === ']') span.className = "br3";
      else if (op === '=>') span.className = "a";
      else if (op === '*') span.className = "g-star";
      else if (['===','!==','==','!=','=','+','-','/','%','!','<','>','?','&&','||','??','?.',':','.'].includes(op)) span.className = "o";
      if (span.className) {
        span.textContent = raw; res += span.outerHTML;
      } else { res += raw.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
      lastTokenWasDot = (op === '.'); continue;
    }
    if (word) {
      const span = document.createElement("span");
      let isFunctionCall = false;
      const nextIdx = tokenRegex.lastIndex;
      const tail = t.slice(nextIdx).match(/^\s*\(/);
      if (tail) isFunctionCall = true;

      if (KEYWORDS.includes(word)) span.className = "k";
      else if (NEON_PINK.includes(word)) span.className = "a";
      else if (GOLD.includes(word)) span.className = "s";
      else if (BUILTINS.includes(word)) span.className = "b";
      else if (METHODS.includes(word) || isFunctionCall) span.className = METHODS.includes(word) ? "m" : "fn";
      else if (lastTokenWasDot) span.className = "prop";

      if (span.className) {
        span.textContent = raw; res += span.outerHTML;
      } else { res += raw; }
      lastTokenWasDot = false; continue;
    }
    if (space) { res += raw; continue; }
    if (any) {
      res += raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); lastTokenWasDot = false;
    }
  }
  return res;
}
