import Application from "../models/Application.js";
import Deployment from "../models/Deployment.js";
import { createOpenshiftDeployment, deleteOpenshiftDeployment } from "../services/openshiftApi.js";
import error from "../utils/error.js";

/**
 * Creates a new application entry in the database.
 *
 * @async
 * @function createApplication
 * @param {Object} req - The request object containing application details.
 * @param {Object} res - The response object used to send a response to the client.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Responds with the created application.
 */
export const createApplication = async (req, res, next) => {
  const { name, description, image } = req.body;

  console.debug("Creating application:", name, description, image);
  try {
    // Create application and save it in MongoDB
    const application = new Application({ name, description, image, deploymentName: deployment.metadata.name });
    const savedApplication = await application.save();

    // Create deployment in OpenShift and link it to the application
    const deployment = await createOpenshiftDeployment(name, image);
    const deploymentDoc = new Deployment({
      applicationId: savedApplication._id,
      name: deployment.metadata.name,
      image,
    });
    await deploymentDoc.save();

    savedApplication.deployments.push(deploymentDoc._id);
    await savedApplication.save();

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
 * @returns {Promise<void>} - Responds with a list of applications.
 */
export const getApplications = async (req, res, next) => {
  console.debug("Fetching applications");
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (req, res, next) => {
  const { id } = req.params;

  console.debug("Fetching application:", id);
  try {
    const application = await Application.findById(id).populate("deployments"); // Populate deployments if necessary

    if (!application) {
      return next(error(404, "Application not found"));
    }

    res.status(200).json(application);
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
 * @returns {Promise<void>} - Responds with no content on successful deletion.
 */
export const deleteApplication = async (req, res, next) => {
  const { id } = req.params;

  console.debug("Deleting application:", id);
  try {
    const application = await Application.findById(id);
    if (!application) {
      next(error(404, "Application not found"));
    }

    // Loop through each deployment and delete from OpenShift
    await Promise.all(
      application.deployments.map(async (deploymentId) => {
        const deployment = await Deployment.findById(deploymentId);
        await deleteOpenshiftDeployment(deployment.name);
      })
    );

    // Delete the application from MongoDB
    await Application.findByIdAndDelete(id);

    // Remove associated deployments from MongoDB
    await Deployment.deleteMany({ applicationId: application._id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the name and description of an application.
 *
 * @async
 * @function updateApplication
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Responds with an updated application.
 */
export const updateApplication = async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  console.debug("Updating application:", id, name, description);
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

/**
 * Retrieves deployments associated with a specific application.
 *
 * @async
 * @function getDeploymentsByApplication
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Responds with a list of deployments.
 */
// export const getDeploymentsByApplication = async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     const deployments = await Deployment.find({ applicationId: id });
//     res.status(200).json(deployments);
//   } catch (error) {
//     next(error);
//   }
// };
