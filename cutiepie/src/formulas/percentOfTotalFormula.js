export default {
  id: 'percent_of_total',
  name: 'Percent Of Total',
  inputs: ['Value'],
  compute(ctx) {
    let total = 0;
    for (let i = 0; i < ctx.rows.length; i += 1) {
      const value = ctx.numberAt(0, i);
      if (value != null) total += value;
    }

    const current = ctx.numberAt(0, ctx.rowIndex);
    if (current == null || total === 0) return null;
    return (current / total) * 100;
  }
};
