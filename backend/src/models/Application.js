import mongoose from "mongoose";

/**
 * Schema definition for the Application model.
 * This model represents an application with a name and its associated deployment ID.
 *
 * @typedef {Object} ApplicationSchema
 * @property {String} name - The name of the application. This field is required.
 * @property {String} deploymentId - The deployment ID associated with the application. This field is required.
 */
const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deploymentId: { type: String, required: true },
});

/**
 * Application model based on the defined schema
 */
const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
