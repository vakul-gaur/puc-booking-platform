const express = require("express");
const router = express.Router();
const Booking = require("../models/booking.js");
const Checker = require("../models/checker.js");
const passport = require("passport");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const { calculateDistance } = require("../utils/smsService.js");
const { generatePUCCertificate } = require("../utils/pdfService.js");

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only images (JPEG/PNG) or PDF allowed"), false);
        }
    },
});

const isCheckerAuth = (req, res, next) => {
    if (req.isAuthenticated() && req.user && req.user.constructor.modelName === "Checker") {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in as a checker.",
    });
};

router.post("/checkersignup", upload.any(), async (req, res) => {
    try {
        const {
            username, email, contact, password, area, city, state, address, licenseNumber, licenseExpiry, idProofType
        } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Verification documents are required.",
            });
        }

        const existingChecker = await Checker.findOne({
            $or: [{ username }, { email }, { contact }, { licenseNumber }],
        });

        if (existingChecker) {
            return res.status(409).json({
                success: false,
                message: "Username, email, contact, or license number is already registered.",
            });
        }

        const files = req.files.map((file) => file.path);

        const checker = new Checker({
            username,
            email,
            contact,
            area: area?.trim(),
            city: city || "",
            state: state || "",
            address: address || "",
            licenseNumber,
            licenseExpiry,
            checkerId: `CHK-${Date.now()}`,
            authorizationStatus: "pending",
            documents: {
                idProofType,
                documentFiles: files,
            },
        });

        await Checker.register(checker, password);

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully! Awaiting admin approval.",
        });
    } catch (err) {
        console.error("Checker signup error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Registration failed.",
        });
    }
});

router.post("/checkerlogin", (req, res, next) => {
    passport.authenticate("checker-local", (err, checker, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!checker) {
            return res.status(401).json({
                success: false,
                message: info ? info.message : "Invalid username or password.",
            });
        }

        req.login(checker, async (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ success: false, message: loginErr.message });
            }

            checker.lastLogin = new Date();
            await checker.save();

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                checker: {
                    id: checker._id,
                    username: checker.username,
                    email: checker.email,
                    contact: checker.contact,
                    licenseNumber: checker.licenseNumber,
                    area: checker.area,
                    city: checker.city,
                    authorizationStatus: checker.authorizationStatus,
                    walletBalance: checker.walletBalance || 0,
                    commissionDue: checker.commissionDue || 0,
                },
            });
        });
    })(req, res, next);
});

