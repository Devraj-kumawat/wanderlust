if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const path = require("path");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ExpressError = require("./utils/ExpressErrors.js");

const listingroute = require("./routes/listing.js");
const reviewroute = require("./routes/review.js");
const userRoute = require("./routes/user.js");

// Connect to MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

console.log(dbUrl);

main()
  .then(() => {
    console.log("MongoDB connection success");
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

async function main() {
  await mongoose.connect(dbUrl);
}
// Session store setup with MongoDB
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // seconds
});

store.on("error", function (err) {
    console.log("Session store error:", err);
});

const sessionConfig = {
    store,
    secret: process.env.SECRET || 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // One week expiration
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },

    
};

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

// Middleware setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(session(sessionConfig));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make currUser and flash messages available in all templates
app.use((req, res, next) => {
    res.locals.currUser = req.user || null;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.Msg = req.flash("Msg"); // Add this line
    next();
});


// Routes
app.use("/", userRoute);
app.use("/listings", listingroute);
app.use("/listings/:id/reviews", reviewroute);

// Catch-all for unmatched routes
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handler middleware
app.use((err, req, res, next) => {
    const { statuscode = 500, message = "Something went wrong!!" } = err;
    res.status(statuscode).render("error.ejs", { message });
});








// if(process.env.NODE_ENV!="production"){
//     require('dotenv').config()
// }




// const express=require("express");
// const app=express();
// const mongoose=require("mongoose");
// const ejsMate=require("ejs-mate");
// const methodOverride=require("method-override");
// const session=require("express-session");
// const MongoStore = require('connect-mongo');
// const flash=require("connect-flash");
// app.use(methodOverride("_method"));
// const path=require("path");

// const passport=require("passport");
// const User=require("./models/user.js");
// const LocalStrategy=require("passport-local");


// app.use(express.urlencoded({extended :true}));
// app.set("view engine","ejs");
// app.set("views",path.join(__dirname,"views"))
// app.engine("ejs",ejsMate);
// app.use(express.static(path.join(__dirname,"/public")));
// const ExpressError=require("./utils/ExpressErrors.js");

// const listingroute=require("./routes/listing.js");


// const reviewroute=require("./routes/review.js");

// const userRoute = require("./routes/user.js");


// const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

// console.log(dbUrl);

// main()
// .then(()=>{
//    console.log("connection success");
// })
//  .catch((err) => console.log(err));

// async function main() {

//   await mongoose.connect(dbUrl);

  
// }


// const store=MongoStore.create({
//     mongoUrl:dbUrl,
//     crypto:{
//         secret:process.env.SECRET,
//     },
//     touchAfter:24*3600,
// });

// store.on("error",()=>{
// console.log("ERROR IN MONGO SESSION STORE",err);
// })

// const sessionInfo={
//     store,
//     secret:process.env.SECRET,
//     resave:false,
//     saveUninitialized:true,
//     cookie:{
//         expires:Date.now()+7*24*60*60*1000,
//         maxAge:7*24*60*60*1000,
//         httpOnly:true,
//     }
// }


// app.listen(8080,()=>{
//     console.log("server is running on port 8080");
// })



// app.use(session(sessionInfo));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// // use static authenticate method of model in LocalStrategy
// passport.use(new LocalStrategy(User.authenticate()));

// // use static serialize and deserialize of model for passport session support
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


// app.use((req, res, next) => {
//     res.locals.currUser = req.user || null;
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.Msg = req.flash("Msg"); // Add this line
//     next();
// });


// app.use("/", userRoute);
// app.use("/listings", listingroute);
// app.use("/listings/:id/reviews", reviewroute);

// // Catch-all for unmatched routes
// app.use((req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });

// // Error handler middleware
// app.use((err, req, res, next) => {
//     const { statuscode = 500, message = "Something went wrong!!" } = err;
//     res.status(statuscode).render("error.ejs", { message });
// });

// // Start server
// app.listen(8080, () => {
//     console.log("Server is running on port 8080");
// });


