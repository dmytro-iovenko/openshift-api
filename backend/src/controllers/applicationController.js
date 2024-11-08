import Application from "../models/Application.js";
import Deployment from "../models/Deployment.js";
import error from "../utils/errorUtils.js";
import { fetchApplicationsWithDeployments, generateBaseSlug, generateUniqueSlug } from "../utils/applicationUtils.js";
import {
  fetchAndUpdateDeploymentById,
  generateUniqueDeploymentName,
  updateDeploymentStatus,
} from "../utils/deploymentUtils.js";
import {
  createOpenshiftDeployment,
  deleteOpenshiftDeployment,
  getOpenshiftDeployments,
} from "../services/openshiftApi.js";
import { body, validationResult } from "express-validator";
import logger from "../utils/logger.js";
import { StatusCodes } from "http-status-codes";

// Validation rules
const validateApplication = [
  body("name").notEmpty().withMessage("Name is required."),
  body("description").optional().isString().withMessage("Description must be a string."),
  body("image").optional().isString().withMessage("Image must be a string."),
];
const validateUpdateApplication = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty."),
  body("description").optional().isString().withMessage("Description must be a string."),
];

/**
 * Fetches deployments from OpenShift and creates a mapping of deployment names to their details.
 *
 * @async
 * @function fetchOpenShiftDeployments
 * @returns {Promise<Object>} A promise that resolves to an object mapping deployment names to their details.
 */
const fetchOpenShiftDeployments = async () => {
  const openShiftDeployments = await getOpenshiftDeployments();

  // Create a mapping of deployment names to their details
  const openShiftDeploymentMap = {};
  openShiftDeployments.items.forEach((deployment) => {
    openShiftDeploymentMap[deployment.metadata.name] = deployment;
  });

  return openShiftDeploymentMap;
};

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
export const createApplication = validateApplication.concat(async (req, res, next) => {
  const { name, description, image } = req.body;
  const { userId } = req.user;

  logger.debug("Creating application:", { name, description, image });
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(StatusCodes.BAD_REQUEST, "Validation errors: " + JSON.stringify(errors.array())));
    }

    // Create application and save it in MongoDB
    const application = new Application({ name, description, image, owner: userId });
    const savedApplication = await application.save();

    // Create deployment in OpenShift and link it to the application
    // const slug = await generateBaseSlug(savedApplication.name);
    // const uniqueDeploymentName = await generateUniqueDeploymentName(slug);
    // const deployment = await createOpenshiftDeployment(uniqueDeploymentName, image);
    // const deploymentDoc = new Deployment({
    //   applicationId: savedApplication._id,
    //   name: deployment.metadata.name,
    //   image,
    // });
    // await deploymentDoc.save();

    // Update application with new deployment reference
    // savedApplication.deployments.push(deploymentDoc._id);
    await savedApplication.save();

    // Update deployment status and other fields using the returned deployment object
    // await updateDeploymentStatus(deploymentDoc, deployment);
    // await deploymentDoc.save();

    res.status(StatusCodes.CREATED).json(savedApplication);
  } catch (error) {
    next(error);
  }
});

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
  const { userId, role } = req.user;
  logger.debug("Fetching applications");
  try {
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "User ID not found" });
    }
    // Regular user only sees their own applications
    const filter = role !== "admin" ? { owner: userId } : {};
    const applicationsWithOpenShiftData = await fetchApplicationsWithDeployments(filter);
    res.status(StatusCodes.OK).json(applicationsWithOpenShiftData);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a specific application by ID from the database.
 *
 * @async
 * @function getApplication
 * @param {Object} req - The request object containing the application slug.
 * @param {Object} res - The response object to send the results.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Responds with the application details including its deployments.
 */
export const getApplication = async (req, res, next) => {
  const { slug } = req.params;

  logger.debug("Fetching application:", slug);
  try {
    const application = await Application.findOne({ slug }).populate("deployments");
    if (!application) {
      return next(error(StatusCodes.NOT_FOUND, "Application not found"));
    }

    const updatedDeployments = await Promise.all(
      application.deployments.map(async (deploymentId) => {
        const deploymentData = await fetchAndUpdateDeploymentById(deploymentId, true);
        const transformedDeployment = {
          ...deploymentData,
          application: { ...application.toObject(), deployments: undefined },
        };
        return transformedDeployment;
      })
    );
    res.status(StatusCodes.OK).json({ ...application.toObject(), deployments: updatedDeployments });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes an application from the database by slug.
 *
 * @async
 * @function deleteApplication
 * @param {Object} req - The request object containing the application slug.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Responds with no content on successful deletion.
 */
export const deleteApplication = async (req, res, next) => {
  const { slug } = req.params;
  const { userId } = req.user;

  logger.debug("Deleting application: " + slug);
  try {
    const application = await Application.findOne({ slug });
    if (!application) {
      return next(error(StatusCodes.NOT_FOUND, "Application not found"));
    }
    console.log(application.owner._id.toString(), userId, req.user.role);

    // Check ownership (or admin)
    if (application.owner._id.toString() !== userId && req.user.role !== "admin") {
      return next(error(StatusCodes.FORBIDDEN, "You are not allowed to delete this application"));
    }

    // Fetch OpenShift deployments to confirm their existence
    const openShiftDeploymentMap = await fetchOpenShiftDeployments();

    // Loop through each deployment and delete from OpenShift
    await Promise.all(
      application.deployments.map(async (deploymentId) => {
        const deployment = await Deployment.findById(deploymentId);
        const openShiftData = openShiftDeploymentMap[deployment.name] || null;
        if (openShiftData) {
          await deleteOpenshiftDeployment(deployment.name);
        }
      })
    );

    // Delete the application from MongoDB
    await Application.findByIdAndDelete(application._id);

    // Remove associated deployments from MongoDB
    await Deployment.deleteMany({ applicationId: application._id });

    res.status(StatusCodes.NO_CONTENT).send();
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
export const updateApplication = validateUpdateApplication.concat(async (req, res, next) => {
  const { slug } = req.params;
  const { name, description } = req.body;
  const { userId } = req.user;

  logger.debug("Updating application:", { slug, name, description });
  try {
    const application = await Application.findOne({ slug });
    if (!application) {
      return next(error(StatusCodes.BAD_REQUEST, "Application not found"));
    }

    // Check ownership (or admin)
    if (application.owner._id.toString() !== userId && req.user.role !== "admin") {
      return next(error(StatusCodes.FORBIDDEN, "You are not allowed to update this application"));
    }

    let isSlugChanged = false;
    if (name && name !== application.name) {
      application.name = name;
      isSlugChanged = true;
    }

    if (description) {
      application.description = description;
    }

    if (isSlugChanged) {
      application.slug = await generateUniqueSlug(application.name);
    }

    const updatedApplication = await application.save();
    res.status(StatusCodes.OK).json(updatedApplication);
  } catch (error) {
    next(error);
  }
});

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
export const getDeploymentsForApplication = async (req, res, next) => {
  const { slug } = req.params;

  logger.debug("Fetching deployments for application:", id);
  try {
    const application = await Application.findOne({ slug });
    if (!application) {
      return next(error(StatusCodes.BAD_REQUEST, "Application not found"));
    }

    // Fetch deployments from MongoDB
    const deployments = await Deployment.find({ applicationId: application._id });

    // Fetch additional deployment data from OpenShift and combine it with the local data
    const combinedDeployments = await Promise.all(
      deployments.map(async (deployment) => fetchAndUpdateDeployment(deployment))
    );
    res.status(StatusCodes.OK).json(combinedDeployments);
  } catch (error) {
    next(error);
  }
};
