import Application from "../models/Application.js";
import { createDeployment, deleteDeployment, getDeployments } from "../helpers/openshiftApi.js";
import error from "../utils/error.js";

/**
 * Creates a new application entry in the database.
 *
 * @async
 * @function createApplication
 * @param {Object} req - The request object containing application details.
 * @param {Object} res - The response object used to send a response to the client.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} Responds with the created application.
 */
export const createApplication = async (req, res, next) => {
  const { name, description, image } = req.body;

  console.log("Creating application:", name, description, image);
  try {
    // Create deployment in OpenShift
    const deployment = await createDeployment(name, image);

    // Save application in MongoDB
    const application = new Application({ name, description, image, deploymentName: deployment.metadata.name });
    const savedApplication = await application.save();

    res.status(201).json(savedApplication);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all applications from the database.
 *
 * @async
 * @function getApplications
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the results.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} Responds with a list of applications.
 */
export const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes an application from the database by ID.
 *
 * @async
 * @function deleteApplication
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} Responds with no content on successful deletion.
 */
export const deleteApplication = async (req, res, next) => {
  const { id } = req.params;

  try {
    const application = await Application.findByIdAndDelete(id);
    if (!application) {
      next(error(404, "Application not found"));
    }

    // Delete deployment from OpenShift
    await deleteDeployment(application.deploymentName);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the name and description of an application.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>}
 */
export const updateApplication = async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  console.log("Updating application:", id, name, description);
  try {
    // Find the application by ID and update its name and description
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { name, description },
      { new: true } // Return the updated document
    );

    if (!updatedApplication) {
      next(error(404, "Application not found"));
    }

    res.status(200).json(updatedApplication);
  } catch (error) {
    next(error);
  }
};
