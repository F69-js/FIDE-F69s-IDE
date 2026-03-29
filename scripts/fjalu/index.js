import {ReplaceEmoji} from "./emoji.js"
const noop = () => { };
(function (glThis) {
    // FJALU Area
    let config = { number: "big" };
    const JP_RE = /[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\s]/gu;
    const ALPHA_RE = /[a-z]/i;
    const DIGIT_RE = /\d/;

    function isJapanese(...e) {
        return e.map(t => !JP_RE.test(t));
    }

    // 文字を CharCode または [CharCode, CharCode] で定義
    // ※ 12354 = あ, 12363 = か ...
    let t = {
        a: 12354, i: 12356, u: 12358, e: 12360, o: 12362,
        a: { a: 12354, i: 12356, u: 12358, e: 12360, o: 12362 },
        k: { a: 12363, i: 12365, u: 12367, e: 12369, o: 12371, y: { a: [12365, 12419], u: [12365, 12421], o: [12365, 12423] } },
        s: { a: 12373, i: 12375, u: 12377, e: 12379, o: 12381, y: { a: [12375, 12419], u: [12375, 12421], o: [12375, 12423] }, h: { a: [12375, 12419], i: 12375, u: [12375, 12421], e: [12375, 12359], o: [12375, 12423] } },
        t: { a: 12383, i: 12385, u: 12388, e: 12390, o: 12392, y: { a: [12385, 12419], u: [12385, 12421], o: [12385, 12423] } },
        n: { a: 12394, i: 12395, u: 12396, e: 12397, o: 12398, n: 12435, y: { a: [12395, 12419], u: [12395, 12421], o: [12395, 12423] } },
        h: { a: 12399, i: 12402, u: 12405, e: 12408, o: 12411, y: { a: [12402, 12419], u: [12402, 12421], o: [12402, 12423] } },
        m: { a: 12414, i: 12417, u: 12420, e: 12417, o: 12426, y: { a: [12417, 12419], u: [12417, 12421], o: [12417, 12423] } },
        y: { a: 12420, u: 12422, o: 12424 },
        r: { a: 12425, i: 12426, u: 12427, e: 12428, o: 12429, y: { a: [12428, 12419], u: [12428, 12421], o: [12428, 12423] } },
        w: { a: 12431, o: 12434 },
        g: { a: 12364, i: 12366, u: 12368, e: 12370, o: 12372, y: { a: [12366, 12419], u: [12366, 12421], o: [12366, 12423] } },
        z: { a: 12374, i: 12376, u: 12378, e: 12380, o: 12382, y: { a: [12376, 12419], u: [12376, 12421], o: [12376, 12423] } },
        d: { a: 12384, i: 12386, u: 12391, e: 12391, o: 12393, y: { a: [12386, 12419], u: [12386, 12421], o: [12386, 12423] } },
        b: { a: 12400, i: 12403, u: 12406, e: 12409, o: 12412, y: { a: [12403, 12419], u: [12403, 12421], o: [12403, 12423] } },
        p: { a: 12401, i: 12404, u: 12407, e: 12410, o: 12413, y: { a: [12404, 12419], u: [12404, 12421], o: [12404, 12423] } },
        j: { a: [12376, 12419], i: 12376, u: [12376, 12421], e: [12376, 12359], o: [12376, 12423] },
        "-": 12540, ".": 12290, ",": 12289, "?": 65311, "\\": 65509,
    };
    noop("add below table")
    t.c = {
        a: 12363, i: 12375, u: 12367, e: 12375, o: 12363,
        h: {
            a: [12385, 12419], // ちゃ
            i: 12385,          // ち
            u: [12385, 12421], // ちゅ
            e: [12385, 12359], // ちぇ
            o: [12385, 12423]  // ちょ
        }
    };
    function RomajiToJapanese(input, tree = t) {
        let result = "", i = 0;

        function walk(node, index) {
            let char = input[index]?.toLowerCase();
            let nextNode = node[char];

            // 1. 次のノードがない = このルートはハズレ
            if (!nextNode) return null;

            // 2. 確定ノード（数字 or 配列）を見つけた！
            if (typeof nextNode === "number" || Array.isArray(nextNode)) {
                return {
                    res: String.fromCharCode(...(Array.isArray(nextNode) ? nextNode : [nextNode])),
                    nextIdx: index + 1
                };
            }

            // 3. さらに深く潜る (k -> y -> o のような連鎖)
            // ※ index + 1 が範囲外なら null が返るようにしておく
            if (index + 1 < input.length) {
                let sub = walk(nextNode, index + 1);
                if (sub) return sub; // 奥でマッチしたならそれを採用
            }

            // 4. 奥でマッチしなかった（例: ky まで行ったが次に o がない）
            // この時、現在の node に「デフォルトの文字」があれば返すが、
            // なければ null を返して「原文ママ」ルートへ戻す
            return null;
        }
        noop("Core Loop with Sokuon support");
        while (i < input.length) {
            let char = input[i].toLowerCase();
            let next = input[i + 1]?.toLowerCase();

            // --- 「っ」の動的判定 ---
            // 1. 次の文字と同じアルファベットである
            // 2. それが a,i,u,e,o,n ではない
            // 3. そのアルファベットがテーブル(t)の起点として存在する
            if (next && char === next && !'aiueon'.includes(char) && t[char]) {
                result += String.fromCharCode(12387); // 「っ」
                i++; // 1文字分だけ進めて、次の walk で本体を処理させるにょ
                continue;
            }

            let match = walk(tree, i);
            if (match) {
                result += match.res;
                i = match.nextIdx;
            } else {
                result += input[i];
                i++;
            }
        }
        return result;
    }
    const reverseMap = {};
    (function buildMap(node, path = "") {
        for (let key in node) {
            let val = node[key];
            if (typeof val === "number" || Array.isArray(val)) {
                let str = Array.isArray(val) ? String.fromCharCode(...val) : String.fromCharCode(val);
                reverseMap[str] = (reverseMap[str] ?? path + key);
            } else {
                buildMap(val, path + key);
            }
        }
    })(t);
    function JapaneseToRomaji(input, tree = t) {
        let result = "";
        for (let i = 0; i < input.length; i++) {
            let char = input[i];
            let next = input[i + 1];

            // --- 「っ」の処理 ---
            if (char === "っ" && next) {
                // 次の文字をローマ字変換して、その先頭子音を拝借する
                let nextRomaji = reverseMap[next] || encodeRomaji(next);
                result += nextRomaji[0];
                continue;
            }

            // --- 2文字の塊 (ゃゅょ等) を優先チェック ---
            let doubleChar = char + (next || "");
            if (reverseMap[doubleChar]) {
                result += reverseMap[doubleChar];
                i++; // 2文字分進む
            } else {
                result += reverseMap[char] || char;
            }
        }
        return result;
    }
    //FJALA Area
    function translateAuto(...p) {
        if (p.length < 1) return;
        if (p.length < 2) {
            if (isJapanese(p[0])) {
                let emojiprocessed = ReplaceEmoji(p[0])
                return RomajiToJapanese(emojiprocessed)
            } else {
                return p[0]
            }
        } else {
            return p.map(t => {
                if (isJapanese(t)) {
                    let emojiprocessed = ReplaceEmoji(t)
                    return RomajiToJapanese(emojiprocessed)
                } else {
                    return t
                }
            })
        }
    }
    globalThis._fjala = translateAuto;
    globalThis._fjalu = {
        isJapanese: isJapanese,
        JapaneseToRomaji: JapaneseToRomaji,
        RomajiToJapanese: RomajiToJapanese,
        InternalTable: t
    }
})(globalThis)
let _jala = globalThis._fjala
let _fjalu = globalThis._fjalu
export{_jala,_fjalu}
