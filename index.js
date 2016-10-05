require('dotenv').config();

var GithubAPI = require('github');
var debug = require('debug')('app');
var fs = require('fs');
var KeenTracking = require('keen-tracking');

var USERS = require('./users');

var keen = new KeenTracking({
  projectId: process.env.KEEN_ID,
  writeKey: process.env.KEEN_KEY
});

var github = new GithubAPI({
  debug: process.env.DEBUG
});

github.authenticate({
    type: 'oauth',
    key: process.env.GITHUB_ID,
    secret: process.env.GITHUB_SECRET
});

var DB_FILE = (process.env.OPENSHIFT_DATA_DIR || '.') + '/db.json';

var db = {};
try {
  db = JSON.parse(fs.readFileSync(DB_FILE));
} catch(e){
  debug(e);
}

var pagesEnroute = {};
var keensEnroute = {};
var uid = 0;

USERS.forEach(function(user){
  pagesEnroute[user] = true;

  var handleEvents = function(err, res){

    if (err) throw new Error(err);

    var lastSeen = db[user];
    var earliest = res.slice(-1)[0];
    var needsToFetchMore = earliest && (Number(earliest) > Number(lastSeen));
    debug(user + (needsToFetchMore ? ' needs to fetch more' : ' has no more events'));
    debug('found ' + res.length + ' events');

    res.reverse().forEach(function(e){
      if (Number(e.id) > Number(db[user] || 0)) {
        db[user] = e.id;
        var payload = {
          user: user,
          keen: { timestamp: new Date(e.created_at).toISOString() },
          actor: e.actor.login,
          repo: e.repo.name
        };

        debug(user + ' (' + e.type + ') ' + JSON.stringify(payload, null, '  '));

        var i = uid++;
        keensEnroute[i] = true;

        keen.recordEvent(e.type, payload, function(){
          delete keensEnroute[i];
          if (!Object.keys(keensEnroute).length){
            debug('all events tracked');
            process.exit();
          }
        });
      }
    });

    if (github.hasNextPage(res) && needsToFetchMore){
      debug('Getting next page: ' + res.link);
      github.getNextPage(res, handleEvents);
    } else {
      debug('Done. Last event: ' + db[user]);
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, '  '));
      delete pagesEnroute[user];

      if (!Object.keys(pagesEnroute).length){
        debug('all pages requested');
      }
    }
  };

  github.activity.getEventsForUser({ user: user, per_page: 100 }, handleEvents);
});
