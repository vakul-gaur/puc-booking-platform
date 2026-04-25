const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl, validateUser } = require("../middleware.js");

const otpStore = {};

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPviaSMSGate(phoneNumber, otp) {
    const credentials = Buffer.from(
        `${process.env.SMSGATE_USERNAME}:${process.env.SMSGATE_PASSWORD}`
    ).toString("base64");

    let formattedPhone = phoneNumber.toString().trim();
    if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+91" + formattedPhone.replace(/^0/, "");
    }

    const response = await fetch("https://api.sms-gate.app/3rdparty/v1/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${credentials}`,
        },
        body: JSON.stringify({
            textMessage: {
                text: `Your PUC Booking OTP is: ${otp}. Valid for 5 minutes. Do not share.`,
            },
            phoneNumbers: [formattedPhone],
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`SMSGate Error ${response.status}: ${err}`);
    }

    return await response.json();
}

router.post("/send-otp", async (req, res) => {
    try {
        const { contact } = req.body;

        if (!contact || !/^\d{10}$/.test(contact.toString())) {
            return res.status(400).json({
                success: false,
                message: "Valid 10-digit contact number required."
            });
        }

        const existing = await User.findOne({ contact });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "This number is already registered."
            });
        }

        const otp = generateOTP();
        const expiry = Date.now() + 5 * 60 * 1000;
        otpStore[contact] = { otp, expiry, verified: false };

        await sendOTPviaSMSGate(contact, otp);

        return res.json({
            success: true,
            message: `OTP successfully sent to +91${contact}`
        });

    } catch (e) {
        console.error("OTP send error:", e.message);
        return res.status(500).json({
            success: false,
            message: `SMS failed: ${e.message}`
        });
    }
});

router.post("/verify-otp", (req, res) => {
    const { contact, otp } = req.body;
    const record = otpStore[contact];

    if (!record) {
        return res.status(400).json({
            success: false,
            message: "OTP not sent. Please request OTP first."
        });
    }

    if (Date.now() > record.expiry) {
        delete otpStore[contact];
        return res.status(400).json({
            success: false,
            message: "OTP expired. Please request a new one."
        });
    }

    if (record.otp !== otp.toString().trim()) {
        return res.status(400).json({
            success: false,
            message: "Invalid OTP. Please try again."
        });
    }

    otpStore[contact].verified = true;
    return res.json({
        success: true,
        message: "Mobile number verified successfully!"
    });
});

router.get("/auth", (req, res) => {
    res.render("users/auth.ejs", {
        action: "signup",
        hideNavbar: true,
        hideFooter: true
    });
});

router.post("/signup", validateUser, async (req, res, next) => {
    try {
        const { username, email, contact, password } = req.body;

        const record = otpStore[contact];
        if (!record || !record.verified) {
            req.flash("error", "Please verify your mobile number with OTP before registering.");
            return res.redirect("/auth");
        }

        const user = new User({ username, email, contact });
        const registeredUser = await User.register(user, password);
        delete otpStore[contact];

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

router.post("/login", saveRedirectUrl,
    passport.authenticate("user-local", {
        failureFlash: true,
        failureRedirect: "/auth",
    }),
    async (req, res) => {
        req.flash("success", "Welcome back!");
        let redirectUrl = res.locals.redirectUrl || "/dashboard";
        res.redirect(redirectUrl);
    }
);

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out now!");
        res.redirect("/puc-booking-platform");
    });
});

module.exports = router;