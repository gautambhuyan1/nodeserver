
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

// ### listen port
app.listen(app.get('port'), function() {
  console.log('Aptivity is running on port', app.get('port'));
});

// ### initDb
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

    //db.createCollection("users", {strict: true});
    //db.createCollection("interests", {strict: true});
    //db.createCollection("activities", {strict: true});
    //db.createCollection("messages", {strict: true});

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

// ### generic get
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

// ### pagecount
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

// ### error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

// ### init DB
initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.use(lib.json());
app.use(lib.urlencoded({extended:true}));

// ### get interests
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
    
// ### get activities
app.get('/activities/userid/:userid/interest/:interest/lat/:lat/lng/:lng', function(req, res) {
    var interest = req.params.interest;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var userid = req.params.userid;
    console.log("Activities", userid, interest, lat, lng);
    var response = function(data) {
        console.log("JSON response for ", interest);
        res.json(data);
    }
    if (!db) {
      initDb(function(err){});
    }
    dbapp.getActivities(db, userid, interest, lat, lng, response);
});
    
// ### get messages on activity 
app.get('/messages/activityid/:activityid', function(req, res) {
    var activityid = req.params.activityid;
    console.log("Messages", activityid);
    var response = function(data) {
        res.json(data);
    }
    if (!db) {
      initDb(function(err){});
    }
    dbapp.getMessages(db, activityid, response);
});
    
// ### post new user
app.post('/user', function(req, res) {
    var content = req.body;
    var username = content['username'],
        imsi = content['imsi'];

    if (!db) {
      initDb(function(err){});
    }
    var response = function(data) {
        res.json(data);
    }
    console.log("Create user", username, imsi);
    dbapp.createUser(db, username, imsi, response);
});

// ### post new interest (admin only)
app.post('/interest', function(req, res) {
    var content = req.body;
    var interest = content['interest'];
    if (!db) {
      initDb(function(err){});
    }
    console.log("Create Interest", interest);
    dbapp.addInterest(db, interest);
    console.log({interest:interest});
    res.json({done:true});
});
    
// ### post new activity
app.post('/activity', function(req, res) {
    var content = req.body;
    var interest = content['interest'],
        username = content['username'],
        userid = content['userid'],
        lat = content['lat'],
        lng = content['lng'],
        activity = content['activity'],
        date = content['date'];
    console.log({userid:userid, username:username, interest:interest, activity:activity, lat:lat, lng:lng, date:date});
    if (!db) {
      initDb(function(err){});
    }
    var response = function(data) {
        res.json(data);
    }
    dbapp.createActivity(db, userid, username, interest, activity, lat, lng, date, response);
});
    
// ### post new message
app.post('/message', function(req, res) {
    var content = req.body;
    var activityid = req.body['activityid'],
        username = content['username'],
        userid = content['userid'],
        message = req.body['message'];

    console.log({userid:userid, username:username, activityid:activityid, message:message});
    if (!db) {
      initDb(function(err){});
    }


    var update_response = function() {
       res.json({done:true});
    }

    dbapp.createMessage(db, userid, username, activityid, message, update_response);
});
    
// ### generic function
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
