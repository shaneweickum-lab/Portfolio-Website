import { evaluate } from "mathjs";

// Only single-character replacements so string length/positions stay
// predictable for the caller (used for on-screen "what we read" display).
const OCR_MISREADS: Array<[RegExp, string]> = [
  [/×/g, "*"],
  [/÷/g, "/"],
  [/−/g, "-"], // U+2212 minus sign, distinct from ASCII hyphen
  [/\s+/g, ""],
];

// Digits, arithmetic operators, parens, "=", "^", and "x" (the one
// supported variable name). Deliberately excludes every other letter --
// OCR noise that produced something outside this set means "not a clean
// read yet", not "unsupported problem".
const VALID_CHARS = /^[0-9+\-*/=().x^]+$/;

const LINEARITY_EPSILON = 1e-6;

export function normalizeMathText(raw: string): string {
  let text = raw;
  for (const [pattern, replacement] of OCR_MISREADS) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

export type MathSolveResult =
  | { kind: "expression"; expression: string; value: number }
  | {
      kind: "equation-numeric";
      lhs: string;
      rhs: string;
      lhsValue: number;
      rhsValue: number;
      holds: boolean;
    }
  | { kind: "equation-linear"; lhs: string; rhs: string; variable: "x"; solution: number }
  | { kind: "unsupported"; reason: string };

/**
 * Parses and solves a normalized math statement read off a page.
 * Returns null when the text doesn't look like a math statement at all
 * (empty, no digits, or contains characters outside VALID_CHARS) --
 * that's "haven't read anything usable yet", distinct from a `kind:
 * "unsupported"` result, which is a real math statement this solver's
 * scope doesn't cover (quadratics, multiple variables, etc).
 */
export function solveMathText(rawText: string): MathSolveResult | null {
  const normalized = normalizeMathText(rawText);
  if (normalized.length < 2 || !/\d/.test(normalized) || !VALID_CHARS.test(normalized)) {
    return null;
  }

  const equalsCount = (normalized.match(/=/g) ?? []).length;
  if (equalsCount === 0) return evaluateExpression(normalized);
  if (equalsCount > 1) {
    return { kind: "unsupported", reason: "Found more than one \"=\" -- not sure which equation this is." };
  }

  const [lhs, rhs] = normalized.split("=");
  if (!lhs || !rhs) return null;

  return lhs.includes("x") || rhs.includes("x")
    ? solveLinearEquation(lhs, rhs)
    : evaluateNumericEquation(lhs, rhs);
}

function evaluateExpression(expr: string): MathSolveResult | null {
  const value = tryEvaluate(expr);
  return value === null ? null : { kind: "expression", expression: expr, value };
}

function evaluateNumericEquation(lhs: string, rhs: string): MathSolveResult | null {
  const lhsValue = tryEvaluate(lhs);
  const rhsValue = tryEvaluate(rhs);
  if (lhsValue === null || rhsValue === null) return null;
  return {
    kind: "equation-numeric",
    lhs,
    rhs,
    lhsValue,
    rhsValue,
    holds: Math.abs(lhsValue - rhsValue) < 1e-9,
  };
}

// Solves for x without symbolic algebra: g(x) = lhs(x) - rhs(x) is linear
// in x whenever the source problem actually is, so two sample points fix
// its slope and intercept, and a third checks the linearity assumption
// itself rather than silently trusting it.
function solveLinearEquation(lhs: string, rhs: string): MathSolveResult {
  const diffExpr = `(${lhs})-(${rhs})`;
  const g0 = tryEvaluate(diffExpr, { x: 0 });
  const g1 = tryEvaluate(diffExpr, { x: 1 });
  const g2 = tryEvaluate(diffExpr, { x: 2 });
  if (g0 === null || g1 === null || g2 === null) {
    return { kind: "unsupported", reason: "Couldn't evaluate this as an equation in x." };
  }

  const slope = g1 - g0;
  const predictedG2 = 2 * slope + g0;
  if (Math.abs(g2 - predictedG2) > LINEARITY_EPSILON) {
    return { kind: "unsupported", reason: "Doesn't look linear in x (e.g. x^2) -- out of scope here." };
  }
  if (Math.abs(slope) < LINEARITY_EPSILON) {
    return {
      kind: "unsupported",
      reason:
        Math.abs(g0) < LINEARITY_EPSILON
          ? "Every value of x works -- there's no single answer."
          : "No value of x works -- both sides can never be equal.",
    };
  }

  return { kind: "equation-linear", lhs, rhs, variable: "x", solution: -g0 / slope };
}

function tryEvaluate(expr: string, scope?: Record<string, number>): number | null {
  try {
    // mathjs's evaluate() throws if the scope argument is explicitly
    // `undefined` rather than omitted, so the two call shapes can't share
    // one branch here.
    const value = scope ? evaluate(expr, scope) : evaluate(expr);
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}
