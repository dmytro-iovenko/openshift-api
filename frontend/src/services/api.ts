import axios from "axios";
import { Application } from "../types/Application";

// Load environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Fetches the list of applications from the API.
 * @returns {Promise<Application[]>} A promise that resolves to an array of applications.
 */
export const fetchApplications = async (): Promise<Application[]> => {
  console.log("Fetching applications...", `${API_BASE_URL}/api/applications`);
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
 * @param {string} id - The ID of the application to delete.
 * @returns {Promise<void>} A promise that resolves when the application is deleted.
 */
export const deleteApplication = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/applications/${id}`);
};

/**
 * Updates an existing application by ID.
 * @param {string} id - The ID of the application to update.
 * @param {string} newName - The new name for the application.
 * @param {string} newDescription - The new description for the application.
 * @returns {Promise<Application>} - The updated application object.
 */
export const updateApplication = async (
  id: string,
  newName: string,
  newDescription: string
): Promise<Application> => {
  const response = await axios.patch(`${API_BASE_URL}/api/applications/${id}`, {
    name: newName,
    description: newDescription,
  });
  return response.data;
};
