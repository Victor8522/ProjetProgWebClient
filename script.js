

function getDataSync(link = "https://api.open-meteo.com/v1/forecast?latitude=47.5943&longitude=1.3291&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FBerlin&forecast_days=1") {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", link, false);
        xhr.send();
        const response = JSON.parse(xhr.response);
        return response;
    } catch (error) {
        console.error("Erreur capturée :", error);
        return null;
    }
}

// var data = getDataSync();

// const date = document.getElementById('date');
// date.innerHTML = data.daily.time[0];
// const meteo = document.getElementById('meteo');
// meteo.innerHTML = code["" + data.current.weather_code].day.description;
// const image = document.getElementById('image');
// image.src = code["" + data.current.weather_code].day.image;

// const temp_main = document.getElementById('temp-main');
// temp_main.innerHTML = data.current.temperature_2m + data.current_units.temperature_2m;
// const meteoG = document.getElementById('meteoG');
// meteoG.innerHTML = code["" + data.daily.weather_code[0]].day.description;
// const imageG = document.getElementById('imageG');
// imageG.src = code["" + data.daily.weather_code[0]].day.image;


// const temp_min = document.getElementById('temp-min');
// temp_min.innerHTML = data.daily.temperature_2m_min[0] + data.daily_units.temperature_2m_min;
// const temp_max = document.getElementById('temp-max');
// temp_max.innerHTML = data.daily.temperature_2m_max[0] + data.daily_units.temperature_2m_max;
// const humidity = document.getElementById('humidity');
// humidity.innerHTML = data.current.relative_humidity_2m + data.current_units.relative_humidity_2m;
// const wind = document.getElementById('wind');
// wind.innerHTML = data.current.wind_speed_10m + data.current_units.wind_speed_10m;

// const refreshbtn = document.getElementById('refresh-btn');

const container = document.querySelector('.container');

function newCard(id) {
    let card = document.createElement('div');
    card.className = "card";
    card.id = "card" + id;
    container.appendChild(card);

    let header = document.createElement('header');
    card.appendChild(header);
    let weather_now = document.createElement('div');
    card.appendChild(weather_now);
    let weather_details = document.createElement('div');
    card.appendChild(weather_details);

    let city = document.createElement('h1');
    city.id = "city" + id;
    header.appendChild(city);
    let date = document.createElement('p');
    date.id = "date" + id;
    header.appendChild(date);
    let meteo = document.createElement('p');
    meteo.id = "meteo" + id;
    header.appendChild(meteo);
    let image = document.createElement('img');
    image.id = "image" + id;
    header.appendChild(image);

    let class_temp_main = document.createElement('div');
    class_temp_main.className = "temp-main";
    weather_now.appendChild(class_temp_main);
    let temp_main = document.createElement('p');
    temp_main.id = "temp-main" + id;
    class_temp_main.appendChild(temp_main);

    let meteoG = document.createElement('p');
    meteoG.id = "meteoG" + id;
    weather_now.appendChild(meteoG);
    let imageG = document.createElement('img');
    imageG.id = "imageG" + id;
    weather_now.appendChild(imageG);

    let temp_min = document.createElement('p');
    temp_min.id = "temp-min" + id;
    weather_details.appendChild(temp_min);
    let temp_max = document.createElement('p');
    temp_max.id = "temp-max" + id;
    weather_details.appendChild(temp_max);
    let humidity = document.createElement('p');
    humidity.id = "humidity" + id;
    weather_details.appendChild(humidity);
    let wind = document.createElement('p');
    wind.id = "wind" + id;
    weather_details.appendChild(wind);
}

function updateCard(ville, data) {
    let id = ville.getId();

    const city = document.getElementById('city' + id);
    city.innerHTML = ville.getNom();
    const date = document.getElementById('date' + id);
    date.innerHTML = data.daily.time[0];
    const meteo = document.getElementById('meteo' + id);
    meteo.innerHTML = code["" + data.current.weather_code].day.description;
    const image = document.getElementById('image' + id);
    image.src = code["" + data.current.weather_code].day.image;

    const temp_main = document.getElementById('temp-main' + id);
    temp_main.innerHTML = data.current.temperature_2m + data.current_units.temperature_2m;
    const meteoG = document.getElementById('meteoG' + id);
    meteoG.innerHTML = code["" + data.daily.weather_code[0]].day.description;
    const imageG = document.getElementById('imageG' + id);
    imageG.src = code["" + data.daily.weather_code[0]].day.image;

    const temp_min = document.getElementById('temp-min' + id);
    temp_min.innerHTML = data.daily.temperature_2m_min[0] + data.daily_units.temperature_2m_min;
    const temp_max = document.getElementById('temp-max' + id);
    temp_max.innerHTML = data.daily.temperature_2m_max[0] + data.daily_units.temperature_2m_max;
    const humidity = document.getElementById('humidity' + id);
    humidity.innerHTML = data.current.relative_humidity_2m + data.current_units.relative_humidity_2m;
    const wind = document.getElementById('wind' + id);
    wind.innerHTML = data.current.wind_speed_10m + data.current_units.wind_speed_10m;
}



