import axios from "axios";
import "dotenv/config";

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
  try {
    const response = await axios({
      method,
      url,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    // Handle errors and throw a descriptive error message
    throw new Error(error.response?.data?.message || "OpenShift API request failed");
  }
};

/**
 * Creates a new deployment in OpenShift.
 *
 * @param {string} name - The name of the deployment.
 * @param {string} image - The Docker image for the deployment.
 * @returns {Promise<object>} - The created deployment data.
 */
export const createDeployment = async (name, image) => {
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

/**
 * Deletes a deployment from OpenShift.
 *
 * @param {string} name - The name of the deployment to delete.
 * @returns {Promise<object>} - The response from the API.
 */
export const deleteDeployment = async (name) => {
  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments/${name}`;
  return await openshiftRequest("DELETE", url); // Call the API to delete the deployment
};

/**
 * Retrieves all deployments from OpenShift.
 *
 * @returns {Promise<object>} - The list of deployments.
 */
export const getDeployments = async () => {
  const url = `${API_URL}/apis/apps/v1/namespaces/${NAMESPACE}/deployments`;
  return await openshiftRequest("GET", url); // Call the API to get all deployments
};
