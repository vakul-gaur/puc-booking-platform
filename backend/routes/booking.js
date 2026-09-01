const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Booking = require("../models/booking.js");
const { sendSMS } = require("../utils/smsService.js");

const isUserAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ success: false, message: "Please log in first." });
};

router.get("/user/bookings", isUserAuth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("checker", "username contact")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, bookings });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/booking", isUserAuth, async (req, res) => {
    try {
        const {
            vehicles, total_price, payment_type, address, area, district, state, latitude, longitude, bookingDate, timeSlot
        } = req.body;

        if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
            return res.status(400).json({ success: false, message: "At least one vehicle is required." });
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

        for (const v of vehicles) {
            const cleanNumber = v.number.trim().toUpperCase();

            const existingRecentTest = await Booking.findOne({
                "vehicles.number": cleanNumber,
                status: { $in: ["completed", "accepted", "in_progress"] },
                createdAt: { $gte: sixMonthsAgo },
            }).sort({ createdAt: -1 });

            if (existingRecentTest) {
                const testDate = new Date(existingRecentTest.createdAt);
                const nextEligibleDate = new Date(testDate);
                nextEligibleDate.setDate(nextEligibleDate.getDate() + 180);

                return res.status(400).json({
                    success: false,
                    message: `Vehicle ${cleanNumber} already has an active PUC check from ${testDate.toLocaleDateString(
                        "en-IN"
                    )}. Next renewal available on ${nextEligibleDate.toLocaleDateString("en-IN")}.`,
                });
            }
        }

        const startOtp = crypto.randomInt(1000, 10000).toString();

        const booking = new Booking({
            user: req.user._id,
            vehicles: vehicles.map((v) => ({ ...v, number: v.number.trim().toUpperCase() })),
            totalPrice: Number(total_price) || 0,
            paymentType: payment_type || "UPI",
            address: address ? address.trim() : "",
            area: area || "",
            district: district || "",
            state: state || "",
            location: {
                latitude: Number(latitude) || null,
                longitude: Number(longitude) || null,
            },
            bookingDate: new Date(bookingDate),
            timeSlot: timeSlot || "10:00 AM - 12:00 PM",
            startOtp,
            status: "pending",
        });

        await booking.save();

        if (req.user.contact) {
            const vehicleList = vehicles.map((v) => v.number.trim().toUpperCase()).join(", ");
            const formattedDate = new Date(bookingDate).toLocaleDateString("en-IN");
            const msg = `Doorstep PUC booked for ${vehicleList} on ${formattedDate} (${timeSlot}). Your Start OTP is ${startOtp}. Technician will arrive shortly.`;
            
            sendSMS(req.user.contact, msg).catch((smsErr) => {
                console.warn("[SMS Dispatch Skipped]:", smsErr.message);
            });
        }

        return res.status(201).json({
            success: true,
            message: "Doorstep PUC Scheduled successfully!",
            booking,
        });
    } 
    
    catch (err) {
        console.error("Booking creation error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/verify-certificate", async (req, res) => {
    try {
        const { cert, veh } = req.query;

        if (!veh) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: "Vehicle number parameter is missing.",
            });
        }

        const cleanVeh = veh.trim().toUpperCase();

        const booking = await Booking.findOne({
            status: "completed",
            "vehicles.number": cleanVeh,
        })
            .sort({ completedAt: -1 })
            .populate("checker", "username checkerId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: "No active or compliant PUC record found for this vehicle number.",
            });
        }

        const isExpired = new Date(booking.expiryDate) < new Date();

        return res.status(200).json({
            success: true,
            valid: !isExpired,
            certificateNo: cert || "PUC-VERIFIED",
            vehicleNumber: cleanVeh,
            status: isExpired ? "EXPIRED" : "ACTIVE / COMPLIANT",
            testedOn: booking.completedAt,
            validUntil: booking.expiryDate,
            inspector: booking.checker?.username || "Authorized Inspector",
        });
    } catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;