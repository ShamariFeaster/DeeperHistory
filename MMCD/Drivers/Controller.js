//Controller Loader
//Should be run by Bootstrap after Manager
(function(config){
  console.log('Importing Controllers Now........................');

  function loadNextController(controllerName, remainingScripts){
      console.log(controllerName + ' Has Been Loaded');
      loadControllers(remainingScripts);
    }
  function loadControllers(/*Array*/scripts){
    if(scripts.length < 1){
      config.loadNextDriver(config.getNextDriver(),'***Controllers Finished Loading***');
      return;
    }
    var controllerName = scripts[0] + config.controller_suffix + config.js;
    config.loadScript(config.controllers_folder + '/' + controllerName, loadNextController(controllerName, scripts.splice(1, (scripts.length - 1))) );
  }

  loadControllers(config.controllers);
})(MMCD.config);
