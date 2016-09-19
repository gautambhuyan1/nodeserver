var mongo = new Mongo("localhost");
var newDb = mongo.getDB("aptivity");
newDb.createCollection("users");
newDb.createCollection("interests");
newDb.createCollection("activities");
newDb.createCollection("messages");
