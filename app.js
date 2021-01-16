//jshint esversion:6
require('dotenv').config();
//const md5 = require('md5');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//const mongodb = require('mongodb');
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption');
const app = express();
const router = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');
//const bcrypt = require('bcrypt');
//const saltRounds=10;
const session= require("express-session");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


//console.log(process.env.API_KEY);



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());//tells passport to deal with the sessions







mongoose.connect('mongodb://localhost:27017/customerDB', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set("useCreateIndex",true);



const productSchema= new mongoose.Schema({
   username:String,
   name:String,
   Category: String,
   publicationYear:Number,
   description:String,
  // negotiable: Boolean,
   age:Number,
   setPrice:Number,
   ownerID: String,
   timeLimit:Number,
  // rating : {
  //   type:Number,
  //   min:1,
  //   max:5,
  // },
  // owner:userSchema,
  image:{
        data: Buffer,
        contentType: String
    },
  image2:{
        data: Buffer,
        contentType: String
    }
});





const userSchema=new mongoose.Schema({
   email: String,
   password: String,
   name: String,
   contact:Number,
   address: String,
   rentedBooks:[productSchema],
});












userSchema.plugin(passportLocalMongoose)//used to hash and salt the passwords

// userSchema.plugin(encrypt, {secret: process.env.API_KEY, encryptedFields: ["password"]});




const User= new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()+ file.originalname);
    }
});

var upload = multer({ storage: storage });


const Product = new mongoose.model("Product",productSchema);


//TODO
app.get("/",function (req,res) {
  res.render("home");
})


app.get("/login",function (req,res) {
  res.render("login");
})

app.get("/register",function (req,res) {
  res.render("regForm");
})


app.get("/browse",function (req,res) {
  res.render("productListing");
})


app.get("/rentedBooks",function (req,res) {
  if (req.isAuthenticated()){
    Product.find({}, (err, items) => {
          if (err) {
              console.log(err);
          }
          else {
              res.render('RentPage', {name: req.user.name});
          }
  });
}
  else {
    res.redirect("/login");
  }
});




app.post('/rentedBooks', upload.single('image'), (req, res, next) => {
  console.log(req.file.filename);
    //console.log(req.user);
    var obj = new Product({
        username: req.user._id + req.body.name,
        name: req.body.name,
        description: req.body.description,
        ownerID: req.user._id,
        setPrice: req.body.price,
        Category: req.body.Category,
        age:req.body.age,
        publicationYear: req.body.publicationYear,
        //timeLimit:req.body.
        image: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        },
        // image2:{
        //   data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        //   contentType: 'image/png'
        // }
    });
    // Product.insertMany([obj],function (err) {
    //   if (err){
    //     console.log(err);
    //   }
    //   else {
    //       res.redirect('/rentedBooks');
    //   }
    // })
    obj.save(function (err) {
      if (!err){
        req.user.rentedBooks.push(obj);
        req.user.save();
        res.redirect('/rentedBooks');
      }
      else {
        console.log(err);
      }
    })

});








app.post("/register",function (req,res) {
  if (req.body.password===req.body.password2){
    User.register(
      {
        username: req.body.username,
        name:req.body.first_name,
        contact: req.body.phone,
        address: req.body.street,
       },
      req.body.password,
      function (err,user) {
      if (err){
        console.log(err);
        res.redirect("/register");
      }else {
        passport.authenticate("local")(req,res,function () {
          console.log(req.user);
          res.redirect("/dashboard");
        });
      }
    });
  }
  else {
    res.send("passwords didnt match")
  }
});


app.post("/login",function (req,res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    })

    req.login(user, function (err) {
      if (err){
        console.log(err);
      }
      else {
        passport.authenticate("local")(req,res,function () {
          //res.redirect("/secrets");
          //console.log(req.user);
          // console.log(req.statusCode);
          // console.log(res.statusCode);
          res.redirect("/dashboard");
        });
      }
    });

});



app.get("/dashboard",function (req,res) {
  if(req.isAuthenticated()){
        res.render("dashboard",{name: req.user.name});
        // console.log(req.user.username);
        // console.log(req.user);
      // User.findOne({username: req.user.username}, function (err,foundUser) {
      //   if (err){
      //     console.log(err);
      //   }else {
      //     if (foundUser){
      //         console.log(foundUser);
      //         res.render("dashboard");
      //       }
      //       else{
      //         res.send("wrong password");
      //       }
      //   }
      // })

  }else {
    res.redirect("/login");
  }
});




app.get("/logout",function (req,res) {
  req.logout();
  res.redirect("/");
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});


















// app.post("/register", function (req, res, next) {
//     // var newUser = new User({
//     //     username: req.body.username,
//     //     name: req.body.signupName,
//     // });
//     User.register({username: req.body.username, name: req.body.signupName}, req.body.signupPassword, function (err, user) {
//         if (err) {
//           console.log(err);
//             // return res.render('account/signup');
//             res.redirect("/register");
//         }
//         else {
//           // go to the next middleware
//           next();
//         }
//         // // go to the next middleware
//         // next();
//
//     });
// }, passport.authenticate('local', {
//     successRedirect: '/dashboard',
//     failureRedirect: '/dashboard'
// }));
//
//





//
// app.post("/register",function (req,res) {
//   if (req.body.signupPassword===req.body.resignupPassword){
//     User.register({username: req.body.username, name: req.body.signupName}, req.body.signupPassword, function (err,user) {
//       if (err){
//         console.log(err);
//         res.redirect("/register");
//       }
//       else {
//         passport.authenticate("local", function(err, user, info) {
//
//               //if (err) return next(err);
//               //if (!user) return res.redirect('/register');
//               res.redirect("dashboard")
//               // req.logIn(user, function(err) {
//               //     //if (err)  return next(err);
//               //     return res.redirect("/dashboard");
//               // });
//
//           })(req, res);
//         // passport.authenticate("local")(req,res,function () {
//         // res.redirect("/dashboard");
//         // console.log(req.user);
//         };
//       });
//     }
// else {
//     res.send("password didnt match re-entered password");
//   }
// });
//
