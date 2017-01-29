//------------STATE MANAGER----------------
structureJS.module('State', function(require){
    var
    Util = require('Utility'),
    _currentUrl,
    _this = this,
    _lastMouseMove,
    _searchOptions,
    persistenceCache,
    highlightLoop,
    matchFound,
    HOUR, DAY, MAX_AGE, SECS,
    dbSize,
    cacheSize,
    UPDATE_URL,
    PROCESS_DELAY_TIME,
    isExtenstionEnabled,
    isUpdateAvailable,
    lastKeyAdded,
    TARGET_COMPRESSION,
    blackList = {};
  
  (initManager = function(){
    _this.currPageUrl = '';
    _this._lastMouseMove = (new Date()).getTime();
    SECS = 1000;
    HOUR = ( (60 * SECS) * 60);
    DAY = HOUR * 24;
    MAX_AGE = HOUR * 72;//
    PROCESS_DELAY_TIME = 1 * SECS;
    UPDATE_URL = 'http://deeperhistory.wordpress.com/notify-if-update-available/';
    TARGET_COMPRESSION = 0.35;
    _this.highlightLoop = null;
    localStorage['DeepHistoryMAX_AGE'] = MAX_AGE;
    _this.matchFound = false;
    _this.dbSize = 0.0;
    _this.cacheSize = 0.0;
    _this.isExtenstionEnabled = true;
    _this.isUpdateAvailable = false;
    _this.lastKeyAdded = 0;
    searchOptions = {
      keys: ['terms'],
      id: 'url'
    };
    persistenceCache = {
      buffer : '',
      stateInfo : {},
      processQueue : [],
      cache : { sites : {} },
      searchCache : [],
      resultCache : []     
    };
    var bl = localStorage['blacklist'];
    if(typeof bl == 'undefined'){
      localStorage['blacklist'] = blackList = {};
    }
    
    
  })();
  return {
    currPageUrl : Util.getSet(_this._currentUrl),
    lastMouseMove : Util.getSet(_this._lastMouseMove),
    searchOptions : searchOptions,
    highlightLoop : Util.getSet(_this.highlightLoop),
    matchFound : Util.getSet(_this.matchFound),
    lastKeyAdded : Util.getSet(_this.lastKeyAdded),
    DAY : DAY,
    HOUR : HOUR,
    MAX_AGE : MAX_AGE,
    UPDATE_URL : UPDATE_URL,
    PROCESS_DELAY_TIME : PROCESS_DELAY_TIME,
    TARGET_COMPRESSION : TARGET_COMPRESSION,
    dbSize : Util.getSet(_this.dbSize),
    cacheSize : Util.getSet(_this.cacheSize),
    isExtenstionEnabled : Util.getSet(_this.isExtenstionEnabled),
    isUpdateAvailable : Util.getSet(_this.isUpdateAvailable),
    persist : function(key, state) {
      if(typeof persistenceCache[key] != 'undefined'){
        if(typeof state == 'undefined')
          return persistenceCache[key];
        else {
          persistenceCache[key] = state;
          return true;
          }
      }
      return false;
    }, 
    currentTime : function(){ //MOVE TO Util
      return (new Date()).getTime();
    },
    secDiff :function(start){ //MOVE TO Util
      //console.log( (this.currentTime() - start) / 1000 ) ;
      return ( (this.currentTime() - start) / 1000 ).toPrecision(5);
    },
    resetManager : function(){
      initManager();
    },
    ls : function(key, value){
      if(typeof value == 'undefined')
        return localStorage[key];
      else
        localStorage[key] = value;
    },
    blackList : blackList
  }
});