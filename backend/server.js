if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const flash = require("connect-flash");
const ejsMate = require("ejs-mate");

const User = require("./models/user.js");
const Checker = require("./models/checker.js");
const Admin = require("./models/admin.js");

const { initRenewalCron } = require("./services/cronReminder.js");

const { router: userRouter } = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const checkerRouter = require("./routes/checker.js");
const adminRouter = require("./routes/admin.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const sessionOptions = {
    secret: process.env.SESSION_SECRET || "development-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use("user-local", new LocalStrategy(User.authenticate()));
passport.use("checker-local", new LocalStrategy(Checker.authenticate()));
passport.use("admin-local", new LocalStrategy(Admin.authenticate()));

passport.serializeUser((entity, done) => {
    done(null, {
        id: entity._id,
        type: entity.constructor.modelName,
    });
});

passport.deserializeUser(async (obj, done) => {
    try {
        if (obj.type === "Admin") {
            const admin = await Admin.findById(obj.id);
            return done(null, admin);
        }

        if (obj.type === "Checker") {
            const checker = await Checker.findById(obj.id);
            return done(null, checker);
        }

        const user = await User.findById(obj.id);
        return done(null, user);
    } 
    
    catch (err) {
        done(err);
    }
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/puc-booking-platform";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    if (typeof initRenewalCron === "function") {
        initRenewalCron();
        console.log("Automated 6-Month Renewal Cron Service active.");
    }
}

main().catch((err) => {
    console.error("Database connection error:", err);
});

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Doorstep PUC Platform Backend API is running.",
        environment: process.env.NODE_ENV || "development",
    });
});

app.use("/api/auth", userRouter);
app.use("/api/auth", checkerRouter);

app.use("/api", checkerRouter);
app.use("/api", bookingRouter);
app.use("/api/admin", adminRouter);

app.get("/puc-booking-platform", async (req, res) => {
    res.render("index/index.ejs", {
        hideNavbar: false,
        hideFooter: false,
    });
});

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
});

app.use((err, req, res, next) => {
    console.error(err);
    const { statusCode = 500, message = "Something went wrong!" } = err;

    return res.status(statusCode).json({
        success: false,
        message,
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});