export default {
  id: 'min',
  name: 'Minimum',
  inputs: ['Value A', 'Value B'],
  compute(ctx) {
    const a = ctx.numberAt(0);
    const b = ctx.numberAt(1);
    if (a == null || b == null) return null;
    return Math.min(a, b);
  }
};
