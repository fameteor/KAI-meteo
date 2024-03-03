let displayDateLabel = function(day,month,year) {
  const monthsLabels = [
  	"unused",
  	"janvier",
  	"février",
  	"mars",
  	"avril",
  	"mai",
  	"juin",
  	"juillet",
  	"août",
  	"septembre",
  	"octobre",
  	"novembre",
  	"décembre"
  ]
  const daysLabels = [
  	"Dimanche",
  	"Lundi",
  	"Mardi",
  	"Mercredi",
  	"Jeudi",
  	"Vendredi",
  	"Samedi"
  ]
	const date = new Date(year,month - 1,day);
	const dateLabel = 	daysLabels[date.getDay()]
    + " "
    + day
		+ " "
		+ monthsLabels[month]
		+ " "
		+ year
	return dateLabel;
}




// ----------------------------------------------------
// pons_getTranslations(word,dictionnary)
// Get the translations from corresponding word in that PONS dictionnary
// ----------------------------------------------------

function meteo_getData(location) {
  return new Promise(function (resolve, reject) {
    // If the browser access to Internet --------------
    if (navigator.onLine) {
      // We build the url -----------------------------
	    const url = "https://www.infoclimat.fr/public-api/gfs/json?_ll="
				+ encodeURIComponent(location)
				+ "&_auth=" + encodeURIComponent(key)
				+ "&_c=" + encodeURIComponent(code);
  		// We create the XHR request for cross domain----
      const xhr = new XMLHttpRequest({ mozSystem: true });
      xhr.open("GET", url);
  		xhr.timeout = 10000; // 10 seconds timeout
      // When response OK -----------------------------
      xhr.onload = function () {
        if (xhr.status === 200) {
          // Parse to JSON
          console.log("- Text response :");
          console.log(xhr.response);
          try {
              let jsonResponse = JSON.parse(xhr.response);
              // Log and return the data
              console.log("- Raw JSON response :");
              console.log(jsonResponse);
              const formattedData = meteo_formatData(jsonResponse);
              console.log("- Formatted JSON response :");
              console.log(formattedData);
              resolve(formattedData);
          } catch (e) {
              console.log("La réponse du serveur n'est pas au format JSON : " + e);
              reject({
                status: null,
                statusText: "La réponse du serveur n'est pas au format JSON"
              });
          }
        }
        else {
          reject({
            status: xhr.status,
            statusText: "Pas de météo (" + xhr.status +  " " + xhr.statusText + ")"
          });
        }
      };
      // When timeout ---------------------------------
      xhr.ontimeout = function () {
        reject({
          status: null,
          statusText: "Pas de météo: aucune réponse du serveur"
        });
      };
      // When response ERROR --------------------------
      xhr.onerror = function () {
        reject({
          status: xhr.status,
          statusText: "Pas de météo (" + xhr.status +  " " + xhr.statusText + ")"
        });
      };
      // We send the request --------------------------
      xhr.send();
      KAI.spinner.on("Recherche en cours...");
      console.log("HTTP request sent to : " + url);
    }
    else {
      reject({
        status: null,
        statusText: "Pas d'accès réseau, vérifier que les données mobiles ou le wifi sont autorisés"
      });
    }
  });
}



