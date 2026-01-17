const express = require("express");
const router = express.Router();
const Booking = require("../models/booking.js");
const { isLoggedIn } = require("../middleware");

// Vehicle prices
const VEHICLE_PRICES = { 2: 100, 3: 150, 4: 200 };

// Dashboard route
router.get("/dashboard", isLoggedIn, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.render("users/dashboard", { currUser: req.user, bookings });
    } catch (err) {
        console.error(err);
        req.flash("error", "Unable to load bookings");
        res.redirect("/");
    }
});

// Booking POST route
router.post("/booking", isLoggedIn, async (req, res) => {
    try {
        const vehicles = req.body.vehicles.map(v => ({
            number: v.number.toUpperCase(),
            type: Number(v.type),
            fuel: v.fuel
        }));

        // Prevent duplicate vehicle booking within 3 months
        const THREE_MONTHS = 1000 * 60 * 60 * 24 * 90;
        for (let v of vehicles) {
            const recentBooking = await Booking.findOne({
                "vehicles.number": v.number,
                user: req.user._id,
                createdAt: { $gte: new Date(Date.now() - THREE_MONTHS) }
            });
            if (recentBooking) {
                req.flash("error", `Vehicle ${v.number} has already been booked within the last 3 months.`);
                return res.redirect("/dashboard");
            }
        }

        // Calculate total price
        const totalPrice = vehicles.reduce((sum, v) => sum + VEHICLE_PRICES[v.type], 0);

        // Set payment status
        const paymentStatus = req.body.payment_type === "UPI" ? "Paid" : "Pending";

        // Create booking
        const booking = new Booking({
            user: req.user._id,
            vehicles,
            totalPrice,
            paymentType: req.body.payment_type,
            paymentStatus,
            address: req.body.address,
            location: { latitude: req.body.latitude, longitude: req.body.longitude }
        });

        await booking.save();
        req.flash("success", "PUC booking created successfully!");
        res.redirect("/dashboard");

    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to create booking. Please try again.");
        res.redirect("/dashboard");
    }
});

module.exports = router;

