const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
    number: {
        type: String, 
        required: true, 
        uppercase: true, 
        trim: true 
    },

    type: { 
        type: Number, 
        required: true, 
        enum: [2, 3, 4] 
    },

    fuel: { 
        type: String, 
        required: true, 
        enum: ["Petrol", "Diesel", "CNG"] }
});

const bookingSchema = new Schema({

    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },

    vehicles: {
        type: [vehicleSchema],
        required: true,
        validate: v => v.length >= 1 && v.length <= 5
    },

    totalPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    paymentType: 
    { type: String, 
        required: true, 
        enum: ["UPI", "COD"] 
    },

    paymentStatus: { 
        type: String, 
        enum: ["Pending", "Paid"], 
        default: "Pending" 
    },

    address: { 
        type: String, 
        required: true, 
        trim: true 
    },

    location: { 
        latitude: Number, 
        longitude: Number 
    },

    status: { 
        type: String, 
        enum: ["Pending", "Confirmed", "Completed", "Cancelled"], 
        default: "Pending" 
    },
}, 

{ timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
