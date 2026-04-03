// Counter animation
function animateCount(el, target, duration = 1200) {
  let start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

window.addEventListener('load', () => {
  animateCount(document.getElementById('hero-aqi'),  156);
  animateCount(document.getElementById('hero-pm25'),  72);
});

// ─── District buttons ────────────────────────────────
const grid = document.getElementById('district-grid');
let activeBtn = null;

DISTRICTS.forEach(district => {
  const btn = document.createElement('button');
  btn.className = 'district-btn';
  btn.textContent = district.name;
  btn.addEventListener('click', () => {
    if (activeBtn) activeBtn.classList.remove('active');
    btn.classList.add('active');
    activeBtn = btn;
    showDistrict(district);
  });
  grid.appendChild(btn);
});

function showDistrict(d) {
  document.getElementById('detail-name').textContent = d.name;

  const aqiEl = document.getElementById('detail-aqi');
  aqiEl.textContent = d.aqi;
  aqiEl.style.color = d.color;

  const statusEl = document.getElementById('detail-status');
  statusEl.textContent = d.status;
  statusEl.style.background = hexToRgba(d.color, 0.15);
  statusEl.style.color = d.color;

  document.getElementById('d-pm25').textContent = d.pm25;
  document.getElementById('d-pm10').textContent = d.pm10;
  document.getElementById('d-no2').textContent  = d.no2;
  document.getElementById('d-co').textContent   = d.co;

  const detail = document.getElementById('district-detail');
  detail.classList.add('visible');
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  renderDistrictChart(d);
}

// ─── Improve page button ───────────────────────────────
const improveBtn = document.getElementById('improve-btn');
if (improveBtn) {
  improveBtn.addEventListener('click', () => {
    window.location.href = 'improve.html';
  });
}

// ─── Year tabs ───────────────────────────────────────
const years = Object.keys(CITY_YEARS).map(Number).sort((a, b) => a - b);
let activeYear = years[years.length - 1]; // default to 2026
const tabsEl = document.getElementById('year-tabs');

years.forEach(year => {
  const tab = document.createElement('button');
  tab.className = 'year-tab' + (year === activeYear ? ' active' : '');
  tab.textContent = year;
  tab.addEventListener('click', () => {
    tabsEl.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeYear = year;
    initCityChart(year);
  });
  tabsEl.appendChild(tab);
});

// Init with latest year
initCityChart(activeYear);
