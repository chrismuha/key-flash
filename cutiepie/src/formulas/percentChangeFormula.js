export default {
  id: 'percent_change',
  name: 'Percent Change',
  inputs: ['Value'],
  compute(ctx) {
    if (ctx.rowIndex === 0) return null;
    const prev = ctx.numberAt(0, ctx.rowIndex - 1);
    const current = ctx.numberAt(0, ctx.rowIndex);
    if (prev == null || current == null || prev === 0) return null;
    return ((current - prev) / prev) * 100;
  }
};
