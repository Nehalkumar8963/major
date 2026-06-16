if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}




const express = require('express');


const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema ,reviewSchema } = require('./schema.js');
const Review= require('./models/review.js');
const listingsRouter= require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
const userRouter = require('./routes/user.js');
const { isAdmin } = require('./middleware.js');


const dbUrl = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/major";
main()   
     .then(() => console.log('Connected to MongoDB'))
     .catch(err => console.log(err)); 

async function main() {
    await mongoose.connect(dbUrl);
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
      secret: process.env.SECRET || 'thisshouldbeabettersecret',
    }
});

store.on("error", function (e) {
    console.log("Session store error", e);
});
const sessionOptions = {
    secret: process.env.SECRET ,
    resave: false,
    saveUninitialized: true,
    store,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy({ usernameField: "email" }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    res.locals.isAdmin = isAdmin(req.user);
    res.locals.searchTerm = "";
    res.locals.activeCategory = "";
    
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//app.get('/fakeUser', async (req, res) => {
  //let fakeUser = new User({ email: 'fake@example.com' });
 // await fakeUser.save();
  //res.send('Fake user created and saved to database');
 // let registeredUser = await User.register(fakeUser, "helloworld");
 // res.send(registeredUser);
//});

app.use("/listings/:id/reviews", reviewsRouter); // Mount reviews router
app.use("/listings",  listingsRouter);
app.use("/", userRouter); // This line is correct, assuming routes/user.js exports a valid router.
//app.all("*", (req, res, next) => {
  //next(new ExpressError("Page Not Found", 404));
//});

//app.all("/*", (req, res, next) => {
 // next(new ExpressError("Page Not Found", 404));
//});
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
