const TOKEN = "YOUR_AQICN_TOKEN";

const map = L.map('map').setView([43.238949, 76.889709], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let markers = [];
let chart;

function getColor(aqi) {
    if (aqi <= 50) return "green";
    if (aqi <= 100) return "yellow";
    if (aqi <= 150) return "orange";
    if (aqi <= 200) return "red";
    return "purple";
}

function assignDistrict(lat, lon) {
    if (lat > 43.25) return "medeu";
    if (lon > 76.92) return "almaly";
    if (lon < 76.87) return "auyezov";
    return "bostandyk";
}

async function loadData() {
    document.getElementById("loader").style.display = "block";

    const url = `https://api.waqi.info/mapq/bounds/?latlng=43.1,76.7,43.4,77.1&token=${TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "ok") return;

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const table = document.getElementById("stationsTable");
    table.innerHTML = "";

    let labels = [];
    let values = [];

    data.data.forEach(station => {
        const lat = station.lat;
        const lon = station.lon;
        const aqi = station.aqi;

        const district = assignDistrict(lat, lon);

        const marker = L.circleMarker([lat, lon], {
            radius: 7,
            color: getColor(aqi),
            fillColor: getColor(aqi),
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`Район: ${district}<br>AQI: ${aqi}`);
        marker.district = district;

        markers.push(marker);

        labels.push(district);
        values.push(aqi);

        const row = document.createElement("tr");
        row.dataset.district = district;
        row.innerHTML = `<td>${district}</td><td>${aqi}</td>`;
        table.appendChild(row);
    });

    renderChart(labels, values);

    document.getElementById("loader").style.display = "none";
}

function filterDistrict() {
    const value = document.getElementById("districtFilter").value;

    markers.forEach(m => {
        if (value === "all" || m.district === value) {
            map.addLayer(m);
        } else {
            map.removeLayer(m);
        }
    });

    document.querySelectorAll("tbody tr").forEach(row => {
        if (value === "all" || row.dataset.district === value) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}


function renderChart(labels, values) {
    const ctx = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "AQI",
                data: values,
                borderWidth: 2
            }]
        }
    });
}

function aiAnalysis(aqi) {
    if (aqi <= 50) return "Хорошее качество воздуха";
    if (aqi <= 100) return "Умеренное загрязнение";
    if (aqi <= 150) return "Вредно для чувствительных групп";
    return "Опасный уровень загрязнения";
}

loadData();
setInterval(loadData, 6);