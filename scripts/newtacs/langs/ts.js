import { ApplyHighlighttoJS, JStheme } from "./js.js";
export const TStheme = JStheme + ` .k { color: #569cd6; } .b { color: #4ec9b0; } `;
export function ApplyHighlighttoTS(t) { return ApplyHighlighttoJS(t); } // JSベースで超高速共用
