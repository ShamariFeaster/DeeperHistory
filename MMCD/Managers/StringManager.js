MMCD.managers.String = (function(){

  var wordsToRemove = ['the','be','and','of','a','in','to','have','to','it','I','that','for','you','he','with','on','do','say',
    'this','they','at','but','we','his','from','that','not','she','or','as','what','go','their','can','who','get','if','would',
    'her','my','make','about','know','will','as','up','there','so','think','when','which','them','me','people','take','out','into',
    'just','see','him','your','come','could','than','like','how','then','its','our','these','also','because','her','though','us',
    'should','as','too','when','something','so','an'];


return {
  wordsToRemove : wordsToRemove,
  removeTags : function(input){
    var regexTags = /<.*?>/gi;
    var regexNoscriptTags = /&lt;.*?&gt;/gi;
    input = input.replace(regexNoscriptTags, ' ').replace(/\s+/g,' ');
    return input.replace(regexTags, ' ').replace(/\s+/g,' ');
  },
  removeComments : function(input){
    var regex = /<!--.*?-->/gi;
    return input.replace(regex, ' ').replace(/\s+/g,' ');
  },
  removeScripts : function(input){
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ').replace(/\s+/g,' ');
  },
  removeStyles : function(input){
    return input.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ').replace(/\s+/g,' ');
  },
  removeEscapes : function(input){
    return input.replace(/&[a-z;]+;/g, ' ').replace(/\s+/g,' ');
  },
  removeDuplicates : function(input){
    var myMap = {},
        duplicatesStripped = '';
    var wordArray = input.toLowerCase().split(' ');

    for(var i in wordArray){
      myMap[ wordArray[i] ] = wordArray[i];
    }
    var mapSize = 0;
    var type = '';
    for(var x in myMap){
      type = typeof myMap[x];
      if(typeof myMap[x] != 'function'){
        duplicatesStripped += ' ' + myMap[x];
        mapSize++; 
      }
    }

    return duplicatesStripped;   
  },
  removeCommons : function(input){
    var commonsStripped = '',
        regex = null,
        result = null;

        for(var i = 0;i < wordsToRemove.length; i++){
      regex = new RegExp('\\b' + wordsToRemove[i] + '\\b','gi');
      commonsStripped = input.replace(regex,' ').replace(/\s+/g,' ');  
    }
    return commonsStripped;
  },
  removeWhitespace : function(input){
    return input.replace(/\s+/g,' ');
  },
  sanitize : function(input){
    var output = '';
    output = this.removeComments( input );
    output = this.removeScripts( output );
    output = this.removeStyles( output );
    output = this.removeTags( output );
    output = this.removeDuplicates( output );
    output = this.removeCommons( output );
    output = this.removeEscapes( output );
    return this.removeWhitespace( output );
  },
  getHostName : function(input){
    var hostName = 'unknown';
    var hostRegex = new RegExp('http(s)*:\/\/([^\/]*)+\.([^\/]*)+(\/)*(.*)*','i');
    var result = hostRegex.exec(input);

    if(result != null)
      hostName = result[2];
    return hostName;
  },
  escapeRegex : function(input){
    return input.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  },
  removeDecoration : function(input, decoration){
    var split = decoration.split(' ');

    for(var i in split){
      //console.log(this.escapeRegex(split[i]));
      input = input.replace(new RegExp('\\b'+this.escapeRegex(split[i])+'\\b','i'),' ');
    }
    return this.removeWhitespace(input);
  }

};

})();