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
            jsonRsp = {type:"interestget",result:"SUCCESS",resultcode:"NONE",count:count, interests: interests}; 
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
    var interests = [];
    myDb.collection('users', function(err, collection){
        var interestCursor = collection.find({"_id":oid});
        interestCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                count++;
                interests = docArr[doc].interests;
            }
            count = interests.length;
            jsonRsp = {type:"userinterest",result:"SUCCESS",resultcode:"NONE",userid:userid,count:count, interests: interests};
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
    var jsonRsp = {type:"userinterestspost",result:"FAIL",resultcode:"NOTFOUND"};
    //var query = {{'_id':userid}, {$set:{'interests':userInterests}}};
    //var oid = userid;
    var oid = mongo.ObjectID(userid);
    //console.log("OID ", oid);
    myDb.collection('users', function(err, collection){
        var userCursor = collection.update({"_id":oid}, {$set:{"interests":userInterests}}, function(error, result) {
            if (!error) {
                jsonRsp = {type:"userinterestspost",result:"SUCCESS",resultcode:"NONE"};
            }
            console.log(jsonRsp);
            callback(jsonRsp);
        });

    });
}

// ### Get a list of valid activities for a specific user
exports.getUserActivities = function(myDb, userid, callback) {
    console.log("@getUserActivities() ", userid);
    var myActivities = [];
    var jsonRsp;
    var oid = mongo.ObjectID(userid);
   
    var response = function(count, activities) {
        jsonRsp = {type:"useractivities",result:"SUCCESS",resultcode:"NONE",userid:userid,count:count, activities: activities};
        console.log(jsonRsp);
        callback(jsonRsp);
    }

    myDb.collection('users', function(err, collection){
        var interestCursor = collection.find({"_id":oid});
        interestCursor.toArray(function(err, docArr){
            for(doc in docArr) {
                console.log("Activities ", docArr[doc].activities);
                myactivities = docArr[doc].activities;
                //activities.push({interestid:docArr[doc]._id,
                                //interest:docArr[doc].activities});
            }
            console.log("Activities ", myactivities);
            getActivitiesWithIds(myDb, userid, myactivities, response);
        });

    });
}

// ### Add a list of valid interests to a given user
exports.likeActivity = function(myDb, userid, username, activityid, callback) {
    console.log("@likeActivity() ", userid);
    var count = 0;
    var activities;// = [activityid];
    var jsonRsp = {type:"likeactivity",result:"FAIL",resultcode:"NOTFOUND"};
    //var query = {{'_id':userid}, {$set:{'interests':userInterests}}};
    //var oid = userid;
    var oid = mongo.ObjectID(userid);
    //console.log("OID ", oid);
    myDb.collection('users', function(err, collection) {
        var userCursor = collection.find({"_id":oid});
        userCursor.toArray(function(err, docArr){
            activities = docArr[0].activities;
            activities.push(activityid);
            var userCursorNew = collection.update({"_id":oid}, {$set:{"activities":activities}}, function(error, result) {
               if (!error) {
                   jsonRsp = {type:"likeactivity",result:"SUCCESS",resultcode:"NONE"};
               }
               //console.log(jsonRsp);
               //callback(jsonRsp);
           });
        });
    });
    var activityOid = mongo.ObjectID(activityid);
    myDb.collection('activities', function(err, collection) {
        var activityCursor = collection.find({"_id":activityOid});
        activityCursor.toArray(function(err, docArr){
            var likes = docArr[0].likes;
            var likelist = docArr[0].likelist;
            likelist.push({username:username, userid:userid});
            likes++;
            var activityLink = collection.update({"_id":activityOid}, {$set:{"likes":likes, "likelist":likelist}}, function(error, result) {
               if (!error) {
                   jsonRsp = {type:"likeactivity",result:"SUCCESS",resultcode:"NONE"};
               }
               console.log(jsonRsp);
               callback(jsonRsp);
           });
        });
    });
}

