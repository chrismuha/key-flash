export default {
  id: 'add',
  name: 'Add',
  inputs: ['Value A', 'Value B'],
  compute(ctx) {
    const a = ctx.numberAt(0);
    const b = ctx.numberAt(1);
    if (a == null || b == null) return null;
    return a + b;
  }
};
