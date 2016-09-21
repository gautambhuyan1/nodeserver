var app = require('express')();
var lib = require('body-parser');
var db = require('./db.js');

app.use(lib.json());
app.use(lib.urlencoded({extended:true}));

app.get('/interests', function(req, res) {
    var response = function(data) {
        res.json(data);
    }
        
    db.getInterests(response);
});
    
app.get('/activities/interest/:interest/lat/:lat/lng/:lng', function(req, res) {
    var interest = req.params.interest;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var response = function(data) {
        res.json(data);
    }
    db.getActivities(interest, lat, lng, response);
});
    
app.get('/messages/activity/:activity', function(req, res) {
    var activity = req.params.activity;
    //console.log(activity);
    var response = function(data) {
        res.json(data);
    }
    db.getMessages(activity, response);
});
    
app.post('/interest', function(req, res) {
    var interest = req.body.interest;
    db.addInterest(interest);
    console.log({interest:interest});
    res.json({done:true});
});
    
app.post('/activity', function(req, res) {
    var interest = req.body.interest,
        lat = req.body.lat,
        lng = req.body.lng,
        activity = req.body.activity;
    console.log({interest:interest, lat:lat, lng:lng});
    db.createActivity(interest, activity, lat, lng);
    res.json({done:true});
});
    
app.post('/message', function(req, res) {
    var activity = req.body.activity,
        message = req.body.message;
    console.log({activity:activity, message:message});
    res.json({done:true});
});
    
app.use(function(req, res, next) {
    res.writeHead(200, {'Content-type' : 'text/html'});
    res.write("<h1> Hello world <\h1>");
    next();
});

app.use(function(req, res) {
    res.end("<h2> Bye bye world<\h2>");
});

app.listen(3030);
