import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";

/**
 * Helper function to generate a JWT token for the user
 * @param {Object} user - The user object
 * @returns {string} - The generated JWT token
 */
const generateToken = (user) => {
  const payload = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * Sign-up controller.
 * Handles user registration.
 */
export const signUp = [
  // Apply validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    console.log("Request body:", errors);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already in use" });
      }

      // Create new user
      const newUser = new User({
        name,
        email,
        password,
        role: "user",
      });

      await newUser.save();

      // Generate JWT token
      const token = generateToken(newUser);

      res.status(StatusCodes.CREATED).json({
        message: "User registered successfully",
        user: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * Login controller.
 * Handles user login and token generation.
 */
export const login = [
  // Apply validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid email or password" });
      }

      // Log user object for debugging
      console.log("User from DB:", user);
      const isMatch = await bcrypt.compare(password, user.password);

      // Compare passwords
      if (!isMatch) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = generateToken(user);

      res.status(StatusCodes.OK).json({
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token, // Send token back to the client
      });
    } catch (err) {
      next(err); // Pass error to global error handler
    }
  },
];

/**
 * User update controller.
 * Allows users to update their profile (name, email).
 */
export const updateUser = [
  // Apply validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    const { name, email } = req.body;
    try {
      // Find user by ID (from JWT token)
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      }

      // Update user data
      if (name) user.name = name;
      if (email) user.email = email;

      // Save updated user
      await user.save();

      res.status(StatusCodes.OK).json({
        message: "User updated successfully",
        user: {
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * Password reset request controller.
 * Initiates the password reset process by sending a reset email.
 */
export const resetPasswordRequest = [
  // Apply validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    const { email } = req.body;
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "No user found with this email" });
      }

      // Generate password reset token (JWT or custom token)
      const resetToken = generateToken(user);

      // Send password reset email (email sending logic here)
      // For now, we just log the reset token
      console.log(`Password reset token for ${user.email}: ${resetToken}`);

      res.status(StatusCodes.OK).json({
        message: "Password reset request successful. Check your email for instructions.",
      });
    } catch (err) {
      next(err);
    }
  },
];

/**
 * Password reset controller.
 * Handles password reset using the token.
 */
export const resetPassword = [
  // Apply validation middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res, next) => {
    const { token, newPassword } = req.body;
    try {
      // Verify the reset token (it should be the same as JWT verification)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID (from token payload)
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password
      user.password = hashedPassword;
      await user.save();

      res.status(StatusCodes.OK).json({
        message: "Password reset successful",
      });
    } catch (err) {
      next(err);
    }
  },
];
