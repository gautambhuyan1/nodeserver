// real database and geospacial search
var    mongo   = require("mongodb");
//var bson = require('bson').BSONPure;

// ### Get a list of valid interests
exports.getInterests = function(myDb, callback) {
    console.log("@getInterests()");
    var interests = [];
    var count = 0;
    var jsonRsp;
    myDb.collection('interests', function(err, collection){
        var interestCursor = collection.find();
        interestCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                count++;
                interests.push({interestid:docArr[doc]._id,
                                interest:docArr[doc].interest,
                                subinterests:docArr[doc].subinterests});
            }
            jsonRsp = {"type":"interestget","result":"SUCCESS","resultcode":"NONE","count":count, "interests": interests}; 
            console.log(jsonRsp);
            callback(jsonRsp);
        });

    });
}

// ### Get a list of valid interests for a specific user
exports.getUserInterests = function(myDb, userid, callback) {
    console.log("@getUserInterests() ", userid);
    var interests = [];
    var count = 0;
    var jsonRsp;
    var oid = mongo.ObjectID(userid);
    myDb.collection('users', function(err, collection){
        var interestCursor = collection.find({"_id":oid});
        interestCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                count++;
                console.log("Interests ", docArr[doc].interests);
                interests.push({interestid:docArr[doc]._id,
                                interest:docArr[doc].interests});
            }
            jsonRsp = {"type":"userinterestget","result":"SUCCESS","resultcode":"NONE","userid":userid,"count":count, "interests": interests}; 
            console.log(jsonRsp);
            callback(jsonRsp);
        });

    });
}

// ### Add a list of valid interests to a given user
exports.addUserInterests = function(myDb, userid, nbrInterests, userInterests, callback) {
    console.log("@getUserInterests() ", userid);
    var count = 0;
    var interests = [];
    var jsonRsp = {"type":"userinterestspost","result":"FAIL","resultcode":"NOTFOUND"};
    //var query = {{'_id':userid}, {$set:{'interests':userInterests}}};
    //var oid = userid;
    var oid = mongo.ObjectID(userid);
    //console.log("OID ", oid);
    myDb.collection('users', function(err, collection){
        var userCursor = collection.update({"_id":oid}, {$set:{"interests":userInterests}}, function(error, result) {
            if (!error) {
                jsonRsp = {"type":"userinterestspost","result":"SUCCESS","resultcode":"NONE"};
            }
            console.log(jsonRsp);
            callback(jsonRsp);
        });

    });
}

// ### Add a new interest - Admin only
exports.addInterest = function(myDb, myInterest) {
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

// ### Get activities with certain interest and within 100 kms of location
exports.getActivities = function(myDb, userid, myInterest, myLat, myLng, callback) {
    console.log("@getActivities() "+userid+" "+ myInterest + " "+ myLat + " " + myLng);
    var activities = [];
    var count = 0;
    var interestList = JSON.parse(myInterest);
    var jsonRsp;
    myDb.collection('activities', function(err, collection){
        //var query1 = [{lat:{$eq: parseInt(myLat)}}];
   
        var oredInterest = [];
        for (interest in interestList) {
            oredInterest.push({'interest':{$eq:interestList[interest]}}); 
        }
        var query = {$and:[{$or:oredInterest}, {'location':{$near: [parseFloat(myLat), parseFloat(myLng)], $maxDistance:1}}]};
        console.log("Query: ",JSON.stringify(query));
                      //{"$and":[{"$or":[[{"interest":{"$eq":"cricket"}},{"interest":{"$eq":"tennis"}}]]},{"location":{"$near":[40,-75],"$maxDistance":1}}]}
        //var query = {$and:[{'interest':{$eq:myInterest}}, {'location':{$near: [parseFloat(myLat), parseFloat(myLng)], $maxDistance:1}}]};
 
           //query = {};
        if (myInterest == "all") {
           query = {'location':{$near: [parseFloat(myLat), parseFloat(myLng)], $maxDistance:1}};
           //query = {};
        }

        //console.log(query);
        collection.ensureIndex({location:'2d'});
        var activityCursor = collection.find(query);
        activityCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                count++;
                activities.push({interest:docArr[doc].interest,
                                 activityid:docArr[doc]._id,
                                 activity:docArr[doc].activity,
                                 userid:docArr[doc].userid,
                                 username:docArr[doc].username,
                                 location:docArr[doc].location,
                                 date:docArr[doc].date
                                 });
            }
            jsonRsp = {"type":"activityget","result":"SUCCESS","resultcode":"NONE", "count": count, "activities": activities}; 
            console.log(jsonRsp);
            callback(jsonRsp);
        });

    });
}

