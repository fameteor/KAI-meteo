
// KAI Object
// -------------------------------------------------------
const KAI = {
  // KAI lib Version
  //------------------------------------------------------
  version : "V1.0.3",

  // Current state value
  // -----------------------------------------------------
  currentState:'',

  // Configuration data (eventually loaded from disk)
  // -----------------------------------------------------
  config: {},

  // List of all configured states
  // -----------------------------------------------------
  states:{},

  // Global events, triggered ? BEFORE AFTER INSTEAD ? state events
  //------------------------------------------------------
  events:{},

  // Options
  // -----------------------------------------------------
  options:{
    appTitle:               "my app",
    appVersion: 					  "To be defined",
    lang:                   'fr',
    loadConfigFromSD: 		  false,
    configFilePath: 			  "To be defined",
    appTitleBackgroundColor:"#B700DB",
    appTitleColor:          "#FFFFFF",
    appLayout: {
      displayOrientation :  "portrait", // 'portait' or 'landscape'
      displayStatus:        true,
      displayAppTitle:      true
    }
  },

  // configLoadError : if error during config loading
  // -----------------------------------------------------
  configLoadError: false,

  // Function called when the app is lauched
  // -----------------------------------------------------
  coldStart: function() {

  },

  // Function called when the app is restarted by already in memory
  // -----------------------------------------------------
  warmStart: function() {

  },

  // Function that should be private : return a value or the value result of a function
  // -----------------------------------------------------
  valOrFctVal: function(variable) {
    if (variable instanceof Function)   return variable();
    else                                return variable;
  },

  // KAI.renderAppTitle : set the title of the application
  // -----------------------------------------------------
  renderAppTitle: function() {
    // If there is an option appTitle in the state, it will overwrite the global appTitle
    if (   this.currentState
        && this.states
        && this.states.hasOwnProperty(this.currentState)
        && this.states[this.currentState].options){
      if (this.states[this.currentState].options.appTitle) {
        const appTitle = this.states[this.currentState].options.appTitle;
        $("#KAI_appTitle").html(this.valOrFctVal(appTitle));
      }
      // We set the correct app title background color if available
      if (this.states[this.currentState].options.appTitleBackgroundColor) {
        $("#KAI_header").css("background-color",this.states[this.currentState].options.appTitleBackgroundColor);
      }
      if (this.states[this.currentState].options.appTitleColor) {
        $("#KAI_header").css("color",this.states[this.currentState].options.appTitleColor);
      }
      console.log("state options title applied");
    }
    // Otherwise the global appTitle applies
    else {
      if (this.options && this.options.appTitle) {
        const appTitle = this.options.appTitle;
        $("#KAI_appTitle").html(this.valOrFctVal(appTitle));
      }
      // We set the correct app title background color if available
      if (this.options.appTitleBackgroundColor) {
        $("#KAI_header").css("background-color",this.options.appTitleBackgroundColor);
      }
      if (this.options.appTitleColor) {
        $("#KAI_header").css("color",this.options.appTitleColor);
      }
      console.log("global options title applied");
    }



  },

  // KAI.setAppLayout : displays the right screen layaout
  // -----------------------------------------------------
  setAppLayout: function(appLayout) {
    if (  this.options && this.options.appLayout) {
      // Set option value if provided
      if (appLayout) {
        Object.assign(this.options.appLayout, appLayout);
      }
      console.log(this.options.appLayout)
      //We calculate the appHeight and set the correct layout Set CSS
      let appHeight;
      switch (this.options.appLayout.displayOrientation) {
        case 'portrait' :
          appHeight = 320;
          // We set the orientation if not correct
          console.log("Current screen orientation : " + screen.orientation.type);
          if (!screen.orientation.type.includes('portrait')) screen.orientation.lock('portrait-primary');
          break;
        case 'landscape' :
            appHeight = 240;
            // We set the orientation if not correct
            console.log("Current screen orientation : " + screen.orientation.type);
            if (!screen.orientation.type.includes('landscape')) screen.orientation.lock('landscape-primary');
          break;
      }
      if (this.options.appLayout.displayStatus){
        appHeight -= 25;
      }
      if (this.options.appLayout.displayAppTitle){
        $("#KAI_header").show();
        appHeight -= 20;
      }
      else {
        $("#KAI_header").hide();
      }
      // Softkeys height deduction
      appHeight -= 30;
      // we set the height for all items that have class KAI_app_height
      console.log('class "KAI_app_height" height : ' + appHeight);
      $(".KAI_app_height").css("height",appHeight + "px");
    }
  },

  // KAI.init
  // -----------------------------------------------------
  init: function(appData) {
    // We merge the properties ---------------------------
    if (appData.options) Object.assign(this.options, appData.options);
    if (appData.defaultConfig) Object.assign(this.config, appData.defaultConfig);
    if (appData.coldStart) this.coldStart = appData.coldStart;
    if (appData.warmStart) this.warmStart = appData.warmStart;
    // We launch the initialisation functions ------------
    this.renderAppTitle();
    this.setAppLayout();
    // Keyboard and event management ---------------------
    const minDeltaBetweenKeys = 200; // In ms
    let lastKeyTs = new Date().getTime();
    const that = this;
    document.addEventListener("keyup", event => {
      const KAI_event = "keyup." + event.key;
    	console.log("\"" + KAI_event + "\" event received");
    	const keyTs = new Date().getTime();
    	// Anti bounce filtering
    	if ((keyTs - lastKeyTs) > minDeltaBetweenKeys) {
        lastKeyTs = keyTs;
        const specificKeyEvents = [
          'keyup.ArrowLeft',
          'keyup.ArrowRight',
          'keyup.ArrowUp',
          'keyup.ArrowDown',
          'keyup.SoftLeft',
          'keyup.Home', // for PC browser compatibility
          'keyup.Enter',
          'keyup.SoftRight',
          'keyup.End', // for PC browser compatibility
          'keyup.Backspace',
          'keyup.Default'
        ];
        if (specificKeyEvents.includes(KAI_event)) {
          // Execute KAI_event callback for that state
          that.callEventFunction(KAI_event,event);
        }
        else {
          // if "Call" pressed, display KAI lib version
          if ( event.key === "Call") {
            console.log("version");
            that.toastr.info( "KAI framework : "
                              + that.version
                              + "<br/>"
                              + "App : "
                              + that.options.appVersion);
          }

          // Execute "keyup.Default" callback for that state
          that.callEventFunction("keyup.Default",event);
        }
      }
      else {
        console.log("Anti-bounce : invalid key");
      }
    });
    // Other event listeners ----------------------
    window.addEventListener("blur", (event) => {
      this.callEventFunction("window.blur",event);
    });
    window.addEventListener("focus", (event) => {
      this.callEventFunction("window.focus",event);
    });
    // We read the config on SD card if requested --------
    if (this.options.loadConfigFromSD && this.options.configFilePath) {
      KAI.spinner.on("Chargement de la configuration en cours...");
    	KAI.SD.readTextFile(this.options.configFilePath)
        .then(function (configText) {
    			KAI.spinner.off();
          try {
            const config = JSON.parse(configText);
            // We overwrite the default config
      			if (config) KAI.config = config;
          }
          catch(e) {
            console.log(e);
          }
    			KAI.coldStart();
        })
        .catch(function (err) {
    			KAI.spinner.off();
          KAI.configLoadError = err;
    			KAI.coldStart();
        });
    }
    else {
      // We coldStart the app
      KAI.spinner.off(); // Initial spinner hide (spinner bug)
      this.coldStart();
    }


    console.log('"KAI.init" done.')
  },

  // KAI.spinner
  // -----------------------------------------------------
  spinner : {
    "on": function(text) {
      $("#KAI_spinner").show();
      // If some text is provided, we write it in the spinner
      if (text) {
        $("#KAI_spinnerText").html(text);
      }
    },
    "off" : function() {
      $("#KAI_spinner").hide();
    }
  },

  // KAI.renderSoftKeys : method to dispaly the softkeys
  // -----------------------------------------------------
  renderSoftKeys: function() {
    // Display softKeys
    const SoftLeft =  this.states
                      && this.states[this.currentState]
                      && this.states[this.currentState].softKeys
                      && this.states[this.currentState].softKeys[this.options.lang]
                      && this.states[this.currentState].softKeys[this.options.lang][0];
    const Center =    this.states
                      && this.states[this.currentState]
                      && this.states[this.currentState].softKeys
                      && this.states[this.currentState].softKeys[this.options.lang]
                      && this.states[this.currentState].softKeys[this.options.lang][1];
    const SoftRight = this.states
                      && this.states[this.currentState]
                      && this.states[this.currentState].softKeys
                      && this.states[this.currentState].softKeys[this.options.lang]
                      && this.states[this.currentState].softKeys[this.options.lang][2];

    $('#SoftLeft').html(this.valOrFctVal(SoftLeft));
    $('#Center').html(this.valOrFctVal(Center));
    $('#SoftRight').html(this.valOrFctVal(SoftRight));

    console.log('"KAI.renderSoftKeys" info : softKeys set');
  },

  // KAI.newState : method to change state
  // -----------------------------------------------------
  newState: function(newState) {
    // If newState exists -------------
    if (this.states.hasOwnProperty(newState)){
      // Change current state ---------
      console.log('"KAI.newState" : current state : "' + this.currentState + '"');
      this.currentState = newState;
      console.log('"KAI.newState" : new state : "' + newState + '"');
      // Display title ----------------
      this.renderAppTitle();
      // Display softKeys -------------
      this.renderSoftKeys();
      // Display zones ----------------
      Object.keys(this.states[newState].display).forEach(function(key) {
        if (KAI.states[newState].display[key]) {
          $(key).show();
        }
        else {
          $(key).hide();
        }
      });
      console.log('"KAI.newState" : hide/show zones (display) ok');
      // Run afterStateChange callback
      if (this.states[newState].hasOwnProperty("afterStateChange")) {
        // ------------------------
        // TBD : check if function
        // ------------------------
        this.states[newState].afterStateChange();
        console.log('"KAI.newState" : afterStateChange callback ok');
      }
    }
    else {
      console.log('"KAI.newState" error : "' + newState + '" state do not exists in "KAI.states"');
    }
  },

  // KAI.addState : method to add a state to configuration
  // -----------------------------------------------------
  addState: function(name,stateObject) {
    if (this.hasOwnProperty('states')) {
      this.states[name] = stateObject;
      // We add émulation of softKeys for PC
      if (this.states[name].hasOwnProperty('events')) {
        // For ArrowLeft emulation on PC
        if (this.states[name].events['keyup.SoftLeft']) this.states[name].events['keyup.Home'] = this.states[name].events['keyup.SoftLeft'];
        // For ArrowRight emulation on PC
        if (this.states[name].events['keyup.SoftRight']) this.states[name].events['keyup.End'] = this.states[name].events['keyup.SoftRight'];
        console.log('"KAI.addState" : state "' + name + '" added');
      }
      else console.log('"KAI.addState" error : "stateObject" do not have a "events" property.');
    }
    else console.log('"KAI.addState" error : "KAI" do not have a "states" property.');
  },

  // These shoud be private functions
  // -----------------------------------------------------
  callEventFunction : function(KAI_event,jsEvent) {
    // We look for the function for that key in the current status
    console.log("--------------- EVENT ---------------");
    console.log('- current state : "' + KAI.currentState + '", event : "' + KAI_event + '"');
    if (KAI.states && KAI.states.hasOwnProperty(KAI.currentState)) {
      if (KAI.states[KAI.currentState].hasOwnProperty("events")) {
        if (KAI.states[KAI.currentState].events.hasOwnProperty(KAI_event)) {
          if ( KAI.states[KAI.currentState].events[KAI_event] instanceof Function) {
            // We run the function for that event
            KAI.states[KAI.currentState].events[KAI_event](jsEvent);
            console.log("- callback OK");
          }
          else {
            console.error('- KAI.states["' + KAI.currentState + '"].event["' + KAI_event + '"] is not a function');
          }
        }
        else {
          // There is no such event function for that state, nothing is done
          console.log("- No existing event function for that state");
        }
      }
      else console.error('- KAI.states["' + KAI.currentState + '"] do not have an "events" property.');
    }
    else console.error('- there is no KAI.states object or no KAI.states for current state : ' + KAI.currentState);
    console.log("------------- END EVENT -------------");
  },


  // KAI.toastr
  // -----------------------------------------------------------------
  toastr : {
    infoMsgs:[],
    template: `
      {{#.}}
        <div class="row-toastr">
          <div class="cell-toastr">
            {{#isWarning}}
              <i class="fas fa-exclamation-circle"></i>
            {{/isWarning}}
            {{^isWarning}}
              <i class="fas fa-info-circle"></i>
            {{/isWarning}}
          </div>
          <div class="cell-toastr">
            {{{text}}}
          </div>
        </div>
      {{/.}}
    `,
    displayInfos: function() {
      $("#toastrMsg").html(mustache.render(this.template,this.infoMsgs));
      $("#toastr").attr("class","visible");
    },
  	info : function (text) {
      const that = this;
      // We add the message to the list with its index
      that.infoMsgs.push({text:text,isWarning:false});
      // We display it
      that.displayInfos();
  		setTimeout(
        function() {
          // After 2 seconds, we delete the first left message and display the others
          that.infoMsgs.shift();
          // If empty, we hide the toastr
          if (that.infoMsgs.length === 0) $("#toastr").attr("class","hidden");
          // Else, we display the other msgs
          else                            that.displayInfos();
        },
        2000
      );
  	},
  	warning : function (text) {
      const that = this;
      // We add the message to the list with its index
      that.infoMsgs.push({text:text,isWarning:true});
      // We display it
      that.displayInfos();
  		setTimeout(
        function() {
          // After 2 seconds, we delete the first left message and display the others
          that.infoMsgs.shift();
          // If empty, we hide the toastr
          if (that.infoMsgs.length === 0) $("#toastr").attr("class","hidden");
          // Else, we display the other msgs
          else                            that.displayInfos();
        },
        2000
      );
  	},
  	question : function(text) {
  		$("#toastr").attr("class","visible");
  		$("#toastrMsg").html('<center><i class="fas fa-question-circle"></i><br/>' + text + '</center>');
  	},
  	hide: function() {
  		$("#toastr").attr("class","hidden");
  	}
  }
};

