const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

const MongoUtil = require('./MongoUtil.js');
const dotenv = require('dotenv').config();

const helpers = require('handlebars-helpers')({
    handlebars: hbs.handlebars
});

const ObjectId = require('mongodb').ObjectId;

let app = express();

app.set('view engine', hbs);

app.use(express.static('public'));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');


app.use(express.urlencoded({
    extended: false
}))

async function main() {

    await MongoUtil.connect(process.env.MONGO_URL, 'cico');
    let db = MongoUtil.getDB();

    app.get('/', function (req, res) {
        res.send('hello yes, i am working')
    })

    app.get('/food', async function (req, res) {
        let foodRecords = await db.collection('food').find().toArray();
        res.render('food.hbs', {
            foodRecords
        })
    })

    app.get('/food/add', function (req, res) {
        res.render('add-food.hbs')
    })

    app.post('/food/add', function (req, res) {
        let { foodName, calories, tags } = req.body;

        if (!Array.isArray(tags)) {
            tags = [tags]
        }
        db.collection('food').insertOne({
            foodName,
            calories,
            tags
        });
        res.send('food has been successfully added')
    })

    app.get('/food/:foodid/edit', async function (req, res) {
        let foodRecord = await db.collection('food').findOne({
            '_id': ObjectId(req.params.foodid)
        });
        res.render('edit-food.hbs', {
            foodRecord
        })
    })

    app.post('/food/:foodid/edit', function (req, res) {
        let { foodName, calories, tags } = req.body;
        if (!Array.isArray(tags)) {
            tags = [tags];
        }
        let foodid = req.params.foodid;
        db.collection('food').updateOne({
            _id: ObjectId(foodid)
        },
            {
                '$set': {
                    foodName, calories, tags
                }
            })
        res.redirect('/food')
    })

    app.get('/food/:foodid/delete', async function (req, res) {
        let foodid = req.params.foodid;
        let foodRecord = await db.collection('food').findOne({
            _id: ObjectId(foodid)
        });
        res.render('confirm-delete.hbs', {
            foodRecord
        })
    })

    app.post('/food/:foodid/delete', function (req, res) {
        db.collection('food').deleteOne({
            '_id': ObjectId(req.params.foodid)
        })
        res.redirect('/food')
    })

    app.get('/food/:foodid/notes/add', async function (req, res) {
        let foodRecord = await db.collection('food').findOne({
            _id: ObjectId(req.params.foodid)
        });
        res.render('add-note.hbs', {
            foodRecord
        })
    })

    app.post('/food/:foodid/notes/add', async function (req, res) {
        let noteContent = req.body.content;
        let foodid = req.params.foodid;
        let response = await db.collection('food').updateOne({
            _id: ObjectId(foodid)
        }, {
            '$push': {
                'notes': {
                    _id: new ObjectId(),
                    content: noteContent
                }
            }
        })
        res.redirect('/food')
    })

    app.get('/food/:foodid', async function(req,res){
        let foodRecord = await db.collection('food').findOne({
            _id: ObjectId(req.params.foodid)
        });
        res.render('food-details.hbs', {
            foodRecord
        })
    })

    app.get('/note/:noteid/edit', async function(req,res){
        let results = await db.collection('food').findOne({
            'notes._id': ObjectId(req.params.noteid)
        },{
            projection: {
                'notes': {
                    '$elemMatch': {
                        _id: ObjectId(req.params.noteid)
                    }
                }
            }
        })
        let wantedNote = results.notes[0];
        res.render('edit-note.hbs', {
            note: wantedNote
        })
    })

    app.post('/note/:noteid/edit', async function(req,res){
        let foodRecord = await db.collection('food').findOne({
            'notes._id': ObjectId(req.params.noteid)
        });
        await db.collection('food').updateOne({
            'notes._id': ObjectId(req.params.noteid)
        }, {
            '$set': {
                'notes.$.content': req.body.content
            }
        })
        res.redirect('/food/' + foodRecord._id)
    })

    app.get('/note/:noteid/delete', async function(req,res){
        let foodRecord = await db.collection('food').findOne({
            "notes._id": ObjectId(req.params.noteid)
        });
        await db.collection('food').updateOne({
            _id: ObjectId(foodRecord._id)
        }, {
            '$pull': {
                notes: {
                    _id: ObjectId(req.params.noteid)
                }
            }
        })
        res.redirect('/food/' + foodRecord._id)
    })

    app.listen(3000, function () {
        console.log('beep beep server is up')
    })
}

main()