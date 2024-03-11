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
const addPlace = function() {

	// We check if data is OK ----------------------
	const isDecimal = function(text) {
		const decimal = /^-?(0|[1-9]\d*)(\.\d+)?$/;
		return decimal.test(text);
	}
	const name = $("#name").val().trim();
	let lat = $("#lat").val().trim();
	let long = $("#long").val().trim();

	let error = false;
	let errorMsgs = {
	};

	// The name must be filled
	if (!name) {
		$("#name").addClass('error')
		error = true;
		errorMsgs.name = "le nom est obligatoire";
	}
	else {
		$("#name").removeClass('error');
	}

	// The lat must be filled, decimal and between -90 and 90
	if (!lat) {
		$("#lat").addClass('error');
		error = true;
	}
	else {
		if (isDecimal(lat)) {
			lat = parseFloat(lat);
			if (lat >= -90 && lat <= 90) {
				$("#lat").removeClass('error');
			}
			else {
				$("#lat").addClass('error');
				error = true;
			}
		}
		else {
			$("#lat").addClass('error');
			error = true;
		}
	}

	// The long must be filled, decimal and between -180 and 180
	if (!long) {
		$("#long").addClass('error');
		error = true;
	}
	else {
		if (isDecimal(long)) {
			long = parseFloat(long);
			if (long >= -180 && long <= 180) {
				$("#long").removeClass('error');
			}
			else {
				$("#long").addClass('error');
				error = true;
			}
		}
		else {
			$("#long").addClass('error');
			error = true;
		}
	}

	// We check if everything is ok ----------------
	if (!error) {
		// Data is ok, we save and display -----------
		KAI.config.cities.push({
			location: 					String(lat) + ',' + String(long),
			choiceList_label: 	name,
			choiceList_type:		"BOOLEAN"
		});
		citiesList.currentIndex = citiesList.list.length -1;
		// We save the configuration -----------------
		KAI.SD.saveConfig();
		// We clear the form -------------------------
		$("#name").val('');
		$("#lat").val('');
		$("#long").val('');
		// We display a message and go to meteo_page1
		KAI.toastr.info("Nouveau lieu ajouté");
		KAI.newState('meteo_page1');
	}
	else {
		KAI.toastr.warning("Merci de bien remplir correctement tous les champs")
	}
}

const getCurrentPosition = function() {
	KAI.spinner.on("Attente de la position GPS actuelle...");
	that = this;
	window.navigator.geolocation.getCurrentPosition(
		function(position) {
			KAI.spinner.off();
			if (position.coords.accuracy < 50) {
				$("#lat").val(position.coords.latitude);
				$("#long").val(position.coords.longitude);
			}
			else {
				KAI.toastr.warning("Position GPS imprécise, réessayer avec une meilleur couverture satellite")
			}
			console.log(position);
		},
		function(error) {
			KAI.spinner.off();
			KAI.toastr.warning("Erreur GPS : " + error.message);
		}
	);
};


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
			forecastData = [];
			$("#meteo_page1_data").html('météo non disponible');
	    $("#meteo_page2_data").html('météo non disponible');
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
    'div#addPlace': false,
    'div#actions': false
  },
  afterStateChange : function() {
		displayMeteoForSelectedCity();
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
		'keyup.Enter': function(event) {
			KAI.newState('addPlace');
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
    'div#addPlace': false,
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
		'keyup.Enter': function(event) {
			KAI.newState('addPlace');
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
KAI.addState("addPlace", {
  softKeys : {fr : [
		'GPS',
		'annuler',
		'ajouter'
	]},
  display : {
		'div#meteo' : false,
    'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': false,
    'div#addPlace': true,
    'div#actions': false
  },
  afterStateChange : function() {
    // After 200 ms we select the name input field
    setTimeout(() => {
      document.getElementById("name").select();
    }, 200);
  },
	events : {
		'keyup.ArrowUp': function(event) {
			const previousToFocusList = $(event.target).prevAll('.focusable');
			if (previousToFocusList.length >= 1) {
				// We select the previous input class if not first
				previousToFocusList.first().select();
			}
			else {
				// We select the last input
				$('.focusable').last().select();
			}
		},
		'keyup.ArrowDown': function(event) {
			const nextToFocusList = $(event.target).nextAll('.focusable');
			if (nextToFocusList.length >= 1) {
				// We select the next input class if not last
				nextToFocusList.first().select();
			}
			else {
				// We select the first input
				$('.focusable').first().select();
			}
		},
		'keyup.SoftLeft': function(event) {
			getCurrentPosition();
		},
		'keyup.Enter': function(event) {
			KAI.newState('meteo_page1');
		},
    'keyup.SoftRight': function(event) {
			addPlace();
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
			appVersion: 					"V1.0.1",
			lang: 								'fr',
			appTitleBackgroundColor:"#FF4B00",
	    appTitleColor:          "#FFFFFF",
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
			KAI.newState('meteo_page1');
	  }
	});

	console.log("app.js launched");
};
console.log("app.js loaded");
