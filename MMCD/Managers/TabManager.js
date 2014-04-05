//------------TAB MANAGER----------------
MMCD.managers.Tab = (function(){
  var 
  _tabId = null, //this is the tab where the queue _pages will be displayed
  _tab = null,
  _tabOpen = false,
  _currentTabTitle = '',
  _currentTabId = null,
  _lastTabId = null,
  _this = this;
  
  return {
    targetId :  MMCD.getSet(_this._tabId),
    target :    MMCD.getSet(_this._tab),
    isOpen :    MMCD.getSet(_this._tabOpen),
    currId :    MMCD.getSet(_this._currentTabId),
    lastId :    MMCD.getSet(_this._lastTabId),
    currTitle : MMCD.getSet(_this._currentTabTitle) 
  }
})();