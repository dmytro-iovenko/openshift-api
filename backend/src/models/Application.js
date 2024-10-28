import mongoose from "mongoose";

/**
 * Schema definition for the Application model.
 * This model represents an application with a name and its associated deployment name.
 *
 * @typedef {Object} ApplicationSchema
 * @property {String} name - The name of the application. This field is required.
 * @property {String} image - The Docker image used for deployment. This field is required.
 * @property {String} deploymentName - The name of the Deployment in OpenShift. This field is required.
 * @property {Date} createdAt - The timestamp when the application was created.
 * @property {Date} updatedAt - The timestamp when the application was last updated.
 */
const ApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    deploymentName: { type: String, required: true },
  },
  { timestamps: true }
);

/**
 * Application model based on the defined schema
 */
const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
