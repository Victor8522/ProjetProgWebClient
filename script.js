// ─── 1. UTILITAIRES ─────────────────────────────────────────

function getDataSync(link) {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", link, false);
        xhr.send();
        return JSON.parse(xhr.response);
    } catch (error) {
        console.error("Erreur API :", error);
        return null;
    }
}

function convertDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
}

function buildWeatherUrl(lat, lon) {
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min`
        + `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        + `&timezone=Europe%2FBerlin&forecast_days=1`;
}

function addOptionToDatalist(datalistId, list) {
    const datalist = document.getElementById(datalistId);
    list.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        datalist.appendChild(option);
    });
}


// ─── 2. PERSISTANCE LOCAL STORAGE ───────────────────────────
//
//  Clés utilisées :
//    "meteo_villes"      → [{id, nom, latitude, longitude}, ...]
//    "meteo_recherches"  → ["Paris", "Lyon", ...]  (max 10)
//    "meteo_preferences" → {"temp-min": true, "temp-max": true, ...}

const LS_VILLES = "meteo_villes";
const LS_RECHERCHES_VILLES = "meteo_recherches_villes";
const LS_RECHERCHES_LAT = "meteo_recherches_lat";
const LS_RECHERCHES_LON = "meteo_recherches_lon";
const LS_PREFERENCES = "meteo_preferences";

const storage = {

    sauvegarderVilles() {
        const data = villes.map(v => ({
            id: v.getId(),
            nom: v.getNom(),
            latitude: v.getLatitude(),
            longitude: v.getLongitude()
        }));
        localStorage.setItem(LS_VILLES, JSON.stringify(data));
    },

    chargerVilles() {
        try { return JSON.parse(localStorage.getItem(LS_VILLES)) || []; }
        catch { return []; }
    },

    sauvegarderRecherches(param = "ville") {
        if (param === "ville") {
            localStorage.setItem(LS_RECHERCHES_VILLES, JSON.stringify(villeFile));
        } else if (param === "lat") {
            localStorage.setItem(LS_RECHERCHES_LAT, JSON.stringify(latFile));
        } else if (param === "lon") {
            localStorage.setItem(LS_RECHERCHES_LON, JSON.stringify(lonFile));
        }
    },

    chargerRecherches(param = "ville") {
        try {
            if (param === "ville") {
                return JSON.parse(localStorage.getItem(LS_RECHERCHES_VILLES)) || [];
            } else if (param === "lat") {
                return JSON.parse(localStorage.getItem(LS_RECHERCHES_LAT)) || [];
            } else if (param === "lon") {
                return JSON.parse(localStorage.getItem(LS_RECHERCHES_LON)) || [];
            }
        } catch {
            return [];
        }
    },

    sauvegarderPreferences(prefs) {
        localStorage.setItem(LS_PREFERENCES, JSON.stringify(prefs));
    },

    chargerPreferences() {
        try {
            const saved = JSON.parse(localStorage.getItem(LS_PREFERENCES));
            return saved || { "temp-min": true, "temp-max": true, humidity: true, wind: true };
        } catch {
            return { "temp-min": true, "temp-max": true, humidity: true, wind: true };
        }
    }
};


// ─── 3. MODÈLE : CLASSE VILLE ────────────────────────────────

