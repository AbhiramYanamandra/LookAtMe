/**
 * Cycle-by-cycle traces of the COMP3211 ballot-counting core, taken from a
 * simulation of the submitted VHDL (nvc 1.23, VHDL-2008 testbench probing the
 * pipeline registers on every clock). Generics match the board build: 4-bit
 * tag, 12-bit record (8-bit vote count, 2-bit district, 2-bit candidate),
 * secret key 0x8AE2.
 *
 * Each record runs as three instructions — SEC (load key), BNE (check tag),
 * WRITE (add to tally memory). Stage slots hold the instruction in that stage
 * during the cycle; "WB" is the MEM stage of the previous cycle, since tally
 * instructions retire in MEM and only pass through MEM/WB.
 *
 * `tally` is candidate 1's total in tally memory during the cycle; `write`
 * marks the clock edge at the end of the cycle where the memory adds the vote.
 */

// [IF, ID, EX, MEM, comparison_active, decoded tag, latched tag, sig_flush]
const VALID = [
  ["SEC", null, null, null, 0, 15, 0, 0],
  ["BNE", "SEC", null, null, 0, 15, 0, 0],
  ["WRITE", "BNE", "SEC", null, 0, 15, 0, 0],
  [null, "WRITE", "BNE", "SEC", 0, 11, 0, 0],
  [null, null, "WRITE", "BNE", 0, 11, 0, 0],
  [null, null, null, "WRITE", 1, 11, 11, 0],
  [null, null, null, null, 0, 11, 11, 0],
];

const TAMPERED = [
  ["SEC", null, null, null, 0, 11, 11, 0],
  ["BNE", "SEC", null, null, 0, 11, 11, 0],
  ["WRITE", "BNE", "SEC", null, 0, 11, 11, 0],
  [null, "WRITE", "BNE", "SEC", 0, 11, 11, 0],
  [null, null, "WRITE", "BNE", 0, 11, 11, 0],
  [null, null, null, "WRITE", 1, 11, 9, 1],
  [null, null, null, null, 0, 11, 9, 0],
];

function build(rows, { tagIn, start, writes }) {
  let tally = start;
  return rows.map((row, i) => {
    const [IF, ID, EX, MEM, cmp, decoded, latched, flush] = row;
    const stages = { IF, ID, EX, MEM, WB: i > 0 ? rows[i - 1][3] : null };
    const cycle = { stages, cmp: !!cmp, decoded, latched, flush: !!flush, tagIn, tally, write: writes && MEM === "WRITE" };
    if (cycle.write) tally += 1;
    return cycle;
  });
}

export const STAGES = ["IF", "ID", "EX", "MEM", "WB"];

/** Plain-language notes for each cycle, shared by every scenario. */
const NOTES = [
  "SEC is fetched. The opcode, record, tag and key are latched into IF/ID together.",
  "The control unit decodes SEC and raises sec_enable. BNE is fetched behind it.",
  "SEC passes through EX. BNE is decoded (bne_enable). WRITE is fetched.",
  "SEC reaches MEM: the secret-key register loads 0x8AE2 on this edge, and the decoder regenerates the record's tag.",
  "BNE reaches MEM and arms the comparison, latching the tag that arrived with the record.",
  null, // scenario-specific: the tag check
  "WRITE moves into WB. Tally instructions retire in MEM, so there is nothing to write back.",
];

export const SCENARIOS = [
  {
    id: "valid",
    label: "Valid tag",
    summary: "Record arrives with tag 0xB. The decoder agrees, so the vote is counted.",
    cycles: build(VALID, { tagIn: 11, start: 0, writes: true }),
    check: "Tag 0xB matches the decoded 0xB. No flush; tally memory adds the vote on this edge.",
  },
  {
    id: "tampered",
    label: "Tampered tag",
    summary: "Same record, tag 0x9. The mismatch is caught — one cycle too late.",
    cycles: build(TAMPERED, { tagIn: 9, start: 1, writes: true }),
    check: "Tag 0x9 ≠ decoded 0xB, so sig_flush goes high. But the flush clears IF/ID, which is empty — WRITE is already in MEM, and the vote is added anyway.",
  },
  {
    id: "fixed",
    label: "With fix",
    summary: "Tag 0x9 again, with the tally write gated on the tag check.",
    cycles: build(TAMPERED, { tagIn: 9, start: 1, writes: false }),
    check: "Mismatch detected. With the one-line gate, tally memory's mode is forced to idle, so the write is dropped.",
  },
].map((s) => ({ ...s, notes: NOTES.map((n) => n ?? s.check) }));
