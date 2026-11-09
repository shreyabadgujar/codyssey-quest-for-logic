const { entry } = require("./entry");
const glyphs = [..."◈✦◇⬡⊙◐△◉✶▣◬☷⟐✧⬟◒"];
const turn = (list, offset) => [...list.slice(offset), ...list.slice(0, offset)];
function cipher(i,id,title,tier,story, alphabet, alignment, rows, mode, reading, answer, hints, explanation) {
  const ring = glyphs.slice(0, alphabet.length);
  const aligned = turn(ring, alignment);
  const key = Object.fromEntries(aligned.map((symbol, index) => [symbol, alphabet[index]]));
  const groups = rows.map(row => [...row].map(letter => aligned[alphabet.indexOf(letter)]));
  const symbols = [...new Set(groups.flat())].sort();
  return entry(i,id,title,tier,"cipher",story,"Calibrate the wheel, record the substitution, and recover the transmission.",
    "Rotate the inner glyph ring until the calibration pair aligns. Enter each used glyph’s mapped letter, then apply the packet reading rule. Enter the transmission in reading order; spaces are optional.",
    { alphabet: [...alphabet], ring, alignment, calibration: { glyph: aligned[0], letter: alphabet[0] }, groups, symbols, mode, reading },
    { key, answer },hints,explanation);
}
module.exports = [
  cipher(1,"messenger-relay","The Messenger Relay","Medium",
    "The courier's linked packets arrived intact but their pointers were followed from the tail. The dock code is hidden across the fragments.",
    "DOCKTHRE",3,["REE","KTH","DOC"],"reverse","Read each row left to right, starting from the bottom packet and working upward.","DOCKTHREE",
    ["Match the stamped D before reading packets.","Reverse the order of the packets, not the letters within them.","Write out each decoded packet and follow the links from the bottom."],
    "The calibrated rows read REE, KTH, DOC. Reverse the row order while preserving each row to recover DOCK THREE."),
  cipher(2,"undo-spell","The Undo Spell","Hard",
    "A spell scribe's recorder saved alternating strips in reverse during its undo pass. The backup contains the key to the vault.",
    "RESTOHKY",2,["RES","EROT","THE","YEK"],"alternating","The second and fourth strips were pushed backward. Read the first and third normally; reverse the second and fourth.","RESTORETHEKEY",
    ["Treat the engraved alphabet as fixed.","Only the even-numbered strips are reversed.","Undo each local reversal before joining the strips."],
    "The four rows are RES, EROT, THE, YEK. Correcting the reversed strips gives RES, TORE, THE, KEY; the reconstructed text is RESTORE THE KEY."),
  cipher(5,"roots-message","The Root's Message","Hard",
    "A tree vault encoded its inscription across three branch ledgers. The row reader destroyed the spaces and jumbled adjacent letters.",
    "ROTSIDE",1,["RTD","OIE","OSR"],"columns","Take the first glyph from every row top to bottom, then the second glyph from every row, then the third.","ROOTISDER",
    ["Finish the substitution before changing reading order.","Write the three decoded rows in a grid.","Read down each column, never diagonally."],
    "RTD, OIE and OSR produce the columns ROO, TIS, DER. Read together, the inscription is ROOT IS DER: Der is the ancestor named by the vault."),
  cipher(8,"archivists-cipher","The Archivist's Cipher","Expert",
    "The archivist hid a delivery command on two rails. An interceptor managed to read one rail without realizing half the characters were absent.",
    "BRINGTHEMPA",5,["BIGHMP","RNTEA"],"rail","The upper rail holds positions 1, 3, 5, …; the lower rail holds 2, 4, 6, …. Interleave, starting on the upper rail.","BRINGTHEMAP",
    ["Align B before mapping the transmission.","Do not concatenate the two rails.","Take one from each rail in turn; a final unmatched glyph belongs to the longer rail."],
    "The odd positions of BRING THE MAP are B, I, G, H, M, P and the even positions are R, N, T, E, A. Interleaving restores the delivery command."),
  cipher(8,"scrambled-scroll","The Scrambled Scroll","Hard",
    "The scroll's rotating sleeve moves whole rows past the reading notch. The same rotation sets both the substitution ring and the first row to read.",
    "OPENVAULTH",2,["AULT","OPEN","THEV"],"rotate","Advance the row pointer by the same number of clockwise clicks used to align the wheel, wrapping around the number of rows.","THEVAULTOPEN",
    ["Start with the wheel at its indexed zero mark.","Each click advances the first row by one, with wraparound.","Keep the glyph order inside every row unchanged."],
    "Two clockwise clicks place row three first. The decoded rows in that order are THEV, AULT, OPEN, so the raw text is THE VAULT OPEN."),
];
