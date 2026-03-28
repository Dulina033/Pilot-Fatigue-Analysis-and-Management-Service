const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  photo: String,
  dob: { type: String, required: true },
  nationality: { type: String, required: true },
  passport: String,
  address: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  pilotId: { type: String, required: true },
  rank: String,
  location: String,
  license: String,
});

module.exports = mongoose.model("Register", registerSchema);
