// Variables initialisation ----------------------
let forecastData = [];
let dayIndex = 0;

// -----------------------------------------------
// Global functions
// -----------------------------------------------
const displayMeteoForSelectedCity = function() {
	// Change the application title
	KAI.setAppTitle("Météo " + citiesList.currentItem().choiceList_label);
	// Get the meteo and display it
	meteor_getData(citiesList.currentItem().location)
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


// -----------------------------------------------
// States meteo_page1
// -----------------------------------------------
KAI.addState("meteo_page1", {
  softKeys : {fr : ['< date','< ville >','date >']},
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

		},
		'keyup.Enter': function(event) {
      KAI.newState('citiesList');
		},
    'keyup.SoftRight': function(event) {

		},
    'window.focus': function(event) {
      KAI.toastr.info('démarrage');
		}
	}
});

// -----------------------------------------------
// States meteo_page2
// -----------------------------------------------
KAI.addState("meteo_page2", {
  softKeys : {fr : ['< date','< ville >','date >']},
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

		},
		'keyup.Enter': function(event) {
      KAI.newState('citiesList');
		},
    'keyup.SoftRight': function(event) {

		},
    'window.focus': function(event) {
      KAI.toastr.info('démarrage');
		}
	}
});

// -----------------------------------------------
// States citiesList
// -----------------------------------------------
KAI.addState("citiesList", {
  softKeys : {fr : ['actions','ajouter','sélect.']},
  display : {
		'div#meteo' : false,
		'div#meteo_page1' : false,
		'div#meteo_page2' : false,
    'div#citiesList': true,
    'div#addCity': false,
    'div#actions': false
  },
  afterStateChange : function() {
		citiesList.generateHtml();
  },
	events : {
		'keyup.ArrowUp': function(event) {
			citiesList.previous();
		},
		'keyup.ArrowDown': function(event) {
			citiesList.next();
		},
		'keyup.SoftLeft': function(event) {

		}
		,
		'keyup.Backspace': function(event) {
			KAI.newState('meteo');
		}

	}
});


// Dictionnaries option list creation ----------------
const cities = [
	{
		"choiceList_label":"ici",
		"location":"46.5891712,15.0046327",
		choiceList_type:"BOOLEAN"
		// choiceList_icon:"fas fa-people-arrows",
		// choiceList_infos:"essai infos",
		// choiceList_value:true, // read only property : if choiceList_type === "BOOLEAN", this is the value of checkbox : true if checked, otherwise false
		// choiceList_itemNumbered:"DOWN"  // UP or DOWN
		// choiceList_itemNumber : read only property
	},
	{
		"choiceList_label":"au Perrier",
		"location":"46.8192286,-1.995014",
		choiceList_type:"BOOLEAN"
	},
	{
		"choiceList_label":"à Nantes",
		"location":"47.2383171,-1.6302673",
		choiceList_type:"BOOLEAN"
	},
	{
		"choiceList_label":"à Dournazac",
		"location":"45.6330841,0.8911268",
		choiceList_type:"BOOLEAN"
	},
	{
		"choiceList_label":"à Orléans",
		"location":"47.8735097,1.8419973",
		choiceList_type:"BOOLEAN"
	},
	{	"choiceList_label":"à Paris",
		"location":"48.8589101,2.3119547",
		choiceList_type:"BOOLEAN"
	}
];



let citiesListOptions = {
	"selectedItemIdPrefix" : 		"citiesListOptions",
	"targetDomSelector" : 			"#citiesList"
}

const citiesList = new KAI.choiceList(cities,citiesListOptions);

// State machine initialisation ----------------------
const appOptions = {
  KAI_appTitle: "Météo"
};

window.onload = function() {
	KAI.spinner.off();
  KAI.init(appOptions);
	displayMeteoForSelectedCity();
	KAI.newState('meteo_page1');
};

console.log("app.js loaded");
