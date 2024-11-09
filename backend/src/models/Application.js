import mongoose from "mongoose";
import { generateUniqueSlug } from "../utils/applicationUtils.js";

/**
 * Schema definition for the Application model.
 * This model represents an application with a name and its associated deployment name.
 *
 * @typedef {Object} ApplicationSchema
 * @property {String} name - The name of the application. This field is required.
 * @property {String} description - The description of the application.
 * @property {String} image - The Docker image used for deployment. This field is required.
 * @property {String} deployments - An array of Deployment IDs.
 * @property {String} owner - The ID of the user who owns the application. This field is required.
 * @property {Date} createdAt - The timestamp when the application was created.
 * @property {Date} updatedAt - The timestamp when the application was last updated.
 */
const ApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    image: { type: String },
    deployments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Deployment" }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

/**
 * Pre-save middleware to generate a slug from the application name.
 */
ApplicationSchema.pre("save", async function (next) {
  if (!this.slug) {
    try {
      this.slug = await generateUniqueSlug(this.name);
    } catch (error) {
      next(error);
    }
  }
  next();
});

/**
 * Application model based on the defined schema
 */
const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
