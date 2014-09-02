console.log('manifest loaded');
structureJS.declare('modules/Port');
structureJS.declare('modules/Tab');
structureJS.declare('modules/String');
structureJS.declare('modules/Crypto');
structureJS.declare('modules/System.Define', ['modules/Crypto', 'modules/String','modules/Tab','modules/Port']);
 