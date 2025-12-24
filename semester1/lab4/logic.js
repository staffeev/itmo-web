import { API_KEY } from "./config.js";

let cityInput = document.getElementById("cityInput");
let suggestions = document.getElementById("suggestions");
let citiesList = document.getElementById("citiesList");
let details = document.getElementById("details");
let refreshBtn = document.getElementById("refreshBtn");
let geoBtn = document.getElementById("geoBtn");
let searchBlock = document.getElementById("searchBlock");

let state = {
    cities: [],
    selectedId: null
};

refreshBtn.addEventListener("click", refreshCurrentCity);
geoBtn.addEventListener("click", updateGeolocation);


init();


// инициализация

function init() {
    let saved = loadState();
    if (saved) {
        state = saved;
        searchBlock.classList.remove("hidden");
        refreshAllCities();
        renderCities();
        renderDetails();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => addCurrentLocation(pos.coords.latitude, pos.coords.longitude),
        () => {
            searchBlock.classList.remove("hidden");
            searchBlock.classList.add("hint");
            cityInput.placeholder = "Добавьте город вручную";
        }
    );
}


// получение местоположения пользователя

async function addCurrentLocation(lat, lon) {
    let existing = state.cities.find(c => c.id === "current");
    if (existing) {
        existing.lat = lat;
        existing.lon = lon;
        await loadCityWeather(existing);
        saveState();
        renderCities();
        renderDetails();
        return;
    }

    let city = {
        id: "current",
        name: "Текущее местоположение",
        lat,
        lon,
        weather: null
    };
    searchBlock.classList.remove("hint");
    state.cities.unshift(city);
    state.selectedId = city.id;
    searchBlock.classList.remove("hidden");

    await loadCityWeather(city);
    saveState();
    renderCities();
    renderDetails();
}


// обновление инфы о местоположении пользователя

function updateGeolocation() {
    navigator.geolocation.getCurrentPosition(
        pos => {
            addCurrentLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
            showOverlay("Доступ к геолокации не предоставлен");
            setTimeout(hideOverlay, 2000);
        }
    );
}


// поиск городов для добавления в общий список

cityInput.addEventListener("input", async () => {
    let q = cityInput.value.trim();
    suggestions.replaceChildren();
    if (q.length < 2) return;

    try {
        let res = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`
        );
        let data = await res.json();

        let seen = new Set();
        data.forEach(city => {
            let key = `${city.name}|${city.region}|${city.country}`;
            if (seen.has(key)) return;
            seen.add(key);

            let item = document.createElement("div");
            item.textContent = `${city.name}, ${city.country}`;
            item.addEventListener("click", () => {
                addCity(city);
                cityInput.value = "";
                suggestions.replaceChildren();
            });
            suggestions.append(item);
        });
    } catch (err) {
        console.error(err);
        let errorDiv = document.createElement("div");
        errorDiv.textContent = "Ошибка поиска";
        suggestions.append(errorDiv);
    }
});


// добавление города с координатами и текщей погодой в массив

async function addCity(city) {
    let id = `${city.lat},${city.lon}`;
    if (state.cities.some(c => c.id === id)) return; // если город уже есть

    let newCity = {
        id,
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        weather: null
    };
    searchBlock.classList.remove("hint");
    state.cities.push(newCity);
    state.selectedId = id;

    await loadCityWeather(newCity);
    saveState();
    renderCities();
    renderDetails();
}


// получение инфы о погоде через API

async function loadCityWeather(city) {
    showOverlay(`Загрузка погоды для ${city.name}...`);
    // details.replaceChildren();
    // let loading = document.createElement("div");
    // loading.textContent = `Загрузка погоды для ${city.name}...`;
    // details.append(loading);

    try {
        // на 2 дня вперед
        let forecastRes = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city.lat},${city.lon}&days=3&lang=ru`
        );
        let forecastData = await forecastRes.json();

        // предыдущие 2 дня
        let pastDays = [];
        let today = new Date();
        for (let i = 1; i <= 2; i++) {
            let d = new Date(today);
            d.setDate(today.getDate() - i);
            let dateStr = d.toISOString().slice(0, 10);

            try {
                let pastRes = await fetch(
                    `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${city.lat},${city.lon}&dt=${dateStr}&lang=ru`
                );
                let pastData = await pastRes.json();
                if (pastData.forecast && pastData.forecast.forecastday[0]) {
                    pastDays.push(pastData.forecast.forecastday[0]);
                }
            } catch (err) {
                showOverlay(`Ошибка загрузки погоды в прошлом для ${city.name}. Попробуйте позже`);
                // console.error("Ошибка загрузки прошлой погоды:", err);
            }
        }

        city.weather = forecastData;
        city.weather.pastDays = pastDays;

    } catch (err) {
        showOverlay(`Ошибка загрузки погоды для ${city.name}. Попробуйте позже`);
        // console.error("Ошибка загрузки погоды:", err);
        // city.weather = null;
        // details.replaceChildren();
        // let errorDiv = document.createElement("div");
        // errorDiv.textContent = `Ошибка загрузки погоды для ${city.name}`;
        // details.append(errorDiv);
    }
}


// обновление данных о выбранном городе

async function refreshCurrentCity() {
    let city = state.cities.find(c => c.id === state.selectedId);
    if (!city) return;
    await loadCityWeather(city);
    saveState();
    renderDetails();
}


// обновление данных о всех городоах

