// backend/controllers/contactController.js
const Contact = require("../models/contactModel");
const nodemailer = require("nodemailer");

// Send contact message
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    // Save to database
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject?.trim() || "No Subject",
      message: message.trim(),
      ipAddress:
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    await contact.save();
    console.log(
      `📧 Contact message saved from ${email} with ID: ${contact._id}`,
    );

    // Optional: Send email notification
    await sendEmailNotification(contact);

    res.json({
      success: true,
      message: "Message sent successfully. We'll get back to you soon!",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || "Validation error",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

// Get all contact messages (Admin only - protected route)
exports.getAllMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

// Mark message as read (Admin only)
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findByIdAndUpdate(
      id,
      {
        status: "read",
        readAt: new Date(),
      },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};

// Mark message as replied (Admin only)
exports.markAsReplied = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const message = await Contact.findByIdAndUpdate(
      id,
      {
        status: "replied",
        repliedAt: new Date(),
        notes: notes || null,
      },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error marking message as replied:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};

// Delete message (Admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};

// Helper function to send email notification (optional)
async function sendEmailNotification(contact) {
  try {
    // Only send email if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email not configured - skipping email notification");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Flightara Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Message: ${contact.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message.replace(/\n/g, "<br>")}</p>
        <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
        <p><strong>IP:</strong> ${contact.ipAddress}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email notification sent for contact: ${contact._id}`);
  } catch (error) {
    console.error("Email notification failed:", error);
  }
}
