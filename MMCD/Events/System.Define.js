(function(){
/*Deeper History - A Personal Recall Engine:
  A Client Side Indexing Algorithm, Search Engine & Chrome Extension
  Written By: Shamari Feaster
  Makes Use Of: Google's Diff/Match/Patch Library
                https://code.google.com/p/google-diff-match-patch/
*/
/*localStorage vars
resultCache
DeepHistoryVersion
highlightColor
*/
var MY_NAME = 'System.Define';
var emptyFunction = function(){};
//Models
var IdbClient = MMCD.classes.IdbClient;

//Managers
var tm = MMCD.getManager('Tab');
var um = MMCD.getManager('Utility');
var pm = MMCD.getManager('Port');
var sm = MMCD.getManager('State');
var strm = MMCD.getManager('String');
var cm = MMCD.getManager('Crypto');
var highlightLoop = null;

function runtimeOnInstalled(){

}

function getDecoration(host, site, siteUrl, dmp){
  var diffResults = null;
  var thisDecoration = '';
  var lastDecoration = '';
  for(var url in host){
    if(url != 'decoration' && url != siteUrl){
      console.log('Diffing: ' + url + ' to ' + siteUrl);
      try{
        diffResults = dmp.diff_main(host[url]['buffer'], site['buffer']);
        dmp.diff_cleanupSemantic(diffResults);
        //console.log(diffResults);
       
        for(var i in diffResults){
          if( diffResults[i][0] == 0 ){
            thisDecoration += diffResults[i][1];
          }
        }
      console.log('Host decoration: ' + thisDecoration);
      if(thisDecoration.length > lastDecoration.length){
        lastDecoration = thisDecoration;
        console.log('New Host decoration: ' + lastDecoration);
      }
      thisDecoration = '';
      }catch(e){
        console.log('Error diffing. Returning empty array as Diff result');
        console.log(e);
         host['decoration'] = '';
      }
    }
  }
  host['decoration'] = lastDecoration;
}

function runtimeOnConnect(port) {

  var tabId = tm.currId();
  //if(window.port == null || _lastTabId != _currentTabId){
  if(pm.addPort(tabId, port)){
    um.debug(2,MY_NAME,'runtimeOnConnect','Port pushed onto Map');
    um.debug(2,MY_NAME,'runtimeOnConnect',"onConnect tabId: " + tabId);
    um.debug(2,MY_NAME,'runtimeOnConnect','channel open on port#: ' + port.portId_);
  }else{
    um.debug(1,MY_NAME,'runtimeOnConnect','ERROR: Problem adding port to map');
  }
  pm.postMessageToPort(tm.currId(),{changeHighlightColor : localStorage['highlightColor']});
    port.onMessage.addListener(function(msg) {
      for(var i in msg){var msgType = i};//get message
        switch(msgType) {
          //**********************DIFF QUEUEING*************************************
          case 'setRawPage':
            msg = msg['setRawPage'];
            var dmp = new diff_match_patch();
            var timestamp, diffId, diffResults, url, html, site, title, host, siteUrl,
                insertionFound = false, queueItem = {}, diffFound = false, hostName = '';
            
            hostName = strm.getHostName(msg.url);
            timestamp = diffId = msg.timestamp;
            url = siteUrl = msg.url;
            
            host = sm.persist('cache')['sites'][hostName]; //indexed on href
            site = host[url];
            site['buffer'] = strm.sanitize( msg.html );
           
            title = msg.title;
            
            //is this the first time?
            if( site['init']['html'] == '' ){
              console.log('STORING INIT HTML');
              
              var contentLength = site['buffer'].length;
              if(typeof host['decoration'] == 'undefined'){
                getDecoration(host, site, siteUrl, dmp);
              }else if(host['decoration'].length < ((parseFloat(contentLength) * sm.TARGET_COMPRESSION))){//targeting 15% reduction in length
                console.log('INSUFFICIENT COMPRESSION: ' + (host['decoration'].length / contentLength));
                getDecoration(host, site, siteUrl, dmp);//if not meeting reduction, we try again
              }
              if(typeof host['decoration'] != 'undefined')
                console.log(host['decoration'].length + ' ' + ((parseFloat(contentLength) * sm.TARGET_COMPRESSION)));
                
              console.log('BEFORE DR: ' + sm.strSizeInKb(site['buffer']) + + 'kB');
              if(typeof host['decoration'] != 'undefined')
                site['buffer'] = strm.removeDecoration(site['buffer'], host['decoration']);
              console.log('AFTER DR: ' + sm.strSizeInKb(site['buffer']) + + 'kB');
              console.log('FINAL COMPRESSION: ' + (host['decoration'].length / contentLength));
              //getDecoration(host, site, siteUrl, dmp);
       
              
              site['init']['html'] = site['buffer'];
              site['init']['timestamp'] = timestamp;
              site[timestamp] = site['buffer'];
              site['title'] = title;
              queueItem['url'] = url;
              queueItem['timestamp'] = timestamp;
              if(sm.isExtenstionEnabled() == true)
                sm.persist('processQueue').push(queueItem);

            //there is pre-existing html, do a diff
            }else{
              console.log('BEFORE DR: ' + sm.strSizeInKb(site['buffer']) + 'kB');
              if(typeof host['decoration'] != 'undefined')
                site['buffer'] = strm.removeDecoration(site['buffer'], host['decoration']);
              console.log('AFTER DR: ' + sm.strSizeInKb(site['buffer']) + 'kB'); 
              try{
                diffResults = dmp.diff_main(site['init']['html'], site['buffer']);
                dmp.diff_cleanupSemantic(diffResults);
              }catch(e){
                console.log('Error diffing. Returning empty array as Diff result');
                console.log(e);
                diffResults = [];
              }

              //if there is new html, add diffObj to site obj
              for(var i in diffResults){
                if( diffResults[i][0] == 1 ){
                  console.log('***DIFF INSERTION Found****: ' + diffResults[i][1]);
                  site[timestamp] = diffResults[i][1];//add diff record to site
   
                  queueItem['url'] = url;
                  queueItem['timestamp'] = timestamp;
                  diffFound = true;
                  insertionFound = true;
                }else if( diffResults[i][0] == -1 ){
                  diffFound = true;
                }else if( diffResults[i][0] == 0 ){

                }
              }
              if(diffFound){//could be deletion or insertion
                site['init']['html'] = site['buffer'];
                console.log('Diff Found');
              }else{
                console.log('No Diff Found');
              }
              
              if(insertionFound && sm.isExtenstionEnabled() == true){
                sm.persist('processQueue').push(queueItem);   
                console.log('PROCESS QUEUE');
                console.log( sm.persist('processQueue') );
              }else{
                console.log('No Insertion Found. No Queue Actions');
              }
              
              
                
            }

            console.log('PROCESS QUEUE');
            //console.log( sm.persist('processQueue') );
            break;
          //**********************END DIFF QUEUEING**********************************
          case 'mouseMoveDetected':
            msg = msg['mouseMoveDetected'];
            sm.lastMouseMove( (new Date()).getTime() );
            break;
          case 'stopHighlightLoop':
            msg = msg['stopHighlightLoop'];
            console.log('Highlight Loop Stopped');
            clearInterval(sm.highlightLoop());
            //sm.highlightLoop(null);
            break;
          case 'startHighlightLoop':
            msg = msg['startHighlightLoop'];
            console.log('startHighlightLoop Started');
            clearInterval(sm.highlightLoop());
            sm.highlightLoop( setInterval(function(){
                            console.log('Trying To Post: ' + msg);
                            pm.postMessageToPort(tm.currId(), { highlight: { word : msg } } );
                          },1500));
            break;
        }
      
    });
  //}
  
    port.onDisconnect.addListener(function(){
      var portId = (typeof port == 'undefined') ? 'undefined' :  port.portId_;
      var index = -1;
      um.debug(2,MY_NAME,'runtimeOnConnect','CLOSED:: Port for tab# ' + tabId + ', port# ' + portId + ' has been closed');

      if(portId != 'undefined'){
        um.debug(2,MY_NAME,'runtimeOnConnect','REOPENING: port for tab# ' + tabId + ' .Re-executing content script.');
       if(pm.hasPorts(tabId)) 
        index = pm.getTabPorts(tabId).indexOf(port);
        
        if (index > -1) {
          pm.getTabPorts(tabId).splice(index, 1);
        }
        try{
          chrome.tabs.executeScript(tabId, {file: 'core.js'});
        }catch(e){
          um.debug(1,MY_NAME,'runtimeOnConnect','ERROR: Trying to re-execute content script on tab.');
        }
        
      }
    });
  
}

function contextOnClicked(info, tab) {

}

function commandsOnCommand(command) {

}

//this is to capture the opening tab on chrome startup
function tabsOnCreated(tab) {
  tm.currId(tab.id);
  tm.currTitle(tab.title);
  console.log('Tab created ' + tm.currId());
  if(tm.currTitle() == null) {
    tm.currId(tab.id);
    tm.currTitle(tab.title);
  }
}

//captures current tab information
function tabsOnActivated(tab) {

  if(typeof tab != 'undefined'){
    chrome.tabs.get(tab.tabId, function(tab){
      var sm = MMCD.getManager('State');
      var pm = MMCD.getManager('Port');
      var oldId = tm.currId();
      pm.postMessageToPort(oldId, {turnOffShift : true});
      tm.currId(tab.id);
      tm.lastId(tm.currId());
      tm.currTitle(tab.title);
      sm.currPageUrl(tab.url);

      um.log('tabsOnActivated', um.printf('Current Tab#: %s Activated. Last Tab# %s Has Port Open: %s Page Title: %s, url: %s'
                        , tm.currId(), tm.lastId(), pm.hasPorts(tm.currId()), tm.currTitle(), sm.currPageUrl()),MY_NAME,2);
      try{//Should use
        chrome.tabs.executeScript(tab.id, {file: 'lib/jquery.js'}, function(){
          chrome.tabs.executeScript(tab.id, {file: 'core.js'},
          function(){
            um.log('tabsOnActivated','Tab Activated and script run.',MY_NAME,1);
            pm.postMessageToPort(tab.id,{changeHighlightColor : localStorage['highlightColor']});
            });
          });
      }catch(e){
        um.debug(1,MY_NAME,'runtimeOnConnect','ERROR: Trying to re-execute content script on tab.');
      }
    });
  } 
}

function tabOnRemoved(tabId, info) {
    um.debug(1,MY_NAME,'tabOnRemoved','TAB CLOSED: Removing port of tab# ' + tabId +' from tab#-to-portObj table. Table is now: ');
    pm.removePorts(tabId);
    if(tm.currId() == tabId) {
			tm.isOpen(false);
		}
}

function tabsOnUpdated(tabId, changeInfo, tab){
  
  function addSite(url){
    if(typeof sm.persist('cache')['sites'][strm.getHostName(url)] == 'undefined')
      sm.persist('cache')['sites'][strm.getHostName(url)] = {};
    var host = sm.persist('cache')['sites'][strm.getHostName(url)];
    var timestamp = (new Date()).getTime();
    var initObj = {html : '', timestamp : timestamp}; //make class
    var siteObj = { init : initObj,  buffer : ''}; // make class
    if(typeof host[url] == 'undefined'){
      console.log('addSite: Host URL was undefined on' + url);
      host[url] = siteObj;
      console.log(host[url]);
    }else{
      console.log('addSite: Host URL was defined on ' + url);
      console.log(host[url]);
    }
    return timestamp;
  }
  if(changeInfo.status == 'loading'){
    tm.currId(tab.id);
  }
  if(changeInfo.status == 'complete'){
    tm.lastId(tm.currId);
    tm.currId(tab.id);
    tm.currId(tab.id);
    tm.currTitle(tab.title);
    sm.currPageUrl(tab.url);
    var hostName = strm.getHostName(tab.url);
    /*Blocking 'google.com because this is of little recall value and it takes up a lot of space in the 
    db*/
    if(hostName != 'www.google.com'){
      var timestamp = addSite(tab.url);
      pm.postMessageToPort(tm.currId(), {getRawPage : {timestamp : timestamp, url : tab.url, title : tab.title } });
    }
    
    um.log('tabsOnUpdated',um.printf('Tab Finished Updating. Tab ID: %s. Tab Title: %s, url: %s',tm.currId(),tm.currTitle(),sm.currPageUrl()),MY_NAME, 2);
  }
}

function process(queueItem, start){
  //sanity check and base case
  if(queueItem == -1 || typeof queueItem == 'undefined')
    return;
  //time splitting
  if( sm.secDiff(start) > 1 ){
    processQueue.splice(0,1,queueItem);
    console.log('Could not removing articles in alloted time. Placing back on queue. Returning');
    process(-1);
  }
  
  var url, timestamp, site, tagsStripped = '',whitespaceStripped = '', nextQueueItem, scriptsStripped, urlStripped, styleScripped,
      processQueue = sm.persist('processQueue'), storeObj = null, terms = '';
  
  //get data to be processed
  url = queueItem['url'];
  timestamp = queueItem['timestamp'];
  site = sm.persist('cache')['sites'][strm.getHostName(url)][url];
  
  
  
  if(typeof site != 'undefined'){
    
    //do process
    if(site[timestamp] != ''){
      //need to see if user wants encryption
      terms = cm.encrypt( site[timestamp] ); //CRYPTO >>>
      var size = sm.strSizeInKb(terms.length);
      storeObj = {timestamp : timestamp, url : url, terms : terms, title : site['title'], size : size, encrypted : true  };
      //prevent duplicate key failure
      if(sm.lastKeyAdded() == timestamp)
        timestamp++;
      
      IdbClient.addRecord(storeObj, function(addedRecord){
        var searchCache = sm.persist('searchCache');
        sm.dbSize( sm.dbSize() + parseFloat(size) );
        sm.cacheSize( sm.cacheSize() + parseFloat(size) );
        
        //if encryptin running then do this
        addedRecord.terms = site[timestamp];//unencrypted terms for cache  //CRYPTO >>>
        
        searchCache.push( addedRecord );
        sm.lastKeyAdded( addedRecord.timestamp );
        console.log('QUEUE EMPTY: Finished processing "' + addedRecord.title + '" It is ' + addedRecord.size + 'kb. ' + sm.secDiff(start) + ' Sec');
        MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.page_indexed);
      });
      
    }else{
      console.log('DB Entry Rejected: Empty Input');
    }
    //What's the next processing move?
    if( processQueue.length > 0 ){
      nextQueueItem = processQueue.splice(0,1)[0];
      process( nextQueueItem, start );
    }else{
      process(-1);
    } 
    
  }else{
    console.log('Site was undefined');
  }
  
  
}
function processNextItem(){
  var nextQueueItem,
      processQueue = sm.persist('processQueue');
      
  if(processQueue.length > 0){
    nextQueueItem = processQueue.splice(0,1)[0];//pop
    process( nextQueueItem, sm.currentTime() );
  }
}

function processLoop(){
  console.log('tick');
  var timeSinceMouseMove = sm.currentTime() - sm.lastMouseMove();
  var processQueue = sm.persist('processQueue');
  if( timeSinceMouseMove  >= sm.PROCESS_DELAY_TIME && processQueue.length > 0 && sm.isExtenstionEnabled() == true){
    console.log('Processing Queue Now');
    sm.lastMouseMove( sm.currentTime() );
    processNextItem();
  }
}

//Omnibox
function onInputStarted(){
  MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.search_occurance);
}
function optionCommand(input, suggestFunction){
  var suggestions = [];
  switch (input){
    case '.hl':
      chrome.omnibox.setDefaultSuggestion({description : '<dim>Change Your Selection Color Below</dim>' });
      suggestions.push( {content : '.hl-default', description : '<match>Default Color</match>'} );
      suggestions.push( {content : '.hl-yellow', description : '<match>Yellow</match>'} );
      suggestions.push( {content : '.hl-green', description : '<match>Green</match>'} );
      suggestions.push( {content : '.hl-blue', description : '<match>Blue</match>'} );
      return suggestions;
      break;
    case '.dsize':
      var sizeString = (sm.dbSize() > 1000) ? (sm.dbSize() / 1000.0).toFixed(2) + 'MB' : sm.dbSize().toFixed(2) + 'kB';
      chrome.omnibox.setDefaultSuggestion({description : '<dim>Your Deeper History DB Size Is: ' + sizeString + '</dim>' });
      return suggestions;
      break;
    case '.csize':
      var sizeString = (sm.cacheSize() > 1000) ? (sm.cacheSize() / 1000.0).toFixed(2) + 'MB' : sm.cacheSize().toFixed(2) + 'kB';
      chrome.omnibox.setDefaultSuggestion({description : '<dim>Your Deeper History Cache Size Is: ' + sizeString + '</dim>' });
      return suggestions;
      break;
    case '.options':
      chrome.omnibox.setDefaultSuggestion({description : '<dim>Please Select An Option From Below</dim>' });
      suggestions.push( {content : (JSON.parse(localStorage['updateInfo']).update_video || 'http://www.youtube.com/watch?v=Ujvd_jZkXZ4'), description : '<match>Learn The New Features. Select Me Watch The Latest Update Video</match>'} );
      suggestions.push( {content : (JSON.parse(localStorage['updateInfo']).bug_report_url || 'https://chrome.google.com/webstore/support/aohgidnfhlaciophgjldellglmocdkfn?hl=en&gl=US#bug'), description : '<match>Report A Bug</match>'} );
      suggestions.push( {content : (JSON.parse(localStorage['updateInfo']).dev_twitter || 'https://twitter.com/shamari_feaster'), description : '<match>Hit The Dev Up On Twitter</match>'} );
      suggestions.push( {content : (JSON.parse(localStorage['updateInfo']).website_url || 'http://lariattech.com'), description : '<match>Learn About - Lariat Tech - The Company That Makes Deeper History</match>'} );
      suggestions.push( {content : 'options.html', description : '<match>Go To The Options Page</match>'} );
      sm.matchFound(true);//to prevent falling through to options page in onInputEntered 
      MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.dot_options_command);
      return suggestions;
      break;
  }
}
function onInputChanged(text, suggest) {
  
  var returnedOptions = null;
  if( (returnedOptions = optionCommand(text)) ){
    suggest(returnedOptions); 
    return;
  }
  chrome.omnibox.setDefaultSuggestion({description : '<dim>Searching Your History For "<match>' + text + '"</match></dim>' });
  var wordsToRemove = strm.wordsToRemove;
  for(var i in wordsToRemove){
    text = text.replace(new RegExp('\\b' + wordsToRemove[i] + '\\b','gi'),' ');
  }
    
  var text = text.toLowerCase();
  var terms = null;
  var results = [];
  var resultCache = {};
  var searchCache = sm.persist('searchCache');
  var regexText = null;
  var conjunctString = '';
  if(text.indexOf(' ') != -1){
    console.log('Space found');
    text = text.replace(/\s+/,'\\s');
  }

  console.log(text);
  if(text.indexOf(',') != -1){
    var conjuncts = text.split(',');//uno,dos,tres
    for(var i in conjuncts){
      if(conjuncts[i] && conjuncts[i] != '\\s'){//no empty conjunct, this would match everything
        conjunctString += '(\\b' + conjuncts[i] + '.*?\\b)';
        conjunctString += '|';
      }
    }
    conjunctString = conjunctString.substr(0,conjunctString.lastIndexOf('|'));//remove trailing '|'
    regexText = new RegExp(conjunctString, 'i');
  }else{
    if(text == '\\s')
      regexText = new RegExp('-(REMOVED WORD)-', 'i');
    else
      regexText = new RegExp('\\b' + text + '.*?\\b', 'i');
  }
  console.log('REGEX: ' + regexText);
  //matches word(s) starting with input text and ending with a word boundary (non-greedy) 
  var regexResults = null;
  var matchedWord = '';
  var matchedResults = {};
  var overflowLinks = [];
  var overflowItem = {};
  var titleMap = {};
  for(var i in searchCache){
    terms = searchCache[i].terms;
    if(text.length > 1 && ( regexResults = regexText.exec( searchCache[i].terms ) ) != null){
      matchedWord = regexResults[0].toLowerCase().trim();//no dups due to case
      matchedResults[matchedWord] = matchedWord; //Use map to remove duplicates
      if(typeof titleMap[searchCache[i].title] == 'undefined'){//Use map to remove duplicates
        titleMap[searchCache[i].title] = true;                //if title already in results, ignore it
        //Prepare Data For Result Overflow Page
        overflowItem['title'] = searchCache[i].title;
        overflowItem['link'] = '<a data-match="'+matchedWord+'" href="' + searchCache[i].url + '" style="font-size: 25px;">' + searchCache[i].title + '</a>';
        overflowItem['match'] = matchedWord;//show matched term over on overflow page
        searchCache[i]['match'] = matchedWord;//for use in dropdown suggestion display 
        var d = new Date(searchCache[i].timestamp);
        var month = d.getMonth() + 1;
        var minutes = ((''+ d.getMinutes()).length == 1) ? '0' + d.getMinutes() : d.getMinutes();
        var hours = (('' + d.getHours()).length == 1) ? '0' + d.getHours() : d.getHours();
        overflowItem['date'] = month + '-' + d.getDate() + '-' + d.getFullYear() + ' ' + hours + ':' + minutes;
        
        results.push( searchCache[i] );
        overflowLinks.push(overflowItem);
        overflowItem = {};
      }
    }
  }
  //constructs string of all matching terms for suggestion dropdown display
  matchedWord = '';
  for(var word in matchedResults){
    matchedWord += ' ' + word;
  }
  matchedWord = matchedWord.trim();//remove leading and trailing spaces
  console.log('Results');
  console.log(results);
  resultCache['searchTerms'] = matchedWord;//actually a \s separated list of terms
  resultCache['results'] = overflowLinks;//array of items to display on overflow page
  localStorage['resultCache'] = JSON.stringify(resultCache);
  var suggestions = [];
  var title = '';
  var matchWord = '';
  var match = null;
  //Searching through database
  for(var i in results){
    //escape for XML parsing
    title = (results[i].title).replace(/"/g,'&quot;').replace(/'/g,'&apos;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/&/g,'&amp;');
    match = results[i].match;
    if(results.length > 3 && i < 1){
      suggestions.push( {content : 'more-results.html', description : '<match>Select Me See The Rest Of The Results</match>'} );     
    } else if(match){ 
      suggestions.push( {content : results[i].url + '|' + match , description : '<match>DeeperHistory Match: <dim>'+ match +'</dim> </match>' + title} );
    }
  }

  //Max Suggestions Length Is 5, What To Do?
  if(suggestions.length > 0){
    console.log(suggestions.length + ' Suggestions Found');
    chrome.omnibox.setDefaultSuggestion({description : '<dim>Found ' + suggestions.length + ' Matche(s) For "<match>' + matchedWord + '"</match></dim>' });
    console.log(suggestions);
    sm.matchFound(true);
  } else {
    console.log('Suggestions NOT Found');
    sm.matchFound(false);
    if(text == '\\s')
      chrome.omnibox.setDefaultSuggestion({description : 'No Matches Found Because This Word Is So Common It Is Not Stored In Your Databse'});
    else
      chrome.omnibox.setDefaultSuggestion({description : '<dim>No Matches Found For <match>"' + text + '"</match> In Your History</dim> <match>Select Me To Go To The Options Page</match>' });
  }
  
  suggest(suggestions);
}

function onInputCancelled(){
  console.log('onInputCancelled');
  chrome.omnibox.setDefaultSuggestion({description : '<dim>Type ".help" For Instructions</dim>' });
}

// This event is fired with the user accepts the input in the omnibox.
function onInputEntered(text) {
  var parts = text.split('|');//  url | matchedword 
  var url = parts[0];
  var matchedWord = parts[1];
  console.log('parts: ' + url + ' ' + matchedWord);
  switch(url){
    case '.db':
      console.log('DB Found');
      chrome.tabs.update(tm.currId(),{url : "database.html"});
      break;
    case '.help':
      chrome.tabs.update(tm.currId(),{url : "help.html"});
      break;
    case '.hl-default':
      localStorage['highlightColor'] = 'default';
      pm.postMessageToPort(tm.currId(),{changeHighlightColor : 'default'});
      break;
    case '.hl-yellow':
      localStorage['highlightColor'] = 'yellow';
      pm.postMessageToPort(tm.currId(),{changeHighlightColor : 'yellow'});
      break;
    case '.hl-blue':
      localStorage['highlightColor'] = 'blue';
      pm.postMessageToPort(tm.currId(),{changeHighlightColor : 'blue'});
      break;
    case '.hl-green':
      localStorage['highlightColor'] = 'green';
      pm.postMessageToPort(tm.currId(),{changeHighlightColor : 'green'});
      break;
    default:
      if(!sm.matchFound()){
        url = 'options.html';
      }else if(url != 'more-results.html'){
        //don't double count overflow page occurances
        MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.match_selected);
      }
      chrome.omnibox.setDefaultSuggestion({description : '<dim>Type ".help" For Instructions</dim>' });
      chrome.tabs.update(tm.currId(), {url : url}, function(tab){
        clearInterval(sm.highlightLoop());
        sm.highlightLoop( setInterval(function(){
                            pm.postMessageToPort(tab.id, { highlight: { word : matchedWord } } );
                          },1500));
      });
      break;
  }
 
}

