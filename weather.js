const hour = document.querySelector(".hour-cont");
const currIcon = document.querySelector(".icon img");
const mainTemp = document.querySelector(".tempval").querySelector("h1");
const mainLoc = document.querySelector(".loc p");
const mainCon = document.querySelector(".condition h2");
const mainProb = document.querySelector("#prec .val p");
const mainHum = document.querySelector("#humidity .val p");
const mainWind = document.querySelector("#wind .val p");
const input = document.querySelector(".search input");
const btn = document.querySelector(".sform button");

hour.addEventListener("wheel", (e) => {
	// e.preventDefault();
	hour.scrollLeft += e.deltaY;
});

const iconCode = {
	sun: [0],
	cloudy: [1, 2],
	cloud: [3],
	fog: [45, 48],
	drizzle: [51, 53, 55, 56, 57],
	rain: [61, 63, 65, 66, 67],
	shower: [80, 81, 82],
	snowy: [71, 73, 75],
	snowflake: [77],
	snowshower: [85, 86],
	storm: [95],
	stormah: [96, 99],
};

const weatherCode = {
	0: "Clear Sky",
	1: "Mainly Clear",
	2: "Partly Cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Fog",
	51: "Light Drizzle",
	56: "Light Drizzle",
	53: "Drizzle",
	55: "Drizzle",
	57: "Drizzle",
	61: "Slight Rain",
	66: "Slight Rain",
	63: "Rain",
	65: "Rain",
	67: "Rain",
	71: "Snowfall",
	73: "Snowfall",
	75: "Snowfall",
	77: "Snowfall",
	82: "Showers",
	80: "Showers",
	81: "Showers",
	85: "Snow Shower",
	86: "Snow Shower",
	95: "Thunderstorm",
	96: "Thunderstorm & Hail",
	99: "Thunderstorm & Hail",
};

// const changeIcon = (imgadd, code) => {
// 	for (const [icon, codes] of Object.entries(iconCode)) {
// 		if (codes.includes(code)) {
// 			imgadd.src = `icon/${icon}.png`;
// 		}
// 	}
// };
const changeIcon = (code) => {
	for (const [icon, codes] of Object.entries(iconCode)) {
		if (codes.includes(code)) {
			return `icon/${icon}.png`;
		}
	}
};

// let codeq = Number(prompt());
// changeIcon(currIcon, 77);s

const changeMainData = (data) => {
	mainTemp.textContent = `${Math.round(data.current.temperature_2m)} \u00b0C`;
	// mainLoc.textContent = `${loc}`;
	mainCon.textContent = `${weatherCode[data.current.weather_code]}`;
	// mainProb.textContent = `${prob}%`;
	mainHum.textContent = `${data.current.relative_humidity_2m}%`;
	mainWind.textContent = `${data.current.wind_speed_10m}`;
	let add = changeIcon(data.current.weather_code);
	currIcon.src = add;
	document.querySelector(".showWeather").style.display = "block";
};

// const loc = "Punjab";
// changeMainData(339, `${loc}`, 81, 33, 89, 1);

const hourlyData = (data) => {
	// const hourCont = document.querySelector(".hour-cont");
	// const hourImg = document.querySelector(".hour-card img");
	hour.innerHTML = "";
	const currTime = data.current.time;
	const startIdx = data.hourly.time.findIndex((time) => {
		return time >= currTime;
	});
	mainProb.textContent = `${data.hourly.precipitation_probability[startIdx]}%`;
	for (let i = startIdx; i < startIdx + 12; i++) {
		const card = document.createElement("div");
		card.classList.add("hour-card");
		card.innerHTML = `
		<h6>${data.hourly.time[i].substring(11, 16)}</h6>
		<img src="${changeIcon(data.hourly.weather_code[i])}" alt="sun" />
		<p class="hour-temp">${Math.round(data.hourly.temperature_2m[i])} &degC</p>
		<p class="h-prob">
		<i class="fa-solid fa-umbrella"></i>
		${data.hourly.precipitation_probability[i]}
		</p>
		`;
		hour.appendChild(card);
	}
};
// hourlyData();

const dailyData = (data) => {
	const dailyCont = document.querySelector(".daily-cont ul");
	// const dailyImg = document.querySelector(".con img");
	dailyCont.innerHTML = "";
	for (let i = 0; i < 7; i++) {
		const list = document.createElement("li");
		list.innerHTML = `
		<p class="date">${data.daily.time[i].substring(5)}</p>
		<div class="con">
			<img src="${changeIcon(data.daily.weather_code[i])}" alt="cloudy" />
			${weatherCode[data.daily.weather_code[i]]}
			</div>
		<div class="min-max">${Math.round(data.daily.temperature_2m_min[i])} &deg &nbsp /&nbsp ${Math.round(data.daily.temperature_2m_max[i])} &deg</div>
		`;
		dailyCont.appendChild(list);
	}
};

// dailyData();

const locOptions = (cityData) => {
	const optBox = document.querySelector(".search-result");
	optBox.innerHTML = "";
	for (let i = 0; i < cityData.results.length; i++) {
		const options = document.createElement("li");
		options.innerHTML = `
		<i class="fa-solid fa-location-dot"></i>
		${cityData.results[i].name} , ${cityData.results[i].admin2 ? cityData.results[i].admin2 + "," : ""} ${cityData.results[i].country}
		`;
		optBox.appendChild(options);
		options.addEventListener("click", () => {
			console.log(i);
			// return i;
			const lat = cityData.results[i].latitude;
			const long = cityData.results[i].longitude;
			getData(lat, long);
			// console.log(`${lat} and ${long}`);
			input.value = `${cityData.results[i].name}`;
			mainLoc.textContent = `${cityData.results[i].name}`;
			optBox.style.display = "none";
		});
	}
	optBox.style.display = "block";
	if (optBox.style.display == "block") {
		document.addEventListener("click", (e) => {
			if (!e.target.closest(".search-result" && e.target !== input)) {
				optBox.style.display = "none";
			}
		});
	}
};

// const options = document.querySelectorAll(".search-result li");

// locOptions();

btn.addEventListener("click", (e) => {
	e.preventDefault();
	searchCity();
});

const searchCity = async () => {
	let inputVal = input.value;
	console.log(inputVal);
	const url = `https://geocoding-api.open-meteo.com/v1/search?name=${inputVal}&count=5&language=en&format=json`;
	let response = await fetch(url);
	let cityData = await response.json();
	console.log(cityData);
	// console.log(cityData.results[0].admin2);
	locOptions(cityData);
	// console.log(selectedCity);
};

const getData = async (lat, long) => {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code,precipitation_probability&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
	let result = await fetch(url);
	let data = await result.json();
	console.log(data);

	changeMainData(data);
	hourlyData(data);
	dailyData(data);
};
