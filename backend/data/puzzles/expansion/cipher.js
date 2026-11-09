const { cipher } = require("./build");

module.exports = [
  cipher({
    island:4, id:"bisection-strip", title:"The Bisection Strip", tier:"Hard", tags:["Index ordering","Two pointers","Transposition"],
    story:"The summit keeper encoded the boundary report between the outer columns first and the inner columns later. The loose strips preserve their row order but not the intended reading sequence.",
    objective:"Calibrate the wheel and recover the report by shrinking the column bounds from the outside in.",
    alphabet:"BOUNDATIH", alignment:4, rows:["BTNN","ONTD","UIHA"], mode:"outside-in",
    reading:"Read each column top to bottom. Start at the leftmost column, then the rightmost, then the leftmost unread, then the rightmost unread. Continue until all columns have been read.",
    answer:"BOUNDATNINTH",
    hints:["The calibration pair identifies one wheel position.","Use the current left and right unread boundaries, rather than reading rows consecutively.","The column order is 1, 4, 2, 3. Decode each column from its top cell."],
    explanation:"The decoded rows are BTNN, ONTD, UIHA. Columns 1, 4, 2, 3 give BOU, NDA, TNI, NTH. That spells BOUND AT NINTH. A pair of moving bounds avoids visiting a column twice when alternating between the edges.",
  }),
  cipher({
    island:7, id:"mirror-dispatch", title:"The Mirror Dispatch", tier:"Hard", tags:["Recursive reversal","Alternating traversal","Transposition"],
    story:"Every reflection of the dispatch flips the vertical direction. The first column is seen in a mirror, then each neighbouring column is seen through one more reflection.",
    objective:"Recover the dispatch by applying the alternating reflection rule to the decoded grid.",
    alphabet:"RETUNAO", alignment:3, rows:["ORUT","OTRE","TANR"], mode:"mirror-columns",
    reading:"Start with the rightmost column. Read that column bottom to top. Move one column left and reverse your vertical direction each time until no columns remain.",
    answer:"RETURNATROOT",
    hints:["Rotate the wheel so the stamped glyph lands beside its letter.","The first column you read is the rightmost, and its bottom glyph comes first.","Alternate bottom-up and top-down as you move left. Each reflection toggles one direction flag."],
    explanation:"The decoded rows are ORUT, OTRE, TANR. Read the fourth column upward for RET, the third downward for URN, the second upward for ATR, and the first downward for OOT. RETURN AT ROOT is the message. Applying a reversal twice restores the original direction, so only the parity of the reflection count matters.",
  }),
  cipher({
    island:8, id:"diagonal-vines", title:"The Diagonal Vines", tier:"Medium", tags:["String indexing","Diagonal traversal","Transposition"],
    story:"Three vines hold pieces of a bark inscription. Their scratched marks record diagonals across the tablet, starting from the upper-left corner.",
    objective:"Recover the inscription by reading the diagonal bands in their engraved order.",
    alphabet:"PREFIXND", alignment:2, rows:["PRF","EIE","XND"], mode:"diagonal",
    reading:"Start at the upper-left cell. Read bands of equal row plus column number in increasing sum order. Within a band read the upper row before the lower rows.",
    answer:"PREFIXEND",
    hints:["The outer alphabet does not move when you rotate the glyph ring.","The first band contains only the upper-left glyph. The second has one glyph in each of the first two rows.","The band lengths are 1, 2, 3, 2, 1."],
    explanation:"The decoded rows are PRF, EIE, XND. The bands give P, RE, FIX, EN, D, spelling PREFIX END. A diagonal groups cells by a shared index sum, which is different from grouping by row or column alone.",
  }),
];
