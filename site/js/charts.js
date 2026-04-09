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

// ─── District daily consumption chart ───────────────────────────
function renderDistrictChart(district) {
  if (districtChart) { districtChart.destroy(); districtChart = null; }
  const canvas = document.getElementById('district-chart');
  if (!canvas) return;
  districtChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'Потребление л/сут',
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
      animation: { duration: 400, x: { from: 0 }, y: { from: 100 } },
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
          label: 'Потребление (м³/сут)',
          data: data.consumption,
          backgroundColor: 'rgba(56,189,248,0.45)',
          borderColor: 'rgba(56,189,248,0.9)',
          borderWidth: 1,
          borderRadius: 5
        },
        {
          type: 'bar',
          label: 'ИИ-охлаждение (м³/сут)',
          data: data.ai_cooling,
          backgroundColor: 'rgba(129,140,248,0.5)',
          borderColor: 'rgba(129,140,248,0.9)',
          borderWidth: 1,
          borderRadius: 5
        },
        {
          type: 'line',
          label: 'WQI',
          data: data.wqi,
          borderColor: 'rgba(74,240,160,0.9)',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointBackgroundColor: 'rgba(74,240,160,1)',
          pointRadius: 4,
          fill: false,
          tension: 0.4,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      animation: { duration: 400, x: { from: 0 }, y: { from: 100 } },
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: TOOLTIP_STYLE },
      scales: { x: AXIS_STYLE, y: AXIS_STYLE }
    }
  });

  const legendEl = document.getElementById('city-legend');
  if (legendEl) {
    legendEl.innerHTML = [
      { color: 'rgba(56,189,248,0.8)',  label: 'Потребление' },
      { color: 'rgba(129,140,248,0.8)', label: 'ИИ-охлаждение' },
      { color: 'rgba(74,240,160,0.8)',  label: 'WQI' }
    ].map(i => `<span class="legend-item"><span class="legend-dot" style="background:${i.color};"></span>${i.label}</span>`).join('');
  }

  renderYearlyStats(year, data);
}

// ─── Stats & insights below the chart ───────────────
function renderYearlyStats(year, data) {
  const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const max = arr => Math.max(...arr);
  const min = arr => Math.min(...arr);
  const worstMonth = MONTHS[data.wqi.indexOf(min(data.wqi))];
  const bestMonth  = MONTHS[data.wqi.indexOf(max(data.wqi))];

  const prevYear = year - 1;
  const prevData = CITY_YEARS[prevYear];
  let trendHtml = '';
  if (prevData) {
    const diff = avg(data.consumption) - avg(prevData.consumption);
    const sign = diff > 0 ? '+' : '';
    const col  = diff > 0 ? '#f43f5e' : '#4af0a0';
    const arrow = diff > 0 ? '↑' : '↓';
    trendHtml = `<span style="color:${col};font-weight:600;">${arrow} ${sign}${diff} vs ${prevYear}</span>`;
  }

  const statsEl = document.getElementById('yearly-stats');
  statsEl.innerHTML = `
    <div class="ystat-box">
      <div class="ystat-label">Ср. потребление</div>
      <div class="ystat-val" style="color:#38bdf8;">${avg(data.consumption)}</div>
      <div class="ystat-sub">${trendHtml}</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Худший WQI</div>
      <div class="ystat-val" style="color:#f43f5e;">${worstMonth}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">WQI ${min(data.wqi)}</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Лучший WQI</div>
      <div class="ystat-val" style="color:#4af0a0;">${bestMonth}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">WQI ${max(data.wqi)}</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Ср. нитраты</div>
      <div class="ystat-val" style="color:#f43f5e;">${avg(data.nitrates)}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">мг/л</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">Ср. мутность</div>
      <div class="ystat-val" style="color:#fb923c;">${(data.turbidity.reduce((a,b)=>a+b,0)/data.turbidity.length).toFixed(1)}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">NTU</div>
    </div>
    <div class="ystat-box">
      <div class="ystat-label">ИИ-охлаждение</div>
      <div class="ystat-val" style="color:#818cf8;">${avg(data.ai_cooling)}</div>
      <div class="ystat-sub" style="color:rgba(160,210,255,0.45);">м³/сут</div>
    </div>
  `;

  const summerAvg = Math.round((data.consumption[5]+data.consumption[6]+data.consumption[7]) / 3);
  const winterAvg = Math.round((data.consumption[0]+data.consumption[1]+data.consumption[11]+data.consumption[10]) / 4);
  const pct = Math.round(((summerAvg - winterAvg) / winterAvg) * 100);

  const firstYear = Math.min(...Object.keys(CITY_YEARS).map(Number));
  const firstAvg  = Math.round(CITY_YEARS[firstYear].consumption.reduce((a,b)=>a+b,0)/12);
  const curAvg    = avg(data.consumption);
  const totalPct  = Math.round(((curAvg - firstAvg) / firstAvg) * 100);
  const trendLabel = year === firstYear
    ? 'Базовый год отсчёта'
    : `+${totalPct}% с ${firstYear} года`;

  const aiShare = Math.round((avg(data.ai_cooling) / avg(data.consumption)) * 100);

  document.getElementById('insight-row').innerHTML = `
    <div class="insight-card">
      <span class="insight-icon">☀️</span>
      <div>
        <div class="insight-title">Лето vs Зима</div>
        <div class="insight-text">Летом потребление воды на <strong style="color:#f43f5e;">${pct}% выше</strong> — полив, испарение, охлаждение зданий и серверов</div>
      </div>
    </div>
    <div class="insight-card">
      <span class="insight-icon">📈</span>
      <div>
        <div class="insight-title">Многолетний тренд</div>
        <div class="insight-text">Среднее потребление растёт с ${firstYear}: <strong style="color:#f43f5e;">${trendLabel}</strong>. Без мер дефицит воды неизбежен</div>
      </div>
    </div>
    <div class="insight-card">
      <span class="insight-icon">🖥️</span>
      <div>
        <div class="insight-title">Доля ИИ-серверов</div>
        <div class="insight-text">ЦОД потребляют уже <strong style="color:#818cf8;">${aiShare}% от городского водопотребления</strong> — и этот показатель растёт каждый год</div>
      </div>
    </div>
  `;
}