// ----------------------------------------------------
// adaptDataStructure to the following format :
/*
[
  {
      day:
      month:
      year:
      timesStructure: [
        {
          hour:
          forecast:
        },
        {
          ...
        }
      ]
  },
  {
    ...
  }
]
*/
// ----------------------------------------------------
const meteo_formatData = function(response) {
  // We filter the properties corresponding at the forecast datesStructure
	datesStructure  = [];
	Object.keys(response).forEach(function(key) {
    // We filter the properties corresponding to dates like "2024-02-28 20:00:00"
		if (/^\d\d\d\d-\d\d-\d\d \d\d\:\d\d\:\d\d/.test(key)) {
			// We change the key label
			const year = parseInt(key.substr(0,4));
			const month = parseInt(key.substr(5,2));
			const day = parseInt(key.substr(8,2));
			const hour = parseInt(key.substr(11,2));

      let timesStructure = {};
      // We format the forecast data
      timesStructure.hour = hour;
      timesStructure.temperature = Math.round((response[key].temperature["2m"]) - 273.16);
      timesStructure.rain = response[key].pluie;
      timesStructure.meanWind = Math.round(response[key].vent_moyen["10m"]);
      timesStructure.maxWind = Math.round(response[key].vent_rafales["10m"]);
      timesStructure.windDirection = response[key].vent_direction["10m"] % 360;
      timesStructure.humidity = Math.round(response[key].humidite["2m"]);
			timesStructure.pressure = Math.round(response[key].pression["niveau_de_la_mer"]/100);
		  timesStructure.cloudiness= response[key].nebulosite.totale;
      if (response[key].risque_neige ==="non")       timesStructure.snowRisk = false;
      if (response[key].risque_neige ==="oui")       timesStructure.snowRisk = true;
      // We look for the relevant cloudIcon
      let cloudIcon ='';
			if (response[key].nebulosite.totale < 25) {
				if (response[key].pluie === 0)		         cloudIcon = 'sun.png';
					else if (response[key].pluie < 3)		   cloudIcon = 'sunPartialSmallRain.png';
						else if (response[key].pluie < 6)		 cloudIcon = 'sunPartialMiddleRain.png';
							else										           cloudIcon = 'sunPartialBigRain.png';
			}
			else if (response[key].nebulosite.totale < 76)	{
					if (response[key].pluie === 0)				   cloudIcon = 'sunPartial.png';
					else if (response[key].pluie < 3)       cloudIcon = 'sunPartialSmallRain.png';
						else if (response[key].pluie < 6)     cloudIcon = 'sunPartialMiddleRain.png';
							else										           cloudIcon = 'sunPartialBigRain.png';
				}
				else if (response[key].pluie === 0)			 cloudIcon = 'cloud.png';
					else if (response[key].pluie < 3)			 cloudIcon = 'smallRain.png';
						else if (response[key].pluie < 6)		 cloudIcon = 'middleRain.png';
							else										           cloudIcon = 'bigRain.png';
			timesStructure.cloudIcon = cloudIcon;
      // We look for the color class for wind
			if(timesStructure.meanWind < 50) 		        timesStructure.windClass = 'wGreen';
			else if (timesStructure.meanWind < 90)	    timesStructure.windClass = 'wOrange';
				else			                        timesStructure.windClass = 'wRed';
			if(timesStructure.maxWind < 50) 		        timesStructure.windMaxClass = 'wGreen';
			else if (timesStructure.maxWind < 90)	      timesStructure.windMaxClass = 'wOrange';
				else				                      timesStructure.windMaxClass = 'wRed';
			// We check if that date already exists in the datesStructure
			let thisDateExists = false;
			let thisDateIndex = null;
			datesStructure.forEach(function(date, index) {
				if (	date.day === day
						&& date.month === month
						&& date.year === year) {
					thisDateExists = true;
					thisDateIndex = index;
				}
			});
			if (thisDateExists) {
				datesStructure[thisDateIndex].timesStructure.push(timesStructure);
			}
			else {
        // If it is not a past day
        const dateForCurrentForecast = new Date(year,month - 1,day);
        const now = new Date();
        const today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
        if (dateForCurrentForecast.getTime() >= today.getTime()) {
    			// We add the date and push the forecast for that time
    			let date = {"day":day,"month":month,"year":year,dateLabel:displayDateLabel(day,month,year),"timesStructure":[]};
    			date.timesStructure.push(timesStructure);
				datesStructure.push(date);
      }
			}
		}
	});
  return datesStructure;
}

// ----------------------------------------------------
// meteo_render(forecastData)
/*
forecastData has the following structure :
[
  {
    "day":29,
    "month":2,
    "year":2024,
    "dateLabel":"Jeudi 29 février 2024",
    "timesStructure": [
      {
        "hour":"10",
        "temperature":7,
        "rain":0,
        "meanWind":3,
        "maxWind":4,
        "humidity":86,
        "pressure":1019,
        "cloudiness":100,
        "snowRisk":false,
        "cloudIcon":"cloud.png",
        "windClass":"wGreen",
        "windMaxClass":"wGreen"
      },
      ...
    ]
  },
  ...
]

*/
// ----------------------------------------------------
const meteo_render = function(forecastData) {
  // We built the mustache template
  const template_page1 = `
    {{#.}}
      <div class="row">
  				<div class="cell">{{hour}}h</div>
          <div class="cell"><img src="myApp/icons/{{cloudIcon}}" style="height:70%;width:70%;"/></div>
          <div class="cellData t{{temperature}}">{{temperature}}<small> °C</small></div>
          <div class="cell" style="text-align:right;">{{rain}}<small> mm</small></div>
          <div class="cell"><span class="{{windClass}}">{{meanWind}}</span>/<small><span class="{{windMaxClass}}">{{maxWind}}</span> km/h</small></div>
      </div>
    {{/.}}
  `;
  const template_page2 = `
    <div class="row">
      <div class="cell"></div>
      <div class="cell"><small>hum.</small></div>
      <div class="cell"><small>pression</small></div>
      <div class="cell"><small>neb.</small></div>
      <div class="cell"><small>vent</small></div>
      <div class="cell"></div>
    </div>
    {{#.}}
      <div class="row">
  		  <div class="cell">{{hour}}h</div>
  			<div class="cell">{{humidity}}<small> %</small></div>
  			<div class="cell">{{pressure}}<small> hPa</small></div>
  			<div class="cell">{{cloudiness}}<small>%</small></div>
        <div class="cell">{{windDirection}}<small>°</small></div>
        <div class="cell">
          {{#snowRisk}}<i class="fas fa-snowflake"></i>{{/snowRisk}}
        </div>
  	  </div>
    {{/.}}`
  // We apply data to it if available
  if (forecastData[dayIndex] && forecastData[dayIndex].timesStructure) {
    // const html = mustache.render(template_page1,forecastData[dayIndex].timesStructure);
    $("#meteo_page1_data").html(mustache.render(template_page1,forecastData[dayIndex].timesStructure));
    $("#meteo_page2_data").html(mustache.render(template_page2,forecastData[dayIndex].timesStructure));
    $("#dateLabel").html(forecastData[dayIndex].dateLabel);
  };
}
