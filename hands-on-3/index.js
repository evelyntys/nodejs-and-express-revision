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

app.get('/', function(req,res){
    res.render('index');
})

app.post('/', function(req,res){
    let name = req.body.name;
    let validName = true;
    if (name.length <=3 || name.length >= 200){
        validName = false;
    }
    let email = req.body.email;
    let validEmail = true;
    if(!email.includes('@') || !email.includes('.')){
        validEmail = false;
    }
    let place = req.body.place;
    let validPlace = true;
    if (!place){
        validPlace = false;
    }

    // if (place == 'others'){
    //     document.querySelector('.show').classList.remove('d-none');
    //     document.querySelector('.show').classList.add('d-block');
    // }

    let properties = [];
    let validProperties = true;
    if (properties){
        if (!Array.isArray(req.body.properties)){
            properties = [ req.body.properties ]
        }
        else{
            properties = req.body.properties
        }
    }
    if (properties.length >3 || !properties){
        validProperties = false
    }
    if (validName && validEmail && validPlace && validProperties){
        res.send('submission received! we will get back as soon as possible')
    }
    else{
        res.send('some places were not filled in properly, please check again')
    }
})

app.listen(3000, ()=> {
    console.log('server started')
})