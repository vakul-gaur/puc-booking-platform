const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plm = require("passport-local-mongoose");
const passportLocalMongoose = plm.default || plm;

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },

    email: {
        type: String,
        unique: true,
    },

    contact: {
        type: String,
        required: true,
        unique: true
    },

    isActive: {
        type: Boolean,
        default: false
    },

    lastLogin: {
        type: Date
    }
}, { timestamps: true });

adminSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Admin", adminSchema);