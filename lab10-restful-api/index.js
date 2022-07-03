const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const mongoUrl = process.env.MONGO_URL;
const MongoUtil = require('./MongoUtil');
const { ObjectId } = require('mongodb');

let app = express();

app.use(cors());

app.use(express.json());

const addDateToView = function (req, res, next) {
    // get today date and format it as a UK date
    res.locals.date = new Date().toLocaleDateString('en-UK');
    next();
}

app.use(addDateToView);

async function main() {
    await MongoUtil.connect(mongoUrl, 'food_sightings');
    let db = MongoUtil.getDB();

    app.get('/', (req, res) => {
        res.send('hi')
    })

    app.post('/free-food-sightings', async function (req, res) {
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
        if(req.query.food){
            criteria['food'] = {
                '$in': [req.query.food]
            }
        }
        let results = await db.collection('free-food-sightings').find(criteria).toArray();
        res.status(200);
        res.send(results)
    })

    app.put('/free-food-sightings/:id', async function(req,res){
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

    app.delete('/free-food-sightings/:id', async function (req,res){
        let results = await db.collection('free-food-sightings').remove({
            _id: ObjectId(req.params.id)
        })
        res.status(200);
        res.send({
            message: 'well deleted'
        })
    })
}

main();


app.listen(3000, function () {
    console.log('server is ongoing')
})