class Ville {
    constructor(id, nom, latitude, longitude) {
        this.id = id;
        this.nom = nom;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    getId() {
        return this.id;
    }

    getNom() {
        return this.nom;
    }

    getLatitude() {
        return this.latitude;
    }

    getLongitude() {
        return this.longitude;
    }
}

// function qui cree un objet ville a partir d un id et d un nom
function createVille(id, nom) {
    link = "https://geocoding-api.open-meteo.com/v1/search?name=" + nom + "&count=1&language=fr&format=json";
    data = getDataSync(link);
    if (data.results) {
        nom = data.results[0].name;
        latitude = data.results[0].latitude;
        longitude = data.results[0].longitude;
        console.log("Ville créée : " + nom + " (id: " + id + ", latitude: " + latitude + ", longitude: " + longitude + ")");
        return new Ville(id, nom, latitude, longitude);
    } else {
        alert("Ville non trouvée");
        return null;
    }
}

const villes = [];

ville = createVille(1, "Blois");
if (ville) {
    villes.push(ville);
}

// let ville = new Ville(1, "Blois");

// newCard(ville.getId());
// updateCard(ville, data);

function addCard() {
    let id = villes.length + 1;
    let nom = prompt("Entrez le nom de la ville :");
    let ville = createVille(id, nom);
    if (ville) {
        villes.push(ville);
        newCard(ville.getId());
        data = getDataSync("https://api.open-meteo.com/v1/forecast?latitude=" + ville.getLatitude() + "&longitude=" + ville.getLongitude() + "&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FBerlin&forecast_days=1");
        updateCard(ville, data);
    }
}

function createCard(ville) {
    newCard(ville.getId());
    data = getDataSync("https://api.open-meteo.com/v1/forecast?latitude=" + ville.getLatitude() + "&longitude=" + ville.getLongitude() + "&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FBerlin&forecast_days=1");
    updateCard(ville, data);
}

createCard(villes[0]);

const addCardBtn = document.getElementById('add-card-btn');
addCardBtn.addEventListener('click', addCard);

function refresh() {
    let cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        let id = card.id;
        let ville = new Ville(id, card.querySelector('.city').innerHTML);
        updateCard(ville, data);
    });
}

// fonction filtre qui demande a l utilisateur de choisir les info de meteo detailles qu il veut voir et qui affiche seulement ces info dans les cards avec un formulaire dans une pop up de checkbox pour chaque info (temp min, temp max, humidity, wind) et un bouton pour valider le choix de l utilisateur et appliquer le filtre sur les cards
function filtre() {
    let filtrePopup = document.createElement('div');
    filtrePopup.className = "filtre-popup";
    document.body.appendChild(filtrePopup);

    let form = document.createElement('form');
    filtrePopup.appendChild(form);
    let tempMinCheckbox = document.createElement('input');
    tempMinCheckbox.type = "checkbox";
    tempMinCheckbox.id = "temp-min-checkbox";
    form.appendChild(tempMinCheckbox);
    let tempMinLabel = document.createElement('label');
    tempMinLabel.htmlFor = "temp-min-checkbox";
    tempMinLabel.innerHTML = "Température minimale";
    form.appendChild(tempMinLabel);
    let tempMaxCheckbox = document.createElement('input');
    tempMaxCheckbox.type = "checkbox";
    tempMaxCheckbox.id = "temp-max-checkbox";
    form.appendChild(tempMaxCheckbox);
    let tempMaxLabel = document.createElement('label');
    tempMaxLabel.htmlFor = "temp-max-checkbox";
    tempMaxLabel.innerHTML = "Température maximale";
    form.appendChild(tempMaxLabel);
    let humidityCheckbox = document.createElement('input');
    humidityCheckbox.type = "checkbox";
    humidityCheckbox.id = "humidity-checkbox";
    form.appendChild(humidityCheckbox);
    let humidityLabel = document.createElement('label');
    humidityLabel.htmlFor = "humidity-checkbox";
    humidityLabel.innerHTML = "Humidité";
    form.appendChild(humidityLabel);
    let windCheckbox = document.createElement('input');
    windCheckbox.type = "checkbox";
    windCheckbox.id = "wind-checkbox";
    form.appendChild(windCheckbox);
    let windLabel = document.createElement('label');
    windLabel.htmlFor = "wind-checkbox";
    windLabel.innerHTML = "Vent";
    form.appendChild(windLabel);
    let submitButton = document.createElement('button');
    submitButton.type = "submit";
    submitButton.innerHTML = "Valider";
    form.appendChild(submitButton);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let tempMinChecked = tempMinCheckbox.checked;
        let tempMaxChecked = tempMaxCheckbox.checked;
        let humidityChecked = humidityCheckbox.checked;
        let windChecked = windCheckbox.checked;
        let cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            let tempMin = card.querySelector('.temp-min');
            let tempMax = card.querySelector('.temp-max');
            let humidity = card.querySelector('.humidity');
            let wind = card.querySelector('.wind');
            if (tempMin) {
                tempMin.style.display = tempMinChecked ? "block" : "none";
            }
            if (tempMax) {
                tempMax.style.display = tempMaxChecked ? "block" : "none";
            }
            if (humidity) {
                humidity.style.display = humidityChecked ? "block" : "none";
            }
            if (wind) {
                wind.style.display = windChecked ? "block" : "none";
            }
        });
        document.body.removeChild(filtrePopup);
    });
}

const filtreBtn = document.getElementById('filtre');
filtreBtn.addEventListener('click', filtre);


