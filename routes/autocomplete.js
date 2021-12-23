let express = require("express");

const db = require("../db.js");

router = express.Router();
router.get("/",async (req,res) => {
    const nameConcats = {
      "default": [
        '$name.first', ' ', '$name.last'
      ],
      "last,first": [
        '$name.last', ', ', '$name.first'
      ]
    }
    let results = (await (await db.getUserModel()).aggregate([
        {
          '$match': {
            roles: "tutee"
          }
        },
        {
          '$addFields': {
            'fullname': {
              '$concat': nameConcats[req.query.type]
            }
          }
        }, {
          '$match': {
            'fullname': new RegExp(`.*${req.query.input}.*`)
          }
        }, {
          '$project': {
            'fullname': 1
          }
        }
      ]).toArray()).map(x => [x.fullname, String(x._id)])
    res.json(results);
});

module.exports = router;