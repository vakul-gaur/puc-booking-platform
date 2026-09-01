const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        checker: {
            type: Schema.Types.ObjectId,
            ref: "Checker",
            default: null,
        },

        vehicles: [
            {
                number: { type: String, required: true, uppercase: true },
                type: { type: String, enum: ["2", "3", "4"], required: true },
                fuel: { type: String, enum: ["Petrol", "Diesel", "CNG"], required: true },
            },
        ],

        totalPrice: {
            type: Number,
            required: true,
        },
        
        platformCommission: {
            type: Number,
            default: 0,
        },

        checkerEarnings: {
            type: Number,
            default: 0,
        },

        paymentType: {
            type: String,
            enum: ["UPI", "COD"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "pending", "paid"],
            default: "Pending",
        },

        address: {
            type: String,
            required: true,
        },

        area: { 
            type: String, 
            default: "" 
        },

        district: { 
            type: String, 
            default: "" 
        },

        state: { 
            type: String, 
            default: "" 
        },

        location: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
        },

        bookingDate: {
            type: Date,
            required: true,
        },

        timeSlot: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
            default: "pending",
        },

        startOtp: {
            type: String,
            required: true,
        },

        certificateUrl: {
            type: String,
            default: "",
        },

        completedAt: Date,
        
        expiryDate: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);