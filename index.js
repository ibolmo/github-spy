var GithubAPI = require('node-github');
var oboe = require('oboe');
var fs = require('fs');
var Q = require('q');
var EventEmitter = require('events');
var mongoose = require('mongoose');
var debug = require('debug')('app');

const DB_NAME = process.env.DB_NAME;
const MONGO_PASS = process.env.MONGO_DB_PASS;
const MONGO_HOST = process.env.OPENSHIFT_MONGODB_DB_HOST;
const MONGO_PORT = process.env.OPENSHIFT_MONGODB_DB_PORT;

if (MONGO_HOST) {
  mongoose.connect('mongodb://admin:' + MONGO_PASS + '@' + MONGO_HOST + ':' + MONGO_PORT + '/' + DB_NAME);
} else {
  mongoose.connect('mongodb://localhost/' + DB_NAME);
}

var radio = new EventEmitter();

var Event = mongoose.model('Event', { user: String, id: String, created_at: String });

require('dotenv').config();

var github = new GithubAPI({
  debug: process.env.DEBUG,
  version: '3.0.0'
});

var handleEvents = function(err, res){
  if (err) throw new Error(err);

  var last = res.slide(-1)[0];
  Event.findOne({ id: last.id }, function(err, hasUnseenLast){
    var events = res.map(function(e){
      radio.emit('event', e);
      return { user: 'ibolmo', id: e.id, created_at: e.created_at };
    });

    Event.collection.insert(events, function(err, docs){
      if (err) throw new Error(err);
      debug('Inserted ' + docs.length + ' events');
    });

    if (github.hasNextPage(res) && hasUnseenLast){
      github.getNextPage(res, handleEvents);
    }
  });
}

github.events.getFromUser({ user: 'ibolmo' }, handleEvents);

radio.on('event', function(e){

});
