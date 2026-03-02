export const chartGroups = [
  {
    label: 'Comparison Charts',
    options: [
      ['bar', 'Bar Chart'],
      ['column', 'Column Chart'],
      ['stacked_bar', 'Stacked Bar Chart'],
      ['treemap', 'Treemap'],
      ['pareto', 'Pareto Chart'],
      ['radar', 'Radar Chart']
    ]
  },
  {
    label: 'Trend & Time-Series Charts',
    options: [
      ['line', 'Line Chart'],
      ['area', 'Area Chart'],
      ['step', 'Step Chart'],
      ['candlestick', 'Candlestick Chart'],
      ['sparkline', 'Sparkline']
    ]
  },
  {
    label: 'Part-to-Whole Charts',
    options: [
      ['pie', 'Pie Chart'],
      ['donut', 'Donut Chart'],
      ['funnel', 'Funnel Chart'],
      ['waterfall', 'Waterfall Chart'],
      ['stacked_area', 'Stacked Area Chart']
    ]
  },
  {
    label: 'Relationship & Correlation Charts',
    options: [
      ['scatter', 'Scatter Plot'],
      ['bubble', 'Bubble Chart'],
      ['sankey', 'Sankey Diagram']
    ]
  },
  {
    label: 'Distribution Charts',
    options: [
      ['histogram', 'Histogram'],
      ['boxplot', 'Box Plot'],
      ['dot', 'Dot Plot']
    ]
  },
  {
    label: 'Geographic Charts',
    options: [
      ['geo_map', 'Geo Map'],
      ['bubble_map', 'Bubble Map'],
      ['heatmap_map', 'Heatmap Map']
    ]
  },
  {
    label: 'Operational & Project Charts',
    options: [
      ['gantt', 'Gantt Chart'],
      ['pictograph', 'Pictograph'],
      ['heatmap', 'Heatmap']
    ]
  },
  {
    label: 'Less Common but Powerful Business Charts',
    options: [
      ['bump', 'Bump Chart'],
      ['slope', 'Slope Chart'],
      ['chord', 'Chord Diagram']
    ]
  }
];

export const chartTypes = new Set(chartGroups.flatMap((group) => group.options.map((option) => option[0])));
