// ------------------------------------
// KAI Object
// ------------------------------------


let KAI = {
  // -----------------------------------------------------
  lang: 'fr',
  // -----------------------------------------------------
  currentState:'',
  // -----------------------------------------------------
  vars: {},
  // -----------------------------------------------------
  states:{},

  // -----------------------------------------------------
  // KAI.options
  // -----------------------------------------------------
  options:{
    KAI_appTitle:               "my app",
    KAI_appLayout: {
      KAI_displayOrientation :  "portrait", // 'portait' or 'landscape'
      KAI_displayStatus:        true,
      KAI_displayAppTitle:      true
    }
  },

  // -----------------------------------------------------
  // KAI.setAppTitle : set the title of the application
  // -----------------------------------------------------
  setAppTitle: function(KAI_appTitle) {
    if (this.options && this.options.KAI_appTitle) {
      if (KAI_appTitle) this.options.KAI_appTitle = KAI_appTitle;
      console.log(this.options.KAI_appTitle)
      $("#KAI_appTitle").html(this.options.KAI_appTitle);
    }
  },

  // -----------------------------------------------------
  // KAI.setAppLayout : displays the right screen layaout
  // -----------------------------------------------------
  setAppLayout: function(KAI_appLayout) {
    if (  this.options && this.options.KAI_appLayout) {
      // Set option value if provided
      if (KAI_appLayout) {
        Object.assign(this.options.KAI_appLayout, KAI_appLayout);
      }
      console.log(this.options.KAI_appLayout)
      //We calculate the appHeight and set the correct layout Set CSS
      let appHeight;
      switch (this.options.KAI_appLayout.KAI_displayOrientation) {
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
      if (this.options.KAI_appLayout.KAI_displayStatus){
        appHeight -= 25;
      }
      if (this.options.KAI_appLayout.KAI_displayAppTitle){
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

  // -----------------------------------------------------
  // KAI.init
  // -----------------------------------------------------
  init: function(options) {
    // We merge the options properties
    Object.assign(this.options, options);
    // We launch the initialisation functions
    this.setAppTitle();
    this.setAppLayout();
    // Keyboard management ------------------------
    const minDeltaBetweenKeys = 200; // In ms
    let lastKeyTs = new Date().getTime();
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
          this.callEventFunction(KAI_event,event);
        }
        else {
          // Execute "keyup.Default" callback for that state
          this.callEventFunction("keyup.Default",event);
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
    console.log('"KAI.init" done.')
  },

  // -----------------------------------------------------
  // KAI.spinner
  // -----------------------------------------------------
  "spinner" : {
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

  // -----------------------------------------------------
  // KAI.newState : method to change state
  // -----------------------------------------------------
  newState: function(newState) {
    // If newState exists -------------
    if (this.states.hasOwnProperty(newState)){
      // Change current state ---------
      console.log('"KAI.newState" : current state : "' + this.currentState + '"');
      this.currentState = newState;
      console.log('"KAI.newState" : new state : "' + newState + '"');
      // Display softKeys
      $('#SoftLeft').html(this.states[newState].softKeys
                        && this.states[newState].softKeys[this.lang]
                        && this.states[newState].softKeys[this.lang][0]);
      $('#Center').html(this.states[newState].softKeys
                        && this.states[newState].softKeys[this.lang]
                        && this.states[newState].softKeys[this.lang][1]);
      $('#SoftRight').html(this.states[newState].softKeys
                        && this.states[newState].softKeys[this.lang]
                        && this.states[newState].softKeys[this.lang][2]);
      console.log('"KAI.newState" : softKeys set');
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

  // -----------------------------------------------------
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

  // -----------------------------------------------------
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
  }
};






// -----------------------------------------------------------------
// KAI.toastr
// -----------------------------------------------------------------
KAI.toastr = {
	info : function (text) {
		$("#toastrMsg").html('<center><i class="fas fa-info-circle"></i><br/>' + text + '</center>');
		$("#toastr").attr("class","visible");
		setTimeout(function(){ $("#toastr").attr("class","hidden"); }, 2000);
	},
	warning : function (text) {
		$("#toastrMsg").html('<center><i class="fas fa-exclamation-circle"></i><br/>' + text + '</center>');
		$("#toastr").attr("class","visible");
		setTimeout(function(){ $("#toastr").attr("class","hidden"); }, 2000);
	},
	question : function(text) {
		$("#toastr").attr("class","visible");
		$("#toastrMsg").html('<center><i class="fas fa-question-circle"></i><br/>' + text + '</center>');
	},
	hide: function() {
		$("#toastr").attr("class","hidden");
	}
}


console.log("kai.js loaded");
