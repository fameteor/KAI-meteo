// Variables initialisation ----------------------
let forecastData = [];
let dayIndex = 0;
let citiesListOptions = {
	"selectedItemIdPrefix" : 		"citiesListOptions",
	"targetDomSelector" : 			"#citiesList"
}

let citiesList = {};

// -----------------------------------------------
// Global functions
// -----------------------------------------------
const nextDay = function() {
	if (dayIndex < (forecastData.length -1)) dayIndex +=1;
}

// -----------------------------------------------
const previousDay = function() {
	if (dayIndex !== 0)  dayIndex -=1;
}

// -----------------------------------------------
const displayMeteoForSelectedCity = function() {
	// Change the application title
	KAI.setAppTitle("Météo " + citiesList.currentItem().choiceList_label);
	// Get the meteo and display it
	meteo_getData(citiesList.currentItem().location)
    .then(function (response) {
      // We stop the spinner
      KAI.spinner.off();
			forecastData = response;
			// We display the data
			meteo_render(forecastData);
    })
    .catch(function (err) {
      // We stop the spinner and display the error
      KAI.spinner.off();
      KAI.toastr.warning(err.statusText);
			console.log(err.statusText);
    });
}

// softLeftLabel
// -----------------------------------------------
const softLeftLabel = function() {
	if (dayIndex === 0) return '';
	else 								return '<i class="fas fa-chevron-left"></i> date'
}

// softRightLabel
// -----------------------------------------------
const softRightLabel = function() {
	if (dayIndex === (forecastData.length -1)) return '';
	else 								return 'date <i class="fas fa-chevron-right"></i>'
}


// -----------------------------------------------
// States meteo_page1
// -----------------------------------------------
KAI.addState("meteo_page1", {
  softKeys : {fr : [
		softLeftLabel,
		'<i class="fas fa-chevron-circle-left"></i> ville <i class="fas fa-chevron-circle-right"></i>',
		softRightLabel
	]},
  display : {
		'div#meteo' : true,
    'div#meteo_page1' : true,
		'div#meteo_page2' : false,
    'div#citiesList': false,
    'div#addCity': false,
    'div#actions': false
  },
  afterStateChange : function() {

		/*
    dictionnaries.generateHtml();
    // After 200 ms we select the searchWord input field
    setTimeout(() => {
      document.getElementById("searchWord").select();
    }, 200);
		*/
  },
	events : {
		'keyup.ArrowDown': function(event) {
			KAI.newState('meteo_page2');
		},
		'keyup.ArrowLeft': function(event) {
			// We select the previous city and display the title
			citiesList.previous();
			displayMeteoForSelectedCity();
		},
		'keyup.ArrowRight': function(event) {
			// We select the next city and display the title
			citiesList.next();
			displayMeteoForSelectedCity();
		},
		'keyup.SoftLeft': function(event) {
			previousDay();
			KAI.renderSoftKeys();
			meteo_render(forecastData);
		},
    'keyup.SoftRight': function(event) {
			nextDay();
			KAI.renderSoftKeys();
			meteo_render(forecastData);
		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// -----------------------------------------------
// States meteo_page2
// -----------------------------------------------
KAI.addState("meteo_page2", {
  softKeys : {fr : [
		softLeftLabel,
		'<i class="fas fa-chevron-circle-left"></i> ville <i class="fas fa-chevron-circle-right"></i>',
		softRightLabel
	]},
  display : {
		'div#meteo' : true,
    'div#meteo_page1' : false,
		'div#meteo_page2' : true,
    'div#citiesList': false,
    'div#addCity': false,
    'div#actions': false
  },
  afterStateChange : function() {
		/*
    dictionnaries.generateHtml();
    // After 200 ms we select the searchWord input field
    setTimeout(() => {
      document.getElementById("searchWord").select();
    }, 200);
		*/
  },
	events : {
		'keyup.ArrowUp': function(event) {
			KAI.newState('meteo_page1');
		},
		'keyup.ArrowLeft': function(event) {
			// We select the previous city and display the title
			citiesList.previous();
			displayMeteoForSelectedCity();
		},
		'keyup.ArrowRight': function(event) {
			// We select the next city and display the title
			citiesList.next();
			displayMeteoForSelectedCity();
		},
		'keyup.SoftLeft': function(event) {
			previousDay();
			KAI.renderSoftKeys();
			meteo_render(forecastData);
		},
    'keyup.SoftRight': function(event) {
			nextDay();
			KAI.renderSoftKeys();
			meteo_render(forecastData);
		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// -----------------------------------------------
// APP config and start
// -----------------------------------------------
window.onload = function() {
	KAI.init({
	  options: {
			appTitle: 						"Météo",
			appVersion: 					"V1.0.0",
			lang: 								'fr',
			loadConfigFromSD: 		true,				// Compulsory : Boolean
		  configFilePath: 			"/sdcard1/apps/meteo/config.json",	// Compulsory if loadConfigFromSD true
		},
		defaultConfig: {					// No function, must be JSON.stringable
			cities: [
				{
					location:"46.8192286,-1.995014",
					choiceList_label:"au Perrier",
					choiceList_type:"BOOLEAN"
				},
			]
	  },
		coldStart: function() {
			// Here config is loaded (config.loadError object available)
			if (KAI.configLoadError) {
				KAI.toastr.warning("Impossible de lire la config sur la carte SD")
				// We start with default values
				citiesList = new KAI.choiceList(KAI.config.cities,citiesListOptions);
				console.log("citiesList intialized");
				KAI.warmStart();
			}
			else {
				citiesList = new KAI.choiceList(KAI.config.cities,citiesListOptions);
				console.log("citiesList intialized");
				KAI.warmStart();
			}

			console.log("coldStart done")
	  },
	  warmStart: function() {
			// Here config is loaded
			// We come back to the first day (today)
			dayIndex = 0;
			displayMeteoForSelectedCity();
			KAI.newState('meteo_page1');
	  }
	});

	console.log("app.js launched");
};
console.log("app.js loaded");
