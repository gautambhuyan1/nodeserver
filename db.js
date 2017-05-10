// real database and geospacial search

// ### Get a list of valid interests
exports.getInterests = function(myDb, callback) {
    console.log("@getInterests()");
    var interests = [];
    var jsonRsp = {"type":"interest", "interests": interests}; 
    myDb.collection('interests', function(err, collection){
        var interestCursor = collection.find();
        interestCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                interests.push({interestid:docArr[doc]._id,
                                interest:docArr[doc].interest});
                console.log("iteration ", doc);
            }
            console.log(docArr);
            console.log(jsonRsp);
            callback(jsonRsp);
        });

    });
    console.log("Printing interests:" +interests);
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
    //console.log("@getActivities() "+userid+" "+ myInterest + " " + myPhone+ " " + myLat + " " + myLng);
    console.log("@getActivities()");
    //console.log(req);
    var activities = [];
    var jsonRsp = {"type":"activity", "activities": activities}; 
    console.log("interest: "+myInterest+" lat:"+myLat+" lng:"+myLng);
    myDb.collection('activities', function(err, collection){
        //var query1 = [{lat:{$eq: parseInt(myLat)}}];
        //console.log(query1);
   
        var query = {$and:[{'interest':{$eq:myInterest}}, {'location':{$near: [parseFloat(myLat), parseFloat(myLng)], $maxDistance:1}}]};
 
           //query = {};
        if (myInterest == "all") {
           query = {'location':{$near: [parseFloat(myLat), parseFloat(myLng)], $maxDistance:1}};
           //query = {};
        }

        console.log(query);
        collection.ensureIndex({location:'2d'});
        var activityCursor = collection.find(query);
        activityCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                activities.push({interest:docArr[doc].interest,
                                 activityid:docArr[doc]._id,
                                 activity:docArr[doc].activity,
                                 userid:docArr[doc].userid,
                                 username:docArr[doc].username,
                                 location:docArr[doc].location,
                                 date:docArr[doc].date
                                 });
                //console.log("iteration ", doc);
            }
            //console.log(docArr);
            console.log(jsonRsp);
            callback(jsonRsp);
        });

    });
    //console.log(" printing interests:" +interests);
}

// ### Create a new user - store username, imsi
exports.createUser = function(myDb, username, imsi, callback) {
    console.log("@createUser() "+username+" "+imsi);
    //var userdetail = {};
    //var jsonRsp = {"type":"user", "userdetail": userdetail}; 
    var userToAdd = {username: username, imsi: imsi, interests:[], activities:[], location:[]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('users', function(err, collection) {
        collection.insert(userToAdd, options, function(err, results) {
            console.log(results);
                var jsonRsp = {"type":"user", "userdetail": {userid: userToAdd._id}}; 
                //userdetail = {userid:userToAdd._id};
            console.log(jsonRsp);
            callback(jsonRsp);
        });
    });
}

// ### Create a new activity - store interest, location and activity
exports.createActivity = function(myDb, userid, username, myInterest, myActivity, myLat, myLng, myDate, callback) {
    console.log("@createActivities() "+myInterest+" "+myActivity+" "+myLat+" "+myLng);
    var activityToAdd = {userid: userid, username: username, interest:myInterest, activity: myActivity, date: myDate, location:[parseFloat(myLat), parseFloat(myLng)]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('activities', function(err, collection) {
        collection.insert(activityToAdd, options, function(err, results) {
            console.log(results);
            callback({"type":"create"});
        });
    });
}

// ### Get the messages associated with an activity
exports.getMessages = function(myDb, myActivityId, callback) {
    console.log("@getMessages()"+myActivityId);
    var response;
    var messages = [];
    var jsonRsp = {"type":"messages", "activityid": myActivityId, "messages": messages}; 
    myDb.collection('messages', function(err, collection){
        var query = {"activity": myActivityId};
 
        //console.log(query);
        var messageCursor = collection.find(query);
        messageCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                messages.push({"username": docArr[doc].username, "message":docArr[doc].message});
                console.log(messages);
                console.log({"message":docArr[doc].message});
                //console.log("iteration ", doc);
            }
            //console.log(docArr);
            console.log(messages);
            //console.log("Response:"+response);
            callback(jsonRsp);
        });
    });
}

// ### Store the messages associated with an activity
exports.createMessage = function(myDb, userid, username, activityId, msg, callback) {
    console.log("@createMessages()"+activityId+" "+msg);
    var messageToAdd = {activity: activityId, userid:userid, username:username, message:msg};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('messages', function(err, collection) {
        collection.insert(messageToAdd, options, function(err, results) {
            callback();
            console.log(results);
        });
    });
}

