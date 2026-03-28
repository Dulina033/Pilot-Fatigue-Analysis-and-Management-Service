// backend/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const {
  sendContactMessage,
  getAllMessages,
  markAsRead,
  markAsReplied,
  deleteMessage,
} = require("../controllers/contactController");
const { verifyToken } = require("../controllers/authController");

// Public route - anyone can send message
router.post("/contact", sendContactMessage);

// Admin routes (protected with JWT)
router.get("/admin/contacts", verifyToken, getAllMessages);
router.patch("/admin/contacts/:id/read", verifyToken, markAsRead);
router.patch("/admin/contacts/:id/reply", verifyToken, markAsReplied);
router.delete("/admin/contacts/:id", verifyToken, deleteMessage);

module.exports = router;