// ### Create a new user - store username, imsi
exports.createUser = function(myDb, myusername, myimsi, callback) {
    console.log("@createUser() "+myusername+" "+myimsi);
    //var userdetail = {};
    //var jsonRsp = {"type":"user", "userdetail": userdetail}; 
    var jsonRsp = {"type":"user", "result":"FAIL", "resultcode":"EXISTS"};
    var userToAdd = {username: myusername, imsi: myimsi, interests:[], activities:[], location:[]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('users', function(err, collection) {
        var query = {$and:[{'username':{$eq:myusername}}, {'imsi':{$eq:myimsi}}]};
        //console.log("Query: " + query.tostring);
        var userCursor = collection.findOne(query, function(error, result) {
            if (result != null) {
                // There is already a user with same details. Return failure.
                callback(jsonRsp);
            }
            else {
                // No existing user with same credentials, add the new detail
                collection.insert(userToAdd, options, function(err, results) {
                    jsonRsp = {"type":"userpost", "result":"SUCCESS", "resultcode":"NONE", "userdetail": {userid: userToAdd._id}};
                    //jsonRsp = {"type":"user", "userdetail": {userid: userToAdd._id}}; 
                    //userdetail = {userid:userToAdd._id};
                    console.log(jsonRsp);
                    callback(jsonRsp);
                });
            }
        });
    });
}

// ### Create a new activity - store interest, location and activity
exports.createActivity = function(myDb, userid, username, myInterest, myActivity, myLat, myLng, myDate, callback) {
    console.log("@createActivities() "+userid+" "+username+" "+myInterest+" "+myActivity+" "+myLat+" "+myLng+" "+myDate);
    var activityToAdd = {userid: userid, username: username, interest:myInterest, activity: myActivity, date: myDate, location:[parseFloat(myLat), parseFloat(myLng)]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('activities', function(err, collection) {
        collection.insert(activityToAdd, options, function(err, results) {
            var jsonRsp = {"type":"activitypost","result":"SUCCESS","resultcode":"COMPLETE"};
            callback(jsonRsp);
        });
    });
}

// ### Get the messages associated with an activity
exports.getMessages = function(myDb, myActivityId, callback) {
    console.log("@getMessages()"+myActivityId);
    var response;
    var messages = [];
    var count = 0;
    myDb.collection('messages', function(err, collection){
        var query = {"activityid": myActivityId};
 
        var messageCursor = collection.find(query);
        messageCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                count++;
                messages.push({"username": docArr[doc].username, "messageid":docArr[doc]._id, "message":docArr[doc].message});
            }
            var jsonRsp = {"type":"messageget", "result":"SUCCESS","resultcode":"NONE","count":count, "activityid": myActivityId, "messages": messages}; 
            console.log(jsonRsp);
            callback(jsonRsp);
        });
    });
}

// ### Store the messages associated with an activity
exports.createMessage = function(myDb, userid, username, activityId, msg, callback) {
    console.log("@createMessages()"+userid+" "+username+" "+activityId+" "+msg);
    var messageToAdd = {activityid: activityId, userid:userid, username:username, message:msg};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('messages', function(err, collection) {
        collection.insert(messageToAdd, options, function(err, results) {
            var jsonRsp = {"type":"messagepost","result":"SUCCESS","resultcode":"COMPLETE"}
            console.log(jsonRsp);
            callback(jsonRsp);
        });
    });
}

