(function(config){
  console.log('Importing Models Now........................');

  function loadNextModel(modelName, remainingScripts){
      console.log(modelName + ' Has Been Loaded');
      loadModels(remainingScripts);
    }
  function loadModels(/*Array*/scripts){
    if(scripts.length < 1){
      config.loadNextDriver(config.getNextDriver(),'***Models Finished Loading***');
      return;
    }
    var modelName = scripts[0] + config.js;
    config.loadScript(config.model_folder + '/' + modelName, loadNextModel(modelName, scripts.splice(1, (scripts.length - 1))) );
  }

  loadModels(config.models);
})(MMCD.config);