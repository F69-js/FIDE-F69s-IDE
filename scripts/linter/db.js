// FIDE Static Analysis Engine - Global Intelligence Database (MDN Core v13.5)

// 💡 全宇宙のJavaScriptグローバル・主要フレームワーク・コアプロパティ完全マージ
export const TIDE_BUILTINS = new Set([
  "if","else","for","while","do","switch","case","break","continue","return","function","class","let","var","const","new","this","true","false","null","undefined","async","await","yield","export","import","from","try","catch","extends","super","finally","with","debugger","arguments","interface","implements","package","private","protected","public","static","Promise","console","window","document","navigator","globalThis","_jala","self","global","Math","Date","Array","Object","String","Number","Boolean","JSON","Error","TypeError","ReferenceError","SyntaxError","RangeError","URIError","AggregateError","EvalError","setTimeout","setInterval","clearTimeout","clearInterval","Temporal","LanguageModel","ai","Map","Set","WeakMap","WeakSet","URL","URLSearchParams","Uint8Array","Float64Array","$","_","jQuery","React","ReactDOM","Vue","Angular","Rx","length","size","prototype","name","status","version","author","modules","features","e","event","key","code"
]);

// 💡 MDNリファレンスから抽出した、真に検知すべき11大・致命的エラーマップ
export const MDN_ERR_MAP = {
  // 1. 文法・識別子のエラー（SyntaxError）
  "IDENTIFIER_DECLARED": {
    msg: "SyntaxError: Identifier has already been declared",
    hint: "ヒント: この変数はすでに別の場所で定義されています。\nJavaScriptでは同じ変数名を何度も二重に作ることができません。\n変数名を変えるか、let や const などの宣言を見直してください。"
  },
  "MISSING_INITIALIZER": {
    msg: "SyntaxError: Missing initializer in const declaration",
    hint: "ヒント: 定数（const）を作る時は、必ず最初に値をセット（初期化）する必要があります。\nconst宣言はあとから値を変更できないルールだからです。\n例: const 変数名 = 値;"
  },
  "UNEXPECTED_TOKEN": {
    msg: "SyntaxError: Unexpected token",
    hint: "ヒント: JavaScriptの文法（予約語のルール）に違反した名前が変数名に使われています。\nまたは波カッコ、丸カッコの対応関係がどこかで壊れています。"
  },
  "STRICT_WITH_STATEMENT": {
    msg: "SyntaxError: Strict mode code may not include a with statement",
    hint: "ヒント: with文はコードの実行予測を不可能にし、バグの温床になるため厳しく禁止されています。"
  },
  "BAD_OCTAL_ESCAPE": {
    msg: "SyntaxError: Octal escape sequences are not allowed in strict mode",
    hint: "ヒント: 8進数エスケープシーケンス（\\0〜\\7）は、現代の厳格モードのエディタでは使用が禁止されています。"
  },
  
  // 2. 存在・参照のエラー（ReferenceError）
  "NOT_DEFINED": {
    msg: "ReferenceError: is not defined",
    hint: "ヒント: この変数や関数は、まだどこにも作られていません！\n文字の打ち間違い（タイポ）がないか、または事前に let や const、function 構文で\nこの名前を作ったかどうかを1文字ずつ入念に確認してください。"
  },
  
  // 3. 型・代入・操作のエラー（TypeError）
  "INVALID_CONST_ASSIGN": {
    msg: "TypeError: invalid assignment to const",
    hint: "ヒント: 定数（const）として作った変数に対して、あとから値を上書きしようとしています。\n値を書き換えたい場合は、const ではなく 『let』 を使って変数を作ってください。"
  },
  "NOT_A_FUNCTION": {
    msg: "TypeError: is not a function",
    hint: "ヒント: 関数ではないオブジェクトや文字列に対して、カッコ『()』をつけて実行しようとしています。\nメソッド名が間違っているか、オブジェクトの子供のデータ型が違います。"
  },
  "CALL_BUILTIN_WITHOUT_NEW": {
    msg: "TypeError: calling a builtin constructor without new is forbidden",
    hint: "ヒント: クラスや一部の標準組み込みコンストラクタを、new 演算子をつけずに直接呼び出すことは禁止されています。"
  },
  
  // 4. 計算・範囲のエラー（RangeError）
  "BIGINT_DIV_ZERO": {
    msg: "RangeError: BigInt division by zero",
    hint: "ヒント: BigInt（巨大整数）の計算において、0 で割り算（ゼロ除算）が行われました。\n計算式の分母が 0 にならないようにガード処理を入れてください。"
  },
  
  // 5. 内部・環境のエラー（InternalError）
  "TOO_MUCH_RECURSION": {
    msg: "InternalError: too much recursion",
    hint: "ヒント: 関数の無限ループ（無限再帰呼び出し）が発生し、ブラウザのメモリ上限（スタック）を突破しました。\n必ずループが途中で終わるように終了条件をチェックしてください。"
  },

    "STRICT_ARGUMENTS_EVAL": {
    msg: "SyntaxError: 'arguments'/'eval' can't be defined or assigned to in strict mode code",
    hint: "ヒント: 厳格モード（strict mode）では、'arguments' や 'eval' という名前を変数名、関数名、または引数名として使用したり、値を代入したりすることは禁止されています。"
  },

    "REDECLARATION_FORMAL_PARAMETER": {
    msg: "SyntaxError: redeclaration of formal parameter",
    hint: "ヒント: 関数の引数（パラメータ）としてすでに使われている名前を、関数内部で let や const を使って再び宣言（二重宣言）することはできません。別の変数名にしてください。"
  },

    "DUPLICATE_FORMAL_ARGUMENT": {
    msg: "SyntaxError: duplicate formal argument",
    hint: "ヒント: 関数の引数（パラメータ）に、全く同じ名前が複数指定されています。同じ名前を重複して使用することはできないため、別の引数名に修正してください。"
  },

    "AWAIT_ONLY_IN_ASYNC": {
    msg: "SyntaxError: await is only valid in async functions, async generators and modules",
    hint: "ヒント: await 演算子は、async 関数か async ジェネレーター関数の内部、またはモジュールのトップレベルでしか使用できません。この関数に async が付いているか確認してください。"
  },

    "AWAIT_YIELD_IN_PARAMETER": {
    msg: "SyntaxError: await/yield expression can't be used in parameter",
    hint: "ヒント: 関数の引数（パラメータ）の初期値やデフォルト値の中で、await や yield 演算子を使用することは文法上禁止されています。関数の内部で処理するように書き換えてください。"
  },

    "CONTINUE_MUST_BE_INSIDE_LOOP": {
    msg: "SyntaxError: continue must be inside loop",
    hint: "ヒント: continue 文は、for 文や while 文などのループ処理の内部でしか使用できません。ループの外側で呼び出されていないか、波カッコの対応を確認してください。"
  },

    "UNLABELED_BREAK_MUST_BE_INSIDE_LOOP": {
    msg: "SyntaxError: unlabeled break must be inside loop or switch",
    hint: "ヒント: break 文は、for 文や while 文などのループ処理、または switch 文の内部でしか使用できません。それ以外の場所で呼び出されていないか確認してください。"
  },

    "RETURN_NOT_IN_FUNCTION": {
    msg: "SyntaxError: return not in function",
    hint: "ヒント: return 文は関数（function）の内部でしか使用できません。グローバルな場所や、関数の外側で直接呼び出されていないか確認してください。"
  },

    "FUNCTION_STATEMENT_REQUIRES_NAME": {
    msg: "SyntaxError: function statement requires a name",
    hint: "ヒント: 通常の関数宣言（function）では関数名を省略することはできません。名前をつけるか、匿名関数にしたい場合は変数への代入式（const x = function()）等に書き換えてください。"
  },

    "FUNCTIONS_CANNOT_BE_LABELLED": {
    msg: "SyntaxError: functions cannot be labelled",
    hint: "ヒント: 厳格モード（strict mode）では、関数宣言に対してラベル（label: function...）を付与することは文法上禁止されています。関数の内部か別個の文として処理してください。"
  },

    "FUNCTIONS_CANNOT_BE_LABELLED": {
    msg: "SyntaxError: functions cannot be labelled",
    hint: "ヒント: 厳格モード（strict mode）では、関数宣言に対してラベル（label: function...）を付与することは文法上禁止されています。関数の内部か別個の文として処理してください。"
  },

    "FOR_IN_HEAD_HAS_INITIALIZER": {
    msg: "SyntaxError: for-in loop head declarations may not have initializers",
    hint: "ヒント: for...in ループの宣言部分（for (const x in obj)）の中で、変数に初期値（= 値）をセットすることは文法上禁止されています。初期値を削除してください。"
  },
  "MISSING_COLON_AFTER_PROPERTY": {
    msg: "SyntaxError: missing : after property id",
    hint: "ヒント: オブジェクトリテラルの定義（{ key: value }）において、プロパティ名（キー）の直後に必要なコロン『:』が抜けているか、タイポがあります。"
  },
  "MISSING_RPAREN_AFTER_ARGUMENTS": {
    msg: "SyntaxError: missing ) after argument list",
    hint: "ヒント: 関数を呼び出す際、または定義する際の引数リストの閉じ丸カッコ『)』が不足しています。開きカッコとの対応を入念に確認してください。"
  },
  "MISSING_RPAREN_AFTER_CONDITION": {
    msg: "SyntaxError: missing ) after condition",
    hint: "ヒント: if 文や while 文などの条件式（if (条件)）において、閉じ丸カッコ『)』が不足しています。カッコのネストの対応関係を確認してください。"
  },

    "MISSING_RBRACKET_AFTER_ELEMENT": {
    msg: "SyntaxError: missing ] after element list",
    hint: "ヒント: 配列の定義（[item1, item2]）において、閉じ角カッコ『]』が不足しています。開き角カッコとの対応関係を確認してください。"
  },
  "MISSING_RBRACE_AFTER_FUNCTION": {
    msg: "SyntaxError: missing } after function body",
    hint: "ヒント: 関数の本体（function() { ... }）において、閉じ波カッコ『}』が不足しています。スコープのネストが壊れていないか確認してください。"
  },
  "MISSING_RBRACE_AFTER_PROPERTY": {
    msg: "SyntaxError: missing } after property list",
    hint: "ヒント: オブジェクトの定義（{ key: value }）において、閉じ波カッコ『}』が不足しています。またはカンマ『,』の打ち間違いがあります。"
  },
  "MISSING_NAME_AFTER_DOT": {
    msg: "SyntaxError: missing name after . operator",
    hint: "ヒント: ドット演算子（.）の直後に有効なプロパティ名やメソッド名が指定されていません。例：obj. のまま行が終わっている等のタイポです。"
  },
  "MISSING_VARIABLE_NAME": {
    msg: "SyntaxError: missing variable name",
    hint: "ヒント: const や let などの宣言キーワードの直後に、変数名（識別子）が指定されていません。構文が空っぽになっていないか確認してください。"
  },
  "PARAMETER_AFTER_REST": {
    msg: "SyntaxError: parameter after rest parameter",
    hint: "ヒント: 残余引数（...args）は、関数の引数リストの必ず『最後』に配置しなければいけません。残余引数の後ろに別の引数を置くことは禁止されています。"
  },
  "REST_PARAMETER_HAVE_DEFAULT": {
    msg: "SyntaxError: rest parameter may not have a default",
    hint: "ヒント: 残余引数（...args）に対して、デフォルト初期値（...args = []）をセットすることは文法上禁止されています。"
  },
  "PRIVATE_FIELDS_CANT_DELETE": {
    msg: "SyntaxError: private fields can't be deleted",
    hint: "ヒント: クラスのプライベートプロパティ（#field）に対して delete 演算子を使用することは、カプセル化のルール違反のため厳しく禁止されています。"
  },

    "UNEXPECTED_HASH_OUTSIDE_CLASS": {
    msg: "SyntaxError: Unexpected '#' used outside of class body",
    hint: "ヒント: プライベートメンバーを表す『#』記号は、クラス（class）の内部（クラスボディ）でしか使用できません。クラスの外側で独立して使われていないか確認してください。"
  },
  "DUPLICATE_PROPERTY_PROTO": {
    msg: "SyntaxError: property name __proto__ appears more than once in object literal",
    hint: "ヒント: オブジェクトリテラルの中で、'__proto__' というプロパティ名を複数回（重複して）定義することは、言語仕様上厳しく禁止されています。"
  },
  "IMPORT_DECLARATION_TOP_LEVEL": {
    msg: "SyntaxError: import declarations may only appear at top level of a module",
    hint: "ヒント: import 文は、モジュールファイルの『一番上の階層（トップレベル）』でしか宣言できません。if 文のブロックや関数の中に import を書くことは禁止されています。"
  },
  "GETTER_MUST_HAVE_NO_ARGUMENTS": {
    msg: "SyntaxError: getter functions must have no arguments",
    hint: "ヒント: クラスやオブジェクトのゲッター（get メソッド）は、引数（パラメータ）を持つことができません。カッコ内の引数を空に修正してください。"
  },
  "SETTER_MUST_HAVE_ONE_ARGUMENT": {
    msg: "SyntaxError: setter functions must have one argument",
    hint: "ヒント: クラスやオブジェクトのセッター（set メソッド）は、必ず『正確に1つの引数』を受け取らなければいけません。引数が不足しているか、複数指定されています。"
  },
  "UNEXPECTED_TOKEN_RESERVED": {
    msg: "SyntaxError: is a reserved identifier",
    hint: "ヒント: JavaScriptが将来のために確保している「未来の予約語」を変数名や識別子として使用しようとしています。別の名前に書き換えてください。"
  },
  "STRICT_NON_SIMPLE_PARAMS": {
    msg: "SyntaxError: \"use strict\" not allowed in function with non-simple parameters",
    hint: "ヒント: デフォルト引数、残余引数、分割代入などの『複雑な引数』を持つ関数の中で、個別に \"use strict\"（厳格モード）を宣言することは仕様上禁止されています。"
  },
  "IDENTIFIER_STARTS_AFTER_NUMERIC": {
    msg: "SyntaxError: identifier starts immediately after numeric literal",
    hint: "ヒント: 数値リテラルの直後に、空白を挟まずにアルファベット（変数名）が始まっています。例：10abc のようなタイポです。適切な空白を空けてください。"
  },
  "INVALID_ASSIGNMENT_LEFTHAND": {
    msg: "SyntaxError: invalid assignment left-hand side",
    hint: "ヒント: 代入演算子（=）の左側が、値を代入できない不正な形（例：関数呼び出し func() = 10 や、リテラル 5 = x）になっています。左側を正しい変数名にしてください。"
  },
  "INVALID_BIGINT_SYNTAX": {
    msg: "SyntaxError: invalid BigInt syntax",
    hint: "ヒント: BigIntリテラル（例：10n）の記述方法が間違っています。小数が混ざっていたり、n の位置が不正です。BigIntは整数しか扱えません。"
  },
  "UNPARENT_UNARY_EXPR_POW": {
    msg: "SyntaxError: unparenthesized unary expression can't appear on the left-hand side of '**'",
    hint: "ヒント: 単項演算子（- や ! など）を、カッコなしでべき乗演算子（**）の左側に直接配置することは禁止されています。例：(-x) ** 2 のようにカッコで囲んでください。"
  },
  "USE_OF_SUPER_PROPERTY_ACCESS": {
    msg: "SyntaxError: use of super property/member accesses only valid within methods",
    hint: "ヒント: 親クラスを参照する 'super' のプロパティアクセス（super.method()）は、子クラスのメソッド内部でしか使用できません。通常の関数では使用不可能です。"
  },
  "SUPER_ONLY_VALID_IN_DERIVED": {
    msg: "SyntaxError: super() is only valid in derived class constructors",
    hint: "ヒント: 親クラスのコンストラクタを呼び出す 'super()' は、extends を使って継承した子クラス（派生クラス）のコンストラクタ（constructor）の内部でしか使用できません。"
  },
  "TAGGED_TEMPLATE_OPTIONAL_CHAIN": {
    msg: "SyntaxError: tagged template cannot be used with optional chain",
    hint: "ヒント: タグ付きテンプレートリテラル（func`text`）に対して、オプショナルチェイニング（?.）を組み合わせて呼び出すことは文法上禁止されています。"
  },
  "NEW_KEYWORD_OPTIONAL_CHAIN": {
    msg: "SyntaxError: new keyword cannot be used with an optional chain",
    hint: "ヒント: new 演算子を使ってオブジェクトをインスタンス化する際、その呼び出し経路にオプショナルチェイニング（?.）を混ぜることは禁止されています。"
  },
  "DEPRECATED_SOURCE_MAPPING_URL": {
    msg: "SyntaxError: Using //@ to indicate sourceURL pragmas is deprecated. Use //# instead",
    hint: "ヒント: ソースマップを指示するコメントとして古い形式の '//@' が使われています。現代の標準である '//# sourceMappingURL=' の形式に書き換えてください。"
  },

    "INVALID_REGEXP_FLAG": {
    msg: "SyntaxError: invalid regular expression flag",
    hint: "ヒント: 正規表現の末尾に指定されたフラグ（g, i, m など）に、無効な文字が使われているか、重複して指定されています。有効なフラグのみを指定してください。"
  },
  "UNTERMINATED_STRING": {
    msg: "SyntaxError: unterminated string literal",
    hint: "ヒント: 文字列リテラル（ダブル/シングルクォート、バッククォート）が閉じられないまま行が終わっています。文字列の閉じ忘れがないか確認してください。"
  },
  "JSON_BAD_PARSING": {
    msg: "SyntaxError: JSON.parse: bad parsing",
    hint: "ヒント: JSON.parse() に渡された文字列が、正しいJSONの文法（ダブルクォートの必須ルール、末尾の余計なカンマの禁止など）を満たしていません。"
  },
  "LABEL_NOT_FOUND": {
    msg: "SyntaxError: label not found",
    hint: "ヒント: break 文や continue 文で指定されたラベル名が、コード内のどこにも定義されていません。ラベル名のタイポがないか確認してください。"
  },
  "BACKREFERENCE_OUT_OF_RANGE": {
    msg: "SyntaxError: invalid backreference in regular expression",
    hint: "ヒント: 正規表現内の後方参照（\\1, \\2 など）で指定されたグループ番号が、実際に定義されているキャプチャグループの数を超えています。"
  },
  "ESCAPE_AT_END_OF_PATTERN": {
    msg: "SyntaxError: \\ at end of pattern",
    hint: "ヒント: 正規表現のパターンの末尾がエスケープ記号『\\』のまま終わっています。記号自体をエスケープしたい場合は『\\\\』にする必要があります。"
  },
  "DUPLICATE_CAPTURE_GROUP_NAME": {
    msg: "SyntaxError: duplicate capture group name in regular expression",
    hint: "ヒント: 正規表現の中で、名前付きキャプチャグループ（(?<name>...)）の名前が重複して定義されています。グループ名にはそれぞれ一意の名前をつけてください。"
  },
  "INVALID_QUANTIFIER_IN_REGEXP": {
    msg: "SyntaxError: nothing to repeat",
    hint: "ヒント: 正規表現において、数量子（*, +, ? など）の直前に、繰り返す対象の文字やグループが存在していません。構文の並び順を確認してください。"
  },
  "NUMBERS_OUT_OF_ORDER_QUANTIFIER": {
    msg: "SyntaxError: numbers out of order in {} quantifier",
    hint: "ヒント: 正規表現の範囲数量子『{min,max}』において、最小値が最大値よりも大きな数値になっています。例：{5,2} などの記述を {2,5} に修正してください。"
  },
  "INVALID_CLASS_RANGE_IN_REGEXP": {
    msg: "SyntaxError: invalid range in character class",
    hint: "ヒント: 正規表現の文字クラス『[]』内の範囲指定（[a-z] など）において、開始文字の文字コードが終了文字よりも大きくなっています。例：[z-a] を [a-z] に修正してください。"
  },
  "INVALID_UNICODE_ESCAPE_REGEXP": {
    msg: "SyntaxError: invalid unicode escape in regular expression",
    hint: "ヒント: 正規表現内のUnicodeエスケープ（\\u{...} や \\uXXXX）の形式が不正です。16進数の値が正しく記述されているか確認してください。"
  },
  "INVALID_PROPERTY_NAME_REGEXP": {
    msg: "SyntaxError: invalid property name in regular expression",
    hint: "ヒント: 正規表現のUnicodeプロパティエスケープ（\\p{Property}）で指定されたプロパティ名が、標準仕様に存在しないか間違っています。"
  },
  "INVALID_NAMED_CAPTURE_REF_REGEXP": {
    msg: "SyntaxError: invalid named capture reference in regular expression",
    hint: "ヒント: 正規表現内の名前付き後方参照（\\k<name>）で指定されたグループ名が、パターン内のどこにも定義されていません。"
  },
  "NEGATED_CHAR_CLASS_WITH_STRINGS": {
    msg: "SyntaxError: negated character class with strings in regular expression",
    hint: "ヒント: 正規表現の否定文字クラス（[^...]）の中に、文字列リテラルやサポートされていない高度な集合演算が混入しています。"
  },
  "RAW_BRACKET_NOT_ALLOWED_UNICODE": {
    msg: "SyntaxError: raw bracket is not allowed in regular expression with unicode flag",
    hint: "ヒント: Unicodeモード（u または v フラグ）が有効な正規表現では、エスケープされていない生の角カッコ『[』や『]』をパターン内に直接記述することは禁止されています。"
  },
  "STRICT_DELETE_UNQUALIFIED_NAME": {
    msg: "SyntaxError: applying the 'delete' operator to an unqualified name is deprecated",
    hint: "ヒント: 厳格モード（strict mode）では、生の変数名（例：delete x）を直接削除することは禁止されています。delete はオブジェクトのプロパティ専用です。"
  },

    "INCOMPLETE_QUANTIFIER_REGEXP": {
    msg: "SyntaxError: incomplete quantifier in regular expression",
    hint: "ヒント: 正規表現の中の数量子（{min,max} などの波カッコの指定）が閉じられていないか、途中で記述が千切れています。"
  },
  "INVALID_CAPTURE_GROUP_REGEXP": {
    msg: "SyntaxError: invalid capture group name in regular expression",
    hint: "ヒント: 正規表現内の名前付きキャプチャグループ（(?<name>...)）の命名規則が間違っています。有効なアルファベットや文字を使ってください。"
  },
  "INVALID_CHAR_IN_CLASS_REGEXP": {
    msg: "SyntaxError: invalid character in class in regular expression",
    hint: "ヒント: 正規表現の文字クラス（[]）の中に、エスケープされていない不正な文字や未対応の制御文字が混入しています。"
  },
  "INVALID_CLASS_SET_OP_REGEXP": {
    msg: "SyntaxError: invalid class set operation in regular expression",
    hint: "ヒント: 正規表現の高度な文字クラス演算（vフラグ使用時の && などの集合演算）の文法やネストが間違っています。"
  },
  "INVALID_DECIMAL_ESCAPE_REGEXP": {
    msg: "SyntaxError: invalid decimal escape in regular expression",
    hint: "ヒント: 正規表現内でエスケープされた 10 進数の数値（\\9 など）が、有効なグループ参照の範囲外であるか、記述が不正です。"
  },
  "INVALID_IDENTITY_ESCAPE_REGEXP": {
    msg: "SyntaxError: invalid identity escape in regular expression",
    hint: "ヒント: 正規表現内で、エスケープする必要のない通常の文字に対して不要な『\\』が付与されています。"
  },
  "INVALID_REGEXP_GROUP": {
    msg: "SyntaxError: invalid regexp group",
    hint: "ヒント: 正規表現内の丸カッコ『()』によるグループ化の構造が壊れているか、サポートされていない不正な拡張構文が使われています。"
  },
  "FOR_OF_LOOP_MULTIPLE_DECL": {
    msg: "SyntaxError: for-of loop head declarations may not have multiple variables",
    hint: "ヒント: for...of ループの宣言（for (const x of arr)）において、複数の変数（for (const x, y of arr)）を同時に宣言することは禁止されています。"
  },
  "FOR_IN_LOOP_MULTIPLE_DECL": {
    msg: "SyntaxError: for-in loop head declarations may not have multiple variables",
    hint: "ヒント: for...in ループの宣言において、複数の変数をカンマ区切りで同時に定義することは言語仕様上禁止されています。"
  },
  "ACCESS_LEXICAL_BEFORE_INIT": {
    msg: "ReferenceError: can't access lexical declaration before initialization",
    hint: "ヒント: let や const で宣言された変数に対して、その宣言行よりも『手前（上側）』のコードでアクセスしようとしています（一時的死滅地帯: TDZ エラー）。"
  },
  "ASSIGN_TO_UNDECLARED_VARIABLE": {
    msg: "ReferenceError: assignment to undeclared variable",
    hint: "ヒント: 厳格モードでは、let や const などのキーワードを一切つけずに、存在しない変数に対して直接値を代入（x = 10）することは厳しく禁止されています。"
  },
  "MUST_CALL_SUPER_BEFORE_THIS": {
    msg: "ReferenceError: must call super constructor before using 'this' in derived class constructor",
    hint: "ヒント: 継承された子クラスのコンストラクタ内で、親クラスを初期化する 'super()' を呼び出すよりも前に 'this' 演算子を使用することは禁止されています。"
  },
  "SUPER_CALLED_TWICE_IN_CONSTRUCTOR": {
    msg: "ReferenceError: super() called twice in derived class constructor",
    hint: "ヒント: 派生クラスのコンストラクタの内部で、親クラスの初期化関数 'super()' を 2 回以上重複して呼び出すことはできません。"
  },
  "DEPRECATED_CALLER_ARGUMENTS_USAGE": {
    msg: "ReferenceError: deprecated caller or arguments usage",
    hint: "ヒント: 現代の厳格モードでは、関数のプロパティである 'fn.caller' や 'fn.arguments' を使ってコールスタックを覗き見るレガシー操作は完全に廃止されています。"
  },
  "CANT_DELETE_PRIVATE_FIELDS": {
    msg: "SyntaxError: private fields can't be deleted",
    hint: "ヒント: クラスの内部にあるシャープ記号付きのプライベート変数（#field）は、delete 演算子で消去することが文法上不可能です。"
  },
  "REDECLARED_FORMAL_PARAMETER_SCOPED": {
    msg: "SyntaxError: redeclaration of formal parameter",
    hint: "ヒント: 関数の引数リストで定義した名前と、全く同じ名前をその関数の直下のローカルスコープ内で再宣言することはできません。"
  },

    "X_IS_NOT_ITERABLE": {
    msg: "TypeError: 'x' is not iterable",
    hint: "ヒント: 配列の展開（...obj）や for...of ループにおいて、反復可能（iterable）ではない通常のオブジェクトや null、undefined をループさせようとしています。データ構造が配列やMap等になっているか確認してください。"
  },
  "X_IS_NOT_A_CONSTRUCTOR": {
    msg: "TypeError: \"x\" is not a constructor",
    hint: "ヒント: 構造クラス（class）やコンストラクタ関数ではないオブジェクトやアロー関数に対して、誤って 'new' 演算子をつけてインスタンス化しようとしています。"
  },
  "X_IS_NOT_A_FUNCTION": {
    msg: "TypeError: \"x\" is not a function",
    hint: "ヒント: 関数（function）ではない文字列、数値、または undefined の入った変数に対して、カッコ『()』をつけて実行しようとしています。スペルミスや、APIの戻り値の型を確認してください。"
  },
  "X_IS_NOT_A_NON_NULL_OBJECT": {
    msg: "TypeError: \"x\" is not a non-null object",
    hint: "ヒント: Object.create や Object.setPrototypeOf 等の引数において、null 以外のピュアなオブジェクトを渡さなければいけない場所に、不正なプリミティブ型が渡されています。"
  },
  "X_IS_READ_ONLY": {
    msg: "TypeError: \"x\" is read-only",
    hint: "ヒント: 厳格モードにおいて、書き換えが厳しく禁止されている読み取り専用（read-only）のシステムプロパティや、フリーズされたオブジェクトの属性の値を上書きしようとしています。"
  },
  "ALREADY_EXECUTING_GENERATOR": {
    msg: "TypeError: already executing generator",
    hint: "ヒント: すでに現在実行中（ループ処理の途中）のジェネレーター関数に対して、多重で新しく処理を開始するように命令が衝突してしまっています。実行管理を見直してください。"
  },
  "BIGINT_SERIALIZED_IN_JSON": {
    msg: "TypeError: BigInt value can't be serialized in JSON",
    hint: "ヒント: JSON.stringify() は標準の仕様上、BigInt（巨大整数：10n など）の変換に完全非対応です。あらかじめ文字列（toString()）や数値に変換してからシリアライズしてください。"
  },
  "CALL_BUILTIN_WITHOUT_NEW": {
    msg: "TypeError: calling a builtin X constructor without new is forbidden",
    hint: "ヒント: Map, Set, Promise などのモダンな標準クラスコンストラクタは、必ず 'new' をつけて呼び出す必要があります。new を忘れていないか確認してください。"
  },
  "CANT_ACCESS_PRIVATE_FIELD_WRONG_CLASS": {
    msg: "TypeError: can't access/set private field or method: object is not the right class",
    hint: "ヒント: 対象のクラスのインスタンスではない、全く別のオブジェクトや外部のコンテキストから、シャープ記号付きのプライベート変数（#field）を不正に覗き見ようとしています。"
  },
  "CANT_ASSIGN_PROP_NOT_AN_OBJECT": {
    msg: "TypeError: can't assign to property \"x\" on \"y\": not an object",
    hint: "ヒント: オブジェクトではないプリミティブな値（特に null や undefined）に対して、プロパティを新しく追加（obj.name = 'value'）しようとしてエラーが起きています。"
  },
  "CANT_CONVERT_BIGINT_TO_NUMBER": {
    msg: "TypeError: can't convert BigInt to number",
    hint: "ヒント: Math クラスの関数や、通常の Number 型しか受け付けない厳格な演算処理の引数に対して、互換性のない BigInt（巨大整数）をそのまま直接ブチ込んでしまっています。"
  },
  "CANT_CONVERT_X_TO_BIGINT": {
    msg: "TypeError: can't convert x to BigInt",
    hint: "ヒント: BigInt() コンストラクタに対して、変換不可能な型（オブジェクト、Symbol、または undefined）を渡して強制変換しようとしています。"
  },
  "CANT_DEFINE_PROP_NOT_EXTENSIBLE": {
    msg: "TypeError: can't define property \"x\": \"obj\" is not extensible",
    hint: "ヒント: Object.preventExtensions() 等によって、新しいプロパティの追加が完全に禁止（拡張不可）された状態のオブジェクトに対して、無理やり属性を増やそうとしています。"
  },
  "CANT_DELETE_NON_CONFIGURABLE": {
    msg: "TypeError: can't delete non-configurable array element",
    hint: "ヒント: 設定不可能（non-configurable）な設定が施された、削除禁止の特別な配列要素やプロパティに対して delete 演算子を実行して拒絶されました。"
  },
  "CANT_REDEFINE_NON_CONFIGURABLE": {
    msg: "TypeError: can't redefine non-configurable property \"x\"",
    hint: "ヒント: Object.defineProperty() において、すでに変更禁止（non-configurable）として確定している既存のプロパティの属性（列挙可否など）を上書きしようとしています。"
  },
  "CANT_SET_PROTOTYPE_OF_THIS": {
    msg: "TypeError: can't set prototype of this object",
    hint: "ヒント: プロトタイプ（__proto__ の参照先）の変更が厳しくロックされている特別なオブジェクトに対して、強制的にプロトタイプの書き換えを試みて拒絶されました。"
  },
  "CANT_SET_PROTOTYPE_CYCLE": {
    msg: "TypeError: can't set prototype: it would cause a prototype chain cycle",
    hint: "ヒント: オブジェクト A のプロトタイプに B を指定し、B のプロトタイプに A を指定するような、プロトタイプチェーンの無限循環（循環参照のバグ）が発生してブラウザがパニックを起こしています。"
  },

    "CANT_USE_IN_OPERATOR_PRIMITIVE": {
    msg: "TypeError: cannot use 'in' operator to search for 'x' in 'y'",
    hint: "ヒント: in 演算子を使ってプロパティを探そうとしていますが、探す対象（y）がオブジェクトではなく文字列や数値などのプリミティブ型、または null / undefined になっています。"
  },
  "CLASS_CONSTRUCTOR_NEED_NEW": {
    msg: "TypeError: class constructors must be invoked with 'new'",
    hint: "ヒント: クラス（class）のコンストラクタは、必ず 'new' 演算子をつけて呼び出さなければいけません。通常の関数のように new なしで呼び出すことは不可能です。"
  },
  "CYCLIC_OBJECT_VALUE": {
    msg: "TypeError: cyclic object value",
    hint: "ヒント: オブジェクトの中に自分自身や循環する参照（Aの中にBがあり、Bの中にAがある）が含まれているため、JSON.stringify() などの処理が無限ループを起こして失敗しました。"
  },
  "DERIVED_CLASS_RETURNED_INVALID": {
    msg: "TypeError: derived class constructor returned invalid value x",
    hint: "ヒント: 継承された子クラスのコンストラクタにおいて、戻り値（return）としてオブジェクト以外の不正なプリミティブ型が返されました。通常コンストラクタの戻り値は不要です。"
  },
  "GETTING_PRIVATE_SETTER_ONLY": {
    msg: "TypeError: getting private setter-only property",
    hint: "ヒント: セッター（値の代入専用）しか定義されていないシャープ記号付きのプライベート変数に対して、値を読み出そう（取得）として拒絶されました。"
  },
  "INITIALIZING_PRIVATE_FIELD_TWICE": {
    msg: "TypeError: Initializing an object twice is an error with private fields/methods",
    hint: "ヒント: 同じオブジェクトインスタンスに対して、クラスのプライベートプロパティやメソッドを 2 回以上二重に初期化しようとする内部エラーが発生しました。"
  },
  "INVALID_INSTANCEOF_OPERAND": {
    msg: "TypeError: invalid 'instanceof' operand 'x'",
    hint: "ヒント: instanceof 演算子の右側（x）には、クラスやコンストラクタ関数を置かなければいけません。通常のオブジェクトやプリミティブ型を右側に置くことは禁止されています。"
  },
  "INVALID_ARRAY_SORT_ARGUMENT": {
    msg: "TypeError: invalid Array.prototype.sort argument",
    hint: "ヒント: Array.prototype.sort() の引数には、並び替えのルールを決める「比較関数（function）」を渡す必要があります。関数以外の型を渡したため拒絶されました。"
  },
  "INVALID_ASSIGNMENT_TO_CONST": {
    msg: "TypeError: invalid assignment to const \"x\"",
    hint: "ヒント: const キーワードで作られた定数 'x' に対して、あとから値を再代入して上書きしようとしています。値を変更したい場合は宣言を let に変えてください。"
  },
  "ITERATOR_CONSTRUCTOR_CANT_USE_DIRECTLY": {
    msg: "TypeError: Iterator/AsyncIterator constructor can't be used directly",
    hint: "ヒント: 標準の Iterator や AsyncIterator のコンストラクタは抽象クラスのような存在であり、new Iterator() のように直接インスタンス化することは仕様上禁止されています。"
  },
  "REGEXP_MUST_BE_GLOBAL": {
    msg: "TypeError: matchAll/replaceAll must be called with a global RegExp",
    hint: "ヒント: String.prototype.replaceAll() や matchAll() に正規表現を渡す場合、必ずグローバルフラグ（/regex/g のように末尾に 'g'）を付与しなければいけません。"
  },
  "MORE_ARGUMENTS_NEEDED": {
    msg: "TypeError: More arguments needed",
    hint: "ヒント: 呼び出した標準組み込みメソッド（Object.create など）が必要としている最低限の引数の数が不足しています。リファレンスを確認して引数を足してください。"
  },
  "X_HAS_NO_PROPERTIES": {
    msg: "TypeError: \"x\" has no properties",
    hint: "ヒント: プロパティを一切持たない値（特に null や undefined）に対して、ドットアクセス（obj.property）を試みたため、致命的なヌルポインタエラーが発生しています。"
  },
  "PROPERTY_IS_NON_CONFIGURABLE": {
    msg: "TypeError: property \"x\" is non-configurable and can't be deleted",
    hint: "ヒント: 設定変更や削除が厳しくロックされているオブジェクトの特別なプロパティ 'x' を、delete 演算子で無理やり消去しようとして拒絶されました。"
  },
  "REDUCE_OF_EMPTY_ARRAY": {
    msg: "TypeError: Reduce of empty array with no initial value",
    hint: "ヒント: 空っぽの配列（[]）に対して、初期値（第2引数）を省略した状態で .reduce() や .reduceRight() メソッドを実行したためエラーが発生しました。"
  },

  "SETTING_GETTER_ONLY_PROPERTY": {
    msg: "TypeError: setting getter-only property \"x\"",
    hint: "ヒント: ゲッター（値の読み出し専用）しか定義されていないプロパティ 'x' に対して、値を代入して上書きしようとしたため拒絶されました。代入するには set メソッド（セッター）を定義してください。"
  },
  "WEAKSET_KEY_MUST_BE_OBJECT": {
    msg: "TypeError: WeakSet key/WeakMap value 'x' must be an object or an unregistered symbol",
    hint: "ヒント: WeakSet の要素、または WeakMap のキー（x）には、ガベージコレクションの対象となるオブジェクト、または登録されていない Symbol を渡す必要があります。数値や文字列は使用できません。"
  },
  "INCOMPATIBLE_OBJECT_TYPE": {
    msg: "TypeError: X.prototype.y called on incompatible type",
    hint: "ヒント: ある標準クラスのプロトタイプメソッド（例: Map.prototype.has）を、全く互換性のない別のオブジェクトやデータ型に対して強制的にバインド（call や apply）して実行しようとしました。"
  },
  "MALFORMED_URI_SEQUENCE": {
    msg: "URIError: malformed URI sequence",
    hint: "ヒント: decodeURIComponent() などのURLエンコード/デコード関数において、パーセント記号『%』の直後の16進数文字列の形式が不正（不完全なデータ）になっています。"
  },
  "UNREACHABLE_CODE_AFTER_RETURN": {
    msg: "Warning: unreachable code after return statement",
    hint: "ヒント: return 文や throw 文、break 文の直下の行にコードが記述されています。これらの命令が実行された時点で関数が終了するため、それ以降のコードは絶対に実行されません（到達不能コード）。"
  },
  "BIGINT_NEGATIVE_EXPONENT": {
    msg: "RangeError: BigInt negative exponent",
    hint: "ヒント: BigInt（巨大整数）のべき乗計算（x ** y）において、指数（y）に負の数値が指定されました。BigIntのべき乗では、負の数を指定することは文法上禁止されています。"
  },
  "INVALID_ARRAY_LENGTH": {
    msg: "RangeError: invalid array length",
    hint: "ヒント: new Array(長さ) や、Array.prototype.length への代入において、負の数、またはブラウザの扱える上限（42億9496万7295）を超える巨大な配列の長さが指定されました。"
  },
  "INVALID_DATE_FORMAT": {
    msg: "RangeError: invalid date",
    hint: "ヒント: Date オブジェクトの初期化や、Date.parse() に渡された日付の文字列フォーマットが不正であるか、13月32日のように現実的に存在しない不正な日付データが渡されました。"
  },

    "PRECISION_OUT_OF_RANGE": {
    msg: "RangeError: precision is out of range",
    hint: "ヒント: Number.prototype.toPrecision() ［cite: 29］ において、指定された有効桁数の値が標準仕様の許容範囲（通常 1 〜 100）を超えています。"
  },
  "RADIX_MUST_BE_AN_INTEGER": {
    msg: "RangeError: radix must be an integer",
    hint: "ヒント: Number.prototype.toString(進数) ［cite: 29］ において、基数（radix）として許容範囲である 2 から 36 以外の不正な数値、または小数が指定されました。"
  },
  "REPEAT_COUNT_MUST_BE_LESS_INF": {
    msg: "RangeError: repeat count must be less than infinity",
    hint: "ヒント: String.prototype.repeat(回数) ［cite: 29］ において、繰り返す回数に無限大（Infinity） ［cite: 13］ や、ブラウザの最大文字列長を超える巨大な数値が指定されました。"
  },
  "REPEAT_COUNT_MUST_BE_NON_NEGATIVE": {
    msg: "RangeError: repeat count must be non-negative",
    hint: "ヒント: String.prototype.repeat(回数) ［cite: 29］ において、繰り返す回数に負の数（マイナスの値）が指定されました。0 以上の整数を指定してください。"
  },

    "CANT_CONVERT_X_TO_BIGINT_NOT_INT": {
    msg: "RangeError: x can't be converted to BigInt because it isn't an integer",
    hint: "ヒント: BigInt() コンストラクタ ［cite: 13, 29］に対して、整数ではない小数（例: 10.5）や有効な数値ではない値を渡して強制変換しようとしています。"
  },
  "DUPLICATE_SOURCE_MAPPING_URL": {
    msg: "Warning: -file- is being assigned a //# sourceMappingURL, but already has one",
    hint: "ヒント: 対象のスクリプトファイルに対して、すでにソースマップの指定が完了しているにもかかわらず、重ねて二重に sourceMappingURL コメント ［cite: 1］が追加されています。"
  },

    "INTERNAL_TOO_MUCH_RECURSION": {
    msg: "InternalError: too much recursion",
    hint: "ヒント: 関数の無限ループ（無限再帰呼び出し）が発生し、ブラウザのメモリ上限（スタック）を突破しました。必ずループが途中で終わるように終了条件（ベースケース）をチェックしてください。"
  }

    ,
  "TIDE_INTERNAL_PARSE_ERROR": {
    msg: "InternalError: TIDE static analysis parsing crash",
    hint: "ヒント: リンターエンジン（TIDE）の内部パース処理中に重大な構文解析エラー、または不正なトークン配列が発生しました。\nコード内の分割代入のネストや、文字列クォートの閉じ忘れが入念に処理されているか確認してください。"
  }

  
};

