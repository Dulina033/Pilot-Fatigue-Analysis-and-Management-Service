// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const USER = {
  id: 1,
  email: "admin@example.com",
  password: "123456",
  role: "admin",
};

// Store active sessions (optional with JWT)
let activeSessions = new Set();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET ||
      "your-fallback-secret-key-do-not-use-in-production",
    { expiresIn: "24h" },
  );
};

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "your-fallback-secret-key-do-not-use-in-production",
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Login controller
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check credentials (in production, check against database)
    if (email === USER.email && password === USER.password) {
      // Generate JWT token
      const token = generateToken(USER);

      // Optional: store in active sessions
      activeSessions.add(token);

      // Don't send password back
      const userResponse = {
        id: USER.id,
        email: USER.email,
        role: USER.role,
      };

      res.json({
        success: true,
        token: token,
        user: userResponse,
        message: "Login successful",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Logout controller
exports.logout = (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      activeSessions.delete(token);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

// Check authentication status
exports.checkAuth = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        "your-fallback-secret-key-do-not-use-in-production",
    );

    // Optional: check if token exists in active sessions
    if (activeSessions.has(token)) {
      res.json({
        authenticated: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        },
      });
    } else {
      res.status(401).json({
        authenticated: false,
        message: "Session expired",
      });
    }
  } catch (error) {
    res.status(401).json({
      authenticated: false,
      message: "Invalid or expired token",
    });
  }
};

// Get current user info (protected route example)
exports.getCurrentUser = (req, res) => {
  // This route should be protected by verifyToken middleware
  res.json({
    success: true,
    user: req.user,
  });
};
