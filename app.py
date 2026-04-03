import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from datetime import datetime

# --- CONFIGURATION ---
st.set_page_config(page_title="Smart Almaty Dashboard", layout="wide")

# --- AI ANALYTICS ENGINE ---
def get_almaty_ai_insights(traffic, aqi, district_name):
    """
    AI Logic specialized for Almaty's geography and urban challenges.
    """
    criticality = "Низкая"
    color = "green"
    status = "Стабильно"
    
    # Logic for Almaty's specific smog and traffic thresholds
    if aqi > 150 or traffic > 7:
        criticality = "Высокая"
        color = "red"
        status = "Критическое состояние"
    elif aqi > 100 or traffic > 5:
        criticality = "Средняя"
        color = "orange"
        status = "Внимание"

    recommendations = [
        f"Оптимизировать работу светофоров на развязках в районе {district_name}.",
        "Усилить контроль за выбросами частного сектора и ТЭЦ.",
        "Рекомендовать жителям предгорных районов ограничить использование авто.",
        "Активизировать поливомоечную технику для снижения пыли."
    ]
    
    return {
        "what": f"В районе {district_name} индекс AQI составляет {aqi}, пробки {traffic} баллов.",
        "criticality": f"{criticality} (Статус: {status})",
        "actions": recommendations,
        "color": color
    }

# --- DATA GENERATION (ALMATY DISTRICTS) ---
@st.cache_data
def load_almaty_data():
    # 8 Districts of Almaty
    districts = [
        'Медеуский', 'Алмалинский', 'Бостандыкский', 
        'Ауэзовский', 'Жетысуский', 'Турксибский', 
        'Наурызбайский', 'Алатауский'
    ]
    
    # Coordinates (Approximate centers of Almaty districts)
    data = {
        'Район': districts,
        'Пробки (0-10)': np.random.uniform(2, 9, len(districts)).round(1),
        'Воздух (AQI)': np.random.uniform(50, 220, len(districts)).round(0),
        'ЖКХ Нагрузка (%)': np.random.uniform(30, 90, len(districts)).round(0),
        'lat': [43.23, 43.25, 43.22, 43.23, 43.27, 43.30, 43.21, 43.28],
        'lon': [76.95, 76.93, 76.92, 76.85, 76.94, 76.95, 76.80, 76.85]
    }
    return pd.DataFrame(data)

df = load_almaty_data()

# --- HEADER ---
st.title("🍎 Smart City: Almaty Management Panel")
st.write(f"Данные мониторинга города на: {datetime.now().strftime('%d.%m.%Y %H:%M')}")

# --- TOP METRICS ---
avg_aqi = df['Воздух (AQI)'].mean()
avg_traffic = df['Пробки (0-10)'].mean()

m1, m2, m3, m4 = st.columns(4)
m1.metric("Средний AQI (Воздух)", f"{avg_aqi:.0f}", delta="Повышен", delta_color="inverse")
m2.metric("Пробки (Город)", f"{avg_traffic:.1f}/10", delta="0.2")
m3.metric("Эко-посты", "12 активны", delta="OK")
m4.metric("Спецтехника", "45 единиц")

st.divider()

# --- MAIN DASHBOARD ---
left, right = st.columns([2, 1])

with left:
    st.subheader("📍 Карта Инцидентов: Алматы")
    
    # Map centered on Almaty
    fig_map = px.scatter_mapbox(
        df, lat="lat", lon="lon", 
        size="Пробки (0-10)", 
        color="Воздух (AQI)", 
        hover_name="Район",
        color_continuous_scale="Reds",
        zoom=11, height=550
    )
    fig_map.update_layout(
        mapbox_style="carto-positron",
        mapbox_center={"lat": 43.2389, "lon": 76.8897}
    )
    st.plotly_chart(fig_map, use_container_width=True)
    
    # District Comparison
    st.subheader("Сравнение районов")
    fig_bar = px.bar(df, x='Район', y='Воздух (AQI)', color='Воздух (AQI)', 
                     title="Уровень загрязнения воздуха по районам")
    st.plotly_chart(fig_bar, use_container_width=True)

with right:
    st.subheader("🤖 AI Управленческий Вывод")
    
    # Analyze the most problematic district
    worst_idx = df['Воздух (AQI)'].idxmax()
    worst_district = df.iloc[worst_idx]
    
    ai = get_almaty_ai_insights(worst_district['Пробки (0-10)'], worst_district['Воздух (AQI)'], worst_district['Район'])
    
    with st.container(border=True):
        st.markdown(f"### Статус: :{ai['color']}[{ai['criticality']}]")
        
        st.markdown("**🔍 Что происходит?**")
        st.write(ai['what'])
        
        st.markdown("**⚠️ Насколько это критично?**")
        st.info(f"Уровень угрозы: {ai['criticality']}. Требуется мониторинг.")
        
        st.markdown("**🛠 Рекомендуемые действия:**")
        for action in ai['actions']:
            st.write(f"✅ {action}")
            
        if st.button("🚀 Внедрить план реагирования", use_container_width=True):
            st.balloons()
            st.success("План передан в акимат и службы города!")

# --- FOOTER ---
st.divider()
st.caption("Разработано для MVP Smart City Management. Данные: Симуляция на основе районов г. Алматы.")