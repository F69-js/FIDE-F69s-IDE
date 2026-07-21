let emojis = {
    ":grinning:": "😀",
    ":grinning_face:": "😀",
    ":smiley:": "😃",
    ":smile:": "😄",
    ":grin:": "😁",
    ":laughing:": "😀",
    ":satisfied:": "😀",
    ":face_holding_back_tears:": "😢",
    ":sweat_smile:": "😂",
    ":joy:": "😂",
    ":rofl:": "🤣",
    ":rolling_on_the_floor_laughing:": "🤣",
    ":smiling_face_with_tear:": "🥲",
    ":relaxed:": "☺️",
    ":smiling_face:": "☺️",
    ":blush:": "😊",
    ":innocent:": "😇",
    ":slight_smile:": "🙂",
    ":slightly_smiling_face:": "🙂",
    ":upside_down:": "🙃",
    ":upside_down_face:": "🙃",
    ":wink:": "😉",
    ":winking_face:": "😉",
    ":relieved:": "😌",
    ":relieved_face:": "😌",
    ":heart_eyes:": "😍",
    ":smiling_face_with_3_hearts:": "🥰",
    ":kissing_heart:": "😘",
    ":kissing:": "😗",
    ":kissing_face:": "😗",
    ":kissing_smiling_eyes:": "😙",
    ":kissing_closed_eyes:": "😚",
    ":yum:": "🤤",
    ":stuck_out_tongue:": "😛",
    ":stuck_out_tongue_closed_eyes:": "😝",
    ":stuck_out_tongue_winking_eye:": "😜",
    // 💡 宇宙で目覚めたAIロボットの記念ショートコードを追加！
    ":robot_in_space:": "🤖🚀🪐",
    ":uwu:": "(UwU)",
    ":fox_face:": "🦊",
    ":dog_face:": "🐶"
};

export function ReplaceEmoji(text) {
    if (typeof text !== "string") return text;
    // 正規表現で :ショートコード: を一括検出して置換する爆速処理
    return text.replace(/:[a-z0-9_]+:/g, (match) => {
        return emojis[match] || match;
    });
}