// 💡 【超拡張】MDN完全同期・単体レガシー非推奨キーワード全集
export const DEPRECATED_WORDS = [
  "substr", "substring", "escape", "unescape", "with", "caller", "callee",
  "showModalDialog", "applicationCache", "AppCache", "keyCode", "__proto__",
  "octal_escape", "arguments.caller", "arguments.callee", "DomainRequest",
  "XDomainRequest", "HTMLAllCollection", "createImageBitmap-deprecated",
  "DOMError", "SVGPathSeg", "crypto.subtle.sign-deprecated", "TextEncoder-deprecated"
];

// 💡 【超拡張】MDN完全同期・レガシーオブジェクト＆メソッドペアデータベース
export const DEPRECATED_PAIRS = {
  "document": ["all", "write", "writeln", "alinkColor", "bgColor", "fgColor", "linkColor", "vlinkColor", "anchors", "applets", "embeds", "plugins"],
  "navigator": ["getUserMedia", "registerProtocolHandler-deprecated", "appName", "appVersion", "platform", "userAgent-deprecated", "plugins-deprecated", "mimeTypes-deprecated"],
  "KeyboardEvent": ["keyCode", "charCode", "which"],
  "MouseEvent": ["which", "x", "y"],
  "Object.prototype": ["proto", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__"],
  "String.prototype": ["anchor", "big", "blink", "bold", "fixed", "fontcolor", "fontsize", "italics", "link", "small", "strike", "sub", "sup"],
  "Date.prototype": ["getYear", "setYear", "toGMTString"],
  "Function.prototype": ["caller", "arguments"],
  "Window": ["showModalDialog", "orientation", "captureEvents", "releaseEvents"],
  "Element": ["createShadowRoot"],
  "AudioContext": ["createJavaScriptNode"]
};

// 💡 【超拡張】MDN完全同期・レガシー文字列ラッパーメソッド（単体検証用）
export const DEPRECATED_STR_METHODS = [
  "anchor", "big", "blink", "bold", "fixed", "fontcolor", "fontsize", "italics", "link", "small", "strike", "sub", "sup"
];

// =========================================================
// 🧠 V8-Architecture Internal Type & Factory Engine
// =========================================================

/**
 * V8エンジンの内部型生成クラス（TIDE Internal Object）を模した
 * 超高速な静的エラーオブジェクト生成ファクトリー
 */
export class TIDEErrorFactory {
  /**
   * 識別子（ID）を元に、MDN準拠の完全なエラーオブジェクトを爆速で生成してエクスポートする
   * @param {string} errorId - エラー識別子
   * @param {number} lineNo - 発生した行番号
   * @param {string} rawLineText - 発生行の生のコードテキスト
   * @param {string} [customWord=""] - 未定義変数名などのカスタム動的ワード
   */
  static create(errorId, lineNo, rawLineText, customWord = "") {
    // データベースから基本の定義を引っ張る
    const baseError = MDN_ERR_MAP[errorId];
    
    // 万が一IDが見つからない場合は、TIDE内部パースエラー（隠しボス）としてフォールバック
    if (!baseError) {
      return TIDEErrorFactory.create("TIDE_INTERNAL_PARSE_ERROR", lineNo, rawLineText);
    }

    let finalMsg = baseError.msg;
    let finalHint = baseError.hint;

    // 動的な変数名が含まれる ReferenceError などの場合は、メッセージ内に名前を埋め込む（V8文脈エミュレート）
    if (customWord) {
      if (errorId === "NOT_DEFINED") {
        finalMsg = `ReferenceError: ${customWord} is not defined`;
      } else if (errorId === "INVALID_ASSIGNMENT_TO_CONST") {
        finalMsg = `TypeError: invalid assignment to const "${customWord}"`;
      } else if (errorId === "X_IS_NOT_A_FUNCTION") {
        finalMsg = `TypeError: "${customWord}" is not a function`;
      } else if (errorId === "X_IS_NOT_ITERABLE") {
        finalMsg = `TypeError: '${customWord}' is not iterable`;
      }
    }

    // リンターのメイン司令塔（tide.js）が100%そのまま受け取れる完璧なオブジェクトを生成してエクスポート
    return {
      name: customWord || errorId,
      value: customWord ? "DynamicRef" : "Warning",
      type: baseError.msg.split(":")[0].trim().toLowerCase(), // syntaxerror, typeerror 等に自動変換
      error: true,
      errorcode: errorId.includes("DECLARED") ? 1 : (errorId.includes("INITIALIZER") ? 2 : (errorId.includes("NOT_DEFINED") ? 3 : (errorId.includes("TOKEN") ? 4 : 5))),
      line: lineNo,
      all: rawLineText,
      mdnMessage: finalMsg,
      mdnHint: finalHint
    };
  }
}

/**
 * 渡された識別子が組み込み安全リストに含まれているかをV8級の速度で高速判定するエクスポート関数
 * @param {string} word - 判定する単語
 * @returns {boolean}
 */
export function isValidV8Builtin(word) {
  return TIDE_BUILTINS.has(word);
}
