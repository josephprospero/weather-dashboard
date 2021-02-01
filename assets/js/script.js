// Query Selectors
let inputEl = document.querySelector("#city-search");
let searchEl = document.querySelector("#btn-search");
let clearEl = document.querySelector("#btn-clear");
let nameEl = document.querySelector("#city-name");
let currentPicEl = document.querySelector("#weather-current");
let currentTempEl = document.querySelector("#temperature");
let currentHumidityEl = document.querySelector("#humidity"); 4
let currentWindEl = document.querySelector("#wind-speed");
let currentUVEl = document.querySelector("#UV-index");
let historyEl = document.querySelector("#history");
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

// API Key
let APIKey = "e5416f0cf681fe669a7cca93fa728f96";

// If user inputs blank
let cityCheckHandler = function (event) {
    event.preventDefault();
    let checkCity = inputEl.value
    if (checkCity) {
        getWeather(checkCity);
    } else {
        alert("Please enter the name of a city.")
    }
}

let getWeather = function (cityName) {
    // Ensures that only one city comes up regardless of letter casing
    let city = cityName.toLowerCase()
    //  City search up
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;
    fetch(queryURL)
        .then(function (response) {
            if (response.ok) {
                checkDuplicateCity(city);
                return response.json();
            } else {
                alert("Please enter a valid city.")
            }
        })
        // Pulling info from response
        .then(function (response) {
            let currentDate = moment().format("L")
            nameEl.innerHTML = response.name + " (" + currentDate + ")";
            let weatherPic = response.weather[0].icon;
            currentPicEl.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            currentPicEl.setAttribute("alt", response.weather[0].description);
            currentTempEl.innerHTML = "Temperature: " + kelvinToFahrenheit(response.main.temp) + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + response.main.humidity + "%";
            currentWindEl.innerHTML = "Wind Speed: " + response.wind.speed + " MPH";
            let lat = response.coord.lat;
            let lon = response.coord.lon;

            // UV Index API
            let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
            fetch(UVQueryURL)
                .then(function (response2) {
                    return response2.json();
                })
                .then(function (response2) {
                    let UVIndex = document.createElement("span");
                    currentUVEl.innerHTML = "UV Index: ";
                    let checkUVIndex = response2[0].value;
                    if (checkUVIndex < 2) {
                        UVIndex.setAttribute("class", "badge badge-success");
                    } else if (checkUVIndex < 8) {
                        UVIndex.setAttribute("class", "badge badge-warning");
                    } else {
                        UVIndex.setAttribute("class", "badge badge-danger");
                    }
                    UVIndex.innerHTML = checkUVIndex;
                    currentUVEl.append(UVIndex);
                });
            //  5 Day Forecast API 
            let cityID = response.id;
            let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
            fetch(forecastQueryURL)
                .then(function (response2) {
                    return response2.json();
                })
                .then(function (response2) {
                    let forecastEls = document.querySelectorAll(".forecast");
                    let varDate = moment().format("L");
                    for (i = 0; i < forecastEls.length; i++) {
                        forecastEls[i].innerHTML = "";
                        let forecastIndex = i * 8 + 4;
                        varDate = moment().add(i+1, "days").format("L");
                        let forecastDateEl = document.createElement("p");
                        forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                        forecastDateEl.innerHTML = varDate;
                        forecastEls[i].append(forecastDateEl);
                        let forecastWeatherEl = document.createElement("img");
                        forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response2.list[forecastIndex].weather[0].icon + "@2x.png");
                        forecastWeatherEl.setAttribute("alt", response2.list[forecastIndex].weather[0].description);
                        forecastEls[i].append(forecastWeatherEl);
                        let forecastTempEl = document.createElement("p");
                        forecastTempEl.innerHTML = "Temp: " + kelvinToFahrenheit(response2.list[forecastIndex].main.temp) + " &#176F";
                        forecastEls[i].append(forecastTempEl);
                        let forecastHumidityEl = document.createElement("p");
                        forecastHumidityEl.innerHTML = "Humidity: " + response2.list[forecastIndex].main.humidity + "%";
                        forecastEls[i].append(forecastHumidityEl);
                    }
                });
        });
}

// Converting Kelvin response to Farenheit
function kelvinToFahrenheit(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
}

// Check localStorage for duplicate city, prevent from duplicating city
let checkDuplicateCity = function (cityName) {
    let cityCheckDup = false;
    let cityListDisplay = false;
    for (let i = 0; i < searchHistory.length; i++) {
        let historyItem = document.createElement("input");
        historyItem.setAttribute("value", searchHistory[i]);
        if (cityName === historyItem.value) {
            cityCheckDup = true;
            cityListDisplay = true;
        } else {
            if (cityListDisplay === true) {
                cityCheckDup = true;
            } else {
                cityCheckDup = false
            }
        }
    }
    if (cityCheckDup === false) {
        searchHistory.push(cityName);
        localStorage.setItem("search", JSON.stringify(searchHistory));
    }
    renderSearchHistory();
}

// List of previously searched cities
function renderSearchHistory() {
    historyEl.innerHTML = "";
    for (let i = 0; i < searchHistory.length; i++) {
        let historyItem = document.createElement("input");
        historyItem.setAttribute("type", "text");
        historyItem.setAttribute("readonly", true);
        historyItem.setAttribute("class", "form-control d-block bg-white");
        historyItem.setAttribute("value", searchHistory[i]);
        historyItem.addEventListener("click", function () {
            getWeather(historyItem.value);
        })
        historyEl.append(historyItem);
    }
}

function init() {
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}

// Event Listeners
searchEl.addEventListener("click", cityCheckHandler);
clearEl.addEventListener("click", function () {
    searchHistory = [];
    renderSearchHistory();
    localStorage.setItem("search", JSON.stringify(searchHistory));
})

init();