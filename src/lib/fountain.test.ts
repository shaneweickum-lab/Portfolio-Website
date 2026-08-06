import { BLOCK_SIZE, FountainDecoder, FountainEncoder, decodeFrame } from "./fountain";

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  const status = condition ? "PASS" : "FAIL";
  console.log(`[${status}] ${label}${!condition && detail ? ` -- ${detail}` : ""}`);
  if (!condition) failures++;
}

function randomBytes(length: number, seed = 1): Uint8Array {
  const out = new Uint8Array(length);
  let state = seed;
  for (let i = 0; i < length; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    out[i] = state & 0xff;
  }
  return out;
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// --- Clean channel, systematic-only ---
{
  const data = randomBytes(500, 7);
  const encoder = new FountainEncoder(data);
  const decoder = new FountainDecoder(encoder.blockCount, encoder.fileSize);

  for (let i = 0; i < encoder.blockCount; i++) {
    const decoded = decodeFrame(encoder.dataFrame(i));
    check(`clean-channel frame ${i} decodes`, decoded?.type === "data");
    if (decoded?.type === "data") decoder.addSymbol(decoded.symbolIndex, decoded.payload);
  }

  check("clean-channel decoder completes with exactly k systematic symbols", decoder.isComplete);
  check(
    "clean-channel reconstruction matches original bytes",
    decoder.isComplete && bytesEqual(decoder.reconstruct(), data),
  );
}

// --- Lossy + corrupted channel, needs repair symbols ---
{
  const data = randomBytes(2000, 42);
  const encoder = new FountainEncoder(data);
  const decoder = new FountainDecoder(encoder.blockCount, encoder.fileSize);

  let symbolIndex = 0;
  let accepted = 0;
  let corruptedAndRejected = 0;
  const maxSymbols = encoder.blockCount * 4; // generous ceiling so the test can't loop forever

  while (!decoder.isComplete && symbolIndex < maxSymbols) {
    const frame = encoder.dataFrame(symbolIndex);
    const thisIndex = symbolIndex;
    symbolIndex++;

    // Drop ~30% of frames outright (never reaches decodeFrame at all).
    if (thisIndex % 10 < 3) continue;

    // Corrupt ~10% of the frames that do arrive; CRC should catch all of these.
    if (thisIndex % 10 === 5) {
      frame[5] ^= 0xff; // flip a payload byte, well inside the CRC-covered region
      if (decodeFrame(frame) === null) corruptedAndRejected++;
      continue;
    }

    const decoded = decodeFrame(frame);
    if (decoded?.type === "data" && decoder.addSymbol(decoded.symbolIndex, decoded.payload)) {
      accepted++;
    }
  }

  check("lossy channel eventually completes", decoder.isComplete, `stopped at ${symbolIndex} symbols`);
  check(
    "lossy channel reconstruction matches original bytes",
    decoder.isComplete && bytesEqual(decoder.reconstruct(), data),
  );
  check("corrupted frames were rejected by CRC, not fed to the decoder", corruptedAndRejected > 0);
  console.log(
    `      (info) blockCount=${encoder.blockCount}, accepted symbols=${accepted}, total symbols emitted=${symbolIndex}`,
  );
}

// --- A single flipped payload bit is caught by the CRC ---
{
  const data = randomBytes(BLOCK_SIZE, 99);
  const encoder = new FountainEncoder(data);
  const frame = encoder.dataFrame(0);
  frame[3] ^= 0x01;
  check("single flipped payload bit is caught by CRC16", decodeFrame(frame) === null);
}

if (failures > 0) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll fountain.ts checks passed.");
