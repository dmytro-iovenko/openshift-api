import { body } from "express-validator";
import User from "../models/User.js";

/**
 * Validation middleware for user-related actions (sign-up, login, user updates).
 */

// Sign-up validation rules
export const validateUserSignup = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom(async (value) => {
      // Check if the email already exists in the database
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("E-mail already in use");
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain a special character (@$!%*?&)"),
];

// Login validation rules
export const validateUserLogin = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// User profile update validation rules
export const validateUserUpdate = [
  body("name").optional().isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom((value, { req }) => {
      // Ensure that the new email is not already taken by another user
      return User.findOne({ email: value }).then((user) => {
        if (user && user._id.toString() !== req.user.id) {
          return Promise.reject("E-mail already in use");
        }
      });
    }),
];

// Validate password reset request
export const validatePasswordResetRequest = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom((value) => {
      return User.findOne({ email: value }).then((user) => {
        if (!user) {
          return Promise.reject("E-mail not found");
        }
      });
    }),
];

// Validate password reset (new password)
export const validatePasswordReset = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain a special character (@$!%*?&)"),
];
