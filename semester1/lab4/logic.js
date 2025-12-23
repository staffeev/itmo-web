import { API_KEY } from "./config.js";

let cityInput = document.getElementById("cityInput");
let suggestions = document.getElementById("suggestions");
let citiesList = document.getElementById("citiesList");
let details = document.getElementById("details");
let refreshBtn = document.getElementById("refreshBtn");
let searchBlock = document.getElementById("searchBlock");

let state = {
    cities: [],
    selectedId: null
};

refreshBtn.addEventListener("click", refreshCurrentCity);


init();

function init() {
    let saved = loadState();
    if (saved) {
        state = saved;
        searchBlock.classList.remove("hidden");
        refreshCurrentCity();
        renderCities();
        renderDetails();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => addCurrentLocation(pos.coords.latitude, pos.coords.longitude),
        () => searchBlock.classList.remove("hidden")
    );
}

// добавление текущего географического местоположения

async function addCurrentLocation(lat, lon) {
    let city = {
        id: "current",
        name: "Текущее местоположение",
        lat,
        lon,
        weather: null
    };

    state.cities.push(city);
    state.selectedId = city.id;
    searchBlock.classList.remove("hidden");

    await updateCity(city);
    saveState();
    renderCities();
    renderDetails();
}

// поиск и добавление городов в общий список

cityInput.addEventListener("input", async () => {
    let q = cityInput.value.trim();
    suggestions.replaceChildren();
    if (q.length < 2) return;

    let res = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`
    );
    let data = await res.json();

    // вывод подсказок
    data.forEach(city => {
        let item = document.createElement("div");
        item.textContent = `${city.name}, ${city.region}, ${city.country}`;
        item.addEventListener("click", () => {
            addCity(city);
            cityInput.value = "";
            suggestions.replaceChildren();
        });
        suggestions.append(item);
    });
});


// добавление выбранного города в списк с сохранением его координат

async function addCity(city) {
    let id = `${city.lat},${city.lon}`;
    if (state.cities.some(c => c.id === id)) return;

    let newCity = {
        id,
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        weather: null
    };

    state.cities.push(newCity);
    state.selectedId = id;

    await updateCity(newCity);
    saveState();
    renderCities();
    renderDetails();
}


// получение инфы о погоде для конкретного местоположения

async function updateCity(city) {
    let res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city.lat},${city.lon}&days=3&lang=ru`
    );
    let data = await res.json();
    city.weather = data;
}


// обновление погоды в ткущем городе

async function refreshCurrentCity() {
    let city = state.cities.find(e => e.id == state.selectedId);;
    await updateCity(city);
    saveState();
    renderDetails();
}


// вывод добавленных городов в HTML

function renderCities() {
    citiesList.replaceChildren();

    state.cities.forEach(city => {
        let li = document.createElement("li");
        li.textContent = city.name;

        if (city.id === state.selectedId) {
            li.classList.add("active");
        }

        li.addEventListener("click", () => {
            state.selectedId = city.id;
            refreshCurrentCity();
            renderDetails();
        });

        citiesList.append(li);
    });
}


// вывод инфы в HTML о погоде в текущем городе

function renderDetails() {
    details.replaceChildren();

    let city = state.cities.find(c => c.id === state.selectedId);
    if (!city || !city.weather) return;

    let title = document.createElement("h2");
    title.textContent = city.name;

    // погода сейчас
    let currentBlock = document.createElement("div");
    currentBlock.classList.add("current-weather");
    let icon = document.createElement("img");
    icon.src = city.weather.current.condition.icon;
    let condition = document.createElement("div");
    condition.textContent = city.weather.current.condition.text;
    let temp = document.createElement("div");
    temp.textContent = `Температура: ${city.weather.current.temp_c} °C`;
    let feels = document.createElement("div");
    feels.textContent = `Ощущается как: ${city.weather.current.feelslike_c} °C`;
    currentBlock.append(icon, condition, temp, feels);

    // прогноз на 2 дня вперед
    let forecastBlock = document.createElement("div");
    forecastBlock.classList.add("forecast");
    let header = document.createElement("h3");
    header.textContent = "Прогноз на 2 дня";
    forecastBlock.append(header);
    let nextDays = city.weather.forecast.forecastday.slice(1, 3);

    nextDays.forEach(day => {
        // погода на n-й день
        let dayBlock = document.createElement("div");
        dayBlock.classList.add("forecast-day");
        let date = document.createElement("div");
        date.textContent = `Дата: ${day.date}`;
        let icon = document.createElement("img");
        icon.src = day.day.condition.icon;
        let condition = document.createElement("div");
        condition.textContent = day.day.condition.text;
        let temp = document.createElement("div");
        temp.textContent = `Температура: ${day.day.mintemp_c}°C - ${day.day.maxtemp_c}°C`;
        dayBlock.append(date, icon, condition, temp);
        forecastBlock.append(dayBlock);
    });

    details.append(title, currentBlock, forecastBlock);
}

// сохранение и загрузка в localStorage

function saveState() {
    localStorage.setItem("weatherState", JSON.stringify(state));
}

function loadState() {
    let raw = localStorage.getItem("weatherState");
    return raw ? JSON.parse(raw) : null;
}