import axios from "axios";
import { Application } from "../types/Application";
import { Deployment } from "../types/Deployment";

// Load environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Fetches the list of applications from the API.
 * @returns {Promise<Application[]>} A promise that resolves to an array of applications.
 */
export const fetchApplications = async (): Promise<Application[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/applications`);
  return response.data;
};

/**
 * Creates a new application.
 * @param {Object} application - The application to create.
 * @param {string} application.name - The name of the application.
 * @param {string} application.image - The image to use for the application.
 * @returns {Promise<Application>} A promise that resolves to the created application.
 */
export const createApplication = async (application: { name: string; image?: string }): Promise<Application> => {
  const response = await axios.post(`${API_BASE_URL}/api/applications`, application);
  return response.data;
};

/**
 * Deletes an application by ID.
 * @param {string} slug - The slug of the application to delete.
 * @returns {Promise<void>} A promise that resolves when the application is deleted.
 */
export const deleteApplication = async (slug: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/applications/${slug}`);
};

/**
 * Updates an existing application by ID.
 * @param {string} slug - The slug of the application to update.
 * @param {string} newName - The new name for the application.
 * @param {string} newDescription - The new description for the application.
 * @returns {Promise<Application>} - The updated application object.
 */
export const updateApplication = async (
  slug: string,
  newName: string,
  newDescription: string
): Promise<Application> => {
  const response = await axios.patch(`${API_BASE_URL}/api/applications/${slug}`, {
    name: newName,
    description: newDescription,
  });
  return response.data;
};

/**
 * Fetches an application by its slug.
 * @param {string} slug - The slug of the application to fetch.
 * @returns {Promise<Application>} - The application object.
 */
export const fetchApplicationBySlug = async (slug: string): Promise<Application> => {
  const response = await axios.get(`${API_BASE_URL}/api/applications/${slug}`);
  return response.data;
};

/**
 * Retrieves all deployments.
 * @returns {Promise<Deployment[]>} - The list of deployments.
 */
export const fetchDeployments = async (): Promise<Deployment[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/deployments`);
  return response.data;
};

/**
 * Creates a new deployment for a specific application.
 * @param {Object} deployment - The deployment to create.
 * @param {string} deployment.applicationId - The ID of the application.
 * @param {string} deployment.name - The name of the deployment.
 * @param {string} deployment.image - The image used for the deployment.
 * @returns {Promise<Deployment>} - The created deployment.
 */
export const createDeployment = async (deployment: { applicationId: string; name: string; image: string }): Promise<Deployment> => {
  const response = await axios.post(`${API_BASE_URL}/api/deployments`, deployment);
  return response.data;
};

/**
 * Creates a deployment from a YAML definition.
 * @param {Object} yamlDeployment - The deployment defined in YAML.
 * @param {string} yamlDeployment.applicationId - The ID of the application.
 * @param {string} yamlDeployment.yamlDefinition - The YAML definition string.
 * @returns {Promise<Deployment>} - The created deployment.
 */
export const createDeploymentFromYaml = async (yamlDeployment: { applicationId: string; yamlDefinition: string }): Promise<Deployment> => {
  const response = await axios.post(`${API_BASE_URL}/api/deployments/from-yaml`, yamlDeployment);
  return response.data;
};

/**
 * Fetches the details of a specific deployment.
 * @param {string} deploymentId - The ID of the deployment to fetch.
 * @returns {Promise<Deployment>} - The deployment details.
 */
export const fetchDeployment = async (deploymentId: string): Promise<Deployment> => {
  const response = await axios.get(`${API_BASE_URL}/api/deployments/${deploymentId}`);
  return response.data;
};

/**
 * Updates an existing deployment by ID.
 * @param {string} deploymentId - The ID of the deployment to update.
 * @param {Object} updates - The updates to apply.
 * @param {string} [updates.name] - The new name for the deployment.
 * @param {string} [updates.image] - The new image for the deployment.
 * @returns {Promise<Deployment>} - The updated deployment object.
 */
export const updateDeployment = async (deploymentId: string, updates: { name?: string; image?: string }): Promise<Deployment> => {
  const response = await axios.patch(`${API_BASE_URL}/api/deployments/${deploymentId}`, updates);
  return response.data;
};

/**
 * Deletes a deployment by ID.
 * @param {string} deploymentId - The ID of the deployment to delete.
 * @returns {Promise<void>} - A promise that resolves when the deployment is deleted.
 */
export const deleteDeployment = async (deploymentId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/deployments/${deploymentId}`);
};

/**
 * Scales a deployment.
 * @param {string} deploymentId - The ID of the deployment to scale.
 * @param {number} replicas - The number of replicas to scale to.
 * @returns {Promise<Deployment>} - The scaled deployment.
 */
export const scaleDeployment = async (deploymentId: string, replicas: number): Promise<Deployment> => {
  const response = await axios.patch(`${API_BASE_URL}/api/deployments/${deploymentId}/scale`, { replicas });
  return response.data;
};

/**
 * Retrieves the history of a specific deployment.
 * @param {string} deploymentId - The ID of the deployment.
 * @returns {Promise<any>} - The deployment history.
 */
export const fetchDeploymentHistory = async (deploymentId: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/api/deployments/${deploymentId}/history`);
  return response.data;
};

/**
 * Rolls back a deployment to a specified revision.
 * @param {string} deploymentId - The ID of the deployment.
 * @param {number} revision - The revision to roll back to.
 * @returns {Promise<Deployment>} - The rolled back deployment.
 */
export const rollbackDeployment = async (deploymentId: string, revision: number): Promise<Deployment> => {
  const response = await axios.post(`${API_BASE_URL}/api/deployments/${deploymentId}/rollback`, { revision });
  return response.data;
};
