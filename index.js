const express = require('express');
const passport = require('passport');
// const session = require('express-session');
const jwt = require('jsonwebtoken')
const BasicStrategy = require("passport-http").BasicStrategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const app = express();

// cari tau session di express dan passport
// app.use(session({
//     secret:'passport-task01',
//     cookie: {
//         maxAge: 60000
//     },
//     resave: false,
//     saveUninitialized: false
// }))

app.use(passport.initialize());
// app.use(passport.session());
app.use(express.json())

const secret = '693496cb1d23651cd82842079a5c16ea1fcd04365e0a63574a15386898c33d77e2b50ee130ef34a2917fd4e67bbf9a6ddc84c067b80827ed82285c8d4bff5ff1';
const basicAppKey='harisTask012021AppKey';
const basicAppSecret='harisTask012021Secret';

const users = [];

passport.use(new BasicStrategy(
    function(username, password, done) {
        if (basicAppKey!==username && basicAppSecret!==password) {
            console.error('client key and client secret not match');
            return done(null, null, false);
        }
        return done(null, username);
    }
))

passport.use(new BearerStrategy(async function (token, done) {
    const result = await jwt.verify(token, secret);

    console.log('user : '+result)
    if (!result) {
        return done(null,false);
    }
    return done(null,result)
}))

function generateToken(username) {
    return jwt.sign(username, secret)
}

function checkUser(username, password) {
    let user = users.find(u => u.username === username);
    if (!user) {
        user = {username, password};
        users.push(user);
    }

    return {'token':generateToken(user.username)};
}

app.get('/', (req, res) => {
    res.send('hello world ');
});

app.post('/v1/users/token', passport.authenticate('basic', {session: false}), (req,res) => {
    console.log('is it something here');
    const user = checkUser(req.body.username, req.body.password);
    console.log(user);
    res.send(user);
});

app.get('/v1/users/profile', passport.authenticate('bearer', {session: false}), (req,res) => {
    res.send({name: 'haris',asal:'bekasi',pekerjaan:'developer'});
})

app.get('/v1/home', passport.authenticate('basic', {session: false}), (req, res) => {
    res.send('you are at home');
});

app.listen(8001, () => {
    console.log('now listening to port 8001');
});