const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let passportLocalMongoose = require("passport-local-mongoose");
if (passportLocalMongoose.default) {
    passportLocalMongoose = passportLocalMongoose.default;
}

const checkerSchema = new Schema(
    {
        username: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true 
        },

        email: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true, 
            trim: true 
        },

        contact: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true 
        },

        checkerId: { 
            type: String, 
            unique: true 
        },

        area: { 
            type: String, 
            required: true, 
            trim: true 
        },

        city: { 
            type: String, 
            default: "" 
        },

        state: { 
            type: String, 
            default: "" 
        },

        address: { 
            type: String, 
            default: "" 
        },

        location: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null }
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

        authorizedAt: Date,

        rejectionReason: { 
            type: String, 
            default: "" 
        },
        
        licenseNumber: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true
        },

        licenseExpiry: { 
            type: Date, 
            required: true 
        },

        documents: {
            idProofType: {
                type: String,
                enum: ["AADHAAR", "DL", "PASSPORT"],
                required: true
            },
            documentFiles: {
                type: [String],
                required: true,
                validate: {
                    validator: (v) => v && v.length > 0,
                    message: "At least one document is required"
                }
            }
        },
        
        isActive: { 
            type: Boolean, 
            default: false 
        },

        isAvailable: { 
            type: Boolean, 
            default: true 
        },

        lastLogin: Date,

        totalBookings: { 
            type: Number, 
            default: 0 
        },

        completedBookings: { 
            type: Number, 
            default: 0 
        },

        cancelledBookings: { 
            type: Number, 
            default: 0 
        },

        rating: { 
            type: Number, 
            default: 5 
        },

        totalReviews: { 
            type: Number, 
            default: 0 
        },

        walletBalance: { 
            type: Number, 
            default: 0 
        },

        commissionDue: { 
            type: Number, 
            default: 0 
        },

        totalEarnings: { 
            type: Number, 
            default: 0 
        },

        todayEarnings: { 
            type: Number, 
            default: 0 
        },
        
        monthlyEarnings: { 
            type: Number, 
            default: 0 
        }

    }, 
    { timestamps: true }
);

checkerSchema.plugin(passportLocalMongoose);

checkerSchema.methods.resetToday = function () {
    this.todayEarnings = 0;
};

module.exports = mongoose.model("Checker", checkerSchema);