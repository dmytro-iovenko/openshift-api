import Application from "../models/Application.js";

/**
 * Creates a new application entry in the database.
 *
 * @async
 * @function createApplication
 * @param {Object} req - The request object containing application details.
 * @param {Object} res - The response object used to send a response to the client.
 * @returns {Promise<void>} Responds with the created application.
 */
export const createApplication = async (req, res) => {
  const { name, deploymentId } = req.body;

  const application = new Application({ name, deploymentId });
  await application.save();

  res.status(201).json(application);
};

/**
 * Retrieves all applications from the database.
 *
 * @async
 * @function getApplications
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the results.
 * @returns {Promise<void>} Responds with a list of applications.
 */
export const getApplications = async (req, res) => {
  const applications = await Application.find();

  res.status(200).json(applications);
};

/**
 * Deletes an application from the database by ID.
 *
 * @async
 * @function deleteApplication
 * @param {Object} req - The request object containing the application ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Responds with no content on successful deletion.
 */
export const deleteApplication = async (req, res) => {
  const { id } = req.params;

  await Application.findByIdAndDelete(id);
  res.status(204).send();
};
