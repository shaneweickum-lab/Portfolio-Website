/**
 * A rateless erasure code over GF(2) (Random Linear Network Coding), plus
 * the framing used to carry it over a lossy, one-way physical channel.
 *
 * Sender emits source blocks 0..k-1 verbatim first ("systematic" phase),
 * then repair symbols whose coefficient mask is a deterministic function
 * of the symbol index alone (no mask is ever transmitted). The receiver
 * maintains the accepted symbols as a full reduced row-echelon form (GF(2)
 * Gauss-Jordan) so a row can become a fully-decoded block the moment it
 * reduces to weight 1, without waiting for the whole transfer to finish.
 */

export const FRAME_BYTES = 16;

const TYPE_METADATA = 0x01;
const TYPE_DATA = 0x02;
const HEADER_BYTES = 1 + 2; // type + symbolIndex (data frames only)
const CRC_BYTES = 2;
export const BLOCK_SIZE = FRAME_BYTES - HEADER_BYTES - CRC_BYTES; // 11 bytes

export interface FileMetadata {
  blockCount: number;
  fileSize: number;
}

export type DecodedFrame =
  | { type: "metadata"; meta: FileMetadata }
  | { type: "data"; symbolIndex: number; payload: Uint8Array };

// --- CRC16/CCITT-FALSE, no lookup table (frames are tiny, table isn't worth it) ---

