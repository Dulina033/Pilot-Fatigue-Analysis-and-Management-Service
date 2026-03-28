const Register = require("../models/registerModel");

exports.registerUser = async (req, res) => {
  try {
    const userData = req.body;

    const requiredFields = [
      "fullName",
      "lastName",
      "dob",
      "nationality",
      "address",
      "email",
      "phone",
      "pilotId",
    ];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return res
          .status(400)
          .json({ success: false, message: `Missing field: ${field}` });
      }
    }

    const newUser = new Register(userData);
    await newUser.save();
    res.json({ success: true, message: "Registration saved to database." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed due to server error.",
    });
  }
};
