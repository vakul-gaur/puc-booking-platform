const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const passportLocalMongoose = require("passport-local-mongoose").default;
const plm = require("passport-local-mongoose");
const passportLocalMongoose = plm.default || plm;

const userSchema = new mongoose.Schema({
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
}

});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);