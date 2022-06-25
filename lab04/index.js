const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

let app = express();
//add routes here

app.set('view engine', 'hbs');
app.use(express.urlencoded({extended:false}));

app.use(express.static('public'));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.get('/', function(req,res){
    res.render('index');
})

app.get('/fruits', function(req,res){
    let favourite = 'apples';
    res.render('fruits', {
        'fruits': ['apples', 'bananas', 'oranges'],
        'favouriteFruit': favourite
    })
})

app.get('/add-food', function(req,res){
    res.render('add-food')
})

app.post('/add-food', function(req,res){
    let {foodName, calories, tags} = req.body;
    res.render('display-food-summary', {
        foodName,
        calories,
        'tags': tags.join(', ')
    })
})

app.get('/calculate-bmi', function(req,res){
    res.render('calculate-bmi')
})

app.post('/calculate-bmi', function(req,res){
    let height = req.body.height;
    let weight = req.body.weight;
    let bmi = 0;
    if (req.body.units == 'si'){
    bmi = weight / height**2
    }
    else{
    bmi = (weight/height**2) * 703
    }
    res.send('bmi results = ' + bmi)
})

app.get('/calculate-fruits', function(req,res){
    res.render('calculate-fruits')
})

app.post('/calculate-fruits', function(req,res){
    let items = [];
    let cost = 0;
    let price = {
        'apple': 3,
        'durian': 15,
        'orange': 6, 
        'banana': 4
    }
    if (req.body.items){
    if (Array.isArray(req.body.items)){
        items = req.body.items
    }
    else{
        items = [ req.body.items ]
    }
    }
    for (let each of items){
        cost = cost + price[each]
    }
    res.send('total cost: ' + cost)
})

app.listen(3000, ()=> {
    console.log('server started')
})