const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

let app = express();
//add routes here

app.set('view engine', 'hbs');

app.use(express.static('public'));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

app.get('/', function(req,res){
    res.render('index');
})

app.get('/submit', function(req,res){
    res.render('submit');
})

app.get('/admin', function(req,res){
    res.render('admin');
})

app.listen(3000, ()=> {
    console.log('server started')
})