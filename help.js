$(function(){
  MMCD_USAGE.processOccuranceByUser(MMCD_USAGE.EVENTS.help_page_opened);
  $('.report_bug').attr('href', ( JSON.parse(localStorage['updateInfo']).bug_report_url || 'https://chrome.google.com/webstore/support/aohgidnfhlaciophgjldellglmocdkfn?hl=en&gl=US#bug') );
  $('#dev_twitter').attr('href', ( JSON.parse(localStorage['updateInfo']).dev_twitter || 'https://twitter.com/shamari_feaster') );
  $('#version_notes').attr('href',( JSON.parse(localStorage['updateInfo']).version_notes || 'http://deeperhistory.wordpress.com/version-notes/') );
});