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
var Razorpay=require("razorpay");
const { userInfo } = require("os");
var fs = require('fs');
var path = require('path');
var multer = require('multer');
//const bcrypt = require('bcrypt');
//const saltRounds=10;
const session= require("express-session");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


let instance = new Razorpay({
  key_id: "rzp_test_ItkWPnw4LP6mMZ", // your `KEY_ID`
  key_secret:"yy8ID0bH2Xla0Og6CrkDppOr" // your `KEY_SECRET`
});
//console.log(process.env.API_KEY);

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
  image1:{
        data: Buffer,
        contentType: String
    },
  image2:{
        data: Buffer,
        contentType: String
    },
  image3:{
        data: Buffer,
        contentType: String
    },
  // image2:{
  //       data: Buffer,
  //       contentType: String
  //   }
  // images: [image{
  //   data:{ty}
  // }],
});





const userSchema=new mongoose.Schema({
   // email: String,
   // password: String,
   // name: String,
   // contact:Number,
   // address: String,
   // rentedBooks:[productSchema],
   fname:String,
   lname:String,
    email: String,
    password: String,
    city:String,
    state:String,
    postalCode:String,
    name: String,
    contact:Number,
    address: String,
    rentedBooks:[productSchema],
    cartBooks:[productSchema],
});




const transactionSchema = new mongoose.Schema({
   ProductId:String,
   UserId:String,
   OrderId:String,
   PaymentId:String,
   Signature:String,
});


const Transaction = new mongoose.model("Transcation",transactionSchema);








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
      console.log(file);
        cb(null, file.fieldname + '-' + Date.now()+ file.originalname);
    }
});

var upload = multer({ storage: storage }).array("image",4);


const Product = new mongoose.model("Product",productSchema);


//TODO
app.get("/",function (req,res) {
  Product.find({}, (err, books) => {
        if (err) {
            console.log(err);
        }
        else {
          books=books.slice(0,3);
        res.render("home2",{books:books});
        }
});

})

app.get("/success",function(req,res){
  if (req.isAuthenticated()){
  res.render("success");
}else {
  res.redirect("/login");
}
});


app.get("/login",function (req,res) {
  res.render("login");
})

app.get("/register",function (req,res) {
  res.render("regForm");
})

app.get("/wallet",function (req,res) {
  if (req.isAuthenticated()){
  res.render("walletPage",{cartBooks:req.user.cartBooks });
}
else {
  res.redirect("login");
}
})




app.get("/editProfile",function (req,res) {
  if (req.isAuthenticated()){
  res.render("editProfile");
}
else {
  res.redirect("login");
}
})




app.get("/browse",function (req,res) {
  Product.find({}, (err, books) => {
        if (err) {
            console.log(err);
        }
        else {
          res.render("productList",{books:books});
        }
});

})

app.post("/addCart",function (req,res) {
  if (req.isAuthenticated()){
    //console.log(req.body.button);
    Product.findOne({_id: req.body.button}, (err, book) => {
          if (err) {
              console.log(err);
          }
          else {
            req.user.cartBooks.push(book);
            req.user.save();
            res.redirect("/wallet");
          }
  });
  }
  else {
    res.redirect("/login");
  }
})






app.get("/categories/:Category",function (req,res) {
  Product.find({Category: req.params.Category}, (err, books) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render("productList",{books:books});
        }
});
})



app.get("/rentedBooks",function (req,res) {
  if (req.isAuthenticated()){
    Product.find({}, (err, books) => {
          if (err) {
              console.log(err);
          }
          else {
              res.render('RentPage2', {name: req.user.fname, books:books});
          }
  });
}
  else {
    res.redirect("/login");
  }
});




app.post("/search",function (req,res) {
  Product.find({name: req.body.search}, (err, books) => {
        if (err) {
            console.log(err);
        }
        else {
          res.render("productList",{books:books});
        }
});
})





app.post('/rentedBooks', (req, res, next) => {
  upload(req,res,function (err) {
    if(err){console.log(err);}
    else {

  console.log(req.files);
    //console.log(req.user);
    console.log(req.files[0].filename);
    console.log(req.files[1].filename);
    console.log(req.files[2].filename);
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
        image1: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files[0].filename)),
            contentType: 'image/png'
        },
        image2: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files[1].filename)),
            contentType: 'image/png'
        },
        image3: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.files[2].filename)),
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
  }
  });
});




app.get("/payment",function(req,res){
 if(req.isAuthenticated()){
  res.render("checkout",{
    fname:req.body.fname,
    lname:req.body.lname,
    username:req.body.username,
    address:req.body.address
  });


}else {
  res.redirect("/login");
}
})



// RAZORPAY
app.post("/api/payment/order",(req,res)=>{
  if (req.isAuthenticated()){
  params=req.body;
  instance.orders.create(params).then((data) => {
         res.send({"sub":data,"status":"success"});
  }).catch((error) => {
         res.send({"sub":error,"status":"failed"});

  });
}else {
  res.redirect("/login");
}
  });




  app.post("/api/payment/verify",(req,res)=>{
    if (req.isAuthenticated()){
  body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  var crypto = require("crypto");
  var expectedSignature = crypto.createHmac('sha256', key_secret)
                                  .update(body.toString())
                                  .digest('hex');
                                  console.log("sig"+req.body.razorpay_signature);
                                  console.log("sig"+expectedSignature);
  var response = {"status":"failure"}
  if(expectedSignature === req.body.razorpay_signature)
   response={"status":"success"}
      res.send(response);
    }else {
      res.redirect("/login");
    }
  });


app.post("/register",function (req,res) {
  if (req.body.password===req.body.password2){
    User.register(
      {
        username: req.body.username,
        fname:req.body.first_name,
        lname:req.body.last_name,
        contact: req.body.phone,
        address: req.body.street,
        city: req.body.additional,
        state: req.body.state,
        postalCode: req.body.zip,
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
        // res.send("alert("your alert message"), window.location.href = "/login"; ");
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
    Product.find({}, (err, books) => {
          if (err) {
              console.log(err);
          }
          else {
            books=books.slice(0,3);
          res.render("dashboard1",{name: req.user.fname,books:books});
          }
  });

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
