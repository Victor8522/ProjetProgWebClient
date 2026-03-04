

function getMeteoSync(link = "https://api.open-meteo.com/v1/forecast?latitude=47.5943&longitude=1.3291&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FBerlin&forecast_days=1") {
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

var data = getMeteoSync();

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

const container =  document.querySelector('.container');

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
  constructor(id, nom) {
    this.id = id;
    this.nom = nom;
  }

  getId() {
    return this.id;
  }

  getNom() {
    return this.nom;
  }

}

const villes = [
    new Ville(1, "Blois")
];

// let ville = new Ville(1, "Blois");

// newCard(ville.getId());
// updateCard(ville, data);

function addCard() {
    let id = document.querySelectorAll('.card').length + 1;
    let nom = prompt("Entrez le nom de la ville :");
    let ville = new Ville(id, nom);
    newCard(ville.getId());
    updateCard(ville, data);
}

function addCard(ville, data) {
    newCard(ville.getId());
    updateCard(ville, data);
}

addCard(villes[0], data);


const addCardBtn = document.getElementById('add-card-btn');
addCardBtn.addEventListener('click', addCard);   
document.getElementById('add-card-btn').addEventListener('click', addCard); 

function refresh() {
    let cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        let id = card.id;
        let ville = new Ville(id, card.querySelector('.city').innerHTML);
        updateCard(ville, data);
    });
}

