/*


*/

MMCD = (typeof MMCD != 'undefined') ? MMCD : {
  config : {//Model Manager Design
    //DRIVERS
    manager_driver : 'Manager',
    model_driver : 'Model',
    bootstrap_driver: 'Bootstrap',
    //PATHS
    driver_folder : 'MMCD/Drivers',
    model_folder : 'MMCD/Models',
    managers_folder : 'MMCD/Managers',
    controllers_folder : 'MMCD/Controllers',
    test_folder : 'MMCD/Tests',
    events_folder : 'MMCD/Events',
    //MODULES
    models : ['BrowserStorage', 'IdbClient'],
    managers : ['Utility','Port','State','Tab', 'String'],
    controllers : [],
    events : ['System.Define'],
    tests : [],  /*model.chrome.Tab,'manager.Html','model.BrowserStorage'*/
    load_state : { 
      driver_load_order : ['Model','Manager','Event','Controller'],
      load_index : 0
      },
    //Events
    os : 'Chrome',
    os_module_name : 'System',
    dom_module_name : 'DOM',
    //SUFFIXES
    js : '.js',
    manager_suffix : 'Manager',
    controller_suffix : 'Controller',
    loadScript : function(url, callback){

      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      
      head.appendChild(script);
      script.onload = callback;

      
    },
    //Misnamed-this reloads the Bootstrap script
    runTests : function(){
      this.bootstrap_finished = true;
      this.loadScript(this.driver_folder + '/' + this.bootstrap_driver + this.js, null) ;
    },
    getNextDriver : function(){
      var ls = this['load_state'];
      var lo = ls['driver_load_order'];
      if(ls['load_index'] < lo.length) {
        return lo[ls.load_index++];
      }
      else {
        return -1;
      }
    },
    loadNextDriver : function(driverName, completionMsg){
      console.log(completionMsg);
      if(driverName != -1)
        this.loadScript(this.driver_folder + '/' + driverName + this.js);
      else 
        this.runTests();
      
        
    },
    bootstrap_finished : false
    
  },
  //GENERIC ENVIRNMENT
  TEST_LEVEL: 0,//0 no tests, 1 run tests, 2 run tests with verbose output
  DEBUG_LEVEL: 1,//0 no debug, 1 debug concise, 2 debug verbose
  managers : {},
  classes : {},
  controllers: {},
  events : {},
  global: {},
  hook : {},//currently defined in System.Define
  getManager : function(managerName){
    if(typeof this.managers[managerName] != 'undefined')
      return this.managers[managerName];
    else
      return null;
  },
  getModel : function(className){
    if(typeof this.classes[className] != 'undefined')
      return this.classes[className].constructor();
    else
      return null;
  },
  getController : function(controllerName){
    if(typeof this.controllers[controllerName] != 'undefined')
      return this.controllers[controllerName];
    else
      return null;
  },
  getEvents : function(eventClassName){
    if(typeof this.events[eventClassName] != 'undefined')
      return this.events[eventClassName];
    else
      return null;
  },
  getSet : function(_var){
    return function(set){
        if(typeof set == 'undefined')
          return _var;
        else
          return _var = set;
    }; 
  }
};

(function(config){
  var MY_NAME = 'Bootstrap.js';
  if(config.bootstrap_finished == false)
    console.log('MMCD v0.2 2013\nWritten By: Shamari Feaster\nBootstrap: Init........................');
    
  function outputToConsole(msg){
    console.log(msg);
  }
  
  function runNextTest(completedTestName, remainingScripts){
    console.log(completedTestName + ' Has Finished Loading');
    loadTests(remainingScripts);
  }
  function loadTests(/*Array*/scripts){
    if(scripts.length == 1){//last test in finished, run onComplete
      var testName = scripts[0] + config.js;
      config.loadScript(config.test_folder + '/' + testName, null );
      return;
    }
    var testName = scripts[0] + config.js;
    var remainingTests = scripts.splice(1, (scripts.length - 1));
    config.loadScript(config.test_folder + '/' + testName, runNextTest(testName, remainingTests) );
  }
  
  function init(/*String*/entryPoint){
    if(entryPoint != -1){
      var entryPoint = entryPoint;
      config.loadScript(config.driver_folder + '/' + entryPoint + config.js, outputToConsole('***Moving To Entry Point***'));
    }else if(MMCD.TEST_LEVEL > 0 && config.tests.length > 0){
      loadTests(config.tests);
    }
    
  }
  
  init(config.getNextDriver());
  
})(MMCD.config);