const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const User = require("./models/user.js");

// Session Configuration

const sessionOptions = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

// Middleware Configuration

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use("user-local", new LocalStrategy(User.authenticate()));

passport.serializeUser((entity, done) => {
    done(null, {
        id: entity._id,
        type: entity.constructor.modelName
    });
});

passport.deserializeUser(async (obj, done) => {
    try {
        if (obj.type === "Admin") {
            return done(null, await Admin.findById(obj.id));
        }

        if (obj.type === "Checker") {
            return done(null, await Checker.findById(obj.id));
        }

        return done(null, await User.findById(obj.id));
    } catch (err) {
        done(err);
    }
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");

// Database Connection

const MONGO_URL = "mongodb://127.0.0.1:27017/puc-booking-platform";
main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => console.log(err));

    async function main() {
    await mongoose.connect(MONGO_URL);
}  

// Middleware Setup

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Routes

app.use("/", userRouter);
app.use("/", bookingRouter);

// Home Route

app.get("/puc-booking-platform", async (req, res) => {
    res.render("index/index.ejs", { hideNavbar: false, hideFooter: false });
});

// 404 Route Handler

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Error Handling Middleware

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", {message, hideNavbar: false, hideFooter: false });
});

// Server Listening

app.listen(8080, () => {
    console.log("server is listening to the port 8080");
})