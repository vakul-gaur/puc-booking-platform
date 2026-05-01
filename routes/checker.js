const express = require("express");
const router = express.Router();
const Booking = require("../models/booking.js");
const Checker = require("../models/checker.js");
const passport = require("passport");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const { validateChecker, isCheckerLoggedIn } = require("../middleware.js");
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image or PDF allowed"), false);
        }
    }
});

router.get("/checkerlogin", (req, res) => {
    res.render("checkers/checkerlogin.ejs", {
        action: "login",
        hideNavbar: true,
        hideFooter: true
    });
});

router.post("/checkersignup", upload.any(), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            req.flash("error", "Documents required");
            return res.redirect("/checkerlogin");
        }

        const { username, email, contact, password, area, licenseNumber, licenseExpiry, idProofType } = req.body;
        const files = req.files.map((file) => file.path);

        const checker = new Checker({
            username, email, contact,
            area: area.trim(), // Trim space
            licenseNumber, licenseExpiry,
            checkerId: `CHK-${Date.now()}`,
            authorizationStatus: "pending",
            documents: { idProofType, documentFiles: files }
        });

        const registeredChecker = await Checker.register(checker, password);
        req.login(registeredChecker, (err) => {
            if (err) return next(err);
            req.flash("success", "Registration successful. Wait for admin approval.");
            res.redirect("/checkerdash");
        });
    } catch (err) {
        req.flash("error", err.message || "Registration failed");
        res.redirect("/checkerlogin");
    }
});

router.post("/checkerlogin", 
    passport.authenticate("checker-local", {
        failureRedirect: "/checkerlogin",
        failureFlash: true
    }), 
    async (req, res) => {
        req.user.lastLogin = new Date();
        await req.user.save();
        req.flash("success", "Login successful");
        res.redirect("/checkerdash");
    }
);

router.get("/checkerdash", isCheckerLoggedIn, async (req, res, next) => {
    try {
        const checkerId = req.user._id;
        const checkerArea = req.user.area.trim();

        const activeBooking = await Booking.findOne({
            checker: checkerId,
            status: "accepted"
        }).sort({ createdAt: -1 });

        let pendingBookings = [];
        if (!activeBooking) {
            pendingBookings = await Booking.find({
                status: "pending",
                // FIX: Case-insensitive match taaki "Agra" aur "agra" dono show hon
                area: { $regex: new RegExp("^" + checkerArea + "$", "i") }
            }).sort({ createdAt: -1 });
        }

        const completedBookings = await Booking.find({ checker: checkerId, status: "completed" });
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const now = new Date();

        let todayIncome = 0, monthlyIncome = 0, last24Hours = 0;

        completedBookings.forEach((booking) => {
            const amount = Number(booking.price) || 0;
            const completedAt = booking.completedAt || booking.updatedAt;
            if (!completedAt) return;
            if (completedAt >= today) todayIncome += amount;
            if (completedAt >= monthStart) monthlyIncome += amount;
            if ((now - new Date(completedAt)) <= 86400000) last24Hours += amount;
        });

        res.render("checkers/checkerdash.ejs", {
            checker: req.user,
            activeBooking,
            pendingBookings,
            earnings: { today: todayIncome, monthly: monthlyIncome, last24Hours, completedJobs: completedBookings.length },
            hideNavbar: false,
            hideFooter: true
        });
    } catch (err) {
        next(err);
    }
});

router.post("/accept_booking", isCheckerLoggedIn, async (req, res) => {
    try {
        const { booking_id } = req.body;
        const active = await Booking.findOne({ checker: req.user._id, status: "accepted" });
        
        if (active) {
            req.flash("error", "Complete current booking first.");
            return res.redirect("/checkerdash");
        }

        const booking = await Booking.findById(booking_id);
        if (!booking || booking.status !== "pending") {
            req.flash("error", "Booking unavailable or already taken");
            return res.redirect("/checkerdash");
        }

        booking.checker = req.user._id;
        booking.status = "accepted";
        await booking.save();

        req.flash("success", "Booking accepted");
        res.redirect("/checkerdash");
    } catch (err) {
        req.flash("error", "Action failed");
        res.redirect("/checkerdash");
    }
});

router.post("/complete_booking", isCheckerLoggedIn, upload.any(), async (req, res) => {
    try {
        const { booking_id, payment_status } = req.body;
        const booking = await Booking.findById(booking_id);

        if (!booking || booking.checker.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/checkerdash");
        }

        if (!req.files || req.files.length === 0) {
            req.flash("error", "Proof photo required");
            return res.redirect("/checkerdash");
        }

        booking.status = "completed";
        booking.paymentStatus = payment_status;
        booking.proofPhoto = req.files[0].path;
        booking.completedAt = new Date();

        await booking.save();
        req.flash("success", "Booking completed");
        res.redirect("/checkerdash");
    } catch (err) {
        req.flash("error", "Update failed");
        res.redirect("/checkerdash");
    }
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logged out!");
        res.redirect("/puc-booking-platform");
    });
});

module.exports = router;