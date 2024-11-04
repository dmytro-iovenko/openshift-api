import Ajv from "ajv";
import yaml from "js-yaml";
import Deployment from "../models/Deployment.js";
import Application from "../models/Application.js";
import {
  createOpenshiftDeployment,
  deleteOpenshiftDeployment,
  updateOpenshiftDeployment,
  createOpenshiftDeploymentFromYaml,
} from "../services/openshiftApi.js";
import { generateBaseSlug } from "../utils/applicationUtils.js";
import {
  fetchAndUpdateDeployment,
  generateUniqueDeploymentName,
  updateDeploymentStatus,
} from "../utils/deploymentUtils.js";
import error from "../utils/errorUtils.js";
import logger from "../utils/logger.js";
import schema from "../schemas/deploymentSchema.js";
import { validationResult, body } from "express-validator";

const ajv = new Ajv();
const validate = ajv.compile(schema);

// Validation rules
const validateCreateDeployment = [
  body("applicationId").notEmpty().withMessage("Application ID is required."),
  body("name").notEmpty().withMessage("Deployment name is required."),
  body("image").notEmpty().isString().withMessage("Image must be a valid string."),
];
const validateUpdateDeployment = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty."),
  body("image").notEmpty().isString().withMessage("Image must be a valid string."),
];
const validateDeploymentFromYaml = [
  body("yamlDefinition").notEmpty().withMessage("YAML definition is required."),
  body("applicationId").notEmpty().withMessage("Application ID is required."),
];

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
export const createDeployment = validateCreateDeployment.concat(async (req, res, next) => {
  const { applicationId, name, image, replicas, paused, envVars, strategy, maxUnavailable, maxSurge } = req.body;

  logger.debug(
    "Creating deployment:" +
      JSON.stringify({
        applicationId,
        name,
        image,
        replicas,
        paused,
        envVars,
        strategy,
        maxUnavailable,
        maxSurge,
      })
  );

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(400, "Validation errors: " + JSON.stringify(errors.array())));
    }

    // Verify that the application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(error(404, "Application not found"));
    }

    const slug = await generateBaseSlug(name);
    const uniqueDeploymentName = await generateUniqueDeploymentName(slug);

    // Create deployment in OpenShift
    const deploymentData = await createOpenshiftDeployment(
      uniqueDeploymentName,
      image,
      replicas,
      paused,
      envVars,
      strategy,
      maxUnavailable,
      maxSurge
    );
    const deployment = new Deployment({
      applicationId,
      name: deploymentData.metadata.name,
      image,
      replicas,
      strategy,
      // maxUnavailable,
      // maxSurge,
    });
    const savedDeployment = await deployment.save();

    // Update the application to include the new deployment
    application.deployments.push(savedDeployment._id);
    await application.save();

    // Update the deployment status and other fields using the returned deployment object
    await updateDeploymentStatus(savedDeployment, deploymentData);

    // Transform the deployments to include application details in a separate field
    const transformedDeployment = {
      ...savedDeployment.toObject(),
      application: { ...application.toObject(), deployments: undefined },
      applicationId: application._id,
    };

    res.status(201).json(transformedDeployment);
  } catch (err) {
    next(err);
  }
});

/**
 * Creates a new deployment from a YAML definition for a specific application.
 *
 * @async
 * @function createDeploymentFromYaml
 * @param {Object} req - The request object containing the YAML definition and application ID.
 * @param {Object} res - The response object for sending back the created deployment.
 * @param {Function} next - The next middleware function for error handling.
 * @returns {Promise<void>} A promise that resolves when the deployment is created from YAML.
 */
export const createDeploymentFromYaml = validateDeploymentFromYaml.concat(async (req, res, next) => {
  const { yamlDefinition, applicationId } = req.body;
  if (!applicationId) {
    return next(error(400, "Application ID is required"));
  }
  if (!yamlDefinition) {
    return next(error(400, "YAML definition is required"));
  }

  logger.debug("Creating deployment from YAML:", { yamlDefinition });

  try {
    // Validate and parse YAML
    const deploymentConfig = yaml.load(yamlDefinition);
    const valid = validate(deploymentConfig);
    if (!valid) {
      return next(error(400, "Invalid YAML structure: " + JSON.stringify(validate.errors)));
    }

    // Create deployment in OpenShift
    const deploymentData = await createOpenshiftDeploymentFromYaml(deploymentConfig);

    const deployment = new Deployment({
      applicationId,
      name: deploymentData.metadata.name,
      image: deploymentConfig.spec.template.spec.containers[0].image,
    });

    const savedDeployment = await deployment.save();
    res.status(201).json(savedDeployment);
  } catch (err) {
    if (err instanceof yaml.YAMLException) {
      return next(error(400, "Invalid YAML format: " + err.message));
    }
    next(err);
  }
});

/**
 * Retrieves all deployments.
 *
 * @async
 * @function getDeployments
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - Responds with a list of deployments.
 */
