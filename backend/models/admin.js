const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let passportLocalMongoose = require("passport-local-mongoose");
if (passportLocalMongoose.default) {
    passportLocalMongoose = passportLocalMongoose.default;
}

const adminSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        contact: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["superadmin", "moderator", "finance_manager"],
            default: "superadmin",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLogin: {
            type: Date,
        },
    },
    { timestamps: true }
);

adminSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Admin", adminSchema);