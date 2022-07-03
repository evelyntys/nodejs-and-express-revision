const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('./MongoUtil');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

let app = express();

app.use(cors());

app.use(express.json());

const addDateToView = function (req, res, next) {
    // get today date and format it as a UK date
    res.locals.date = new Date().toLocaleDateString('en-UK');
    next();
}

const generateAccessToken = (id, email) => {
    return jwt.sign({
        'user_id': id,
        'email': email
    }, process.env.TOKEN_SECRET, {
        expiresIn: '15m'
    })
}

app.use(addDateToView);

const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(404)
            }
            req.user = user;
            next();
        })
    }
    else {
        res.sendStatus(401);
    }
}

async function main() {
    await MongoUtil.connect(mongoUrl, 'food_sightings');
    let db = MongoUtil.getDB();

    app.get('/', (req, res) => {
        res.send('hi')
    })

    app.post('/free-food-sightings', checkIfAuthenticatedJWT, async function (req, res) {
        let description = req.body.description;
        let food = req.body.food;
        let datetime = req.body.datetime ? newDate(req.body.datetime) : new Date()

        try {
            let result = await db.collection('free-food-sightings').insertOne({
                'description': description,
                'food': food,
                'datetime': datetime
            });
            res.status(200);
            res.send(result)
        } catch (e) {
            res.status(500);
            res.send({
                error: 'internal server error, please contact admin'
            });
            console.log(e)
            console.log(req.body)
        }
    })

    app.get('/free-food-sightings', async function (req, res) {
        let criteria = {};

        if (req.query.description) {
            criteria['description'] = {
                '$regex': req.query.description,
                '$options': i
            }
        }
        if (req.query.food) {
            criteria['food'] = {
                '$in': [req.query.food]
            }
        }
        let results = await db.collection('free-food-sightings').find(criteria).toArray();
        res.status(200);
        res.send(results)
    })

    app.put('/free-food-sightings/:id', checkIfAuthenticatedJWT, async function (req, res) {
        let description = req.body.description;
        let food = req.body.food;
        let datetime = new Date(req.body.datetime) || new Date();
        let results = await db.collection('free-food-sightings').updateOne({
            '_id': ObjectId(req.params.id)
        }, {
            '$set': {
                'description': description,
                'food': food,
                'datetime': datetime
            }
        })
        res.send(results)
    })

    app.delete('/free-food-sightings/:id', checkIfAuthenticatedJWT, async function (req, res) {
        let results = await db.collection('free-food-sightings').remove({
            _id: ObjectId(req.params.id)
        })
        res.status(200);
        res.send({
            message: 'well deleted'
        })
    })

    app.post('/users', async function (req, res) {
        let result = await db.collection('users').insertOne({
            'email': req.body.email,
            'password': req.body.password
        })
        res.status(201);
        res.json({
            'message': 'congratulations on creating a new account'
        })
    })

    app.post('/login', async function (req, res) {
        let user = await db.collection('users').findOne({
            'email': req.body.email,
            'password': req.body.password
        })
        if (user) {
            let accessToken = generateAccessToken(user._id, user.email);
            res.send(accessToken)
        }
        else {
            res.send('sorry bro but u r a fake...')
        }
    })

    app.get('/profile', checkIfAuthenticatedJWT, async function(req,res){
        res.send(req.user);
    })
}

main();


app.listen(3000, function () {
    console.log('server is ongoing')
})