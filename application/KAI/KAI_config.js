KAI.config = {
  readFromSD : function() {
    return new Promise(function (resolve, reject) {
      var sdcard = navigator.getDeviceStorage('sdcard');
      var request = sdcard.get("/sdcard1/apps/meteo/config.json");
      request.onsuccess = function () {
        // We get a File object
        var file = this.result;
        console.log("Get the file: " + file.name);
        console.log(this.result);
        const read = new FileReader();
        read.readAsText(file);
        read.onloadend = function(){
            console.log(read.result);
            try {
              const config = JSON.parse(read.result);
              console.log(config);
              resolve(config);
            }
            catch(e) {
              console.log('"KAI.config.readFromSD" error.');
              console.log(e);
              reject('"KAI.config.readFromSD" error.');
            }
        }
      }
      request.onerror = function () {
        console.warn("Unable to get the file: " + this.error);
        reject('"KAI.config.readFromSD" error.');
      }
    });
  },
  writeToSD : function() {
    var data = {
      essai:2,
      bidon : "ceci est un essai"
    }
    var sdcard = navigator.getDeviceStorage("sdcard");
    var file   = new Blob([JSON.stringify(data)], {type: "text/plain"});

    var request = sdcard.addNamed(file, "/sdcard1/apps/meteo/config.json");

    request.onsuccess = function () {
      console.log('"KAI.config.writeToSD" : config "' + this.result + '" successfully writen on the SDcard');
    }

    // An error typically occur if a file with the same name already exist
    request.onerror = function () {
      console.error(this.error);
      console.warn('Unable to write the file: ' + this.error);
    }
  }

}

console.log("KAI_config.js loaded");