async function refreshAllCities() {
    for (let city of state.cities) {
        await loadCityWeather(city);
    }
    saveState();
    renderDetails();
}


// удаление городоа из общего списка 

function deleteCityFromList(event, city) {
    event.stopPropagation();
    state.cities = state.cities.filter(c => c.id !== city.id);
    if (state.selectedId === city.id && state.cities.length > 0) {
        state.selectedId = state.cities[0].id;
    } else if (state.cities.length === 0) {
        state.selectedId = null;
    }
    saveState();
    renderCities();
    renderDetails();
}


// общий список городов в HTML

function renderCities() {
    citiesList.replaceChildren();

    state.cities.forEach(city => {
        let li = document.createElement("li");
        li.textContent = city.name;
        if (city.id === state.selectedId) li.classList.add("active");

        li.addEventListener("click", () => {
            state.selectedId = city.id;
            refreshCurrentCity();
            renderCities();
        });

        // кнопка удаление города
        let delBtn = document.createElement("button");
        delBtn.classList.add("deleteBtn");
        delBtn.textContent = "\u00D7";
        delBtn.addEventListener("click", (e) => {
            deleteCityFromList(e, city);
        });
        li.append(delBtn);
        citiesList.append(li);
    });
}


// показ оверлея поверх данных

function showOverlay(text) {
    let overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.textContent = text;
    details.append(overlay);
}

// скрытие оверлея

function hideOverlay() {
    let overlay = details.querySelector(".overlay");
    if (overlay) overlay.remove();
}


// рендер в HTML текущей погоды в выбранном городе

function renderCurrentWeather(currentBlock, city) {
    let icon = document.createElement("img");
    icon.src = city.weather.current.condition.icon;
    let condition = document.createElement("div");
    condition.textContent = city.weather.current.condition.text;
    let date = document.createElement("div");
    date.textContent = new Date(city.weather.location.localtime)
        .toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
    let temp = document.createElement("div");
    temp.textContent = `Температура: ${city.weather.current.temp_c} °C`;
    let feels = document.createElement("div");
    feels.textContent = `Ощущается как: ${city.weather.current.feelslike_c} °C`;
    let windSpeed = (city.weather.current.wind_kph / 3.6).toFixed(1);
    let wind = document.createElement("div");
    wind.textContent = `Ветер: ${windSpeed} м/с, ${city.weather.current.wind_dir}`;

    currentBlock.append(icon, condition, date, temp, feels, wind);
}


// получение инфы о температуре по часам

function renderHourlyWeather(container, city) {
    let hours = city.weather.forecast.forecastday[0].hour;
    let nowHour = new Date().getHours();

    hours.forEach(hour => {
        let hourDate = new Date(hour.time);
        if (hourDate.getHours() < nowHour) return;
        let hourBlock = document.createElement("div");
        hourBlock.classList.add("hourly-item");
        let time = document.createElement("div");
        time.textContent = hourDate.getHours() + ":00";
        let icon = document.createElement("img");
        icon.src = hour.condition.icon;
        let temp = document.createElement("div");
        temp.textContent = `${hour.temp_c} °C`;
        let windSpeed = (hour.wind_kph / 3.6).toFixed(1);
        let wind = document.createElement("div");
        wind.textContent = `${windSpeed} м/с`;

        hourBlock.append(time, icon, temp, wind);
        container.append(hourBlock);
    });
}


// рендер в HTML погоды в другой день

function renderForecastWeather(forecastDiv, cityWeatherArray) {
    cityWeatherArray.forEach(day => {
        let dayBlock = document.createElement("div");
        dayBlock.classList.add("forecast-day");
        let date = document.createElement("div");
        date.textContent = day.date;
        let icon = document.createElement("img");
        icon.src = day.day.condition.icon;
        let condition = document.createElement("div");
        condition.textContent = day.day.condition.text;
        let temp = document.createElement("div");
        temp.textContent = `Днём: ${day.day.avgtemp_c}°C / Ночью: ${day.day.mintemp_c}°C`;
        dayBlock.append(date, icon, condition, temp);
        forecastDiv.append(dayBlock);
    });
}


// рендер данных о погоде в HTML

function renderDetails() {
    details.replaceChildren();
    let city = state.cities.find(c => c.id === state.selectedId);
    if (!city || !city.weather) return;

    let title = document.createElement("h2");
    title.textContent = city.name;

    // текущая погода
    let currentBlock = document.createElement("div");
    currentBlock.classList.add("current-weather");
    renderCurrentWeather(currentBlock, city);

    // по часам
    let hourlyBlock = document.createElement("div");
    hourlyBlock.classList.add("hourly");
    renderHourlyWeather(hourlyBlock, city);

    // не текущая погода
    let forecastBlock = document.createElement("div");
    forecastBlock.classList.add("forecast"); // общий блок
    // предыдущие 2 дня
    if (city.weather.pastDays && city.weather.pastDays.length > 0) {
        renderForecastWeather(forecastBlock, city.weather.pastDays);
    }
    // следующие 2 дня
    renderForecastWeather(forecastBlock, city.weather.forecast.forecastday.slice(1, 3));

    details.append(title, currentBlock, hourlyBlock, forecastBlock);
}


// сохранение в и загрузка из localStorage

function saveState() {
    localStorage.setItem("weatherState", JSON.stringify(state));
}

function loadState() {
    let raw = localStorage.getItem("weatherState");
    return raw ? JSON.parse(raw) : null;
}
