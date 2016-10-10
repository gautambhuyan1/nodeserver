// real database and geospacial search

var mongoClient = require('mongodb').MongoClient;
var mongo = new mongoClient();

var myDb = null;

mongo.connect("mongodb://admin:secret@172.30.73.176:27017", function(err, db) {
    myDb = db.db("sampledb");
    console.log("db:connected");
});

// Get a list of valid interests
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

// Add a new interest - Admin only
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

// Get activities with certain interest and within 100 kms of location
exports.getActivities = function(myInterest, myLat, myLng, callback) {
    //console.log("@getActivities() "+ myInterest + " " + myPhone+ " " + myLat + " " + myLng);
    console.log("@getActivities()");
    //console.log(req);
    var activities = [];
    console.log("interest: "+myInterest+" lat:"+myLat+" lng:"+myLng);
    myDb.collection('activities', function(err, collection){
        //var query1 = [{lat:{$eq: parseInt(myLat)}}];
        //console.log(query1);
   
        var query = {$and:[{'interest':{$eq:myInterest}}, {'location':{$near: [parseFloat(myLat), parseFloat(myLng)], $maxDistance:1}}]};
 
        //console.log(query);
        collection.ensureIndex({location:'2d'});
        var activityCursor = collection.find(query);
        activityCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                activities.push({activityid:docArr[doc]._id,
                                 activity:docArr[doc].activity,
                                 location:docArr[doc].location
                                 });
                //console.log("iteration ", doc);
            }
            //console.log(docArr);
            console.log(activities);
            callback(activities);
        });

    });
    //console.log("### printing interests:" +interests);
}

// Create a new activity - store interest, location and activity
exports.createActivity = function(myInterest, myActivity, myLat, myLng) {
    console.log("@createActivities() "+myInterest+" "+myActivity+" "+myLat+" "+myLng);
    var activityToAdd = {interest:myInterest, activity: myActivity, location:[myLat, myLng]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('activities', function(err, collection) {
        collection.insert(activityToAdd, options, function(err, results) {
            console.log(results);
        });
    });
}

// Get the messages associated with an activity
exports.getMessages = function(activityId, phone, callback) {
    console.log("@getMessages()"+activityId+" "+phone);
    callback(0);

}

// Store the messages associated with an activity
exports.createMessage = function(activityId, msg, phone) {
    console.log("@getMessages()"+activityId+" "+msg+" "+phone);

}

