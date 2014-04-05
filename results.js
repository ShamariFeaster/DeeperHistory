$(function(){
MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.overflow_opened);
var searchResults = JSON.parse( localStorage['resultCache'] );
$('#search_terms').text(searchResults['searchTerms']);
searchResults = searchResults['results'];
document.title = 'DeeperHistoy';
jQuery("#list4").jqGrid({
  datatype: "local",
  height: 800,
    colNames:['Date', 'Site', 'Matched Word'],
    colModel:[
      {name:'date',index:'date', width:100},
      {name:'link',index:'link', width:700},
      {name:'match',index:'match', width:100}
    ]
});

for(var i=0;i<=searchResults.length;i++){
  jQuery("#list4").jqGrid('addRowData',i+1,searchResults[i])
  
}
jQuery("#list4").setGridParam({sortname:'date', sortorder: 'desc'}).trigger('reloadGrid');
jQuery('a').click(function(){
  MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.overflow_match_selected);
  var port = chrome.runtime.connect({name: "channel-hover"});
  var matchWord = $(this).data('match');
  console.log('index:' + matchWord );
   port.postMessage({startHighlightLoop: matchWord});
});
});