// ### Share activity with another user
exports.shareActivity = function(myDb, userid, username, activityid, callback) {
    console.log("@likeActivity() ", userid);
    var count = 0;
    var activities;// = [activityid];
    var jsonRsp = {type:"likeactivity",result:"FAIL",resultcode:"NOTFOUND"};
    //var query = {{'_id':userid}, {$set:{'interests':userInterests}}};
    //var oid = userid;
    var oid = mongo.ObjectID(userid);
    //console.log("OID ", oid);
    myDb.collection('users', function(err, collection) {
        var userCursor = collection.find({"_id":oid});
        userCursor.toArray(function(err, docArr){
            activities = docArr[0].activities;
            activities.push(activityid);
            var userCursorNew = collection.update({"_id":oid}, {$set:{"activities":activities}}, function(error, result) {
               if (!error) {
                   jsonRsp = {type:"likeactivity",result:"SUCCESS",resultcode:"NONE"};
               }
               //console.log(jsonRsp);
               //callback(jsonRsp);
           });
        });
    });
    var activityOid = mongo.ObjectID(activityid);
    myDb.collection('activities', function(err, collection) {
        var activityCursor = collection.find({"_id":activityOid});
        activityCursor.toArray(function(err, docArr){
            var likes = docArr[0].likes;
            var likelist = docArr[0].likelist;
            likelist.push({username:username, userid:userid});
            likes++;
            var activityLink = collection.update({"_id":activityOid}, {$set:{"likes":likes, "likelist":likelist}}, function(error, result) {
               if (!error) {
                   jsonRsp = {type:"likeactivity",result:"SUCCESS",resultcode:"NONE"};
               }
               console.log(jsonRsp);
               callback(jsonRsp);
           });
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

// ### Get activities with certain activity IDs
getActivitiesWithIds = function(myDb, userid, activityIdList, callback) {
    var activities = [];
    var count = 0;
    var jsonRsp;
    console.log("@getActivitiesWithIds: ", activityIdList);
    if (activityIdList.length == 0) {
        callback(count, activities);
    }
    myDb.collection('activities', function(err, collection){
   
        for (act = 0; act<activityIdList.length; act++) {
            var query = {"_id":mongo.ObjectID( activityIdList[act])};
 
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
                                     time:docArr[doc].time,
                                     place:docArr[doc].place,
                                     likes:docArr[doc].likes,
                                     shares:docArr[doc].shares,
                                     likelist:docArr[doc].likelist,
                                     sharelist:docArr[doc].sharelist,
                                     date:docArr[doc].date
                                     });
                }
                //console.log("End: ", act, count, activityIdList.length, (activityIdList.length - 1));
                if (count == (activityIdList.length)) {
                    console.log(JSON.stringify(activities));
                    callback(count, activities);
                }
            });
        }
    });
}

// ### Get activities with certain interest and within 100 kms of location
exports.getActivities = function(myDb, userid, myInterestRaw, myLat, myLng, callback) {
    var activities = [];
    var myInterest = myInterestRaw.toString('utf-8').trim();
    var count = 0;
    var interestList = JSON.parse(myInterest);
    var jsonRsp;
    console.log("@getActivities() "+userid+" "+ myInterest + " "+ myLat + " " + myLng);
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
        if (myInterest == "[\"all\"]") {
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
                                 date:docArr[doc].date,
                                 time:docArr[doc].time,
                                 place:docArr[doc].place,
                                 likes:docArr[doc].likes,
                                 shares:docArr[doc].shares,
                                 likelist:docArr[doc].likelist,
                                 sharelist:docArr[doc].sharelist
                                 });
            }
            jsonRsp = {type:"activityget",result:"SUCCESS",resultcode:"NONE", count: count, activities: activities}; 
            //console.log(jsonRsp.stringify());
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
    var jsonRsp = {type:"user", result:"FAIL", resultcode:"EXISTS"};
    var userToAdd = {username: myusername, imsi: myimsi, otp:"1234", active:"false", interests:[], activities:[], location:[]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('users', function(err, collection) {
        var query = {$and:[{'username':{$eq:myusername}}, {'imsi':{$eq:myimsi}}]};
        //console.log("Query: " + query.tostring);
        var userCursor = collection.findOne(query, function(error, result) {
            if (result != null) {
                // User exists, send otp and user id
                userdetail = {userid:result._id};
                jsonRsp = {type:"userpost", result:"SUCCESS", resultcode:"USEREXISTS", userdetail: userdetail};
                console.log(jsonRsp);
                callback(jsonRsp);
            }
            else {
                // No existing user with same credentials, add the new detail
                collection.insert(userToAdd, options, function(err, results) {
                    userdetail = {userid:userToAdd._id};
                    jsonRsp = {type:"userpost", result:"SUCCESS", resultcode:"NONE", userdetail:userdetail};
                    console.log(jsonRsp);
                    callback(jsonRsp);
                });
            }
        });
    });
}

// ### Send new otp
exports.sendOtp = function(myDb, myusername, myimsi, callback) {
    console.log("@sendotp() "+myusername+" "+myimsi+" "+myDb);
    var jsonRsp = {type:"user", result:"FAIL", resultcode:"USERNOTFOUND"};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('users', function(err, collection) {
        var query = {$and:[{'username':{$eq:myusername}}, {'imsi':{$eq:myimsi}}]};
        //console.log("Query: " + query.tostring);
        var userCursor = collection.findOne(query, function(error, result) {
            if (result != null) {
                // User exists, send otp and user id
                jsonRsp = {type:"userdetails", result:"SUCCESS", resultcode:"NONE"};
                userdetail = {userid:result._id};
                jsonRsp = {type:"userpost", result:"SUCCESS", resultcode:"NONE", userdetail: userdetail};
                console.log(jsonRsp);
                callback(jsonRsp);
            }
            else {
                callback(jsonRsp);
            }
        });
    });
}

