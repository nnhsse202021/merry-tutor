let fs = require("fs");
const MongoClient = require('mongodb').MongoClient;
/*
Import a CSV of users into the 'Users' collection of the database.
Usage - node import.js <db-connection, including db name> <path to csv> [roles comma separated]
eg. `node import.js "mongodb+srv://admin:PASSWORD@SERVER.net/DATABASE?retryWrites=true&w=majority" "data.csv" "tutor"` 
*/

(async () => {
    console.log(`loading data from ${__dirname + process.argv[3]} into database ${process.argv[2]}`);

    let mongoClient = new MongoClient(process.argv[2], { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoClient.connect().catch(err => console.log(err));
    let usersCollection = mongoClient.db().collection("Users");
    console.log("connected to db")
    
    let data = fs.readFileSync(__dirname + "/" + process.argv[3], 'utf8').replace("\r","").split("\n").slice(1).map(x=>x.split(","));

    let users = []
    for (let studentArr of data) {
        let user = {
            name: {
                first: studentArr[0].split(" ")[0],
                last: studentArr[0].split(" ").slice(1).join(" ")
            },
            email: studentArr[1],
            roles: [...(process.argv[4] ? process.argv[4].split(",") : [])],
            children: [],
            graduation_year: studentArr[2].length == 2 ? "20" + studentArr[2] : studentArr[2].length == 4 ? studentArr[2] : null, //if XX, 20XX; if XXXX, XXXX; else null
        }
        users.push(user);
    }
    console.log(`created ${users.length} users`)
    
    await usersCollection.insertMany(users);
    console.log("SUCCESS!");
    process.exit();
})().catch(err => console.log("ERROR LOADING DATA:",err))
