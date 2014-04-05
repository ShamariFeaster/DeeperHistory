//-------BrowserStorage CLASS--------------------------
MMCD.classes.BrowserStorage = function() {
  if (!(this instanceof MMCD.classes.BrowserStorage)) {
    return new MMCD.classes.BrowserStorage();
  }
  this.ls = localStorage;  
  this.db = null;
  this.store = null;
}

MMCD.classes.BrowserStorage.constructor = function(){
    return MMCD.classes.BrowserStorage();
};

MMCD.classes.BrowserStorage.prototype.get = function(key){
  var result = null;
  if(typeof this.ls[key] != 'undefined')
    result = this.ls[key];
  return JSON.parse(result);
};

MMCD.classes.BrowserStorage.prototype.set = function(key, value){
  var tempVal = null;
  if(typeof value == 'undefined')
    return tempVal;
  
  tempVal = value;
  this.ls[key] = JSON.stringify(value);
};
//-------BrowserStorage OBJECT--------------------------