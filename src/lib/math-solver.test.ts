import { normalizeMathText, solveMathText } from "./math-solver";

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
  const status = condition ? "PASS" : "FAIL";
  console.log(`[${status}] ${label}${!condition && detail ? ` -- ${detail}` : ""}`);
  if (!condition) failures++;
}

// --- normalization ---
check("normalizes × to *", normalizeMathText("2×3") === "2*3");
check("normalizes ÷ to /", normalizeMathText("6÷2") === "6/2");
check("normalizes unicode minus to hyphen", normalizeMathText("5−2") === "5-2");
check("strips whitespace", normalizeMathText("2 + 3 = 5") === "2+3=5");

// --- not-yet-readable input ---
check("empty string returns null", solveMathText("") === null);
check("no digits returns null", solveMathText("x+x") === null);
check("OCR garbage (letters) returns null", solveMathText("2y+3") === null);
check("single stray character returns null", solveMathText("=") === null);

// --- plain arithmetic expressions ---
{
  const result = solveMathText("2+3*4");
  check("2+3*4 is an expression", result?.kind === "expression");
  check("2+3*4 evaluates to 14", result?.kind === "expression" && result.value === 14);
}
{
  const result = solveMathText("2×3+1");
  check("OCR'd × is treated as multiplication", result?.kind === "expression" && result.value === 7);
}
{
  const result = solveMathText("2^3");
  check("supports exponents", result?.kind === "expression" && result.value === 8);
}

// --- numeric equations (no variable) ---
{
  const result = solveMathText("2+2=4");
  check("true numeric equation is an equation-numeric result", result?.kind === "equation-numeric");
  check("2+2=4 holds", result?.kind === "equation-numeric" && result.holds === true);
}
{
  const result = solveMathText("2+2=5");
  check("false numeric equation does not hold", result?.kind === "equation-numeric" && result.holds === false);
}

// --- linear equations in x ---
{
  const result = solveMathText("2x+3=11");
  check("2x+3=11 is solved", result?.kind === "equation-linear");
  check(
    "2x+3=11 solves to x=4",
    result?.kind === "equation-linear" && Math.abs(result.solution - 4) < 1e-9,
  );
}
{
  const result = solveMathText("5x-10=0");
  check(
    "5x-10=0 solves to x=2",
    result?.kind === "equation-linear" && Math.abs(result.solution - 2) < 1e-9,
  );
}
{
  const result = solveMathText("3x+1=x+9");
  check(
    "variables on both sides: 3x+1=x+9 solves to x=4",
    result?.kind === "equation-linear" && Math.abs(result.solution - 4) < 1e-9,
  );
}
{
  const result = solveMathText("2(x+3)=16");
  check(
    "implicit multiplication with parens: 2(x+3)=16 solves to x=5",
    result?.kind === "equation-linear" && Math.abs(result.solution - 5) < 1e-9,
  );
}

// --- identities and contradictions ---
{
  const result = solveMathText("x+1=x+1");
  check(
    "identity (infinite solutions) is reported as unsupported, not a false answer",
    result?.kind === "unsupported",
  );
}
{
  const result = solveMathText("x+1=x+2");
  check("contradiction (no solution) is reported as unsupported", result?.kind === "unsupported");
}

// --- out of scope, honestly declined rather than silently wrong ---
{
  const result = solveMathText("x^2=4");
  check("quadratic is declined as unsupported rather than guessed", result?.kind === "unsupported");
}
{
  const result = solveMathText("2x+3=11=5");
  check("multiple '=' signs is declined as unsupported", result?.kind === "unsupported");
}

if (failures > 0) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll math-solver.ts checks passed.");
