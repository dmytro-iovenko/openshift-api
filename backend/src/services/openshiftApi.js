import axios from "axios";
import "dotenv/config";
import customError from "../utils/errorUtils.js";

// Environment variables for OpenShift API configuration
const API_URL = process.env.OPENSHIFT_API_URL;
const AUTH_TOKEN = process.env.OPENSHIFT_AUTH_TOKEN;
const NAMESPACE = process.env.OPENSHIFT_NAMESPACE;

/**
 * Makes a request to the OpenShift API.
 *
 * @param {string} method - HTTP method (GET, POST, DELETE, etc.).
 * @param {string} url - The endpoint URL.
 * @param {object} [data={}] - The data to send with the request (for POST/PUT).
 * @returns {Promise<object>} - The response data from the API.
 * @throws {Error} - If the request fails.
 */
export const openshiftRequest = async (method, url, data = {}) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  console.debug(`OpenShift API request: ${method} ${url}`, headers, data);
  try {
    const response = await axios({ method, url, data, headers });
    return response.data;
  } catch (error) {
    throw customError(error.response?.status || 500, error.response?.data?.message || "OpenShift API request failed");
  }
};

/**
 * Checks if a deployment exists in OpenShift by its name.
 *
 * @param {string} deploymentName - The name of the deployment to check.
 * @returns {Promise<boolean>} - Returns true if the deployment exists, false otherwise.
 * @throws {Error} - Throws an error if there is a problem checking the deployment.
 */
export const checkOpenShiftDeploymentExists = async (deploymentName) => {
  try {
    await openshiftRequest("GET", `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${deploymentName}`);
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
    throw new Error("Error checking deployment existence in OpenShift.");
  }
};

/**
 * Creates a new deployment in OpenShift.
 *
 * @param {string} name - The name of the deployment.
 * @param {string} image - The Docker image for the deployment.
 * @returns {Promise<object>} - The created deployment data.
 */
export const createOpenshiftDeployment = async (name, image) => {
  const deploymentConfig = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: { name, labels: { app: name } },
    spec: {
      replicas: 1,
      selector: { matchLabels: { app: name } },
      template: {
        metadata: { labels: { app: name } },
        spec: { containers: [{ name, image, ports: [{ containerPort: 8080 }] }] },
      },
    },
  };

  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments`;
  return await openshiftRequest("POST", url, deploymentConfig); // Call the API to create the deployment
};


export const createOpenshiftDeploymentFromYaml = async (yamlObject) => {
  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments`;
  return await openshiftRequest("POST", url, yamlObject); // Directly use the YAML object
};


/**
 * Deletes a deployment from OpenShift.
 *
 * @param {string} name - The name of the deployment to delete.
 * @returns {Promise<object>} - The response from the API.
 */
export const deleteOpenshiftDeployment = async (name) => {
  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}`;
  return await openshiftRequest("DELETE", url); // Call the API to delete the deployment
};

/**
 * Retrieves all deployments from OpenShift.
 *
 * @returns {Promise<object>} - The list of deployments.
 */
export const getOpenshiftDeployments = async () => {
  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments`;
  return await openshiftRequest("GET", url); // Call the API to get all deployments
};

/**
 * Retrieves details of a specific deployment by its name.
 *
 * @param {string} name - The name of the deployment.
 * @returns {Promise<Object>} The details of the deployment.
 * @throws Will throw an error if the request fails.
 */
export const getOpenshiftDeploymentDetails = async (name) => {
  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}`;
  return await openshiftRequest("GET", url); // Call the API to get a specific deployment by its name
};

/**
 * Updates an existing deployment in OpenShift.
 *
 * @param {string} name - The name of the deployment to update.
 * @param {Object} updateData - The data to update the deployment with.
 * @returns {Promise<Object>} The updated deployment details.
 * @throws Will throw an error if the request fails.
 */
export const updateOpenshiftDeployment = async (name, updateData) => {
  try {
    const response = await axios.patch(`/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update deployment: ${error.message}`);
  }
};

/**
 * Scales a deployment in OpenShift.
 *
 * @param {string} name - The name of the deployment to scale.
 * @param {number} replicas - The desired number of replicas.
 * @returns {Promise<object>} - The updated deployment details.
 * @throws Will throw an error if the request fails.
 */
export const scaleOpenshiftDeployment = async (name, replicas) => {
  const scaleData = {
    spec: {
      replicas: replicas,
    },
  };

  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}/scale`;
  return await openshiftRequest("PATCH", url, scaleData);
};

/**
 * Retrieves the history of a deployment in OpenShift.
 *
 * @param {string} name - The name of the deployment.
 * @returns {Promise<object>} - The deployment history details.
 * @throws Will throw an error if the request fails.
 */
export const getOpenshiftDeploymentHistory = async (name) => {
  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}/revisions`;
  return await openshiftRequest("GET", url);
};

/**
 * Rolls back a deployment to a specific revision in OpenShift.
 *
 * @param {string} name - The name of the deployment.
 * @param {number} revision - The revision number to roll back to.
 * @returns {Promise<object>} - The rolled-back deployment details.
 * @throws Will throw an error if the request fails.
 */
export const rollbackOpenshiftDeployment = async (name, revision) => {
  const rollbackData = {
    kind: "Rollback",
    apiVersion: "apps/v1",
    name: name,
    revision: revision,
  };

  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}/rollback`;
  return await openshiftRequest("POST", url, rollbackData);
};