function crc16(bytes: Uint8Array): number {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

// --- Frame encode/decode ---

export function encodeMetadataFrame(meta: FileMetadata): Uint8Array {
  const frame = new Uint8Array(FRAME_BYTES);
  frame[0] = TYPE_METADATA;
  frame[1] = (meta.blockCount >> 8) & 0xff;
  frame[2] = meta.blockCount & 0xff;
  frame[3] = (meta.fileSize >>> 24) & 0xff;
  frame[4] = (meta.fileSize >>> 16) & 0xff;
  frame[5] = (meta.fileSize >>> 8) & 0xff;
  frame[6] = meta.fileSize & 0xff;
  const crc = crc16(frame.subarray(0, FRAME_BYTES - CRC_BYTES));
  frame[FRAME_BYTES - 2] = (crc >> 8) & 0xff;
  frame[FRAME_BYTES - 1] = crc & 0xff;
  return frame;
}

export const MAX_SYMBOL_INDEX = 0xffff;

export function encodeDataFrame(symbolIndex: number, payload: Uint8Array): Uint8Array {
  if (payload.length !== BLOCK_SIZE) {
    throw new Error(`Data frame payload must be exactly ${BLOCK_SIZE} bytes`);
  }
  if (symbolIndex < 0 || symbolIndex > MAX_SYMBOL_INDEX) {
    throw new Error(`symbolIndex must fit in 16 bits (0..${MAX_SYMBOL_INDEX})`);
  }
  const frame = new Uint8Array(FRAME_BYTES);
  frame[0] = TYPE_DATA;
  frame[1] = (symbolIndex >> 8) & 0xff;
  frame[2] = symbolIndex & 0xff;
  frame.set(payload, HEADER_BYTES);
  const crc = crc16(frame.subarray(0, FRAME_BYTES - CRC_BYTES));
  frame[FRAME_BYTES - 2] = (crc >> 8) & 0xff;
  frame[FRAME_BYTES - 1] = crc & 0xff;
  return frame;
}

export function decodeFrame(bytes: Uint8Array): DecodedFrame | null {
  if (bytes.length !== FRAME_BYTES) return null;

  const expectedCrc = crc16(bytes.subarray(0, FRAME_BYTES - CRC_BYTES));
  const actualCrc = (bytes[FRAME_BYTES - 2] << 8) | bytes[FRAME_BYTES - 1];
  if (expectedCrc !== actualCrc) return null;

  if (bytes[0] === TYPE_METADATA) {
    const blockCount = (bytes[1] << 8) | bytes[2];
    const fileSize = (bytes[3] << 24) | (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];
    return { type: "metadata", meta: { blockCount, fileSize: fileSize >>> 0 } };
  }

  if (bytes[0] === TYPE_DATA) {
    const symbolIndex = (bytes[1] << 8) | bytes[2];
    const payload = bytes.slice(HEADER_BYTES, HEADER_BYTES + BLOCK_SIZE);
    return { type: "data", symbolIndex, payload };
  }

  return null;
}

// --- Deterministic PRNG (mulberry32) ---

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REPAIR_MASK_SEED = 0x9e3779b9;

/** Deterministic ~50%-density coefficient mask for a repair symbol. Both
 * sender and receiver compute this independently from (symbolIndex, k)
 * alone — no mask is ever transmitted. */
function repairCoefficients(symbolIndex: number, blockCount: number): Uint32Array {
  const words = Math.ceil(blockCount / 32);
  const coeff = new Uint32Array(words);
  const rand = mulberry32((symbolIndex * 2654435761 + REPAIR_MASK_SEED) >>> 0);
  for (let i = 0; i < blockCount; i++) {
    if (rand() < 0.5) {
      coeff[i >>> 5] |= 1 << (i & 31);
    }
  }
  return coeff;
}

// --- GF(2) bit-vector helpers ---

function xorWords(dst: Uint32Array, src: Uint32Array): void {
  for (let i = 0; i < dst.length; i++) dst[i] ^= src[i];
}

function xorBytes(dst: Uint8Array, src: Uint8Array): void {
  for (let i = 0; i < dst.length; i++) dst[i] ^= src[i];
}

function lowestSetBit(row: Uint32Array): number {
  for (let word = 0; word < row.length; word++) {
    if (row[word] !== 0) {
      const bit = countTrailingZeros(row[word]);
      return word * 32 + bit;
    }
  }
  return -1;
}

function countTrailingZeros(value: number): number {
  if (value === 0) return 32;
  let n = 0;
  let v = value >>> 0;
  while ((v & 1) === 0) {
    v >>>= 1;
    n++;
  }
  return n;
}

function popcount(row: Uint32Array): number {
  let count = 0;
  for (const word of row) {
    let v = word;
    v = v - ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    v = (v + (v >>> 4)) & 0x0f0f0f0f;
    count += (v * 0x01010101) >>> 24;
  }
  return count;
}

function getBit(row: Uint32Array, index: number): boolean {
  return (row[index >>> 5] & (1 << (index & 31))) !== 0;
}

// --- Incremental GF(2) Gauss-Jordan fountain decoder ---

interface PivotRow {
  coeff: Uint32Array;
  payload: Uint8Array;
}

export class FountainDecoder {
  readonly blockCount: number;
  readonly fileSize: number;
  private readonly pivots = new Map<number, PivotRow>();
  private readonly solvedBlocks: (Uint8Array | null)[];
  private recovered = 0;

  constructor(blockCount: number, fileSize: number) {
    this.blockCount = blockCount;
    this.fileSize = fileSize;
    this.solvedBlocks = new Array(blockCount).fill(null);
  }

  get recoveredCount(): number {
    return this.recovered;
  }

  get isComplete(): boolean {
    return this.recovered === this.blockCount;
  }

  /** Returns true if this symbol added new information (was not redundant). */
  addSymbol(symbolIndex: number, payload: Uint8Array): boolean {
    if (this.isComplete) return false;

    let coeff: Uint32Array;
    if (symbolIndex < this.blockCount) {
      coeff = new Uint32Array(Math.ceil(this.blockCount / 32));
      coeff[symbolIndex >>> 5] |= 1 << (symbolIndex & 31);
    } else {
      coeff = repairCoefficients(symbolIndex, this.blockCount);
    }

    const workingPayload = payload.slice();

    // Reduce the incoming row against every existing pivot.
    for (const [column, pivot] of this.pivots) {
      if (getBit(coeff, column)) {
        xorWords(coeff, pivot.coeff);
        xorBytes(workingPayload, pivot.payload);
      }
    }

    const pivotColumn = lowestSetBit(coeff);
    if (pivotColumn === -1) return false; // linearly dependent on what we already have

    const newRow: PivotRow = { coeff, payload: workingPayload };

    // Back-substitute into existing pivots so the whole system stays in
    // full reduced row-echelon form, not just upper-triangular.
    for (const [column, pivot] of this.pivots) {
      if (getBit(pivot.coeff, pivotColumn)) {
        xorWords(pivot.coeff, newRow.coeff);
        xorBytes(pivot.payload, newRow.payload);
        this.checkSolved(column, pivot);
      }
    }

    this.pivots.set(pivotColumn, newRow);
    this.checkSolved(pivotColumn, newRow);

    return true;
  }

  private checkSolved(column: number, row: PivotRow): void {
    if (this.solvedBlocks[column] === null && popcount(row.coeff) === 1) {
      this.solvedBlocks[column] = row.payload;
      this.recovered++;
    }
  }

  reconstruct(): Uint8Array {
    if (!this.isComplete) {
      throw new Error("Cannot reconstruct: not all blocks have been recovered yet");
    }
    const full = new Uint8Array(this.blockCount * BLOCK_SIZE);
    for (let i = 0; i < this.blockCount; i++) {
      full.set(this.solvedBlocks[i]!, i * BLOCK_SIZE);
    }
    return full.slice(0, this.fileSize);
  }
}

// --- Encoder ---

export class FountainEncoder {
  readonly blockCount: number;
  readonly fileSize: number;
  private readonly blocks: Uint8Array[];

  constructor(data: Uint8Array) {
    this.fileSize = data.length;
    this.blockCount = Math.max(1, Math.ceil(data.length / BLOCK_SIZE));
    this.blocks = [];
    for (let i = 0; i < this.blockCount; i++) {
      const block = new Uint8Array(BLOCK_SIZE);
      const chunk = data.subarray(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE);
      block.set(chunk);
      this.blocks.push(block);
    }
  }

  metadataFrame(): Uint8Array {
    return encodeMetadataFrame({ blockCount: this.blockCount, fileSize: this.fileSize });
  }

  /** symbolIndex < blockCount => systematic (verbatim) block.
   *  symbolIndex >= blockCount => repair symbol (XOR of a coefficient subset). */
  dataFrame(symbolIndex: number): Uint8Array {
    if (symbolIndex < this.blockCount) {
      return encodeDataFrame(symbolIndex, this.blocks[symbolIndex]);
    }

    const coeff = repairCoefficients(symbolIndex, this.blockCount);
    const payload = new Uint8Array(BLOCK_SIZE);
    for (let i = 0; i < this.blockCount; i++) {
      if (getBit(coeff, i)) xorBytes(payload, this.blocks[i]);
    }
    return encodeDataFrame(symbolIndex, payload);
  }
}
