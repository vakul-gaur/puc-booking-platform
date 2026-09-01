const express = require("express");
const router = express.Router();
const passport = require("passport");
const Checker = require("../models/checker.js");
const Booking = require("../models/booking.js");
const User = require("../models/user.js");
const { sendSMS } = require("../utils/smsService.js");

const isAdminAuth = (req, res, next) => {
    if (req.isAuthenticated() && req.user && req.user.constructor.modelName === "Admin") {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: "Unauthorized. Admin login required.",
    });
};

router.post("/login", (req, res, next) => {
    passport.authenticate("admin-local", (err, admin, info) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: info ? info.message : "Invalid admin username or password.",
            });
        }

        req.login(admin, (loginErr) => {
            if (loginErr) return res.status(500).json({ success: false, message: loginErr.message });
            return res.status(200).json({
                success: true,
                message: "Admin authenticated successfully.",
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                },
            });
        });
    })(req, res, next);
});

router.get("/check-auth", (req, res) => {
    if (req.isAuthenticated() && req.user && req.user.constructor.modelName === "Admin") {
        return res.status(200).json({ success: true, admin: req.user });
    }
    return res.status(401).json({ success: false, message: "Not logged in" });
});

router.get("/dashboard", isAdminAuth, async (req, res) => {
    try {
        const checkers = await Checker.find().sort({ createdAt: -1 });
        const bookings = await Booking.find()
            .populate("user", "username contact")
            .populate("checker", "username contact")
            .sort({ createdAt: -1 });
        const totalUsers = await User.countDocuments();

        const completedBookings = bookings.filter((b) => b.status === "completed");
        const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const platformEarnings = completedBookings.reduce((sum, b) => sum + (b.platformCommission || 0), 0);
        const partnerPayouts = completedBookings.reduce((sum, b) => sum + (b.checkerEarnings || 0), 0);

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalCheckers: checkers.length,
                pendingApprovals: checkers.filter((c) => c.authorizationStatus === "pending").length,
                totalBookings: bookings.length,
                completedTests: completedBookings.length,
                totalRevenue,
                platformEarnings,
                partnerPayouts,
            },
            checkers,
            bookings,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/verify-checker", isAdminAuth, async (req, res) => {
    try {
        const { checkerId, status, rejectionReason } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        if (status === "rejected" && (!rejectionReason || !rejectionReason.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a reason for rejecting the application.",
            });
        }

        const updateData = {
            authorizationStatus: status,
            authorizedBy: req.user ? req.user._id : null,
            authorizedAt: new Date(),
            rejectionReason: status === "rejected" ? rejectionReason.trim() : "",
            isActive: status === "approved",
        };

        const checker = await Checker.findByIdAndUpdate(
            checkerId,
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!checker) {
            return res.status(404).json({ success: false, message: "Checker not found." });
        }

        return res.status(200).json({
            success: true,
            message: `Checker application marked as ${status}.`,
            checker,
        });
    } catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/trigger-expiry-reminders", isAdminAuth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetEnd = new Date(today);
        targetEnd.setDate(targetEnd.getDate() + 7);

        const expiringSoon = await Booking.find({
            status: "completed",
            expiryDate: { $gte: today, $lte: targetEnd },
        }).populate("user", "username contact");

        let sentCount = 0;
        for (const booking of expiringSoon) {
            if (booking.user?.contact) {
                const vehicles = booking.vehicles.map((v) => v.number).join(", ");
                const expiryFormatted = new Date(booking.expiryDate).toLocaleDateString("en-IN");
                const msg = `Dear ${booking.user.username}, PUC for ${vehicles} expires on ${expiryFormatted}. Book your doorstep renewal now to avoid fines: http://localhost:5173/dashboard`;

                await sendSMS(booking.user.contact, msg);
                sentCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Manual reminder check completed. ${sentCount} SMS alert(s) dispatched.`,
            sentCount,
        });
    } 
    
    catch (err) {
        console.error("Trigger reminders error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/settle-commission", isAdminAuth, async (req, res) => {
    try {
        const { checkerId, amountSettled } = req.body;

        const checker = await Checker.findById(checkerId);
        if (!checker) {
            return res.status(404).json({ success: false, message: "Checker not found." });
        }

        const settleAmount = Number(amountSettled) || checker.commissionDue || 0;
        checker.commissionDue = Math.max(0, (checker.commissionDue || 0) - settleAmount);
        await checker.save();

        return res.status(200).json({
            success: true,
            message: `Settlement of ₹${settleAmount} recorded successfully.`,
            checker,
        });
    } catch (err) {
        console.error("Settle commission error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        return res.status(200).json({ success: true, message: "Logged out successfully." });
    });
});

module.exports = router;