export default {
  id: 'difference_from_average',
  name: 'Difference From Average',
  inputs: ['Value'],
  compute(ctx) {
    let total = 0;
    let count = 0;
    for (let i = 0; i < ctx.rows.length; i += 1) {
      const value = ctx.numberAt(0, i);
      if (value == null) continue;
      total += value;
      count += 1;
    }

    const current = ctx.numberAt(0);
    if (current == null || !count) return null;
    return current - (total / count);
  }
};