// KAI.SD : methods to access the SDcard
// -----------------------------------------------------
KAI.SD = {
  readTextFile : function(filePath) {
    return new Promise(function (resolve, reject) {
      var sdcard = navigator.getDeviceStorage('sdcard');
      var request = sdcard.get(filePath);
      request.onsuccess = function () {
        // We get a File object
        var file = this.result;
        console.log("Get the file: " + file.name);
        console.log(this.result);
        const read = new FileReader();
        read.readAsText(file);
        read.onloadend = function(){
            console.log(read.result);
            resolve(read.result);
        }
        read.onerror = function () {
          reject({
            err: read.error,
            text: '"KAI.SD.readTextFile" error'
          });
        }
      }
      request.onerror = function () {
        console.warn("Unable to get the file: " + this.error);
        reject({
          err: this.error,
          text: '"KAI.SD.readTextFile" error'
        });
      }
    });
  },
  writeTextFile : function(text,filePath) {
    return new Promise(function (resolve, reject) {
      var sdcard = navigator.getDeviceStorage("sdcard");
      var file   = new Blob([text], {type: "text/plain"});
      var request = sdcard.addNamed(file, filePath);

      request.onsuccess = function () {
        console.log('"KAI.config.writeTextFile" : config "' + this.result + '" successfully writen on the SDcard');
        resolve();
      }

      // An error typically occurs if a file with the same name already exist
      request.onerror = function () {
        console.warn('Unable to write the file: ' + this.error);
        reject({
          err: this.error,
          text: '"KAI.SD.writeTextFile" error'
        });
      }
    });
  },
  deleteFile : function(filePath) {
    return new Promise(function (resolve, reject) {
      var sdcard = navigator.getDeviceStorage('sdcard');
      var request = sdcard.delete(filePath);

      request.onsuccess = function () {
        console.log("File " + filePath + " deleted");
        resolve();
      }

      request.onerror = function () {
        console.log("Unable to delete the file: " + this.error);
        reject({
          err: this.error,
          text: '"KAI.SD.deleteFile" error'
        });
      }
    });
  },
  saveConfig : function() {
    KAI.spinner.on("sauvegarde de la configuration...");
    KAI.SD.deleteFile(KAI.options.configFilePath)
      .then(function (result1) {
        try {
          const text = JSON.stringify(KAI.config);
          KAI.SD.writeTextFile(text,KAI.options.configFilePath)
            .then(function (result2) {
              KAI.spinner.off();
              KAI.toastr.info("configuration sauvegardée");
            })
            .catch(function (err) {
              KAI.spinner.off();
              console.error(err);
              KAI.toastr.warning("sauvegarde de la configuration impossible");
            });
        }
        catch(err) {
          KAI.spinner.off();
          console.error(err);
          KAI.toastr.warning("sauvegarde de la configuration impossible");
        }
      })
      .catch(function (err) {
        KAI.spinner.off();
        console.error(err);
        KAI.toastr.warning("sauvegarde de la configuration impossible");
      });
  }
}

