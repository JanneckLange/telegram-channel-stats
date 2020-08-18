const MongoClient = require('mongodb').MongoClient;

export class Mongo {
    private static mongoUrl = process.env.DB_URL;
    private static dbName = process.env.DB_NAME;
    private static mongoPort = process.env.DB_PORT;
    private static url = `mongodb://${Mongo.mongoUrl}:${Mongo.mongoPort}/`;
    private static scheduledCollectionName = "scheduled";
    private static statsCollectionName = "stats";
    private static followerCollectionName = "follower";
    private static mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true};

    public static async lookUpIdInScheduleDb(id: number): Promise<boolean> {
        return new Promise((res, rej) => {
            MongoClient.connect(Mongo.url, Mongo.mongoOptions, function (err, db) {
                if (err) throw err;
                const dbo = db.db(Mongo.dbName);

                dbo.collection(Mongo.scheduledCollectionName).findOne({_id: id}, function (err, result) {
                    if (err) throw err;
                    res(result !== null);
                    db.close();
                });
            });
        });
    }

    public static storeScheduleToDb(schedulesObject: { _id: number; hour: number; month: number; day: number; minute: number }) {
        MongoClient.connect(Mongo.url, Mongo.mongoOptions, function (err, db) {
            if (err) throw err;
            const dbo = db.db(Mongo.dbName);

            dbo.collection(Mongo.scheduledCollectionName).insertOne(schedulesObject, function (err, res) {
                if (err) throw err;
                console.log("1 document inserted (scheduled)");
                db.close();
            });
        });
    }

    public static removeScheduleFromDb(id: number) {
        MongoClient.connect(Mongo.url, Mongo.mongoOptions, function (err, db) {
            if (err) throw err;
            const dbo = db.db(Mongo.dbName);

            dbo.collection(Mongo.scheduledCollectionName).deleteOne({_id: id}, function (err, obj) {
                if (err) throw err;
                console.log("1 document deleted (scheduled)");
                db.close();
            });
        });
    }

    public static storeStatsToDb(statsObject: { _id: number; datetime: string, views: number, message: string, silent: false, media: string, url: string, entities: Array<{ _: string, offset: number, length: number, url?: string }> }) {
        MongoClient.connect(Mongo.url, Mongo.mongoOptions, function (err, db) {
            if (err) throw err;
            const dbo = db.db(Mongo.dbName);

            dbo.collection(Mongo.statsCollectionName).findOne({_id: statsObject._id}, function (err, result) {
                if (err) throw err;
                if (result === null) {
                    dbo.collection(Mongo.statsCollectionName).insertOne(statsObject, function (err, res) {
                        if (err) throw err;
                        console.log("1 document inserted (stats)");
                        db.close();
                    });
                } else {
                    console.log('0 document inserted (stats) - already exist')
                }
            });
        });
    }

    public static storeFollowerToDb(followerCount: number) {
        MongoClient.connect(Mongo.url, Mongo.mongoOptions, function (err, db) {
            if (err) throw err;
            const dbo = db.db(Mongo.dbName);

            dbo.collection(Mongo.followerCollectionName).insertOne({
                date: new Date(),
                follower: followerCount
            }, function (err, res) {
                if (err) throw err;
                console.log(`1 document inserted (follower:${followerCount})`);
                db.close();
            });
        });
    }
}
