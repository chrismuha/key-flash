export default {
  id: 'running_total',
  name: 'Running Total',
  inputs: ['Value'],
  compute(ctx) {
    let total = 0;
    for (let i = 0; i <= ctx.rowIndex; i += 1) {
      const value = ctx.numberAt(0, i);
      if (value != null) total += value;
    }
    return total;
  }
};