// ### Create a new user - store username, imsi
exports.confirmOtp = function(myDb, myusername, myimsi, userid, otp, callback) {
    console.log("@confirmOtp() "+myusername+" "+myimsi);
    //var userdetail = {};
    //var jsonRsp = {"type":"user", "userdetail": userdetail}; 
    var jsonRsp = {type:"otpconfirm", result:"FAIL", resultcode:"INCORRECT_OTP"};
    var userToAdd = {username: myusername, imsi: myimsi, interests:[], activities:[], location:[]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('users', function(err, collection) {
        var query = {$and:[{'username':{$eq:myusername}}, {'imsi':{$eq:myimsi}}]};
        //console.log("Query: " + query.tostring);
        var userCursor = collection.findOne(query, function(error, result) {
            if (result != null) {
                console.log(result["otp"]);
                if (result['otp'] != otp) {
                    callback(jsonRsp);
                    return;
                }
                var oid = mongo.ObjectID(userid);
                myDb.collection('users', function(err, collection){
                    var userCursor = collection.update({"_id":oid}, {$set:{"active":"true"}}, function(error, result) {
                       
                            //console.log("### Done", error, result.result.n, result);
                        if (result.result.n == 1) {
                            jsonRsp = {type:"otpconfirm",result:"SUCCESS",resultcode:"NONE"};
                        }
                        console.log(jsonRsp);
                        callback(jsonRsp);
                    });
            
                });
            }
            else {
                console.log(jsonRsp);
                callback(jsonRsp);
            }
        });
    });
}

// ### Create a new activity - store interest, location and activity
exports.createActivity = function(myDb, userid, username, myInterest, myActivity, myLat, myLng, place, myDate, time, callback) {
    console.log("@createActivities() "+userid+" "+username+" "+myInterest+" "+myActivity+" "+myLat+" "+myLng+" "+myDate+" "+place+" "+time);
    var activityToAdd = {userid: userid, username: username, interest:myInterest, likes:0, shares:0, likelist:[], sharelist:[], activity: myActivity, place:place, date: myDate, time:time, location:[parseFloat(myLat), parseFloat(myLng)]};
    var options = {w:1, wtimeout: 5000, journal:true, fsync:false};
    myDb.collection('activities', function(err, collection) {
        collection.insert(activityToAdd, options, function(err, results) {
            var jsonRsp = {type:"activitypost",result:"SUCCESS",resultcode:"COMPLETE"};
            callback(jsonRsp);
        });
    });
}

// ### Delete an existing activity
exports.deleteActivity = function(myDb, userid, myActivity, callback) {
    console.log("@deleteActivity() "+userid+" "+myActivity);
    var oid = mongo.ObjectID(myActivity);
    var query = {$and:[{'_id':{$eq:oid}}, {'userid':{$eq:userid}}]};
    myDb.collection('activities', function(err, collection) {
        collection.remove(query, function(err, results) {
            var jsonRsp = {type:"deleteactivity",result:"SUCCESS",resultcode:"COMPLETE"};
            callback(jsonRsp);
        });
    });
}

// ### Edit an existing activity
exports.editActivity = function(myDb, userid, interest, activityid, activity, date, time, response) {
    console.log("@editActivity() "+userid+" "+activityid);
    var oid = mongo.ObjectID(activityid);
    console.log("OID: ", oid);
    var query = {$and:[{'_id':{$eq:oid}}, {'userid':{$eq:userid}}]};
    jsonRsp = {type:"editactivity",result:"FAIL",resultcode:"NONE"};
    myDb.collection('activities', function(err, collection){
        var userCursor = collection.update(query, {$set:{"interest":interest, "activity":activity, "date":date, "time":time}}, function(error, result) {
            if (!error) {
                jsonRsp = {type:"editactivity",result:"SUCCESS",resultcode:"NONE"};
            }
            console.log(jsonRsp);
            response(jsonRsp);
        });

    });
}

// ### Edit an existing user
exports.editUser = function(myDb, userid, username, imsi, callback) {
    console.log("@editUser() "+userid+" "+username+" "+imsi);
    var oid = mongo.ObjectID(userid);
    myDb.collection('users', function(err, collection){
        var userCursor = collection.update({"_id":oid}, {$set:{"username":username, "imsi":imsi}}, function(error, result) {
            if (!error) {
                jsonRsp = {type:"edituser",result:"SUCCESS",resultcode:"NONE"};
            }
            console.log(jsonRsp);
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
                messages.push({username: docArr[doc].username, messageid:docArr[doc]._id, message:docArr[doc].message});
            }
            var jsonRsp = {type:"messageget", result:"SUCCESS",resultcode:"NONE",count:count, activityid: myActivityId, messages: messages}; 
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
            var jsonRsp = {type:"messagepost",result:"SUCCESS",resultcode:"COMPLETE"}
            console.log(jsonRsp);
            callback(jsonRsp);
        });
    });
}

