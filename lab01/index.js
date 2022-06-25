const express = require('express');
let app = express();
//add routes here

app.get('/', function(req,res){
    res.send('<h1>hello from express</h1>')
})

app.get('/hello/:name', (req,res) => {
    let name = req.params.name;
    res.send('Hi, ' + name);
})

app.listen(3000, ()=> {
    console.log('server started')
})