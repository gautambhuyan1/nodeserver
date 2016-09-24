// real database

var mongoClient = require('mongodb').MongoClient;
var mongo = new mongoClient();

var myDb = null;


mongo.connect("mongodb://localhost/", function(err, db) {
    myDb = db.db("aptivity");
    console.log("db:connected");
});

exports.getInterests = function(callback) {
    console.log("@getInterests()");
    var interests = [];
    myDb.collection('interests', function(err, collection){
        var interestCursor = collection.find();
        interestCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                interests.push({interestid:docArr[doc]._id,
                                interest:docArr[doc].interest});
                //console.log("iteration ", doc);
            }
            console.log(docArr);
            console.log(interests);
            callback(interests);
        });

    });
    console.log("Printing interests:" +interests);
}

exports.addInterest = function(myInterest) {
    console.log("@addInterests() "+ myInterest);
    var interests = [];

    var interestToAdd = {interest:myInterest};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('interests', function(err, collection) {
        collection.insert(interestToAdd, options, function(err, results) {
            console.log(results);
        });
    });
}

exports.getActivities = function(myInterest, myLat, myLng, callback) {
    //console.log("@getActivities() "+ myInterest + " " + myPhone+ " " + myLat + " " + myLng);
    console.log("@getActivities()");
    //console.log(req);
    var activities = [];
    console.log("interest: "+myInterest+" lat:"+myLat+" lng:"+myLng);
    myDb.collection('activities', function(err, collection){
        //var query1 = [{lat:{$eq: parseInt(myLat)}}];
        //console.log(query1);
        var query = {$and:[{'interest':{$eq:myInterest}}, {'lat':{$eq: parseInt(myLat)}}, {'lng':{$eq: parseInt(myLng)}}]};
        //var query = {interest:{$eq:myInterest}};
        //var activityCursor = collection.find({$and:[{interest:{$eq:interest}}, {lat:{$eq: lat}}, {lng:{$eq: lng}}]});
        console.log(query);
        var activityCursor = collection.find(query);
        activityCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                activities.push({activityid:docArr[doc]._id,
                                 activity:docArr[doc].activity,
                                 lat:docArr[doc].lat,
                                 lng:docArr[doc].lng
                                 });
                //console.log("iteration ", doc);
            }
            console.log(docArr);
            console.log(activities);
            callback(activities);
        });

    });
    //console.log("### printing interests:" +interests);
}

exports.createActivity = function(myInterest, myActivity, myLat, myLng) {
    console.log("@createActivities() "+myInterest+" "+myActivity+" "+myLat+" "+myLng);
    var activityToAdd = {interest:myInterest, activity: myActivity, lat: myLat, lng: myLng};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('activities', function(err, collection) {
        collection.insert(activityToAdd, options, function(err, results) {
            console.log(results);
        });
    });
}

exports.getMessages = function(activityId, phone, callback) {
    console.log("@getMessages()"+activityId+" "+phone);
    callback(0);

}

exports.createMessage = function(activityId, msg, phone) {
    console.log("@getMessages()"+activityId+" "+msg+" "+phone);

}

