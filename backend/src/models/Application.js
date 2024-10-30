import mongoose from "mongoose";

/**
 * Schema definition for the Application model.
 * This model represents an application with a name and its associated deployment name.
 *
 * @typedef {Object} ApplicationSchema
 * @property {String} name - The name of the application. This field is required.
 * @property {String} description - The description of the application.
 * @property {String} image - The Docker image used for deployment. This field is required.
 * @property {String} deployments - An array of Deployment IDs.
 * @property {Date} createdAt - The timestamp when the application was created.
 * @property {Date} updatedAt - The timestamp when the application was last updated.
 */
const ApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    deployments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Deployment" }], // Changed to store an array of Deployment IDs
  },
  { timestamps: true }
);

/**
 * Application model based on the defined schema
 */
const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
