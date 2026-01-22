const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { saveRedirectUrl, isAdmin} = require("../middleware.js");
const User = require("../models/user.js");
const Booking = require("../models/booking.js");
const Checker = require("../models/checker.js");

router.get("/adminlogin", (req, res) => {
    res.render("admin/adminlogin.ejs", { hideNavbar: true, hideFooter: true });
});

router.post("/adminlogin", saveRedirectUrl, passport.authenticate("admin-local", {
        failureFlash: true,
        failureRedirect: "/adminlogin"
    }), async (req, res) => {
        req.flash("success", "Welcome back!");
        let redirectUrl = res.locals.redirectUrl || "/admindash";
        res.redirect(redirectUrl);
    }
);

router.get("/admindash", isAdmin, async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalBookings = await Booking.countDocuments({});
        const pendingBookings = await Booking.countDocuments({ status: "Pending" });
        const completedBookings = await Booking.countDocuments({ status: "Completed" });
        const recentBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10).populate("user");
        const paidBookings = await Booking.find({ paymentStatus: "Paid" });
        const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        res.render("admin/admindash.ejs", { adminName: req.user.username, totalUsers, totalBookings, pendingBookings,
            completedBookings, recentBookings, totalRevenue, hideNavbar: false, hideFooter: false });
    } catch (err) {
        next(err);
    }
});

router.get("/admin/checkers", isAdmin, async (req, res, next) => {
    try {
        const pendingCheckers = await Checker.find({
            authorizationStatus: "pending"
        });

        res.render("admin/checkers.ejs", { pendingCheckers, hideNavbar: false, hideFooter: true });
    } catch (err) {
        next(err);
    }
});

router.post("/admin/checkers/:id/approve", isAdmin, async (req, res, next) => {
    try {
        const checker = await Checker.findById(req.params.id);

        if (!checker) {
            throw new ExpressError("Checker not found", 404);
        }

        checker.authorizationStatus = "approved";
        checker.isActive = true;
        checker.authorizedBy = req.user._id;
        checker.authorizedAt = new Date();

        await checker.save();

        req.flash("success", "Checker approved successfully.");
        res.redirect("/admin/checkers");
    } catch (err) {
        next(err);
    }
});

router.post("/admin/checkers/:id/reject", isAdmin, async (req, res, next) => {
    try {
        const { reason } = req.body;
        const checker = await Checker.findById(req.params.id);

        if (!checker) {
            throw new ExpressError("Checker not found", 404);
        }

        checker.authorizationStatus = "rejected";
        checker.isActive = false;
        checker.rejectionReason = reason;
        checker.authorizedBy = req.user._id;
        checker.authorizedAt = new Date();

        await checker.save();

        req.flash("success", "Checker rejected.");
        res.redirect("/admin/checkers");
    } catch (err) {
        next(err);
    }
});

router.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Logged you out!");
        res.redirect("/adminlogin");
    });
});

module.exports = router;