const admin = require("firebase-admin");

const serviceAccount = require("./minima-wh-firebase-adminsdk-3ujyg-259af47a68.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://minima-wh-default-rtdb.firebaseio.com"
});

const db = admin.database();
const auth = admin.auth();

//SERVER
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));

app.use(bodyParser.json());

app.get('/api/users', (req, res) => {
    auth.listUsers(1000).then((listUsersResult) => {
        res.json(listUsersResult.users);
    }).catch((error) => {
        res.json({error: true, message: error.message});
    });
});

app.post('/api/addUser', (req, res) => {
    const { password, username, displayName } = req.body;
    auth.createUser({
        email: username+"@minima-wh.gr",
        emailVerified: false,
        password,
        displayName,
        disabled: false
    }).then(function (){
        console.log("Added "+username+"@minima-wh.gr");
        res.send({
            error:false
        });
    }).catch(function (error) {
        res.send({
            error: true,
            message: error.message
        });
    });
});

app.post('/api/updateUser', (req, res) => {
    const { uid, displayName } = req.body;
    auth.updateUser(uid, {
        displayName
    }).then(function (){
        console.log("update "+uid);
        res.send({
            error:false
        });
    }).catch(function (error) {
        res.send({
            error: true,
            message: error.message
        });
    });
});

app.delete('/api/user', (req, res) => {
    const { uid } = req.body;
    auth.deleteUser(uid).then(function (){
        console.log("Deleted "+uid);
        res.send({
            error:false
        });
    }).catch(function (error) {
        res.send({
            error: true,
            message: error.message
        });
    });
});

app.post('/api/viewUser', (req, res) => {
    const { uid } = req.body;
    console.log("Viewed "+uid);
    auth.getUser(uid).then(function (userRecord) {
        res.json(userRecord);
    }).catch(function (error) {
        res.json({error: true, message: error.message});
    });
});

app.post('/api/viewRentals', (req, res) => {
    const { uid } = req.body;
    console.log("Listed Rentals "+uid);
    db.ref("rents/"+uid).once("value").then(function (userRecord) {
            const val = userRecord.val();
            if(!val){
                res.json({});
            } else res.json(val);
        }).catch(function (error) {
        res.json({error: true, message: error.message});
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('listening on port '+process.env.PORT || 3000);
});
