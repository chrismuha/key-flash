<template>
  <section class="panel">
    <div class="chart-card">
      <canvas ref="canvasRef" v-show="renderer === 'canvas'"></canvas>
      <div ref="plotRef" class="plot-host" v-show="renderer !== 'canvas'"></div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import Chart from 'chart.js/auto';
import Plotly from 'plotly.js-dist-min';
import * as d3 from 'd3';
import { useDataStore } from '../stores/dataStore';
import { useChartStore } from '../stores/chartStore';

const dataStore = useDataStore();
const chartStore = useChartStore();

const canvasRef = ref(null);
const plotRef = ref(null);
const chartInstance = ref(null);
const renderer = ref('canvas');

const palette = ['#e44f6b', '#1f9cc2', '#f7a541', '#5f7cff', '#5abf90', '#8d63c7', '#ec6f4c'];

function getPoints() {
  return dataStore.rows
    .map((row) => ({
      label: row[chartStore.selectedLabelFieldId],
      value: Number(row[chartStore.selectedValueFieldId]),
      secondary: chartStore.selectedSecondaryValueFieldId ? Number(row[chartStore.selectedSecondaryValueFieldId]) : null,
      series: chartStore.selectedSeriesFieldId ? String(row[chartStore.selectedSeriesFieldId] || '') : ''
    }))
    .filter((p) => p.label && Number.isFinite(p.value));
}

function aggregate(points) {
  const map = new Map();
  points.forEach((p) => map.set(String(p.label), (map.get(String(p.label)) || 0) + p.value));
  return [...map.entries()].map(([label, value]) => ({ label, value }));
}

function clear() {
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }
  if (plotRef.value) {
    Plotly.purge(plotRef.value);
    plotRef.value.innerHTML = '';
  }
}

