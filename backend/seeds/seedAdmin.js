const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Admin = require("../models/admin.js");

if (
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_CONTACT
) {
    console.error("❌ Missing admin environment variables in backend/.env:", {
        ADMIN_USERNAME: process.env.ADMIN_USERNAME || "MISSING",
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "SET" : "MISSING",
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || "MISSING",
        ADMIN_CONTACT: process.env.ADMIN_CONTACT || "MISSING",
    });
    process.exit(1);
}

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/puc-booking-platform";

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB for seeding.");

        const existingAdmin = await Admin.findOne({
            $or: [
                { username: process.env.ADMIN_USERNAME },
                { email: process.env.ADMIN_EMAIL },
            ],
        });

        if (existingAdmin) {
            console.log("ℹ️ Admin user already exists with this username/email.");
            return;
        }

        const newAdmin = new Admin({
            username: process.env.ADMIN_USERNAME,
            email: process.env.ADMIN_EMAIL,
            contact: process.env.ADMIN_CONTACT,
            isActive: true,
            role: "superadmin",
        });

        await Admin.register(newAdmin, process.env.ADMIN_PASSWORD);
        console.log("✅ Master Admin created successfully.");
    } catch (err) {
        console.error("❌ Admin Seeding Error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
}

seedAdmin();