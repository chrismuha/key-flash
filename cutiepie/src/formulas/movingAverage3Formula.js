export default {
  id: 'moving_average_3',
  name: 'Moving Average (3)',
  inputs: ['Value'],
  compute(ctx) {
    const start = Math.max(0, ctx.rowIndex - 2);
    let count = 0;
    let sum = 0;

    for (let i = start; i <= ctx.rowIndex; i += 1) {
      const value = ctx.numberAt(0, i);
      if (value == null) continue;
      sum += value;
      count += 1;
    }

    if (!count) return null;
    return sum / count;
  }
};
