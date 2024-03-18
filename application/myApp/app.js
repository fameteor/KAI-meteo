// Variables initialisation ----------------------
let forecastData = [];
let dayIndex = 0;
const citiesListOptions = {
	"selectedItemIdPrefix" : 		"citiesListOptions",
	"targetDomSelector" : 			"#editPlaces"
};

let citiesList = {};

// Actions choiceList definition -----------------
const actions = [
	{
		nextState:"meteo_page1",
		choiceList_label:"voir la météo là",
		choiceList_type:"MENU"
	},
	{
		nextState:"addPlaceBefore",
		choiceList_label:"ajouter un lieu avant",
		choiceList_type:"MENU"
	},
	{
		nextState:"addPlaceAfter",
		choiceList_label:"ajouter un lieu après",
		choiceList_type:"MENU"
	},
	{
		nextState:"modifyPlace",
		choiceList_label:"modifier le lieu",
		choiceList_type:"MENU"
	},
	{
		nextState:"deletePlace",
		choiceList_label:"supprimer le lieu",
		choiceList_type:"MENU"
	}
];
const actionsListOptions = {
	"selectedItemIdPrefix" : 		"actionsListOptions",
	"targetDomSelector" : 			"#actions"
};
let actionsList = new KAI.choiceList(actions,actionsListOptions);

// Global functions ------------------------------
const clearForm = function() {
	// We clear the input fields
	$("#name").val("").removeClass('error');
	$("#lat").val("").removeClass('error');
	$("#long").val("").removeClass('error');
}

const getAndCheckData = function() {
	// We check if data is OK ----------------------
	const isDecimal = function(text) {
		const decimal = /^-?(0|[1-9]\d*)(\.\d+)?$/;
		return decimal.test(text);
	};
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
	return {
		error:error,
		name:name,
		lat:lat,
		long:long
	}
};

const addPlace = function(position) { // position 0 : before, position 1 : after)
	// We check if everything is ok ----------------
	const data = getAndCheckData();
	console.log(data);
	if (!data.error) {
		// Data is ok, we save and display -----------
		KAI.config.cities.splice(
			citiesList.currentIndex + position,
			0,
			{
			location: 					String(data.lat) + ',' + String(data.long),
			choiceList_label: 	data.name,
			choiceList_type:		"MENU"
			}
		);
		// We put the index on this insertedelement
		citiesList.currentIndex = citiesList.currentIndex + position;
		// We save the configuration -----------------
		KAI.SD.saveConfig();
		// We clear the form -------------------------
		clearForm();
		// We display a message and go to meteo_page1
		KAI.toastr.info("Nouveau lieu ajouté");
		KAI.newState('meteo_page1');
	}
	else {
		KAI.toastr.warning("Merci de bien remplir correctement tous les champs")
	}
}

const modifyPlace = function() {
	// We check if everything is ok ----------------
	const data = getAndCheckData();
	console.log(data);
	if (!data.error) {
		// We modify the placeList ---------------------
		const modifiedPlace = {
			location: 					String(data.lat) + ',' + String(data.long),
			choiceList_label: 	data.name,
			choiceList_type:		"MENU"
		};
		KAI.config.cities[citiesList.currentIndex] = modifiedPlace;
		// We save the configuration -------------------
		KAI.SD.saveConfig();
		// We clear the form ---------------------------
		clearForm();
		// We display a message and go to meteo_page1
		KAI.toastr.info("Lieu modifié");
		KAI.newState('meteo_page1');
	}
	else {
		KAI.toastr.warning("Merci de bien remplir correctement tous les champs")
	}
}

