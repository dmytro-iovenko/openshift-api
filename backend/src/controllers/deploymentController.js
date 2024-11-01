import Deployment from "../models/Deployment.js";
import Application from "../models/Application.js";
import {
  createOpenshiftDeployment,
  deleteOpenshiftDeployment,
  updateOpenshiftDeployment,
} from "../services/openshiftApi.js";
import { fetchAndUpdateDeployment, updateDeploymentStatus } from "../utils/deploymentUtils.js";
import error from "../utils/errorUtils.js";

/**
 * Creates a new deployment for a specific application.
 *
 * @async
 * @function createDeployment
 * @param {Object} req - The request object containing deployment details and application ID.
 * @param {Object} res - The response object for sending back the created deployment.
 * @param {Function} next - The next middleware function for error handling.
 * @returns {Promise<void>} A promise that resolves when the deployment is created.
 */
export const createDeployment = async (req, res, next) => {
  const { applicationId, name, image } = req.body;

  console.debug("Creating deployment:", applicationId, name, image);
  try {
    // Verify that the application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(error(404, "Application not found"));
    }

    // Create deployment in OpenShift
    const deploymentData = await createOpenshiftDeployment(name, image);
    const deployment = new Deployment({
      applicationId,
      name: deploymentData.metadata.name,
      image,
    });
    const savedDeployment = await deployment.save();

    // Update the application to include the new deployment
    application.deployments.push(savedDeployment._id);
    await application.save();

    // Update the deployment status and other fields using the returned deployment object
    await updateDeploymentStatus(savedDeployment, deploymentData);

    res.status(201).json(savedDeployment);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves deployments associated with a specific application.
 *
 * @async
 * @function getDeployments
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Responds with a list of deployments.
 */
export const getDeployments = async (req, res, next) => {
  const { id } = req.params;

  console.debug("Fetching deployments:", id);
  try {
    // Fetch deployments from MongoDB
    const deployments = await Deployment.find({ applicationId: id });

    // Fetch additional deployment data from OpenShift and combine it with the local data
    const combinedDeployments = await Promise.all(
      deployments.map(async (deployment) => fetchAndUpdateDeployment(deployment))
    );
    res.status(200).json(combinedDeployments);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing deployment by its ID.
 *
 * @async
 * @function updateDeployment
 * @param {Object} req - The request object containing the deployment ID and updated details.
 * @param {Object} res - The response object for sending back the updated deployment.
 * @param {Function} next - The next middleware function for error handling.
 * @returns {Promise<void>} A promise that resolves when the deployment is updated.
 */
export const updateDeployment = async (req, res, next) => {
  const { deploymentId } = req.params;
  const { name, image } = req.body;

  console.debug("Updating deployment:", deploymentId, name, image);
  try {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }

    // Update deployment in OpenShift
    const updatedDeploymentData = await updateOpenshiftDeployment(deployment.name, { name, image });

    // Update the local deployment record in MongoDB
    deployment.name = updatedDeploymentData.metadata.name;
    deployment.image = image;
    await deployment.save();

    // Update deployment status with the latest data
    const needsUpdate = Date.now() - deployment.lastUpdated > MIN_UPDATE_INTERVAL;
    if (needsUpdate) {
      await updateDeploymentStatus(deployment, updatedDeploymentData);
    }

    res.status(200).json(deployment);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a deployment by its ID.
 *
 * @async
 * @function deleteDeployment
 * @param {Object} req - The request object containing the deployment ID.
 * @param {Object} res - The response object for sending back the result.
 * @param {Function} next - The next middleware function for error handling.
 * @returns {Promise<void>} A promise that resolves when the deployment is deleted.
 */
export const deleteDeployment = async (req, res, next) => {
  const { deploymentId } = req.params;

  console.debug("Deleting deployment:", deploymentId);
  try {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }

    // Delete the deployment from OpenShift
    await deleteOpenshiftDeployment(deployment.name);

    // Delete the deployment from MongoDB
    await Deployment.findByIdAndDelete(id);

    // Remove the deployment from the associated application
    const application = await Application.findById(deployment.applicationId);
    if (application) {
      application.deployments = application.deployments.filter((deployId) => deployId.toString() !== id);
      await application.save();
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
