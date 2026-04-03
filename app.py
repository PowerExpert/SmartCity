import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Almaty Smart City Monitor",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
    <style>
        /* Kill all default padding */
        .block-container {
            padding: 0.3rem 0.8rem 0 0.8rem !important;
            max-width: 100% !important;
        }
        header, footer, #MainMenu { visibility: hidden; height: 0; }
        .stApp { overflow: hidden; background: #0f1117; }

        /* Title row */
        .title-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 2px 0 4px 0;
            border-bottom: 1px solid #2a2a3a;
            margin-bottom: 4px;
        }
        .title-main {
            font-size: 0.95rem;
            font-weight: 700;
            color: #e0e0e0;
            white-space: nowrap;
        }
        .title-sub {
            font-size: 0.72rem;
            color: #666;
            white-space: nowrap;
        }

        /* Section labels */
        .section-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 3px 0 2px 0;
        }

        /* District name */
        .district-name {
            font-size: 1.05rem;
            font-weight: 700;
            color: #e0e0e0;
            margin: 0;
        }

        /* Risk badge */
        .badge-red    { background:#ff4b4b22; color:#ff4b4b; border:1px solid #ff4b4b55; padding:1px 8px; border-radius:10px; font-size:0.7rem; font-weight:600; }
        .badge-orange { background:#ffa50022; color:#ffa500; border:1px solid #ffa50055; padding:1px 8px; border-radius:10px; font-size:0.7rem; font-weight:600; }
        .badge-green  { background:#00c85322; color:#00c853; border:1px solid #00c85355; padding:1px 8px; border-radius:10px; font-size:0.7rem; font-weight:600; }

        /* Metric cards */
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;
            margin: 4px 0;
        }
        .metric-card {
            background: #1a1d2e;
            border: 1px solid #2a2d3e;
            border-radius: 6px;
            padding: 5px 7px;
        }
        .metric-icon-label {
            font-size: 0.62rem;
            color: #888;
            margin: 0;
        }
        .metric-value {
            font-size: 0.92rem;
            font-weight: 700;
            color: #e0e0e0;
            margin: 0;
            line-height: 1.2;
        }
        .metric-sub {
            font-size: 0.58rem;
            color: #555;
            margin: 0;
        }

        /* AI steps */
        .step-item {
            font-size: 0.71rem;
            color: #bbb;
            padding: 2px 0;
            border-left: 2px solid #2a2d3e;
            padding-left: 6px;
            margin: 2px 0;
        }

        /* Divider */
        .divider { border: none; border-top: 1px solid #2a2a3a; margin: 4px 0; }

        /* Tighten streamlit gaps */
        div[data-testid="stVerticalBlock"] { gap: 0rem !important; }
        .element-container { margin: 0 !important; padding: 0 !important; }

        /* Tabs */
        .stTabs [data-baseweb="tab"] {
            font-size: 0.7rem !important;
            padding: 2px 10px !important;
            color: #888 !important;
        }
        .stTabs [data-baseweb="tab"][aria-selected="true"] { color: #4a90d9 !important; }
        .stTabs [data-baseweb="tab-list"] {
            gap: 2px;
            background: transparent !important;
            border-bottom: 1px solid #2a2a3a !important;
        }
        .stTabs [data-baseweb="tab-panel"] { padding: 4px 0 0 0 !important; }

        /* Selectbox compact */
        .stSelectbox > div { margin: 0 !important; }
        [data-baseweb="select"] { font-size: 0.72rem !important; }
    </style>
""", unsafe_allow_html=True)

# ── AI Logic ──────────────────────────────────────────────────────────────────
def get_ai_analysis(district, traffic, air, energy, noise, waste):
    score = 0
    if air > 150:    score += 2
    elif air > 100:  score += 1
    if traffic > 80: score += 2
    elif traffic > 60: score += 1
    if energy > 250: score += 1
    if noise > 70:   score += 1

    if score >= 4:   criticality, color, badge = "Critical", "#ff4b4b", "badge-red"
    elif score >= 2: criticality, color, badge = "Medium",   "#ffa500", "badge-orange"
    else:            criticality, color, badge = "Low",      "#00c853", "badge-green"

    steps = []
    if traffic > 60: steps.append("🚦 Adjust signal cycles on congested corridors")
    if air > 100:    steps.append("🌫️ Issue AQI advisory · restrict diesel vehicles")
    if energy > 250: steps.append("⚡ Peak load alert · activate demand response")
    if noise > 70:   steps.append("🔊 Noise over threshold · check construction permits")
    if waste > 100:  steps.append("🗑️ High waste volume · deploy extra collection units")
    if not steps:    steps.append("✅ All systems nominal")

    return {"criticality": criticality, "color": color, "badge": badge, "steps": steps}

# ── Data ──────────────────────────────────────────────────────────────────────
@st.cache_data
def load_data():
    districts_map = {
        "Alatau":    [43.2220, 76.7850],
        "Almalы":    [43.2565, 76.9285],
        "Auezov":    [43.2150, 76.8460],
        "Bostandyk": [43.2890, 76.9120],
        "Zhetisu":   [43.2700, 76.9800],
        "Medeu":     [43.2560, 76.9650],
        "Nauryzbai": [43.1980, 76.7400],
        "Turksib":   [43.3100, 76.9500],
    }
    np.random.seed(42)
    rows = []
    for district, coords in districts_map.items():
        rows.append({
            "District":              district,
            "Traffic (%)":           np.random.randint(20, 92),
            "Air Quality (AQI)":     np.random.randint(30, 210),
            "Energy (MW)":           np.random.randint(50, 310),
            "Noise (dB)":            np.random.randint(45, 85),
            "Waste (tons)":          np.random.randint(20, 150),
            "Pop. Density":          round(np.random.uniform(2.5, 18.0), 1),
            "Green Cover (%)":       np.random.randint(5, 40),
            "Water Usage (ML)":      np.random.randint(10, 80),
            "Incidents":             np.random.randint(0, 25),
            "Road Quality (%)":      np.random.randint(40, 95),
            "lat": coords[0],
            "lon": coords[1],
        })
    df = pd.DataFrame(rows)

    hist_data = []
    for district in districts_map.keys():
        for year in range(2019, 2027):
            hist_data.append({
                "District": district, "Year": year,
                "Traffic":      np.random.randint(30, 88),
                "Pollution":    np.random.randint(40, 190),
                "Energy":       np.random.randint(50, 310),
                "Noise":        np.random.randint(45, 85),
                "Waste":        np.random.randint(20, 150),
                "Incidents":    np.random.randint(0, 25),
                "Road Quality": np.random.randint(40, 95),
            })
    return df, pd.DataFrame(hist_data)

df, df_hist = load_data()

# ── Title bar ─────────────────────────────────────────────────────────────────
st.markdown("""
<div class="title-bar">
  <span class="title-main">🏙️ Almaty Smart City Monitor</span>
  <span class="title-sub">· Click a district bubble on the map to update the panel</span>
</div>
""", unsafe_allow_html=True)

# ── Layout: 58% map | 42% panel ───────────────────────────────────────────────
map_col, panel_col = st.columns([58, 42])

# ── MAP ───────────────────────────────────────────────────────────────────────
with map_col:
    fig_map = px.scatter_mapbox(
        df, lat="lat", lon="lon",
        size="Traffic (%)",
        color="Air Quality (AQI)",
        hover_name="District",
        hover_data={
            "Traffic (%)": True, "Air Quality (AQI)": True,
            "Energy (MW)": True, "Noise (dB)": True,
            "Incidents": True, "lat": False, "lon": False,
        },
        color_continuous_scale="RdYlGn_r",
        zoom=10.6,
        center={"lat": 43.248, "lon": 76.870},
        height=580,
        custom_data=["District"],
    )
    fig_map.update_layout(
        mapbox_style="carto-positron",
        margin={"r": 0, "t": 0, "l": 0, "b": 0},
        paper_bgcolor="rgba(0,0,0,0)",
        coloraxis_colorbar=dict(
            thickness=8, len=0.55,
            title=dict(text="AQI", font=dict(size=9, color="#aaa")),
            tickfont=dict(size=8, color="#aaa"),
            bgcolor="rgba(15,17,23,0.8)",
        ),
    )

    selected_district = "Almalы"
    event = st.plotly_chart(
        fig_map, use_container_width=True,
        on_select="rerun", config={"scrollZoom": False}
    )
    if event and "selection" in event and event["selection"].get("points"):
        point = event["selection"]["points"][0]
        if "custom_data" in point:
            c = point["custom_data"]
            selected_district = c[0] if isinstance(c, list) else c
        elif "hovertext" in point:
            selected_district = point["hovertext"]

# ── RIGHT PANEL ───────────────────────────────────────────────────────────────
with panel_col:
    row = df[df["District"] == selected_district].iloc[0]
    ai  = get_ai_analysis(
        selected_district,
        row["Traffic (%)"], row["Air Quality (AQI)"],
        row["Energy (MW)"], row["Noise (dB)"], row["Waste (tons)"]
    )

    # District name + badge
    st.markdown(
        f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">'
        f'<span class="district-name">{selected_district} District</span>'
        f'<span class="{ai["badge"]}">{ai["criticality"]} Risk</span>'
        f'</div>',
        unsafe_allow_html=True
    )

    # 12 metrics in 3 rows of 4
    metrics = [
        ("Traffic",     f"{row['Traffic (%)']}%",         "%"),
        ("AQI",         str(row["Air Quality (AQI)"]),    "index"),
        ("Energy",      f"{row['Energy (MW)']} MW",        "demand"),
        ("Noise",       f"{row['Noise (dB)']} dB",         "level"),
        ("Waste",       f"{row['Waste (tons)']}t",         "daily"),
        ("Density",     f"{row['Pop. Density']}k/km²",     "pop."),
        ("Green Cover", f"{row['Green Cover (%)']}%",      "area"),
        ("Water",       f"{row['Water Usage (ML)']} ML",   "usage"),
        ("Incidents",   str(row["Incidents"]),             "today"),
        ("Road Quality",f"{row['Road Quality (%)']}%",    "score"),
        ("Heat Index",  f"{np.random.randint(18,38)}°C",  "feels"),
        ("Transit Load",f"{np.random.randint(30,95)}%",   "buses"),
    ]

    html_cards = '<div class="metric-grid">'
    for label, value, sub in metrics:
        html_cards += f"""
        <div class="metric-card">
            <p class="metric-icon-label">{label}</p>
            <p class="metric-value">{value}</p>
            <p class="metric-sub">{sub}</p>
        </div>"""
    html_cards += '</div>'
    st.markdown(html_cards, unsafe_allow_html=True)

    # AI steps
    st.markdown('<div class="section-label">AI Recommendations</div>', unsafe_allow_html=True)
    for step in ai["steps"]:
        st.markdown(f'<div class="step-item">{step}</div>', unsafe_allow_html=True)

    st.markdown('<hr class="divider">', unsafe_allow_html=True)

    # Tabs
    tab1, tab2 = st.tabs(["📈 Trends", "📊 Compare Districts"])

    with tab1:
        t_col1, t_col2 = st.columns([3, 1])
        with t_col2:
            metric_pick = st.selectbox(
                "", ["Traffic", "Pollution", "Energy", "Noise", "Waste", "Incidents", "Road Quality"],
                key="trend", label_visibility="collapsed"
            )
        dist_hist = df_hist[df_hist["District"] == selected_district]
        fig_line = px.line(dist_hist, x="Year", y=metric_pick, markers=True, height=195)
        fig_line.update_layout(
            margin={"r": 0, "t": 5, "l": 0, "b": 0},
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#aaa", size=9),
            xaxis=dict(gridcolor="#2a2a3a", tickfont=dict(size=9)),
            yaxis=dict(gridcolor="#2a2a3a", tickfont=dict(size=9)),
        )
        fig_line.update_traces(line_color="#4a90d9", marker_color="#4a90d9")
        st.plotly_chart(fig_line, use_container_width=True)

    with tab2:
        b_col1, b_col2 = st.columns([3, 1])
        with b_col2:
            bar_metric = st.selectbox(
                "", ["Traffic (%)", "Air Quality (AQI)", "Energy (MW)", "Noise (dB)", "Waste (tons)", "Incidents", "Road Quality (%)"],
                key="bar", label_visibility="collapsed"
            )
        fig_bar = px.bar(
            df.sort_values(bar_metric, ascending=False),
            x="District", y=bar_metric,
            color=bar_metric, color_continuous_scale="RdYlGn_r",
            height=195,
        )
        fig_bar.update_layout(
            margin={"r": 0, "t": 5, "l": 0, "b": 0},
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#aaa", size=9),
            xaxis=dict(gridcolor="#2a2a3a", tickfont=dict(size=8), tickangle=-30),
            yaxis=dict(gridcolor="#2a2a3a", tickfont=dict(size=9)),
            showlegend=False, coloraxis_showscale=False,
        )
        st.plotly_chart(fig_bar, use_container_width=True)