const deletePlace = function() {
	// We delete the placeList ---------------------
	KAI.config.cities.splice(citiesList.currentIndex, 1) ;
	// We change the current place displayed -------
	citiesList.currentIndex = 1;
	// We save the configuration -------------------
	KAI.SD.saveConfig();
	// We clear the form ---------------------------
	clearForm();
	// We display a message and go to meteo_page1
	KAI.toastr.info("Lieu supprimé");
	KAI.newState('meteo_page1');
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

const previousDay = function() {
	if (dayIndex !== 0)  dayIndex -=1;
}

const displayMeteoForSelectedCity = function() {
	// Displays the title
	KAI.renderAppTitle();
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

// softLeftLabel --------------------
const softLeftLabel = function() {
	if (dayIndex === 0) return '';
	else 								return '<i class="fas fa-chevron-left"></i> date'
}

// softRightLabel -------------------
const softRightLabel = function() {
	if (dayIndex === (forecastData.length -1)) return '';
	else 								return 'date <i class="fas fa-chevron-right"></i>'
}


// States meteo_page1 ----------------------------
KAI.addState("meteo_page1", {
	options : {
		appTitle : function() {
			return ("Météo - " + citiesList.currentItem().choiceList_label);
		}
	},
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
		'div#editPlaces': false,
		'div#actions': false,
    'div#addOrModifyPlace': false,
		'div#deletePlace': false
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
			KAI.newState('editPlaces');
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

// States meteo_page2 ----------------------------
KAI.addState("meteo_page2", {
	options : {
		appTitle : function() {
			return ("Météo - " + citiesList.currentItem().choiceList_label);
		}
	},
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
		'div#editPlaces': false,
		'div#actions': false,
    'div#addOrModifyPlace': false,
		'div#deletePlace': false
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
			KAI.newState('editPlaces');
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

// States editPlaces -----------------------------
KAI.addState("editPlaces", {
	options : {
		appTitle : "Météo - liste des lieux"
	},
  softKeys : {fr : [
		'annuler',
		'actions',
		''
	]},
  display : {
		'div#meteo' : false,
    'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': false,
    'div#editPlaces': true,
		'div#actions': false,
		'div#addOrModifyPlace': false,
		'div#deletePlace': false
  },
  afterStateChange : function() {
		citiesList.generateHtml();
		/*
    // After 200 ms we select the name input field
    setTimeout(() => {
      document.getElementById("name").select();
    }, 200);
		*/
  },
	events : {
		'keyup.ArrowUp': function(event) {
			citiesList.previous();
		},
		'keyup.ArrowDown': function(event) {
			citiesList.next();
		},
		'keyup.SoftLeft': function(event) {
			KAI.newState('meteo_page1');
		},
		'keyup.Enter': function(event) {
			KAI.newState('actions');
		},
    'keyup.SoftRight': function(event) {

		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// States meteo_page2 ----------------------------
KAI.addState("actions", {
	options : {
		appTitle : function() {
			return ("actions " + citiesList.currentItem().choiceList_label);
		}
	},
  softKeys : {fr : [
		'annuler',
		'choisir',
		''
	]},
  display : {
		'div#meteo' : false,
    'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': false,
    'div#editPlaces': false,
		'div#actions': true,
		'div#addOrModifyPlace': false,
		'div#deletePlace': false
  },
  afterStateChange : function() {
		actionsList.generateHtml();
		/*
    // After 200 ms we select the name input field
    setTimeout(() => {
      document.getElementById("name").select();
    }, 200);
		*/
  },
	events : {
		'keyup.ArrowUp': function(event) {
			actionsList.previous();
		},
		'keyup.ArrowDown': function(event) {
			actionsList.next();
		},
		'keyup.SoftLeft': function(event) {
			KAI.newState('editPlaces');
		},
		'keyup.Enter': function(event) {
			KAI.newState(actionsList.currentItem().nextState);
		},
    'keyup.SoftRight': function(event) {

		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// State addPlaceBefore --------------------------
KAI.addState("addPlaceBefore", {
	options : {
		appTitle : function() {
			return ("+ avant " + citiesList.currentItem().choiceList_label);
		}
	},
  softKeys : {fr : [
		'GPS ici',
		'annuler',
		'ajouter'
	]},
  display : {
		'div#meteo' : false,
    'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': false,
		'div#editPlaces': false,
		'div#actions': false,
    'div#addOrModifyPlace': true,
		'div#deletePlace': false
  },
  afterStateChange : function() {
		// We clear the form fields
		clearForm();
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
			KAI.newState('actions');
		},
    'keyup.SoftRight': function(event) {
			addPlace(0);
		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// State addPlaceAfter ---------------------------
KAI.addState("addPlaceAfter", {
	options : {
		appTitle : function() {
			return ("+ après " + citiesList.currentItem().choiceList_label);
		}
	},
  softKeys : {fr : [
		'GPS ici',
		'annuler',
		'ajouter'
	]},
  display : {
		'div#meteo' : false,
    'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': false,
		'div#editPlaces': false,
		'div#actions': false,
    'div#addOrModifyPlace': true,
		'div#deletePlace': false
  },
  afterStateChange : function() {
		// We clear the form fields
		clearForm();
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
			KAI.newState('actions');
		},
    'keyup.SoftRight': function(event) {
			addPlace(1);
		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// State modifyPlace -----------------------------
KAI.addState("modifyPlace", {
	options : {
		appTitle : function() {
			return ("modifier " + citiesList.currentItem().choiceList_label);
		}
	},
  softKeys : {fr : [
		'GPS ici',
		'annuler',
		'modifier'
	]},
  display : {
		'div#meteo' : false,
    'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': false,
		'div#editPlaces': false,
		'div#actions': false,
    'div#addOrModifyPlace': true,
		'div#deletePlace': false
  },
  afterStateChange : function() {
		// We set the fields with the current place values
		const coords = citiesList.currentItem().location.split(",");
		$("#name").val(citiesList.currentItem().choiceList_label).removeClass('error');
		$("#lat").val(coords[0]).removeClass('error');
		$("#long").val(coords[1]).removeClass('error');
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
			KAI.newState('actions');
		},
    'keyup.SoftRight': function(event) {
			modifyPlace();
		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// State deletePlace -----------------------------
KAI.addState("deletePlace", {
	options : {
		appTitle : function() {
			return ("supprimer " + citiesList.currentItem().choiceList_label);
		}
	},
  softKeys : {fr : [
		' ',
		'annuler',
		'supprimer'
	]},
  display : {
		'div#meteo' : false,
    'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': false,
		'div#editPlaces': false,
		'div#actions': false,
    'div#addOrModifyPlace': false,
    'div#deletePlace': true
  },
  afterStateChange : function() {
		// We display the deletion warning message
  },
	events : {
		'keyup.ArrowUp': function(event) {

		},
		'keyup.ArrowDown': function(event) {

		},
		'keyup.SoftLeft': function(event) {
			getCurrentPosition();
		},
		'keyup.Enter': function(event) {
			KAI.newState('actions');
		},
    'keyup.SoftRight': function(event) {
			deletePlace();
		},
    'window.focus': function(event) {
      KAI.warmStart();
		}
	}
});

// APP config and start --------------------------
window.onload = function() {
	KAI.init({
	  options: {
			appTitle: 						"Météo",
			appVersion: 					"V1.0.3",
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
					choiceList_type:"MENU"
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