function onBrowserActionClicked(){
  MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.power_button);
  if( sm.isExtenstionEnabled() == true){
    console.log('Exttension disabled: ' + sm.isExtenstionEnabled());
    chrome.browserAction.setTitle({title: 'Deeper History Is Off. Press To Turn On.\n\nGo To chrome://extensions And Visit The\nDeeper History Options Page To Learn More\nAbout This Feature'});
    sm.isExtenstionEnabled(false);
    chrome.browserAction.setIcon({path: {19: 'images/DH-BA-19px-off.png', 38: 'images/DH-BA-19px-off.png'}});
  }else{
    console.log('Exttension enabled: ' + sm.isExtenstionEnabled());
    chrome.browserAction.setTitle({title: 'Deeper History Is On. Press To Turn Off.\n\nGo To chrome://extensions And Visit The\nDeeper History Options Page To Learn More\nAbout This Feature'});
    sm.isExtenstionEnabled(true);
    chrome.browserAction.setIcon({path: {19: 'images/DH-BA-19px-on.png', 38: 'images/DH-BA-19px-on.png'}});
  }
}

var tabEvents = {
  onUpdated : tabsOnUpdated,
  onRemoved : tabOnRemoved,
  onCreated : tabsOnCreated,
  onActivated : tabsOnActivated
};

