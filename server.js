//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan'),
    lib     = require('body-parser'),
    dbapp   = require('./db.js');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}

var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
//console.log("InitDB called"+mongoURL);
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

console.log("InitDB return"+conn);
    db = conn;
    console.log("initDb "+ db);
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    db.createCollection("users", {strict: true});
    db.createCollection("interests", {strict: true});
    db.createCollection("activities", {strict: true});
    db.createCollection("messages", {strict: true});

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.use(lib.json());
app.use(lib.urlencoded({extended:true}));

app.get('/interests', function(req, res) {
    var response = function(data) {
        res.json(data);
    }
    initDb();
        
    console.log("GetInterests"+db);
    if (!db) {
      initDb(function(err){});
    }
    dbapp.getInterests(db, response);
});
    
app.get('/activities/interest/:interest/lat/:lat/lng/:lng', function(req, res) {
    var interest = req.params.interest;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var response = function(data) {
        res.json(data);
    }
    if (!db) {
      initDb(function(err){});
    }
    dbapp.getActivities(db, interest, lat, lng, response);
});
    
app.get('/messages/activity/:activity', function(req, res) {
    var activity = req.params.activity;
    //console.log(activity);
    var response = function(data) {
        res.json(data);
    }
    if (!db) {
      initDb(function(err){});
    }
    dbapp.getMessages(db, activity, response);
});
    
app.post('/interest', function(req, res) {
    var interest = req.body.interest;
    if (!db) {
      initDb(function(err){});
    }
    dbapp.addInterest(db, interest);
    console.log({interest:interest});
    res.json({done:true});
});
    
app.post('/activity', function(req, res) {
    var interest = req.body.interest,
        lat = req.body.lat,
        lng = req.body.lng,
        activity = req.body.activity;
    console.log({interest:interest, lat:lat, lng:lng});
    if (!db) {
      initDb(function(err){});
    }
    dbapp.createActivity(db, interest, activity, lat, lng);
    res.json({done:true});
});
    
app.post('/message', function(req, res) {
    var activity = req.body.activity,
        message = req.body.message;
    console.log({activity:activity, message:message});
    if (!db) {
      initDb(function(err){});
    }
    dbapp.createMessage(db, activity, message);
    
    res.json({done:true});
});
    
app.use(function(req, res, next) {
    res.writeHead(200, {'Content-type' : 'text/html'});
    res.end("<h1>Unsupported function<\h1>");
    next();
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
