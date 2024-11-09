import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import Application from "../models/Application.js";
import Deployment from "../models/Deployment.js";

/**
 * Middleware to protect routes by ensuring that the user is authenticated via JWT.
 * It checks the JWT token in the Authorization header.
 */
export const protect = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware to check if the user has the required role.
 * It supports multiple roles and checks if the user's role matches one of the allowed roles.
 */
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

/**
 * Middleware to ensure that the user is the owner of a Deployment (or an admin).
 */
export const checkDeploymentOwnership = async (req, res, next) => {
  const { deploymentId } = req.params;
  const { id: userId, role } = req.user;
  try {
    const document = await Deployment.findById(deploymentId);
    if (!document) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Deployment not found" });
    }

    // If the user is a regular user, check if they are the owner of the resource
    if (role === "user" && String(document.owner) !== String(userId)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not the owner of this deployment" });
    }

    next(); // Proceed if ownership check passes
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error checking ownership" });
  }
};

/**
 * Middleware to ensure that the user is the owner of an Application (or an admin).
 */
export const checkApplicationOwnership = async (req, res, next) => {
  const { slug } = req.params;
  const { id: userId, role } = req.user;
  try {
    const document = await Application.findOne({ slug });
    if (!document) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Application not found" });
    }

    // If the user is a regular user, check if they are the owner of the resource
    if (role === "user" && String(document.owner) !== String(userId)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not the owner of this application" });
    }

    next(); // Proceed if ownership check passes
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error checking ownership" });
  }
};

/**
 * Helper function to check if the logged-in user is an Admin.
 * This is often used for routes that should be accessible only by Admin users.
 */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied, admin privileges required" });
  }
  next();
};

/**
 * Helper function to check if the logged-in user is a Regular User.
 * This can be useful for restricting admin-only functionality or managing user actions.
 */
export const isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied, user privileges required" });
  }
  next();
};
