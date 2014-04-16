//------------TAB MANAGER----------------
structureJS.module('Tab', function(require){
  var 
  Util = require('Utility'),
  _tabId = null, //this is the tab where the queue _pages will be displayed
  _tab = null,
  _tabOpen = false,
  _currentTabTitle = '',
  _currentTabId = null,
  _lastTabId = null,
  _this = this;
  
  return {
    targetId :  Util.getSet(_this._tabId),
    target :    Util.getSet(_this._tab),
    isOpen :    Util.getSet(_this._tabOpen),
    currId :    Util.getSet(_this._currentTabId),
    lastId :    Util.getSet(_this._lastTabId),
    currTitle : Util.getSet(_this._currentTabTitle) 
  }
});