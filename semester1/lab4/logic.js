import { API_KEY } from "./config.js";

const cityInput = document.getElementById("cityInput");
const suggestions = document.getElementById("suggestions");
const citiesList = document.getElementById("citiesList");

let cities = [];


cityInput.addEventListener("input", async () => {
    const query = cityInput.value.trim();

    if (query.length < 2) {
        suggestions.replaceChildren();
        return;
    }

    const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
    );

    const data = await response.json();
    renderSuggestions(data);
});


function renderSuggestions(list) {
    suggestions.replaceChildren();

    list.forEach(city => {
        const item = document.createElement("div");
        item.textContent = `${city.name}, ${city.region}, ${city.country}`;

        item.addEventListener("click", () => {
            addCity(city);
            cityInput.value = "";
            suggestions.replaceChildren();
        });

        suggestions.append(item);
    });
}


async function addCity(city) {
    if (cities.some(c => c.lat === city.lat && c.lon === city.lon)) {
        return;
    }

    const weather = await getWeather(city.lat, city.lon);

    cities.push({
        name: city.name,
        region: city.region,
        lat: city.lat,
        lon: city.lon,
        temp: weather.temp
    });

    renderCities();
}


async function getWeather(lat, lon) {
    const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&lang=ru`
    );

    const data = await response.json();

    return {
        temp: data.current.temp_c,
        condition: data.current.condition.text
    };
}


function renderCities() {
    citiesList.replaceChildren();

    cities.forEach(city => {
        const li = document.createElement("li");

        const name = document.createElement("strong");
        name.textContent = city.name;

        const temp = document.createElement("span");
        temp.textContent = `${city.temp} °C`;

        li.append(name);
        li.append(document.createElement("br"));
        li.append(temp);

        citiesList.append(li);
    });
}