router.get("/checker/dashboard", isCheckerAuth, async (req, res) => {
    try {
        const checker = await Checker.findById(req.user._id);
        const checkerArea = (checker.area || "").trim();
        const checkerCity = (checker.city || "").trim();

        const checkerLat = Number(req.query.lat) || checker.location?.latitude;
        const checkerLng = Number(req.query.lng) || checker.location?.longitude;

        const activeBooking = await Booking.findOne({
            checker: checker._id,
            status: { $in: ["accepted", "in_progress"] },
        }).populate("user", "username contact");

        let pendingBookings = [];

        if (!activeBooking) {
            const filter = {
                status: "pending",
                checker: null,
            };

            if (checkerCity || checkerArea) {
                filter.$or = [
                    { district: { $regex: checkerCity || checkerArea, $options: "i" } },
                    { area: { $regex: checkerArea, $options: "i" } },
                    { address: { $regex: checkerArea, $options: "i" } },
                    { district: "" },
                    { district: { $exists: false } },
                ];
            }

            const rawBookings = await Booking.find(filter)
                .populate("user", "username contact")
                .sort({ createdAt: -1 })
                .lean();

            pendingBookings = rawBookings.map((b) => {
                const distanceKm = calculateDistance(
                    checkerLat,
                    checkerLng,
                    b.location?.latitude,
                    b.location?.longitude
                );
                return {
                    ...b,
                    distanceKm: distanceKm !== null ? distanceKm : null,
                };
            });

            pendingBookings.sort((a, b) => {
                if (a.distanceKm === null) return 1;
                if (b.distanceKm === null) return -1;
                return a.distanceKm - b.distanceKm;
            });
        }

        const completedBookings = await Booking.find({
            checker: checker._id,
            status: "completed",
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const now = new Date();

        let todayIncome = 0;
        let monthlyIncome = 0;
        let last24Hours = 0;

        completedBookings.forEach((b) => {
            const amount = Number(b.checkerEarnings || b.totalPrice || 0);
            const compDate = new Date(b.completedAt || b.updatedAt);

            if (compDate >= today) todayIncome += amount;
            if (compDate >= monthStart) monthlyIncome += amount;
            if (now - compDate <= 86400000) last24Hours += amount;
        });

        return res.status(200).json({
            success: true,
            checker,
            activeBooking,
            pendingBookings,
            earnings: {
                today: todayIncome,
                monthly: monthlyIncome,
                last24Hours,
                completedJobs: completedBookings.length,
            },
        });
    } catch (err) {
        console.error("Checker dash error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/checker/accept-booking", isCheckerAuth, async (req, res) => {
    try {
        const checker = await Checker.findById(req.user._id);

        if (checker.authorizationStatus !== "approved") {
            return res.status(403).json({
                success: false,
                message: "Your profile is pending admin approval. You cannot accept jobs yet.",
            });
        }

        const active = await Booking.findOne({
            checker: req.user._id,
            status: { $in: ["accepted", "in_progress"] },
        });

        if (active) {
            return res.status(400).json({
                success: false,
                message: "Please complete your current active booking first.",
            });
        }

        const { booking_id } = req.body;
        const booking = await Booking.findOneAndUpdate(
            { _id: booking_id, status: "pending", checker: null },
            { $set: { checker: req.user._id, status: "accepted" } },
            { returnDocument: 'after' }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking is unavailable or already taken.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking accepted successfully.",
            booking,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/checker/verify-start-otp", isCheckerAuth, async (req, res) => {
    try {
        const { booking_id, otp } = req.body;

        if (!booking_id || !otp) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and 4-digit verification OTP are required.",
            });
        }

        const booking = await Booking.findById(booking_id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found.",
            });
        }

        if (!booking.checker || booking.checker.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized. You are not assigned to this inspection.",
            });
        }

        if (String(booking.startOtp).trim() !== String(otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Incorrect verification OTP. Please verify with the customer.",
            });
        }

        booking.status = "in_progress";
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. Test in progress.",
            booking,
        });
    } catch (err) {
        console.error("OTP verification error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to verify OTP.",
        });
    }
});

router.post("/checker/complete-booking", isCheckerAuth, upload.any(), async (req, res) => {
    try {
        const { booking_id, payment_status } = req.body;
        const booking = await Booking.findById(booking_id)
            .populate("user", "username contact")
            .populate("checker", "username contact checkerId");

        if (!booking || !booking.checker || booking.checker._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this booking.",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Proof photo is required.",
            });
        }

        const total = booking.totalPrice || 0;
        const platformCommission = Math.round(total * 0.20); // 20% platform cut
        const checkerEarnings = total - platformCommission;   // 80% partner earnings

        const sixMonthsExpiry = new Date();
        sixMonthsExpiry.setDate(sixMonthsExpiry.getDate() + 180);

        booking.status = "completed";
        booking.paymentStatus = String(payment_status).toLowerCase() === "paid" ? "Paid" : "Pending";
        booking.proofPhoto = req.files[0].path;
        booking.completedAt = new Date();
        booking.expiryDate = sixMonthsExpiry;
        booking.platformCommission = platformCommission;
        booking.checkerEarnings = checkerEarnings;

        const primaryVehicle = booking.vehicles[0] || { number: "VEHICLE", type: "2", fuel: "Petrol" };
        try {
            const pdfPath = await generatePUCCertificate(booking, primaryVehicle);
            booking.certificateUrl = `http://localhost:8080${pdfPath}`;
        } catch (pdfErr) {
            console.error("PDF generation fallback:", pdfErr);
            booking.certificateUrl = req.files[0].path;
        }

        await booking.save();

        const checker = await Checker.findById(req.user._id);
        checker.completedBookings = (checker.completedBookings || 0) + 1;
        checker.totalEarnings = (checker.totalEarnings || 0) + checkerEarnings;

        if (booking.paymentType === "COD") {
            checker.commissionDue = (checker.commissionDue || 0) + platformCommission;
        } else {
            checker.walletBalance = (checker.walletBalance || 0) + checkerEarnings;
        }

        await checker.save();

        return res.status(200).json({
            success: true,
            message: "Booking completed and verified PDF certificate generated successfully.",
            booking,
            settlement: {
                total,
                checkerEarnings,
                platformCommission,
            },
        });
    } catch (err) {
        console.error("Complete booking error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/checkerlogout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    });
});

module.exports = router;