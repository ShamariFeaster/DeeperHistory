structureJS.module('Utility', function(){
  var DEBUG_LEVEL = 1;
  function inspectObj(/*object*/obj, /*string*/propName, /*bool*/recursive){ 
    var a = '';
    for(var p in obj){ 
      if(typeof propName != 'undefined' && propName != null){
        a += p + ' : ' + obj[p][propName] + ' \n';
      }
      else{
        if(typeof recursive != 'undefined' && recursive == true && typeof obj[p] == 'object'){
          a += 'RECURSINING INTO ' + p + '\n' + objToString(obj[p]);
        }else{
          a += p + ' : ' + obj[p] + ' \n';
        }
        
      }
    }
    return a;
  }
  function removeDuplicates(source){
    var tempArr = [];
    var keys = {};
    for(var i in source){
      keys[source[i].id()] = source[i].id();
    }
    var a = 1;
    for(var x in keys){
      for(var y in source){
        if(source[y].id() == keys[x]){
          tempArr.push(source[y]);
          break;
          }
      }
    }
    return tempArr;
    
  }
  function objectlength(obj){
    var size = 0;
    if(typeof obj == 'undefined' || obj == null)
      return size;
    for(var i in obj){
      size++;
    }
    return size;
  }
  function debug(debugLevel, className, functionName, msg){
    if(DEBUG_LEVEL >= debugLevel)
      console.log(className + ' : ' + functionName + '() >> ' + msg);
  
  }
  function log(functionName, msg, myName, oDebugLevel){
    var myName = (typeof myName == 'undefined' || myName === '') ? 'DEBUG' : myName;
    var debugLevel = (typeof oDebugLevel == 'undefined') ? 1 : oDebugLevel;
    if(DEBUG_LEVEL >= debugLevel)
      console.log(myName + ' : ' + functionName + '() >> ' + msg);
  
  }
  
  function printf(formattedString, showAsComment){
    var args = null;
    var result = '';
    var argIndex = 0;
    var returnVal = null;
    if(arguments.length > 1){
      args = Array.prototype.slice.call(arguments, 0);
      args = args.splice(1, (arguments.length - 1));
      result += formattedString.replace(/%s/g, function(match, matchOffset, fullString){
        if(argIndex < args.length){
          return args[argIndex++];
        }else{
          return '%s';
        }
      });
      returnVal = result;
    }else{
      returnVal = formattedString;
    }
    
    if(typeof showAsComment != undefined && showAsComment == true)
      console.log(returnVal);
    else
      return returnVal;
  }

    /*note this will fail if it is passed a variable that
    has never been declared in the calling scope. This fails at 
    the calling scope and never reaches here. Hence this will only work for
    properties of objects and parameters (which are properties of function objects)*/
    function isDef(obj){
      return (typeof obj != 'undefined');
    }

    function isSet(obj){
      return (this.isDef(obj) && obj !== null);
    }
    
    /*Checks if obj is defined then if it's a function. Used
    for safely calling callbacks*/
    function isFunc(obj, throwError){
      //console.log('throwError: ' + throwError);
      var te = ( this.isDef(throwError) && throwError.constructor == Boolean ) ? throwError : false;
      //console.log(te);
      if( te && !(obj && {}.toString.call(obj) == '[object Function]') )
        throw 'Not A Function';
      return ( this.isDef(obj) && {}.toString.call(obj) == '[object Function]');
      
    }

    /*Checks param defined if so it returns it, if not returns null, or can throw
    error if desired*/
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
    
    /*Tests for callability and if passes, calls it and returns results*/
    function executeCallback(callback, throwError){
      if( this.isFunc(callback, throwError) ){
        return callback();
      }else{
        return null;
      }
    }
  
    function getSet(_var){
      return function(set){
          if(typeof set == 'undefined')
            return _var;
          else
            return _var = set;
      }; 
    }
  
  return {
    objToString : inspectObj,
    toString : inspectObj,
    printHtml : function() {},
    log : function(msg) {console.log(msg);},
    removeDuplicates : removeDuplicates,
    objectLength : objectlength,
    debug : debug,
    log : log,
    printf : printf,
    isDef : isDef,
    isSet : isSet,
    isFunc : isFunc,
    initParam : initParam,
    executeCallback : executeCallback,
    getSet : getSet
  }
});

