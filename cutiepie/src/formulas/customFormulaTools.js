const ALLOWED_EXPR = /^[0-9+\-*/().,%\sA-Za-z_]+$/;

function allowedIdentifiers(inputCount) {
  const ids = new Set(['Math', 'rowIndex', 'min', 'max', 'abs', 'round', 'floor', 'ceil', 'pow', 'sqrt', 'log', 'exp', 'sin', 'cos', 'tan']);
  for (let i = 1; i <= Math.max(1, Math.min(8, inputCount)); i += 1) ids.add(`v${i}`);
  return ids;
}

export function validateCustomExpression(expression, inputCount) {
  const expr = String(expression || '').trim();
  if (!expr) return { ok: false, error: 'Expression is required.' };
  if (!ALLOWED_EXPR.test(expr)) return { ok: false, error: 'Expression contains unsupported characters.' };

  const ids = expr.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
  const allowed = allowedIdentifiers(inputCount);
  const unknown = ids.find((id) => !allowed.has(id));
  if (unknown) return { ok: false, error: `Unsupported token: ${unknown}` };

  try {
    // Validate parseability.
    // eslint-disable-next-line no-new-func
    new Function('ctx', `const { Math, rowIndex, min, max, abs, round, floor, ceil, pow, sqrt, log, exp, sin, cos, tan, v1, v2, v3, v4, v5, v6, v7, v8 } = ctx; return (${expr});`);
    return { ok: true, expression: expr };
  } catch (_error) {
    return { ok: false, error: 'Expression syntax is invalid.' };
  }
}

export function evaluateCustomExpression(expression, inputValues, rowIndex = 0) {
  const validation = validateCustomExpression(expression, inputValues.length);
  if (!validation.ok) return { ok: false, error: validation.error };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('ctx', `const { Math, rowIndex, min, max, abs, round, floor, ceil, pow, sqrt, log, exp, sin, cos, tan, v1, v2, v3, v4, v5, v6, v7, v8 } = ctx; return (${validation.expression});`);
    const safe = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const context = {
      Math,
      rowIndex,
      min: Math.min,
      max: Math.max,
      abs: Math.abs,
      round: Math.round,
      floor: Math.floor,
      ceil: Math.ceil,
      pow: Math.pow,
      sqrt: Math.sqrt,
      log: Math.log,
      exp: Math.exp,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      v1: safe(inputValues[0]),
      v2: safe(inputValues[1]),
      v3: safe(inputValues[2]),
      v4: safe(inputValues[3]),
      v5: safe(inputValues[4]),
      v6: safe(inputValues[5]),
      v7: safe(inputValues[6]),
      v8: safe(inputValues[7])
    };
    const result = Number(fn(context));
    if (!Number.isFinite(result)) return { ok: false, error: 'Expression result is not a finite number.' };
    return { ok: true, value: result };
  } catch (_error) {
    return { ok: false, error: 'Expression evaluation failed.' };
  }
}

export function makeCustomFormulaDefinition({ name, expression, inputCount }) {
  const count = Math.max(1, Math.min(8, Math.round(Number(inputCount) || 1)));
  const finalName = String(name || '').trim();
  if (!finalName) return { ok: false, error: 'Formula name is required.' };

  const validation = validateCustomExpression(expression, count);
  if (!validation.ok) return validation;

  return {
    ok: true,
    formula: {
      id: `custom:${crypto.randomUUID()}`,
      name: finalName,
      expression: validation.expression,
      inputLabels: Array.from({ length: count }, (_, i) => `Value ${i + 1}`),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}
