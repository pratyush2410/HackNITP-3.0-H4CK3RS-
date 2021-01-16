//jshint esversion :6

const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
const app = express();
app.set('view engine','ejs');                  //to  make our engine as ejs for tempelate 
app.use(bodyparser.urlencoded({extended: true}));  
app.use(express.static("public"));           // use css and other properties
 const port = 3000;


app.get("/",function(req,res){
res.render("home");
});

app.get("/register",function(req,res){
    res.render("regform");
    });
    


app.listen({port},function(){
  console.log(`Server is up and running on port ${port}`);
});
