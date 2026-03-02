export const chartGroups = [
  {
    label: 'Comparison Charts',
    options: [
      ['bar', 'Bar Chart'],
      ['column', 'Column Chart'],
      ['pareto', 'Pareto Chart'],
      ['radar', 'Radar Chart'],
      ['stacked_bar', 'Stacked Bar Chart'],
      ['treemap', 'Treemap']
    ].sort((a, b) => a[1].localeCompare(b[1]))
  },
  {
    label: 'Trend & Time-Series Charts',
    options: [
      ['area', 'Area Chart'],
      ['candlestick', 'Candlestick Chart'],
      ['line', 'Line Chart (Growth Chart)'],
      ['sparkline', 'Sparkline'],
      ['step', 'Step Chart']
    ].sort((a, b) => a[1].localeCompare(b[1]))
  },
  {
    label: 'Part-to-Whole Charts',
    options: [
      ['donut', 'Donut Chart'],
      ['funnel', 'Funnel Chart'],
      ['pie', 'Pie Chart'],
      ['waterfall', 'Waterfall Chart'],
      ['stacked_area', 'Stacked Area Chart']
    ].sort((a, b) => a[1].localeCompare(b[1]))
  },
  {
    label: 'Relationship & Correlation Charts',
    options: [
      ['bubble', 'Bubble Chart'],
      ['scatter', 'Scatter Plot'],
      ['sankey', 'Sankey Diagram']
    ].sort((a, b) => a[1].localeCompare(b[1]))
  },
  {
    label: 'Distribution Charts',
    options: [
      ['boxplot', 'Box Plot'],
      ['dot', 'Dot Plot'],
      ['histogram', 'Histogram']
    ].sort((a, b) => a[1].localeCompare(b[1]))
  },
  {
    label: 'Geographic Charts',
    options: [
      ['bubble_map', 'Bubble Map'],
      ['geo_map', 'Geo Map'],
      ['heatmap_map', 'Heatmap Map']
    ].sort((a, b) => a[1].localeCompare(b[1]))
  },
  {
    label: 'Operational & Project Charts',
    options: [
      ['gantt', 'Gantt Chart'],
      ['heatmap', 'Heatmap'],
      ['pictograph', 'Pictograph'],
    ].sort((a, b) => a[1].localeCompare(b[1]))
  },
  {
    label: 'Less Common but Powerful Business Charts',
    options: [
      ['bump', 'Bump Chart'],
      ['chord', 'Chord Diagram'],
      ['slope', 'Slope Chart']
    ].sort((a, b) => a[1].localeCompare(b[1]))
  }
];

export const chartTypes = new Set(chartGroups.flatMap((group) => group.options.map((option) => option[0])));
