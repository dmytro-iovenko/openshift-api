import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import Application from "../models/Application.js";
import { fetchAndUpdateDeploymentById } from "./deploymentUtils.js";

/**
 * Fetches all applications along with their deployments and updates their statuses.
 *
 * @returns {Promise<Array>} - An array of applications with updated deployment details.
 */
export const fetchApplicationsWithDeployments = async (filter = {}) => {
  try {
    const applications = await Application.find(filter).populate("deployments");
    const updatedApplications = await Promise.all(
      applications.map(async (app) => {
        const updatedDeployments = await Promise.all(app.deployments.map(fetchAndUpdateDeploymentById));
        return {
          ...app.toObject(),
          deployments: updatedDeployments,
        };
      })
    );
    return updatedApplications;
  } catch (error) {
    console.error(`Failed to fetch applications with deployments: ${error.message}`);
    throw error;
  }
};

/**
 * Generates a base slug for the application.
 *
 * @param {string} name - The name of the application.
 * @returns {Promise<string>} - A promise that resolves to a slug.
 */
export const generateBaseSlug = async (name) => slugify(name, { lower: true, strict: true });

/**
 * Generates a unique slug for the application.
 *
 * @param {string} name - The name of the application.
 * @returns {Promise<string>} - A promise that resolves to a unique slug.
 */
export const generateUniqueSlug = async (name) => {
  const baseSlug = await generateBaseSlug(name);
  let uniqueSlug = baseSlug;

  // Check if the slug already exists
  while (await Application.exists({ slug: uniqueSlug })) {
    const uniqueId = uuidv4().split("-")[0];
    uniqueSlug = `${baseSlug}-${uniqueId}`;
  }

  return uniqueSlug;
};
