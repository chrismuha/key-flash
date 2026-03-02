export default {
  id: 'divide',
  name: 'Divide',
  inputs: ['Numerator', 'Denominator'],
  compute(ctx) {
    const a = ctx.numberAt(0);
    const b = ctx.numberAt(1);
    if (a == null || b == null || b === 0) return null;
    return a / b;
  }
};
