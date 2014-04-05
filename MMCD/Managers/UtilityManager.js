MMCD.managers.Utility = (function(){
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
    if(MMCD.DEBUG_LEVEL >= debugLevel)
      console.log(className + ' : ' + functionName + '() >> ' + msg);
  
  }
  function log(functionName, msg, myName, oDebugLevel){
    var myName = (typeof myName == 'undefined' || myName === '') ? 'DEBUG' : myName;
    var debugLevel = (typeof oDebugLevel == 'undefined') ? 1 : oDebugLevel;
    if(MMCD.DEBUG_LEVEL >= debugLevel)
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
  
  return {
    objToString : inspectObj,
    toString : inspectObj,
    printHtml : function() {},
    log : function(msg) {console.log(msg);},
    removeDuplicates : removeDuplicates,
    objectLength : objectlength,
    debug : debug,
    log : log,
    printf : printf
  }
})();

