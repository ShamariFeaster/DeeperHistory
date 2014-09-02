structureJS.configure(
{
  directory_aliases : {modules : 'Modules/', 
                       lib : 'lib/',
                       },
  commons : ['modules/Utility','modules/State','modules/IdbClient'], 
  globals : ['lib/jquery','lib/diff_match_patch','lib/jsencrypt.min','lib/MMCD_USAGE']
});