var runtimeEvents = {
  onStartup : null,
  onInstalled : null,
  onConnect : runtimeOnConnect
};

var commandEvents = {
  onCommand : commandsOnCommand
};

var contextEvents = {
  onClicked : contextOnClicked
};

var omniboxEvents = {
  onInputEntered : onInputEntered ,
  onInputChanged : onInputChanged,
  onInputStarted : onInputStarted,
  onInputCancelled : onInputCancelled
};

var browserActionEvents = {
  onClicked : onBrowserActionClicked
};

var handlers = {
  tabs : tabEvents,
  runtime : runtimeEvents,
  command : commandEvents,
  context : contextEvents,
  omnibox : omniboxEvents,
  browserAction : browserActionEvents
};
//Browser Actions
chrome.browserAction.onClicked.addListener(handlers.browserAction.onClicked);

chrome.runtime.onConnect.addListener(handlers.runtime.onConnect);
//chrome.commands.onCommand.addListener(handlers.command.onCommand);
chrome.runtime.onStartup.addListener(handlers.runtime.onStartup);
chrome.tabs.onRemoved.addListener(handlers.tabs.onRemoved);
chrome.tabs.onCreated.addListener(handlers.tabs.onCreated);
chrome.tabs.onActivated.addListener(handlers.tabs.onActivated);
chrome.tabs.onRemoved.addListener(handlers.tabs.onRemoved);
chrome.tabs.onUpdated.addListener(handlers.tabs.onUpdated);
//OmniBox
chrome.omnibox.onInputStarted.addListener(handlers.omnibox.onInputStarted);
chrome.omnibox.onInputEntered.addListener(handlers.omnibox.onInputEntered);
chrome.omnibox.onInputChanged.addListener(handlers.omnibox.onInputChanged);
chrome.omnibox.onInputCancelled.addListener(handlers.omnibox.onInputCancelled);
chrome.omnibox.setDefaultSuggestion({description : '<dim>Type ".help" For Instructions</dim>' });



