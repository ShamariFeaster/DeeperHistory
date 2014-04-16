//------------PORT MANAGER----------------
structureJS.module('Port', function(require){

  var Util = require('Utility');
  var _tabToPortMap = {};
  var _currentPort = null;
  var _lastPort = null;
  var _this = this;
  /**/
  function Port(tabId, portObj){
    if (!(this instanceof Port)) {
      return new Port(tabId, portObj);
    }
    this.tabId = tabId;
    this.ports = []
    if(typeof _tabToPortMap[tabId] == 'undefined'){
      _tabToPortMap[tabId] = {};
      _tabToPortMap[tabId].ports = [];
      _tabToPortMap[tabId].ports.push(portObj);
    }else{
      _tabToPortMap[tabId].ports.push(portObj);
    }
  }
  return {
    resetManager : function(){
        _tabToPortMap = {};
        _currentPort = null;
        _lastPort = null;
        return this;//supports chaining
    },
    currPort : Util.getSet(_this._currentPort),
    lastPort : Util.getSet(_this._lastPort),
    hasPorts : function(tabId){
      return (typeof _tabToPortMap[tabId] != 'undefined');
    },//returns array of ports belonging to <tabId>
    getTabPorts : function(tabId) {
      if(this.hasPorts(tabId)) {
        return (_tabToPortMap[tabId].ports);
      }
    },
    /*When tabId is present this returns length of the
    array holding the port of <tabId>*/
    portMapLength : function(tabId){
      var size = 0,
          key;
      if(typeof tabId === 'undefined') {
        for(key in _tabToPortMap){ size++;}
      } else if(typeof _tabToPortMap[tabId] != 'undefined'){
        size = _tabToPortMap[tabId].ports.length;
      }
        return size;
    },/*Adds ports to port map. multiple ports on same
    tabId get stored in <ports> array of port map obj
    fails on missing port object*/
    addPort : function(tabId, portObj){
        var incomingLength = this.portMapLength(tabId);
        if(typeof portObj !== 'undefined')
          new Port(tabId, portObj);
        return (this.portMapLength(tabId) > incomingLength);
    },
    removePorts : function(tabId){
      var incomingLength = this.portMapLength();
      if(this.hasPorts(tabId)) {
        delete _tabToPortMap[tabId];
        return (this.portMapLength() < incomingLength);
      } else {
        //throw invalid port error
        return false;
      }
    },
    postMessageToPort : function(currTabId, msg){ 
      if(this.hasPorts(currTabId)){
        var portArray = this.getTabPorts(currTabId);
        var port = null;
        if(typeof portArray != 'undefined'){
          for(index in portArray){
            port = portArray[index];
            port.postMessage(msg);

          }
        }
      }
    }
    
  }
});