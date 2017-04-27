
var express = require('express'),
    app     = express(),
    lib     = require('body-parser'),
    dbapp   = require('./db.js');
    
var db = null,
    dbDetails = new Object();


app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));

// views is directory for all template files
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');

//app.get('/', function(request, response) {
//  response.render('pages/index');
//});

app.listen(app.get('port'), function() {
  console.log('Aptivity is running on port', app.get('port'));
});

var initDb = function(callback) {
//console.log("InitDB called"+mongoURL);
  mongoURL = "mongodb://aptivity:aptivity123@ds119081.mlab.com:19081/activity";
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

//console.log("InitDB return"+conn);
    db = conn.db("activity");
    console.log("initDb "+ db);
    dbDetails.databaseName = db.databaseName;
    //dbDetails.url = mongoURLLabel;
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
    console.log("Activities", interest, lat, lng);
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
    console.log("Messages", activity);
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
    console.log("Create Interest", interest);
    dbapp.addInterest(db, interest);
    console.log({interest:interest});
    res.json({done:true});
});
    
app.post('/activity', function(req, res) {
    var interest = req.body.interest,
        lat = parseFloat(req.body.lat),
        lng = parseFloat(req.body.lng),
        activity = req.body.activity;
    console.log({interest:interest, lat:lat, lng:lng});
    if (!db) {
      initDb(function(err){});
    }
    var response = function(data) {
        res.json(data);
    }
    dbapp.createActivity(db, interest, activity, lat, lng, response);
    //res.json({done:true});
});
    
app.post('/message', function(req, res) {
    var activity = req.body.activity,
        message = req.body.message;
    console.log({activity:activity, message:message});
    if (!db) {
      initDb(function(err){});
    }


    var update_response = function() {
       res.json({done:true});
    }

    dbapp.createMessage(db, activity, message, update_response);
});
    
app.use(function(req, res, next) {
    console.log("Unsupported function", req);
    //res.writeHead(200, {'Content-type' : 'text/html'});
    //res.end("");
    res.json({done:true});
    next();
});

//app.listen(port, ip);
//app.listen(app.get('port'));
//console.log('Server running on http://%s', port);

module.exports = app ;