export const getDeployments = async (req, res, next) => {
  logger.debug("Retrieving all deployments.");

  try {
    const deployments = await Deployment.find().populate("applicationId");

    // Transform the deployments to include application details in a separate field
    const transformedDeployments = deployments.map((deployment) => ({
      ...deployment.toObject(),
      application: { ...deployment.applicationId.toObject(), deployments: undefined },
      applicationId: deployment.applicationId._id,
    }));

    res.status(200).json(transformedDeployments);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves a specific deployment by its ID.
 *
 * @async
 * @function getDeployment
 * @param {Object} req - The request object containing the deployment ID in params.
 * @param {Object} res - The response object for sending back the deployment details.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the deployment details are retrieved.
 */
export const getDeployment = async (req, res, next) => {
  const { deploymentId } = req.params;

  logger.debug("Retrieving deployment details:", { deploymentId });

  try {
    const deployment = await Deployment.findById(deploymentId).populate("applicationId");
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }
    const deploymentData = await fetchAndUpdateDeployment(deployment, true);

    // console.log(deploymentData);
    // Transform the deployments to include application details in a separate field
    const transformedDeployment = {
      ...deploymentData,
      application: { ...deploymentData.applicationId, deployments: undefined },
      applicationId: deploymentData.applicationId._id,
    };

    res.status(200).json(transformedDeployment);
  } catch (err) {
    next(err);
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
export const updateDeployment = validateUpdateDeployment.concat(async (req, res, next) => {
  const { deploymentId } = req.params;
  // const { name, image } = req.body;
  // const { name, image, replicas, paused, envVars, strategy, maxUnavailable, maxSurge } = req.body;
  const updatedData = req.body;

  logger.debug("Updating deployment:", { deploymentId, updatedData });

  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(400, "Validation errors: " + JSON.stringify(errors.array())));
    }

    const deployment = await Deployment.findById(deploymentId).populate("applicationId");
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }

    // const deploymentData = await fetchAndUpdateDeployment(deployment, true);

    // const updatedData = {
    //   ...deploymentData.openShiftDetails,
    // };

    // // Update nested fields correctly
    // updatedData.metadata.name = name;
    // updatedData.spec.replicas = replicas;
    // updatedData.spec.template.spec.containers[0].image = image;
    // updatedData.spec.template.spec.containers[0].env = envVars.map((envVar) => ({
    //   name: envVar.name,
    //   value: envVar.value,
    // }));

    // // Handle the strategy
    // updatedData.spec.strategy.type = strategy;
    // if (strategy === "RollingUpdate") {
    //   updatedData.spec.strategy.rollingUpdate = {
    //     maxUnavailable,
    //     maxSurge,
    //   };
    // } else {
    //   delete updatedData.spec.strategy.rollingUpdate;
    // }

    // console.log("updatedData", updatedData);

    // Update deployment in OpenShift
    const updatedDeploymentData = await updateOpenshiftDeployment(deployment.name, updatedData);

    // Update the local deployment record in MongoDB
    // deployment.name = updatedDeploymentData.metadata.name;
    // deployment.image = image;
    // await deployment.save();

    // Update deployment status with the latest data
    await updateDeploymentStatus(deployment, updatedDeploymentData);

    console.log("updatedDeploymentData", updatedDeploymentData);
    console.log("deployment", deployment);
    // Transform the deployments to include application details in a separate field
    const transformedDeployment = {
      ...deployment.toObject(),
      application: { ...deployment.applicationId.toObject(), deployments: undefined },
      applicationId: deployment.applicationId._id,
    };

    res.status(200).json(transformedDeployment);
  } catch (err) {
    next(err);
  }
});

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

  logger.debug("Deleting deployment:", { deploymentId });

  try {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }

    // Delete the deployment from OpenShift
    await deleteOpenshiftDeployment(deployment.name);

    // Delete the deployment from MongoDB
    await Deployment.findByIdAndDelete(deploymentId);

    // Remove the deployment from the associated application
    const application = await Application.findById(deployment.applicationId);
    if (application) {
      application.deployments = application.deployments.filter((deployId) => deployId.toString() !== deploymentId);
      await application.save();
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Scales a deployment to a specified number of replicas.
 *
 * @async
 * @function scaleDeployment
 * @param {Object} req - The request object containing the deployment ID and number of replicas.
 * @param {Object} res - The response object for sending back the updated deployment.
 * @param {Function} next - The next middleware function for error handling.
 * @returns {Promise<void>} A promise that resolves when the deployment is scaled.
 */
export const scaleDeployment = async (req, res, next) => {
  const { deploymentId } = req.params;
  const { replicas } = req.body;

  logger.debug(`Scaling deployment: ${deploymentId} to replicas: ${replicas}`);

  try {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }

    const updatedDeploymentData = await scaleOpenshiftDeployment(deployment.name, replicas);
    await updateDeploymentStatus(deployment, updatedDeploymentData);

    res.status(200).json(deployment);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves the history of a specific deployment by its ID.
 *
 * @async
 * @function getDeploymentHistory
 * @param {Object} req - The request object containing the deployment ID in params.
 * @param {Object} res - The response object for sending back the deployment history.
 * @param {Function} next - The next middleware function for error handling.
 * @returns {Promise<void>} A promise that resolves when the deployment history is retrieved.
 */
export const getDeploymentHistory = async (req, res, next) => {
  const { deploymentId } = req.params;

  logger.debug("Retrieving deployment history:", { deploymentId });

  try {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }

    const history = await getOpenshiftDeploymentHistory(deployment.name);
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
};

/**
 * Rolls back a deployment to a specified revision.
 *
 * @async
 * @function rollbackDeployment
 * @param {Object} req - The request object containing the deployment ID and revision.
 * @param {Object} res - The response object for sending back the rolled back deployment.
 * @param {Function} next - The next middleware function for error handling.
 * @returns {Promise<void>} A promise that resolves when the deployment is rolled back.
 */
export const rollbackDeployment = async (req, res, next) => {
  const { deploymentId } = req.params;
  const { revision } = req.body;

  logger.debug(`Rolling back deployment: ${deploymentId} to revision: ${revision}`);

  try {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      return next(error(404, "Deployment not found"));
    }

    const rolledBackDeploymentData = await rollbackOpenshiftDeployment(deployment.name, revision);
    await updateDeploymentStatus(deployment, rolledBackDeploymentData);

    res.status(200).json(deployment);
  } catch (err) {
    next(err);
  }
};