// -----------------------------------------------------------------
// KAI.choiceList
// -----------------------------------------------------------------

KAI.choiceList = function(list,options) {
	this.options = options;
	this.list = list;
	this.currentIndex = (this.options && this.options.initialSelectionIndex) ? this.options.initialSelectionIndex() : 0;
}

KAI.choiceList.prototype.verticalScrollToActiveElement = function() {
  // If the list is displayed, we get the DOM element from JQUERY
  if ($(this.options.targetDomSelector)[0]) {
  	if (  $("tr[id^=" + this.options.selectedItemIdPrefix + "].active")
          && $("tr[id^=" + this.options.selectedItemIdPrefix + "].active").position()) {
      $(this.options.targetDomSelector)[0].scrollTo({
        top: $("tr[id^=" + this.options.selectedItemIdPrefix + "].active").position().top,
        behavior: 'smooth'
      });
    	// Other possibiity :
    	// document.getElementById("root").scrollTo({top: this.currentIndex * 70, behavior: 'smooth'});
    }
  }
}

KAI.choiceList.prototype.refreshSelection = function() {
	// Refresh selection
	if (this.options.selectedItemIdPrefix) {
		const that = this;
		this.list.forEach(function(item,index) {
			if (index === that.currentIndex) 	$("#" +  that.options.selectedItemIdPrefix + index).addClass("active");
			else								$("#" +  that.options.selectedItemIdPrefix + index).removeClass("active");
		});
	}
	// Refresh accordingly hide/show
	if (this.options.showDomElementPrefix) {
		const that = this;
		this.list.forEach(function(item,index) {
			if (index === that.currentIndex) 	$(that.options.showDomElementPrefix + index).show();
			else								$(that.options.showDomElementPrefix + index).hide();
		});
	}
	this.verticalScrollToActiveElement();
};

