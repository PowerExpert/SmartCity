let districtChart = null;
let cityChart = null;

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

// ─── District hourly chart ───────────────────────────
function renderDistrictChart(district) {
  if (districtChart) { districtChart.destroy(); districtChart = null; }
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
      plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
      scales: {
        x: { ...AXIS_STYLE, ticks: { color: 'rgba(160,210,255,0.45)', font: { size: 10 } } },
        y: { ...AXIS_STYLE, ticks: { color: 'rgba(160,210,255,0.45)', font: { size: 10 } }, beginAtZero: false }
      }
    }
  });
}

// ─── City yearly chart ───────────────────────────────
function initCityChart(year) {
  const data = CITY_YEARS[year];

  if (cityChart) { cityChart.destroy(); cityChart = null; }

  const canvas = document.getElementById('city-chart');
  if (!canvas) return;

  cityChart = new Chart(canvas.getContext('2d'), {
    data: {
      labels: MONTHS,
      datasets: [
        {
          type: 'bar',
          label: 'PM2.5',
          data: data.pm25,
          backgroundColor: 'rgba(244,63,94,0.55)',
          borderColor: 'rgba(244,63,94,0.9)',
          borderWidth: 1,
          borderRadius: 5
        },
        {
          type: 'bar',
          label: 'PM10',
          data: data.pm10,
          backgroundColor: 'rgba(251,146,60,0.45)',
          borderColor: 'rgba(251,146,60,0.8)',
          borderWidth: 1,
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'AQI',
          data: data.aqi,
          borderColor: 'rgba(56,189,248,0.9)',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointBackgroundColor: 'rgba(56,189,248,1)',
          pointRadius: 4,
          fill: false,
          tension: 0.4,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
      scales: { x: AXIS_STYLE, y: AXIS_STYLE }
    }
  });

  // Legend
  const legendEl = document.getElementById('city-legend');
  if (legendEl) {
    legendEl.innerHTML = [
      { color: 'rgba(244,63,94,0.8)',  label: 'PM2.5' },
      { color: 'rgba(251,146,60,0.8)', label: 'PM10' },
      { color: 'rgba(56,189,248,0.8)', label: 'AQI' }
    ].map(i => `<span class="legend-item"><span class="legend-dot" style="background:${i.color};"></span>${i.label}</span>`).join('');
  }

  // Stats below chart
  renderYearlyStats(year, data);
}

// ─── Stats & insights below the chart ───────────────
function renderYearlyStats(year, data) {
  const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const max = arr => Math.max(...arr);
  const min = arr => Math.min(...arr);
  const worstMonth = MONTHS[data.aqi.indexOf(max(data.aqi))];
  const bestMonth  = MONTHS[data.aqi.indexOf(min(data.aqi))];

  // Compare with previous year if available
  const prevYear = year - 1;
  const prevData = CITY_YEARS[prevYear];
  let trendHtml = '';
  if (prevData) {
    const diff = avg(data.aqi) - avg(prevData.aqi);
    const sign = diff > 0 ? '+' : '';
    const col  = diff > 0 ? '#f43f5e' : '#4af0a0';
    const arrow = diff > 0 ? '↑' : '↓';
    trendHtml = `<span style="color:${col};font-weight:600;">${arrow} ${sign}${diff} vs ${prevYear}</span>`;
  }

  const statsEl = document.getElementById('yearly-stats');
  statsEl.innerHTML = `
    <div class="ystat-box">
      <div class="ystat-label">Средний AQI</div>
      <div class="ystat-val" style="color:#38bdf8;">${avg(data.aqi)}</div>
      <div class="ystat-sub">${trendHtml}</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Худший месяц</div>
      <div class="ystat-val" style="color:#f43f5e;">${worstMonth}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">AQI ${max(data.aqi)}</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Лучший месяц</div>
      <div class="ystat-val" style="color:#4af0a0;">${bestMonth}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">AQI ${min(data.aqi)}</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Среднее PM2.5</div>
      <div class="ystat-val" style="color:#f43f5e;">${avg(data.pm25)}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">мкг/м³</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Среднее PM10</div>
      <div class="ystat-val" style="color:#fb923c;">${avg(data.pm10)}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">мкг/м³</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Среднее NO₂</div>
      <div class="ystat-val" style="color:#facc15;">${avg(data.no2)}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">ppb</div>
    </div>
  `;

  // Winter vs summer insight
  const winterAvg = Math.round((data.aqi[0]+data.aqi[1]+data.aqi[11]+data.aqi[10]) / 4);
  const summerAvg = Math.round((data.aqi[5]+data.aqi[6]+data.aqi[7]) / 3);
  const pct = Math.round(((winterAvg - summerAvg) / summerAvg) * 100);

  // Year-over-year long trend
  const firstYear = Math.min(...Object.keys(CITY_YEARS).map(Number));
  const firstAvg  = Math.round(CITY_YEARS[firstYear].aqi.reduce((a,b)=>a+b,0)/12);
  const curAvg    = avg(data.aqi);
  const totalPct  = Math.round(((curAvg - firstAvg) / firstAvg) * 100);
  const trendLabel = year === firstYear
    ? 'Базовый год отсчёта'
    : `+${totalPct}% с ${firstYear} года`;

  const aqiLevel = max(data.aqi) >= 200 ? '«Опасный»' : '«Очень вредный»';

  document.getElementById('insight-row').innerHTML = `
    <div class="insight-card">
      <span class="insight-icon">❄️</span>
      <div>
        <div class="insight-title">Зима vs Лето</div>
        <div class="insight-text">Зимой воздух в среднем на <strong style="color:#f43f5e;">${pct}% хуже</strong> — из-за угольного отопления и инверсии температур</div>
      </div>
    </div>
    <div class="insight-card">
      <span class="insight-icon">📈</span>
      <div>
        <div class="insight-title">Многолетний тренд</div>
        <div class="insight-text">Среднегодовой AQI растёт с ${firstYear}: <strong style="color:#f43f5e;">${trendLabel}</strong>. Без мер ситуация продолжит ухудшаться</div>
      </div>
    </div>
    <div class="insight-card">
      <span class="insight-icon">⚠️</span>
      <div>
        <div class="insight-title">Пик загрязнения</div>
        <div class="insight-text">Декабрь — самый опасный месяц. AQI <strong style="color:#f43f5e;">${max(data.aqi)}</strong> — уровень ${aqiLevel}. Опасно для всех групп населения</div>
      </div>
    </div>
  `;
}
