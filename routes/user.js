const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { saveRedirectUrl, validateUser } = require("../middleware.js");


router.get("/auth", (req, res) => {
    res.render("users/auth.ejs", { action: "signup", hideNavbar: true, hideFooter: true });
});

router.post("/signup", validateUser, async (req, res, next) => {
    try {
        const { username, email, contact, password } = req.body;
        const user = new User({ username, email, contact });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to PUC-Booking-Platform!");
            res.redirect("/dashboard");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/auth");
    }
});

router.get("/auth", (req, res) => {
    res.render("users/auth.ejs", { action: "login", hideNavbar: true, hideFooter: true });
});

router.post("/login", saveRedirectUrl, passport.authenticate("user-local", {
        failureFlash: true,
        failureRedirect: "/auth",
    }), async (req, res) => {
        req.flash("success", "Welcome back!");
        let redirectUrl = res.locals.redirectUrl || "/dashboard";
        res.redirect(redirectUrl,);
    }
);

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) { 
            return next(err); 
        }
        req.flash("success", "You are logged out now!");
        res.redirect("/puc-booking-platform");
    });
});

module.exports = router;