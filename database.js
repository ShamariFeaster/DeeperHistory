/*
Feature Ideas:
1. compress DB
1a. delete duplicate records
2a. create reverse index
*/
$(function(){
  MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.db_page_opened);
});

jQuery.globalEval = function(){};
var openDbRequest = indexedDB.open("DeepHistory", localStorage['DeepHistoryVersion']);

openDbRequest.onerror = function(event) {
  console.log('IndexedDb: error  fired');
};
openDbRequest.onsuccess = function(event) {
  console.log('Database.html - IndexedDb: onsuccess  fired');
  jQuery("#list4").jqGrid({
      datatype: "local",
      height: 800,
        colNames:['Time', 'Age', 'Title', 'Size (kB)', 'URL', 'Terms'],
        colModel:[
          {name:'prettytime',index:'prettytime', width:100, sorttype:"int"},
          {name:'age',index:'age', width:70},
          {name:'title',index:'title', width:200},
          {name:'size',index:'size', width:30, sorttype:"float"},
          {name:'url',index:'url', width:150},
          {name:'terms',index:'terms', width:900},
          
        ]
    });
  var db = event.target.result;
  console.log(db);
  var transaction = db.transaction(["DeepHistoryIndex"], "readwrite");

  var deepHistoryIndex = transaction.objectStore("DeepHistoryIndex");
  var searchCache = [];
  var record = null;
  var prettyTime = null, d, month, minutes, hours;
  var request = deepHistoryIndex.openCursor();
  var totalSize = 0.0;
  var totalCacheSize = 0.0;
  var numRecords = 0;
  var MAX_AGE = localStorage['DeepHistoryMAX_AGE'];
  var max_hours = ( ((MAX_AGE / 1000) / 3600) > 1) ? ((MAX_AGE / 1000) / 3600) : 0;//3600 is num secs in hour
  var max_days = null;
  if( max_hours > 24 ){
    max_days = parseInt(max_hours / 24);
    max_hours = max_hours % 24;
  }else{
    max_days = 0;
  }
  
  //PUT TERMS INTO SEARCH CACHE
  request.onsuccess = function(event) {
    
    var cursor = event.target.result;
    var age = '';
    if(cursor) {
      record = cursor.value;
      
      d = new Date(record.timestamp);
      month = d.getMonth() + 1;
      
      minutes = ((''+ d.getMinutes()).length == 1) ? '0' + d.getMinutes() : d.getMinutes();
      hours = (('' + d.getHours()).length == 1) ? '0' + d.getHours() : d.getHours();
      prettyTime = month + '-' + d.getDate() + '-' + d.getFullYear() + ' ' + hours + ':' + minutes;
      if((new Date()).getTime() - record.timestamp < MAX_AGE){
        age = 'FRESH';
        totalCacheSize += parseFloat(record.size);
        
      }
      else{
        age = 'STALE';
      }
      searchCache.push( { url : record.url, terms : record.terms, title : record.title, 
                          timestamp : record.timestamp, size : record.size,
                          prettytime : prettyTime, age : age} );
      cursor.continue();
    } else {
      console.log('EODB');
      for(var i = 0;i < searchCache.length;i++){
        totalSize += parseFloat(searchCache[i].size);
        numRecords++;
        jQuery("#list4").jqGrid('addRowData',i,searchCache[i]);
        
      }

      $('#size').text( $('#size').text() + totalSize + 'kb' );
      $('#records').text( $('#records').text() + numRecords);
      $('#cache_size').text( $('#cache_size').text() + totalCacheSize + 'kb' );
      $('#max_age').text( $('#max_age').text() + max_days + ' DAYS, ' + max_hours + ' HOURS' );
    }
    
    
    

  };
};