const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const passport = require("passport");

const User = require("../models/user.js");
const Checker = require("../models/checker.js");
const { validateUser } = require("../middleware.js");

const otpStore = new Map();
const OTP_EXPIRY = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
}

function formatPhoneNumber(phoneNumber) {
    let formattedPhone = phoneNumber.toString().trim();
    if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+91" + formattedPhone.replace(/^0/, "");
    }
    return formattedPhone;
}

async function sendOTPviaSMSGate(phoneNumber, otp) {
    const credentials = Buffer.from(
        `${process.env.SMSGATE_USERNAME}:${process.env.SMSGATE_PASSWORD}`
    ).toString("base64");

    const formattedPhone = formatPhoneNumber(phoneNumber);

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
        const errorText = await response.text();
        throw new Error(`SMSGate Error ${response.status}: ${errorText}`);
    }

    return await response.json();
}

router.post("/send-otp", async (req, res) => {
    try {
        const { contact, role } = req.body;

        if (!contact || !/^\d{10}$/.test(String(contact))) {
            return res.status(400).json({
                success: false,
                message: "Valid 10-digit contact number required.",
            });
        }

        if (role === "checker") {
            const existingChecker = await Checker.findOne({ contact });
            if (existingChecker) {
                return res.status(409).json({
                    success: false,
                    message: "This number is already registered as a checker.",
                });
            }
        } else {
            const existingUser = await User.findOne({ contact });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "This number is already registered as a user.",
                });
            }
        }

        const otp = generateOTP();
        const otpHash = hashOTP(otp);
        const expiry = Date.now() + OTP_EXPIRY;

        otpStore.set(String(contact), {
            otpHash, expiry,
            verified: false,
            attempts: 0,
            createdAt: Date.now(),
        });

        await sendOTPviaSMSGate(contact, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
        });
    } 
    
    catch (error) {
        console.error("SEND OTP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to send OTP. Please try again.",
        });
    }
});

router.post("/verify-otp", async (req, res) => {
    try {
        const { contact, otp } = req.body;

        if (!contact || !/^\d{10}$/.test(String(contact))) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact number.",
            });
        }

        if (!otp || !/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 6-digit OTP.",
            });
        }

        const record = otpStore.get(String(contact));

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP.",
            });
        }

        if (Date.now() > record.expiry) {
            otpStore.delete(String(contact));
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new one.",
            });
        }

        if (record.attempts >= MAX_OTP_ATTEMPTS) {
            otpStore.delete(String(contact));
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP.",
            });
        }

        const submittedHash = hashOTP(String(otp).trim());

        if (submittedHash !== record.otpHash) {
            record.attempts++;
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again.",
            });
        }

        record.verified = true;
        record.verifiedAt = Date.now();

        return res.status(200).json({
            success: true,
            message: "Mobile number verified successfully.",
        });
    } catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "OTP verification failed.",
        });
    }
});

router.post("/signup", validateUser, async (req, res, next) => {
    try {
        const { username, email, contact, password } = req.body;

        const record = otpStore.get(String(contact));

        if (!record || !record.verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your mobile number before registering.",
            });
        }

        if (Date.now() > record.expiry) {
            otpStore.delete(String(contact));
            return res.status(403).json({
                success: false,
                message: "OTP verification expired. Please verify again.",
            });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { contact }],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username, email or contact is already registered.",
            });
        }

        const user = new User({ username, email, contact });
        const registeredUser = await User.register(user, password);

        otpStore.delete(String(contact));

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            return res.status(201).json({
                success: true,
                message: "Registration successful.",
                user: {
                    id: registeredUser._id,
                    username: registeredUser.username,
                    email: registeredUser.email,
                    contact: registeredUser.contact,
                },
            });
        });
    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
        });
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("user-local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!user) {
            return res.status(401).json({
                success: false,
                message: info ? info.message : "Invalid username or password.",
            });
        }

        req.login(user, (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ success: false, message: loginErr.message });
            }

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    contact: user.contact,
                },
            });
        });
    })(req, res, next);
});

router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    });
});

module.exports = { router, otpStore };