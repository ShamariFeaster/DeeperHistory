$(function(){

  MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.options_opened);
  
  var SECS = 1000
  HOUR = ( (60 * SECS) * 60),
  DAY = HOUR * 24;
  var processInterval = null;
  var historyResults = null;
  var historyObj = null;
  var state = {processTabId : null, lastUrl : true, okToContinue: false, scanStarted : false, scanPaused : false};
  var d = new Date((new Date()).getTime() - (DAY * 3));
  var month = d.getMonth() + 1;
  var minutes = ((''+ d.getMinutes()).length == 1) ? '0' + d.getMinutes() : d.getMinutes();
  var hours = (('' + d.getHours()).length == 1) ? '0' + d.getHours() : d.getHours();
  console.log( 'Getting all sites from: ' + month + '-' + d.getDate() + '-' + d.getFullYear() + ' ' + hours + ':' + minutes);
  var updateVideoUrl = (typeof localStorage['updateInfo'] != 'undefined') ? JSON.parse(localStorage['updateInfo']).update_video : 'http://www.youtube.com/watch?v=Ujvd_jZkXZ4';
  var bugReportUrl = (typeof localStorage['updateInfo'] != 'undefined') ? JSON.parse(localStorage['updateInfo']).bug_report_url : 'https://chrome.google.com/webstore/support/aohgidnfhlaciophgjldellglmocdkfn?hl=en&gl=US#bug';
  $('#update_video').attr('href', updateVideoUrl );
  $('#report_bug').attr('href', bugReportUrl );
  $('#day_input').change(function(e){
    console.log($(e.target).val());
  });
  
  $("input[name=power_button]").click(function(e){
    if($(e.target).val() == 'Enable'){
      chrome.browserAction.enable();
    }else{
      MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.disable_power_button);
      chrome.browserAction.disable();
    }
  });
  
  $('#revoke_history_permission').click(function(){
    chrome.permissions.remove({permissions : ['history']}, function(granted){
      if(granted == true){
        alert('History Permission Has Been Revoked');
      }
    });
  });
 /*The idea is that every tab update has a corresponding event which sets okToContinue sentinel telling processing loop
 to go on. If the completion of the update is blocked by say a alert launched onbeforeunload the onupdate event never fires,
 hence the sentinel is never set and the end result is the historyObj is placed back on the queue, essentially freezing the
 process look progress
 tested using localhost/test/Deeper-History/sites/before-unload-popup.html
 */ 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(tabId == state.processTabId && changeInfo.status == 'complete'){
    state.okToContinue = true;
    console.log('Onupdate fire. URL is : ' + tab.url);
  }
});  
  
$('#scan_history').click(function(){
  if(state.scanStarted == false){
    //Short circuit the confirm if we are restarting
    if (state.scanPaused == true || confirm('We Temporarily Need Permission To Access Your History. History Permission Will Be Revoked After Scan Is Complete')){
      chrome.permissions.request({permissions : ['history']}, function(granted){
        if(granted == true){
          state.scanStarted = true;
          console.log('Days is set to: ' + $('#day_input').val());
          $('#scan_history').text('Pause');
          chrome.history.search({text : '', startTime  : (new Date()).getTime() - (DAY * $('#day_input').val()), maxResults : 500 }, function(results){
            if(!state.scanPaused){//if scan was paused we already have results stored
              historyResults = results.reverse();
              MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.scan_started);  
              }
              
            processInterval = setInterval(function(){
              if(state.scanPaused == true)//set state to unpaused once we start again
                state.scanPaused = false;
              if(historyResults.length > 0){
                  if(state.processTabId == null){
                    historyObj = historyResults.splice(0,1)[0];
                    chrome.tabs.create({url : historyObj.url}, function(tab){
                      state.processTabId = tab.id;
                      state.okToContinue = false;
                      console.log('CREATE: History Queue length: ' + historyResults.length);
                    });  
                  }else{
                    historyObj = historyResults.splice(0,1)[0];
                    if(state.okToContinue == true){
                      chrome.tabs.update(state.processTabId, {url: historyObj.url}, function(tab){
                          console.log('Update worked. Ok to continue set to false. ' + tab.url );
                          state.okToContinue = false;
                      });
                    }else{
                      historyResults.splice(0,0, historyObj);
                    }
                    
                  }
    
              }else{
                console.log('History Queue Empty. stopping loop');
                MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.scan_finished);
                chrome.permissions.remove({permissions : ['history']}, function(granted){
                  if(granted == true){
                    console.log('History permission is removed');
                  }
                });
                clearInterval(processInterval);
              }
            },2000);
          });//END History search
        }
      });//END permission request
    
    }else{//Permission Request Denied
      alert('Scan Not Performed');
    }
  
  }else{//Scan is already started, user trying to pause
    state.scanStarted = false;
    state.scanPaused = true;
    $('#scan_history').text('Restart');
    clearInterval(processInterval);
  }
  
  
  
  
  
});


});