KAI.choiceList.prototype.currentItem = function() {
	return this.list[this.currentIndex];
};

KAI.choiceList.prototype.next = function() {
	if (this.currentIndex < this.list.length - 1) 	this.currentIndex += 1;
	else 											this.currentIndex = 0;
	this.refreshSelection();
};

KAI.choiceList.prototype.previous = function() {
	if (this.currentIndex != 0) this.currentIndex -= 1;
	else 						this.currentIndex = this.list.length - 1;
	this.refreshSelection();
};

KAI.choiceList.prototype.generateHtml = function() {
	this.refreshHTML();
	this.refreshSelection();
};

// -----------------------------------------------------------------
// refreshHTML
// -----------------------------------------------------------------
KAI.choiceList.prototype.refreshHTML = function() {
	// Template ------------------------------------------------------
	const template = `
		<table>
			{{#.}}
				<tr id="{{id}}" class="list">
					<td class="list">
						{{#choiceList_icon}}
								<label><i class="{{choiceList_icon}}"></i></label>
							<br/>
						{{/choiceList_icon}}
						{{#choiceList_itemNumbered}}
							<span class="info">{{choiceList_itemNumber}}</span>
						{{/choiceList_itemNumbered}}
					</td>
					<td class="list">
						<center>
							<choiceList_label>{{{choiceList_label}}}</choiceList_label>
							{{#choiceList_infos}}
								<div class="info">{{{choiceList_infos}}}</div>
							{{/choiceList_infos}}
						</center>
					</td>
					<td class="text-center list">
						{{#choiceList_typeIsBOOLEAN}}
							{{#choiceList_value}}
								<input type="checkbox" checked>
							{{/choiceList_value}}
							{{^choiceList_value}}
								<input type="checkbox">
							{{/choiceList_value}}
						{{/choiceList_typeIsBOOLEAN}}
						{{#choiceList_typeIsMENU}}
							<i class="fas fa-chevron-right"></i>
						{{/choiceList_typeIsMENU}}
					</td>
				</tr>
			{{/.}}
		</table>
	`;
	// data creation -------------------------------------------------
	that = this;
	const data = this.list.map(function(element,index) {
		let newElement = {};
		newElement.id = that.options.selectedItemIdPrefix + index;
		newElement.choiceList_label = (element.choiceList_label instanceof Function) ? element.choiceList_label() : element.choiceList_label;
		newElement.choiceList_icon = element.choiceList_icon;
		newElement.choiceList_type = element.choiceList_type;
		newElement.choiceList_value = element.choiceList_value;
		newElement.choiceList_infos = (element.choiceList_infos instanceof Function) ? element.choiceList_infos() : element.choiceList_infos;
		newElement.choiceList_typeIsBOOLEAN = (element.choiceList_type === "BOOLEAN");
		newElement.choiceList_typeIsMENU = (element.choiceList_type === "MENU");
		newElement.choiceList_typeIsNONE = (element.choiceList_type === "NONE");
		if (element.choiceList_itemNumbered) {
			if (element.choiceList_itemNumbered === "UP") {
				newElement.choiceList_itemNumbered = element.choiceList_itemNumbered;
				newElement.choiceList_itemNumber = index + 1;
			}
			if (element.choiceList_itemNumbered === "DOWN") {
				newElement.choiceList_itemNumbered = element.choiceList_itemNumbered;
				newElement.choiceList_itemNumber = that.list.length - index;
			}
		}
		return newElement;
	});
	console.log(data);
	// Rendering -----------------------------------------------------
	$(this.options.targetDomSelector).html(mustache.render(template,data));
}


console.log("kai.js loaded");
