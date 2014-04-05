jQuery(function(){
  var port = chrome.runtime.connect({name: "channel-hover"});
  var lastLinkCount = 0, currLinkCount = 0;
  var customStyles = document.createElement('style'); 
  customStyles.id = 'customStyles';
  document.documentElement.insertBefore(customStyles); 
  function onMessageHandler(msg){
    for(var i in msg){ var msgType = i;}//get message
    switch(msgType) {
      case 'getRawPage':
        msg = msg['getRawPage'];
        port.postMessage({ setRawPage : {html : $('body').html(), timestamp : msg.timestamp, url : msg.url, title : msg.title} });
        break;
      case 'highlight':
        msg = msg['highlight'];
        console.log('Highlight Recived Yea');
        console.log(msg);
        if(typeof msg.word != 'undefined'){

          var wordFound = false;
          if(msg.word)
            wordFound = window.find(msg.word, false, false, true, true, true);
          
          if(!wordFound){
            console.log('Word Not Found');
            var width = 200;
            var height = 100;
            var y = ($(window).height() - height) / 2;
            var x = ($(window).width() - width ) / 2;
            var css = { "background-color": 'white', position : 'absolute', top : y, left : x, width : width, border : '10px solid #C2C7BF'};
            var dialog = '<div id="word_not_found" style="z-index:10000;">\
                          <div id="dh" style="margin:3px 0px;width:100%;top:0;text-align:center;background-color:black;color:white;font-size:20px;">Deeper History</div>\
                          <div id="dh_words" style="margin:3px 0px;width:100%;text-align:center;font-size:15px;" >"' + msg.word + '"</div>\
                          <div style="margin:3px 0px;width:100%;text-align:center;font-size:12px;">Was Not Found. The page Content Has Changed Since You Were Last Here</div>\
                          <button style="width:100%;bottom:0;" id="dh_ok">OK</button>\
                          </div>'
            $('body').append(dialog);
            $('#word_not_found').css(css);
            $('#dh_ok').click(function(){
              $('#word_not_found').css('display','none');
            });
          }
        }
        
        port.postMessage({stopHighlightLoop : true});
        break;
      case 'changeHighlightColor':
        switch(msg['changeHighlightColor']){
          case 'default':
            customStyles.innerHTML = ''; 
            console.log('default');
            break;
          case 'yellow':
            customStyles.innerHTML = '::selection{background-color:yellow;}'; 
            console.log('yellow');
            break;
          case 'blue':
            customStyles.innerHTML = '::selection{background-color:blue;}'; 
            console.log('blue');
            break;
          case 'green':
            customStyles.innerHTML = '::selection{background-color:green;}'; 
            console.log('green');
            break;
        }
        break;
    
    }

  }
  function onMousemoveHandler(e){
    port.postMessage({mouseMoveDetected : true});
  }
 
  //Trick to attach events once per window
  if(typeof window.shamariRunOnce == 'undefined'){
    port.onMessage.addListener(onMessageHandler);
    $(document).mousemove(onMousemoveHandler);
    //check page every 2 seconds for new anchor tags, rebind events if so
    /*
    pollingFunction = setInterval(function(){
      if(lastLinkCount > currLinkCount){
        currLinkCount = lastLinkCount;
        console.log('pollingFunction rebinding ');
      }
      lastLinkCount = $('body a').length;
    },2000);
    */
    window.shamariRunOnce = true;
  }
  
  
  function configureEvents(bindOrUnbind){
    switch(bindOrUnbind){
      case 'bind':
        break;
      case 'unbind':
        break;
    
    }
  
  
  }
	

  
});
