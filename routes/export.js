let express = require("express");

let router = express.Router();

const { MongoClient, ObjectID } = require('mongodb');
if(process.env.PRODUCTION) {
	console.log("Running on production server...");
	var protocol = "mongodb";
	var mongoHost = "localhost";
}
else {
	console.log("Running for development...");
	var protocol = "mongodb+srv";
	var mongoHost = "cluster0.kfvlj.mongodb.net";
}
const uri = `${protocol}://admin:${process.env.MONGO_PASSWORD}@${mongoHost}/merry-tutor?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let usersCollection;
let summariesCollection;

mongoClient.connect(err => {
    usersCollection = mongoClient.db("merry-tutor").collection("Users");
    summariesCollection = mongoClient.db("merry-tutor").collection("Summaries");
})

router.get("/userdata", async (req,res) => {
    //auth
    if (!req.user) { //must be logged in to see a tutee's data
        res.status(401).render("error", {code: 401, description: "You must be logged in to preform this action."});
        return;
    } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
        res.status(403).render("error", {code: 403, description: "Unauthorized for logged in user."});
        return;
    }

    //get all users
    let users = await usersCollection.find().toArray();
    
    //make users into a map + add parentEmail + parentName field
    let userMap = {};
    for (let user of users) {
        user.parentEmails = [];
        userMap[String(user._id)] = user;
    } 

    /* create */
    let docs = await usersCollection.aggregate([
        {
          '$project': {
            'firstName': '$name.first',
            'lastName': '$name.last',
            'email': 1,
            'gradYear': 1, 
            'isTutor': {$in: ["tutor", '$roles']},
            'isBoard': {$in: ["board", '$roles']},
            'isTutee': {$in: ["tutee", '$roles']},
            'isParent': {$in: ["parent", '$roles']},
            'childrenIDs': { $cond: {if: {$in: ["parent", '$roles']}, then: '$children', else: [] }}
          }
        }
    ]).toArray();

    /* Build rows for csv */
    let rows = [["First Name", "Last Name", "Email", "Graduation Year", "isTutor", "isBoard", "isTutee", "isParent", "Children Email"]];
    for (let user of docs) {
        let {firstName, lastName, email, gradYear, isTutor, isBoard, isTutee, isParent, childrenIDs} = user;
        typeof childrenIDs
        rows.push([firstName, lastName, email, gradYear || "", isTutor, isBoard, isTutee, isParent, childrenIDs.length > 0 ? String(childrenIDs.map((id) => userMap[id].email)) : ""])
    }
    let csvText = rows.map(x=>x.join(",")).join("\n");
    res.set({"Content-Disposition":`attachment; filename="users.csv"`});
    res.send(csvText);
})

router.get("/sessiondata", async (req,res) => {
  //auth
  if (!req.user) { //must be logged in to see a tutee's data
      res.status(401).render("error", {code: 401, description: "You must be logged in to preform this action."});
      return;
  } else if (!(req.user.roles.includes("board"))) { //if you are not a board member, you cannot access this data
      res.status(403).render("error", {code: 403, description: "Unauthoried for logged in user."});
      return;
  }

  //get all users
  let users = await usersCollection.find().toArray();
  
  //make users into a map + add parentEmail + parentName field
  let userMap = {};
  for (let user of users) {
      user.parentEmails = [];
      userMap[String(user._id)] = user;
  } 

  //if they are a parent, add their email to their child's parentEmails
  for (let userId in userMap) {
      let user = userMap[userId];
      if (user.roles.includes("parent")) {
          for (let childId of user.children) {
              userMap[childId].parentEmail = user.email;
              userMap[childId].parentName = user.name.first + " " + user.name.last;
          }
      }
  }

  /* create */
  let docs = await summariesCollection.aggregate([
      {
        '$project': {
          'date': {
            '$toDate': '$date'
          }, 
          'tutor_name': {
            '$concat': [
              '$tutor.name.first', ' ', '$tutor.name.last'
            ]
          }, 
          'tutee_name': {
            '$concat': [
              '$tutee.name.first', ' ', '$tutee.name.last'
            ]
          }, 
          'shadow_name': {
            '$concat': [
              '$shadow.name.first', ' ', '$shadow.name.last'
            ]
          }, 
          'tutee_id': '$tutee.id', 
          'subject': 1, 
          'session_duration': 1, 
          'what_they_learned': '$fields.what_they_learned', 
          'homework': '$fields.homework', 
          'next_time': '$fields.next_time',
          "_id": 0
        }
      }
  ]).toArray();

  /* Build rows for csv */
  let rows = [["Timestamp", "Tutor Name", "Date", "Tutee Name", "Shadowing Tutor Name", "Tutee Grade Level", "Tutee School", "Parent Name", "Parent Email", "Tutee Email", "Parent Phone", "Subject", "Location", "What They Learned", "Homework", "What to do for Next Time", "Duration", "Comments for Board", "Alive Center?"]];
  for (let summary of docs) {
      let {subject, session_duration, date, tutor_name, tutee_name, shadow_name, tutee_id, what_they_learned, homework, next_time} = summary;
      rows.push([Date(date).toString(), tutor_name, Date(date).toString(), tutee_name, shadow_name || "", "", "", userMap[tutee_id].parentName || "", userMap[tutee_id].parentEmail || "", userMap[tutee_id].email, "", String(subject).replace(',',' '), "", what_they_learned, homework, next_time, session_duration, "", ""]);
  }
  let csvText = rows.map(x=>x.join(",")).join("\n");
  res.set({"Content-Disposition":`attachment; filename="sessions.csv"`});
  res.send(csvText);
})
module.exports = router;