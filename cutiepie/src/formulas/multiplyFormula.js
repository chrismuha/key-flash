export default {
  id: 'multiply',
  name: 'Multiply',
  inputs: ['Value A', 'Value B'],
  compute(ctx) {
    const a = ctx.numberAt(0);
    const b = ctx.numberAt(1);
    if (a == null || b == null) return null;
    return a * b;
  }
};
