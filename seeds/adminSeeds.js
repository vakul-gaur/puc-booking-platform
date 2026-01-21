require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/admin.js");

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_EMAIL) {
    console.error("Missing admin environment variables");
    process.exit(1);
}

mongoose.connect("mongodb://127.0.0.1:27017/puc-booking-platform");

async function seedAdmin() {
    try {
        const existingAdmin = await Admin.findOne({
            username: process.env.ADMIN_USERNAME
        });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            return;
        }

        await Admin.register(
            {
                username: process.env.ADMIN_USERNAME,
                email: process.env.ADMIN_EMAIL,
                contact: process.env.ADMIN_CONTACT,
                isActive: true
            },
            process.env.ADMIN_PASSWORD
        );

        console.log("Admin created successfully.");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

seedAdmin();
