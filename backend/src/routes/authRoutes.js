import express from "express";
import { signUp, login, updateUser, resetPasswordRequest, resetPassword } from "../controllers/authController.js";
import { validateUserSignup, validateUserLogin, validateUserUpdate, validatePasswordResetRequest, validatePasswordReset } from "../middlewares/userValidationMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route for user sign-up (registration)
router.post("/signup", validateUserSignup, signUp);

// Route for user login
router.post("/login", validateUserLogin, login);

// Route to update user profile (only accessible for authenticated users)
router.put("/update", protect, validateUserUpdate, updateUser);

// Route to initiate password reset process
router.post("/reset-password-request", validatePasswordResetRequest, resetPasswordRequest);

// Route to reset password (user must provide the reset token)
router.post("/reset-password", validatePasswordReset, resetPassword);

export default router;
