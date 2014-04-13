function isDef(obj){
  return (typeof obj != 'undefined');
}

function isSet(obj){
  return (this.isDef(obj) && obj !== null);
}

function isFunc(obj, throwError){
  //console.log('throwError: ' + throwError);
  var te = ( this.isDef(throwError) && throwError.constructor == Boolean ) ? throwError : false;
  //console.log(te);
  if( te && !(obj && {}.toString.call(obj) == '[object Function]') )
    throw 'Not A Function';
  return ( this.isDef(obj) && {}.toString.call(obj) == '[object Function]');
  
}

function initParam(param, isReq){
  var throwError = ( this.isDef(isReq) && isReq.constructor == Boolean ) ? isReq : false;
  var value = null;
  if( this.isDef(param) )
    value = param;
  else if(throwError){
    throw 'Required Parameter Missing';
  }
  return value;  
  
}


function executeCallback(callback, throwError){
  if( this.isFunc(callback, throwError) ){
    return callback();
  }else{
    return null;
  }
}


MMCD.classes.IdbClient = function(dbName, dbVersion, defaultStore) {
  if (!(this instanceof MMCD.classes.IdbClient)) {
    return new MMCD.classes.IdbClient();
  }
  
  this.name = initParam(dbName, true);
  this.version = initParam(dbVersion, true);
  this.isOpen = false;
  this.db = null;
  this.storeNames = [];
  this.defaultStore = '';
  /*This is basically the DB init function*/
  this.onupgradeneeded = function(){console.log('onupgradeneeded Fired.');};
  if( isDef(defaultStore) )
    this.defaultStore = defaultStore;
}


MMCD.classes.IdbClient.prototype.open = function(onsuccess, onerror){
  var _self = this;
  var onsuccess = onsuccess || function(){console.log(_self.name + ' Successfully Opened.')};
  var onerror = onerror || function(){console.log(_self.name + ' Not Opened.')};

  try{
    var dbOpenRequest = indexedDB.open(this.name, this.version);

    dbOpenRequest.onupgradeneeded = function(e){
      _self.onupgradeneeded(e);
    };
    dbOpenRequest.onerror = function(e) {
      executeCallback(onerror);
    };
    
    dbOpenRequest.onsuccess = function(e) {
      _self.db = e.target.result;
      _self.isOpen = true;
      _self.stores = _self.db.objectStoreNames;
      executeCallback(onsuccess);
    };
  }catch(err){
    console.log(err);
  }
}

MMCD.classes.IdbClient.prototype.setDefaultStore = function(storeName){
  if(typeof storeName === 'string')
    this.defaultStore = storeName;
}

MMCD.classes.IdbClient.prototype.setUpgradeNeeded = function(onupgradeneeded){

  if( isFunc(onupgradeneeded) ){
    console.log('SETTIGN');
    this.onupgradeneeded = onupgradeneeded;
  }
}
/*Used everywhere to do transactions. Set default storename before 
a call to this to get other stores*/
MMCD.classes.IdbClient.prototype.getStore = function(storeName){
  var _self = this;  
  if( _self.isOpen ){
    var storeName = storeName || _self.defaultStore;
    return _self.db.transaction([storeName], "readwrite").objectStore("DeepHistoryIndex");
  }else{
    return null;
  }
  
}
/*If key exists it fail, if not it will add it*/
MMCD.classes.IdbClient.prototype.addRecord = function(record, onsuccess, onerror){
  var onsuccess = onsuccess || function(){console.log('Record Added.')};
  var onerror = onerror || function(){console.log('Record Not Added.')};
  var _self = this;
  var store = _self.getStore();
  var req = null;
  if( isSet(store) ){
    req = store.add(record);
    req.onsuccess = onsuccess;
    req.onerror = onerror;
  }else{
    throw 'Could not create transaction on store ' + _self.defaultStore;
  }
  
}
/*If key exists it will modify the reocord, if not it will add it*/
MMCD.classes.IdbClient.prototype.updateRecord = function(record, onsuccess, onerror){
  var onsuccess = onsuccess || function(){console.log('Record Updated.')};
  var onerror = onerror || function(){console.log('Record Not Updated.')};
  var _self = this;
  var store = _self.getStore();
  var req = null;
  if( isSet(store) ){
    req = store.put(record);
    req.onsuccess = onsuccess;
    req.onerror = onerror;
  }else{
    throw 'Could not create transaction on store ' + _self.defaultStore;
  }
  
}

/*If key exists it will modify the reocord, if not it will add it*/
MMCD.classes.IdbClient.prototype.deleteRecord = function(key, onsuccess, onerror){
  if( !isDef(key))
    return null;
  var onsuccess = onsuccess || function(){console.log('Record With Key ' + key + ' Deleted.')};
  var onerror = onerror || function(){console.log('Record Not Deleted.')};
  var _self = this;
  var store = _self.getStore();
  var req = null;
  if( isSet(store) ){
    req = store.delete(key);
    req.onsuccess = onsuccess;
    req.onerror = onerror;
  }else{
    throw 'Could not create transaction on store ' + _self.defaultStore;
  }
  
}

/*mapFunct must be a function that take a record object.
mapFunct will perform some function on each record*/
MMCD.classes.IdbClient.prototype.forEach = function(mapFunct, onComplete, onerror){
  
  if( !isFunc(mapFunct) )
    return null;
    
  var onerror = onerror || function(){console.log('Cursor Not Opened.')};
  var _self = this;
  var store = _self.getStore();
  var req = null;
  if( isSet(store) ){
    req = store.openCursor();
    req.onsuccess = function(e){
      var cursor = e.target.result;
      if(cursor) {
        mapFunct.call( null, cursor.value );
        cursor.continue();
      } else {
        if( isFunc(onComplete) )
          onComplete();
        console.log('Finished Traversing ' + _self.defaultStore);
      }
    };
    req.onerror = onerror;
  }else{
    throw 'Could not create transaction on store ' + _self.defaultStore;
  }
}

/*
var dbSizeDiff = 0.0;
var sizeDeletedRecords = 0.0;
if(totalDBSize > MAX_DB_SIZE){
  dbSizeDiff = totalDBSize - MAX_DB_SIZE;
  console.log('MAX_DB_SIZE Exceeded by ' + dbSizeDiff);
  for(var i in sizeCalcArray){
    if(sizeDeletedRecords < dbSizeDiff){
      sizeDeletedRecords += parseFloat(sizeCalcArray[i].size);
      console.log('Deleted ' + sizeCalcArray[i].title + ' FROM DB Size: ' + sizeCalcArray[i].size);
      for(var x in searchCache){//would be in indexedDb delete operation callback
        if(searchCache[x].timestamp == sizeCalcArray[i].timestamp)
          console.log('Deleted ' + searchCache[x].title + ' FROM CACHE');//use splice
      }
    }else{
      console.log('>>>> Total kB Deleted: ' + sizeDeletedRecords + ' In ' + sm.secDiff(start) + 'sec');
      break;
    }
  }
}//end DB Size limiting emulation

*/