function render() {
  const points = getPoints();
  if (!points.length) {
    chartStore.message = 'Add at least one valid row before generating a chart.';
    return;
  }
  if (!chartStore.selectedValueFieldId) {
    chartStore.message = 'Please add at least one number field.';
    return;
  }

  clear();

  const type = chartStore.chartType;
  const agg = aggregate(points);

  const chartJsMap = {
    bar: 'bar',
    column: 'bar',
    line: 'line',
    area: 'line',
    step: 'line',
    sparkline: 'line',
    radar: 'radar',
    pie: 'pie',
    donut: 'doughnut',
    funnel: 'bar',
    histogram: 'bar',
    dot: 'scatter',
    scatter: 'scatter',
    bubble: 'bubble',
    pareto: 'bar',
    stacked_bar: 'bar',
    stacked_area: 'line',
    bump: 'line',
    slope: 'line',
    waterfall: 'bar'
  };

  if (chartJsMap[type]) {
    renderer.value = 'canvas';
    let config = {
      type: chartJsMap[type],
      data: {
        labels: agg.map((x) => x.label),
        datasets: [{
          label: 'Dataset',
          data: agg.map((x) => x.value),
          borderColor: '#1f9cc2',
          backgroundColor: agg.map((_, i) => palette[i % palette.length]),
          fill: type === 'area'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type !== 'sparkline', position: 'bottom' } } }
    };

    if (type === 'bar') config.options.indexAxis = 'y';
    if (type === 'step') config.data.datasets[0].stepped = true;
    if (type === 'sparkline') config.options.scales = { x: { display: false }, y: { display: false } };

    if (type === 'scatter' || type === 'dot') {
      config = {
        type: 'scatter',
        data: {
          datasets: [{
            label: type === 'dot' ? 'Dot Plot' : 'Scatter',
            data: points.map((p, i) => ({ x: i + 1, y: p.value })),
            backgroundColor: '#1f9cc2'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      };
    }

    if (type === 'bubble') {
      config = {
        type: 'bubble',
        data: {
          datasets: [{
            label: 'Bubble',
            data: points.map((p, i) => ({ x: i + 1, y: p.value, r: Math.max(5, Math.min(24, Math.abs(Number.isFinite(p.secondary) ? p.secondary : p.value))) })),
            backgroundColor: 'rgba(31,156,194,0.5)',
            borderColor: '#1f9cc2'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      };
    }

    chartInstance.value = new Chart(canvasRef.value, config);
    chartStore.completeRender([...new Set(points.map((p) => String(p.label)))]);
    return;
  }

  renderer.value = type === 'chord' ? 'd3' : 'plotly';

  if (type === 'treemap') {
    Plotly.newPlot(plotRef.value, [{ type: 'treemap', labels: points.map((p) => String(p.label)), parents: points.map(() => ''), values: points.map((p) => p.value) }], { margin: { l: 10, r: 10, t: 20, b: 10 } });
  } else if (type === 'candlestick') {
    const x = points.map((p) => String(p.label));
    const close = points.map((p) => p.value);
    const open = points.map((p, i) => Number.isFinite(p.secondary) ? p.secondary : (i ? close[i - 1] : p.value));
    const high = close.map((c, i) => Math.max(c, open[i]) + 1);
    const low = close.map((c, i) => Math.min(c, open[i]) - 1);
    Plotly.newPlot(plotRef.value, [{ type: 'candlestick', x, open, high, low, close }], { margin: { l: 40, r: 12, t: 20, b: 36 } });
  } else if (type === 'sankey') {
    if (!chartStore.selectedSeriesFieldId) {
      chartStore.message = 'Sankey needs Series / Group field.';
      return;
    }
    const nodes = [...new Set(points.flatMap((p) => [String(p.label), String(p.series || 'Series')]))];
    const nodeIndex = new Map(nodes.map((n, i) => [n, i]));
    Plotly.newPlot(plotRef.value, [{ type: 'sankey', node: { label: nodes }, link: { source: points.map((p) => nodeIndex.get(String(p.label))), target: points.map((p) => nodeIndex.get(String(p.series || 'Series'))), value: points.map((p) => p.value) } }], { margin: { l: 12, r: 12, t: 24, b: 12 } });
  } else if (type === 'boxplot') {
    const grouped = new Map();
    points.forEach((p) => {
      const key = String(p.label);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(p.value);
    });
    const traces = [...grouped.entries()].map(([label, vals]) => ({ type: 'box', name: label, y: vals, boxpoints: 'outliers' }));
    Plotly.newPlot(plotRef.value, traces, { margin: { l: 40, r: 12, t: 20, b: 36 } });
  } else if (type === 'geo_map' || type === 'heatmap_map') {
    const states = aggregate(points).map((p) => ({ code: String(p.label || '').toUpperCase(), value: p.value })).filter((p) => /^[A-Z]{2}$/.test(p.code));
    Plotly.newPlot(plotRef.value, [{ type: 'choropleth', locationmode: 'USA-states', locations: states.map((s) => s.code), z: states.map((s) => s.value), colorscale: type === 'heatmap_map' ? 'YlOrRd' : 'Blues' }], { geo: { scope: 'usa' }, margin: { l: 8, r: 8, t: 20, b: 8 } });
  } else if (type === 'bubble_map') {
    const states = aggregate(points).map((p) => ({ code: String(p.label || '').toUpperCase(), value: p.value })).filter((p) => /^[A-Z]{2}$/.test(p.code));
    Plotly.newPlot(plotRef.value, [{ type: 'scattergeo', locationmode: 'USA-states', locations: states.map((s) => s.code), mode: 'markers', marker: { size: states.map((s) => Math.max(8, Math.min(40, s.value))), color: states.map((s) => s.value), colorscale: 'Viridis' } }], { geo: { scope: 'usa' }, margin: { l: 8, r: 8, t: 20, b: 8 } });
  } else if (type === 'gantt') {
    if (!chartStore.selectedSeriesFieldId) {
      chartStore.message = 'Gantt needs Series / Group as start date field.';
      return;
    }
    const tasks = points.map((p) => {
      const start = new Date(String(p.series));
      if (Number.isNaN(start.getTime())) return null;
      const end = new Date(start.getTime() + Math.max(1, p.value) * 86400000);
      return { task: String(p.label), start, end };
    }).filter(Boolean);
    Plotly.newPlot(plotRef.value, [{ type: 'bar', orientation: 'h', y: tasks.map((t) => t.task), x: tasks.map((t) => (t.end - t.start) / 86400000), base: tasks.map((t) => t.start.toISOString()) }], { barmode: 'stack', xaxis: { type: 'date' }, margin: { l: 120, r: 12, t: 20, b: 36 } });
  } else if (type === 'pictograph') {
    plotRef.value.innerHTML = '';
    const rows = aggregate(points).slice(0, 8);
    rows.forEach((row) => {
      const line = document.createElement('div');
      line.className = 'pictograph-row';
      const iconCount = Math.max(1, Math.round(row.value / (Math.max(...rows.map((r) => r.value)) || 1) * 20));
      line.innerHTML = `<strong>${row.label}</strong><span style="color:#1f9cc2;letter-spacing:1px">${'■'.repeat(iconCount)}</span><em>${row.value}</em>`;
      plotRef.value.appendChild(line);
    });
  } else if (type === 'heatmap') {
    if (!chartStore.selectedSeriesFieldId) {
      chartStore.message = 'Heatmap needs Series / Group field.';
      return;
    }
    const x = [...new Set(points.map((p) => String(p.label)))];
    const y = [...new Set(points.map((p) => String(p.series || 'Series')) )];
    const z = y.map((series) => x.map((label) => points.filter((p) => String(p.label) === label && String(p.series || 'Series') === series).reduce((sum, p) => sum + p.value, 0)));
    Plotly.newPlot(plotRef.value, [{ type: 'heatmap', x, y, z, colorscale: 'YlGnBu' }], { margin: { l: 80, r: 12, t: 20, b: 36 } });
  } else if (type === 'chord') {
    if (!chartStore.selectedSeriesFieldId) {
      chartStore.message = 'Chord needs Series / Group field.';
      return;
    }
    plotRef.value.innerHTML = '';
    const nodes = [...new Set(points.flatMap((p) => [String(p.label), String(p.series || 'Series')]))];
    const idx = new Map(nodes.map((n, i) => [n, i]));
    const matrix = Array.from({ length: nodes.length }, () => Array.from({ length: nodes.length }, () => 0));
    points.forEach((p) => {
      matrix[idx.get(String(p.label))][idx.get(String(p.series || 'Series'))] += p.value;
    });

    const width = Math.max(700, plotRef.value.clientWidth || 700);
    const height = 420;
    const outerRadius = Math.min(width, height) * 0.45;
    const innerRadius = outerRadius - 20;
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.create('svg').attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`);
    const chord = d3.chordDirected().padAngle(0.04)(matrix);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3.ribbonArrow().radius(innerRadius - 1);

    svg.append('g').selectAll('path').data(chord.groups).join('path').attr('fill', (d) => color(d.index)).attr('stroke', '#fff').attr('d', arc);
    svg.append('g').attr('fill-opacity', 0.78).selectAll('path').data(chord).join('path').attr('d', ribbon).attr('fill', (d) => color(d.target.index));
    plotRef.value.appendChild(svg.node());
  }

  chartStore.completeRender([...new Set(points.map((p) => String(p.label)))]);
}

defineExpose({ render });

onBeforeUnmount(() => clear());
</script>
