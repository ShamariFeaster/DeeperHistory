//tracking tables
/*
  app_name: dh
  user table naming convention is <app_name>_user
  all tables prefixed by <app_name>
  
  Use EVENTS object to describe ovvurance so table names can change without affected 
  large portions of code. The idea is that all names directly mapped to database components
  should be configurable becuase those names can liekly change
  
  We track:
  options page opened
  search started
  scan started
  scan finished
  match selected
  overflow page opened
  powert button pressed
  database page opened
  help page opened
  match selected from overflow page_indexed
  .options command used
  page indexed
  power button disabled
  installed
  updated
*/


var MMCD_USAGE = (function(){
  var MMCD_USAGE_CONFIG = {
    app_name : 'dh',
    PREPROD : 'PREPROD',
    PRODUCTION : 'PRODUCTION'
  }
  var settings = {  environment : MMCD_USAGE_CONFIG.PREPROD };

  return {
    URLS : 
    {
      occurance : 'https://deeperhistory.info/updates/process.php?callback=*',
      getuid : 'https://deeperhistory.info/updates/getuid.php?callback=*',
      getupdates : 'https://deeperhistory.info/updates/getupdates.php?callback=*'
    },
    EVENTS : {
      options_opened : MMCD_USAGE_CONFIG.app_name + '_options_opened',
      search_occurance : MMCD_USAGE_CONFIG.app_name + '_search_occurance',
      scan_started : MMCD_USAGE_CONFIG.app_name + '_scan_started',
      match_selected : MMCD_USAGE_CONFIG.app_name + '_match_selected',
      overflow_opened : MMCD_USAGE_CONFIG.app_name + '_overflow_opened',
      scan_finished : MMCD_USAGE_CONFIG.app_name + '_scan_finished',
      power_button : MMCD_USAGE_CONFIG.app_name + '_power_button',
      db_page_opened : MMCD_USAGE_CONFIG.app_name + '_db_page_opened',
      help_page_opened : MMCD_USAGE_CONFIG.app_name + '_help_page_opened',
      overflow_match_selected : MMCD_USAGE_CONFIG.app_name + '_overflow_match_selected',
      dot_options_command : MMCD_USAGE_CONFIG.app_name + '_dot_options_command',
      page_indexed : MMCD_USAGE_CONFIG.app_name + '_page_indexed',
      disable_power_button : MMCD_USAGE_CONFIG.app_name + '_disable_power_button',
      installed : MMCD_USAGE_CONFIG.app_name + '_installed',
      updated : MMCD_USAGE_CONFIG.app_name + '_updated'
    },
    jsonpRequest : function(url, successCallback, errorCallback, customCallbackName){
      if(settings.environment == MMCD_USAGE_CONFIG.PRODUCTION){
        var script = document.createElement('script');
        var successCallback = successCallback || function(){};
        var errorCallback = errorCallback || function(){};
        var callbackName = customCallbackName || 'json';
        var timeout = setTimeout(function(){
          errorCallback();
        }, 5000);
        
        window[callbackName] = function(json){
          clearTimeout(timeout);
          successCallback(json);
        };
        script.async = true;
        script.src = url.replace('*','json');
        document.body.appendChild(script);
      }else{
        console.log('MMCD_USAGE is in preproduction. Occurance Not Sent.');
      }
    },  
    getUid : function(getUidSuccessCallback, jsonpErrorCallback){
              var getUidSuccessCallback = getUidSuccessCallback || function(){console.log('UID from server is: ' + localStorage['uid']);};
              var jsonpErrorCallback = jsonpErrorCallback || function(){};
              if(typeof localStorage['uid'] == 'undefined' || localStorage['uid'] == '0'){
                var getJsonCallback = function(response){
                  localStorage['uid'] = response.uid;
                  getUidSuccessCallback();
                };
                this.jsonpRequest(this.URLS.getuid + '&app_name=' + MMCD_USAGE_CONFIG.app_name, getJsonCallback , jsonpErrorCallback);
              }else{
                getUidSuccessCallback();
              }
              
            },
    processOccurance : function (uid, occuranceType, jsonpSuccessCallback, jsonpErrorCallback){
                          var jsonpSuccessCallback = jsonpSuccessCallback || function(res){console.log(occuranceType + ' processed. Server response: ' + res.response)};
                          var jsonpErrorCallback = jsonpErrorCallback || function(){console.log('Error processing ' + occuranceType)};
                          this.jsonpRequest(this.URLS.occurance + "&type="+occuranceType+"&uid="+uid, jsonpSuccessCallback, jsonpErrorCallback);
                        },
    processOccuranceByUser : function(occuranceType, poSuccessCallback, poErrorCallback){
                              var _this = this;
                              var poSuccessCallback = poSuccessCallback || function(res){console.log(occuranceType + ' processed. Server response:  ' + res.response)};
                              var poErrorCallback = poErrorCallback || function(){console.log('Error processing ' + occuranceType)};
                              this.getUid(function(){
                                _this.processOccurance(localStorage['uid'], occuranceType, poSuccessCallback, poErrorCallback);
                              });
    },
    getUpdateInfo : function(){
                      var successCallback = function(response){
                        console.log('Successfully retrieved update info');
                        localStorage['updateInfo'] = JSON.stringify(response);
                      };
                    this.jsonpRequest(this.URLS.getupdates, successCallback , function(){console.log('error happened')});
                  },
    resetUid : function(){
                return localStorage['uid'] = '0';
              },
    printTableNames : function(toConsole){
      var tables = '';
      var suffix = (typeof toConsole != 'undefined' && toConsole == true) ? ' \n' : ' , ';
      for(var i in this.EVENTS){
        tables += this.EVENTS[i] + suffix;
      }
      if(typeof toConsole != 'undefined' && toConsole == true)
        console.log(tables);
      else
        return tables;
    },
    printOccuranceFunctions : function(toConsole){
      var tables = '';
      var suffix = (typeof toConsole != 'undefined' && toConsole == true) ? '; \n' : '; , ';
      
      for(var i in this.EVENTS){
        tables += 'MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.' + i + ')' + suffix;
      }
      if(typeof toConsole != 'undefined' && toConsole == true)
        console.log(tables);
      else
        return tables;
    }
    
  }
})();
  


