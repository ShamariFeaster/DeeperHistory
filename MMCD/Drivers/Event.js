//Events Loader
//Should be run by Bootstrap after Manager
(function(config){
  console.log('Importing Events Now........................');

  function loadNextEvent(eventName, remainingScripts){
      console.log(eventName + ' Has Been Loaded');
      loadEvents(remainingScripts);
    }
  function loadEvents(/*Array*/scripts){
    if(scripts.length < 1){
      config.loadNextDriver(config.getNextDriver(),'***Events Finished Loading***');
      return;
    }
    var eventName = scripts[0] + config.js;
    config.loadScript(config.events_folder + '/' + eventName, loadNextEvent(eventName, scripts.splice(1, (scripts.length - 1))) );
  }

  loadEvents(config.events);
})(MMCD.config);
