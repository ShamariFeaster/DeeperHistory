(function(config){
  console.log('Importing Managers Now........................');

  function loadManagers(/*Array*/scripts){
    if(scripts.length < 1){
      config.loadNextDriver(config.getNextDriver(), '***Managers Finished Loading***');
      return;
    }
    var managerName = scripts[0] + config.manager_suffix + config.js;
    config.loadScript(config.managers_folder + '/' + managerName, loadNextManager(managerName, scripts.splice(1, (scripts.length - 1))) );
  }
  
  function loadNextManager(managerName, remainingScripts){
    console.log(managerName + ' Has Been Loaded');
    loadManagers(remainingScripts);
  }
  
  loadManagers(config.managers.reverse());
})(MMCD.config);