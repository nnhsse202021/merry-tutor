let express = require("express");

let {OAuth2Client} = require('google-auth-library');
let client = new OAuth2Client(process.env.CLIENT_ID);

router = express.Router();

router.post("/v1/google", async (req, res) => {
    let { token }  = req.body
    let ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    let {sub, email, name} = ticket.getPayload();
    //do something with the payload and get internal userId, using sub as a replacement for now
    req.session.userId = sub;
    res.status(201)
    res.json({})
})

/*
example for auth middleware (would go in app.js)
app.use(async (req, res, next) => {
    const user = await db.user.findFirst({where: { id:  req.session.userId }})
    req.user = user
    next()
})
*/

module.exports = router;