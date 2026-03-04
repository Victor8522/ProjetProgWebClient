

function getMeteoSync() {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.open-meteo.com/v1/forecast?latitude=47.5943&longitude=1.3291&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FBerlin&forecast_days=1", false);
        xhr.send();
        const response = JSON.parse(xhr.response);
        return response;
    } catch (error) {
        console.error("Erreur capturée :", error);
        return null;
    }
}

data = getMeteoSync();

const date = document.getElementById('date');
date.innerHTML = data.daily.time[0]
const meteo = document.getElementById('meteo');
meteo.innerHTML = data.current.weather_code

const temp_main = document.getElementById('temp-main');
temp_main.innerHTML = data.current.temperature_2m+data.current_units.temperature_2m
const meteoG = document.getElementById('meteoG');
meteoG.innerHTML = data.daily.weather_code[0]


const temp_min = document.getElementById('temp-min');
temp_min.innerHTML = data.daily.temperature_2m_min[0]+data.daily_units.temperature_2m_min
const temp_max = document.getElementById('temp-max');
temp_max.innerHTML = data.daily.temperature_2m_max[0]+data.daily_units.temperature_2m_max
const humidity = document.getElementById('humidity');
humidity.innerHTML = data.current.relative_humidity_2m+data.current_units.relative_humidity_2m
const wind = document.getElementById('wind');
wind.innerHTML = data.current.wind_speed_10m+data.current_units.wind_speed_10m

const refresh_btn = document.getElementById('refresh-btn');

function getCode() {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.open-meteo.com/v1/forecast?latitude=47.5943&longitude=1.3291&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FBerlin&forecast_days=1", false);
        xhr.send();
        const response = JSON.parse(xhr.response);
        return response;
    } catch (error) {
        console.error("Erreur capturée :", error);
        return null;
    }
}