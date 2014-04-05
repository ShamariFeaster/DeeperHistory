
chrome.runtime.onInstalled.addListener(function(details){
  console.log(details);
  switch(details.reason){
    case 'install':
      MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.installed);
      console.log('Installed');
      break;
    case 'update':
      MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.updated); 
      break;
  }

  if(MMCD.TEST_LEVEL > 0) {
    console.log('DEV_MODE');
    chrome.tabs.create({url : "background.html"});
  }else {
    console.log('PRODUCTION_MODE');
  }

});