class Ville {
    constructor(id, nom, latitude, longitude) {
        this.id = id;
        this.nom = nom;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    getId() { return this.id; }
    getNom() { return this.nom; }
    getLatitude() { return this.latitude; }
    getLongitude() { return this.longitude; }
}

function createVille(id, nom) {
    const link = `https://geocoding-api.open-meteo.com/v1/search?name=${nom}&count=1&language=fr&format=json`;
    const data = getDataSync(link);
    if (data && data.results) {
        const r = data.results[0];
        return new Ville(id, r.name, r.latitude, r.longitude);
    } else {
        alert("Ville non trouvée");
        return null;
    }
}

const villes = [];

// Chargé depuis le localStorage dès le démarrage
const villeFile = storage.chargerRecherches("ville");
const latFile = storage.chargerRecherches("lat");
const lonFile = storage.chargerRecherches("lon");

function miseAJourFile(nom, file = villeFile) {
    const index = file.indexOf(nom);
    if (index !== -1) file.splice(index, 1);
    file.unshift(nom);
    if (file.length > 10) file.pop();
    if (file === villeFile) {
        storage.sauvegarderRecherches("ville"); // ← persist à chaque mise à jour
    } else if (file === latFile) {
        storage.sauvegarderRecherches("lat");
    } else if (file === lonFile) {
        storage.sauvegarderRecherches("lon");
    }
}


// ─── 4. CONSTRUCTION DES CARDS ───────────────────────────────

const container = document.querySelector('.container');

function newCard(id) {
    let card = document.createElement('div');
    card.className = "card";
    card.id = "card" + id;
    container.appendChild(card);

    let header = document.createElement('header');
    card.appendChild(header);

    let btnSupprimer = document.createElement('button');
    btnSupprimer.className = "btn-supprimer";
    btnSupprimer.textContent = "X";
    btnSupprimer.onclick = () => {
        card.remove();
        const idx = villes.findIndex(v => v.getId() === id);
        if (idx !== -1) villes.splice(idx, 1);
        storage.sauvegarderVilles(); // ← persist après suppression
    };
    header.appendChild(btnSupprimer);

    // --- BOUTON FAVORIS ---
    let btnFav = document.createElement('button');
    btnFav.className = "btn-Favoris";
    btnFav.textContent = "Ajouter au Favoris";
    btnFav.onclick = () => addFav(id);
    card.appendChild(btnFav);


    let city = document.createElement('h1');
    city.id = "city" + id;
    header.appendChild(city);

    let date = document.createElement('p');
    date.id = "date" + id;
    header.appendChild(date);

    let meteoDiv = document.createElement('div');
    meteoDiv.className = "meteo";
    header.appendChild(meteoDiv);

    let image = document.createElement('img');
    image.id = "image" + id;
    meteoDiv.appendChild(image);

    let meteo = document.createElement('p');
    meteo.id = "meteo" + id;
    meteoDiv.appendChild(meteo);

    let weather_now = document.createElement('div');
    weather_now.className = "weather-now";
    card.appendChild(weather_now);

    let tempMainWrap = document.createElement('div');
    tempMainWrap.className = "temp-main";
    weather_now.appendChild(tempMainWrap);

    let temp_main = document.createElement('p');
    temp_main.id = "temp-main" + id;
    tempMainWrap.appendChild(temp_main);

    let weather_details = document.createElement('div');
    weather_details.className = "weather-details";
    card.appendChild(weather_details);

    detailCard("temp-min", id, weather_details);
    detailCard("temp-max", id, weather_details);
    detailCard("humidity", id, weather_details);
    detailCard("wind", id, weather_details);

    let btnDetails = document.createElement('button');
    btnDetails.className = "refresh-btn";
    btnDetails.textContent = "Voir les détails";
    btnDetails.style.marginTop = "20px";
    btnDetails.onclick = () => {
        const ville = villes.find(v => v.getId() === id);
        if (ville) goToDetails(ville.getNom(), ville.getLatitude(), ville.getLongitude());
    };
    card.appendChild(btnDetails);

    // Applique immédiatement les préférences sauvegardées à cette nouvelle card
    appliquerPreferences();
}

function detailCard(parm, id, weather_details) {
    let detail_card = document.createElement('div');
    detail_card.className = `detail-card ${parm}`;
    weather_details.appendChild(detail_card);

    let label = document.createElement('span');
    label.className = "label";
    label.textContent = parm;
    detail_card.appendChild(label);

    let value_span = document.createElement('span');
    value_span.className = "value";
    detail_card.appendChild(value_span);

    let value = document.createElement('p');
    value.id = parm + id;
    value_span.appendChild(value);
}


// ─── 5. MISE À JOUR DES CARDS ────────────────────────────────

function updateCard(ville, data) {
    const id = ville.getId();
    //document.getElementById('city' + id).innerHTML = ville.getNom();
    const cityNom = ville.getNom() || `${ville.getLatitude().toFixed(2)}, ${ville.getLongitude().toFixed(2)}`;
    document.getElementById('city' + id).innerHTML = cityNom;
    document.getElementById('date' + id).innerHTML = convertDate(data.daily.time[0]);
    document.getElementById('meteo' + id).innerHTML = code["" + data.current.weather_code].day.description;
    document.getElementById('image' + id).src = code["" + data.current.weather_code].day.image;
    document.getElementById('temp-main' + id).innerHTML = data.current.temperature_2m + data.current_units.temperature_2m;
    document.getElementById('temp-min' + id).innerHTML = data.daily.temperature_2m_min[0] + data.daily_units.temperature_2m_min;
    document.getElementById('temp-max' + id).innerHTML = data.daily.temperature_2m_max[0] + data.daily_units.temperature_2m_max;
    document.getElementById('humidity' + id).innerHTML = data.current.relative_humidity_2m + data.current_units.relative_humidity_2m;
    document.getElementById('wind' + id).innerHTML = data.current.wind_speed_10m + data.current_units.wind_speed_10m;
}

function createCard(ville) {
    newCard(ville.getId());
    const data = getDataSync(buildWeatherUrl(ville.getLatitude(), ville.getLongitude()));
    if (data) updateCard(ville, data);
}

function refresh() {
    villes.forEach(ville => {
        const data = getDataSync(buildWeatherUrl(ville.getLatitude(), ville.getLongitude()));
        if (data) updateCard(ville, data);
    });
}


// ─── 6. AJOUT DE CARD ────────────────────────────────────────

// function addCard() {
//     const id = villes.length + 1;
//     const nom = prompt("Entrez le nom de la ville :");
//     if (!nom) return;

//     const ville = createVille(id, nom);
//     if (ville) {
//         villes.push(ville);
//         createCard(ville);
//         miseAJourFile(ville.getNom()); // persist historique
//         storage.sauvegarderVilles();   // persist liste des villes
//     }
// }

function addCard() {
    const divPopup = document.querySelector('.popup');
    divPopup.innerHTML = ""; // Clear previous content

    // ── Popup ──────────────────────────────────────────────
    const popup = document.createElement('div');
    popup.className = "add-popup";
    divPopup.appendChild(popup);

    const form = document.createElement('form');
    popup.appendChild(form);

    // ── Champ nom avec suggestions ─────────────────────────
    const inputNom = document.createElement('input');
    inputNom.type = "text";
    inputNom.placeholder = "Nom de la ville";
    inputNom.setAttribute('list', 'suggestions-villes');
    form.appendChild(inputNom);

    const datalist = document.createElement('datalist');
    datalist.id = "suggestions-villes";
    villeFile.forEach(nom => {
        const option = document.createElement('option');
        option.value = nom;
        datalist.appendChild(option);
    });
    form.appendChild(datalist);

    // ── Séparateur ─────────────────────────────────────────
    const ou = document.createElement('p');
    ou.textContent = "— ou par coordonnées —";
    form.appendChild(ou);

    // ── Coordonnées dans un div.coords ─────────────────────
    const coords = document.createElement('div');
    coords.className = "coords";
    form.appendChild(coords);

    const inputLat = document.createElement('input');
    inputLat.type = "number";
    inputLat.placeholder = "Latitude  (ex: 47.59)";
    inputLat.step = "any";
    coords.appendChild(inputLat);
    const datalistLat = document.createElement('datalist');
    datalistLat.id = "suggestions-lat";
    latFile.forEach(lat => {
        const option = document.createElement('option');
        option.value = lat;
        datalistLat.appendChild(option);
    });
    form.appendChild(datalistLat);
    inputLat.setAttribute('list', 'suggestions-lat');

    const inputLon = document.createElement('input');
    inputLon.type = "number";
    inputLon.placeholder = "Longitude (ex: 1.32)";
    inputLon.step = "any";
    coords.appendChild(inputLon);
    const datalistLon = document.createElement('datalist');
    datalistLon.id = "suggestions-lon";
    lonFile.forEach(lon => {
        const option = document.createElement('option');
        option.value = lon;
        datalistLon.appendChild(option);
    });
    form.appendChild(datalistLon);
    inputLon.setAttribute('list', 'suggestions-lon');

    // ── Boutons dans un div.actions ────────────────────────
    const actions = document.createElement('div');
    actions.className = "actions";
    form.appendChild(actions);

    const btnValider = document.createElement('button');
    btnValider.type = "submit";
    btnValider.textContent = "Ajouter";
    actions.appendChild(btnValider);

    const btnAnnuler = document.createElement('button');
    btnAnnuler.type = "button";
    btnAnnuler.textContent = "Annuler";
    btnAnnuler.onclick = () => popup.remove();
    actions.appendChild(btnAnnuler);

    // ── Soumission ─────────────────────────────────────────
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = villes.length + 1;
        const nom = inputNom.value.trim();
        const lat = parseFloat(inputLat.value);
        const lon = parseFloat(inputLon.value);

        let ville = null;

        if (lat && lon) {
            const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=fr&format=json`;
            const data = getDataSync(url);
            let nomFinal;
            if (data && data.results) {
                nomFinal = data.results[0].name;
                ville = new Ville(id, nomFinal, lat, lon);
            } else {
                if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                    alert("Coordonnées invalides. Latitude doit être entre -90 et 90, Longitude entre -180 et 180.");
                    return;
                }
                ville = new Ville(id, null, lat, lon);
            }
        } else if (nom) {
            ville = createVille(id, nom);
        } else {
            alert("Renseignez un nom ou des coordonnées.");
            return;
        }

        if (ville) {
            villes.push(ville);
            createCard(ville);
            if (ville.getNom()) {
                miseAJourFile(ville.getNom(), villeFile);
            } else {
                miseAJourFile(`${ville.getLatitude().toFixed(2)}`, latFile);
                miseAJourFile(`${ville.getLongitude().toFixed(2)}`, lonFile);
            }
            storage.sauvegarderVilles();
            popup.remove();
        }
    });
}

const addCardBtn = document.getElementById('add-card-btn');
if (addCardBtn) addCardBtn.addEventListener('click', addCard);


// ─── 7. FILTRE (POPUP) ───────────────────────────────────────

const FIELDS = [
    { id: "temp-min-checkbox", label: "Température minimale", cls: "temp-min" },
    { id: "temp-max-checkbox", label: "Température maximale", cls: "temp-max" },
    { id: "humidity-checkbox", label: "Humidité", cls: "humidity" },
    { id: "wind-checkbox", label: "Vent", cls: "wind" },
];

function appliquerPreferences() {
    const prefs = storage.chargerPreferences();
    FIELDS.forEach(f => {
        document.querySelectorAll('.' + f.cls).forEach(el => {
            el.style.display = prefs[f.cls] ? "" : "none";
        });
    });
}

function filtre() {
    const prefs = storage.chargerPreferences();
    const divPopup = document.querySelector('.popup');
    divPopup.innerHTML = ""; // Clear previous content

    let filtrePopup = document.createElement('div');
    filtrePopup.className = "filtre-popup";
    divPopup.appendChild(filtrePopup);

    let form = document.createElement('form');
    filtrePopup.appendChild(form);

    FIELDS.forEach(f => {
        let cb = document.createElement('input');
        cb.type = "checkbox";
        cb.id = f.id;
        cb.checked = prefs[f.cls]; // ← état restauré depuis le localStorage
        form.appendChild(cb);

        let lbl = document.createElement('label');
        lbl.htmlFor = f.id;
        lbl.innerHTML = f.label;
        form.appendChild(lbl);
    });

    let submitButton = document.createElement('button');
    submitButton.type = "submit";
    submitButton.innerHTML = "Valider";
    form.appendChild(submitButton);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nouvellesPrefs = {};
        FIELDS.forEach(f => {
            nouvellesPrefs[f.cls] = document.getElementById(f.id).checked;
        });
        storage.sauvegarderPreferences(nouvellesPrefs); // ← persist préférences
        appliquerPreferences();
        filtrePopup.remove();
    });
}

const filtreBtn = document.getElementById('filtre');
if (filtreBtn) filtreBtn.addEventListener('click', filtre);


// ─── 8. NAVIGATION VERS DETAILS ──────────────────────────────

function goToDetails(nom, lat, lon) {
    localStorage.setItem('current', nom);
    localStorage.setItem('lat', lat);
    localStorage.setItem('lon', lon);
    window.location.href = "details.html";
}


// ─── 9. PAGE DETAILS ─────────────────────────────────────────

function afficherVilleDetails() {
    const nom = localStorage.getItem('current');
    const lat = localStorage.getItem('lat');
    const lon = localStorage.getItem('lon');
    if (!nom || !lat || !lon) return;

    document.getElementById('ville-nom').innerText = nom;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&timezone=auto`;
    const data = getDataSync(url);

    if (data) {
        document.getElementById('detail-icon').src = code["" + data.current.weather_code].day.image;
        document.getElementById('detail-desc').innerText = code["" + data.current.weather_code].day.description;
        document.getElementById('temp-val').innerText = Math.round(data.current.temperature_2m);
        document.getElementById('ressenti').innerText = Math.round(data.current.apparent_temperature);
        document.getElementById('humidite').innerText = data.current.relative_humidity_2m;
        document.getElementById('pluie').innerText = data.current.precipitation || 0;
    }
}

function afficherPrevisions() {
    const lat = localStorage.getItem('lat');
    const lon = localStorage.getItem('lon');
    if (!lat || !lon) return;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const data = getDataSync(url);

    if (data) {
        const previsionsDiv = document.getElementById('previsions');
        previsionsDiv.innerHTML = "";
        data.daily.time.forEach((time, i) => {
            let jourDiv = document.createElement('div');
            jourDiv.className = "jour-prevision";
            jourDiv.innerHTML = `
                <p><strong>${convertDate(time)}</strong></p>
                <img src="${code["" + data.daily.weather_code[i]].day.image}" width="40">
                <p>${code["" + data.daily.weather_code[i]].day.description}</p>
                <p>Min: ${data.daily.temperature_2m_min[i]}°C / Max: ${data.daily.temperature_2m_max[i]}°C</p>
            `;
            previsionsDiv.appendChild(jourDiv);
        });
    }
}

function afficherGraphique() {
    const lat = localStorage.getItem('lat');
    const lon = localStorage.getItem('lon');
    if (!lat || !lon) return;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&hourly=temperature_2m&timezone=auto&forecast_days=1`;
    const data = getDataSync(url);

    if (data) {
        const ctx = document.getElementById('tempChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.hourly.time.map(t => t.slice(11, 16)),
                datasets: [{
                    label: 'Température (°C)',
                    data: data.hourly.temperature_2m,
                    backgroundColor: 'rgba(106, 17, 203, 0.2)',
                    borderColor: 'rgba(106, 17, 203, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: false } }
            }
        });
    }
}


// ─── 10. LANCEMENT ───────────────────────────────────────────

const VILLE_DEFAUT = [
    { id: 1, nom: "Blois", latitude: 47.5876861, longitude: 1.3337639 }
];

if (window.location.pathname.endsWith("details.html")) {
    document.addEventListener('DOMContentLoaded', () => {
        afficherVilleDetails();
        afficherPrevisions();
        afficherGraphique();
    });
} else {
    // Page principale : restaure les villes sauvegardées et les préférences
    document.addEventListener('DOMContentLoaded', () => {

        if (storage.chargerVilles().length === 0) {
            localStorage.setItem(LS_VILLES, JSON.stringify(VILLE_DEFAUT));
        }

        storage.chargerVilles().forEach(v => {
            const ville = new Ville(v.id, v.nom, v.latitude, v.longitude);
            villes.push(ville);
            createCard(ville);
        });
        appliquerPreferences();
    });
}

// ─── 11. DEV ───────────────────────────────────────────
// --- BOUTON MES FAVORIS ---
if (document.getElementById('hamburger')) {
    document.getElementById('hamburger').addEventListener('click', () => MesFavoris());
}

function MesFavoris() {
    let menu = document.getElementById('menu-favoris');
    let favoris = JSON.parse(localStorage.getItem('favoris')) || [];
    menu.innerHTML = "";

    if (favoris.length === 0) { alert("Aucun favori."); return; }

    favoris.forEach(f => {
        let btn = document.createElement('button');
        btn.textContent = f.nom;
        btn.style = "display:block; width:100%; background:none; border:none; padding:1vh; cursor:pointer; font-size:1.5vh;";
        btn.onclick = () => {
            let ville = new Ville(villes.length + 1, f.nom, f.latitude, f.longitude);
            villes.push(ville);
            createCard(ville);
            menu.style.display = "none";
        };
        menu.appendChild(btn);
    });

    menu.style.display = menu.style.display === "none" ? "block" : "none";
};

function addFav(id) {
    const ville = villes.find(v => v.getId() === id);
    if (ville) {
        let favoris = JSON.parse(localStorage.getItem('favoris')) || [];
        if (!favoris.some(f => f.id === ville.getId())) {
            favoris.push({ id: ville.getId(), nom: ville.getNom(), latitude: ville.getLatitude(), longitude: ville.getLongitude() });
            localStorage.setItem('favoris', JSON.stringify(favoris));
            alert(ville.getNom() + " ajouté aux favoris !");
        } else {
            alert(ville.getNom() + " est déjà dans les favoris.");
        }
    }
}

function afficherPrevisions() {
    const lat = localStorage.getItem('lat');
    const lon = localStorage.getItem('lon');

    if (lat && lon) {
        let url =   `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
                +   `&hourly=temperature_2m,weather_code`
                +   `&daily=weather_code`
                +   `&timezone=auto`
                +   `&forecast_days=7`;
            let data = getDataSync(url);

        if (data) {
            let previsionsDiv = document.getElementById('previsions');
            let hausse = 0;
            baisse = 0;
            for (let i = 0; i < data.daily.weather_code.length - 1; i++) {
                if (data.daily.weather_code[i] < data.daily.weather_code[i + 1]) baisse++;
                else hausse++;
            }
            previsionsDiv.innerHTML = hausse > baisse ? "<p><strong>↑</strong> Temps à l'amélioration</p>" : "<p><strong>↓</strong> Temps à la détérioration</p>";

            // Grouper par jour
            let jours = {};
            for (let i = 0; i < data.hourly.time.length; i++) {
                let date = data.hourly.time[i].split("T")[0];
                let heure = data.hourly.time[i].split("T")[1];
                if (!jours[date]) jours[date] = [];
                jours[date].push({ heure, temp: data.hourly.temperature_2m[i], weather_code: data.hourly.weather_code[i] });
            }
            // Afficher
            let today = new Date().toISOString().split("T")[0];
            for (let date in jours) {
                if (date === today) continue;
                let jourDiv = document.createElement('div');
                jourDiv.className = "jour-prevision";

                let header = document.createElement('div');
                header.innerHTML = `<strong>${convertDate(date)}</strong>`;
                jourDiv.appendChild(header);

                let heuresDiv = document.createElement('div');

                jours[date].forEach(e => {
                    let periode = (parseInt(e.heure) >= 7 && parseInt(e.heure) < 20) ? "day" : "night";
                    let infos = code["" + e.weather_code];
                    let ligne = document.createElement('div');
                    ligne.innerHTML = `<span>${e.heure}</span> <img src="${infos[periode].image}" width="30"> <span>${infos[periode].description}</span> <span>${e.temp}°C</span>`;
                    heuresDiv.appendChild(ligne);
                });

                jourDiv.appendChild(heuresDiv);
                previsionsDiv.appendChild(jourDiv);

            };
        }
    }
}