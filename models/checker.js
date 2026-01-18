const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plm = require("passport-local-mongoose");
const passportLocalMongoose = plm.default || plm;

const checkerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    contact: {
        type: String,
        required: true,
        unique: true
    },

    checkerId: {
        type: String,
        unique: true
    },

    authorizationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    authorizedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin"
    },

    authorizedAt: {
        type: Date
    },

    rejectionReason: {
        type: String
    },

    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },

    licenseExpiry: {
        type: Date,
        required: true
    },

    documents: {
        idProofType: {
            type: String,
            enum: ["AADHAAR", "DL", "PASSPORT"]
        },
        documentFiles: [String]
    },

    isActive: {
        type: Boolean,
        default: false
    },

    lastLogin: {
        type: Date
    }
}, { timestamps: true });

checkerSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Checker", checkerSchema);