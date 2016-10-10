var mongo = new Mongo("172.30.73.176");
var newDb = mongo.getDB("sampledb");
newDb.createCollection("users");
newDb.createCollection("interests");
newDb.createCollection("activities");
newDb.createCollection("messages");
