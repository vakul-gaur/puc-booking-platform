const express = require("express");
const router = express.Router();
const Booking = require("../models/booking.js");
const Checker = require("../models/checker.js");
const passport = require("passport");
const upload = require("../utils/multer");
const { isCheckerApproved, validateChecker } = require("../middleware.js");

router.get("/checkerlogin", (req, res) => {
    res.render("checkers/checkerlogin.ejs", { action: "login", hideNavbar: true, hideFooter: true} );
});

router.post( "/checkersignup", validateChecker, 
    upload.array("documents"),
    async (req, res, next) => {
        try {
            const { username, email, contact, password, licenseNumber, licenseExpiry, idProofType } = req.body;
            const files = req.files ? req.files.map(f => f.path) : [];

            const checker = new Checker({ username, email, contact, licenseNumber, licenseExpiry, 
                checkerId: `CHK-${Date.now()}`,
                documents: { idProofType, documentFiles: files }
            });

            const registeredChecker = await Checker.register(checker, password);

            req.login(registeredChecker, err => {
                if (err) return next(err);
                req.flash(
                    "success",
                    "Registration successful. Your account will be verified within 24–48 hours."
                );
                res.redirect("/checkerlogin");
            });
        } catch (e) {
            req.flash("error", "Registration failed. Details already exist or input is invalid.");
            res.redirect("/checkerlogin");
        }
    }
);

router.post("/checkerlogin", passport.authenticate("checker-local", {
        failureRedirect: "/checkerlogin",
        failureFlash: true
    }),
    async (req, res) => {
        const checker = req.user;

        if (checker.authorizationStatus !== "approved" || !checker.isActive) {
            req.logout(() => {
                req.flash(
                    "error",
                    "Your account is under verification. Admin approval usually takes 24–48 hours."
                );
                return res.redirect("/checkerlogin");
            });
            return;
        }

        checker.lastLogin = new Date();
        await checker.save();

        res.redirect("/checkerdash");
    }
);

router.get("/checkerdash", async (req, res, next) => {
    try {
        const checkerId = req.user._id;

        const bookings = await Booking.find({ checker: checkerId })
            .populate("user")
            .sort({ createdAt: -1 });

        const totalAssigned = bookings.length;
        const completedBookings = bookings.filter(b => b.status === "Completed").length;
        const pendingBookings = bookings.filter(b => b.status !== "Completed").length;

        res.render("checkers/checkerdash.ejs", { checker: req.user, bookings, totalAssigned, completedBookings, pendingBookings, hideNavbar: false, hideFooter: false });
    } catch (err) {
        next(err);
    }
});


router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "You are logged out now!");
        res.redirect("/puc-booking-platform");
    });
});

module.exports = router;
