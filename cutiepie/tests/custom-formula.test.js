import { describe, expect, it } from 'vitest';
import { evaluateCustomExpression, validateCustomExpression } from '../src/formulas/customFormulaTools';

describe('customFormulaTools', () => {
  it('validates and evaluates simple expressions', () => {
    const validation = validateCustomExpression('(v1 - v2) / v3', 3);
    expect(validation.ok).toBe(true);

    const result = evaluateCustomExpression('(v1 - v2) / v3', [100, 40, 5], 0);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(12);
  });

  it('rejects unsupported tokens', () => {
    const validation = validateCustomExpression('process.exit(1)', 1);
    expect(validation.ok).toBe(false);
  });
});
