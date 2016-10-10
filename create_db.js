var mongo = new Mongo("mongodb://admin:secret@172.30.73.176:27017");
var newDb = mongo.getDB("sampledb");
newDb.createCollection("users");
newDb.createCollection("interests");
newDb.createCollection("activities");
newDb.createCollection("messages");
