

let districtChart = null;


function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const AXIS_STYLE = {
  ticks: { color: 'rgba(160,210,255,0.5)', font: { size: 11 } },
  grid:  { color: 'rgba(255,255,255,0.04)' }
};

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(2,11,26,0.95)',
  titleColor: '#e0f0ff',
  bodyColor:  '#a0d2ff',
  borderColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1
};

function renderDistrictChart(district) {
  if (districtChart) {
    districtChart.destroy();
    districtChart = null;
  }

  const canvas = document.getElementById('district-chart');
  if (!canvas) return;

  districtChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: HOURS,
      datasets: [{
        label: 'AQI',
        data: district.data,
        borderColor: district.color,
        backgroundColor: hexToRgba(district.color, 0.1),
        borderWidth: 2.5,
        pointBackgroundColor: district.color,
        pointRadius: 3,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend:  { display: false },
        tooltip: TOOLTIP_STYLE
      },
      scales: {
        x: { ...AXIS_STYLE, ticks: { color: 'rgba(160,210,255,0.45)', font: { size: 10 } } },
        y: { ...AXIS_STYLE, ticks: { color: 'rgba(160,210,255,0.45)', font: { size: 10 } }, beginAtZero: false }
      }
    }
  });
}


function initCityChart() {
  const canvas = document.getElementById('city-chart');
  if (!canvas) return;

  new Chart(canvas.getContext('2d'), {
    data: {
      labels: CITY_DATA.months,
      datasets: [
        {
          type: 'bar',
          label: 'PM2.5',
          data: CITY_DATA.pm25,
          backgroundColor: 'rgba(244,63,94,0.6)',
          borderColor:     'rgba(244,63,94,0.9)',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          type: 'bar',
          label: 'PM10',
          data: CITY_DATA.pm10,
          backgroundColor: 'rgba(251,146,60,0.5)',
          borderColor:     'rgba(251,146,60,0.8)',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          type: 'line',
          label: 'AQI',
          data: CITY_DATA.aqi,
          borderColor:     'rgba(56,189,248,0.9)',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointBackgroundColor: 'rgba(56,189,248,1)',
          pointRadius: 4,
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend:  { display: false },
        tooltip: TOOLTIP_STYLE
      },
      scales: {
        x: AXIS_STYLE,
        y: AXIS_STYLE
      }
    }
  });


  const legendEl = document.getElementById('city-legend');
  if (legendEl) {
    const items = [
      { color: 'rgba(244,63,94,0.8)',  label: 'PM2.5' },
      { color: 'rgba(251,146,60,0.8)', label: 'PM10' },
      { color: 'rgba(56,189,248,0.8)', label: 'AQI (линия)' }
    ];
    legendEl.innerHTML = items.map(item => `
      <span class="legend-item">
        <span class="legend-dot" style="background:${item.color};"></span>
        ${item.label}
      </span>
    `).join('');
  }
}