MMCD.hook.onStart = function(){
  //MMCD_USAGE.printTableNames(true);
  setInterval(processLoop, 1000);
  
  sm.ls('DeepHistoryVersion', 16);
  sm.ls('highlightColor', 'default');
  
  /*IndexedDb Stuff*/
  IdbClient = new IdbClient('DeepHistory', sm.ls('DeepHistoryVersion') , 'DeepHistoryIndex');
  
  /*Version Upgrade functions
    Need to move to separate file
    versionXUpgrade - callback in forEach to add encrypted field
    deleteAndReinitStore - just what it sounds like
  */
  function version16Upgrade(record){
    var IdbClient = this;
    if(typeof record.encrypted === 'undefined'){
      record.encrypted = false;
      IdbClient.updateRecord(record);
    }
  }
  
  function deleteAndReinitStore(){
    var IdbClient = this;
    var storeNames = IdbClient.db.objectStoreNames;
    
    for(var i in storeNames){
      if( storeNames[i] == 'DeepHistoryIndex'){
        console.log('Store: DeepHistoryIndex Exits. DELTING IT');
        IdbClient.db.deleteObjectStore('DeepHistoryIndex');
      }
    }
    // Create an objectStore for this database
    IdbClient.db.createObjectStore("DeepHistoryIndex", { keyPath: "timestamp" });
  }

  function updateStoreByVersion(version){
    switch( parseInt(version) ){
      case 16:
        IdbClient.forEach(version16Upgrade);
        break;
    }
  }
  /*End upgrade funtions*/
  
  /*Can only perform store deletes and creations here, any mods to
  store structure have to be done elsewhere*/
  IdbClient.setUpgradeNeeded(function(event){
    IdbClient.initDb(event.target.result);
    console.log('onupgradeneeded  fired On Version: ' + sm.ls('DeepHistoryVersion'));
  });

  IdbClient.open(function(){
    /*IF user DB version is <= 16 we fire a forEach that checks for encrypted flag on
    every record. If it's not there we know they have no encrypted record create/set the field
    to false. Unfortunately we will do this check everytime if they remain on 16. 
    
    Other possible downside is a user that had < 16 but jumped right to 17. Will need yo put logic
    to recognize if version is > 11 (version every one is currently on) and do the check.
    
    USE LOCALSTORE TO SIGNIFY IF THIS UPGRADE HAS HAPPENED SO WE DON'T DOUBLE TRAVERSE EVERY STARTUP
    */
    
    updateStoreByVersion( sm.ls('DeepHistoryVersion') );
    
    var searchCache = sm.persist('searchCache');

    var totalDBSize = 0.0;
    var cacheSize = 0.0;
    var dbRecordSize = 0.0;
    var MAX_DB_SIZE = 700;//kB
    var start = sm.currentTime();    
    console.log('PUTTING TERMS INTO SEARCH CACHE');
    
    IdbClient.forEach(function(record){//forEach record
      if(sm.currentTime() - record.timestamp < sm.MAX_AGE){
        dbRecordSize = record.size;
        //CRYPTO >>> decrypt encrypted records
        if(typeof record.encrypted !== 'undefined' && record.encrypted == true){
          record.terms = cm.decrypt( record.terms );
          record.size = sm.strSizeInKb(record.terms);//decrypted size in cache 
        }
        
        searchCache.push( { timestamp : record.timestamp, url : record.url, 
                            terms : record.terms, title : record.title, size : record.size} );
        cacheSize += parseFloat(record.size);
      }
      totalDBSize += parseFloat(dbRecordSize);
    
    }, function(){//onComplete
      sm.dbSize(totalDBSize);
      sm.cacheSize(cacheSize);
      console.log('>>> FINISHED PUTTING TERMS INTO SEARCH CACHE IN ' + sm.secDiff(start) + 'sec');
      console.log('DB size is ' + totalDBSize + 'kB' );
      console.log('MAX_DB_SIZE is ' + MAX_DB_SIZE + 'kB' );
      sm.persist('searchCache', searchCache);
      console.log(searchCache);
    });
      
  });
  
  chrome.permissions.remove({permissions : ['history']}, function(granted){
    if(granted == true){
      console.log('History permission is removed');
    }
  });
}();

})();
